from typing import Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.common import PaginatedResponse, PaginationMeta

async def paginate(
    db: AsyncSession,
    query,
    page: int = 1,
    limit: int = 10
) -> dict[str, Any]:
    # Calculate skip
    skip = (page - 1) * limit
    
    # Calculate total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Fetch subset
    result = await db.execute(query.offset(skip).limit(limit))
    items = list(result.scalars().all())
    
    pages = (total + limit - 1) // limit if limit > 0 else 0
    
    return {
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages
        }
    }
