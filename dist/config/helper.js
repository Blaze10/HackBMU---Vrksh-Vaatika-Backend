"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredValidator = exports.validateEmail = exports.responseHandler = exports.errorHandler = void 0;
const email_validator_1 = __importDefault(require("email-validator"));
// handle try catch errors
const errorHandler = (err, res) => {
    let errorMessage = 'Some error occured, Please try again later';
    if (err.message || err.Message) {
        errorMessage = err.message || err.Message;
    }
    res.status(404).json({
        status: 0,
        message: errorMessage
    });
};
exports.errorHandler = errorHandler;
// response template
const responseHandler = (data, res) => {
    if (!data)
        return exports.errorHandler('', res);
    res.status(200).json(Object.assign({ status: 1 }, data));
};
exports.responseHandler = responseHandler;
// validate email
const validateEmail = (email) => {
    if (!email)
        return false;
    return email_validator_1.default.validate(email.trim());
};
exports.validateEmail = validateEmail;
// required validator
const requiredValidator = (value, isboolean) => {
    if (isboolean)
        return true;
    if (!value)
        return false;
    return true;
};
exports.requiredValidator = requiredValidator;
