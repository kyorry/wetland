"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Store_1 = require("../Store");
const Bluebird = require("bluebird");
class Migration {
    /**
     * Construct a new Migration.
     *
     * @param {Function} migration
     * @param {Run}      run
     */
    constructor(migration, run) {
        /**
         * @type {{}[]}
         */
        this.builders = [];
        /**
         * Holds whether or not this Migration is a promise.
         *
         * @type {boolean}
         */
        this.promise = false;
        this.migration = migration;
        this.entityManager = run.getEntityManager();
        this.migrationRun = run;
        this.prepare();
    }
    /**
     * Prepare the migration by running it.
     */
    prepare() {
        let prepared = this.migration(this);
        if (prepared && 'then' in prepared) {
            this.promise = true;
        }
    }
    /**
     * Get a schemabuilder to work with.
     *
     * @param {string} store
     *
     * @returns {Knex.SchemaBuilder}
     */
    getSchemaBuilder(store) {
        return this.getBuilder(store).schema;
    }
    /**
     * Get a (reusable) transaction for `storeName`
     *
     * @param {string} storeName
     *
     * @returns {Bluebird<Knex.Transaction>}
     */
    getTransaction(storeName) {
        return this.migrationRun.getTransaction(storeName);
    }
    /**
     * Get a builder. This includes the knex instance.
     *
     * @param {string} store
     *
     * @returns {{schema: Knex.SchemaBuilder, knex: Knex}}
     */
    getBuilder(store) {
        let connection = this.getConnection(store);
        let schemaBuilder = connection.schema;
        this.builders.push({ store, schemaBuilder, knex: connection });
        return { schema: schemaBuilder, knex: connection };
    }
    /**
     * Get the SQL for current builders.
     *
     * @returns {string}
     */
    getSQL() {
        if (this.promise) {
            throw new Error("It's not possible to get SQL for a promise based migration.");
        }
        return this.builders.map(builder => builder.schemaBuilder.toString()).join('\n');
    }
    /**
     * Run the migration.
     *
     * @returns {Bluebird<any>}
     */
    run() {
        return Bluebird.each(this.builders, builder => {
            return this.getTransaction(builder.store).then(transaction => {
                return builder.schemaBuilder['transacting'](transaction).then();
            });
        });
    }
    /**
     * Get connection for store.
     *
     * @param {string} store
     *
     * @returns {knex}
     */
    getConnection(store) {
        return this.entityManager.getStore(store).getConnection(Store_1.Store.ROLE_MASTER);
    }
}
exports.Migration = Migration;
