// server/scripts/test-db.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// дозволяємо вказати свій файл оточення
const envFile =
  process.env.DOTENV_PATH ||
  path.resolve(__dirname, "..", ".env"); // за замовчуванням server/.env

dotenv.config({ path: envFile });

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 3306),
    dialect: "mysql",
    logging: false,
  }
);

try {
  await sequelize.authenticate();
  console.log("✅ Connected OK via", envFile);
  process.exit(0);
} catch (e) {
  console.error("❌ Connection failed:", e?.message || e);
  process.exit(1);
} finally {
  await sequelize.close();
}
