import { errorHandler, responseHandler } from './../config/helper';
import { isGardenValid } from './garden.controller';
import { Listing } from '../models/listing.model';
import { ListingDetail } from '../models/listing_details.model';
import { Request, Response, NextFunction, response } from 'express';
import { User } from '../models/user.model';
import db from '../database';
import { QueryTypes } from 'sequelize';
import { convertDistance, getPreciseDistance } from 'geolib';
import { Op } from 'sequelize';

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
            `SELECT DISTINCT  
        ls.id,
        ls.lookingFor,
        ld.quantity,
        ts.name as status,
        gd.plantName,
        gd.id as gardenId,
        gd.image,
        cm.id AS categoryId,
        cm.name AS category,
        gd.description,
        gd.ownedSince,
        u.lat,
        u.lng,
        u.name as userName,
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
            INNER JOIN
        Users AS u ON u.id = ls.userId
            INNER JOIN
        TradeStatuses AS ts ON ts.id = ls.status
    WHERE
        ls.userId = "${userId}" and ls.isActive = true`,
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
        // const isListingValid = await validateListing(userId, listingId);
        // if (!isListingValid.status) {
        //     throw { message: isListingValid.message };
        // }

        const queryResult = await db.query(
            `SELECT DISTINCT 
        ls.id,
        ls.lookingFor,
        ld.quantity,
        ts.name as status,
        gd.plantName,
        gd.id as gardenId,
        gd.image,
        cm.id AS categoryId,
        cm.name AS category,
        gd.description,
        gd.ownedSince,
        u.lat,
        u.lng,
        u.name as userName,
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
            INNER JOIN
        Users AS u ON u.id = ls.userId
            INNER JOIN
        TradeStatuses AS ts ON ts.id = ls.status
    WHERE
        ls.id = ${listingId}`,
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
export const deleteListing = async (
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

        await ListingDetail.destroy({ where: { listingId: listingId } });
        await Listing.destroy({ where: { id: listingId } });

        responseHandler(
            {
                message: 'Listing deleted successfully',
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// get nearby listings
export const nearbyListings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const queryResult = await db.query(
            `SELECT DISTINCT
        userId, u.lat, u.lng
    FROM
        Listings AS ls
            INNER JOIN
        Users AS u ON u.id = ls.userId 
            WHERE
            userId != "${userId}";`,
            {
                type: QueryTypes.SELECT,
            }
        );

        if (!queryResult || queryResult.length <= 0) {
            responseHandler(
                {
                    data: [],
                },
                res
            );
        }

        // get elegible user
        const eligibleUsers: Array<string> = [];
        let queryList: Array<{
            userId: string;
            lat: number;
            lng: number;
        }> = JSON.parse(JSON.stringify(queryResult));

        for (const item of queryList) {
            console.log(item);
            const distance: number =
                calculatDistanceinKm(
                    tokenData.lat,
                    tokenData.lng,
                    item.lat,
                    item.lng
                ) || 40;
            if (distance <= 30) {
                eligibleUsers.push(item.userId);
            }
        }

        if (eligibleUsers.length <= 0) {
            responseHandler(
                {
                    data: [],
                },
                res
            );
        }

        const listingQuery = await db.query(
            `SELECT DISTINCT 
        ls.id,
        ls.lookingFor,
        ld.quantity,
        ts.name as status,
        gd.plantName,
        gd.id as gardenId,
        gd.image,
        cm.id AS categoryId,
        cm.name AS category,
        gd.description,
        gd.ownedSince,
        u.lat,
        u.lng,
        u.name as userName,
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
            INNER JOIN
        Users AS u ON u.id = ls.userId
            INNER JOIN
        TradeStatuses AS ts ON ts.id = ls.status
    WHERE
        ls.userId in (${eligibleUsers.join(',')})  and ls.isActive = true`,
            {
                type: QueryTypes.SELECT,
            }
        );

        if (!listingQuery || listingQuery.length <= 0) {
            responseHandler(
                {
                    message: 'No Listings found',
                    data: [],
                },
                res
            );
        }

        responseHandler(
            {
                data: listingQuery,
            },
            res
        );

        responseHandler(
            {
                eligibleUsers: eligibleUsers,
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

export const validateListing = async (
    userId: string,
    listingId: number,
    forTrade = false,
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
        if (!forTrade && listingData.userId != userId) {
            return { status: false, message: 'Unauthorized' };
        }

        if (forTrade && listingData.userId == userId) {
            return { status: false, message: 'You cannot offer trade against your own listings' };
        }

        return { status: true, message: '' };
    } catch (err) {
        return {
            status: false,
            message: 'Some error occured, please try again later **.',
        };
    }
};

//  get distance
export const calculatDistanceinKm = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const distance = getPreciseDistance({
        latitude: lat1,
        longitude: lng1,
    }, {
        latitude: lat2,
        longitude: lng2,
    });

    // const distance = getPreciseDistance(
    //     {
    //         latitude: 19.047388, // shikp chowk
    //         longitude: 73.070107,
    //     },
    //     {
    //         latitude: 19.040314, // kharghar
    //         longitude: 73.078938,
    //     }
    // );

    const distanceInKm = convertDistance(distance, 'km');
    console.log('*****', distanceInKm);

    return distanceInKm;
};
