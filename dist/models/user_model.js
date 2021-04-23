"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    profilePicture: {
        type: sequelize_1.DataTypes.STRING,
    },
    lat: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    lng: {
        type: sequelize_1.DataTypes.DOUBLE,
        allowNull: false,
    },
    deviceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    os: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    sequelize: database_1.default,
});
User.sync();
