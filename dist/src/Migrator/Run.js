"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migrator_1 = require("./Migrator");
const Store_1 = require("../Store");
const Migration_1 = require("./Migration");
const Bluebird = require("bluebird");
const path = require("path");
/**
 * A single migration run. Multiple migrations can be run in one run.
 * Each migration in the run gets the same run id.
 */
class Run {
    /**
     * Construct a runner.
     *
     * @param {string}    direction
     * @param {Scope}     entityManager
     * @param {string[]}  migrations
     * @param {string}    directory
     */
    constructor(direction, entityManager, migrations, directory) {
        /**
         * @type {{}}}
         */
        this.transactions = {};
        this.direction = direction;
        this.directory = directory;
        this.entityManager = entityManager;
        this.loadMigrations(migrations);
    }
    /**
     * Run the migrations.
     *
     * @returns {Promise}
     */
    run() {
        return Bluebird.each(this.migrations, migration => migration.run())
            .then(() => {
            return Bluebird.map(Reflect.ownKeys(this.transactions), transaction => {
                return this.transactions[transaction].commit();
            });
        })
            .catch(error => {
            return Bluebird.map(Reflect.ownKeys(this.transactions), transaction => {
                return this.transactions[transaction].rollback();
            }).then(() => Bluebird.reject(error));
        });
    }
    /**
     * Get the SQL for migrations.
     *
     * @returns {Bluebird<string>}
     */
    getSQL() {
        return Bluebird.mapSeries(this.migrations, migration => migration.getSQL()).then(result => result.join('\n'));
    }
    /**
     * Get the transaction for this unit of work, and provided target entity.
     *
     * @param {string} storeName
     *
     * @returns {Bluebird<Knex.Transaction>}
     */
    getTransaction(storeName) {
        let store = this.entityManager.getStore(storeName);
        if (this.transactions[storeName]) {
            if (this.transactions[storeName] instanceof Bluebird) {
                return this.transactions[storeName];
            }
            return Bluebird.resolve(this.transactions[storeName]);
        }
        return this.transactions[storeName] = new Bluebird(resolve => {
            let connection = store.getConnection(Store_1.Store.ROLE_MASTER);
            connection.transaction(transaction => {
                this.transactions[storeName] = transaction;
                resolve(this.transactions[storeName]);
            });
        });
    }
    /**
     * Load migrations provided.
     *
     * @param {string[]} migrations
     *
     * @returns {Run}
     */
    loadMigrations(migrations) {
        if (migrations.length === 0) {
            return this;
        }
        this.migrations = migrations.map(migration => {
            if (!migration) {
                throw new Error('Invalid migration name supplied. Expected string.');
            }
            let migrationClass = require(path.join(this.directory, migration));
            migrationClass = typeof migrationClass === 'function' ? migrationClass : migrationClass.Migration;
            this.validateMigration(migrationClass);
            return new Migration_1.Migration(migrationClass[this.direction], this);
        });
        return this;
    }
    /**
     * Validate provided migrations
     *
     * @param {Function|{}} migration
     */
    validateMigration(migration) {
        if (typeof migration !== 'function' && typeof migration !== 'object') {
            throw new Error(`Migration '${migration}' of type '${typeof migration}' is not of type Function or Object.`);
        }
        if (!Reflect.has(migration, Migrator_1.Migrator.DIRECTION_DOWN) || typeof migration[Migrator_1.Migrator.DIRECTION_DOWN] !== 'function') {
            throw new Error(`Migration is missing a '${Migrator_1.Migrator.DIRECTION_DOWN}' method.`);
        }
        if (!Reflect.has(migration, Migrator_1.Migrator.DIRECTION_UP) || typeof migration[Migrator_1.Migrator.DIRECTION_UP] !== 'function') {
            throw new Error(`Migration is missing a '${Migrator_1.Migrator.DIRECTION_UP}' method.`);
        }
    }
    /**
     * Get the entity manager scope.
     *
     * @returns {Scope}
     */
    getEntityManager() {
        return this.entityManager;
    }
}
exports.Run = Run;
