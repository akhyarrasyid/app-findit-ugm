from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4


class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    prediction_logs = relationship(
        "PredictionLog", back_populates="user", cascade="all, delete-orphan"
    )


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True, index=True)
    label = Column(String(length=64), nullable=False)
    confidence = Column(Float, nullable=False)
    is_real = Column(Boolean, nullable=False)
    image_filename = Column(String(length=255), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", back_populates="prediction_logs")
