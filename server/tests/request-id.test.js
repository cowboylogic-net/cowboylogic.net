import test from "node:test";
import assert from "node:assert/strict";
import requestId from "../middleware/requestId.js";

test("requestId middleware sets req.requestId and X-Request-Id header", () => {
  const req = {};
  const headers = {};
  const res = {
    setHeader(name, value) {
      headers[name] = value;
    },
  };

  let nextCalled = false;
  requestId(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(typeof req.requestId, "string");
  assert.ok(req.requestId.length > 0);
  assert.equal(headers["X-Request-Id"], req.requestId);
});

