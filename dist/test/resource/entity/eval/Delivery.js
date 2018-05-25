"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = require("./Address");
const Order_1 = require("./Order");
class Delivery {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.forProperty('created').field({ type: 'timestamp', defaultTo: mapping.now() });
        mapping.manyToOne('address', { targetEntity: Address_1.Address, inversedBy: 'deliveries' });
        mapping.forProperty('order')
            .joinColumn({ onDelete: 'cascade' })
            .oneToOne({ targetEntity: Order_1.Order });
    }
}
exports.Delivery = Delivery;
