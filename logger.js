// ─────────────────────────────────────────────────────────────
// Re-export shared logger, scoped to this service.
// ─────────────────────────────────────────────────────────────

import { createLogger } from "@rodrigo-barraza/utilities-library/node";

const logger = createLogger("gauge");

export default logger;
