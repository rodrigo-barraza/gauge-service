import express from "express";
import CONFIG from "./config.js";
import { connectDB } from "./db.js";
import logger from "./logger.js";
import { requestLoggerMiddleware } from "./middleware/RequestLoggerMiddleware.js";

// ─── Collection Setup ──────────────────────────────────────────
import { setupSensorsCollection } from "./services/SensorService.js";
import { setupReadingsCollection } from "./services/ReadingService.js";
import { setupAlertsCollection } from "./services/AlertService.js";

// ─── Routes ────────────────────────────────────────────────────
import sensorRoutes from "./routes/SensorRoutes.js";
import readingRoutes from "./routes/ReadingRoutes.js";
import alertRoutes from "./routes/AlertRoutes.js";
import dashboardRoutes from "./routes/DashboardRoutes.js";
import weatherProxyRoutes from "./routes/WeatherProxyRoutes.js";

// ─── Express App ───────────────────────────────────────────────

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(requestLoggerMiddleware);

// ─── Mount Domain Routers ──────────────────────────────────────

app.use("/sensors", sensorRoutes);
app.use("/readings", readingRoutes);
app.use("/alerts", alertRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/weather", weatherProxyRoutes);

// ─── Health ────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "gauge-service",
    port: CONFIG.GAUGE_SERVICE_PORT,
    uptime: process.uptime(),
  });
});

// ─── Root ──────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    service: "gauge-service",
    version: "0.1.0",
    description: "Weather and sensor monitoring API — sensors, readings, alerts, weather proxy",
    endpoints: {
      sensors: "/sensors",
      readings: "/readings",
      alerts: "/alerts",
      dashboard: "/dashboard",
      weather: "/weather",
      health: "/health",
    },
  });
});

// ─── Startup ───────────────────────────────────────────────────

async function start() {
  try {
    await connectDB(CONFIG.MONGODB_URI);

    await Promise.all([
      setupSensorsCollection(),
      setupReadingsCollection(),
      setupAlertsCollection(),
    ]);
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  const port = CONFIG.GAUGE_SERVICE_PORT;
  app.listen(port, () => {
    logger.success(`Gauge Service running on port ${port}`);
    logger.info(`Database: ${CONFIG.MONGODB_URI}`);
    logger.info(`Tools Service: ${CONFIG.TOOLS_SERVICE_URL}`);
    logger.info(
      "Routes: /sensors, /readings, /alerts, /dashboard, /weather",
    );
  });
}

start();
