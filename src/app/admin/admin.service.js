"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const config_1 = __importDefault(require("./../../config"));
class AdminService {
    constructor() {
        this.store = config_1.default.sessionConfig.store;
    }
    getActiveSessions() {
        return new Promise((resolve, reject) => {
            this.store.all ? ((err, sessions) => {
                if (err) {
                    return reject(err);
                }
                if (sessions) {
                    const result = Object.entries(sessions).map(([sessionId, session]) => {
                        return {
                            sessionId,
                            user: {
                                email: session.user?.email,
                                role: session.user?.role
                            }
                        };
                    });
                    resolve(result);
                }
            }) : [];
        });
    }
    destroySession(sessionId) {
        return new Promise((resolve, reject) => {
            this.store.destroy(sessionId, (error) => {
                error ? reject(error) : resolve();
            });
        });
    }
}
exports.AdminService = AdminService;
