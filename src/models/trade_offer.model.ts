import { DataTypes, Model } from 'sequelize';
import db from '../database';

export class TradeOffer extends Model {
    id: number;
    listingId: number;
    offeredListingId: number;
    status: number;
    isActive: boolean;
    confirmedByLister: boolean;
    confirmedByOfferer: boolean;
    createdAt: Date;
    updatedAt: Date;
}

TradeOffer.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    listingId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    offeredListingId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
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
    confirmedByLister: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    confirmedByOfferer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    timestamps: true,
    sequelize: db,
});

TradeOffer.sync();