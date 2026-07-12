from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.exceptions import (
    CoreException,
    core_exception_handler,
    http_exception_handler,
    validation_exception_handler
)
from app.api.v1.router import api_router
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    description="Core Fleet Management REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middlewares
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIdMiddleware)

# Register exception handlers
app.add_exception_handler(CoreException, core_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Health check
@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)
