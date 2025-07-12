# 🚀 AIRDOCS - Fly.io Optimized Dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY ai-aggregator/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ai-aggregator/backend/ .
COPY ai-aggregator/frontend/ ./frontend/

# Create necessary directories with proper permissions
RUN mkdir -p generated_documents logs models prompts && \
    chmod 755 generated_documents logs models prompts

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Expose port (Fly.io uses PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application (Fly.io sets PORT automatically)
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}
