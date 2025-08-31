// models/Page.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Page = sequelize.define("Page", {
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  draftContent: {
    type: DataTypes.TEXT("long"), // нове поле для чернетки
    allowNull: true,
  },
});

export default Page;
