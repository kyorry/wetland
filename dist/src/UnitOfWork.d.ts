/// <reference types="knex" />
import * as knex from 'knex';
import { ArrayCollection } from './ArrayCollection';
import { EntityInterface, ProxyInterface } from './EntityInterface';
import { Scope } from './Scope';
import { EntityProxy } from './EntityProxy';
/**
 * Maintains a list of objects affected by a business transaction and -
 *  coordinates the writing out of changes and the resolution of concurrency problems.
 *
 * @export
 * @class UnitOfWork
 */
export declare class UnitOfWork {
    /**
     * @type {string}
     */
    static STATE_UNKNOWN: string;
    /**
     * @type {string}
     */
    static STATE_CLEAN: string;
    /**
     * @type {string}
     */
    static STATE_DIRTY: string;
    /**
     * @type {string}
     */
    static STATE_NEW: string;
    /**
     * @type {string}
     */
    static STATE_DELETED: string;
    /**
     * @type {string}
     */
    static RELATIONSHIP_ADDED: string;
    /**
     * @type {string}
     */
    static RELATIONSHIP_REMOVED: string;
    /**
     * Holds a list of objects that have been marked as being "dirty".
     *
     * @type {ArrayCollection}
     */
    private dirtyObjects;
    /**
     * Holds a list of objects that have been marked as being "new".
     *
     * @type {ArrayCollection}
     */
    private newObjects;
    /**
     * Holds a list of objects that have been marked as being "deleted".
     *
     * @type {ArrayCollection}
     */
    private deletedObjects;
    /**
     * Holds a list of objects that have been marked as being "clean".
     *
     * @type {ArrayCollection}
     */
    private cleanObjects;
    /**
     * Holds a list of objects that have been marked as having relationship changes.
     *
     * @type {ArrayCollection}
     */
    private relationshipsChangedObjects;
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {{}|null}
     */
    private transactions;
    /**
     * @type {Array}
     */
    private afterCommit;
    /**
     * Create a new UnitOfWork.
     *
     * @param {Scope} entityManager
     */
    constructor(entityManager: Scope);
    /**
     * Return objects marked as dirty.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getDirtyObjects(): ArrayCollection<EntityProxy>;
    /**
     * Return objects marked as new.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getNewObjects(): ArrayCollection<EntityProxy>;
    /**
     * Return objects marked as deleted.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getDeletedObjects(): ArrayCollection<EntityProxy>;
    /**
     * Return objects marked as clean.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getCleanObjects(): ArrayCollection<EntityProxy>;
    /**
     * Return objects marked as having relationship changes.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getRelationshipsChangedObjects(): ArrayCollection<EntityProxy>;
    /**
     * Get the entity manager used by this unit of work.
     *
     * @returns {Scope}
     */
    getEntityManager(): Scope;
    /**
     * Get the state for provided entity.
     *
     * @param {ProxyInterface} entity
     *
     * @returns {string}
     */
    static getObjectState(entity: ProxyInterface): string;
    /**
     * Returns if provided entity has relationship changes.
     *
     * @param {EntityInterface} entity
     *
     * @returns {boolean}
     */
    static hasRelationChanges(entity: EntityInterface): boolean;
    /**
     * Returns as provided entity is clean
     *
     * @param {EntityInterface} entity
     *
     * @returns {boolean}
     */
    static isClean(entity: EntityInterface): boolean;
    /**
     * Returns if provided entity is dirty.
     *
     * @param {EntityInterface} entity
     *
     * @returns {boolean}
     */
    static isDirty(entity: EntityInterface): boolean;
    /**
     * Register a collection change between `targetEntity` and `relationEntity`
     *
     * @param {string} change
     * @param {Object} targetEntity
     * @param {string} property
     * @param {Object} relationEntity
     *
     * @returns {UnitOfWork}
     */
    registerCollectionChange(change: string, targetEntity: Object, property: string, relationEntity: Object): UnitOfWork;
    /**
     * Register a relationship change between `targetEntity` and `relationEntity`
     *
     * @param {string} change
     * @param {Object} targetEntity
     * @param {string} property
     * @param {Object} relationEntity
     *
     * @returns {UnitOfWork}
     */
    registerRelationChange(change: string, targetEntity: Object, property: string, relationEntity: EntityInterface): UnitOfWork;
    /**
     * Set the state of an entity.
     *
     * @param {ProxyInterface} entity
     * @param {string}          state
     *
     * @returns {UnitOfWork}
     */
    setEntityState(entity: ProxyInterface, state: string): UnitOfWork;
    /**
     * Register an object as "new".
     *
     * @param {Object} newObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerNew(newObject: Object): UnitOfWork;
    /**
     * Register an object as "dirty".
     *
     * @param {Object}   dirtyObject
     * @param {String[]} property
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDirty(dirtyObject: EntityProxy, ...property: Array<string>): UnitOfWork;
    /**
     * Register an object as "deleted".
     *
     * @param {Object} deletedObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDeleted(deletedObject: Object): UnitOfWork;
    /**
     * Register an object as "clean".
     *
     * @param {Object}  cleanObject The clean object
     * @param {boolean} fresh       Skip checks for other states (performance).
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerClean(cleanObject: Object, fresh?: boolean): UnitOfWork;
    /**
     * Prepare the cascades for provided entity.
     *
     * @param {EntityInterface} entity
     * @param {EntityInterface} cascadingParent
     *
     * @returns {UnitOfWork}
     */
    prepareCascadesFor(entity: EntityInterface, cascadingParent?: EntityInterface): UnitOfWork;
    /**
     * Prepare cascades for a single entity.
     *
     * @param {EntityInterface} entity
     * @param {string}          property
     * @param {EntityInterface} relation
     * @param {Mapping}         mapping
     *
     * @returns {UnitOfWork}
     */
    private cascadeSingle<T>(entity, property, relation, mapping);
    /**
     * Prepare cascades for all staged changes.
     *
     * @returns {UnitOfWork}
     */
    prepareCascades(): UnitOfWork;
    /**
     * Commit the current state.
     *
     * @param {boolean} skipClean
     * @param {boolean} skipLifecycleHooks
     *
     * @returns {Promise<UnitOfWork>}
     */
    commit(skipClean?: boolean, skipLifecycleHooks?: boolean): Promise<any>;
    /**
     * Execute post commit lifecyle callbacks.
     *
     * @return {Promise<Array<Function>>}
     */
    private processAfterCommit();
    /**
     * Apply lifecycle callbacks for entity.
     *
     * @param {string}          method
     * @param {EntityInterface} entity
     * @param {*[]}             parameters
     *
     * @returns {Promise<any>}
     */
    private lifecycleCallback(method, entity, ...parameters);
    /**
     * Either commit or rollback current transactions.
     *
     * @param {boolean} commit
     * @param {Error}   error
     *
     * @returns {Promise}
     */
    private commitOrRollback(commit?, error?);
    /**
     * Rollback previously applied IDs.
     *
     * @returns {UnitOfWork}
     */
    private rollbackIds();
    /**
     * Mark all dirty entities as cleaned.
     *
     * @param {EntityInterface} target
     *
     * @returns {UnitOfWork}
     */
    private markDirtyAsCleaned(target?);
    /**
     * Mark all dirty entities as cleaned.
     *
     * @param {EntityInterface} target
     *
     * @returns {UnitOfWork}
     */
    private revertRelationshipChanges(target?);
    /**
     * Clear the state for provided entity.
     *
     * @param {EntityInterface} entity
     * EntityInterface
     * @returns {UnitOfWork}
     */
    clearEntityState(entity: EntityInterface): UnitOfWork;
    /**
     * Refresh all dirty entities.
     *
     * @returns {Promise<any>}
     */
    private refreshDirty();
    /**
     * Refresh all new entities.
     *
     * @returns {Promise<any>}
     */
    private refreshNew();
    /**
     * Get the transaction for this unit of work, and provided target entity.
     *
     * @param {EntityInterface} target
     *
     * @returns {Promise}
     */
    private getTransaction(target);
    /**
     * Persist provided targets using provided handler.
     *
     * @param {EntityInterface} targets
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    private persist(targets, handler);
    /**
     * Persist specific target.
     *
     * @param {EntityInterface} target
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    private persistTarget(target, handler);
    /**
     * Persist new entities.
     *
     * @param {boolean} skipLifecyclehooks
     *
     * @returns {Promise<any>}
     */
    private insertNew(skipLifecyclehooks?);
    /**
     * Update dirty entities.
     *
     * @param {boolean} skipLifecyclehooks
     *
     * @returns {Promise<any>}
     */
    private updateDirty(skipLifecyclehooks?);
    /**
     * Delete removed entities from the database.
     *
     * @param {boolean} skipLifecyclehooks
     *
     * @returns {Promise<any>}
     */
    private deleteDeleted(skipLifecyclehooks?);
    /**
     * Apply relationship changes in the database.
     *
     * @returns {Promise<{}>}
     */
    private updateRelationships();
    /**
     * Log a query.
     *
     * @param {knex.QueryBuilder} query
     */
    static logQuery(query: knex.QueryBuilder): void;
    /**
     * Roll back all affected objects.
     *
     * - Revert changes in dirty entities.
     * - Un-persist new entities.
     * - Unstage deleted entities.
     * - Refresh persisted entities.
     *
     * @param {EntityInterface[]} entities
     *
     * @returns {UnitOfWork}
     */
    clear(...entities: Array<EntityInterface | ProxyInterface>): UnitOfWork;
    /**
     * Empty after commit.
     *
     * @return {Promise<void>}
     */
    private cleanAfterCommit();
    /**
     * Mark everything as clean and empty transactions.
     *
     * @return {Promise<void>}
     */
    private cleanObjectsAndTransactions();
    /**
     * Mark everything as clean, empty transactions and empty after commits.
     *
     * @returns {UnitOfWork}
     */
    clean(): Promise<void>;
}
