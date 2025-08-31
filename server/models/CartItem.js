import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import Book from "./Book.js";

// models/CartItem.js
const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    // ⬇️ INSERT (необов'язково, але бажано явно оголосити FK поля)
    userId: { type: DataTypes.UUID, allowNull: false }, // ← INSERT
    bookId: { type: DataTypes.UUID, allowNull: false }, // ← INSERT
  },
  {
    // ⬇️ INSERT: композитний унікальний індекс
    indexes: [
      { unique: true, fields: ["userId", "bookId"] }, // ← INSERT
    ],
  }
);

// Зв'язки
User.hasMany(CartItem, { foreignKey: "userId", onDelete: "CASCADE" });
CartItem.belongsTo(User, { foreignKey: "userId" });

Book.hasMany(CartItem, { foreignKey: "bookId", onDelete: "CASCADE" });
CartItem.belongsTo(Book, { foreignKey: "bookId" });

export default CartItem;
