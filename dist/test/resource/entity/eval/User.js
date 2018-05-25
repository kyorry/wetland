"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tracker_1 = require("./Tracker");
class User {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('name', { type: 'string' });
        mapping.forProperty('trackers').manyToMany({ targetEntity: Tracker_1.Tracker, mappedBy: 'observers' });
    }
}
exports.User = User;
