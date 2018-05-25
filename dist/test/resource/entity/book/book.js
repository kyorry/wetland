"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Book {
    static setMapping(mapping) {
        mapping.field('id', { type: 'integer' }).primary('id').generatedValue('id', 'autoIncrement');
        mapping.field('name', { type: 'string', size: 24 });
        mapping
            .manyToOne('publisher', { targetEntity: 'Publisher', inversedBy: 'books' })
            .joinColumn('publisher', { nullable: false });
    }
}
exports.Book = Book;
