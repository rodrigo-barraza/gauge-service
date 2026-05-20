// ─── Utilities ──────────────────────────────────────────────

import { ObjectId } from "mongodb";
export { parseIntParam } from "@rodrigo-barraza/utilities-library";

/**
 * Safely convert a string to a MongoDB ObjectId.
 * Returns null if the string is not a valid ObjectId.
 */
export function toObjectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

/**
 * Build a time-range filter for MongoDB queries.
 */
export function buildTimeRangeFilter(field: string, from: string | undefined, to: string | undefined): Record<string, unknown> {
  const filter: Record<string, Date> = {};
  if (from) filter.$gte = new Date(from);
  if (to) filter.$lte = new Date(to);
  return Object.keys(filter).length ? { [field]: filter } : {};
}


