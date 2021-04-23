import { DataTypes, Model } from "sequelize";
import db from '../database';

export class Garden extends Model {
    id: string;
    userId: string;
    plantName: string;
    categoryId: string;
    description: string;
    image: string;
    ownedSince: string;
    quantity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

Garden.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    plantName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
    },
    image: {
        type: DataTypes.STRING,
    },
    ownedSince: {
        type: DataTypes.STRING,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize: db,
    timestamps: true,
});

Garden.sync();