"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Publisher {
    static setMapping(mapping) {
        mapping.forProperty('id')
            .field({ type: 'integer' })
            .generatedValue('autoIncrement')
            .primary();
        mapping.field('name', { type: 'string', size: 24 });
        mapping.oneToMany('books', { targetEntity: 'Book', mappedBy: 'publisher' });
    }
}
exports.Publisher = Publisher;
