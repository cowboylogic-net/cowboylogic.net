"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      totalPrice: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      status: { type: Sequelize.ENUM("pending", "completed"), defaultValue: "pending" },
      squarePaymentId: { type: Sequelize.STRING, allowNull: true, unique: true },
      squareOrderId: { type: Sequelize.STRING, allowNull: true, unique: true },
      shippingName: { type: Sequelize.STRING, allowNull: true },
      shippingPhone: { type: Sequelize.STRING, allowNull: true },
      shippingAddressJson: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS `enum_Orders_status`;");
  },
};
