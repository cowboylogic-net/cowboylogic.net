import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import os from "os";
import sharp from "sharp";

process.env.MEDIA_PROVIDER = "cloudinary";

const { validateDecodedImage } = await import("../middleware/uploadMiddleware.js");

const runMiddleware = async (middleware, req) => {
  return new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error || null));
  });
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

test("validateDecodedImage rejects spoofed non-image payload and deletes temp file", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-validate-"));
  const filePath = path.join(dir, "fake.png");
  await fs.writeFile(filePath, "not an image");

  const req = { file: { path: filePath } };
  const error = await runMiddleware(validateDecodedImage, req);

  assert.ok(error);
  assert.equal(error.status, 415);
  assert.equal(error.code, "UNSUPPORTED_MEDIA");
  assert.equal(await fileExists(filePath), false);

  await fs.rm(dir, { recursive: true, force: true });
});

test("validateDecodedImage accepts decoded PNG", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-validate-"));
  const filePath = path.join(dir, "ok.png");

  await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .png()
    .toFile(filePath);

  const req = { file: { path: filePath } };
  const error = await runMiddleware(validateDecodedImage, req);

  assert.equal(error, null);
  assert.equal(await fileExists(filePath), true);

  await fs.rm(dir, { recursive: true, force: true });
});
