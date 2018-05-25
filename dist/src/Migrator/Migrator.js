"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Bluebird = require("bluebird");
const Run_1 = require("./Run");
const MigrationFile_1 = require("./MigrationFile");
const MigrationTable_1 = require("./MigrationTable");
const Store_1 = require("../Store");
class Migrator {
    /**
     * Construct a migrator.
     *
     * @param {Wetland} wetland
     */
    constructor(wetland) {
        this.config = wetland.getConfig().defaults('migrator', {
            store: null,
            extension: 'js',
            tableName: 'wetland_migrations',
            lockTableName: 'wetland_migrations_lock',
            directory: path.resolve(process.cwd(), './migrations')
        }).fetch('migrator');
        this.wetland = wetland;
        this.manager = wetland.getManager();
        this.migrationFile = new MigrationFile_1.MigrationFile(this.config);
        this.connection = this.manager.getStore(this.config.store).getConnection(Store_1.Store.ROLE_MASTER);
        this.migrationTable = new MigrationTable_1.MigrationTable(this.connection, this.config.tableName, this.config.lockTableName);
    }
    /**
     * Get the connection for the migrations tables.
     *
     * @returns {Knex}
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get all migrations from the directory.
     *
     * @returns {Promise<Array<string>>}
     */
    allMigrations() {
        return this.migrationFile.getMigrations();
    }
    /**
     * Run dev migrations.
     *
     * @param {boolean} revert
     *
     * @returns {Bluebird<any>}
     */
    devMigrations(revert) {
        let snapshot = this.wetland.getSnapshotManager();
        return snapshot
            .fetch()
            .then(previous => this.wetland.getSchemaManager().apply(previous, revert))
            .then(() => snapshot.create())
            .catch(error => {
            if (revert) {
                return Promise.resolve();
            }
            return this.devMigrations(true).then(() => Bluebird.reject(error));
        });
    }
    /**
     * Get all applies migrations.
     *
     * @returns {Promise<Array<Object>|null>}
     */
    appliedMigrations() {
        return this.migrationTable.getAllRun();
    }
    /**
     * Create a new migration file.
     *
     * @param {string} name
     * @param {{}}     [code]
     *
     * @returns {Promise<any>}
     */
    create(name, code) {
        return this.migrationFile.create(name, code);
    }
    /**
     * Go up one version based on latest run migration timestamp.
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    up(action) {
        return Bluebird.all([this.migrationTable.getLastMigrationName(), this.migrationFile.getMigrations()])
            .then(results => results[1][results[1].indexOf(results[0]) + 1])
            .then(migrations => this.run(Migrator.DIRECTION_UP, action, migrations));
    }
    /**
     * Go down one version based on latest run migration timestamp.
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    down(action) {
        return this.migrationTable.getLastMigrationName().then(name => this.run(Migrator.DIRECTION_DOWN, action, name));
    }
    /**
     * Go up to the latest migration.
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    latest(action = Migrator.ACTION_RUN) {
        return Bluebird.all([this.migrationTable.getLastMigrationName(), this.migrationFile.getMigrations()])
            .then(results => results[1].slice(results[1].indexOf(results[0]) + 1))
            .then(migrations => this.run(Migrator.DIRECTION_UP, action, migrations));
    }
    /**
     * Revert the last run UP migration (or batch of UP migrations).
     *
     * @param {string} action
     *
     * @returns {Promise}
     */
    revert(action) {
        return this.migrationTable.getLastRun().then(lastRun => this.run(Migrator.DIRECTION_DOWN, action, lastRun));
    }
    /**
     * Run a specific migration.
     *
     * @param {string}    direction
     * @param {string}    action
     * @param {string[]}  migrations
     *
     * @returns {Promise}
     */
    run(direction, action, migrations) {
        if (!migrations || (Array.isArray(migrations) && migrations.length === 0)) {
            return Promise.resolve(null);
        }
        if (!Array.isArray(migrations)) {
            migrations = [migrations];
        }
        let run = new Run_1.Run(direction, this.manager, migrations, this.config.directory);
        if (action === Migrator.ACTION_RUN) {
            return this.migrationTable.getLock()
                .then(() => run.run())
                .then(() => this.migrationTable.saveRun(direction, migrations))
                .then(() => this.migrationTable.freeLock())
                .then(() => migrations.length);
        }
        if (action === Migrator.ACTION_GET_SQL) {
            return run.getSQL();
        }
        throw new Error(`Invalid action '${action}' supplied.`);
    }
}
/**
 * @type {string}
 */
Migrator.DIRECTION_UP = 'up';
/**
 * @type {string}
 */
Migrator.DIRECTION_DOWN = 'down';
/**
 * @type {string}
 */
Migrator.ACTION_RUN = 'run';
/**
 * @type {string}
 */
Migrator.ACTION_GET_SQL = 'getSQL';
exports.Migrator = Migrator;
