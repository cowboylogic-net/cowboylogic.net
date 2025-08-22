
import Sequelize from "sequelize";
import { sequelize } from "../config/db.js";

// Імпортуємо моделі
import User from "./User.js";
import PartnerProfile from "./PartnerProfile.js";
import LoginCode from "./LoginCode.js";

// Ініціалізація об'єкта db
const db = {
  sequelize,
  Sequelize,
  User,
  PartnerProfile,
  LoginCode,
};

// 🔁 Встановлюємо асоціації лише після того, як всі моделі додані в db
if (User.associate) {
  User.associate(db);
}
if (PartnerProfile.associate) {
  PartnerProfile.associate(db);
}
// LoginCode не має асоціацій

export default db;
