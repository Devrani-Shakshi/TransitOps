import asyncio
import os
import pytest
from typing import AsyncGenerator
import sqlalchemy.dialects.postgresql as pg
from sqlalchemy import Uuid
pg.UUID = Uuid
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models.base import Base
from app.core.config import settings
from app.core.deps import get_db
from app.main import app

# Force testing configuration
os.environ["TESTING"] = "1"

test_engine = create_async_engine(
    settings.TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

@pytest.fixture(scope="session")
def event_loop():
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    
    async def _create():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
    async def _drop():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            
    loop.run_until_complete(_create())
    yield
    loop.run_until_complete(_drop())
    loop.close()

@pytest.fixture
async def db() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.connect() as connection:
        async with connection.begin() as transaction:
            async with AsyncSession(bind=connection, expire_on_commit=False) as session:
                yield session
            await transaction.rollback()

@pytest.fixture
async def client(db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
