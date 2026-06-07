FROM python:3.12-bookworm

# Set the working directory
WORKDIR /app

# The uv installer requires curl (and certificates) to download the release archive
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates

# Download the latest uv installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the uv installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Copy dependency files first to leverage Docker caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

ENV PATH="/app/.venv/bin:$PATH"

# Copy the rest of the application code
COPY . .

# Hugging Face Spaces Docker apps listen on 7860 by default.
EXPOSE 7860

# Command to run the application
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
