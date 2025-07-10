// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import Sequelize from "sequelize";
// import { sequelize } from "../config/db.js";
// import LoginCode from "./LoginCode.js"; 

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const db = {};


// const modelPromises = fs
//   .readdirSync(__dirname)
//   .filter((file) => {
//     return (
//       file.indexOf(".") !== 0 &&
//       file !== "index.js" &&
//       file.slice(-3) === ".js" &&
//       file.indexOf(".test.js") === -1
//     );
//   })
//   .map((file) =>
//     import(path.join(__dirname, file)).then((module) => {
//       const model = module.default(sequelize, Sequelize.DataTypes);
//       db[model.name] = model;
//     })
//   );

// await Promise.all(modelPromises).then(() => {
//   Object.keys(db).forEach((modelName) => {
//     if (typeof db[modelName].associate === "function") {
//       db[modelName].associate(db);
//     }
//   });
// });

// db.LoginCode = LoginCode;
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// export default db;

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
