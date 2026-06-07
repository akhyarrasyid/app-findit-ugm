from typing import Set

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # OpenAPI docs
    OPENAPI_URL: str = "/openapi.json"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/mydatabase"
    TEST_DATABASE_URL: str | None = "postgresql://postgres:password@localhost:5433/testdatabase"
    EXPIRE_ON_COMMIT: bool = False

    # User
    ACCESS_SECRET_KEY: str = "change-me-access-secret"
    RESET_PASSWORD_SECRET_KEY: str = "change-me-reset-secret"
    VERIFICATION_SECRET_KEY: str = "change-me-verification-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 3600

    # Email
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: str | None = None
    MAIL_SERVER: str | None = None
    MAIL_PORT: int | None = None
    MAIL_FROM_NAME: str = "App FindIT"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    TEMPLATE_DIR: str = "email_templates"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    FRONTEND_ORIGIN: str | None = None

    # CORS
    CORS_ORIGINS: Set[str] = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    }

    # Runtime
    ENVIRONMENT: str = "development"

    # Face spoofing model
    HF_MODEL_REPO: str | None = "akhyarrasyid/app-findit-face-spoofing-model"
    HF_MODEL_FILENAME: str = "dinov3_vitl_fold_best.onnx"
    MODEL_LOCAL_PATH: str = "models/dinov3_vitl_fold_best.onnx"
    MODEL_INPUT_SIZE: int = 336
    MODEL_MAX_UPLOAD_BYTES: int = 5 * 1024 * 1024
    MODEL_MOCK_ENABLED: bool = True

    # Demo stabilization only:
    # This calibration reduces false Fake Mask predictions for live camera input.
    # To revert safely, set CAMERA_REAL_MASK_CALIBRATION_ENABLED=False
    # or CAMERA_REAL_MASK_BOOST=0.0.
    CAMERA_REAL_MASK_CALIBRATION_ENABLED: bool = True
    CAMERA_REAL_MASK_BOOST: float = 0.20
    CAMERA_REAL_MASK_MAX_OTHER_SPOOF_SCORE: float = 0.20
    CAMERA_REAL_MASK_MIN_PAIR_SCORE: float = 0.35

    @property
    def cors_origins(self) -> list[str]:
        origins = set(self.CORS_ORIGINS)
        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL)
        if self.FRONTEND_ORIGIN:
            origins.add(self.FRONTEND_ORIGIN)
        return sorted(origins)

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
