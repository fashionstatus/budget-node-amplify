"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const session_auth_service_1 = require("./session-auth.service");
const otp_service_1 = require("./otp.service");
const authRequest_1 = require("./../../../models/authRequest");
const user_1 = require("./../../../models/user");
const fakeUser = {
    email: 'bartosz@app.com',
    password: '$2y$10$k.58cTqd/rRbAOc8zc3nCupCC6QkfamoSoO2Hxq6HVs0iXe7uvS3e',
    confirmed: true,
    tfa: true,
    tfaSecret: 'abc'
};
const request = {
    session: { user: fakeUser }
};
const responseMock = () => {
    return {
        statusCode: 0,
        json: jest.fn()
    };
};
const nextMock = jest.fn();
const otpStub = () => {
    return {
        checkOtpIfRequired: jest.fn(() => Promise.resolve())
    };
};
const userRepoStub = (user = fakeUser) => {
    return {
        getUserByEmail: jest.fn(() => Promise.resolve(user))
    };
};
describe('SessionAuthService', () => {
    describe('authenticate method', () => {
        it('returns a request handler', () => {
            // given
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            // when
            const result = sessionAuthService.authenticate();
            // then
            expect(typeof result).toBe('function');
        });
        it('returns a handler that continues execution when user in session', () => {
            // given
            const newResponseMock = responseMock();
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            const handler = sessionAuthService.authenticate();
            // when
            handler(request, newResponseMock, nextMock);
            // then
            expect(nextMock).toHaveBeenCalled();
        });
        it('returns a handler that finishes execution when no user in session', () => {
            // given
            const newResponseMock = responseMock();
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            const requestWithoutUser = { session: { user: null } };
            const handler = sessionAuthService.authenticate();
            // when
            handler(requestWithoutUser, newResponseMock, nextMock);
            // then
            expect(newResponseMock.statusCode).toBe(401);
            expect(newResponseMock.json).toHaveBeenCalled();
        });
    });
    describe('login method', () => {
        it('logs in and returns the logged user', (done) => {
            // given
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            const request = new authRequest_1.AuthRequest('bartosz@app.com', '123', '', {});
            // when
            sessionAuthService.login(request).then((user) => {
                // then
                expect(user).toBeTruthy();
                done(); // must be called within the timeout (default 5000ms)
            });
        });
        it('fails to login with a wrong password', (done) => {
            // given
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            const request = new authRequest_1.AuthRequest('bartosz@app.com', 'wrong', '', {});
            // when
            sessionAuthService.login(request).catch(() => {
                // then
                done(); // must be called within the timeout (default 5000ms)
            });
        });
        it('fails to login unconfirmed user with a valid password', (done) => {
            // given
            const unconfirmedUser = { ...fakeUser, confirmed: false };
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub(unconfirmedUser));
            const request = new authRequest_1.AuthRequest('bartosz@app.com', '123', '', {});
            // when
            sessionAuthService.login(request).catch(() => {
                // then
                done(); // must be called within the timeout (default 5000ms)
            });
        });
        // classic style => using real collaborator's code
        it('fails to login with invalid otp - classic style', (done) => {
            // given
            const otp = new otp_service_1.OtpService(); // production code of OtpService
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otp, userRepoStub());
            const request = new authRequest_1.AuthRequest('bartosz@app.com', '123', 'invalid', {});
            // when
            sessionAuthService.login(request).catch((error) => {
                // then
                expect(error.toString().toLowerCase()).toContain('invalid');
                done(); // must be called within the timeout (default 5000ms)
            });
        });
        // london style => using ONLY class-under-test and mocking every collaborator
        it('fails to login with invalid otp - London style', (done) => {
            // given
            const otpMock = {
                checkOtpIfRequired: jest.fn(() => Promise.reject())
            };
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpMock, userRepoStub());
            const request = {
                email: 'bartosz@app.com',
                password: '123'
            };
            // when
            sessionAuthService.login(request).catch(() => {
                // then
                expect(otpMock.checkOtpIfRequired).toHaveBeenCalledWith(request, fakeUser);
                done(); // must be called within the timeout (default 5000ms)
            });
        });
        it('fails to login without any otp', (done) => {
            // given
            const otp = new otp_service_1.OtpService();
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otp, userRepoStub());
            const request = new authRequest_1.AuthRequest('bartosz@app.com', '123', '', {});
            // when
            sessionAuthService.login(request).catch((error) => {
                // then
                expect(error).toBe('OTP_REQUIRED');
                done(); // must be called within the timeout (default 5000ms)
            });
        });
    });
    describe('logout method', () => {
        it('logs out successfully', () => {
            // given
            const session = {
                user: fakeUser,
                destroy: jest.fn((cb) => cb())
            };
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            // when
            sessionAuthService.logout(session);
            // then
            expect(session.destroy).toHaveBeenCalled();
        });
        it('does nothing when session not found', (done) => {
            // given
            const session = {};
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            // when
            sessionAuthService.logout(session).then(() => {
                // then
                done();
            });
        });
        it('rejects a promise if error occured', (done) => {
            // given
            const session = {
                user: fakeUser,
                destroy: jest.fn((cb) => cb({ error: 'error' }))
            };
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            // when
            sessionAuthService.logout(session).catch(() => {
                // then
                done();
            });
        });
    });
    describe('getCurrentUser method', () => {
        it('returns the user', () => {
            // given
            const session = {
                user: fakeUser,
            };
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            // when
            sessionAuthService.getCurrentUser(session).then((user) => {
                // then
                expect(user).toEqual(user_1.User.toSafeUser(fakeUser));
            });
        });
        it('returns nothing if no user found', (done) => {
            // given
            const session = {};
            const sessionAuthService = new session_auth_service_1.SessionAuthService(otpStub(), userRepoStub());
            // when
            sessionAuthService.getCurrentUser(session).then((user) => {
                // then
                done();
            });
        });
    });
});
