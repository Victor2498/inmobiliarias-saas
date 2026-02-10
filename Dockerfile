# Etapa 1: Build del Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /build-frontend
COPY frontend/package*.json ./
# Instalación sin auditoría para ahorrar memoria
RUN npm install --no-audit --no-fund
COPY frontend/ ./
# Build directo saltando chequeos extras
RUN npx vite build

# Etapa 2: Runtime del Backend
FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias de Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del backend
COPY backend/ .

# Copiar el build del frontend
COPY --from=frontend-builder /build-frontend/dist ./static

EXPOSE 8000

CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
