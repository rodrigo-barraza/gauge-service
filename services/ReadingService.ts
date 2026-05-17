// @ts-nocheck
// ─── ReadingService ─────────────────────────────────────────

import { ObjectId } from "mongodb";
import { getDB } from "../db.js";
import { COLLECTIONS, DEFAULT_READING_RETENTION_DAYS } from "../constants.js";
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
  await collection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 },
  );

  logger.info("Readings collection indexes ensured");
}

// ── Ingest Single Reading ─────────────────────────────────────

export async function ingestReading(data) {
  const now = new Date();
  const timestamp = data.timestamp ? new Date(data.timestamp) : now;

  const doc = {
    sensorId: new ObjectId(data.sensorId),
    value: data.value,
    timestamp,
    metadata: data.metadata || {},
    expiresAt: new Date(
      timestamp.getTime() +
        DEFAULT_READING_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ),
    createdAt: now,
  };

  const result = await col().insertOne(doc);

  // Fire-and-forget: update sensor's last reading + evaluate alerts
  updateLastReading(data.sensorId, data.value, timestamp).catch(() => {});
  evaluateAlerts(data.sensorId, data.value).catch(() => {});

  return { ...doc, _id: result.insertedId };
}

// ── Bulk Ingest ───────────────────────────────────────────────

export async function ingestBulkReadings(readings) {
  const now = new Date();
  const docs = readings.map((r) => {
    const timestamp = r.timestamp ? new Date(r.timestamp) : now;
    return {
      sensorId: new ObjectId(r.sensorId),
      value: r.value,
      timestamp,
      metadata: r.metadata || {},
      expiresAt: new Date(
        timestamp.getTime() +
          DEFAULT_READING_RETENTION_DAYS * 24 * 60 * 60 * 1000,
      ),
      createdAt: now,
    };
  });

  const result = await col().insertMany(docs);

  // Update each sensor's last reading
  const sensorUpdates = new Map();
  for (const doc of docs) {
    const sid = doc.sensorId.toString();
    const existing = sensorUpdates.get(sid);
    if (!existing || doc.timestamp > existing.timestamp) {
      sensorUpdates.set(sid, { value: doc.value, timestamp: doc.timestamp });
    }
  }
  for (const [sensorId, { value, timestamp }] of sensorUpdates) {
    updateLastReading(sensorId, value, timestamp).catch(() => {});
    evaluateAlerts(sensorId, value).catch(() => {});
  }

  return { insertedCount: result.insertedCount };
}

// ── Query Readings ────────────────────────────────────────────

export async function getReadings(sensorId, options = {}) {
  const { from, to, limit = 500, sort = -1 } = options;
  const query = { sensorId: new ObjectId(sensorId) };

  if (from || to) {
    query.timestamp = {};
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

export async function getSparklineData(sensorId, hours = 24, points = 50) {
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
  const sampled = [];
  for (let i = 0; i < points; i++) {
    sampled.push(readings[Math.floor(i * step)]);
  }
  return sampled;
}

// ── Aggregate Stats ───────────────────────────────────────────

export async function getReadingStats(sensorId, hours = 24) {
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
