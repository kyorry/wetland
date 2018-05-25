import { EntityManager } from './EntityManager';
import { Store, PoolConfig, ReplicationConfig, SingleConfig } from './Store';
import { Homefront } from 'homefront';
import { Scope } from './Scope';
import { EntityInterface, EntityCtor } from './EntityInterface';
import { Migrator } from './Migrator/Migrator';
import { SnapshotManager } from './SnapshotManager';
import { SchemaManager } from './SchemaManager';
import { Populate } from './Populate';
import { Seeder } from './Seeder';
import { Cleaner } from './Cleaner';
export declare class Wetland {
    /**
     * @type {EntityManager}
     */
    private entityManager;
    /**
     * @type {Migrator}
     */
    private migrator;
    /**
     * @type {SnapshotManager}
     */
    private snapshotManager;
    /**
     * @type {Homefront}
     */
    private config;
    /**
     * @type {{}}
     */
    private stores;
    /**
     * @type {SchemaManager}
     */
    private schema;
    /**
     * Construct a new wetland instance.
     *
     * @param {{}} [config]
     */
    constructor(config?: Object);
    /**
     * Initialize the config.
     *
     * @param {{}} config
     */
    private initializeConfig(config);
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig(): Homefront;
    /**
     * Register an entity with the entity manager.
     *
     * @param {EntityInterface} entity
     *
     * @returns {Wetland}
     */
    registerEntity(entity: EntityCtor<EntityInterface>): Wetland;
    /**
     * Register multiple entities with the entity manager.
     *
     * @param {EntityInterface[]} entities
     *
     * @returns {Wetland}
     */
    registerEntities(entities: Array<EntityCtor<EntityInterface>>): Wetland;
    /**
     * Register stores with wetland.
     *
     * @param {Object} stores
     *
     * @returns {Wetland}
     */
    registerStores(stores: Object): Wetland;
    /**
     * Register a store with wetland.
     *
     * @param {string} store
     * @param {{}}     config
     *
     * @returns {Wetland}
     */
    registerStore(store: string, config: PoolConfig | ReplicationConfig | SingleConfig): Wetland;
    /**
     * Get a store by name.
     *
     * @param {string} storeName
     *
     * @returns {Store}
     */
    getStore(storeName?: string): Store;
    /**
     * Get a seeder.
     *
     * @return {Seeder}
     */
    getSeeder(): Seeder;
    /**
     * Get a cleaner.
     *
     * @return {Cleaner}
     */
    getCleaner(): Cleaner;
    /**
     * Get a scoped entityManager. Example:
     *
     *  let wet = new Wetland();
     *  wet.getManager();
     *
     * @returns {Scope}
     */
    getManager(): Scope;
    /**
     * Get the root entity manager.
     *
     * @returns {EntityManager}
     */
    getEntityManager(): EntityManager;
    /**
     * Get the migrator.
     *
     * @returns {Migrator}
     */
    getMigrator(): Migrator;
    /**
     * Get the schema.
     *
     * @returns {SchemaManager}
     */
    getSchemaManager(): SchemaManager;
    /**
     * Get the snapshot engine.
     *
     * @returns {SnapshotManager}
     */
    getSnapshotManager(): SnapshotManager;
    /**
     * @returns {Populate}
     */
    getPopulator(scope: Scope): Populate;
    /**
     * Destroy all active connections.
     *
     * @returns {Promise<any>}
     */
    destroyConnections(): Promise<any>;
    /**
     * set of listeners for the exit event.
     */
    private setupExitListeners();
    /**
     * Register a default (fallback) store (sqlite3).
     */
    private registerDefaultStore();
    /**
     * Ensure that the data directory exists.
     *
     * @param {string} dataDirectory
     */
    private ensureDataDirectory(dataDirectory);
}
