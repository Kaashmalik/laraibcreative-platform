# =================================================================
# Backend Dockerfile - Production Ready
# =================================================================

FROM node:18-alpine AS base
WORKDIR /app

# Install required packages
RUN apk add --no-cache curl

# =================================================================
# Dependencies stage
# =================================================================
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# =================================================================
# Build stage  
# =================================================================
FROM base AS builder
COPY package*.json ./
RUN npm ci

# =================================================================
# Production stage
# =================================================================
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads/receipts uploads/references uploads/temp

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["node", "server.js"]
