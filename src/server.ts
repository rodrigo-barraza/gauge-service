// @ts-nocheck
import { createService } from "@rodrigo-barraza/service-library";
import CONFIG from "./config.js";

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

// ─── Service Bootstrap ────────────────────────────────────────

await createService({
  name: "gauge-service",
  port: CONFIG.GAUGE_SERVICE_PORT,
  description: "Weather and sensor monitoring API — sensors, readings, alerts, weather proxy",
  mongo: { uri: CONFIG.MONGODB_URI },
  routes: [
    { path: "/sensors", router: sensorRoutes },
    { path: "/readings", router: readingRoutes },
    { path: "/alerts", router: alertRoutes },
    { path: "/dashboard", router: dashboardRoutes },
    { path: "/weather", router: weatherProxyRoutes },
  ],
  beforeRoutes: async () => {
    await Promise.all([
      setupSensorsCollection(),
      setupReadingsCollection(),
      setupAlertsCollection(),
    ]);
  },
});
