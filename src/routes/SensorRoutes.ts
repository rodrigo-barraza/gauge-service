import { asyncHandler } from "@rodrigo-barraza/utilities-library/express";
// ─── Sensor Routes ──────────────────────────────────────────

import { Router, Request, Response } from "express";
import {
  listSensors,
  getSensor,
  createSensor,
  updateSensor,
  deleteSensor,
} from "../services/SensorService.ts";
import { SENSOR_TYPE_LIST } from "../constants.ts";

const router = Router();

// GET /sensors
router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const { type, status, location } = req.query as Record<string, string>;
  const result = await listSensors({ type, status, location });
  res.json(result);
}));

// GET /sensors/:id
router.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const sensor = await getSensor(String(req.params.id));
  if (!sensor) return res.status(404).json({ error: true, message: "Sensor not found", statusCode: 404 });
  res.json(sensor);
}));

// POST /sensors
router.post("/", asyncHandler(async (req: Request, res: Response) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: true, message: "name and type are required", statusCode: 400 });
  }
  if (!SENSOR_TYPE_LIST.includes(type)) {
    return res.status(400).json({
      error: true, message: `Invalid sensor type. Valid types: ${SENSOR_TYPE_LIST.join(", ")}`, statusCode: 400,
    });
  }
  const sensor = await createSensor(req.body);
  res.status(201).json(sensor);
}));

// PUT /sensors/:id
router.put("/:id", asyncHandler(async (req: Request, res: Response) => {
  const sensor = await updateSensor(String(req.params.id), req.body);
  if (!sensor) return res.status(404).json({ error: true, message: "Sensor not found", statusCode: 404 });
  res.json(sensor);
}));

// DELETE /sensors/:id
router.delete("/:id", asyncHandler(async (req: Request, res: Response) => {
  const deleted = await deleteSensor(String(req.params.id));
  if (!deleted) return res.status(404).json({ error: true, message: "Sensor not found", statusCode: 404 });
  res.json({ success: true, message: "Sensor deleted" });
}));

export default router;
