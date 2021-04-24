import { Model, DataTypes } from 'sequelize';
import db from '../database';

export class Listing extends Model {
    id: number;
    gardenId: number;
    groupId: number;
    quantity: number;
    lookingFor: string;
    createdAt: Date;
    updatedAt: Date;
}

Listing.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    gardenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.INTEGER.UNSIGNED,
    },
    quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
    lookingFor: {
        type: DataTypes.STRING,
    }

}, {
    timestamps: true,
    sequelize: db,
});

Listing.sync();