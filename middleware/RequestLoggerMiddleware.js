// ─────────────────────────────────────────────────────────────
// Re-export shared request logger middleware from utilities library.
// ─────────────────────────────────────────────────────────────

import { createRequestLoggerMiddleware } from "@rodrigo-barraza/utilities-library/express";
import logger from "../logger.js";

export const requestLoggerMiddleware = createRequestLoggerMiddleware(logger);
