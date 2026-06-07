from io import BytesIO

import numpy as np
from PIL import Image, UnidentifiedImageError

from app.config import settings


class ImageValidationError(ValueError):
    pass


class ImagePreprocessError(RuntimeError):
    pass


class PreprocessService:
    def __init__(self, default_size: int = settings.MODEL_INPUT_SIZE):
        self.default_size = default_size
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

    def preprocess(
        self,
        image_bytes: bytes,
        input_shape: tuple[int, int] | None = None,
    ) -> np.ndarray:
        if not image_bytes:
            raise ImageValidationError("Image file is empty.")

        if len(image_bytes) > settings.MODEL_MAX_UPLOAD_BYTES:
            raise ImageValidationError("Image file is too large.")

        target_size = input_shape or (self.default_size, self.default_size)

        try:
            with Image.open(BytesIO(image_bytes)) as image:
                image.verify()
            with Image.open(BytesIO(image_bytes)) as image:
                rgb_image = image.convert("RGB")
                cropped_image = self._center_crop_square(rgb_image)
                resized_image = cropped_image.resize(
                    (target_size[1], target_size[0]), Image.Resampling.BICUBIC
                )
                image_array = np.asarray(resized_image, dtype=np.float32) / 255.0
        except UnidentifiedImageError as exc:
            raise ImageValidationError("Uploaded file is not a readable image.") from exc
        except OSError as exc:
            raise ImageValidationError("Uploaded image is corrupt or unsupported.") from exc
        except Exception as exc:
            raise ImagePreprocessError("Failed to preprocess image.") from exc

        normalized = (image_array - self.mean) / self.std
        channel_first = np.transpose(normalized, (2, 0, 1))
        return np.expand_dims(channel_first, axis=0).astype(np.float32, copy=False)

    @staticmethod
    def _center_crop_square(image: Image.Image) -> Image.Image:
        width, height = image.size
        side = min(width, height)
        left = (width - side) // 2
        top = (height - side) // 2
        return image.crop((left, top, left + side, top + side))
