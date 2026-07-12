import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app.api")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        
        request_id = request.headers.get("X-Request-ID", "N/A")
        logger.info(
            f"RID: {request_id} | Path: {request.method} {request.url.path} | Status: {response.status_code} | Duration: {process_time:.2f}ms"
        )
        return response
