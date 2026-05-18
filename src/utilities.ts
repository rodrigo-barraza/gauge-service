// ─── Utilities ──────────────────────────────────────────────

import { ObjectId } from "mongodb";
export { parseIntParam } from "@rodrigo-barraza/utilities-library";

/**
 * Safely convert a string to a MongoDB ObjectId.
 * Returns null if the string is not a valid ObjectId.
 */
export function toObjectId(id: any) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Build a time-range filter for MongoDB queries.
 */
export function buildTimeRangeFilter(field: any, from: any, to: any) {
  const filter: Record<string, any> = {};
  if (from) filter.$gte = new Date(from);
  if (to) filter.$lte = new Date(to);
  return Object.keys(filter).length ? { [field]: filter } : {};
}


