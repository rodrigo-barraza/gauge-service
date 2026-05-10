// ─── Dashboard Routes ───────────────────────────────────────

import { Router } from "express";
import {
  getDashboardSummary,
  getSensorOverview,
} from "../services/DashboardService.js";

const router = Router();

// GET /dashboard/summary
router.get("/summary", async (_req, res) => {
  const summary = await getDashboardSummary();
  res.json(summary);
});

// GET /dashboard/sensors
router.get("/sensors", async (_req, res) => {
  const overview = await getSensorOverview();
  res.json({ sensors: overview, count: overview.length });
});

export default router;
