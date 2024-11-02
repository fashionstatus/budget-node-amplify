"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const logger_1 = __importDefault(require("./../../utils/logger"));
function passwordValidator() {
    return (0, express_validator_1.check)('password').isLength({ min: 5 })
        .withMessage('must have at least 5 characters');
}
function emailValidator() {
    const t = (0, express_validator_1.check)('email').isEmail()
        .withMessage('is not valid');
    return t;
}
function errorParser() {
    const srt = (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            logger_1.default.warn('auth.signup_validation_failed', { errors: errors.array() });
            res.status(422).json({ msg: formatErrors(errors.array()) });
        }
        else {
            next();
        }
    };
    return srt;
}
function formatErrors(errors) {
    return errors.map(e => `${e.param} ${e.msg}`).join(', ');
}
exports.default = [passwordValidator(), emailValidator(), errorParser()];
