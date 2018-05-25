"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CustomRepository_1 = require("../repository/CustomRepository");
class WithCustomRepository {
    static setMapping(mapping) {
        mapping.entity({ repository: CustomRepository_1.CustomRepository });
    }
}
exports.WithCustomRepository = WithCustomRepository;
