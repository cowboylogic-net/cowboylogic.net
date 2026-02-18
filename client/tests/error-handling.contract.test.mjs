import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  normalizeApiError,
  mapApiErrorToUi,
  formatUiErrorMessage,
} from "../src/utils/apiError.js";
import { getUiErrorMessage } from "../src/utils/uiErrorMessage.js";
import { showError } from "../src/store/thunks/notificationThunks.js";

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

test("normalizeApiError handles axios-like error with response payload", () => {
  const error = {
    response: {
      status: 422,
      data: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { fieldErrors: { email: "Email is required" } },
        requestId: "req-422-1",
      },
      headers: {},
    },
  };

  const normalized = normalizeApiError(error);
  assert.equal(normalized.status, 422);
  assert.equal(normalized.code, "VALIDATION_ERROR");
  assert.equal(normalized.message, "Validation failed");
  assert.equal(normalized.requestId, "req-422-1");
  assert.deepEqual(normalized.details, {
    fieldErrors: { email: "Email is required" },
  });
});

test("normalizeApiError masks 500 message", () => {
  const error = {
    response: {
      status: 500,
      data: {
        code: "INTERNAL_ERROR",
        message: "Raw backend failure details",
      },
      headers: {},
    },
  };

  const normalized = normalizeApiError(error);
  assert.equal(normalized.status, 500);
  assert.equal(normalized.message, GENERIC_ERROR_MESSAGE);
});

test("normalizeApiError maps network errors", () => {
  const normalized = normalizeApiError({ request: {} });
  assert.equal(normalized.code, "NETWORK_ERROR");
  assert.equal(
    normalized.message,
    "Network error. Please check your connection and try again.",
  );
  assert.equal(normalized.status, null);
});

test("unexpected errors never leak raw message in UI mapping", () => {
  const normalized = normalizeApiError(new Error("boom"));
  const uiError = mapApiErrorToUi(normalized);
  assert.equal(normalized.code, "UNEXPECTED_ERROR");
  assert.equal(uiError.message, GENERIC_ERROR_MESSAGE);
});

test("mapApiErrorToUi returns fieldErrors for validation details", () => {
  const uiError = mapApiErrorToUi(
    normalizeApiError({
      response: {
        status: 422,
        data: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: {
            errors: [{ field: "code", message: "Code must be 6 digits" }],
          },
        },
        headers: {},
      },
    }),
  );

  assert.equal(uiError.title, "Please check your input");
  assert.deepEqual(uiError.fieldErrors, { code: "Code must be 6 digits" });
});

test("mapApiErrorToUi handles 401 and 403 auth states", () => {
  const unauthorized = mapApiErrorToUi(
    normalizeApiError({
      response: {
        status: 401,
        data: { code: "AUTH_REQUIRED", message: "No auth" },
        headers: {},
      },
    }),
  );
  const forbidden = mapApiErrorToUi(
    normalizeApiError({
      response: {
        status: 403,
        data: { code: "AUTH_FORBIDDEN", message: "Forbidden" },
        headers: {},
      },
    }),
  );

  assert.equal(unauthorized.title, "Authentication required");
  assert.equal(forbidden.title, "Access denied");
});

test("formatUiErrorMessage appends request id only when available", () => {
  assert.equal(
    formatUiErrorMessage({ message: "Failure", requestId: "req-1" }),
    "Failure (Request ID: req-1)",
  );
  assert.equal(formatUiErrorMessage({ message: "Failure" }), "Failure");
});

test("getUiErrorMessage formats normalized error and requestId", () => {
  const message = getUiErrorMessage({
    response: {
      status: 400,
      data: {
        code: "BAD_REQUEST",
        message: "Invalid payload",
        requestId: "req-400-1",
      },
      headers: {},
    },
  });
  assert.equal(message, "Invalid payload (Request ID: req-400-1)");
});

test("getUiErrorMessage uses fallback for nullish input", () => {
  const message = getUiErrorMessage(null, "Fallback error");
  assert.equal(message, "Fallback error");
});

test("showError accepts error object and dispatches string notification message", () => {
  const dispatched = [];
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = () => 0;

  try {
    const thunk = showError(
      {
        response: {
          status: 404,
          data: {
            code: "NOT_FOUND",
            message: "Resource missing",
            requestId: "req-404-1",
          },
          headers: {},
        },
      },
      "Fallback",
    );
    thunk((action) => dispatched.push(action));
  } finally {
    global.setTimeout = originalSetTimeout;
  }

  assert.ok(dispatched.length >= 1);
  assert.equal(dispatched[0].type, "notification/showNotification");
  assert.equal(typeof dispatched[0].payload.message, "string");
  assert.equal(
    dispatched[0].payload.message,
    "Resource missing (Request ID: req-404-1)",
  );
});

test("axios module keeps getUiErrorMessage export contract", () => {
  const source = fs.readFileSync(
    new URL("../src/store/axios.js", import.meta.url),
    "utf8",
  );
  assert.match(source, /export\s+\{\s*getUiErrorMessage\s*\};/);
});
