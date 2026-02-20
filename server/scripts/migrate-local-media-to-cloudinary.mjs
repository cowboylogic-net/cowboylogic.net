import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import { sequelize } from "../config/db.js";
import User from "../models/User.js";
import Book from "../models/Book.js";
import { uploadBasePath } from "../config/imageConfig.js";
import { uploadImageFromPath } from "../services/cloudinary.js";

dotenv.config();

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const deleteLocal = args.has("--delete-local");

const resolveLocalUploadPath = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  let pathname = rawUrl.trim();

  if (/^https?:\/\//i.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname || "";
    } catch {
      return null;
    }
  }

  pathname = pathname.replace(/\\/g, "/");
  if (pathname.startsWith("uploads/")) pathname = `/${pathname}`;
  if (!pathname.startsWith("/uploads/")) return null;

  const relUnderUploads = pathname.replace(/^\/uploads\//, "");
  return path.resolve(uploadBasePath, relUnderUploads);
};

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const migrateUsers = async () => {
  const users = await User.findAll({
    where: sequelize.where(
      sequelize.fn("LOWER", sequelize.col("avatarURL")),
      "LIKE",
      "%/uploads/%",
    ),
  });

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const localPath = resolveLocalUploadPath(user.avatarURL);
    if (!localPath || !(await exists(localPath))) {
      skipped += 1;
      continue;
    }

    const publicId = `cowboylogic/avatars/${user.id}/avatar`;

    if (dryRun) {
      console.log(`[dry-run] user ${user.id} -> ${publicId}`);
      migrated += 1;
      continue;
    }

    const uploadResult = await uploadImageFromPath({
      filePath: localPath,
      publicId,
      overwrite: true,
      invalidate: true,
      kind: "avatar",
      tags: ["resource:avatar", `user:${user.id}`],
    });

    await user.update({
      avatarURL: uploadResult.secureUrl,
      avatarPublicId: uploadResult.publicId,
    });

    if (deleteLocal) {
      await fs.unlink(localPath).catch(() => {});
    }

    migrated += 1;
  }

  return { migrated, skipped, total: users.length };
};

const migrateBooks = async () => {
  const books = await Book.findAll({
    where: sequelize.where(
      sequelize.fn("LOWER", sequelize.col("imageUrl")),
      "LIKE",
      "%/uploads/%",
    ),
  });

  let migrated = 0;
  let skipped = 0;

  for (const book of books) {
    const localPath = resolveLocalUploadPath(book.imageUrl);
    if (!localPath || !(await exists(localPath))) {
      skipped += 1;
      continue;
    }

    const publicId = `cowboylogic/books/${book.id}/cover`;

    if (dryRun) {
      console.log(`[dry-run] book ${book.id} -> ${publicId}`);
      migrated += 1;
      continue;
    }

    const uploadResult = await uploadImageFromPath({
      filePath: localPath,
      publicId,
      overwrite: true,
      invalidate: true,
      kind: "book",
      tags: ["resource:book-cover", `book:${book.id}`],
    });

    await book.update({
      imageUrl: uploadResult.secureUrl,
      imagePublicId: uploadResult.publicId,
    });

    if (deleteLocal) {
      await fs.unlink(localPath).catch(() => {});
    }

    migrated += 1;
  }

  return { migrated, skipped, total: books.length };
};

const run = async () => {
  try {
    await sequelize.authenticate();

    const usersResult = await migrateUsers();
    const booksResult = await migrateBooks();

    console.log("Users:", usersResult);
    console.log("Books:", booksResult);
    console.log(`Mode: ${dryRun ? "dry-run" : "live"}`);
  } catch (error) {
    console.error("Migration failed:", error?.message || error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

run();
