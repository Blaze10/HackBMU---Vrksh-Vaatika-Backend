import { errorHandler, responseHandler } from './../config/helper';
import { isGardenValid } from './garden.controller';
import { Listing } from '../models/listing.model';
import { ListingDetail } from '../models/listing_details.model';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import db from '../database';
import { QueryTypes } from 'sequelize';

// User.hasMany(Garden);
// Garden.belongsTo(User, { foreignKey: 'userId'});
// Garden.hasMany(Listing);
// Listing.belongsTo(Garden, { foreignKey:  })
// Listing.hasMany(ListingDetail);

// User.hasMany(Listing, { constraints: false, foreignKeyConstraint: false, });
// Listing.belongsTo(User, { foreignKey: 'userId', constraints: false, foreignKeyConstraint: false, });

// Listing.hasMany(ListingDetail, { constraints: false, foreignKeyConstraint: false, });
// ListingDetail.belongsTo(Listing, { foreignKey: 'listingId', constraints: false, foreignKeyConstraint: false, });

// Garden.hasMany(ListingDetail, { constraints: false, foreignKeyConstraint: false, });
// ListingDetail.belongsTo(Garden, { foreignKey: 'gardenId', constraints: false, foreignKeyConstraint: false, });

// CategoryMaster.hasMany(Garden, { constraints: false, foreignKeyConstraint: false, });
// Garden.belongsTo(CategoryMaster, { foreignKey: 'categoryId', constraints: false, foreignKeyConstraint: false, });

// create listing
export const createListing = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const list: Array<{
            gardenId: number;
            quantity?: number;
        }> = req.body.data;
        const lookingFor: string = req.body.lookingFor;

        // check if list is available
        if (!list || list.length <= 0) {
            throw { message: 'data is required' };
        }

        // check if garden list is valid
        let dataIsValid = true;
        let gardenErrorMssg = '';
        for (const item of list) {
            const checkGarden = await isGardenValid(
                userId,
                item.gardenId,
                item.quantity || 1
            );
            if (!checkGarden.status) {
                dataIsValid = false;
                gardenErrorMssg = checkGarden.message;
                break;
            }
        }

        // unauthorized
        if (!dataIsValid) {
            throw { message: gardenErrorMssg };
        }

        // create listing
        const createdListing = await Listing.create({
            lookingFor: lookingFor,
            userId: userId,
        });

        // get listing data
        const listing: Listing = createdListing.get({ plain: true });

        // add listing details to table
        const listingDetailsArray: Array<{
            listingId: number;
            gardenId: number;
            quantity: number;
        }> = [];
        for (const item of list) {
            listingDetailsArray.push({
                listingId: listing.id,
                gardenId: item.gardenId,
                quantity: item.quantity || 1,
            });
        }

        await ListingDetail.bulkCreate(listingDetailsArray);

        responseHandler(
            {
                message: 'Listing created successfully',
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// get user listing
export const getUserListings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const queryResult = await db.query(
            `SELECT 
        ls.id,
        ls.lookingFor,
        ld.quantity,
        gd.plantName,
        gd.id as gardenId,
        gd.image,
        cm.id AS categoryId,
        cm.name AS category,
        gd.description,
        gd.ownedSince,
        ls.createdAt,
        ls.updatedAt
    FROM
        Listings AS ls
            INNER JOIN
        ListingDetails AS ld ON ld.listingId = ls.id
            INNER JOIN
        Gardens AS gd ON gd.id = ld.gardenId
            INNER JOIN
        CategoryMasters AS cm ON cm.id = gd.categoryId
    WHERE
        ls.userId = ${userId}`,
            {
                type: QueryTypes.SELECT,
            }
        );

        if (!queryResult || queryResult.length <= 0) {
            responseHandler(
                {
                    message: 'No Listings found for this user',
                    data: [],
                },
                res
            );
        }

        responseHandler(
            {
                data: queryResult,
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// update user listing
export const updateListing = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const list: Array<{
            gardenId: number;
            quantity?: number;
        }> = req.body.data;
        const lookingFor: string = req.body.lookingFor;
        const listingId: number = +req.params.id;

        // check if listing is valid
        const isListingValid = await validateListing(userId, listingId);
        if (!isListingValid.status) {
            throw { message: isListingValid.message };
        }

        // check if garden list is valid
        let dataIsValid = true;
        let gardenErrorMssg = '';
        for (const item of list) {
            const checkGarden = await isGardenValid(
                userId,
                item.gardenId,
                item.quantity || 1
            );
            if (!checkGarden.status) {
                dataIsValid = false;
                gardenErrorMssg = checkGarden.message;
                break;
            }
        }

        // unauthorized
        if (!dataIsValid) {
            throw { message: gardenErrorMssg };
        }

        // delete previous details
        await ListingDetail.destroy({ where: { listingId: listingId } });

        // update listing
        await Listing.update(
            {
                lookingFor: lookingFor,
            },
            { where: { id: listingId } }
        );

        // add listing details to table
        const listingDetailsArray: Array<{
            listingId: number;
            gardenId: number;
            quantity: number;
        }> = [];
        for (const item of list) {
            listingDetailsArray.push({
                listingId: listingId,
                gardenId: item.gardenId,
                quantity: item.quantity || 1,
            });
        }

        await ListingDetail.bulkCreate(listingDetailsArray);

        responseHandler(
            {
                message: 'Listing updated successfully',
            },
            res
        );
    } catch (err) {
        console.log(err);
        errorHandler(err, res);
    }
};

// get listing by id
export const getListingById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const listingId: number = +req.params.id;

        // check if listing is valid
        const isListingValid = await validateListing(userId, listingId);
        if (!isListingValid.status) {
            throw { message: isListingValid.message };
        }

        const queryResult = await db.query(
            `SELECT 
        ls.id,
        ls.lookingFor,
        ld.quantity,
        gd.plantName,
        gd.id as gardenId,
        gd.image,
        cm.id AS categoryId,
        cm.name AS category,
        gd.description,
        gd.ownedSince,
        ls.createdAt,
        ls.updatedAt
    FROM
        Listings AS ls
            INNER JOIN
        ListingDetails AS ld ON ld.listingId = ls.id
            INNER JOIN
        Gardens AS gd ON gd.id = ld.gardenId
            INNER JOIN
        CategoryMasters AS cm ON cm.id = gd.categoryId
    WHERE
        ls.userId = ${userId} and ls.id = ${listingId}`,
            {
                type: QueryTypes.SELECT,
            }
        );

        if (!queryResult || queryResult.length <= 0) {
            responseHandler(
                {
                    message: 'No Listings found for this user',
                    data: [],
                },
                res
            );
        }

        responseHandler(
            {
                data: queryResult,
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// delete listings
export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const listingId: number = +req.params.id;

        // check if listing is valid
        const isListingValid = await validateListing(userId, listingId);
        if (!isListingValid.status) {
            throw { message: isListingValid.message };
        }

        await ListingDetail.destroy({ where: { 'listingId': listingId } });
        await Listing.destroy({ where: { 'id': listingId } });

        responseHandler(
            {
                message: 'Listing deleted successfully',
            },
            res
        );

    } catch (err) {
        errorHandler(err, res);
    }
}

export const validateListing = async (
    userId: string,
    listingId: number
): Promise<{ status: boolean; message: string }> => {
    try {
        // find listing
        const data = await Listing.findByPk(listingId);

        // check if listing exists
        if (!data) {
            return {
                status: false,
                message: `Listing with id: ${listingId} does not exist.`,
            };
        }

        const listingData: Listing = data.get({ plain: true });
        // check if listing belongs to user
        if (listingData.userId != userId) {
            return { status: false, message: 'Unauthorized' };
        }

        return { status: true, message: '' };
    } catch (err) {
        return {
            status: false,
            message: 'Some error occured, please try again later **.',
        };
    }
};
