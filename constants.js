// ─── Constants ──────────────────────────────────────────────

// ── Sensor Types ──────────────────────────────────────────────

export const SENSOR_TYPES = {
  TEMPERATURE: "temperature",
  HUMIDITY: "humidity",
  PRESSURE: "pressure",
  AIR_QUALITY: "air_quality",
  LIGHT: "light",
  MOTION: "motion",
  WIND_SPEED: "wind_speed",
  RAINFALL: "rainfall",
  UV_INDEX: "uv_index",
  NOISE: "noise",
  CO2: "co2",
  PM25: "pm25",
  CUSTOM: "custom",
};

export const SENSOR_TYPE_LIST = Object.values(SENSOR_TYPES);

// ── Units ─────────────────────────────────────────────────────

export const UNIT_MAP = {
  [SENSOR_TYPES.TEMPERATURE]: "°C",
  [SENSOR_TYPES.HUMIDITY]: "%",
  [SENSOR_TYPES.PRESSURE]: "hPa",
  [SENSOR_TYPES.AIR_QUALITY]: "AQI",
  [SENSOR_TYPES.LIGHT]: "lux",
  [SENSOR_TYPES.MOTION]: "events",
  [SENSOR_TYPES.WIND_SPEED]: "km/h",
  [SENSOR_TYPES.RAINFALL]: "mm",
  [SENSOR_TYPES.UV_INDEX]: "UV",
  [SENSOR_TYPES.NOISE]: "dB",
  [SENSOR_TYPES.CO2]: "ppm",
  [SENSOR_TYPES.PM25]: "µg/m³",
  [SENSOR_TYPES.CUSTOM]: "",
};

// ── Sensor Status ─────────────────────────────────────────────

export const SENSOR_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  WARNING: "warning",
  ERROR: "error",
};

// ── Alert Conditions ──────────────────────────────────────────

export const ALERT_CONDITIONS = {
  ABOVE: "above",
  BELOW: "below",
  EQUALS: "equals",
  OUTSIDE_RANGE: "outside_range",
};

export const ALERT_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  CRITICAL: "critical",
};

// ── Collection Names ──────────────────────────────────────────

export const COLLECTIONS = {
  SENSORS: "sensors",
  READINGS: "readings",
  ALERTS: "alerts",
  ALERT_HISTORY: "alert_history",
};

// ── Reading Retention ─────────────────────────────────────────

export const DEFAULT_READING_RETENTION_DAYS = 90;

// ── Tools-Service Weather Sources ─────────────────────────────

export const WEATHER_SOURCES = [
  "current_weather",
  "air_quality",
  "earthquakes",
  "solar_activity",
  "aurora",
  "twilight",
  "tides",
  "wildfires",
  "iss",
  "neo",
  "solar_wind",
  "pollen",
  "apod",
  "launches",
  "warnings",
  "air_quality_google",
];
