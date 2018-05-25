/// <reference types="knex" />
/// <reference types="bluebird" />
import { Run } from './Run';
import * as Knex from 'knex';
import * as Bluebird from 'bluebird';
export declare class Migration {
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {{}[]}
     */
    private builders;
    /**
     * @type {Function}
     */
    private migration;
    /**
     * @type {Run}
     */
    private migrationRun;
    /**
     * Holds whether or not this Migration is a promise.
     *
     * @type {boolean}
     */
    private promise;
    /**
     * Construct a new Migration.
     *
     * @param {Function} migration
     * @param {Run}      run
     */
    constructor(migration: Function, run: Run);
    /**
     * Prepare the migration by running it.
     */
    private prepare();
    /**
     * Get a schemabuilder to work with.
     *
     * @param {string} store
     *
     * @returns {Knex.SchemaBuilder}
     */
    getSchemaBuilder(store?: string): Knex.SchemaBuilder;
    /**
     * Get a (reusable) transaction for `storeName`
     *
     * @param {string} storeName
     *
     * @returns {Bluebird<Knex.Transaction>}
     */
    getTransaction(storeName?: string): Bluebird<Knex.Transaction>;
    /**
     * Get a builder. This includes the knex instance.
     *
     * @param {string} store
     *
     * @returns {{schema: Knex.SchemaBuilder, knex: Knex}}
     */
    getBuilder(store?: string): {
        schema: Knex.SchemaBuilder;
        knex: Knex;
    };
    /**
     * Get the SQL for current builders.
     *
     * @returns {string}
     */
    getSQL(): string;
    /**
     * Run the migration.
     *
     * @returns {Bluebird<any>}
     */
    run(): Bluebird<any>;
    /**
     * Get connection for store.
     *
     * @param {string} store
     *
     * @returns {knex}
     */
    private getConnection(store?);
}
