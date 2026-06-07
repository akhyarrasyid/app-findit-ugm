# Makefile

BACKEND_DIR=fastapi_backend
FRONTEND_DIR=nextjs-frontend
DOCKER_COMPOSE=docker compose

.PHONY: help
help:
	@echo "Available commands:"
	@awk '/^[a-zA-Z_-]+:/{split($$1, target, ":"); print "  " target[1] "\t" substr($$0, index($$0,$$2))}' $(MAKEFILE_LIST)

.PHONY: install-backend start-backend test-backend lint-backend

install-backend: ## Install backend dependencies with uv
	cd $(BACKEND_DIR) && uv sync --dev

start-backend: ## Start the FastAPI backend
	cd $(BACKEND_DIR) && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test-backend: ## Run backend tests using pytest
	cd $(BACKEND_DIR) && uv run pytest

lint-backend: ## Run backend linting
	cd $(BACKEND_DIR) && uv run ruff check .

.PHONY: install-frontend start-frontend lint-frontend build-frontend

install-frontend: ## Install frontend dependencies with npm
	cd $(FRONTEND_DIR) && npm install

start-frontend: ## Start the Next.js frontend
	cd $(FRONTEND_DIR) && npm run dev

lint-frontend: ## Run frontend lint
	cd $(FRONTEND_DIR) && npm run lint

build-frontend: ## Run frontend production build
	cd $(FRONTEND_DIR) && npm run build

.PHONY: docker-up docker-down docker-up-test-db docker-up-mailhog docker-migrate-db

docker-up: ## Start local Postgres and MailHog services
	$(DOCKER_COMPOSE) up -d db db_test mailhog

docker-down: ## Stop local Docker services
	$(DOCKER_COMPOSE) down

docker-up-test-db: ## Start the test database container
	$(DOCKER_COMPOSE) up -d db_test

docker-migrate-db: ## Run database migrations using Alembic
	cd $(BACKEND_DIR) && uv run alembic upgrade head

docker-up-mailhog: ## Start mailhog server
	$(DOCKER_COMPOSE) up -d mailhog
