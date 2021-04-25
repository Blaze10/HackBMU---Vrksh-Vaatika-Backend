import { Model, DataTypes } from 'sequelize';
import db from '../database';

export class Listing extends Model {
    id: number;
    userId: string;
    lookingFor: string;
    status: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

Listing.init(
    {
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
        status: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 1,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        timestamps: true,
        sequelize: db,
    }
);

Listing.sync();
