import { Response } from "express";
import emailValidator from 'email-validator';

// handle try catch errors
export const errorHandler = (err: any, res: Response): void => {
    let errorMessage = 'Some error occured, Please try again later';
    if (err.message || err.Message) {
        errorMessage = err.message || err.Message;
    }
    res.status(404).json({
        status: 0,
        message: errorMessage
    });
};

// response template
export const responseHandler = (data: any, res: Response): void => {
    if (!data) return errorHandler('', res);
    res.status(200).json({
        status: 1,
        ...data,
    });
}

// validate email
export const validateEmail = (email: string): boolean => {
    if (!email) return false;
    return emailValidator.validate(email.trim());
}

// required validator
export const requiredValidator = (value: any, isboolean?: boolean) => {
    if (isboolean) return true;
    if (!value) return false;
    return true;
};