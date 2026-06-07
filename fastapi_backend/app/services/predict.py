from datetime import UTC, datetime

from app.schemas import PredictResponse
from app.services.calibration import apply_camera_real_mask_calibration
from app.services.model import model
from app.services.preprocess import PreprocessService


class PredictService:
    def __init__(self, preprocess_service: PreprocessService | None = None) -> None:
        self.preprocess_service = preprocess_service or PreprocessService()

    def predict(self, image_bytes: bytes, source: str = "upload") -> PredictResponse:
        input_tensor = self.preprocess_service.preprocess(
            image_bytes,
            input_shape=model.input_size,
        )
        prediction = model.predict(input_tensor)
        calibration = apply_camera_real_mask_calibration(
            dict(prediction["all_scores"]),
            source=source,
        )
        scores = calibration.scores
        label = max(scores, key=scores.get)
        return PredictResponse(
            label=label,
            confidence=float(scores[label]),
            is_real=label == "real_person",
            all_scores=scores,
            mock=bool(prediction["mock"]),
            created_at=datetime.now(UTC),
            calibration=calibration.metadata,
        )


predict_service = PredictService()
