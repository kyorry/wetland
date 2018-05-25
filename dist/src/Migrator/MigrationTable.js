"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const Migrator_1 = require("./Migrator");
class MigrationTable {
    /**
     * Construct migrationTable.
     *
     * @param {Knex}   connection
     * @param {string} tableName
     * @param {string} lockTableName
     */
    constructor(connection, tableName, lockTableName) {
        this.connection = connection;
        this.tableName = tableName;
        this.lockTableName = lockTableName;
    }
    /**
     * Check if migrations is locked.
     *
     * @param {Knex.Transaction} transaction
     *
     * @returns {Promise<boolean>}
     */
    isLocked(transaction) {
        return this.connection(this.lockTableName)
            .transacting(transaction)
            .forUpdate()
            .select('*')
            .then(data => !!data[0] && !!data[0].locked);
    }
    /**
     * Lock migrations.
     *
     * @param {Knex.Transaction} transaction
     *
     * @returns {QueryBuilder}
     */
    lockMigrations(transaction) {
        return this.connection(this.lockTableName).transacting(transaction).update({ locked: 1 });
    }
    /**
     * Obtain a lock.
     *
     * @returns {Promise<any>}
     */
    getLock() {
        return this.ensureMigrationTables().then(() => {
            return this.connection.transaction(transaction => {
                return this.isLocked(transaction)
                    .then(isLocked => {
                    if (isLocked) {
                        throw new Error("Migration table is already locked");
                    }
                })
                    .then(() => this.lockMigrations(transaction));
            });
        });
    }
    /**
     * Free a lock.
     *
     * @returns {QueryBuilder}
     */
    freeLock() {
        return this.connection(this.lockTableName).update({ locked: 0 });
    }
    /**
     * Ensure the migration tables exist.
     *
     * @returns {Promise<any>}
     */
    ensureMigrationTables() {
        let schemaBuilder = this.connection.schema;
        return schemaBuilder.hasTable(this.tableName)
            .then(exists => {
            if (exists) {
                return Bluebird.resolve();
            }
            schemaBuilder.createTableIfNotExists(this.tableName, t => {
                t.increments();
                t.string('name');
                t.integer('run');
                t.timestamp('migration_time').defaultTo(this.connection.fn.now());
                t.index(['run']);
                t.index(['migration_time']);
            });
            schemaBuilder.createTableIfNotExists(this.lockTableName, t => t.boolean('locked'));
            return schemaBuilder;
        });
    }
    /**
     * Get the ID of the last run.
     *
     * @returns {Promise<number|null>}
     */
    getLastRunId() {
        return this.connection(this.tableName)
            .select('run')
            .limit(1)
            .orderBy('run', 'desc')
            .then(result => result[0] ? result[0].run : null);
    }
    /**
     * Get the name of the last run migration.
     *
     * @returns {Promise<string|null>}
     */
    getLastMigrationName() {
        return this.ensureMigrationTables().then(() => {
            return this.connection(this.tableName)
                .select('name')
                .limit(1)
                .orderBy('id', 'desc')
                .then(result => result[0] ? result[0].name : null);
        });
    }
    /**
     * Get the names of the migrations that were part of the last run.
     *
     * @returns {Promise<Array<string>|null>}
     */
    getLastRun() {
        return this.getLastRunId().then(lastRun => {
            if (lastRun === null) {
                return null;
            }
            let connection = this.connection(this.tableName)
                .select('name')
                .where('run', lastRun)
                .orderBy('id', 'desc');
            return connection.then(results => results.map(result => result.name));
        });
    }
    /**
     * Get the names of the migrations that were run.
     *
     * @returns {Promise<Array<string>|null>}
     */
    getAllRun() {
        return this.ensureMigrationTables().then(() => {
            return this.connection(this.tableName)
                .orderBy('id', 'desc');
        });
    }
    /**
     * Save the last run.
     *
     * @param {string}   direction
     * @param {string[]} migrations
     *
     * @returns {Promise}
     */
    saveRun(direction, migrations) {
        if (direction === Migrator_1.Migrator.DIRECTION_DOWN) {
            return this.connection(this.tableName).whereIn('name', migrations).del();
        }
        return this.getLastRunId().then(lastRun => {
            return this.connection(this.tableName).insert(migrations.map(name => {
                return { name, run: (lastRun + 1) };
            }));
        });
    }
}
exports.MigrationTable = MigrationTable;
