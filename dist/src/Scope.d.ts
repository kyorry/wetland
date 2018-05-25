import { UnitOfWork } from './UnitOfWork';
import { EntityManager } from './EntityManager';
import { EntityInterface, ProxyInterface, EntityCtor } from './EntityInterface';
import { EntityRepository } from './EntityRepository';
import { Mapping } from './Mapping';
import { Store } from './Store';
import { Wetland } from './Wetland';
import { Homefront } from 'homefront';
import { IdentityMap } from './IdentityMap';
export declare class Scope {
    /**
     * @type {UnitOfWork}
     */
    private unitOfWork;
    /**
     * @type {EntityManager}
     */
    private manager;
    /**
     * @type {Wetland}
     */
    private wetland;
    /**
     * Maintain list of hydrated entities.
     *
     * @type {IdentityMap}
     */
    private identityMap;
    /**
     * Construct a new Scope.
     *
     * @param {EntityManager} manager
     * @param {Wetland}       wetland
     */
    constructor(manager: EntityManager, wetland: Wetland);
    /**
     * Get the identity map for this scope.
     *
     * @returns {IdentityMap}
     */
    getIdentityMap(): IdentityMap;
    /**
     * Proxy method the entityManager getRepository method.
     *
     * @param {Entity} entity
     *
     * @returns {EntityRepository}
     */
    getRepository<T>(entity: EntityCtor<T>): EntityRepository<T>;
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig(): Homefront;
    /**
     * Get a reference to a persisted row without actually loading it. Returns entity from identity map when available.
     *
     * @param {Entity}  entity
     * @param {*}       primaryKeyValue
     * @param {boolean} [proxy]          Whether or not to proxy the reference (if used for updates for instance).
     *
     * @returns {EntityInterface}
     */
    getReference(entity: Entity, primaryKeyValue: any, proxy?: boolean): ProxyInterface;
    /**
     * Resolve provided value to an entity reference.
     *
     * @param {EntityInterface|string|{}} hint
     *
     * @returns {EntityInterface|null}
     */
    resolveEntityReference(hint: Entity): {
        new ();
    };
    /**
     * Refresh provided entities (sync back from DB).
     *
     * @param {...EntityInterface} entity
     *
     * @returns {Promise<any>}
     */
    refresh(...entity: Array<EntityInterface>): Promise<any>;
    /**
     * Get the mapping for provided entity. Can be an instance, constructor or the name of the entity.
     *
     * @param {EntityInterface|string|{}} entity
     *
     * @returns {Mapping}
     */
    getMapping<T>(entity: T): Mapping<T>;
    /**
     * Get the reference to an entity constructor by name.
     *
     * @param {string} name
     *
     * @returns {Function}
     */
    getEntity(name: string): Function;
    /**
     * Get store for provided entity.
     *
     * @param {EntityInterface} entity
     *
     * @returns {Store}
     */
    getStore(entity?: EntityInterface | string): Store;
    /**
     * Get the UnitOfWork.
     *
     * @returns {UnitOfWork}
     */
    getUnitOfWork(): UnitOfWork;
    /**
     * Get all registered entities.
     *
     * @returns {{}}
     */
    getEntities(): {
        [key: string]: {
            entity: EntityCtor<EntityInterface>;
            mapping: Mapping<EntityInterface>;
        };
    };
    /**
     * Attach an entity (proxy it).
     *
     * @param {EntityInterface} entity
     * @param {boolean}         active
     *
     * @returns {EntityInterface&ProxyInterface}
     */
    attach<T>(entity: T, active?: boolean): T;
    /**
     * Detach an entity (remove proxy, and clear from unit of work).
     *
     * @param {ProxyInterface} entity
     *
     * @returns {EntityInterface}
     */
    detach(entity: ProxyInterface): EntityInterface;
    /**
     * Mark provided entity as new.
     *
     * @param {{}[]} entities
     *
     * @returns {Scope}
     */
    persist(...entities: Array<Object>): Scope;
    /**
     * Mark an entity as deleted.
     *
     * @param {{}} entity
     *
     * @returns {Scope}
     */
    remove(entity: Object): Scope;
    /**
     * This method is responsible for persisting the unit of work.
     * This means calculating changes to make, as well as the order to do so.
     * One of the things involved in this is making the distinction between stores.
     *
     * @param {boolean} skipClean
     * @param {boolean} skipLifecyclehooks
     *
     * @return {Promise}
     */
    flush(skipClean?: boolean, skipLifecyclehooks?: boolean): Promise<any>;
    /**
     * Clear the unit of work.
     *
     * @returns {Scope}
     */
    clear(): Scope;
}
export declare type Entity = string | {
    new ();
} | EntityInterface;
