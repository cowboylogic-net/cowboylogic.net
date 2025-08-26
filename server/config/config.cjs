// server/config/config.cjs
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
// fallback на .env у корені репо, якщо треба
if (!process.env.DATABASE_HOST) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });
}

const username = process.env.DATABASE_USERNAME || process.env.DB_USER;
const password = process.env.DATABASE_PASSWORD || process.env.DB_PASS;
const database = process.env.DATABASE_NAME     || process.env.DB_NAME;
const host     = process.env.DATABASE_HOST     || process.env.DB_HOST;
const port     = Number(process.env.DATABASE_PORT || process.env.DB_PORT || 3306);

const base = {
  username, password, database, host, port,
  dialect: "mysql",
  dialectModule: require("mysql2"),
  logging: false,
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 },
  // dialectOptions: { ssl: { require: true, rejectUnauthorized: true, ca: process.env.DB_SSL_CA } },
};

module.exports = {
  development: { ...base },
  test:        { ...base, logging: false },
  production:  { ...base, logging: false },
};
