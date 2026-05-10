// ─────────────────────────────────────────────────────────────
// Re-export shared MongoDB singleton from utilities library.
// ─────────────────────────────────────────────────────────────

export { connectDB, getDB, setDBForTesting, setDBForTesting as setDB } from "@rodrigo-barraza/utilities-library/mongo";
