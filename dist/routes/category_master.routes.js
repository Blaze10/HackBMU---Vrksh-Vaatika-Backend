"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_master_controller_1 = require("../controllers/category_master.controller");
const express_1 = require("express");
const checkauth_1 = require("../middleware/checkauth");
const router = express_1.Router();
router.post('/create', checkauth_1.checkAuth, category_master_controller_1.createCategory);
router.get('/list', checkauth_1.checkAuth, category_master_controller_1.categoryList);
exports.default = router;
