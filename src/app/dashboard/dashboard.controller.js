"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const express_1 = require("express");
const controller_utils_1 = require("../../utils/controller.utils");
class DashboardController {
    constructor(repository) {
        this.repository = repository;
        this.router = (0, express_1.Router)();
        this.initRoutes();
    }
    getRouter() {
        return this.router;
    }
    initRoutes() {
        this.router.get('/budgets', (req, res) => {
            const user = req.user;
            this.repository.getBugdets(user.accountId, (0, controller_utils_1.buildPeriodFromRequest)(req))
                .then(budgets => res.json(budgets))
                .catch(() => res.status(404).json({ msg: 'Budgets not found' }));
        });
        this.router.get('/budget-summary', (req, res) => {
            const user = req.user;
            this.repository.getBudgetSummary(user.accountId, (0, controller_utils_1.buildPeriodFromRequest)(req))
                .then(summary => res.json(summary))
                .catch(() => res.status(404).json({ msg: 'Budget summary not found' }));
        });
    }
}
exports.DashboardController = DashboardController;
