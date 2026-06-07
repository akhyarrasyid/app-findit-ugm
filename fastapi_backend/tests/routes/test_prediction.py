from io import BytesIO
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import status
from httpx import ASGITransport, AsyncClient
from PIL import Image

from app.database import get_async_session
from app.main import app
from app.models import PredictionLog
from app.config import settings
from app.services.calibration import apply_camera_real_mask_calibration
from app.services.model import LABELS, MODEL_LABELS, ONNXModel, model
from app.users import current_active_user, optional_current_active_user


def make_image_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (64, 64), color=(180, 160, 140)).save(buffer, format="JPEG")
    return buffer.getvalue()


class FakeSession:
    def __init__(self, items: list[PredictionLog] | None = None):
        self.items = items or []

    def add(self, item):
        self.items.append(item)

    async def commit(self):
        return None

    async def refresh(self, item):
        return None

    async def execute(self, statement):
        if "count" in str(statement).lower():
            return SimpleNamespace(scalar_one=lambda: len(self.items))
        return SimpleNamespace(
            scalars=lambda: SimpleNamespace(all=lambda: self.items),
        )


class FakeONNXSession:
    def __init__(self, logits):
        self.logits = logits

    def run(self, *_args, **_kwargs):
        return [self.logits]


@pytest.fixture(autouse=True)
def clear_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


def make_session_override(session):
    async def override_session():
        yield session

    return override_session


def test_onnx_label_order_matches_sklearn_label_encoder_classes():
    assert MODEL_LABELS == [
        "fake_mannequin",
        "fake_mask",
        "fake_printed",
        "fake_screen",
        "fake_unknown",
        "realperson",
    ]
    assert LABELS == [
        "fake_mannequin",
        "fake_mask",
        "fake_printed",
        "fake_screen",
        "fake_unknown",
        "real_person",
    ]


@pytest.mark.parametrize(
    "index, expected_label",
    [
        (0, "fake_mannequin"),
        (1, "fake_mask"),
        (2, "fake_printed"),
        (3, "fake_screen"),
        (4, "fake_unknown"),
        (5, "real_person"),
    ],
)
def test_onnx_prediction_index_maps_to_api_label(index, expected_label):
    logits = [-10.0] * 6
    logits[index] = 10.0
    onnx_model = ONNXModel()
    onnx_model.session = FakeONNXSession([logits])
    onnx_model.input_name = "input"

    prediction = onnx_model.predict(input_tensor=[])

    assert prediction["label"] == expected_label
    assert set(prediction["all_scores"]) == set(LABELS)


def test_camera_calibration_boosts_real_when_real_mask_are_top_two(monkeypatch):
    monkeypatch.setattr(settings, "CAMERA_REAL_MASK_CALIBRATION_ENABLED", True)
    monkeypatch.setattr(settings, "CAMERA_REAL_MASK_BOOST", 0.20)
    scores = {
        "real_person": 0.60,
        "fake_mask": 0.40,
        "fake_screen": 0.0,
        "fake_printed": 0.0,
        "fake_mannequin": 0.0,
        "fake_unknown": 0.0,
    }

    result = apply_camera_real_mask_calibration(scores, source="camera")

    assert result.metadata["applied"] is True
    assert result.metadata["reason"] == "camera_real_mask_stabilization"
    assert result.scores["real_person"] == pytest.approx(0.80)
    assert result.scores["fake_mask"] == pytest.approx(0.20)


def test_camera_calibration_can_flip_uncertain_fake_mask_to_real(monkeypatch):
    monkeypatch.setattr(settings, "CAMERA_REAL_MASK_CALIBRATION_ENABLED", True)
    monkeypatch.setattr(settings, "CAMERA_REAL_MASK_BOOST", 0.20)
    scores = {
        "real_person": 0.35,
        "fake_mask": 0.65,
        "fake_screen": 0.0,
        "fake_printed": 0.0,
        "fake_mannequin": 0.0,
        "fake_unknown": 0.0,
    }

    result = apply_camera_real_mask_calibration(scores, source="camera")

    assert result.metadata["applied"] is True
    assert result.scores["real_person"] == pytest.approx(0.55)
    assert result.scores["fake_mask"] == pytest.approx(0.45)
    assert max(result.scores, key=result.scores.get) == "real_person"


def test_camera_calibration_does_not_apply_to_upload(monkeypatch):
    monkeypatch.setattr(settings, "CAMERA_REAL_MASK_CALIBRATION_ENABLED", True)
    scores = {
        "real_person": 0.35,
        "fake_mask": 0.65,
        "fake_screen": 0.0,
        "fake_printed": 0.0,
        "fake_mannequin": 0.0,
        "fake_unknown": 0.0,
    }

    result = apply_camera_real_mask_calibration(scores, source="upload")

    assert result.metadata["applied"] is False
    assert result.metadata["reason"] == "not_camera_source"
    assert result.scores == scores
    assert max(result.scores, key=result.scores.get) == "fake_mask"


@pytest.mark.parametrize(
    "dominant_label",
    ["fake_screen", "fake_printed", "fake_mannequin", "fake_unknown"],
)
def test_camera_calibration_does_not_disturb_other_spoof_classes(dominant_label):
    scores = {
        "real_person": 0.15,
        "fake_mask": 0.10,
        "fake_screen": 0.0,
        "fake_printed": 0.0,
        "fake_mannequin": 0.0,
        "fake_unknown": 0.0,
    }
    scores[dominant_label] = 0.70

    result = apply_camera_real_mask_calibration(scores, source="camera")

    assert result.metadata["applied"] is False
    assert result.metadata["reason"] == "top2_not_real_mask"
    assert result.scores == scores
    assert max(result.scores, key=result.scores.get) == dominant_label


@pytest.mark.asyncio(loop_scope="function")
async def test_predict_accepts_image_anonymously():
    previous_mock = model.mock
    previous_session = model.session
    previous_input_name = model.input_name
    model.mock = True
    model.session = None
    model.input_name = None
    session = FakeSession()
    app.dependency_overrides[get_async_session] = make_session_override(session)
    app.dependency_overrides[optional_current_active_user] = lambda: None

    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://localhost:8000"
        ) as client:
            response = await client.post(
                "/predict",
                files={"file": ("face.jpg", make_image_bytes(), "image/jpeg")},
            )
    finally:
        model.mock = previous_mock
        model.session = previous_session
        model.input_name = previous_input_name

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["label"] in {
        "fake_mask",
        "fake_printed",
        "fake_mannequin",
        "fake_unknown",
        "fake_screen",
        "real_person",
    }
    assert payload["mock"] is True
    assert len(payload["all_scores"]) == 6


@pytest.mark.asyncio(loop_scope="function")
async def test_predict_rejects_unsupported_content_type():
    app.dependency_overrides[get_async_session] = make_session_override(FakeSession())
    app.dependency_overrides[optional_current_active_user] = lambda: None

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://localhost:8000"
    ) as client:
        response = await client.post(
            "/predict",
            files={"file": ("face.txt", b"not an image", "text/plain")},
        )

    assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE


@pytest.mark.asyncio(loop_scope="function")
async def test_history_returns_authenticated_user_logs():
    user_id = uuid4()
    log = PredictionLog(
        user_id=user_id,
        label="real_person",
        confidence=0.91,
        is_real=True,
        image_filename="face.jpg",
    )
    log.id = uuid4()
    log.created_at = __import__("datetime").datetime.now(__import__("datetime").UTC)

    app.dependency_overrides[current_active_user] = lambda: SimpleNamespace(id=user_id)
    app.dependency_overrides[get_async_session] = make_session_override(FakeSession([log]))

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://localhost:8000"
    ) as client:
        response = await client.get("/history")

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["count"] == 1
    assert payload["items"][0]["label"] == "real_person"
