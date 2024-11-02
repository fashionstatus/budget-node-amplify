"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupService = void 0;
const randtoken = require('rand-token');
const bcrypt = require("bcryptjs");
const config_1 = __importDefault(require("../../../config"));
const otp_service_1 = require("./otp.service");
const in_memory_account_repository_1 = require("../repositories/in-memory/in-memory-account.repository");
const in_memory_user_repository_1 = require("../repositories/in-memory/in-memory-user.repository");
const in_memory_categories_repository_1 = require("../../settings/categories/in-memory-categories.repository");
// import { User } from 'src/models/user';
const user_1 = require("../../../models/user");
require("localstorage-polyfill");
const logger_1 = __importDefault(require("./../../../utils/logger"));
const jwt = require("jsonwebtoken");
const store2_1 = __importDefault(require("store2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const userRepository = new in_memory_user_repository_1.InMemoryUserRepository();
const accountRepository = new in_memory_account_repository_1.InMemoryAccountRepository();
const categoriesRepository = new in_memory_categories_repository_1.InMemoryCategoriesRepository();
const otp = new otp_service_1.OtpService();
/*
  >>> Salt prevents from Rainbow Tables attack. How bcrypt generates salt?
  >>> Example code with explicit salt generation and hashing:

  bcrypt.genSalt(10).then(salt => {
    bcrypt.hash("password here", salt)
      .then(hash => console.log({ salt, hash }));
  });

  >>> Results in:

  {
    salt: '$2a$10$f8.SA/84vLuIqChGu4Y/6u',
    hash: '$2a$10$f8.SA/84vLuIqChGu4Y/6uFZMdQsBSAnYjymCIrXLVsIihRiDN4kS'
  }

  >>> Where:

  $2a$                            - bcrypt prefix
  $10$                            - cost factor (2^10 ==> 1,024 iterations)
  f8.SA/84vLuIqChGu4Y/6u          - salt
  FZMdQsBSAnYjymCIrXLVsIihRiDN4kS - hash

  >>> Structure:

  $2a$[cost]$[22 character salt][31 character hash]
  \__/\____/ \_________________/\_________________/
  Alg  Cost          Salt              Hash

*/
class SignupService {
    constructor() {
        this.JWT_TOKEN = "JWT_TOKEN";
        const LocalStorage = require('node-localstorage').LocalStorage;
        // var LocalStorage = LocalStorageT.localStorage;
        console.log("Local Storage re-inisitaled not global soem problme");
        // this.localStorage = new LocalStorage(fileName);
    }
    getLocalStorage() {
        const LocalStorage = require('node-localstorage').LocalStorage;
        // var LocalStorage = LocalStorageT.localStorage;
        console.log("Local Storage re-inisitaled not global soem problme");
        // localStorage = new LocalStorage(fileName);
    }
    createSignedToken(user) {
        const payload = user_1.User.toSafeUser(user);
        return jwt.sign(payload, config_1.default.jwtSecret, { expiresIn: 600 }); // 600 seconds = 10 minutes
    }
    async signup(signupRequest) {
        console.log("Sigun service ...");
        const confirmationCode = randtoken.uid(256);
        const user = {
            accountId: '',
            email: signupRequest.email,
            password: '',
            role: 'OWNER',
            confirmed: false,
            confirmationCode,
            createdWith: 'password',
            tfaSecret: otp.generateNewSecret()
        };
        return bcrypt.hash(signupRequest.password, 10) // 10 is the cost factor (implicit salt generation)
            .then(hashedPassword => accountRepository.createAccount({})
            .then(accountId => {
            user.accountId = accountId;
            user.password = hashedPassword;
            Promise.all([
                categoriesRepository.createDefaultCategories(accountId),
                userRepository.createUser(user),
                userRepository.updateUserFromJSONfile(user)
            ]);
        }).then(() => {
            logger_1.default.info('auth.signup_successful', { email: signupRequest.email });
            const jwtToken = this.createSignedToken(user);
            // this.getLocalStorage();
            // this.sendConfirmationEmail(signupRequest.email, confirmationCode);
            if (typeof this.localStorage === undefined || this.localStorage === null) {
                this.getLocalStorage();
            }
            else if (typeof this.localStorage !== "undefined" || this.localStorage !== null) {
                try {
                    // console.log(" user tokenised "+jwtToken)
                    console.log(" signup local storeage  " + JSON.stringify(this.localStorage));
                    (0, store2_1.default)(this.JWT_TOKEN, jwtToken);
                    // this.localStorage.setItem(this.JWT_TOKEN, jwtToken);
                }
                catch (tre) {
                    console.log(" signup service ${tre} ");
                }
            }
            return Promise.resolve(jwtToken);
        }).catch(error => {
            logger_1.default.error('auth.signup_failed', { email: signupRequest.email });
            throw error; // rethrow the error for the controller
        }));
    }
    confirm(email, confirmationCode) {
        return userRepository.getUserByEmail(email).then(user => {
            if (user && !user.confirmed && user.confirmationCode === confirmationCode) {
                user.confirmed = true;
                user.confirmationCode = undefined;
                logger_1.default.info('auth.confirmation_successful', { email });
            }
            else {
                logger_1.default.warn('auth.confirmation_failed', { email });
                return Promise.reject();
            }
        });
    }
    sendConfirmationEmail(email, code) {
        const link = `${config_1.default.clientUrl}/confirm?email=${email}&code=${code}`;
        console.log(`>>> LINK >>>: ${link}`); // mock email sending :)
        logger_1.default.info('auth.signup_confirmation_email_sent', { email });
    }
}
exports.SignupService = SignupService;
