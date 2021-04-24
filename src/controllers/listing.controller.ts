import { errorHandler } from './../config/helper';
import { Listing } from '../models/listing.model';
import { Request, Response, NextFunction } from 'express';

export const createListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
    const list: Array<Listing> = req.body.data;


    } catch (err) {
        errorHandler(err ,res);
    }
}