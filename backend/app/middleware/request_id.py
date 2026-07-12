import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class RequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Read or generate Request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        
        # Inject into request scope headers
        # Note: starlette request.headers is immutable but we can modify the scope
        headers = dict(request.scope.get("headers", []))
        headers[b"x-request-id"] = request_id.encode("utf-8")
        request.scope["headers"] = [(k, v) for k, v in headers.items()]

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response
