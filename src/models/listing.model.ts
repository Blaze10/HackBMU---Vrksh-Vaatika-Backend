import { Model, DataTypes } from 'sequelize';
import db from '../database';

export class Listing extends Model {
    id: number;
    userId: string;
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
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lookingFor: {
        type: DataTypes.STRING,
    },

}, {
    timestamps: true,
    sequelize: db,
});

Listing.sync();