// ============================================================
// Gauge Service — Sensor Routes
// ============================================================

import { Router } from "express";
import {
  listSensors,
  getSensor,
  createSensor,
  updateSensor,
  deleteSensor,
} from "../services/SensorService.js";
import { SENSOR_TYPE_LIST } from "../constants.js";

const router = Router();

// GET /sensors
router.get("/", async (req, res) => {
  const { type, status, location } = req.query;
  const result = await listSensors({ type, status, location });
  res.json(result);
});

// GET /sensors/:id
router.get("/:id", async (req, res) => {
  const sensor = await getSensor(req.params.id);
  if (!sensor) return res.status(404).json({ error: "Sensor not found" });
  res.json(sensor);
});

// POST /sensors
router.post("/", async (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "name and type are required" });
  }
  if (!SENSOR_TYPE_LIST.includes(type)) {
    return res.status(400).json({
      error: `Invalid sensor type. Valid types: ${SENSOR_TYPE_LIST.join(", ")}`,
    });
  }
  const sensor = await createSensor(req.body);
  res.status(201).json(sensor);
});

// PUT /sensors/:id
router.put("/:id", async (req, res) => {
  const sensor = await updateSensor(req.params.id, req.body);
  if (!sensor) return res.status(404).json({ error: "Sensor not found" });
  res.json(sensor);
});

// DELETE /sensors/:id
router.delete("/:id", async (req, res) => {
  const deleted = await deleteSensor(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Sensor not found" });
  res.json({ deleted: true });
});

export default router;
