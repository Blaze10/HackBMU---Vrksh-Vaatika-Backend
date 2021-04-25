"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffersByListing = exports.deleteTradeOffer = exports.getUserOffers = exports.editTradeOffer = exports.createTradeOffer = void 0;
const trade_offer_model_1 = require("../models/trade_offer.model");
const database_1 = __importDefault(require("../database"));
const helper_1 = require("../config/helper");
const listing_controller_1 = require("./listing.controller");
const listing_model_1 = require("../models/listing.model");
const sequelize_1 = require("sequelize");
const createTradeOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const listingId = req.body.listingId;
        const offeredListingId = req.body.offeredListingId;
        if (!listingId || !offeredListingId) {
            throw { message: 'listingId and offeredListingId are required' };
        }
        // validate listingId
        const isValidListingId = yield listing_controller_1.validateListing(userId, listingId, true);
        if (!isValidListingId.status) {
            throw { message: isValidListingId.message };
        }
        // validate offeredListingId
        const isValidOfferedListingId = yield listing_controller_1.validateListing(userId, offeredListingId);
        if (!isValidOfferedListingId.status) {
            throw { message: isValidOfferedListingId.message };
        }
        // check if offer exists
        const findOffer = yield trade_offer_model_1.TradeOffer.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    { listingId: listingId },
                    { offeredListingId: offeredListingId },
                    { status: 1 },
                ],
            },
        });
        if (findOffer.length > 0) {
            throw { message: 'This offer already exists' };
        }
        yield trade_offer_model_1.TradeOffer.create({
            listingId: listingId,
            offeredListingId: offeredListingId,
        });
        helper_1.responseHandler({
            message: 'Trade offer created successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.createTradeOffer = createTradeOffer;
// edit trade offered
const editTradeOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const offerId = +req.params.id;
        const offeredListingId = req.body.offeredListingId || null;
        const isAccepted = req.body.isAccepted || null;
        const isConfirmedByLister = req.body.isConfirmedByLister || null;
        const isConfirmedByOfferer = req.body.isConfirmedByOfferer || null;
        const offer = yield trade_offer_model_1.TradeOffer.findByPk(offerId);
        if (!offer) {
            throw { message: 'Offer with given id does not exists.' };
        }
        if (offeredListingId) {
            // validate offeredListingId
            const isValidOfferedListingId = yield listing_controller_1.validateListing(userId, offeredListingId);
            if (!isValidOfferedListingId.status) {
                throw { message: isValidOfferedListingId.message };
            }
        }
        const offerData = offer.get({ plain: true });
        const updatedOffer = yield offer.update({
            offeredListingId: offeredListingId || offerData.offeredListingId,
            status: isAccepted == null ? offerData.status : isAccepted ? 2 : 3,
            confirmedByLister: isConfirmedByLister == null
                ? offerData.confirmedByLister
                : isConfirmedByLister,
            confirmedByOfferer: isConfirmedByOfferer == null
                ? offerData.confirmedByOfferer
                : isConfirmedByOfferer,
        });
        // get updated data
        const updatedOfferData = updatedOffer.get({ plain: true });
        if (updatedOfferData.confirmedByLister &&
            updatedOfferData.confirmedByOfferer) {
            yield trade_offer_model_1.TradeOffer.update({
                status: '4',
            }, { where: { id: offerId } });
            yield listing_model_1.Listing.update({
                status: '4',
                isActive: false,
            }, { where: { id: updatedOfferData.listingId } });
        }
        helper_1.responseHandler({
            message: 'Trade offer edited successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.editTradeOffer = editTradeOffer;
// get user offers
const getUserOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const queryResult = yield database_1.default.query(`SELECT DISTINCT
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
    ORDER BY tof.updatedAt DESC;`, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!queryResult || queryResult.length <= 0) {
            helper_1.responseHandler({
                data: [],
            }, res);
        }
        helper_1.responseHandler({
            data: queryResult,
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.getUserOffers = getUserOffers;
// delete trade offer
const deleteTradeOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const offerId = +req.params.id;
        const offerModel = yield trade_offer_model_1.TradeOffer.findByPk(offerId);
        if (!offerModel) {
            throw { message: 'offer with given id does not exists.' };
        }
        const queryResult = yield database_1.default.query(`select tof.id from TradeOffers as tof
        inner join Listings as ls on ls.id = tof.offeredListingId
        where tof.id = ${offerId} and ls.userId = "${userId}"`, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!queryResult || queryResult.length <= 0) {
            throw { message: 'Unauthorized, you can only delete your own offers' };
        }
        yield trade_offer_model_1.TradeOffer.destroy({ where: { id: offerId } });
        helper_1.responseHandler({ message: 'Offer deleted successfully' }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.deleteTradeOffer = deleteTradeOffer;
const getOffersByListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const listingId = req.params.id;
        // check if listing is valid
        const listingData = yield listing_model_1.Listing.findByPk(listingId);
        if (!listingData) {
            throw { message: 'Please provide a valid listingId' };
        }
        const queryData = yield database_1.default.query(`SELECT DISTINCT
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
    ORDER BY tof.updatedAt DESC;`, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!queryData || queryData.length <= 0) {
            helper_1.responseHandler({
                data: [],
            }, res);
        }
        helper_1.responseHandler({
            data: queryData,
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.getOffersByListing = getOffersByListing;
