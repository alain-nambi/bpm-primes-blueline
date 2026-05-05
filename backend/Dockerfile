# Backend Dockerfile (simple version)
FROM python:3.13-bookworm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc netcat-traditional

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "while ! nc -z db 5432; do sleep 1; done && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
