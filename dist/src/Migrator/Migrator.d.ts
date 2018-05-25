/// <reference types="knex" />
/// <reference types="bluebird" />
import * as Bluebird from 'bluebird';
import * as Knex from 'knex';
import { Wetland } from '../Wetland';
export declare class Migrator {
    /**
     * @type {string}
     */
    static DIRECTION_UP: string;
    /**
     * @type {string}
     */
    static DIRECTION_DOWN: string;
    /**
     * @type {string}
     */
    static ACTION_RUN: string;
    /**
     * @type {string}
     */
    static ACTION_GET_SQL: string;
    /**
     * @type {Wetland}
     */
    private wetland;
    /**
     * @type {Scope}
     */
    private manager;
    /**
     * @type {MigratorConfig}
     */
    private config;
    /**
     * @type {MigrationFile}
     */
    private migrationFile;
    /**
     * @type {MigrationTable}
     */
    private migrationTable;
    /**
     * @type {Knex}
     */
    private connection;
    /**
     * Construct a migrator.
     *
     * @param {Wetland} wetland
     */
    constructor(wetland: Wetland);
    /**
     * Get the connection for the migrations tables.
     *
     * @returns {Knex}
     */
    getConnection(): Knex;
    /**
     * Get all migrations from the directory.
     *
     * @returns {Promise<Array<string>>}
     */
    allMigrations(): Bluebird<Array<string> | null>;
    /**
     * Run dev migrations.
     *
     * @param {boolean} revert
     *
     * @returns {Bluebird<any>}
     */
    devMigrations(revert: boolean): Bluebird<any>;
    /**
     * Get all applies migrations.
     *
     * @returns {Promise<Array<Object>|null>}
     */
    appliedMigrations(): Promise<Array<Object> | null>;
    /**
     * Create a new migration file.
     *
     * @param {string} name
     * @param {{}}     [code]
     *
     * @returns {Promise<any>}
     */
    create(name: string, code?: {
        up: string;
        down: string;
    }): Bluebird<any>;
    /**
     * Go up one version based on latest run migration timestamp.
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    up(action: string): Bluebird<any>;
    /**
     * Go down one version based on latest run migration timestamp.
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    down(action: string): Promise<string>;
    /**
     * Go up to the latest migration.
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    latest(action?: string): Bluebird<any>;
    /**
     * Revert the last run UP migration (or batch of UP migrations).
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    revert(action: string): Promise<any>;
    /**
     * Run a specific migration.
     *
     * @param {string}    direction
     * @param {string}    action
     * @param {string[]}  migrations
     *
     * @returns {Promise}
     */
    run(direction: string, action: string, migrations: string | Array<string>): Bluebird<string | any> | Promise<any>;
}
