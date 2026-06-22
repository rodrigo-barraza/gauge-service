// ─── DashboardService ───────────────────────────────────────

import { getDatabase } from "@rodrigo-barraza/service-library/mongo";
import { COLLECTIONS } from "../constants.ts";
import { countByType, countByStatus } from "./SensorService.ts";
import { getLatestReadings } from "./ReadingService.ts";
import { getAlertSummary } from "./AlertService.ts";
import type { Document } from "mongodb";

// ── Dashboard Summary ─────────────────────────────────────────

export async function getDashboardSummary() {
  const [sensorsByType, sensorsByStatus, latestReadings, alertSummary] =
    await Promise.all([
      countByType(),
      countByStatus(),
      getLatestReadings(),
      getAlertSummary(),
    ]);

  const totalSensors = sensorsByType.reduce((sum: number, s: Document) => sum + (s.count as number), 0);

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
  const database = getDatabase();
  const sensors = await database
    .collection(COLLECTIONS.SENSORS)
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  return sensors.map((sensor: Document) => ({
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
