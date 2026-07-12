from typing import Any
from fastapi.responses import JSONResponse
from app.schemas.common import ResponseEnvelope

def success_response(data: Any = None, meta: dict[str, Any] | None = None, status_code: int = 200) -> JSONResponse:
    envelope = ResponseEnvelope(success=True, data=data, meta=meta)
    return JSONResponse(status_code=status_code, content=envelope.model_dump())

def error_response(error: str, status_code: int = 400) -> JSONResponse:
    envelope = ResponseEnvelope(success=False, error=error)
    return JSONResponse(status_code=status_code, content=envelope.model_dump())
