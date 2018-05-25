"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
const List_1 = require("./List");
class Todo {
    static setMapping(mapping) {
        mapping.forProperty('id').primary().increments();
        mapping.manyToOne('list', { targetEntity: List_1.List, inversedBy: 'todos' });
        mapping.field('task', { type: 'string' });
        mapping.field('done', { type: 'boolean', nullable: true });
        mapping.oneToOne('creator', { targetEntity: User_1.User });
    }
}
exports.Todo = Todo;
