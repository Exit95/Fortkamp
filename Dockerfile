# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the Astro site
RUN npm run build

# Production Stage
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy config file only (services/projects are loaded from S3)
COPY --from=builder /app/src/data/config.json ./src/data/config.json

# Create data directory for sessions
RUN mkdir -p ./data/sessions

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Expose port
EXPOSE 4321

# Health check - use IPv4 explicitly
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:4321/ || exit 1

CMD ["sh", "-c", "HOST=0.0.0.0 PORT=4321 node ./dist/server/entry.mjs"]
