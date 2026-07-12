from typing import Any
from pydantic import BaseModel

class CopilotQueryRequest(BaseModel):
    query: str

class CopilotQueryResponse(BaseModel):
    intent: str
    response_text: str
    data: list[Any] | dict[str, Any] | None = None
