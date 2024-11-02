"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthService = void 0;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config_1 = __importDefault(require("../../../config"));
const passport_1 = __importDefault(require("../passport"));
const login_throttler_1 = require("./login.throttler");
const in_memory_user_repository_1 = require("../repositories/in-memory/in-memory-user.repository");
const user_1 = require("./../../../models/user");
const logger_1 = __importDefault(require("./../../../utils/logger"));
// TODO provide configuration for repositories
const userRepository = new in_memory_user_repository_1.InMemoryUserRepository();
const loginThrottler = new login_throttler_1.LoginThrottler();
class JwtAuthService {
    authenticate() {
        console.log("jwt-auth-service authenticate .... passport being used ");
        return passport_1.default.authenticate('jwt', { session: false });
    }
    login(loginRequest) {
        const email = loginRequest.email;
        console.log('JWT Auth used ' + email);
        console.log('req  ' + JSON.stringify(loginRequest));
        if (loginRequest?.email === undefined || loginRequest?.password === undefined) {
            logger_1.default.info('login payload not proper ', { loginRequest });
            console.log('login payload not proper ', { loginRequest });
            return Promise.reject('Please check request payload ');
        }
        return userRepository.getUserByEmail(email).then(user => {
            return loginThrottler.isLoginBlocked(email).then(isBlocked => {
                if (isBlocked) {
                    logger_1.default.warn('auth.jwt_login_failed.user_blocked', { email });
                    throw new Error(`Login blocked. Please try in ${config_1.default.loginThrottle.timeWindowInMinutes} minutes`);
                }
                else {
                    return bcrypt.compare(loginRequest.password, user.password).then(match => {
                        if (match && user.confirmed) {
                            const token = createSignedToken(user);
                            logger_1.default.info('auth.jwt_login_successful', { user });
                            const result = JSON.stringify('mit der Aufgabe fertig');
                            //  'закончил с задачей';
                            const timeFormat = { month: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit',
                                hour12: false, timeZoneName: 'long', timeZone: 'Asia/Kolkata' };
                            const date = new Date();
                            const cd = new Intl.DateTimeFormat('en-GB', timeFormat).format(date);
                            const version = cd;
                            const logTemp = {
                                jwt: token,
                                day: [result, version].join('\n')
                            };
                            logger_1.default.info('logged ', { logTemp });
                            return { jwt: token, day: [result, version].join('\n') };
                        }
                        else if (match && !user.confirmed) {
                            logger_1.default.info('auth.jwt_login_failed.not_confirmed', { user });
                            return Promise.reject('Please confirm your user profile');
                        }
                        else {
                            loginThrottler.registerLoginFailure(email);
                            logger_1.default.info('auth.jwt_login_failed.wrong_password', { user });
                            return Promise.reject();
                        }
                    });
                }
            });
        });
    }
    logout() {
        logger_1.default.info('auth.jwt_logout_successful');
        return Promise.resolve();
    }
    getCurrentUser() {
        return Promise.resolve();
    }
}
exports.JwtAuthService = JwtAuthService;
function createSignedToken(user) {
    const payload = user_1.User.toSafeUser(user);
    return jwt.sign(payload, config_1.default.jwtSecret, { expiresIn: 600 }); // 600 seconds = 10 minutes
}
