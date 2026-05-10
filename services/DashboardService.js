// ============================================================
// Gauge Service — DashboardService
// ============================================================
// Aggregated dashboard stats for the frontend overview.
// ============================================================

import { getDB } from "../db.js";
import { COLLECTIONS } from "../constants.js";
import { countByType, countByStatus } from "./SensorService.js";
import { getLatestReadings } from "./ReadingService.js";
import { getAlertSummary } from "./AlertService.js";

// ── Dashboard Summary ─────────────────────────────────────────

export async function getDashboardSummary() {
  const [sensorsByType, sensorsByStatus, latestReadings, alertSummary] =
    await Promise.all([
      countByType(),
      countByStatus(),
      getLatestReadings(),
      getAlertSummary(),
    ]);

  const totalSensors = sensorsByType.reduce((sum, s) => sum + s.count, 0);

  return {
    totalSensors,
    sensorsByType,
    sensorsByStatus,
    latestReadings,
    alerts: alertSummary,
    timestamp: new Date(),
  };
}

// ── Sensor Overview (joined with latest readings) ─────────────

export async function getSensorOverview() {
  const db = getDB();
  const sensors = await db
    .collection(COLLECTIONS.SENSORS)
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  return sensors.map((sensor) => ({
    _id: sensor._id,
    name: sensor.name,
    type: sensor.type,
    unit: sensor.unit,
    location: sensor.location,
    status: sensor.status,
    lastReading: sensor.lastReading,
    lastReadingAt: sensor.lastReadingAt,
  }));
}
