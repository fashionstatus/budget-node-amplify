"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthProvider = void 0;
const axios = require('axios');
const config_1 = __importDefault(require("../../../../config"));
const userInfo_1 = require("../../../../models/userInfo");
const logger_1 = __importDefault(require("../../../../utils/logger"));
require("localstorage-polyfill");
class GoogleAuthProvider {
    constructor() {
        this.JWT_TOKEN = "JWT_TOKEN";
    }
    async getAccessToken(authCode, action) {
        const options = { headers: { accept: 'application/json' } };
        console.log("action : " + action);
        const body = {
            client_id: config_1.default.externalAuth.google.clientID,
            client_secret: config_1.default.externalAuth.google.clientSecret,
            redirect_uri: config_1.default.externalAuth.google.callbackURL,
            grant_type: 'authorization_code',
            code: authCode
        };
        return axios.post(config_1.default.externalAuth.google.accessTokenUrl, body, options)
            .then((res) => res.data.access_token) // INFO: also `refresh_token` and `expires_in` in res.data
            .catch((error) => {
            console.log(" h.google.getAccessToken_failed ");
            logger_1.default.error('auth.google.getAccessToken_failed', { error });
            throw error;
        });
    }
    async getUserInfo(accessToken) {
        console.log("get UserInfo from Google accessToken: " + JSON.stringify(accessToken));
        const options = { headers: { Authorization: `Bearer ${accessToken}`, scope: "https://www.googleapis.com/auth/userinfo.profile" } };
        return axios.get(config_1.default.externalAuth.google.userInfoUrl, options)
            .then((res) => {
            logger_1.default.info('auth.google.getUserInfo', { googleId: res.data.sub });
            console.log(" UserInfo from Google " + JSON.stringify(res.data));
            const userIN = new userInfo_1.UserInfo();
            userIN.id = "1";
            userIN.accountId = "1";
            userIN.login = "true";
            userIN.email = res.data.email;
            console.log("node userInfo " + JSON.stringify(userIN));
            return userIN;
            /*  Thees are in G:\jee-neonvinay\eclipseox\workspace\budget-angular\src\app\models
                userIN.account=undefined;
                     userIN.password=undefined;
                     userIN.role=undefined;
                     userIN.confirmed=undefined;
             userIN.tfa=undefined;
            */
        }).catch((error) => {
            logger_1.default.error('auth.google.getUserInfo_failed', { error });
            console.log("Could not get UserInfo from Google ");
            return Promise.reject('Could not get UserInfo from Google');
        });
    }
}
exports.GoogleAuthProvider = GoogleAuthProvider;
