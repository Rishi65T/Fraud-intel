# ==========================================
# Stage 1: Build Frontend (Node.js)
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend source and build
COPY tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
RUN npm run build

# ==========================================
# Stage 2: Production Python Backend + UI
# ==========================================
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (libgomp1 is required for XGBoost / LightGBM)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY backend/ ./backend/
COPY database/ ./database/
COPY ml/ ./ml/
COPY rag/ ./rag/
COPY verify_system.py ./

# Copy built frontend assets from Stage 1 into /app/dist
COPY --from=frontend-builder /app/dist ./dist

# Render provides the port in the $PORT environment variable (default: 10000)
ENV PORT=10000
ENV HOST=0.0.0.0
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start Uvicorn serving both REST API endpoints and static frontend
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
