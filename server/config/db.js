// server/config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 3306,
    dialect: "mysql",
    logging: false, // можна true для дебагу
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected via Sequelize");
  } catch (error) {
    console.error("❌ Unable to connect to DB:", error);
    process.exit(1);
  }
};

export default connectDB;
