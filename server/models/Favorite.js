// ✅ Додай ці імпорти
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Book from "./Book.js";
import User from "./User.js";

// ✅ Створення моделі
const Favorite = sequelize.define("Favorite", {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  bookId: {
    type: DataTypes.UUID, // ✅ обов'язково, бо Book.id — UUID
    allowNull: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId'],
    },
  ],
});

Favorite.belongsTo(Book, { foreignKey: "bookId", onDelete: "CASCADE" });
Favorite.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

export default Favorite;

