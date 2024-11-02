"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = __importDefault(require("./account/account.controller"));
const categories_controller_1 = __importDefault(require("./categories/categories.controller"));
const router = (0, express_1.Router)();
router.use(account_controller_1.default);
router.use(categories_controller_1.default);
exports.default = router;
