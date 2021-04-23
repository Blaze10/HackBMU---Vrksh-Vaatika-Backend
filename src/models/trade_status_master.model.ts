import { DataTypes, Model } from "sequelize";
import db from '../database';

export class TradeStatus extends Model {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

TradeStatus.init({
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

TradeStatus.sync();