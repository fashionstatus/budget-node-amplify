"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRequest_1 = require("../../models/authRequest");
const signup_service_1 = require("./services/signup.service");
const password_service_1 = require("./services/password.service");
const external_auth_controller_1 = __importDefault(require("./external-auth.controller"));
const auth_service_instance_1 = __importDefault(require("./services/auth.service.instance"));
const auth_validator_1 = __importDefault(require("./auth.validator"));
const store2_1 = __importDefault(require("store2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const appDir = "/";
const basePATH = process.env.NODE_BASE_PATH;
const router = (0, express_1.Router)();
const signupService = new signup_service_1.SignupService();
const passwordService = new password_service_1.PasswordService();
const JWT_TOKEN = "JWT_TOKEN";
const LocalStorage = require('node-localstorage').LocalStorage;
// const localStorage =  new LocalStorage(fileName);
router.post('/signup', auth_validator_1.default, function (req, res) {
    const signupRequest = authRequest_1.AuthRequest.buildFromRequest(req);
    signupService.signup(signupRequest).then((jet) => {
        try {
            let token = (0, store2_1.default)(JWT_TOKEN); // localStorage.getItem(JWT_TOKEN) // localStorage.setItem(this.JWT_TOKEN
            if (token === null || token === undefined) {
                token = jet;
                (0, store2_1.default)(JWT_TOKEN, jet);
                // localStorage.setItem(JWT_TOKEN, jet);
            }
            // console.log(" redirecting to :"+`https://localhost:8000/app?jwt_token=${token}`)
            // res.redirect(`https://localhost:8000/app?jwt_token=${token}`);
        }
        catch (tre) {
            console.log(" signup controller ${tre} ");
        }
        const data = { email: signupRequest.email, code: jet };
        res.status(200).json(data);
        /* try {
          let token = localStorage.getItem(JWT_TOKEN) //localStorage.setItem(this.JWT_TOKEN
          if (token === null || token ===undefined){
              token = jet;
          }
          console.log(" redirecting to :"+`https://localhost:8000/app?jwt_token=${token}`)
          res.redirect(`https://localhost:8000/app?jwt_token=${token}`);
        } catch(tre){
              console.log(" signup controller ${tre} ");
    
        }*/
    }).catch((err) => {
        res.status(400).json({ msg: 'Signup failed', err });
    });
});
router.post('/confirm', function (req, res) {
    const email = req.body.email; // may require "as string"; To check after TypeScript update
    const token = localStorage.getItem(JWT_TOKEN);
    const confirmationCode = req.body.code;
    console.log(`confirm email: ${email} and code: ${confirmationCode}`);
    signupService.confirm(email, confirmationCode).then(() => {
        res.sendStatus(204);
    }).catch(() => {
        res.status(400).json({ msg: 'Confirmation failed' });
    });
});
router.post('/setup', function (req, res) {
    const email = req.body.email;
    const code = req.body.code;
    const password = req.body.password;
    passwordService.setup(email, code, password).then(() => {
        res.sendStatus(204);
    }).catch(() => {
        res.status(400).json({ msg: 'Setting password failed' });
    });
});
router.post('/recover-request', function (req, res) {
    const email = req.body.email;
    passwordService.requestRecovery(email).then(() => {
        res.sendStatus(204);
    }).catch(() => {
        res.status(400).json({ msg: 'Recovery failed' });
    });
});
router.post('/recover', function (req, res) {
    const email = req.body.email;
    const code = req.body.code;
    const password = req.body.password;
    passwordService.recover(email, code, password).then(() => {
        res.sendStatus(204);
    }).catch(() => {
        res.status(400).json({ msg: 'Recovery failed failed' });
    });
});
router.post('/login', function (req, res) {
    const loginRequest = authRequest_1.AuthRequest.buildFromRequest(req);
    auth_service_instance_1.default.login(loginRequest).then(result => {
        res.json(result);
    }).catch((err) => {
        res.status(401).json({ msg: err ? err : 'Login failed' });
    });
});
router.get('/logout', function (req, res) {
    auth_service_instance_1.default.logout(req.session).then(() => {
        res.sendStatus(204);
    });
});
router.get('/user', function (req, res) {
    auth_service_instance_1.default.getCurrentUser(req.session).then((user) => {
        res.status(200).json(user);
    });
});
router.use('/external', external_auth_controller_1.default);
exports.default = router;
