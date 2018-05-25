"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mapping_1 = require("./Mapping");
class Entity {
    static toObject(source) {
        if (Array.isArray(source)) {
            return source.map(target => Entity.toObject(target));
        }
        let mapping = Mapping_1.Mapping.forEntity(source);
        if (!mapping) {
            return source;
        }
        let object = mapping.getFieldNames().reduce((asObject, fieldName) => {
            asObject[fieldName] = source[fieldName];
            return asObject;
        }, {});
        let relations = mapping.getRelations();
        if (relations) {
            Reflect.ownKeys(relations).forEach(fieldName => {
                if (typeof source[fieldName] !== 'undefined') {
                    object[fieldName] = source[fieldName];
                }
            });
        }
        return object;
    }
    toObject() {
        return Entity.toObject(this);
    }
}
exports.Entity = Entity;
