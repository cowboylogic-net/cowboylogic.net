import test from "node:test";
import assert from "node:assert/strict";

process.env.MEDIA_PROVIDER = "cloudinary";
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "demo";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "key";
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "secret";

const { cloudinary } = await import("../config/cloudinary.js");
const { uploadImageFromPath, destroyImage } = await import("../services/cloudinary.js");

const originalUpload = cloudinary.uploader.upload;
const originalDestroy = cloudinary.uploader.destroy;

test.after(() => {
  cloudinary.uploader.upload = originalUpload;
  cloudinary.uploader.destroy = originalDestroy;
});

test("uploadImageFromPath returns secure_url/public_id mapping", async () => {
  cloudinary.uploader.upload = async () => ({
    secure_url: "https://res.cloudinary.com/demo/image/upload/v1/sample.webp",
    public_id: "cowboylogic/books/book-id/cover",
    width: 1200,
    height: 800,
    format: "webp",
  });

  const result = await uploadImageFromPath({
    filePath: "C:/tmp/sample.png",
    publicId: "cowboylogic/books/book-id/cover",
    overwrite: true,
    invalidate: true,
    kind: "book",
    tags: ["resource:book-cover"],
  });

  assert.equal(
    result.secureUrl,
    "https://res.cloudinary.com/demo/image/upload/v1/sample.webp",
  );
  assert.equal(result.publicId, "cowboylogic/books/book-id/cover");
  assert.equal(result.format, "webp");
});

test("uploadImageFromPath maps provider errors to CLOUDINARY_ERROR", async () => {
  cloudinary.uploader.upload = async () => {
    throw new Error("boom");
  };

  await assert.rejects(
    () =>
      uploadImageFromPath({
        filePath: "C:/tmp/sample.png",
        publicId: "cowboylogic/books/book-id/cover",
        overwrite: true,
        invalidate: true,
        kind: "book",
      }),
    (error) => {
      assert.equal(error.status, 502);
      assert.equal(error.code, "CLOUDINARY_ERROR");
      return true;
    },
  );
});

test("destroyImage is best-effort and does not throw", async () => {
  cloudinary.uploader.destroy = async () => {
    throw new Error("cannot destroy");
  };

  await destroyImage("cowboylogic/books/book-id/cover");
  assert.ok(true);
});
