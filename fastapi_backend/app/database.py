from typing import AsyncGenerator

from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import settings
from .models import Base, User


def make_async_database_url(database_url: str) -> str:
    if database_url.startswith("postgresql+asyncpg://"):
        return _normalize_asyncpg_ssl(database_url)
    if database_url.startswith("postgresql://"):
        return _normalize_asyncpg_ssl(
            database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        )
    if database_url.startswith("postgres://"):
        return _normalize_asyncpg_ssl(
            database_url.replace("postgres://", "postgresql+asyncpg://", 1)
        )
    return _normalize_asyncpg_ssl(database_url)


def _normalize_asyncpg_ssl(database_url: str) -> str:
    return database_url.replace("sslmode=", "ssl=")


async_db_connection_url = make_async_database_url(settings.DATABASE_URL)

# Disable connection pooling for serverless environments like Vercel
engine = create_async_engine(async_db_connection_url, poolclass=NullPool)

async_session_maker = async_sessionmaker(
    engine, expire_on_commit=settings.EXPIRE_ON_COMMIT
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
