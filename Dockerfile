# Stage 1: Build Frontend
FROM node:18-alpine as build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Setup Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (for postgres)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
# If requirements.txt is missing in root of backend, we might need to create it or assume user has it. 
# Let's create it dynamically in the next step to be safe, but here we assume it exists.
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY alembic.ini .

# Copy built frontend assets
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PORT=8000

# Expose port
EXPOSE 8000

# Run commands (Migration + App)
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
