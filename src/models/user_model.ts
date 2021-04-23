import { DataTypes, Model } from "sequelize";
import db from '../database';

export class User extends Model {
    id: string;
    name: string;
    contact: string;
    profilePicture: string;
    lat: number;
    lng: number;
    deviceId: string;
    os: string;
    createdAt: Date;
    updatedAt: Date;
}

User.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    profilePicture: {
        type: DataTypes.STRING,
    },
    lat: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    lng: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    deviceId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    os: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    sequelize: db,
});

User.sync();

