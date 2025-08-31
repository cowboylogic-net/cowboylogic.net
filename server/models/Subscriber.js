import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Subscriber = sequelize.define("Subscriber", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
});

export default Subscriber;