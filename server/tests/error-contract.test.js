import test from "node:test";
import assert from "node:assert/strict";
import HttpError from "../helpers/HttpError.js";
import { errorHandler } from "../middleware/errorMiddleware.js";
import normalizeErrorResponse from "../middleware/normalizeErrorResponse.js";

const createRes = () => ({
  statusCode: 200,
  body: undefined,
  headers: {},
  status(code) {
    this.statusCode = code;
    return this;
  },
  setHeader(name, value) {
    this.headers[name] = value;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  send(payload) {
    this.body = payload;
    return this;
  },
});

test("errorHandler serializes controlled HttpError into contract payload", () => {
  const req = {
    requestId: "req-controlled-1",
    method: "POST",
    originalUrl: "/api/test",
  };
  const res = createRes();
  const err = HttpError(400, "Validation error", {
    code: "payment_input_invalid",
    details: [{ path: ["items"], message: "Bad items", unsafe: "ignored" }],
  });

  errorHandler(err, req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, "PAYMENT_INPUT_INVALID");
  assert.equal(res.body.message, "Validation error");
  assert.equal(res.body.requestId, "req-controlled-1");
  assert.deepEqual(res.body.details, [
    { path: ["items"], message: "Bad items" },
  ]);
});

test("errorHandler normalizes unknown error into contract payload", () => {
  const req = {
    requestId: "req-unknown-1",
    method: "GET",
    originalUrl: "/api/test",
  };
  const res = createRes();
  const err = new Error("Unexpected failure");

  errorHandler(err, req, res, () => {});

  assert.equal(res.statusCode, 500);
  assert.equal(res.body.code, "INTERNAL_ERROR");
  assert.equal(res.body.message, "Internal server error");
  assert.equal(res.body.requestId, "req-unknown-1");
});

test("normalizeErrorResponse rewrites ad-hoc error JSON into contract", () => {
  const req = { requestId: "req-inline-1" };
  const res = createRes();

  normalizeErrorResponse(req, res, () => {});

  res.status(400).json({
    status: "fail",
    code: 400,
    message: "Missing Square signature header",
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    code: "BAD_REQUEST",
    message: "Missing Square signature header",
    requestId: "req-inline-1",
  });
});

test("normalizeErrorResponse rewrites ad-hoc error send object into contract", () => {
  const req = { requestId: "req-send-obj-1" };
  const res = createRes();

  normalizeErrorResponse(req, res, () => {});

  res.status(400).send({
    code: "payment_failed",
    message: "Checkout failed",
    details: [{ path: ["items"], message: "Invalid payload", unsafe: true }],
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    code: "PAYMENT_FAILED",
    message: "Checkout failed",
    details: [{ path: ["items"], message: "Invalid payload" }],
    requestId: "req-send-obj-1",
  });
});

test("normalizeErrorResponse rewrites ad-hoc error send string for 4xx into contract", () => {
  const req = { requestId: "req-send-str-1" };
  const res = createRes();

  normalizeErrorResponse(req, res, () => {});

  res.status(400).send("Invalid request body");

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    code: "BAD_REQUEST",
    message: "Invalid request body",
    requestId: "req-send-str-1",
  });
});

test("normalizeErrorResponse does not expose 5xx send string details", () => {
  const req = { requestId: "req-send-str-500" };
  const res = createRes();

  normalizeErrorResponse(req, res, () => {});

  res.status(500).send("Database timeout");

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    requestId: "req-send-str-500",
  });
});
