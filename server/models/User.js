import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("user", "partner", "admin", "superAdmin"),
      allowNull: false,
      defaultValue: "user",
    },

    newsletter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    heardAboutUs: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    avatarURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    tokenVersion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },

    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    gdprConsentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
    ],
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
  }
);

// Association (must be called in setupAssociations)
User.associate = (models) => {
  User.hasOne(models.PartnerProfile, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "partnerProfile",
  });
};

export default User;
