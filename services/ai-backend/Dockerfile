FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to cache dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Environment variables
ENV DATA_DIR="/app/data"
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run the application
# Run the application (use shell form for variable expansion)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
