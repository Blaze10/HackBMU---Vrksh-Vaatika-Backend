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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGardenValid = exports.getGardenItemById = exports.deleteGardenItem = exports.editGardenPlant = exports.getUserGarden = exports.createGarden = void 0;
const garden_model_1 = require("../models/garden.model");
const helper_1 = require("../config/helper");
const createGarden = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate token
        const tokenData = req['userData'];
        const id = tokenData.id;
        const plantName = req.body.plantName;
        const categoryId = req.body.categoryId;
        const description = req.body.description || null;
        const image = req.body.image || null;
        const ownedSince = req.body.ownedSince || null;
        const quantity = req.body.quantity || 1;
        if (!plantName || !categoryId) {
            throw { message: 'plantName and categoryId is required' };
        }
        const data = yield garden_model_1.Garden.create({
            userId: id,
            plantName: plantName,
            categoryId: categoryId,
            description: description,
            image: image,
            ownedSince: ownedSince,
            quantity: quantity,
        });
        helper_1.responseHandler({
            message: 'Plant added to garden successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.createGarden = createGarden;
// get all user garden items
const getUserGarden = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate token
        const tokenData = req['userData'];
        const id = tokenData.id;
        const gardenList = yield garden_model_1.Garden.findAll({ where: { userId: id } });
        helper_1.responseHandler({
            message: 'User garden fetched successfully',
            data: gardenList,
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.getUserGarden = getUserGarden;
// edit garden item
const editGardenPlant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate token
        const tokenData = req['userData'];
        const id = tokenData.id;
        const gardenId = +req.params.id;
        // find if item exists
        const data = yield garden_model_1.Garden.findByPk(gardenId);
        const gardenData = data.get({ plain: true });
        if (!gardenData) {
            throw { message: 'Garden item with given id does not exists.' };
        }
        if (gardenData.userId != id) {
            throw { message: 'Unauthorized' };
        }
        const plantName = req.body.plantName;
        const categoryId = req.body.categoryId;
        const description = req.body.description;
        const image = req.body.image;
        const ownedSince = req.body.ownedSince;
        const quantity = req.body.quantity;
        const isActive = req.body.isActive;
        yield data.update({
            plantName: plantName || gardenData.plantName,
            categoryId: categoryId || gardenData.categoryId,
            description: description || gardenData.description,
            image: image || gardenData.image,
            ownedSince: ownedSince || gardenData.ownedSince,
            quantity: quantity || gardenData.ownedSince,
            isActive: isActive || gardenData.isActive,
        });
        helper_1.responseHandler({
            message: 'Garden item updated successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.editGardenPlant = editGardenPlant;
// delete garden item
const deleteGardenItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate token
        const tokenData = req['userData'];
        const id = tokenData.id;
        const gardenId = +req.params.id;
        // find if item exists
        const data = yield garden_model_1.Garden.findByPk(gardenId);
        const gardenData = data.get({ plain: true });
        if (!gardenData) {
            throw { message: 'Garden item with given id does not exists.' };
        }
        if (gardenData.userId != id) {
            throw { message: 'Unauthorized' };
        }
        yield data.destroy();
        helper_1.responseHandler({
            message: 'Garden item deleted successfully',
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.deleteGardenItem = deleteGardenItem;
// get garden item by id
const getGardenItemById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // validate token
        const tokenData = req['userData'];
        const id = tokenData.id;
        const gardenId = +req.params.id;
        // find if item exists
        const data = yield garden_model_1.Garden.findByPk(gardenId);
        const gardenData = data.get({ plain: true });
        if (!gardenData) {
            throw { message: 'Garden item with given id does not exists.' };
        }
        if (gardenData.userId != id) {
            throw { message: 'Unauthorized' };
        }
        helper_1.responseHandler({
            message: 'Garden item retrived successfully',
            data: gardenData,
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.getGardenItemById = getGardenItemById;
const isGardenValid = (userId, gardenId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // find if item exists
        const data = yield garden_model_1.Garden.findByPk(gardenId, { useMaster: true });
        console.log(data);
        // check if garden exists
        if (!data) {
            return { status: false, message: `Garden with id: ${gardenId} does not exist.` };
        }
        const gardenData = data.get({ plain: true });
        // check if garden belongs to user
        if (gardenData.userId != userId) {
            return { status: false, message: 'Unauthorized' };
        }
        // check quantity
        if (quantity > gardenData.quantity) {
            return { status: false, message: `Maximum quantity available for garden: ${gardenId} is ${gardenData.quantity}` };
        }
        return { status: true, message: '' };
    }
    catch (err) {
        console.log(err);
        return { status: false, message: 'Some error occured, please try again later.**' };
    }
});
exports.isGardenValid = isGardenValid;
