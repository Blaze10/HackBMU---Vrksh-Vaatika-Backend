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
exports.tradeStatusList = exports.createTradeStatus = void 0;
const trade_status_master_model_1 = require("../models/trade_status_master.model");
const helper_1 = require("../config/helper");
const createTradeStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.body.name;
        if (!name) {
            throw { message: 'name is required' };
        }
        const data = yield trade_status_master_model_1.TradeStatus.create({
            name: name
        });
        const tradeStaus = data.get({ plain: true });
        helper_1.responseHandler(Object.assign({ message: 'Trade status created successfully' }, tradeStaus), res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.createTradeStatus = createTradeStatus;
// get all trade status
const tradeStatusList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const statusList = yield trade_status_master_model_1.TradeStatus.findAll();
        helper_1.responseHandler({
            message: ' Trade status fetched successfully',
            data: statusList,
        }, res);
    }
    catch (err) {
        helper_1.errorHandler(err, res);
    }
});
exports.tradeStatusList = tradeStatusList;
