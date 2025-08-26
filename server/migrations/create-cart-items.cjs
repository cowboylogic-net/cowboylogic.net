"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CartItems", {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
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
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
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

    await queryInterface.addIndex("CartItems", ["userId", "bookId"], {
      unique: true,
      name: "uniq_user_book",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("CartItems", "uniq_user_book");
    await queryInterface.dropTable("CartItems");
  },
};
