# Etapa 1: Build del Frontend (Máximo Ahorro RAM)
FROM node:18-alpine AS frontend-builder
WORKDIR /build-frontend

# Forzar límite de memoria ultra bajo
ENV NODE_OPTIONS="--max-old-space-size=384"

COPY frontend/package*.json ./
RUN echo "--- DIAGNÓSTICO: Instalando dependencias ---" && \
    npm ci --no-audit --no-fund --loglevel error

COPY frontend/ ./
RUN echo "--- DIAGNÓSTICO: Compilando Frontend ---" && \
    ./node_modules/.bin/vite build

# Etapa 2: Runtime del Backend
FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias esenciales
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
# Copiamos el resultado (dist) a static
COPY --from=frontend-builder /build-frontend/dist ./static

EXPOSE 8000

CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
