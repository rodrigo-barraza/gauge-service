// ─── Reading Routes ─────────────────────────────────────────

import { Router } from "express";
import {
  ingestReading,
  ingestBulkReadings,
  getReadings,
  getSparklineData,
  getReadingStats,
} from "../services/ReadingService.js";
import { parseIntParam } from "../utilities.js";

const router = Router();

// POST /readings — ingest a single reading
router.post("/", async (req, res) => {
  const { sensorId, value } = req.body;
  if (!sensorId || value === undefined) {
    return res.status(400).json({ error: "sensorId and value are required" });
  }
  const reading = await ingestReading(req.body);
  res.status(201).json(reading);
});

// POST /readings/bulk — ingest multiple readings
router.post("/bulk", async (req, res) => {
  const { readings } = req.body;
  if (!Array.isArray(readings) || readings.length === 0) {
    return res.status(400).json({ error: "readings array is required" });
  }
  const result = await ingestBulkReadings(readings);
  res.status(201).json(result);
});

// GET /readings/:sensorId — query readings for a sensor
router.get("/:sensorId", async (req, res) => {
  const { from, to, limit, sort } = req.query;
  const result = await getReadings(req.params.sensorId, {
    from,
    to,
    limit: parseIntParam(limit, 500),
    sort: sort === "asc" ? 1 : -1,
  });
  res.json(result);
});

// GET /readings/:sensorId/sparkline — downsampled sparkline data
router.get("/:sensorId/sparkline", async (req, res) => {
  const hours = parseIntParam(req.query.hours, 24);
  const points = parseIntParam(req.query.points, 50);
  const data = await getSparklineData(req.params.sensorId, hours, points);
  res.json({ data, count: data.length });
});

// GET /readings/:sensorId/stats — aggregate statistics
router.get("/:sensorId/stats", async (req, res) => {
  const hours = parseIntParam(req.query.hours, 24);
  const stats = await getReadingStats(req.params.sensorId, hours);
  res.json(stats);
});

export default router;
