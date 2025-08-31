"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: true },
      fullName: { type: Sequelize.STRING, allowNull: false },
      phoneNumber: { type: Sequelize.STRING, allowNull: true },
      role: {
        type: Sequelize.ENUM("user", "partner", "admin", "superAdmin"),
        allowNull: false,
        defaultValue: "user",
      },
      newsletter: { type: Sequelize.BOOLEAN, defaultValue: false },
      heardAboutUs: { type: Sequelize.STRING, allowNull: true },
      isEmailVerified: { type: Sequelize.BOOLEAN, defaultValue: false },
      avatarURL: { type: Sequelize.STRING, allowNull: true },
      tokenVersion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isSuperAdmin: { type: Sequelize.BOOLEAN, defaultValue: false },
      gdprConsentAt: { type: Sequelize.DATE, allowNull: true },
      lastLoginAt: { type: Sequelize.DATE, allowNull: true },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS `enum_Users_role`;"
    );
  },
};
