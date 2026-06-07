from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_async_session
from app.models import PredictionLog, User
from app.schemas import PredictResponse
from app.services.model import ModelInferenceError
from app.services.predict import predict_service
from app.services.preprocess import ImagePreprocessError, ImageValidationError
from app.users import optional_current_active_user

router = APIRouter(tags=["prediction"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/predict", response_model=PredictResponse)
async def predict_image(
    file: Annotated[UploadFile, File(description="Face image to classify")],
    source: Annotated[str, Form(description="Input source: camera or upload")] = "upload",
    db: AsyncSession = Depends(get_async_session),
    user: User | None = Depends(optional_current_active_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Upload a JPEG, PNG, or WebP image.",
        )

    image_bytes = await file.read(settings.MODEL_MAX_UPLOAD_BYTES + 1)
    if len(image_bytes) > settings.MODEL_MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image is too large. Maximum size is 5 MB.",
        )

    try:
        response = await run_in_threadpool(predict_service.predict, image_bytes, source)
    except ImageValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except ImagePreprocessError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except ModelInferenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    if user is not None:
        log = PredictionLog(
            user_id=user.id,
            label=response.label,
            confidence=response.confidence,
            is_real=response.is_real,
            image_filename=_safe_filename(file.filename),
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        response.created_at = log.created_at

    return response


def _safe_filename(filename: str | None) -> str | None:
    if not filename:
        return None
    return filename.split("/")[-1].split("\\")[-1][:255]
