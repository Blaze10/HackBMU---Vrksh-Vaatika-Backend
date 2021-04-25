import { TradeOffer } from '../models/trade_offer.model';
import db from '../database';
import { errorHandler, responseHandler } from '../config/helper';
import { NextFunction, Request, Response } from 'express';
import { validateListing } from './listing.controller';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { Op, QueryTypes } from 'sequelize';

export const createTradeOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const listingId: number = req.body.listingId;
        const offeredListingId: number = req.body.offeredListingId;

        if (!listingId || !offeredListingId) {
            throw { message: 'listingId and offeredListingId are required' };
        }

        // validate listingId
        const isValidListingId = await validateListing(userId, listingId, true);
        if (!isValidListingId.status) {
            throw { message: isValidListingId.message };
        }

        // validate offeredListingId
        const isValidOfferedListingId = await validateListing(
            userId,
            offeredListingId
        );
        if (!isValidOfferedListingId.status) {
            throw { message: isValidOfferedListingId.message };
        }

        // check if offer exists
        const findOffer = await TradeOffer.findAll({
            where: {
                [Op.and]: [
                    { listingId: listingId },
                    { offeredListingId: offeredListingId },
                    { status: 1 },
                ],
            },
        });

        if (findOffer.length > 0) {
            throw { message: 'This offer already exists' };
        }

        await TradeOffer.create({
            listingId: listingId,
            offeredListingId: offeredListingId,
        });

        responseHandler(
            {
                message: 'Trade offer created successfully',
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// edit trade offered
export const editTradeOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const offerId: number = +req.params.id;
        const offeredListingId: number = req.body.offeredListingId || null;
        const isAccepted: boolean = req.body.isAccepted || null;
        const isConfirmedByLister: boolean = req.body.isConfirmedByLister || null;
        const isConfirmedByOfferer: boolean = req.body.isConfirmedByOfferer || null;

        const offer = await TradeOffer.findByPk(offerId);
        if (!offer) {
            throw { message: 'Offer with given id does not exists.' };
        }

        if (offeredListingId) {
            // validate offeredListingId
            const isValidOfferedListingId = await validateListing(
                userId,
                offeredListingId
            );
            if (!isValidOfferedListingId.status) {
                throw { message: isValidOfferedListingId.message };
            }
        }

        const offerData: TradeOffer = offer.get({ plain: true });

        const updatedOffer = await offer.update({
            offeredListingId: offeredListingId || offerData.offeredListingId,
            status: isAccepted == null ? offerData.status : isAccepted ? 2 : 3,
            confirmedByLister:
                isConfirmedByLister == null
                    ? offerData.confirmedByLister
                    : isConfirmedByLister,
            confirmedByOfferer:
                isConfirmedByOfferer == null
                    ? offerData.confirmedByOfferer
                    : isConfirmedByOfferer,
        });

        // get updated data
        const updatedOfferData: TradeOffer = updatedOffer.get({ plain: true });
        if (
            updatedOfferData.confirmedByLister &&
            updatedOfferData.confirmedByOfferer
        ) {
            await TradeOffer.update(
                {
                    status: '4',
                },
                { where: { id: offerId } }
            );

            await Listing.update(
                {
                    status: '4',
                    isActive: false,
                },
                { where: { id: updatedOfferData.listingId } }
            );
        }

        responseHandler(
            {
                message: 'Trade offer edited successfully',
            },
            res
        );
    } catch (err) {
        errorHandler(err, res);
    }
};

// get user offers
export const getUserOffers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const queryResult = await db.query(
            `SELECT DISTINCT
        tof.id AS offerId,
        ls.id AS listingId,
        ols.id AS offeredListingId,
        u.name AS listerName,
        ou.name AS offererName,
        u.profilePicture as listerProfilePicture,
        ou.profilePicture as offererProfilePicture,
        u.id AS listerId,
        ou.id AS offererId,
        tof.createdAt,
        tof.updatedAt,
        ts.name AS status
    FROM
        TradeOffers AS tof
            INNER JOIN
        Listings AS ls ON ls.id = tof.listingId
            INNER JOIN
        Listings AS ols ON ols.id = tof.offeredListingId
            INNER JOIN
        TradeStatuses AS ts ON ts.id = tof.status
            INNER JOIN
        Users AS u ON u.id = ls.userId
            INNER JOIN
        Users AS ou ON ou.id = ols.userId
    WHERE
        (ls.userId = '${userId}'
            OR ols.userId = '${userId}')
    ORDER BY tof.updatedAt DESC;`,
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

// delete trade offer
export const deleteTradeOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tokenData: User = req['userData'];
        const userId = tokenData.id;

        const offerId: number = +req.params.id;

        const offerModel = await TradeOffer.findByPk(offerId);
        if (!offerModel) {
            throw { message: 'offer with given id does not exists.' };
        }

        const queryResult = await db.query(
            `select tof.id from TradeOffers as tof
        inner join Listings as ls on ls.id = tof.offeredListingId
        where tof.id = ${offerId} and ls.userId = "${userId}"`,
            {
                type: QueryTypes.SELECT,
            }
        );

        if (!queryResult || queryResult.length <= 0) {
            throw { message: 'Unauthorized, you can only delete your own offers' };
        }

        await TradeOffer.destroy({ where: { id: offerId } });

        responseHandler({ message: 'Offer deleted successfully' }, res);
    } catch (err) {
        errorHandler(err, res);
    }
};

export const getOffersByListing = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const listingId = req.params.id;

        // check if listing is valid
        const listingData = await Listing.findByPk(listingId);
        if (!listingData) {
            throw { message: 'Please provide a valid listingId' };
        }

        const queryData = await db.query(
            `SELECT DISTINCT
        tof.id AS offerId,
        ls.id AS listingId,
        ols.id AS offeredListingId,
        u.name AS listerName,
        ou.name AS offererName,
        u.id AS listerId,
        ou.id AS offererId,
        tof.createdAt,
        tof.updatedAt,
        ts.name AS status
    FROM
        TradeOffers AS tof
            INNER JOIN
        Listings AS ls ON ls.id = tof.listingId
            INNER JOIN
        Listings AS ols ON ols.id = tof.offeredListingId
            INNER JOIN
        TradeStatuses AS ts ON ts.id = tof.status
            INNER JOIN
        Users AS u ON u.id = ls.userId
            INNER JOIN
        Users AS ou ON ou.id = ols.userId
    WHERE
       (ls.id = ${listingId} or ols.id = ${listingId}) and tof.status = 1
    ORDER BY tof.updatedAt DESC;`,
            {
                type: QueryTypes.SELECT,
            }
        );


        if (!queryData || queryData.length <= 0) {
            responseHandler({
                data: [],
            }, res);
        }

        responseHandler({
            data: queryData,
        }, res);

    } catch (err) {
        errorHandler(err, res);
    }
};
