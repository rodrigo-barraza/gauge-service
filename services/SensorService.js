// ============================================================
// Gauge Service — SensorService
// ============================================================
// CRUD for sensor device registration and management.
// ============================================================

import { ObjectId } from "mongodb";
import { getDB } from "../db.js";
import { COLLECTIONS, SENSOR_STATUS, UNIT_MAP } from "../constants.js";
import logger from "../logger.js";

const col = () => getDB().collection(COLLECTIONS.SENSORS);

// ── Collection Setup ──────────────────────────────────────────

export async function setupSensorsCollection() {
  const db = getDB();
  const collection = db.collection(COLLECTIONS.SENSORS);

  await collection.createIndex({ type: 1 });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ location: 1 });
  await collection.createIndex({ createdAt: -1 });

  logger.info("Sensors collection indexes ensured");
}

// ── List ──────────────────────────────────────────────────────

export async function listSensors(filters = {}) {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.location) query.location = { $regex: filters.location, $options: "i" };

  const sensors = await col()
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return { sensors, count: sensors.length };
}

// ── Get ───────────────────────────────────────────────────────

export async function getSensor(id) {
  return col().findOne({ _id: new ObjectId(id) });
}

// ── Create ────────────────────────────────────────────────────

export async function createSensor(data) {
  const now = new Date();
  const doc = {
    name: data.name,
    type: data.type,
    unit: data.unit || UNIT_MAP[data.type] || "",
    location: data.location || "",
    description: data.description || "",
    status: SENSOR_STATUS.ONLINE,
    metadata: data.metadata || {},
    lastReading: null,
    lastReadingAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// ── Update ────────────────────────────────────────────────────

export async function updateSensor(id, data) {
  const updates = { updatedAt: new Date() };
  const allowed = ["name", "type", "unit", "location", "description", "status", "metadata"];
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  const result = await col().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );
  return result;
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteSensor(id) {
  const result = await col().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// ── Update Last Reading ───────────────────────────────────────

export async function updateLastReading(sensorId, value, timestamp) {
  await col().updateOne(
    { _id: new ObjectId(sensorId) },
    {
      $set: {
        lastReading: value,
        lastReadingAt: timestamp,
        updatedAt: new Date(),
      },
    },
  );
}

// ── Count by Type ─────────────────────────────────────────────

export async function countByType() {
  return col()
    .aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
}

// ── Count by Status ───────────────────────────────────────────

export async function countByStatus() {
  return col()
    .aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();
}
