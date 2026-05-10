// ============================================================
// Gauge Service — Configuration
// ============================================================
// Typed accessor layer over process.env. The Vault service is
// the single source of truth — boot.js hydrates process.env
// from the Vault before any module imports run.
//
// This file contains NO defaults and NO secrets.
// ============================================================

const CONFIG = {
  GAUGE_SERVICE_PORT:
    parseInt(process.env.GAUGE_SERVICE_PORT, 10),
  MONGODB_URI: process.env.MONGO_URI,
  TOOLS_SERVICE_URL: process.env.TOOLS_SERVICE_URL,
};

export default CONFIG;
