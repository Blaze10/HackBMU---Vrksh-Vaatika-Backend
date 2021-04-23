import { NextFunction, Request, Response } from 'express';
import { errorHandler, responseHandler } from '../config/helper';
import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import endpointsConfig from '../config/endpoints.config';

// login user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const id: string = req.body.id;
        const name: string = req.body.name;
        const contact: string = req.body.contact;
        const lat: number = req.body.lat;
        const lng: number = req.body.lng;
        const deviceId: string = req.body.deviceId;
        const os: string = req.body.os;

        if (!id || !name || !contact || !lat || !lng || !deviceId || !os) {
            throw { message: 'id, name, contact, lat, lng, deviceId and os are all required' };
        }

        let userExists = false;
        let user: User;
        // check if user with this id exists
        const userData = await User.findByPk(id);
        if (userData != null) {
            userExists = true;
            user = userData.get({ plain: true });
        }


        if (!userExists) {
            const data = await User.create({
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


        const token = jwt.sign({
            ...user
        }, endpointsConfig.JWT_SECRET, { expiresIn: '9999 years' });

        responseHandler({
            token: token,
            ...user,
            message: 'Login successful',
        }, res);


    } catch (err) {
        errorHandler(err, res);
    }
}


// update user
export const updateUser = async (req, res, next) => {
    try {

        const id: string = req.body.id;
        const name: string = req.body.name || '';
        const lat: number = req.body.lat || '';
        const lng: number = req.body.lng || '';
        const deviceId: string = req.body.deviceId || '';
        const os: string = req.body.os || '';
        const profilePicture: string = req.body.profilePicture || '';

        if (!id) {
            throw { message: 'id is required' };
        }

        // validate token
        const tokenData: User = req['userData'];
        if (tokenData.id != id) {
            throw { message: 'Unauthorized' };
        }

        // validate
        if (!name && !lat && !lng && !deviceId && !os && !profilePicture) {
            throw { message: 'name / lat / lng / deviceId / os / profilePicture atleast 1 is required' };
        }

        // check if give user exists
        const user: User = await User.findByPk(id);

        if (!user) {
            throw { message: 'User does not exists' };
        }

        await user.update({
            name: name || user.name,
            lat: lat || user.lat,
            lng: lng || user.lng,
            deviceId: deviceId || user.deviceId,
            os: os || user.os,
            profilePicture: profilePicture || user.profilePicture,
        });

        responseHandler({
            message: 'User updated successfully',
        }, res);


    } catch (err) {
        errorHandler(err, res);
    }
}

// get user by id
export const getUserbyId = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const id: string = req.params.id;

        if (!id) {
            throw { message: 'id is required' };
        }

        // validate token
        const tokenData: User = req['userData'];
        if (tokenData.id != id) {
            throw { message: 'Unauthorized' };
        }

        const data = await User.findByPk(id);
        const user = data.get({ plain: true });

        if (!user) {
            throw { message: 'User with this id does not exist' };
        }

        responseHandler({
            message: 'User fetched successfully',
            ...user
        }, res);

    } catch (err) {
        errorHandler(err, res);
    }
}