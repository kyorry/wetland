"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('name', { type: 'string', size: 24 });
    }
}
exports.User = User;
