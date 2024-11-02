"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const randtoken = require('rand-token');
const logger_1 = __importDefault(require("../../../../utils/logger"));
const LENGTH = 32;
exports.default = {
    setAndGetNewState(session) {
        session.oauthState = randtoken.generate(LENGTH);
        console.log("StateService : setAndGetNewState session state  " + session.oauthState);
        return session.oauthState;
    },
    getAndRemoveState(session) {
        const state = session.oauthState;
        session.oauthState = null;
        return state;
    },
    assertStateIsValid(session, state) {
        return new Promise((resolve, reject) => {
            console.log("StateService : assertStateIsValid state  " + state);
            if (!!state && state.length === LENGTH && state === session.oauthState) {
                console.log("StateService : assertStateIsValid session.oauthState  " + session.oauthState);
                logger_1.default.info('auth.external.state.valid_check', { state });
                resolve();
            }
            else {
                console.log("StateService Failed: assertStateIsValid session.oauthState  " + session.oauthState);
                logger_1.default.error('auth.external.state.failed_check', { state, expectedState: session.oauthState });
                reject('Invalid state paramater');
            }
        });
    }
};
