// ─── ToolsProxyService ──────────────────────────────────────

import CONFIG from "../config.js";
import logger from "../logger.js";

const BASE_URL = CONFIG.TOOLS_SERVICE_URL;

async function fetchFromTools(path) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      logger.warn(`Tools-service ${path} returned ${res.status}`);
      return { error: `Upstream returned ${res.status}`, status: res.status };
    }
    return await res.json();
  } catch (error) {
    logger.error(`Tools-service ${path} failed: ${error.message}`);
    return { error: error.message };
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

export async function getEnvironmentData(source) {
  return fetchFromTools(`/weather/environment?source=${source}`);
}

// ── Live Weather (any location) ───────────────────────────────

export async function getLiveWeather(location, units = "metric") {
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
  const [weather, airQuality, daylight, spaceWeather, kp, pollen] =
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
    kp,
    pollen,
    timestamp: new Date(),
  };
}
