// ─── Utilities ──────────────────────────────────────────────

import { ObjectId } from "mongodb";

/**
 * Safely convert a string to a MongoDB ObjectId.
 * Returns null if the string is not a valid ObjectId.
 */
export function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Build a time-range filter for MongoDB queries.
 */
export function buildTimeRangeFilter(field, from, to) {
  const filter = {};
  if (from) filter.$gte = new Date(from);
  if (to) filter.$lte = new Date(to);
  return Object.keys(filter).length ? { [field]: filter } : {};
}

/**
 * Parse a numeric query param with a default fallback.
 */
export function parseIntParam(value, defaultValue) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}
