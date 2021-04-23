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
exports.categoryList = exports.createCategory = void 0;
const helper_1 = require("../config/helper");
const category_master_model_1 = require("../models/category_master.model");
// create status
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.body.name;
        if (!name) {
            throw { message: 'name is required' };
        }
        const data = yield category_master_model_1.CategoryMaster.create({
            name: name,
        });
        const category = data.get({ plain: true });
        helper_1.responseHandler(Object.assign({ message: 'Category created successfully' }, category), res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.createCategory = createCategory;
// get category list
const categoryList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryList = yield category_master_model_1.CategoryMaster.findAll();
        helper_1.responseHandler({
            categoryList: categoryList,
            message: 'Categories fetched successfully'
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.categoryList = categoryList;
