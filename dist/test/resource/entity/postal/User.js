"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArrayCollection_1 = require("../../../../src/ArrayCollection");
const Tracker_1 = require("./Tracker");
class User {
    constructor() {
        this.trackers = new ArrayCollection_1.ArrayCollection();
    }
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('name', { type: 'string' });
        mapping.forProperty('trackers').cascade(['persist']).manyToMany({ targetEntity: Tracker_1.Tracker, mappedBy: 'observers' });
    }
}
exports.User = User;
