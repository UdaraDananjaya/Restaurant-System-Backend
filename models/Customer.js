const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: true,
    },
    // Only used when gender === 'Other'
    gender_other_text: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    dietary_preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    favorite_cuisine: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    order_history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "customers",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Customer;
