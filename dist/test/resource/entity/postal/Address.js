"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Delivery_1 = require("./Delivery");
class Address {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('street', { type: 'string' });
        mapping.field('houseNumber', { type: 'integer', name: 'house_number' });
        mapping.field('postcode', { type: 'string' });
        mapping.field('country', { type: 'string' });
        mapping.oneToMany('deliveries', { targetEntity: Delivery_1.Delivery, mappedBy: 'address' });
    }
}
exports.Address = Address;
