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
exports.getUserbyId = exports.updateUser = exports.loginUser = void 0;
const helper_1 = require("../config/helper");
const user_model_1 = require("../models/user_model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const endpoints_config_1 = __importDefault(require("../config/endpoints.config"));
// login user
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const contact = req.body.contact;
        const lat = req.body.lat;
        const lng = req.body.lng;
        const deviceId = req.body.deviceId;
        const os = req.body.os;
        if (!id || !name || !contact || !lat || !lng || !deviceId || !os) {
            throw { message: 'id, name, contact, lat, lng, deviceId and os are all required' };
        }
        let userExists = false;
        let user;
        // check if user with this id exists
        const userData = yield user_model_1.User.findByPk(id);
        if (userData != null) {
            userExists = true;
            user = userData.get({ plain: true });
        }
        if (!userExists) {
            const data = yield user_model_1.User.create({
                id: id,
                name: name,
                contact: contact,
                lat: lat,
                lng: lng,
                deviceId: deviceId,
                os: os,
            });
            user = data.get({ plain: true });
        }
        const token = jsonwebtoken_1.default.sign(Object.assign({}, user), endpoints_config_1.default.JWT_SECRET, { expiresIn: '9999 years' });
        helper_1.responseHandler(Object.assign(Object.assign({ token: token }, user), { message: 'Login successful' }), res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.loginUser = loginUser;
// update user
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        const name = req.body.name || '';
        const lat = req.body.lat || '';
        const lng = req.body.lng || '';
        const deviceId = req.body.deviceId || '';
        const os = req.body.os || '';
        const profilePicture = req.body.profilePicture || '';
        if (!id) {
            throw { message: 'id is required' };
        }
        // validate token
        const tokenData = req['userData'];
        if (tokenData.id != id) {
            throw { message: 'Unauthorized' };
        }
        // validate
        if (!name && !lat && !lng && !deviceId && !os && !profilePicture) {
            throw { message: 'name / lat / lng / deviceId / os / profilePicture atleast 1 is required' };
        }
        // check if give user exists
        const user = yield user_model_1.User.findByPk(id);
        if (!user) {
            throw { message: 'User does not exists' };
        }
        yield user.update({
            name: name || user.name,
            lat: lat || user.lat,
            lng: lng || user.lng,
            deviceId: deviceId || user.deviceId,
            os: os || user.os,
            profilePicture: profilePicture || user.profilePicture,
        });
        helper_1.responseHandler({
            message: 'User updated successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.updateUser = updateUser;
// get user by id
const getUserbyId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        if (!id) {
            throw { message: 'id is required' };
        }
        // validate token
        const tokenData = req['userData'];
        if (tokenData.id != id) {
            throw { message: 'Unauthorized' };
        }
        const data = yield user_model_1.User.findByPk(id);
        const user = data.get({ plain: true });
        if (!user) {
            throw { message: 'User with this id does not exist' };
        }
        helper_1.responseHandler(Object.assign({ message: 'User fetched successfully' }, user), res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.getUserbyId = getUserbyId;
