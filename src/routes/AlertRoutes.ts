import { asyncHandler } from "@rodrigo-barraza/utilities-library/express";
// ─── Alert Routes ───────────────────────────────────────────

import { Router, Request, Response } from "express";
import {
  listAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertHistory,
} from "../services/AlertService.ts";
import { ALERT_CONDITIONS } from "../constants.ts";

const router = Router();

// GET /alerts
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const { sensorId, active } = req.query as Record<string, string>;
  const result = await listAlerts({ sensorId, active });
  res.json(result);
}));

// GET /alerts/history
router.get("/history", asyncHandler(async (req: Request, res: Response) => {
  const { alertId, sensorId, limit } = req.query as Record<string, string>;
  const result = await getAlertHistory({
    alertId,
    sensorId,
    limit: Math.min(100, limit ? parseInt(limit, 10) : 20),
  });
  res.json(result);
}));

// GET /alerts/:id
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const alert = await getAlert(String(req.params.id));
  if (!alert) return res.status(404).json({ error: true, message: "Alert not found", statusCode: 404 });
  res.json(alert);
}));

// POST /alerts
router.post("/", asyncHandler(async (req: Request, res: Response) => {
  const { name, sensorId, condition, threshold } = req.body;
  if (!name || !sensorId || !condition || threshold === undefined) {
    return res.status(400).json({
      error: true, message: "name, sensorId, condition, and threshold are required", statusCode: 400,
    });
  }
  const validConditions = Object.values(ALERT_CONDITIONS);
  if (!validConditions.includes(condition)) {
    return res.status(400).json({
      error: true, message: `Invalid condition. Valid: ${validConditions.join(", ")}`, statusCode: 400,
    });
  }
  const alert = await createAlert(req.body);
  res.status(201).json(alert);
}));

// PUT /alerts/:id
router.put("/:id", asyncHandler(async (req: Request, res: Response) => {
  const alert = await updateAlert(String(req.params.id), req.body);
  if (!alert) return res.status(404).json({ error: true, message: "Alert not found", statusCode: 404 });
  res.json(alert);
}));

// DELETE /alerts/:id
router.delete("/:id", asyncHandler(async (req: Request, res: Response) => {
  const deleted = await deleteAlert(String(req.params.id));
  if (!deleted) return res.status(404).json({ error: true, message: "Alert not found", statusCode: 404 });
  res.json({ success: true, message: "Alert deleted" });
}));

export default router;
