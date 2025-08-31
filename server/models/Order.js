// models/Order.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2), // зберігаємо "12.34"
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed"),
    defaultValue: "pending",
  },
  squarePaymentId: { type: DataTypes.STRING, unique: true },
  squareOrderId:   { type: DataTypes.STRING, unique: true },

  // 👇 нові поля для доставки
  shippingName:        { type: DataTypes.STRING, allowNull: true },
  shippingPhone:       { type: DataTypes.STRING, allowNull: true },
  shippingAddressJson: { type: DataTypes.TEXT,   allowNull: true }, // JSON.stringify(address)
});

User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "userId" });

export default Order;
