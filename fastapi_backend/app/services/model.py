import logging
from pathlib import Path

import numpy as np

from app.config import settings

logger = logging.getLogger(__name__)

# ONNX output order follows sklearn LabelEncoder.classes_, not CFG.CLASSES insertion order.
MODEL_LABELS = [
    "fake_mannequin",
    "fake_mask",
    "fake_printed",
    "fake_screen",
    "fake_unknown",
    "realperson",
]

API_LABEL_MAP = {
    "realperson": "real_person",
    "fake_mannequin": "fake_mannequin",
    "fake_mask": "fake_mask",
    "fake_printed": "fake_printed",
    "fake_screen": "fake_screen",
    "fake_unknown": "fake_unknown",
}

LABELS = [API_LABEL_MAP[label] for label in MODEL_LABELS]


class ModelLoadError(RuntimeError):
    pass


class ModelInferenceError(RuntimeError):
    pass


class ONNXModel:
    def __init__(self) -> None:
        self.session = None
        self.input_name: str | None = None
        self.input_size: tuple[int, int] = (
            settings.MODEL_INPUT_SIZE,
            settings.MODEL_INPUT_SIZE,
        )
        self.mock = False
        self.model_path: Path | None = None

    def load(self) -> None:
        model_path = self._resolve_model_path()
        if model_path is None:
            if settings.ENVIRONMENT.lower() == "production" and not settings.MODEL_MOCK_ENABLED:
                raise ModelLoadError(
                    "ONNX model is missing and MODEL_MOCK_ENABLED is false in production."
                )
            self.mock = True
            logger.warning(
                "ONNX model not found. Running prediction endpoint in explicit mock mode."
            )
            return

        try:
            import onnxruntime as ort

            session_options = ort.SessionOptions()
            session_options.graph_optimization_level = (
                ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            )
            session_options.intra_op_num_threads = 2
            session_options.inter_op_num_threads = 1

            self.session = ort.InferenceSession(
                str(model_path),
                sess_options=session_options,
                providers=["CPUExecutionProvider"],
            )
            model_input = self.session.get_inputs()[0]
            self.input_name = model_input.name
            self.input_size = self._infer_input_size(model_input.shape)
            self.model_path = model_path
            self.mock = False
            logger.info("Loaded ONNX model from %s", model_path)
        except Exception as exc:
            raise ModelLoadError("Failed to load ONNX model.") from exc

    def predict(self, input_tensor: np.ndarray) -> dict[str, object]:
        if self.mock:
            return self._mock_prediction(input_tensor)

        if self.session is None or self.input_name is None:
            raise ModelInferenceError("Model session is not initialized.")

        try:
            outputs = self.session.run(None, {self.input_name: input_tensor})
            logits = np.asarray(outputs[0], dtype=np.float32).reshape(-1)
            if logits.size < len(MODEL_LABELS):
                raise ModelInferenceError("Model returned fewer class scores than expected.")
            scores = self._softmax(logits[: len(MODEL_LABELS)])
            label_index = int(np.argmax(scores))
            all_scores = {
                label: float(round(score, 6))
                for label, score in zip(LABELS, scores, strict=True)
            }
            return {
                "label": LABELS[label_index],
                "confidence": float(round(scores[label_index], 6)),
                "all_scores": all_scores,
                "mock": False,
            }
        except ModelInferenceError:
            raise
        except Exception as exc:
            raise ModelInferenceError("Model inference failed.") from exc

    def _resolve_model_path(self) -> Path | None:
        local_path = Path(settings.MODEL_LOCAL_PATH)
        if not local_path.is_absolute():
            local_path = Path.cwd() / local_path
        if local_path.exists():
            return local_path

        if settings.HF_MODEL_REPO:
            try:
                from huggingface_hub import hf_hub_download

                downloaded_path = hf_hub_download(
                    repo_id=settings.HF_MODEL_REPO,
                    filename=settings.HF_MODEL_FILENAME,
                )
                return Path(downloaded_path)
            except Exception as exc:
                logger.warning("Could not download ONNX model from Hugging Face: %s", exc)

        return None

    @staticmethod
    def _infer_input_size(shape: list[object]) -> tuple[int, int]:
        if len(shape) >= 4 and isinstance(shape[2], int) and isinstance(shape[3], int):
            return shape[2], shape[3]
        return settings.MODEL_INPUT_SIZE, settings.MODEL_INPUT_SIZE

    @staticmethod
    def _softmax(values: np.ndarray) -> np.ndarray:
        shifted = values - np.max(values)
        exp = np.exp(shifted)
        return exp / np.sum(exp)

    @staticmethod
    def _mock_prediction(input_tensor: np.ndarray) -> dict[str, object]:
        brightness = float(np.mean(input_tensor))
        real_score = 0.68 if brightness > -0.15 else 0.42
        remaining = max(1.0 - real_score, 0.0)
        fake_weights = np.array([0.12, 0.23, 0.28, 0.19, 0.18], dtype=np.float32)
        fake_scores = fake_weights / np.sum(fake_weights) * remaining
        scores = np.concatenate((fake_scores, [real_score]))
        label_index = int(np.argmax(scores))
        all_scores = {
            label: float(round(score, 6))
            for label, score in zip(LABELS, scores, strict=True)
        }
        return {
            "label": LABELS[label_index],
            "confidence": float(round(scores[label_index], 6)),
            "all_scores": all_scores,
            "mock": True,
        }


model = ONNXModel()
