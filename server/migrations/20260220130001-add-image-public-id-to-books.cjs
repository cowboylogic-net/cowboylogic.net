"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Books", "imagePublicId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Books", "imagePublicId");
  },
};
