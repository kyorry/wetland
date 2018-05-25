"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Criteria_1 = require("./Criteria");
class On extends Criteria_1.Criteria {
    constructor() {
        super(...arguments);
        this.conditions = { and: 'on', or: 'orOn' };
    }
}
exports.On = On;
