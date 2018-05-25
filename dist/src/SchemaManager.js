"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaBuilder_1 = require("./SchemaBuilder");
class SchemaManager {
    /**
     * @param {Wetland} wetland
     */
    constructor(wetland) {
        this.wetland = wetland;
        this.schemaBuilder = new SchemaBuilder_1.SchemaBuilder(wetland.getManager());
    }
    /**
     * Get the sql for schema.
     *
     * @param {{}}      [previous] Optional starting point to diff against.
     * @param {boolean} [revert]
     *
     * @returns {string}
     */
    getSQL(previous = {}, revert = false) {
        return this.prepare(previous, revert).getSQL();
    }
    /**
     * Get the code for schema.
     *
     * @param {{}}      [previous] Optional starting point to diff against.
     * @param {boolean} [revert]
     *
     * @returns {string}
     */
    getCode(previous = {}, revert = false) {
        return this.prepare(previous, revert).getCode();
    }
    /**
     * Create the schema (alias for `.apply({})`)
     *
     * @returns {Promise<any>}
     */
    create() {
        return this.apply({});
    }
    /**
     * Diff and execute.
     *
     * @param {{}}      [previous] Optional starting point to diff against.
     * @param {boolean} [revert]
     *
     * @returns {Promise<any>}
     */
    apply(previous = {}, revert = false) {
        return this.prepare(previous, revert).apply();
    }
    /**
     * Prepare (diff) instructions.
     *
     * @param {{}}      previous
     * @param {boolean} [revert]
     *
     * @returns {SchemaBuilder}
     */
    prepare(previous, revert = false) {
        let snapshot = this.wetland.getSnapshotManager();
        let serializable = snapshot.getSerializable();
        let instructions;
        if (revert) {
            instructions = snapshot.diff(serializable, previous);
        }
        else {
            instructions = snapshot.diff(previous, serializable);
        }
        return this.schemaBuilder.process(instructions);
    }
}
exports.SchemaManager = SchemaManager;
