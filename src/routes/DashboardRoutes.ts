import { asyncHandler } from "@rodrigo-barraza/utilities-library/express";
// ─── Dashboard Routes ───────────────────────────────────────

import { Router } from "express";
import {
  getDashboardSummary,
  getSensorOverview,
} from "../services/DashboardService.js";

const router = Router();

// GET /dashboard/summary
router.get("/summary", asyncHandler(async (_req: any, res: any) => {
  const summary = await getDashboardSummary();
  res.json(summary);
}));

// GET /dashboard/sensors
router.get("/sensors", asyncHandler(async (_req: any, res: any) => {
  const overview = await getSensorOverview();
  res.json({ sensors: overview, count: overview.length });
}));

export default router;
