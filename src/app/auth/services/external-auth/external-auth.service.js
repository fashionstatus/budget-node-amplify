"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalAuthService = void 0;
const in_memory_user_repository_1 = require("../../repositories/in-memory/in-memory-user.repository");
const in_memory_account_repository_1 = require("../../repositories/in-memory/in-memory-account.repository");
const in_memory_categories_repository_1 = require("../../../settings/categories/in-memory-categories.repository");
const external_auth_factory_1 = require("./external-auth.factory");
require("localstorage-polyfill");
const logger_1 = __importDefault(require("../../../../utils/logger"));
const user_1 = require("../../../../models/user");
const randtoken = require('rand-token');
const jwt = require("jsonwebtoken");
const config_1 = __importDefault(require("../../../../config"));
const store2_1 = __importDefault(require("store2"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//  path.join(appDir,'/'+'scratch')
// TODO provide configuration for repositories
const userRepository = new in_memory_user_repository_1.InMemoryUserRepository();
const accountRepository = new in_memory_account_repository_1.InMemoryAccountRepository();
const categoriesRepository = new in_memory_categories_repository_1.InMemoryCategoriesRepository();
class ExternalAuthService {
    constructor() {
        this.JWT_TOKEN = "JWT_TOKEN";
    }
    createSignedToken(user) {
        const payload = user_1.User.toSafeUser(user);
        return jwt.sign(payload, config_1.default.jwtSecret, { expiresIn: 600 }); // 600 seconds = 10 minutes
    }
    async login(provider, authCode, session) {
        console.log(" ExternalAuthService : provider  " + provider);
        const authProvider = (0, external_auth_factory_1.getExternalAuthProvider)(provider);
        return authProvider.getAccessToken(authCode, 'login').then(async (token) => {
            await authProvider.getUserInfo(token).then(async (userInfo) => {
                const confirmationCode = randtoken.uid(256);
                await accountRepository.createAccount({})
                    .then(async (accountId) => {
                    console.log("accountId " + accountId);
                    const user = {
                        accountId,
                        email: userInfo.email,
                        role: 'OWNER',
                        confirmed: false,
                        confirmationCode,
                        externalId: {
                            google: userInfo.id
                        },
                        createdWith: 'password',
                    };
                    console.log("accountRepository account " + JSON.stringify(user));
                    const allPromise = Promise.all([
                        categoriesRepository.createDefaultCategories(accountId),
                        userRepository.createUser(user),
                        userRepository.updateUserFromJSONfile(user)
                    ]);
                    /* wait for user find in array USERs and userRegisteredJSON.json
                       also update the userRegisteredJSON and USER array
                     */
                    try {
                        const upUserf = await allPromise;
                        console.log("allPromise result  " + JSON.stringify(upUserf)); // [resolvedValue1, resolvedValue2]
                        userRepository.getUserByExternalId(provider, userInfo.id).then(user => {
                            session.user = user;
                            console.log(" access_token : " + token);
                            console.log(" userInfo " + JSON.stringify(userInfo));
                            const jwtToken = this.createSignedToken(user);
                            console.log(" user tokenised " + jwtToken);
                            if (typeof localStorage === "undefined" || localStorage === null) {
                                const LocalStorage = require('node-localstorage').LocalStorage;
                                console.log("Local Storage re-inisitaled not global soem problme");
                                // localStorage = new LocalStorage(fileName);
                            }
                            (0, store2_1.default)(this.JWT_TOKEN, jwtToken);
                            // localStorage.localStorage.setItem(this.JWT_TOKEN, jwtToken);
                            console.log(`auth.${provider}.session_login_successful`);
                            console.log(`session.user ${JSON.stringify(session)} _login_successful`);
                            logger_1.default.info(`auth.${provider}.session_login_successful`, { user });
                        }).catch(() => {
                            console.log(`auth.${provider}.session_login_failed`);
                            logger_1.default.error(`auth.${provider}.session_login_failed`, { userInfo });
                            return Promise.reject('User not found');
                        });
                        const tokenNew = localStorage.getItem(this.JWT_TOKEN);
                        if (typeof tokenNew === "undefined" || tokenNew === null) {
                            console.log(`unable to update new signed user token `);
                        }
                        else {
                            console.log(` new signed user token ${tokenNew} `);
                        }
                    }
                    catch (error) {
                        console.log(error); // rejectReason of any first rejected promise
                    }
                });
            }); // authProvider close
        }); // return close
    } // login close
    signup(provider, authCode, session) {
        const authProvider = (0, external_auth_factory_1.getExternalAuthProvider)(provider);
        return authProvider.getAccessToken(authCode, 'signup').then((token) => authProvider.getUserInfo(token).then((userInfo) => userRepository.assertUserWithExternalIdNotExist(provider, userInfo.id).then(() => this.doSignup(provider, userInfo).then(() => {
            logger_1.default.info(`auth.${provider}.signup_successful`, { email: userInfo.email });
            userRepository.getUserByExternalId(provider, userInfo.id).then(user => {
                session.user = user;
                logger_1.default.info(`auth.${provider}.session_login_successful`, { user });
            });
        }).catch(error => {
            logger_1.default.error(`auth.${provider}.signup_failed`, { email: userInfo.email });
            throw error;
        }))));
    }
    doSignup(provider, userInfo) {
        return accountRepository.createAccount({}).then(accountId => Promise.all([
            categoriesRepository.createDefaultCategories(accountId),
            userRepository.createUser({
                accountId,
                email: userInfo.email,
                role: 'OWNER',
                confirmed: true,
                createdWith: provider,
                externalId: { [provider]: userInfo.id } // for example { github: 123 }
            })
        ]));
    }
}
exports.ExternalAuthService = ExternalAuthService;
