from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_async_session
from app.models import PredictionLog, User
from app.schemas import PredictionHistoryItem, PredictionHistoryResponse
from app.users import current_active_user

router = APIRouter(tags=["prediction"])


@router.get("/history", response_model=PredictionHistoryResponse)
async def read_prediction_history(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    count_result = await db.execute(
        select(func.count()).select_from(PredictionLog).where(PredictionLog.user_id == user.id)
    )
    total = int(count_result.scalar_one())

    result = await db.execute(
        select(PredictionLog)
        .where(PredictionLog.user_id == user.id)
        .order_by(PredictionLog.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    items = [
        PredictionHistoryItem.model_validate(item)
        for item in result.scalars().all()
    ]
    return PredictionHistoryResponse(items=items, count=total)
