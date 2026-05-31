// ─── Configuration ──────────────────────────────────────────

const CONFIG = {
  GAUGE_SERVICE_PORT: parseInt(process.env.GAUGE_SERVICE_PORT as string, 10),
  MONGODB_URI: process.env.MONGO_URI as string,
  MONGODB_DB_NAME: process.env.GAUGE_SERVICE_MONGO_DB_NAME as string || "gauge",
  TOOLS_SERVICE_URL: process.env.TOOLS_SERVICE_URL,
};

export default CONFIG;
