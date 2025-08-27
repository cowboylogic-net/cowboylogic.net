"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LoginCodes", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING(254), allowNull: false },
      code: { type: Sequelize.STRING(6), allowNull: false },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });

    // 🔹 Єдиний неунікальний індекс для швидкого прибирання протермінованих кодів
    await queryInterface.addIndex("LoginCodes", ["expiresAt"], {
      name: "idx_login_codes_expires_at_001",
    });

    // 🔹 Композитний унікальний індекс (покриває пошук по email)
    await queryInterface.addConstraint("LoginCodes", {
      type: "unique",
      fields: ["email", "code"],
      name: "uniq_login_codes_email_code_001",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("LoginCodes");
  },
};
