import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.jobs.email_jobs import send_expiry_alert_emails

logger = logging.getLogger("jobs.scheduler")
scheduler = AsyncIOScheduler()

def start_scheduler():
    logger.info("Initializing APScheduler...")
    # Run expiry checks every day at midnight
    scheduler.add_job(
        lambda: send_expiry_alert_emails.delay(),
        "cron",
        hour=0,
        minute=0,
        id="expiry_alert_job",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler started successfully.")

def shutdown_scheduler():
    logger.info("Stopping APScheduler...")
    scheduler.shutdown()
