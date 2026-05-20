import { asyncHandler } from "@rodrigo-barraza/utilities-library/express";
// ─── Dashboard Routes ───────────────────────────────────────

import { Router, Request, Response } from "express";
import {
  getDashboardSummary,
  getSensorOverview,
} from "../services/DashboardService.ts";

const router = Router();

// GET /dashboard/summary
router.get("/summary", asyncHandler(async (_req: Request, res: Response) => {
  const summary = await getDashboardSummary();
  res.json(summary);
}));

// GET /dashboard/sensors
router.get("/sensors", asyncHandler(async (_req: Request, res: Response) => {
  const overview = await getSensorOverview();
  res.json({ sensors: overview, count: overview.length });
}));

export default router;
