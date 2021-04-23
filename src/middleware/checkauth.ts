import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import endpointsConfig from '../config/endpoints.config';
import { errorHandler } from '../config/helper';

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const authToken = req.headers.authorization.split(' ')[1];
        const decodedToken: any = jwt.verify(authToken, endpointsConfig.JWT_SECRET);

        if (!decodedToken) {
            throw { message: 'Unauthorized' };
        }

        req['userData'] = {
            ...decodedToken
        };

        next();

    } catch (err) {
        console.log('Error in verifying jwt');
        errorHandler({ message: 'Unauthorized' }, res);
    }
}