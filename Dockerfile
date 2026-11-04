# Multi-stage Dockerfile for Torbox Library Sync Addon
# Stage 1: Build TypeScript to JavaScript
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY public ./public
COPY src ./src

RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7000
ENV HOST=0.0.0.0

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built distribution from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Use unprivileged built-in user for security
USER node

EXPOSE 7000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:7000/manifest.json || exit 1

CMD ["node", "dist/src/index.js"]
