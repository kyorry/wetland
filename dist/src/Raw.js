"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A raw query
 */
class Raw {
    /**
     * @param {string} query
     */
    constructor(query) {
        this.setQuery(query);
    }
    /**
     * @returns {string}
     */
    getQuery() {
        return this.query;
    }
    /**
     * @param {string} value
     */
    setQuery(value) {
        this.query = value;
    }
}
exports.Raw = Raw;
