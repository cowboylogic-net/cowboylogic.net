"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) format
    await queryInterface.addColumn("Books", "format", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "PAPERBACK",
      comment:
        "PAPERBACK | EBOOK_EPUB | KINDLE_AMAZON | AUDIOBOOK",
    });

    // 2) displayOrder
    await queryInterface.addColumn("Books", "displayOrder", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Lower numbers appear earlier in listings",
    });

    // 3) amazonUrl
    await queryInterface.addColumn("Books", "amazonUrl", {
      type: Sequelize.STRING(2048),
      allowNull: true,
      comment: "External Amazon URL for Kindle editions",
    });

    // 4) downloadUrl
    await queryInterface.addColumn("Books", "downloadUrl", {
      type: Sequelize.STRING(2048),
      allowNull: true,
      comment: "Download URL for EPUB / Audiobook",
    });
  },

  async down(queryInterface, Sequelize) {
    // відкочуємо у зворотному порядку
    await queryInterface.removeColumn("Books", "downloadUrl");
    await queryInterface.removeColumn("Books", "amazonUrl");
    await queryInterface.removeColumn("Books", "displayOrder");
    await queryInterface.removeColumn("Books", "format");
  },
};
