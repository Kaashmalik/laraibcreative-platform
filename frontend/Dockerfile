# =================================================================
# Frontend Dockerfile - Next.js Production Ready
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
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

# Set build-time environment variables
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

# Build application
RUN npm run build

# =================================================================
# Production stage
# =================================================================
FROM base AS production

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start application
CMD ["npm", "start"]
