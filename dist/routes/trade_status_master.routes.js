"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trade_status_master_controller_1 = require("../controllers/trade_status_master.controller");
const express_1 = require("express");
const checkauth_1 = require("../middleware/checkauth");
const router = express_1.Router();
router.post('/create', checkauth_1.checkAuth, trade_status_master_controller_1.createTradeStatus);
router.get('/list', checkauth_1.checkAuth, trade_status_master_controller_1.tradeStatusList);
exports.default = router;
