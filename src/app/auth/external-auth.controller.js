"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const external_auth_service_1 = require("./services/external-auth/external-auth.service");
const state_service_1 = __importDefault(require("./services/external-auth/state.service"));
const config_1 = __importDefault(require("../../config"));
const axios = require('axios');
const router = (0, express_1.Router)();
const JWT_TOKEN = "JWT_TOKEN";
const externalAuthService = new external_auth_service_1.ExternalAuthService();
router.get('/:provider/:action', function (req, res) {
    const provider = req.params.provider;
    const action = req.params.action === 'signup' ? 'signup' : 'login';
    console.log("provider " + provider);
    console.log("action " + action);
    if (provider in config_1.default.externalAuth) {
        const providerConfig = config_1.default.externalAuth[provider];
        // const providerConfig = (config.externalAuth as any)[provider];
        const redirect_uri = `${providerConfig.callbackURL}`; // /${action}
        const body = "";
        const options = { headers: { accept: 'application/json' } };
        /*   axios.post(`${providerConfig.authorizeUrl}` +
             `?client_id=${providerConfig.clientID}` +
             `&response_type=code` +
             `&state=${stateService.setAndGetNewState(req.session)}` +
             // `&access_type=offline` + // INFO: this requests Refresh Token
             `&scope=${providerConfig.scope}` +
             `&redirect_uri=${redirect_uri}`, body, options)
             .then((res: any) => res.data['access_token']) // INFO: also `refresh_token` and `expires_in` in res.data
             .catch((error: any) => {
               log.error('auth.google.getAccessToken_failed', { error });
               throw error;
             })
         */
        res.redirect(`${providerConfig.authorizeUrl}` +
            `?client_id=${providerConfig.clientID}` +
            `&response_type=code` +
            `&state=${state_service_1.default.setAndGetNewState(req.session)}` +
            // `&access_type=offline` + // INFO: this requests Refresh Token
            `&scope=${providerConfig.scope}` +
            `&redirect_uri=${redirect_uri}`);
    }
    else {
        res.redirect(`/login?msg=Provider not supported`);
    }
});
router.get('/:provider/callback/signup', function (req, res) {
    const provider = req.params.provider;
    const authCode = req.query.code;
    const state = req.query.state;
    state_service_1.default.assertStateIsValid(req.session, state).then(() => externalAuthService.signup(provider, authCode, req.session).then(() => {
        res.redirect('/');
    })).catch((err) => {
        res.redirect(`/login?msg=${err ? err : 'Signup failed'}`);
    });
});
router.get('/:provider/callback/login', function (req, res) {
    const provider = req.params.provider;
    const authCode = req.query.code;
    const state = req.query.state;
    console.log("authCode " + authCode);
    // EXTRA Oct 3 for removal of TOKEN from URL after login in dashboard page
    let providerConfig = null;
    let redirect_app_uri = null;
    if (provider in config_1.default.externalAuth) {
        providerConfig = config_1.default.externalAuth[provider];
        redirect_app_uri = `${providerConfig.callbackAPPURL}`; // /${action}
    }
    const siteURL = redirect_app_uri != null ? redirect_app_uri : 'https://wwww.glaubhanta.site';
    // EXTRA Oct 3 for removal of TOKEN from URL after login in dashboard page
    state_service_1.default.assertStateIsValid(req.session, state).then(() => externalAuthService.login(provider, authCode, req.session).then(() => {
        const token = localStorage.getItem(JWT_TOKEN); // localStorage.setItem(this.JWT_TOKEN
        // EXTRA Oct 3 for removal of TOKEN from URL after login in dashboard page
        const auth = "Bearer " + token;
        // To Write a Cookie readable client side httpOnly:false , secure true for https only , valid only 1 minute
        res.cookie("JWT_TOKEN", token, { maxAge: 60 * 1000, httpOnly: false, secure: true, path: "/" });
        res.writeHead(302, { 'Location': 'https://localhost:8000/app' });
        res.end();
        // res.redirect(`https://localhost:8000/app?jwt_token=${token}`);
        // EXTRA Oct 3 for removal of TOKEN from URL after login in dashboard page
        console.log(" redirecting to :" + `https://localhost:8000/app`); // ?jwt_token=${token}
    })).catch((err) => {
        console.log("login failed  ");
        res.redirect(`https://localhost:8000/login?msg=${err ? err : 'Login failed'}`);
    });
});
router.get('/:provider/logout', function (req, res) {
    const provider = req.params.provider;
    localStorage.clear(); // .setItem(JWT_TOKEN,null);
    // EXTRA Oct 3 for removal of TOKEN from URL after login in dashboard page
    let providerConfig = null;
    let redirect_app_uri = null;
    if (provider in config_1.default.externalAuth) {
        providerConfig = config_1.default.externalAuth[provider];
        redirect_app_uri = `${providerConfig.callbackAPPURL}`; // /${action}
    }
    // EXTRA Oct 3 for removal of TOKEN from URL after login in dashboard page
    res.redirect(`https://localhost:8000/login`); // ?msg=${'message' : 'Logout failed'}
});
exports.default = router;
