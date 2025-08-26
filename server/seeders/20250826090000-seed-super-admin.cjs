"use strict";
const { randomUUID } = require("node:crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config();

module.exports = {
  async up(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    const raw   = process.env.ADMIN_PASSWORD;

    if (!email || !raw) {
      console.log("⚠️ ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping SuperAdmin seed");
      return;
    }

    // idempotent: якщо вже є — пропускаємо
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id FROM `Users` WHERE `email` = ? LIMIT 1",
      { replacements: [email] }
    );
    if (rows && rows.length) {
      console.log(`ℹ️ Super admin already exists: ${email}`);
      return;
    }

    const now  = new Date();
    const hash = await bcrypt.hash(raw, 10);

    await queryInterface.bulkInsert("Users", [{
      id: randomUUID(),
      email,
      password: hash,
      fullName: "Super Admin",
      role: "admin",
      isSuperAdmin: true,
      isEmailVerified: true,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    }], {});
  },

  async down(queryInterface) {
    const email = process.env.ADMIN_EMAIL;
    if (!email) return;
    await queryInterface.bulkDelete("Users", { email }, {});
  }
};
