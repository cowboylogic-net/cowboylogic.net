import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { errorHandler } from "../middleware/errorMiddleware.js";

process.env.MEDIA_PROVIDER = "cloudinary";

const {
  uploadAvatarFile,
  validateDecodedImage,
  cleanupTempUploadOnError,
} = await import("../middleware/uploadMiddleware.js");

const createTestServer = async () => {
  const app = express();

  app.patch("/avatar", uploadAvatarFile, validateDecodedImage, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use(cleanupTempUploadOnError);
  app.use(errorHandler);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return { baseUrl, close: () => new Promise((resolve) => server.close(resolve)) };
};

test("avatar route returns UPLOAD_MISSING_FILE when file is absent", async () => {
  const srv = await createTestServer();
  try {
    const response = await fetch(`${srv.baseUrl}/avatar`, { method: "PATCH" });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.code, "UPLOAD_MISSING_FILE");
  } finally {
    await srv.close();
  }
});

test("avatar route returns FILE_TOO_LARGE for payloads over 3MB", async () => {
  const srv = await createTestServer();
  try {
    const form = new FormData();
    const huge = new Uint8Array(3 * 1024 * 1024 + 100);
    form.append("avatar", new Blob([huge], { type: "image/png" }), "huge.png");

    const response = await fetch(`${srv.baseUrl}/avatar`, {
      method: "PATCH",
      body: form,
    });
    const payload = await response.json();

    assert.equal(response.status, 413);
    assert.equal(payload.code, "FILE_TOO_LARGE");
  } finally {
    await srv.close();
  }
});
