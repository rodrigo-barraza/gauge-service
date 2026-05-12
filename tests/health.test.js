// ── Health + Auth tests for gauge-service ──
// Uses createService() from service-library — tests the contract shape.

import { describe, it, expect } from "vitest";
import { HealthAggregator } from "@rodrigo-barraza/service-library/health";
import {
  createAuthMiddleware,
  createSecretGuard,
} from "@rodrigo-barraza/service-library/auth";

// ── Helpers ────────────────────────────────────────────────────
function mockReq(overrides = {}) {
  return {
    method: "GET",
    query: {},
    body: {},
    headers: {},
    ip: "127.0.0.1",
    path: "/test",
    ...overrides,
  };
}

function mockRes() {
  const res = {
    _status: null,
    _json: null,
    status(code) { res._status = code; return res; },
    json(data) { res._json = data; return res; },
    sendStatus(code) { res._status = code; return res; },
  };
  return res;
}

// ── Health ─────────────────────────────────────────────────────
describe("Health", () => {
  it("returns ok status with expected shape", async () => {
    const health = new HealthAggregator("gauge-service", 5611);
    const result = await health.getHealth();
    expect(result.status).toBe("ok");
    expect(result.service).toBe("gauge-service");
    expect(result.port).toBe(5611);
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it("handler returns 200 for healthy state", async () => {
    const health = new HealthAggregator("gauge-service", 5611);
    const handler = health.handler();
    let statusCode, json;
    const res = {
      status(c) { statusCode = c; return this; },
      json(d) { json = d; },
    };
    await handler({}, res);
    expect(statusCode).toBe(200);
    expect(json.status).toBe("ok");
  });
});

// ── Auth ───────────────────────────────────────────────────────
describe("Auth", () => {
  it("rejects requests with wrong secret", () => {
    const guard = createSecretGuard("test-secret");
    const req = mockReq({ headers: { "x-api-secret": "wrong" } });
    const res = mockRes();
    guard(req, res, () => {});
    expect(res._status).toBe(401);
  });

  it("allows requests with correct secret", () => {
    const guard = createSecretGuard("test-secret");
    const req = mockReq({ headers: { "x-api-secret": "test-secret" } });
    let called = false;
    guard(req, mockRes(), () => { called = true; });
    expect(called).toBe(true);
  });

  it("bypasses /health endpoint", () => {
    const guard = createSecretGuard("test-secret");
    const req = mockReq({ path: "/health" });
    let called = false;
    guard(req, mockRes(), () => { called = true; });
    expect(called).toBe(true);
  });

  it("resolves project from x-project header", () => {
    const mw = createAuthMiddleware();
    const req = mockReq({ headers: { "x-project": "gauge" } });
    mw(req, mockRes(), () => {});
    expect(req.project).toBe("gauge");
  });
});

// ── Config ─────────────────────────────────────────────────────
describe("Config", () => {
  it("should export valid configuration", async () => {
    const config = await import("../config.js");
    expect(config.default).toBeTruthy();
    expect(config.default).toHaveProperty("GAUGE_SERVICE_PORT");
    expect(config.default).toHaveProperty("MONGODB_URI");
  });
});
