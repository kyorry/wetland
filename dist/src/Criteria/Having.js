"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Criteria_1 = require("./Criteria");
class Having extends Criteria_1.Criteria {
    constructor() {
        super(...arguments);
        this.conditions = { and: 'having', or: 'orHaving' };
    }
}
exports.Having = Having;
