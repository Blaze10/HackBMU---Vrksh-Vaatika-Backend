"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const endpoints_config_1 = __importDefault(require("./config/endpoints.config"));
const sequelize = new sequelize_1.Sequelize(endpoints_config_1.default.DB_NAME, endpoints_config_1.default.DB_USER, endpoints_config_1.default.DB_PASS, {
    host: endpoints_config_1.default.DB_HOST,
    dialect: 'mysql',
});
sequelize.authenticate()
    .then((res) => {
    console.log('Connection has been established successfully', res);
})
    .catch((err) => {
    console.log(`Error connectng to database: ${err}`);
});
exports.default = sequelize;
