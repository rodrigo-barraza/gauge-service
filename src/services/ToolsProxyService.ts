// ─── ToolsProxyService ──────────────────────────────────────

import { errorMessage } from "@rodrigo-barraza/utilities-library";
import { ApiError, createApiClient } from "@rodrigo-barraza/utilities-library/http";
import CONFIG from "../config.ts";
import logger from "../logger.ts";

const toolsClient = createApiClient(CONFIG.TOOLS_SERVICE_URL ?? "", {
  headers: { "Content-Type": "application/json" },
  timeoutMilliseconds: 10_000,
});

async function fetchFromTools(path: string) {
  try {
    return await toolsClient.get(path);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      logger.warn(`Tools-service ${path} returned ${error.status}`);
      return { error: `Upstream returned ${error.status}`, status: error.status };
    }
    logger.error(`Tools-service ${path} failed: ${errorMessage(error)}`);
    return { error: errorMessage(error) };
  }
}

// ── Weather ───────────────────────────────────────────────────

export async function getCurrentWeather() {
  return fetchFromTools("/weather/weather/current");
}

export async function getWeatherForecast() {
  return fetchFromTools("/weather/weather/forecast");
}

export async function getAirQuality() {
  return fetchFromTools("/weather/weather/air");
}

export async function getDaylight() {
  return fetchFromTools("/weather/weather/daylight");
}

export async function getFullWeather() {
  return fetchFromTools("/weather/weather");
}

// ── Environment Sources ───────────────────────────────────────

export async function getEnvironmentData(source: string) {
  return fetchFromTools(`/weather/environment?source=${source}`);
}

// ── Live Weather (any location) ───────────────────────────────

export async function getLiveWeather(location: string, units: string = "metric") {
  return fetchFromTools(
    `/weather/live?location=${encodeURIComponent(location)}&units=${units}`,
  );
}

// ── Space Weather ─────────────────────────────────────────────

export async function getSpaceWeather() {
  return fetchFromTools("/weather/space-weather");
}

export async function getKpIndex() {
  return fetchFromTools("/weather/kp/current");
}

// ── Earthquakes ───────────────────────────────────────────────

export async function getEarthquakes() {
  return fetchFromTools("/weather/earthquakes");
}

// ── ISS ───────────────────────────────────────────────────────

export async function getIssPosition() {
  return fetchFromTools("/weather/iss");
}

// ── Pollen ────────────────────────────────────────────────────

export async function getPollen() {
  return fetchFromTools("/weather/pollen/today");
}

// ── Launches ──────────────────────────────────────────────────

export async function getNextLaunch() {
  return fetchFromTools("/weather/launches/next");
}

// ── Aggregated Environment Dashboard ──────────────────────────

export async function getEnvironmentDashboard() {
  const [weather, airQuality, daylight, spaceWeather, kpIndex, pollen] =
    await Promise.all([
      getCurrentWeather(),
      getAirQuality(),
      getDaylight(),
      getSpaceWeather(),
      getKpIndex(),
      getPollen(),
    ]);

  return {
    weather,
    airQuality,
    daylight,
    spaceWeather,
    kpIndex,
    kp: kpIndex,
    pollen,
    timestamp: new Date(),
  };
}
