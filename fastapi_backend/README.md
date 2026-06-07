---
title: App FindIT Backend
sdk: docker
app_port: 7860
---

# App FindIT Backend

FastAPI backend for App FindIT face spoofing detection.

## Core Endpoints

- `GET /health`
- `POST /predict`
- `GET /history`
- `POST /auth/jwt/login`
- `POST /auth/register`

## Runtime

The Docker Space starts the API with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}
```

## Required Environment Variables

```bash
DATABASE_URL=postgresql+asyncpg://...
ACCESS_SECRET_KEY=...
RESET_PASSWORD_SECRET_KEY=...
VERIFICATION_SECRET_KEY=...
FRONTEND_ORIGIN=https://app-findit-frontend.vercel.app
CORS_ORIGINS=["https://app-findit-frontend.vercel.app"]
HF_MODEL_REPO=akhyarrasyid/app-findit-face-spoofing-model
HF_MODEL_FILENAME=dinov3_vitl_fold_best.onnx
MODEL_INPUT_SIZE=336
MODEL_MOCK_ENABLED=false
ENVIRONMENT=production
```

The ONNX model is loaded from Hugging Face Hub. A local development fallback is
also supported at `models/dinov3_vitl_fold_best.onnx`, but model files should not
be committed to GitHub.
