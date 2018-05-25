import { Wetland } from './Wetland';
export declare class SchemaManager {
    /**
     * @type {Wetland}
     */
    private wetland;
    /**
     * @type {SchemaBuilder}
     */
    private schemaBuilder;
    /**
     * @param {Wetland} wetland
     */
    constructor(wetland: Wetland);
    /**
     * Get the sql for schema.
     *
     * @param {{}}      [previous] Optional starting point to diff against.
     * @param {boolean} [revert]
     *
     * @returns {string}
     */
    getSQL(previous?: Object, revert?: boolean): string;
    /**
     * Get the code for schema.
     *
     * @param {{}}      [previous] Optional starting point to diff against.
     * @param {boolean} [revert]
     *
     * @returns {string}
     */
    getCode(previous?: Object, revert?: boolean): string;
    /**
     * Create the schema (alias for `.apply({})`)
     *
     * @returns {Promise<any>}
     */
    create(): Promise<any>;
    /**
     * Diff and execute.
     *
     * @param {{}}      [previous] Optional starting point to diff against.
     * @param {boolean} [revert]
     *
     * @returns {Promise<any>}
     */
    apply(previous?: Object, revert?: boolean): Promise<any>;
    /**
     * Prepare (diff) instructions.
     *
     * @param {{}}      previous
     * @param {boolean} [revert]
     *
     * @returns {SchemaBuilder}
     */
    private prepare(previous, revert?);
}
