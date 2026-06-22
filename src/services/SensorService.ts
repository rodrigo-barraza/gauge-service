// ─── SensorService ──────────────────────────────────────────

import { ObjectId } from "mongodb";
import { getDatabase } from "@rodrigo-barraza/service-library/mongo";
import { COLLECTIONS, SENSOR_STATUS, UNIT_MAP } from "../constants.ts";
import logger from "../logger.ts";

const getSensorsCollection = () => getDatabase().collection(COLLECTIONS.SENSORS);

// ─── Types ───────────────────────────────────────────────────

export interface SensorFilter {
  type?: string;
  status?: string;
  location?: string;
}

export interface CreateSensorData {
  name: string;
  type: string;
  unit?: string;
  location?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export type UpdateSensorData = Partial<CreateSensorData> & { status?: string };

// ── Collection Setup ──────────────────────────────────────────

export async function setupSensorsCollection() {
  const database = getDatabase();
  const collection = database.collection(COLLECTIONS.SENSORS);

  await collection.createIndex({ type: 1 });
  await collection.createIndex({ status: 1 });
  await collection.createIndex({ location: 1 });
  await collection.createIndex({ createdAt: -1 });

  logger.info("Sensors collection indexes ensured");
}

// ── List ──────────────────────────────────────────────────────

export async function listSensors(filters: SensorFilter = {}) {
  const query: Record<string, unknown> = {};
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.location) query.location = { $regex: filters.location, $options: "i" };

  const sensors = await getSensorsCollection()
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return { sensors, count: sensors.length };
}

// ── Get ───────────────────────────────────────────────────────

export async function getSensor(id: string) {
  return getSensorsCollection().findOne({ _id: new ObjectId(id) });
}

// ── Create ────────────────────────────────────────────────────

export async function createSensor(data: CreateSensorData) {
  const now = new Date();
  const document = {
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

  const result = await getSensorsCollection().insertOne(document);
  return { ...document, _id: result.insertedId };
}

// ── Update ────────────────────────────────────────────────────

export async function updateSensor(id: string, data: UpdateSensorData) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const allowed = ["name", "type", "unit", "location", "description", "status", "metadata"];
  for (const key of allowed) {
    if ((data as Record<string, unknown>)[key] !== undefined) updates[key] = (data as Record<string, unknown>)[key];
  }

  const result = await getSensorsCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );
  return result;
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteSensor(id: string) {
  const result = await getSensorsCollection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// ── Update Last Reading ───────────────────────────────────────

export async function updateLastReading(sensorId: string, value: number, timestamp: Date) {
  await getSensorsCollection().updateOne(
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
  return getSensorsCollection()
    .aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
}

// ── Count by Status ───────────────────────────────────────────

export async function countByStatus() {
  return getSensorsCollection()
    .aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();
}
