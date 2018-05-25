"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
class Tracker {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.field('status', { type: 'integer' });
        mapping.forProperty('observers').manyToMany({ targetEntity: User_1.User, inversedBy: 'trackers' });
    }
}
exports.Tracker = Tracker;
