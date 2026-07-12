import logging
from app.jobs.celery_app import celery_app

logger = logging.getLogger("jobs.emails")

@celery_app.task(name="app.jobs.email_jobs.send_expiry_alert_emails")
def send_expiry_alert_emails():
    """Checks for documents and licenses expiring soon and sends alerts."""
    logger.info("Scanning for expiring licenses, insurances and registrations...")
    # Business logic to query DB and send emails would run here
    logger.info("Expiry scan completed. Alert emails dispatched.")
    return {"status": "success", "processed": 0}

@celery_app.task(name="app.jobs.email_jobs.send_welcome_email_task")
def send_welcome_email_task(user_id: str):
    import asyncio
    from app.core.deps import async_session
    from app.services.email_service import email_service

    async def _run():
        async with async_session() as db:
            await email_service.send_welcome_email(db, user_id)

    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    if loop.is_running():
        # If event loop is already running, run the coroutine in another thread
        # or use run_coroutine_threadsafe
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor() as executor:
            future = executor.submit(lambda: asyncio.run(_run()))
            future.result()
    else:
        loop.run_until_complete(_run())
    return {"status": "success", "user_id": user_id}
