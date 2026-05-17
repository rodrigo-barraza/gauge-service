# Gauge Service

Weather and sensor monitoring backend — sensors, readings, alerts, and weather proxy via tools-service.

## Quick Start

```bash
# Secrets are resolved from vault-service automatically.
npm install
npm run dev
```

## API

| Path | Method | Description |
|------|--------|-------------|
| `/sensors` | GET, POST | List/create sensors |
| `/sensors/:id` | GET, PUT, DELETE | Sensor CRUD |
| `/readings` | POST | Ingest reading |
| `/readings/bulk` | POST | Bulk ingest |
| `/readings/:sensorId` | GET | Query readings |
| `/readings/:sensorId/sparkline` | GET | Downsampled sparkline data |
| `/readings/:sensorId/stats` | GET | Aggregate stats |
| `/alerts` | GET, POST | List/create alerts |
| `/alerts/history` | GET | Alert trigger history |
| `/alerts/:id` | GET, PUT, DELETE | Alert CRUD |
| `/dashboard/summary` | GET | Dashboard overview |
| `/dashboard/sensors` | GET | Sensor overview with latest readings |
| `/weather/current` | GET | Current weather (via tools-service) |
| `/weather/forecast` | GET | Weather forecast (via tools-service) |
| `/weather/air` | GET | Air quality (via tools-service) |
| `/weather/live` | GET | Live weather for any location |
| `/weather/environment/dashboard` | GET | Aggregated environment data |
| `/health` | GET | Health check |

## Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express 5
- **Database:** MongoDB
- **Weather:** tools-service proxy

## Scripts

```bash
npm run start         # Start server
npm run dev           # Start with auto-reload (nodemon)
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm test              # Run tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run deploy        # Deploy to production
npm run deploy:dry    # Validate deployment without deploying
```

