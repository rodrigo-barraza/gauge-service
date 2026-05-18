// ─── AlertService ───────────────────────────────────────────

import { ObjectId } from "mongodb";
import { getDB } from "../db.ts";
import { COLLECTIONS, ALERT_CONDITIONS } from "../constants.ts";
import logger from "../logger.ts";

const alertCol = () => getDB().collection(COLLECTIONS.ALERTS);
const historyCol = () => getDB().collection(COLLECTIONS.ALERT_HISTORY);

// ── Collection Setup ──────────────────────────────────────────

export async function setupAlertsCollection() {
  const db = getDB();

  const alerts = db.collection(COLLECTIONS.ALERTS);
  await alerts.createIndex({ sensorId: 1 });
  await alerts.createIndex({ active: 1 });

  const history = db.collection(COLLECTIONS.ALERT_HISTORY);
  await history.createIndex({ alertId: 1, triggeredAt: -1 });
  await history.createIndex({ triggeredAt: -1 });

  logger.info("Alerts collection indexes ensured");
}

// ── List ──────────────────────────────────────────────────────

export async function listAlerts(filters: Record<string, any> = {}) {
  const query: Record<string, any> = {};
  if (filters.sensorId) query.sensorId = new ObjectId(filters.sensorId);
  if (filters.active !== undefined) query.active = filters.active === "true" || filters.active === true;

  const alerts = await alertCol()
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return { alerts, count: alerts.length };
}

// ── Get ───────────────────────────────────────────────────────

export async function getAlert(id: any) {
  return alertCol().findOne({ _id: new ObjectId(id) });
}

// ── Create ────────────────────────────────────────────────────

export async function createAlert(data: any) {
  const now = new Date();
  const document = {
    name: data.name,
    sensorId: new ObjectId(data.sensorId),
    condition: data.condition,
    threshold: data.threshold,
    thresholdHigh: data.thresholdHigh || null,
    severity: data.severity || "warning",
    message: data.message || "",
    active: true,
    lastTriggered: null,
    triggerCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await alertCol().insertOne(document);
  return { ...document, _id: result.insertedId };
}

// ── Update ────────────────────────────────────────────────────

export async function updateAlert(id: any, data: any) {
  const updates: Record<string, any> = { updatedAt: new Date() };
  const allowed = ["name", "condition", "threshold", "thresholdHigh", "severity", "message", "active"];
  for (const key of allowed) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  const result = await alertCol().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );
  return result;
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteAlert(id: any) {
  const result = await alertCol().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// ── Evaluate Alerts ───────────────────────────────────────────
// Called on each reading ingest to check thresholds.

export async function evaluateAlerts(sensorId: any, value: any) {
  const alerts = await alertCol()
    .find({ sensorId: new ObjectId(sensorId), active: true })
    .toArray();

  for (const alert of alerts) {
    let triggered = false;

    switch (alert.condition) {
      case ALERT_CONDITIONS.ABOVE:
        triggered = value > alert.threshold;
        break;
      case ALERT_CONDITIONS.BELOW:
        triggered = value < alert.threshold;
        break;
      case ALERT_CONDITIONS.EQUALS:
        triggered = value === alert.threshold;
        break;
      case ALERT_CONDITIONS.OUTSIDE_RANGE:
        triggered =
          value < alert.threshold || value > (alert.thresholdHigh ?? Infinity);
        break;
    }

    if (triggered) {
      const now = new Date();

      await alertCol().updateOne(
        { _id: alert._id },
        {
          $set: { lastTriggered: now, updatedAt: now },
          $inc: { triggerCount: 1 },
        },
      );

      await historyCol().insertOne({
        alertId: alert._id,
        sensorId: new ObjectId(sensorId),
        alertName: alert.name,
        condition: alert.condition,
        threshold: alert.threshold,
        value,
        severity: alert.severity,
        triggeredAt: now,
      });

      logger.warn(
        `Alert triggered: "${alert.name}" — value ${value} ${alert.condition} ${alert.threshold}`,
      );
    }
  }
}

// ── Alert History ─────────────────────────────────────────────

export async function getAlertHistory(options: Record<string, any> = {}) {
  const { alertId, sensorId, limit = 100 } = options;
  const query: Record<string, any> = {};
  if (alertId) query.alertId = new ObjectId(alertId);
  if (sensorId) query.sensorId = new ObjectId(sensorId);

  const history = await historyCol()
    .find(query)
    .sort({ triggeredAt: -1 })
    .limit(limit)
    .toArray();

  return { history, count: history.length };
}

// ── Summary ───────────────────────────────────────────────────

export async function getAlertSummary() {
  const [total, active, triggered24h] = await Promise.all([
    alertCol().countDocuments(),
    alertCol().countDocuments({ active: true }),
    historyCol().countDocuments({
      triggeredAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  return { total, active, triggered24h };
}
