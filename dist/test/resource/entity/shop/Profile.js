"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Profile {
    static setMapping(mapping) {
        mapping.field('id', { type: 'integer' }).primary('id').generatedValue('id', 'autoIncrement');
        mapping.field('slogan', { type: 'string', size: 24 });
    }
}
exports.Profile = Profile;
