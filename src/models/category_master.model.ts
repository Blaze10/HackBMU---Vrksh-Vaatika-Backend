import { DataTypes, Model } from "sequelize";
import db from '../database';

export class CategoryMaster extends Model {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

CategoryMaster.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: db,
    timestamps: true,
});

CategoryMaster.sync();