import { Garden } from '../models/garden.model';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, responseHandler } from '../config/helper';
import { User } from '../models/user.model';

export const createGarden = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // validate token
        const tokenData: User = req['userData'];
        const id = tokenData.id;

        const plantName: string = req.body.plantName;
        const categoryId: number = req.body.categoryId;
        const description: string = req.body.description || null;
        const image: string = req.body.image || null;
        const ownedSince: string = req.body.ownedSince || null;
        const quantity: number = req.body.quantity || 1;

        if (!plantName || !categoryId) {
            throw { message: 'plantName and categoryId is required' };
        }

        const data = await Garden.create({
            userId: id,
            plantName: plantName,
            categoryId: categoryId,
            description: description,
            image: image,
            ownedSince: ownedSince,
            quantity: quantity,
        });

        responseHandler(
            {
                message: 'Plant added to garden successfully',
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// get all user garden items
export const getUserGarden = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // validate token
        const tokenData: User = req['userData'];
        const id = tokenData.id;

        const gardenList = await Garden.findAll({ where: { userId: id } });

        responseHandler(
            {
                message: 'User garden fetched successfully',
                data: gardenList,
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// edit garden item
export const editGardenPlant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // validate token
        const tokenData: User = req['userData'];
        const id = tokenData.id;

        const gardenId: number = +req.params.id;

        // find if item exists
        const data = await Garden.findByPk(gardenId);
        const gardenData: Garden = data.get({ plain: true });

        if (!gardenData) {
            throw { message: 'Garden item with given id does not exists.' };
        }

        if (gardenData.userId != id) {
            throw { message: 'Unauthorized' };
        }

        const plantName: string = req.body.plantName;
        const categoryId: number = req.body.categoryId;
        const description: string = req.body.description;
        const image: string = req.body.image;
        const ownedSince: string = req.body.ownedSince;
        const quantity: number = req.body.quantity;
        const isActive: boolean = req.body.isActive;

        await data.update({
            plantName: plantName || gardenData.plantName,
            categoryId: categoryId || gardenData.categoryId,
            description: description || gardenData.description,
            image: image || gardenData.image,
            ownedSince: ownedSince || gardenData.ownedSince,
            quantity: quantity || gardenData.quantity,
            isActive: isActive || gardenData.isActive,
        });

        responseHandler(
            {
                message: 'Garden item updated successfully',
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// delete garden item
export const deleteGardenItem = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // validate token
        const tokenData: User = req['userData'];
        const id = tokenData.id;

        const gardenId: number = +req.params.id;

        // find if item exists
        const data = await Garden.findByPk(gardenId);
        const gardenData: Garden = data.get({ plain: true });

        if (!gardenData) {
            throw { message: 'Garden item with given id does not exists.' };
        }

        if (gardenData.userId != id) {
            throw { message: 'Unauthorized' };
        }

        await data.destroy();

        responseHandler(
            {
                message: 'Garden item deleted successfully',
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// get garden item by id
export const getGardenItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // validate token
        const tokenData: User = req['userData'];
        const id = tokenData.id;

        const gardenId: number = +req.params.id;

        // find if item exists
        const data = await Garden.findByPk(gardenId);
        const gardenData: Garden = data.get({ plain: true });

        if (!gardenData) {
            throw { message: 'Garden item with given id does not exists.' };
        }

        if (gardenData.userId != id) {
            throw { message: 'Unauthorized' };
        }

        responseHandler(
            {
                message: 'Garden item retrived successfully',
                data: gardenData,
            },
            res
        );

    } catch (err) {
        errorHandler(err, res);
    }
}

export const isGardenValid = async (userId: string, gardenId: number, quantity: number,): Promise<{ status: boolean, message: string, }> => {
    try {

        // find if item exists
        const data = await Garden.findByPk(gardenId, { useMaster: true });
        console.log(data);

        // check if garden exists
        if (!data) {
            return { status: false, message: `Garden with id: ${gardenId} does not exist.` };
        }

        const gardenData: Garden = data.get({ plain: true });
        // check if garden belongs to user
        if (gardenData.userId != userId) {
            return { status: false, message: 'Unauthorized' };
        }

        // check quantity
        if (quantity > gardenData.quantity) {
            return { status: false, message: `Maximum quantity available for garden: ${gardenId} is ${gardenData.quantity}` };
        }

        return { status: true, message: '' };

    } catch (err) {
        console.log(err);
        return { status: false, message: 'Some error occured, please try again later.**' };
    }
}