import uuid
from datetime import datetime

from fastapi_users import schemas
from pydantic import BaseModel
from uuid import UUID


class UserRead(schemas.BaseUser[uuid.UUID]):
    pass


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass


class PredictResponse(BaseModel):
    label: str
    confidence: float
    is_real: bool
    all_scores: dict[str, float]
    mock: bool = False
    created_at: datetime | None = None
    calibration: dict[str, object] | None = None


class PredictionHistoryItem(BaseModel):
    id: UUID
    label: str
    confidence: float
    is_real: bool
    created_at: datetime
    image_filename: str | None = None

    model_config = {"from_attributes": True}


class PredictionHistoryResponse(BaseModel):
    items: list[PredictionHistoryItem]
    count: int
