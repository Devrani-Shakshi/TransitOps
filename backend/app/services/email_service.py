import os
import smtplib
import logging
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.user import User

logger = logging.getLogger("app.email_service")

class EmailService:
    def __init__(self):
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.templates_dir = os.path.join(current_dir, "templates")
        self.env = Environment(loader=FileSystemLoader(self.templates_dir))

    async def send_welcome_email(self, db: AsyncSession, user_id) -> bool:
        # Fetch user with role relationship loaded
        result = await db.execute(
            select(User)
            .options(selectinload(User.role))
            .filter(User.id == user_id)
        )
        user = result.scalars().first()
        if not user:
            logger.error(f"User with ID {user_id} not found for welcome email")
            return False

        # Render Template
        try:
            template = self.env.get_template("emails/welcome_user.html")
            role_display = user.role.name.replace("_", " ").capitalize() if user.role else "User"
            html_content = template.render(
                full_name=user.full_name or "User",
                role_name=role_display,
                email=user.email,
                temporary_password=user.mobile_number, # plaintext mobile number used as temp password
                login_url=f"{settings.FRONTEND_URL}/auth/login"
            )
        except Exception as e:
            logger.error(f"Failed to render welcome email template for user {user.email}: {e}")
            user.email_status = "FAILED"
            await db.commit()
            return False

        # Send via SMTP
        # If SMTP_HOST is standard default mock or empty, log and mark as sent
        if not settings.SMTP_HOST or settings.SMTP_USER == "user@example.com":
            logger.info(f"[SMTP MOCK] Welcome email successfully sent to {user.email}")
            user.email_status = "SENT"
            await db.commit()
            return True

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to TransitOps — Your Account is Ready"
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = user.email
        msg.attach(MIMEText(html_content, "html"))

        try:
            loop = asyncio.get_running_loop()
            def _send():
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, user.email, msg.as_string())
                server.quit()
            
            await loop.run_in_executor(None, _send)
            user.email_status = "SENT"
            await db.commit()
            logger.info(f"Welcome email successfully sent to {user.email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {e}")
            user.email_status = "FAILED"
            await db.commit()
            return False

email_service = EmailService()
