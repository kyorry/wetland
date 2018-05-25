"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArrayCollection_1 = require("../../../../src/ArrayCollection");
const User_1 = require("./User");
class Tracker {
    constructor() {
        this.observers = new ArrayCollection_1.ArrayCollection();
    }
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('status', { type: 'integer' });
        mapping.forProperty('observers').cascade(['persist']).manyToMany({ targetEntity: User_1.User, inversedBy: 'trackers' });
    }
}
exports.Tracker = Tracker;
