// server/models/Book.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    partnerPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    format: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PAPERBACK",
      comment: "PAPERBACK | HARDCOVER | EBOOK_EPUB | KINDLE_AMAZON | AUDIOBOOK",
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Lower numbers appear earlier in listings",
    },
    amazonUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "External Amazon URL for Kindle editions",
    },
    downloadUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Download URL for EPUB / Audiobook",
    },

    isWholesaleAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
    },
    imagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inStock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default Book;
