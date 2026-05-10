// ─── Weather Proxy Routes ───────────────────────────────────

import { Router } from "express";
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
} from "../services/ToolsProxyService.js";
import { WEATHER_SOURCES } from "../constants.js";

const router = Router();

// ── Weather ───────────────────────────────────────────────────

router.get("/current", async (_req, res) => {
  res.json(await getCurrentWeather());
});

router.get("/forecast", async (_req, res) => {
  res.json(await getWeatherForecast());
});

router.get("/air", async (_req, res) => {
  res.json(await getAirQuality());
});

router.get("/daylight", async (_req, res) => {
  res.json(await getDaylight());
});

router.get("/full", async (_req, res) => {
  res.json(await getFullWeather());
});

// ── Environment ───────────────────────────────────────────────

router.get("/environment", async (req, res) => {
  const { source } = req.query;
  if (!source) {
    return res.status(400).json({
      error: "source query parameter is required",
      availableSources: WEATHER_SOURCES,
    });
  }
  res.json(await getEnvironmentData(source));
});

router.get("/environment/dashboard", async (_req, res) => {
  res.json(await getEnvironmentDashboard());
});

// ── Live Weather ──────────────────────────────────────────────

router.get("/live", async (req, res) => {
  const { location, units } = req.query;
  if (!location) {
    return res.status(400).json({
      error: "location query parameter is required",
      example: "/weather/live?location=Vancouver",
    });
  }
  res.json(await getLiveWeather(location, units));
});

// ── Space Weather ─────────────────────────────────────────────

router.get("/space", async (_req, res) => {
  res.json(await getSpaceWeather());
});

router.get("/kp", async (_req, res) => {
  res.json(await getKpIndex());
});

// ── Other ─────────────────────────────────────────────────────

router.get("/earthquakes", async (_req, res) => {
  res.json(await getEarthquakes());
});

router.get("/iss", async (_req, res) => {
  res.json(await getIssPosition());
});

router.get("/pollen", async (_req, res) => {
  res.json(await getPollen());
});

router.get("/launches/next", async (_req, res) => {
  res.json(await getNextLaunch());
});

export default router;
