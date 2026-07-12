from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.schemas.common import ResponseEnvelope

class CoreException(Exception):
    """Base exception for app domain errors."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

async def core_exception_handler(request: Request, exc: CoreException):
    envelope = ResponseEnvelope(success=False, error=exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content=envelope.model_dump()
    )

async def http_exception_handler(request: Request, exc: HTTPException):
    envelope = ResponseEnvelope(success=False, error=exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=envelope.model_dump()
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Format error messages
    errors = exc.errors()
    error_msg = "; ".join([f"{'.'.join(str(l) for l in err['loc'])}: {err['msg']}" for err in errors])
    envelope = ResponseEnvelope(success=False, error=f"Validation error: {error_msg}")
    return JSONResponse(
        status_code=422,
        content=envelope.model_dump()
    )
