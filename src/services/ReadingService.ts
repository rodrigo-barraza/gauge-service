// ─── ReadingService ─────────────────────────────────────────

import { ObjectId } from "mongodb";
import { getDB } from "../db.js";
import { COLLECTIONS } from "../constants.js";
import { updateLastReading } from "./SensorService.js";
import { evaluateAlerts } from "./AlertService.js";
import logger from "../logger.js";

const col = () => getDB().collection(COLLECTIONS.READINGS);

// ── Collection Setup ──────────────────────────────────────────

export async function setupReadingsCollection() {
  const db = getDB();
  const collection = db.collection(COLLECTIONS.READINGS);

  await collection.createIndex({ sensorId: 1, timestamp: -1 });
  await collection.createIndex({ timestamp: -1 });

  logger.info("Readings collection indexes ensured");
}

// ── Ingest Single Reading ─────────────────────────────────────

export async function ingestReading(data: any) {
  const now = new Date();
  const timestamp = data.timestamp ? new Date(data.timestamp) : now;

  const document = {
    sensorId: new ObjectId(data.sensorId),
    value: data.value,
    timestamp,
    metadata: data.metadata || {},
    createdAt: now,
  };

  const result = await col().insertOne(document);

  // Fire-and-forget: update sensor's last reading + evaluate alerts
  updateLastReading(data.sensorId, data.value, timestamp).catch(() => {});
  evaluateAlerts(data.sensorId, data.value).catch(() => {});

  return { ...document, _id: result.insertedId };
}

// ── Bulk Ingest ───────────────────────────────────────────────

export async function ingestBulkReadings(readings: any) {
  const now = new Date();
  const docs = readings.map((r: any) => {
    const timestamp = r.timestamp ? new Date(r.timestamp) : now;
    return {
      sensorId: new ObjectId(r.sensorId),
      value: r.value,
      timestamp,
      metadata: r.metadata || {},
      createdAt: now,
    };
  });

  const result = await col().insertMany(docs);

  // Update each sensor's last reading
  const sensorUpdates = new Map();
  for (const document of docs) {
    const sid = document.sensorId.toString();
    const existing = sensorUpdates.get(sid);
    if (!existing || document.timestamp > existing.timestamp) {
      sensorUpdates.set(sid, { value: document.value, timestamp: document.timestamp });
    }
  }
  for (const [sensorId, { value, timestamp }] of sensorUpdates) {
    updateLastReading(sensorId, value, timestamp).catch(() => {});
    evaluateAlerts(sensorId, value).catch(() => {});
  }

  return { insertedCount: result.insertedCount };
}

// ── Query Readings ────────────────────────────────────────────

export async function getReadings(sensorId: any, options: Record<string, any> = {}) {
  const { from, to, limit = 500, sort = -1 } = options;
  const query: Record<string, any> = { sensorId: new ObjectId(sensorId) };

  if (from || to) {
    query.timestamp = {} as Record<string, any>;
    if (from) query.timestamp.$gte = new Date(from);
    if (to) query.timestamp.$lte = new Date(to);
  }

  const readings = await col()
    .find(query)
    .sort({ timestamp: sort })
    .limit(limit)
    .toArray();

  return { readings, count: readings.length };
}

// ── Latest Reading Per Sensor ─────────────────────────────────

export async function getLatestReadings() {
  return col()
    .aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$sensorId",
          value: { $first: "$value" },
          timestamp: { $first: "$timestamp" },
          metadata: { $first: "$metadata" },
        },
      },
    ])
    .toArray();
}

// ── Sparkline Data ────────────────────────────────────────────

export async function getSparklineData(sensorId: any, hours: any = 24, points: any = 50) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const readings = await col()
    .find({
      sensorId: new ObjectId(sensorId),
      timestamp: { $gte: since },
    })
    .sort({ timestamp: 1 })
    .toArray();

  // Downsample to `points` evenly spaced readings
  if (readings.length <= points) return readings;

  const step = readings.length / points;
  const sampled: any[] = [];
  for (let i = 0; i < points; i++) {
    sampled.push(readings[Math.floor(i * step)]);
  }
  return sampled;
}

// ── Aggregate Stats ───────────────────────────────────────────

export async function getReadingStats(sensorId: any, hours: any = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const [stats] = await col()
    .aggregate([
      {
        $match: {
          sensorId: new ObjectId(sensorId),
          timestamp: { $gte: since },
        },
      },
      {
        $group: {
          _id: null,
          min: { $min: "$value" },
          max: { $max: "$value" },
          avg: { $avg: "$value" },
          count: { $sum: 1 },
          latest: { $last: "$value" },
        },
      },
    ])
    .toArray();

  return stats || { min: null, max: null, avg: null, count: 0, latest: null };
}
