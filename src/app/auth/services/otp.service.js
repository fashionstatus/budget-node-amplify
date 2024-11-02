"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const otplib_1 = require("otplib");
const logger_1 = __importDefault(require("./../../../utils/logger"));
class OtpService {
    checkOtpIfRequired(loginRequest, user) {
        return new Promise((resolve, reject) => {
            if (user.tfa) {
                if (!loginRequest.otp) {
                    return reject('OTP_REQUIRED');
                }
                if (!user.tfaSecret) {
                    logger_1.default.error('auth.otp.secret_missing', { user });
                    return reject('System error. Contact support.');
                }
                try {
                    // INFO: async authenticator implementation is also available
                    const isValid = otplib_1.authenticator.check(loginRequest.otp, user.tfaSecret);
                    if (!isValid) {
                        logger_1.default.error('auth.otp.invalid_code', { user });
                        return reject('Invalid one-time code');
                    }
                }
                catch (error) {
                    logger_1.default.error('auth.otp.error', { user, error });
                    return reject();
                }
                logger_1.default.info('auth.otp.valid', { user });
            }
            resolve();
        });
    }
    getOtpKeyUri(user) {
        const service = 'BudgetApp';
        return otplib_1.authenticator.keyuri(user.email, service, user.tfaSecret);
    }
    generateNewSecret() {
        const bytes = 20; // 20 * 8 = 160 bits
        return otplib_1.authenticator.generateSecret(bytes); // generated secret is Base32 encoded (so will have different length)
    }
}
exports.OtpService = OtpService;
