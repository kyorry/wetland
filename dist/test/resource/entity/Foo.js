"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FooEntity {
    static setMapping(mapping) {
        mapping.field('camelCase', { type: 'integer' });
        mapping.field('PascalCase', { type: 'integer' });
    }
}
exports.FooEntity = FooEntity;
