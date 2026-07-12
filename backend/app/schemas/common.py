from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")

class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    data: T | None = None
    error: str | None = None
    meta: dict[str, Any] | None = None

class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    pages: int

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    meta: PaginationMeta
