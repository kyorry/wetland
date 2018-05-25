import { Scope } from './Scope';
export declare class SchemaBuilder {
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {Array}
     */
    private builders;
    /**
     * @type {{}}
     */
    private types;
    /**
     * @type {string}
     */
    private code;
    /**
     * @type {string}
     */
    private sql;
    /**
     * @type {boolean}
     */
    private useForeignKeysGlobal;
    /**
     * @param {Scope} entityManager
     */
    constructor(entityManager: Scope);
    /**
     * Returns if foreign keys should be used.
     *
     * @param {string} store
     *
     * @returns {boolean}
     */
    private useForeignKeys(store);
    /**
     * Get the schema queries.
     *
     * @returns {string}
     */
    getSQL(): string;
    /**
     * Get the built code.
     *
     * @returns {string}
     */
    getCode(): string;
    /**
     * Run the built code.
     *
     * @returns {SchemaBuilder}
     */
    private runCode();
    /**
     * Persist the schema to the database.
     *
     * @returns {Promise<any[]>}
     */
    apply(): Promise<any>;
    /**
     * Process instructions.
     *
     * @param {{}} instructionSets
     *
     * @returns {SchemaBuilder}
     */
    process(instructionSets: any): this;
    /**
     * Build foreign key creates.
     *
     * @param {{}}        drop
     * @param {string[]}  code
     * @param {function}  spacing
     */
    private buildDropForeignKeys(drop, code, spacing);
    /**
     * Build foreign key creates.
     *
     * @param {{}}        create
     * @param {string[]}  code
     * @param {function}  spacing
     */
    private buildCreateForeignKeys(create, code, spacing);
    /**
     * Build table.
     *
     * @param {string}    action
     * @param {boolean}   createForeign
     * @param {{}}        instructions
     * @param {string[]}  code
     * @param {function}  spacing
     */
    private buildTable(action, createForeign, instructions, code, spacing);
    /**
     * Compose a field.
     *
     * @param {FieldOptions} field
     * @param {boolean}      alter
     */
    private composeField(field, alter?);
}
