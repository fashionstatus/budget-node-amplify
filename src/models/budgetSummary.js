"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetSummary = void 0;
class BudgetSummary {
    get totalLeft() { return this.totalBudget - this.totalExpenses; }
    ;
    constructor(accountId, period) {
        this.accountId = accountId;
        this.period = period;
        this.totalExpenses = 0;
        this.totalBudget = 0;
    }
    static buildFromJson(json) {
        const budgetSummary = new BudgetSummary(json.accountId, json.period);
        return Object.assign(budgetSummary, json);
    }
}
exports.BudgetSummary = BudgetSummary;
