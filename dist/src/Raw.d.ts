/**
 * A raw query
 */
export declare class Raw {
    /**
     * @type {string}
     */
    private query;
    /**
     * @param {string} query
     */
    constructor(query: any);
    /**
     * @returns {string}
     */
    getQuery(): string;
    /**
     * @param {string} value
     */
    setQuery(value: string): void;
}
