// ─── Configuration ──────────────────────────────────────────

const CONFIG = {
  GAUGE_SERVICE_PORT:
    parseInt(process.env.GAUGE_SERVICE_PORT, 10),
  MONGODB_URI: process.env.MONGO_URI,
  TOOLS_SERVICE_URL: process.env.TOOLS_SERVICE_URL,
};

export default CONFIG;
