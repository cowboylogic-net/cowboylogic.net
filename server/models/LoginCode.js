import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const LoginCode = sequelize.define(
  "LoginCode",
  {
    email: { type: DataTypes.STRING(254), allowNull: false },
    code: { type: DataTypes.STRING(6), allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    indexes: [
      { fields: ["email"] },
      { unique: true, fields: ["email", "code"] },
      { fields: ["expiresAt"] },
    ],
  }
);

export default LoginCode;
