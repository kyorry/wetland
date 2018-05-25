/// <reference types="bluebird" />
/// <reference types="knex" />
import { Scope } from '../Scope';
import * as Bluebird from 'bluebird';
import * as Knex from 'knex';
/**
 * A single migration run. Multiple migrations can be run in one run.
 * Each migration in the run gets the same run id.
 */
export declare class Run {
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {string}
     */
    private direction;
    /**
     * @type {string}
     */
    private directory;
    /**
     * @type {Migration[]}
     */
    private migrations;
    /**
     * @type {{}}}
     */
    private transactions;
    /**
     * Construct a runner.
     *
     * @param {string}    direction
     * @param {Scope}     entityManager
     * @param {string[]}  migrations
     * @param {string}    directory
     */
    constructor(direction: string, entityManager: Scope, migrations: Array<string>, directory: string);
    /**
     * Run the migrations.
     *
     * @returns {Promise}
     */
    run(): Bluebird<any>;
    /**
     * Get the SQL for migrations.
     *
     * @returns {Bluebird<string>}
     */
    getSQL(): Bluebird<string>;
    /**
     * Get the transaction for this unit of work, and provided target entity.
     *
     * @param {string} storeName
     *
     * @returns {Bluebird<Knex.Transaction>}
     */
    getTransaction(storeName?: string): Bluebird<Knex.Transaction>;
    /**
     * Load migrations provided.
     *
     * @param {string[]} migrations
     *
     * @returns {Run}
     */
    private loadMigrations(migrations);
    /**
     * Validate provided migrations
     *
     * @param {Function|{}} migration
     */
    private validateMigration(migration);
    /**
     * Get the entity manager scope.
     *
     * @returns {Scope}
     */
    getEntityManager(): Scope;
}
