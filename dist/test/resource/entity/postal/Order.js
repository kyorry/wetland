"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Order {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('name', { type: 'string' });
    }
}
exports.Order = Order;
