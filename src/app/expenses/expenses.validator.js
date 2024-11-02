"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const logger_1 = __importDefault(require("./../../utils/logger"));
function value() {
    return (0, express_validator_1.check)('value').isNumeric()
        .withMessage('must be a number');
}
function datetime() {
    return (0, express_validator_1.check)('datetime').escape();
}
function counterparty() {
    return (0, express_validator_1.check)('counterparty').escape();
}
function errorParser() {
    return function (req, res, next) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.default.warn('expenses.validation_failed', { errors: errors.array() });
            res.status(422).json({ msg: formatErrors(errors.array()) });
        }
        else {
            next();
        }
    };
}
function formatErrors(errors) {
    return errors.map(e => `${e.param} ${e.msg}`).join(', ');
}
exports.default = [value(), datetime(), counterparty(), errorParser()];
