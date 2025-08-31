// seeds/seedSuperAdmin.js
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sequelize } from "../config/db.js";
import dotenv from "dotenv";

dotenv.config(); // підтягує ADMIN_EMAIL і ADMIN_PASSWORD

export const seedSuperAdmin = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // не force!

    const email = process.env.ADMIN_EMAIL;
    const rawPassword = process.env.ADMIN_PASSWORD;

    if (!email || !rawPassword) {
      console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
      return;
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      console.log("✅ Super admin already exists:", email);
      return;
    }

    const password = await bcrypt.hash(rawPassword, 10);

    await User.create({
      email,
      password,
      role: "admin",
      isSuperAdmin: true,
      isEmailVerified: true,
      fullName: "Super Admin", // ✅ додати
    });

    console.log(`🎉 Super admin created: ${email} / (password from .env)`);
  } catch (err) {
    console.error("❌ Failed to seed super admin:", err.message);
  }
};
