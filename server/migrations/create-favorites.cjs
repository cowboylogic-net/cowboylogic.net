"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Favorites", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
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
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    });

    await queryInterface.addIndex("Favorites", ["userId", "bookId"], { unique: true, name: "uniq_fav_user_book" });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Favorites", "uniq_fav_user_book");
    await queryInterface.dropTable("Favorites");
  },
};
