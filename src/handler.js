"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const serverless_http_1 = __importDefault(require("serverless-http"));
const app_1 = __importDefault(require("./app"));
const handler = (0, serverless_http_1.default)(app_1.default);
const server = async (event, context, callback) => {
    /*const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Hello, World!',
        input: event,
      }),
    };
  
    callback(null, response);*/
    return handler(event, context);
};
exports.server = server;
