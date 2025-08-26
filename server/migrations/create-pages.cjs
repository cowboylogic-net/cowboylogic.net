"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Pages", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      content: { type: Sequelize.TEXT("long"), allowNull: true },
      draftContent: { type: Sequelize.TEXT("long"), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Pages");
  },
};
