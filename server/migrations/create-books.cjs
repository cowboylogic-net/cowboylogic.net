"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Books", {
      // Було: defaultValue: Sequelize.literal("(UUID())"),
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },

      title: { type: Sequelize.STRING, allowNull: false },
      author: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      partnerPrice: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      isWholesaleAvailable: { type: Sequelize.BOOLEAN, defaultValue: false },
      imageUrl: { type: Sequelize.STRING, allowNull: true },
      inStock: { type: Sequelize.BOOLEAN, defaultValue: true },
      stock: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Books");
  },
};
