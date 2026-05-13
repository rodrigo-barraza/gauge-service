import { asyncHandler } from "@rodrigo-barraza/utilities-library/express";
// ─── Alert Routes ───────────────────────────────────────────

import { Router } from "express";
import {
  listAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertHistory,
} from "../services/AlertService.js";
import { ALERT_CONDITIONS } from "../constants.js";

const router = Router();

// GET /alerts
router.get("/", asyncHandler(async (req, res) => {
  const { sensorId, active } = req.query;
  const result = await listAlerts({ sensorId, active });
  res.json(result);
}));

// GET /alerts/history
router.get("/history", asyncHandler(async (req, res) => {
  const { alertId, sensorId, limit } = req.query;
  const result = await getAlertHistory({
    alertId,
    sensorId,
    limit: limit ? parseInt(limit, 10) : 100,
  });
  res.json(result);
}));

// GET /alerts/:id
router.get("/:id", asyncHandler(async (req, res) => {
  const alert = await getAlert(req.params.id);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  res.json(alert);
}));

// POST /alerts
router.post("/", asyncHandler(async (req, res) => {
  const { name, sensorId, condition, threshold } = req.body;
  if (!name || !sensorId || !condition || threshold === undefined) {
    return res.status(400).json({
      error: "name, sensorId, condition, and threshold are required",
    });
  }
  const validConditions = Object.values(ALERT_CONDITIONS);
  if (!validConditions.includes(condition)) {
    return res.status(400).json({
      error: `Invalid condition. Valid: ${validConditions.join(", ")}`,
    });
  }
  const alert = await createAlert(req.body);
  res.status(201).json(alert);
}));

// PUT /alerts/:id
router.put("/:id", asyncHandler(async (req, res) => {
  const alert = await updateAlert(req.params.id, req.body);
  if (!alert) return res.status(404).json({ error: "Alert not found" });
  res.json(alert);
}));

// DELETE /alerts/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const deleted = await deleteAlert(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Alert not found" });
  res.json({ deleted: true });
}));

export default router;
