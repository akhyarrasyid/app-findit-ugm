# App FindIT - Face Anti-Spoofing Detection

App FindIT is a competition-focused face anti-spoofing application built for
FindIT UGM. The repository contains a production-style demo stack with a Next.js
frontend, a FastAPI backend, and ONNX inference served through Hugging Face.

## Overview

The application helps classify whether an input face image belongs to a real
person or to one of several spoofing categories. It supports both live webcam
capture and manual image upload, with extra stabilization logic for camera
captures to reduce false `Fake Mask` predictions during demos.

## Features

- Live webcam capture with mild center-crop for more stable framing
- Manual image upload with original file preserved
- ONNX inference through FastAPI
- Camera-specific real-person vs fake-mask calibration
- Prediction history for authenticated users
- JWT auth flow with registration, login, and password recovery
- Dark mode and responsive demo UI

## Architecture

```text
nextjs-frontend/   Public demo UI, auth pages, protected history/dashboard
fastapi_backend/   FastAPI API, auth, prediction, history, model services
docker-compose.yml Local PostgreSQL + MailHog services for development
```

## Frontend Stack

- Next.js 16
- React 19
- Tailwind CSS
- TanStack Query
- next-themes
- react-webcam

## Backend Stack

- FastAPI
- SQLAlchemy async + asyncpg
- fastapi-users
- Alembic
- onnxruntime
- pillow / numpy
- huggingface_hub

## Model Inference

The backend loads the ONNX model from Hugging Face Hub by default and can fall
back to a local development path:

- `HF_MODEL_REPO`
- `HF_MODEL_FILENAME`
- `MODEL_LOCAL_PATH`

The final label order must stay exactly as follows:

```text
0 realperson
1 fake_mask
2 fake_mannequin
3 fake_printed
4 fake_screen
5 fake_unknown
```

The backend normalizes `realperson` to `real_person` in API responses while
preserving the model output order internally.

## API Endpoints

### Public / optional-auth

- `GET /health`
- `POST /predict`

### Auth

- `POST /auth/register`
- `POST /auth/jwt/login`
- `POST /auth/jwt/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /users/me`

### Protected

- `GET /history`

## Local Setup

### 1. Start local services

```bash
docker compose up db db_test mailhog -d
```

### 2. Backend

```bash
cd fastapi_backend
uv sync --dev
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd nextjs-frontend
npm install
npm run build
npm run dev
```

## Environment Variables

### Frontend (`nextjs-frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000
```

### Backend (`fastapi_backend/.env`)

See [`fastapi_backend/.env.example`](fastapi_backend/.env.example) for the full
list. The most important values are:

- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `ACCESS_SECRET_KEY`
- `RESET_PASSWORD_SECRET_KEY`
- `VERIFICATION_SECRET_KEY`
- `HF_MODEL_REPO`
- `HF_MODEL_FILENAME`
- `MODEL_LOCAL_PATH`
- `CORS_ORIGINS`
- `FRONTEND_ORIGIN`

## Deployment Notes

- Frontend is deployed from `nextjs-frontend/` to Vercel.
- Backend is deployed from `fastapi_backend/` to Hugging Face Spaces using Docker.
- Model weights should stay in the Hugging Face model repository, not in Git.

## Troubleshooting

- If `/predict` returns `mock=true`, check model repository variables.
- If auth-protected pages redirect unexpectedly, verify the `accessToken` cookie.
- If backend cannot connect to Neon/Postgres, ensure the URL uses
  `postgresql+asyncpg://` or let the app normalize it from `postgresql://`.
- If password recovery fails locally, start MailHog with Docker Compose.

## License

This project keeps the original MIT license from the template it was derived
from. See [`LICENSE.txt`](LICENSE.txt).
