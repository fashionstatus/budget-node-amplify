"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importDefault(require("express"));
const session = require("express-session");
const routes_1 = __importDefault(require("./routes"));
const config_1 = __importDefault(require("./config"));
const error_handler_1 = __importDefault(require("./utils/error-handler"));
const logger_1 = __importDefault(require("./utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("localstorage-polyfill");
global.localStorage = localStorage;
if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}
localStorage.setItem('myFirstKey', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));
const privateKey = fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'ssl.key/serveractual.key'), 'utf8'); // ./budget-node/src/
const certificate = fs_1.default.readFileSync(path_1.default.resolve(__dirname, 'ssl.crt/serveractual.crt'), 'utf8'); // ./budget-node/
const credentials = { key: privateKey, cert: certificate };
const app = (0, express_1.default)();
// const httpServer = http.createServer( app);
const ip = '0.0.0.0'; // '192.168.32.1';
app.use(session(config_1.default.sessionConfig));
app.use((0, morgan_1.default)(config_1.default.morganPattern, { stream: config_1.default.morganStream }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// app.use(passport.initialize());
const originsWhitelist = [
    'https://192.168.1.4:8000', 'https://192.168.1.4:8080', 'http://localhost:3000',
    'https://192.168.1.7', 'https://192.168.1.2', 'https://192.168.1.3', 'https://192.168.1.5', 'https://192.168.1.6',
    'https://budget-client-407513.el.r.appspot.com', 'https://glaubhanta.site', 'https://www.glaubhanta.site'
];
const options = {
    origin: originsWhitelist,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH', 'OPTIONS']
};
const crsOpt = (0, cors_1.default)(options);
app.options('*', crsOpt); // for pre-flight request for delete request's
app.use(crsOpt);
app.all('*', function (req, res, next) {
    const origin = req.headers.origin != undefined ? req.headers.origin : (req.headers.host != undefined ? req.headers.host : "");
    console.log("req.headers " + JSON.stringify(req.headers));
    let validReqOrigin = false;
    originsWhitelist.forEach((validHost, index) => {
        if ((validHost.indexOf(origin) > -1) || (/^http:\/\/localhost:\d+$/.test(origin))) {
            validReqOrigin = true;
        }
    });
    if (validReqOrigin) {
        res.header("Access-Control-Allow-Origin", origin);
        console.log("CORS allowed " + origin);
        // console.log("CORS request body "+JSON.stringify(req['body']));
    }
    else {
        console.log("CORS not allowed " + origin);
    }
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use((0, error_handler_1.default)());
app.use(logger_1.default.initialize());
app.use(routes_1.default);
exports.default = app;
