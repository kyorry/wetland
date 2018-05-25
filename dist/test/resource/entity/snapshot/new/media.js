"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Media {
    static setMapping(mapping) {
        // Pk
        mapping.forProperty('id').increments().primary();
        // // Fields
        mapping.forProperty('url').field({ type: 'string' });
        // Relations
        mapping.forProperty('offer')
            .manyToOne({ targetEntity: 'Offer', inversedBy: 'pictures' })
            .joinColumn({ onDelete: 'cascade' });
    }
}
exports.Media = Media;
