import { sequelize } from "../database/database.js  ";
import { DataTypes } from "sequelize";

export const order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    total_amount: {
        type: DataTypes.FLOAT
    },

    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },

    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
});