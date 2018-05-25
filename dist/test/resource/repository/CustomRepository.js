"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityRepository_1 = require("../../../src/EntityRepository");
class CustomRepository extends EntityRepository_1.EntityRepository {
    foo() {
        return 'bar';
    }
}
exports.CustomRepository = CustomRepository;
