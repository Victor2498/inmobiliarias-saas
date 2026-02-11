# Etapa 1: Build del Frontend (Optimizado para poca RAM)
FROM node:18-slim AS frontend-builder
WORKDIR /build-frontend

# Limitar memoria de Node drásticamente
ENV NODE_OPTIONS="--max-old-space-size=450"

COPY frontend/package*.json ./
# Instalación silenciosa
RUN npm install --no-audit --no-fund --loglevel error

COPY frontend/ ./
# COMPILAR SIN TYPECHECK (Esto evita que el proceso muera por falta de RAM)
RUN ./node_modules/.bin/vite build

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
