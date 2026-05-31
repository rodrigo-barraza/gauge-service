import { createService } from "@rodrigo-barraza/service-library";
import CONFIG from "./config.ts";

// ─── Collection Setup ──────────────────────────────────────────
import { setupSensorsCollection } from "./services/SensorService.ts";
import { setupReadingsCollection } from "./services/ReadingService.ts";
import { setupAlertsCollection } from "./services/AlertService.ts";

// ─── Routes ────────────────────────────────────────────────────
import sensorRoutes from "./routes/SensorRoutes.ts";
import readingRoutes from "./routes/ReadingRoutes.ts";
import alertRoutes from "./routes/AlertRoutes.ts";
import dashboardRoutes from "./routes/DashboardRoutes.ts";
import weatherProxyRoutes from "./routes/WeatherProxyRoutes.ts";

// ─── Service Bootstrap ────────────────────────────────────────

await createService({
  name: "gauge-service",
  port: CONFIG.GAUGE_SERVICE_PORT,
  description: "Weather and sensor monitoring API — sensors, readings, alerts, weather proxy",
  mongo: {
    uri: CONFIG.MONGODB_URI,
    dbName: CONFIG.MONGODB_DB_NAME,
  },
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
