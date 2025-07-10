import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PartnerProfile = sequelize.define(
  "PartnerProfile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "Users",
        key: "id",
      },
    },

    organizationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    businessType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address2: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    billingAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessWebsite: {
  type: DataTypes.STRING,
  allowNull: true,
  validate: {
    isUrl: true,
  },
},

  },
  {
    timestamps: true,
    tableName: "PartnerProfiles", // явна назва для збереження стабільності в продакшн
  }
);

PartnerProfile.associate = (models) => {
  PartnerProfile.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
  });
};

export default PartnerProfile;
