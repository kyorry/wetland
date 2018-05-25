/// <reference types="knex" />
import * as Knex from 'knex';
export declare class MigrationTable {
    /**
     * @type {Knex}
     */
    private connection;
    /**
     * @type {string}
     */
    private tableName;
    /**
     * @type {string}
     */
    private lockTableName;
    /**
     * Construct migrationTable.
     *
     * @param {Knex}   connection
     * @param {string} tableName
     * @param {string} lockTableName
     */
    constructor(connection: Knex, tableName: string, lockTableName: string);
    /**
     * Check if migrations is locked.
     *
     * @param {Knex.Transaction} transaction
     *
     * @returns {Promise<boolean>}
     */
    private isLocked(transaction);
    /**
     * Lock migrations.
     *
     * @param {Knex.Transaction} transaction
     *
     * @returns {QueryBuilder}
     */
    private lockMigrations(transaction);
    /**
     * Obtain a lock.
     *
     * @returns {Promise<any>}
     */
    getLock(): Promise<any>;
    /**
     * Free a lock.
     *
     * @returns {QueryBuilder}
     */
    freeLock(): Promise<any>;
    /**
     * Ensure the migration tables exist.
     *
     * @returns {Promise<any>}
     */
    private ensureMigrationTables();
    /**
     * Get the ID of the last run.
     *
     * @returns {Promise<number|null>}
     */
    getLastRunId(): Promise<number | null>;
    /**
     * Get the name of the last run migration.
     *
     * @returns {Promise<string|null>}
     */
    getLastMigrationName(): Promise<string | null>;
    /**
     * Get the names of the migrations that were part of the last run.
     *
     * @returns {Promise<Array<string>|null>}
     */
    getLastRun(): Promise<Array<string> | null>;
    /**
     * Get the names of the migrations that were run.
     *
     * @returns {Promise<Array<string>|null>}
     */
    getAllRun(): Promise<Array<Object> | null>;
    /**
     * Save the last run.
     *
     * @param {string}   direction
     * @param {string[]} migrations
     *
     * @returns {Promise}
     */
    saveRun(direction: string, migrations: Array<string>): Promise<any>;
}
