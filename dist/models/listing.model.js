"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class Listing extends sequelize_1.Model {
}
exports.Listing = Listing;
Listing.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lookingFor: {
        type: sequelize_1.DataTypes.STRING,
    },
}, {
    timestamps: true,
    sequelize: database_1.default,
});
Listing.sync();
