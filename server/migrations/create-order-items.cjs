"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderItems", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },

      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Orders", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      bookId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Books", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      pricingType: { type: Sequelize.ENUM("standard", "partner"), allowNull: false, defaultValue: "standard" },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OrderItems");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS `enum_OrderItems_pricingType`;");
  },
};
