/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { MigratorConfigInterface } from './MigratorConfigInterface';
export declare class MigrationFile {
    /**
     * @type {MigratorConfigInterface}
     */
    private config;
    /**
     * @param {MigratorConfigInterface} config
     */
    constructor(config: MigratorConfigInterface);
    /**
     * Get the config.
     *
     * @returns {MigratorConfigInterface}
     */
    getConfig(): MigratorConfigInterface;
    /**
     * Create a new migration file.
     *
     * @param {string} name
     * @param {{}}     [code]
     *
     * @returns {Bluebird}
     */
    create(name: string, code?: {
        up: string;
        down: string;
    }): Promise<any>;
    /**
     * Make sure the migration directory exists.
     */
    private ensureMigrationDirectory();
    /**
     * Get all migrations from the directory.
     *
     * @returns {Bluebird<string[]>}
     */
    getMigrations(): Promise<Array<string>>;
    /**
     * Make migration name.
     *
     * @param {string} name
     *
     * @returns {string}
     */
    private makeMigrationName(name);
}
