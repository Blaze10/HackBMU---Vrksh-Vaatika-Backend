import { NextFunction, Request, Response } from 'express';
import { errorHandler, responseHandler } from '../config/helper';
import { CategoryMaster } from '../models/category_master.model';

// create status
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const name: string = req.body.name;
        if (!name) {
            throw { message: 'name is required' };
        }

        const data = await CategoryMaster.create({
            name: name,
        });

        const category: CategoryMaster = data.get({ plain: true });

        responseHandler({
            message: 'Category created successfully',
            ...category,
        }, res);

    } catch (err) {
        errorHandler(err, res);
    }
}

// get category list
export const categoryList = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const categoryList: CategoryMaster[] = await CategoryMaster.findAll();
        responseHandler({
            categoryList: categoryList,
            message: 'Categories fetched successfully'
        }, res);

    } catch (err) {
        errorHandler(err, res);
    }
}

