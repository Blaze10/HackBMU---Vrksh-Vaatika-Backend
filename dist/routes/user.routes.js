"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user_controller");
const checkauth_1 = require("../middleware/checkauth");
const router = express_1.Router();
router.post('/login', user_controller_1.loginUser);
router.post('/update', checkauth_1.checkAuth, user_controller_1.updateUser);
router.get('/user/:id', checkauth_1.checkAuth, user_controller_1.getUserbyId);
exports.default = router;
