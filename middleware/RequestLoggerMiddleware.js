import { createRequestLoggerMiddleware } from "@rodrigo-barraza/utilities-library/express";
import logger from "../logger.js";

export const requestLoggerMiddleware = createRequestLoggerMiddleware(logger);
