"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const endpoints_config_1 = __importDefault(require("../config/endpoints.config"));
const helper_1 = require("../config/helper");
const checkAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authToken = req.headers.authorization.split(' ')[1];
        const decodedToken = jsonwebtoken_1.default.verify(authToken, endpoints_config_1.default.JWT_SECRET);
        if (!decodedToken) {
            throw { message: 'Unauthorized' };
        }
        req['userData'] = Object.assign({}, decodedToken);
        next();
    }
    catch (err) {
        console.log('Error in verifying jwt');
        helper_1.errorHandler({ message: 'Unauthorized' }, res);
    }
});
exports.checkAuth = checkAuth;
