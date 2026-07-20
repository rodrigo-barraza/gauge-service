import { asyncHandler } from "@rodrigo-barraza/utilities-library/express";
// ─── Weather Proxy Routes ───────────────────────────────────

import { Router, type Request, type Response } from "express";
import {
  getCurrentWeather,
  getWeatherForecast,
  getAirQuality,
  getDaylight,
  getFullWeather,
  getEnvironmentData,
  getLiveWeather,
  getSpaceWeather,
  getKpIndex,
  getEarthquakes,
  getIssPosition,
  getPollen,
  getNextLaunch,
  getEnvironmentDashboard,
} from "../services/ToolsProxyService.ts";
import { WEATHER_SOURCES } from "../constants.ts";

const router = Router();

// ── Weather ───────────────────────────────────────────────────

router.get("/current", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getCurrentWeather());
}));

router.get("/forecast", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getWeatherForecast());
}));

router.get("/air", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getAirQuality());
}));

router.get("/daylight", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getDaylight());
}));

router.get("/full", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getFullWeather());
}));

// ── Environment ───────────────────────────────────────────────

router.get("/environment", asyncHandler(async (req: Request, res: Response) => {
  const { source } = req.query as Record<string, string>;
  if (!source) {
    return res.status(400).json({
      error: "source query parameter is required",
      availableSources: WEATHER_SOURCES,
    });
  }
  res.json(await getEnvironmentData(source));
}));

router.get("/environment/dashboard", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getEnvironmentDashboard());
}));

// ── Live Weather ──────────────────────────────────────────────

router.get("/live", asyncHandler(async (req: Request, res: Response) => {
  const { location, units } = req.query as Record<string, string>;
  if (!location) {
    return res.status(400).json({
      error: "location query parameter is required",
      example: "/weather/live?location=Vancouver",
    });
  }
  res.json(await getLiveWeather(location, units));
}));

// ── Space Weather ─────────────────────────────────────────────

router.get("/space", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getSpaceWeather());
}));

router.get("/kp", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getKpIndex());
}));

// ── Other ─────────────────────────────────────────────────────

router.get("/earthquakes", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getEarthquakes());
}));

router.get("/iss", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getIssPosition());
}));

router.get("/pollen", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getPollen());
}));

router.get("/launches/next", asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getNextLaunch());
}));

export default router;
