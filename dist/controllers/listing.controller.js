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
exports.validateListing = exports.deleteListing = exports.getListingById = exports.updateListing = exports.getUserListings = exports.createListing = void 0;
const helper_1 = require("./../config/helper");
const garden_controller_1 = require("./garden.controller");
const listing_model_1 = require("../models/listing.model");
const listing_details_model_1 = require("../models/listing_details.model");
const database_1 = __importDefault(require("../database"));
const sequelize_1 = require("sequelize");
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
const createListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const list = req.body.data;
        const lookingFor = req.body.lookingFor;
        // check if list is available
        if (!list || list.length <= 0) {
            throw { message: 'data is required' };
        }
        // check if garden list is valid
        let dataIsValid = true;
        let gardenErrorMssg = '';
        for (const item of list) {
            const checkGarden = yield garden_controller_1.isGardenValid(userId, item.gardenId, item.quantity || 1);
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
        const createdListing = yield listing_model_1.Listing.create({
            lookingFor: lookingFor,
            userId: userId,
        });
        // get listing data
        const listing = createdListing.get({ plain: true });
        // add listing details to table
        const listingDetailsArray = [];
        for (const item of list) {
            listingDetailsArray.push({
                listingId: listing.id,
                gardenId: item.gardenId,
                quantity: item.quantity || 1,
            });
        }
        yield listing_details_model_1.ListingDetail.bulkCreate(listingDetailsArray);
        helper_1.responseHandler({
            message: 'Listing created successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.createListing = createListing;
// get user listing
const getUserListings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const queryResult = yield database_1.default.query(`SELECT 
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
        ls.userId = ${userId}`, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!queryResult || queryResult.length <= 0) {
            helper_1.responseHandler({
                message: 'No Listings found for this user',
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
exports.getUserListings = getUserListings;
// update user listing
const updateListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const list = req.body.data;
        const lookingFor = req.body.lookingFor;
        const listingId = +req.params.id;
        // check if listing is valid
        const isListingValid = yield exports.validateListing(userId, listingId);
        if (!isListingValid.status) {
            throw { message: isListingValid.message };
        }
        // check if garden list is valid
        let dataIsValid = true;
        let gardenErrorMssg = '';
        for (const item of list) {
            const checkGarden = yield garden_controller_1.isGardenValid(userId, item.gardenId, item.quantity || 1);
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
        yield listing_details_model_1.ListingDetail.destroy({ where: { listingId: listingId } });
        // update listing
        yield listing_model_1.Listing.update({
            lookingFor: lookingFor,
        }, { where: { id: listingId } });
        // add listing details to table
        const listingDetailsArray = [];
        for (const item of list) {
            listingDetailsArray.push({
                listingId: listingId,
                gardenId: item.gardenId,
                quantity: item.quantity || 1,
            });
        }
        yield listing_details_model_1.ListingDetail.bulkCreate(listingDetailsArray);
        helper_1.responseHandler({
            message: 'Listing updated successfully',
        }, res);
    }
    catch (err) {
        console.log(err);
        helper_1.errorHandler(err, res);
    }
});
exports.updateListing = updateListing;
// get listing by id
const getListingById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const listingId = +req.params.id;
        // check if listing is valid
        const isListingValid = yield exports.validateListing(userId, listingId);
        if (!isListingValid.status) {
            throw { message: isListingValid.message };
        }
        const queryResult = yield database_1.default.query(`SELECT 
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
        ls.userId = ${userId} and ls.id = ${listingId}`, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!queryResult || queryResult.length <= 0) {
            helper_1.responseHandler({
                message: 'No Listings found for this user',
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
exports.getListingById = getListingById;
// delete listings
const deleteListing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenData = req['userData'];
        const userId = tokenData.id;
        const listingId = +req.params.id;
        // check if listing is valid
        const isListingValid = yield exports.validateListing(userId, listingId);
        if (!isListingValid.status) {
            throw { message: isListingValid.message };
        }
        yield listing_details_model_1.ListingDetail.destroy({ where: { 'listingId': listingId } });
        yield listing_model_1.Listing.destroy({ where: { 'id': listingId } });
        helper_1.responseHandler({
            message: 'Listing deleted successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.deleteListing = deleteListing;
const validateListing = (userId, listingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find listing
        const data = yield listing_model_1.Listing.findByPk(listingId);
        // check if listing exists
        if (!data) {
            return {
                status: false,
                message: `Listing with id: ${listingId} does not exist.`,
            };
        }
        const listingData = data.get({ plain: true });
        // check if listing belongs to user
        if (listingData.userId != userId) {
            return { status: false, message: 'Unauthorized' };
        }
        return { status: true, message: '' };
    }
    catch (err) {
        return {
            status: false,
            message: 'Some error occured, please try again later **.',
        };
    }
});
exports.validateListing = validateListing;
