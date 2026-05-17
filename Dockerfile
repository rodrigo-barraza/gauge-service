# ============================================================
# Gauge Service — Multi-stage Dockerfile
# ============================================================
# Weather and sensor monitoring backend — sensors, readings,
# alerts, weather proxy via tools-service.
# Uses boot.js to fetch secrets from Vault at startup.
# ============================================================

# ── Stage 1: Install dependencies ─────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --no-cache git openssh-client
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh npm ci --omit=dev

# ── Stage 2: Runtime ──────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Copy pre-built node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Non-root user for security
RUN addgroup --system --gid 1001 gauge && \
    adduser --system --uid 1001 gauge
USER gauge

EXPOSE 5607

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 -O /dev/null http://127.0.0.1:5607/health || exit 1

CMD ["node", "boot.ts"]
