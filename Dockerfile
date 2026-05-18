# ============================================================
# Gauge Service — Multi-stage Dockerfile
# ============================================================
# Weather and sensor monitoring backend — sensors, readings,
# alerts, weather proxy via tools-service.
# Uses boot.js to fetch secrets from Vault at startup.
# ============================================================

# ── Stage 1: Install dependencies ─────────────────────────────
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --no-cache git
RUN npm ci


# ── Stage 2: Build TypeScript ─────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build
# Prune devDependencies for the runtime image
RUN npm prune --omit=dev

# ── Stage 3: Runtime ──────────────────────────────────────────
FROM node:26-alpine
WORKDIR /app

# Copy pre-built node_modules from deps stage
COPY --from=build /app/node_modules ./node_modules

# Copy application source
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# Non-root user for security
RUN addgroup --system --gid 1001 gauge && \
    adduser --system --uid 1001 gauge
USER gauge

EXPOSE 5607

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 -O /dev/null http://127.0.0.1:5607/health || exit 1

CMD ["node", "dist/boot.js"]
