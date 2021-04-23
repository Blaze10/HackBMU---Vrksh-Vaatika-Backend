"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryMaster = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../database"));
class CategoryMaster extends sequelize_1.Model {
}
exports.CategoryMaster = CategoryMaster;
CategoryMaster.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize: database_1.default,
    timestamps: true,
});
CategoryMaster.sync();
