"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
require("localstorage-polyfill");
exports.default = () => (req, res, next) => {
    // this allows Angular Router find the route after refreshing the page
    res.sendFile(path.resolve('../angular/dist/index.html'));
};
