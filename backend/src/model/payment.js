import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";

export const payment = sequelize.define(
  "payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    razorpay_order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    razorpay_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    razorpay_signature: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    coupon_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "INR",
    },

    status: {
      type: DataTypes.ENUM("created", "paid", "failed"),
      allowNull: false,
      defaultValue: "created",
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);
