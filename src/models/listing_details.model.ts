import { DataTypes, Model } from "sequelize";
import db from '../database';

export class ListingDetail extends Model {
    id: number;
    listingId: number;
    gardenId: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

ListingDetail.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    listingId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    gardenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    timestamps: true,
    sequelize: db,
});

ListingDetail.sync();