import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.schemas.common import ResponseEnvelope

logger = logging.getLogger("app.error")

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.exception(f"Unhandled exception occurred: {str(exc)}")
            envelope = ResponseEnvelope(success=False, error="Internal server error")
            return JSONResponse(
                status_code=500,
                content=envelope.model_dump()
            )
