"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bunyan = require("bunyan");
const user_1 = require("./../models/user");
const config_1 = __importDefault(require("./../config"));
const serializers = {
    user: (user) => user_1.User.toSafeUser(user),
    req: (req) => {
        return {
            ip: req.ip,
            method: req.method,
            url: req.url
            // add necessary properties to log
        };
    }
};
class Logger {
    static initialize() {
        return (req, res, next) => {
            this.req = req;
            next();
        };
    }
    static info(msg, fields) {
        fields = { ...fields, req: this.req };
        this.bunyanLogger.info(fields, msg);
    }
    static warn(msg, fields) {
        fields = { ...fields, req: this.req };
        this.bunyanLogger.warn(fields, msg);
    }
    static error(msg, fields) {
        fields = { ...fields, req: this.req };
        this.bunyanLogger.error(fields, msg);
    }
}
Logger.bunyanLogger = bunyan.createLogger({
    name: 'budget',
    streams: [config_1.default.bunyanStream],
    serializers
});
exports.default = Logger;
