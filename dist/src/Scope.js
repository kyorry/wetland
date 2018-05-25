"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UnitOfWork_1 = require("./UnitOfWork");
const Mapping_1 = require("./Mapping");
const Hydrator_1 = require("./Hydrator");
const EntityProxy_1 = require("./EntityProxy");
const IdentityMap_1 = require("./IdentityMap");
class Scope {
    /**
     * Construct a new Scope.
     *
     * @param {EntityManager} manager
     * @param {Wetland}       wetland
     */
    constructor(manager, wetland) {
        /**
         * Maintain list of hydrated entities.
         *
         * @type {IdentityMap}
         */
        this.identityMap = new IdentityMap_1.IdentityMap;
        this.manager = manager;
        this.wetland = wetland;
        this.unitOfWork = new UnitOfWork_1.UnitOfWork(this);
    }
    /**
     * Get the identity map for this scope.
     *
     * @returns {IdentityMap}
     */
    getIdentityMap() {
        return this.identityMap;
    }
    /**
     * Proxy method the entityManager getRepository method.
     *
     * @param {Entity} entity
     *
     * @returns {EntityRepository}
     */
    getRepository(entity) {
        let entityReference = this.manager.resolveEntityReference(entity);
        let Repository = Mapping_1.Mapping.forEntity(entityReference).getRepository();
        return new Repository(this, entityReference);
    }
    /**
     * Get the wetland config.
     *
     * @returns {Homefront}
     */
    getConfig() {
        return this.manager.getConfig();
    }
    /**
     * Get a reference to a persisted row without actually loading it. Returns entity from identity map when available.
     *
     * @param {Entity}  entity
     * @param {*}       primaryKeyValue
     * @param {boolean} [proxy]          Whether or not to proxy the reference (if used for updates for instance).
     *
     * @returns {EntityInterface}
     */
    getReference(entity, primaryKeyValue, proxy = true) {
        let ReferenceClass = this.resolveEntityReference(entity);
        let fromMap = this.identityMap.fetch(ReferenceClass, primaryKeyValue);
        if (fromMap) {
            return fromMap;
        }
        let reference = new ReferenceClass;
        let primaryKey = Mapping_1.Mapping.forEntity(ReferenceClass).getPrimaryKey();
        reference[primaryKey] = primaryKeyValue;
        this.unitOfWork.registerClean(reference);
        if (proxy) {
            let proxied = this.attach(reference);
            this.identityMap.register(ReferenceClass, proxied);
            return proxied;
        }
        return reference;
    }
    /**
     * Resolve provided value to an entity reference.
     *
     * @param {EntityInterface|string|{}} hint
     *
     * @returns {EntityInterface|null}
     */
    resolveEntityReference(hint) {
        return this.manager.resolveEntityReference(hint);
    }
    /**
     * Refresh provided entities (sync back from DB).
     *
     * @param {...EntityInterface} entity
     *
     * @returns {Promise<any>}
     */
    refresh(...entity) {
        let refreshes = [];
        let hydrator = new Hydrator_1.Hydrator(this);
        entity.forEach(toRefresh => {
            let entityCtor = this.resolveEntityReference(toRefresh);
            let primaryKeyName = Mapping_1.Mapping.forEntity(entityCtor).getPrimaryKey();
            let primaryKey = toRefresh[primaryKeyName];
            let refresh = this.getRepository(entityCtor).getQueryBuilder()
                .where({ [primaryKeyName]: primaryKey })
                .limit(1)
                .getQuery()
                .execute()
                .then(freshData => hydrator.fromSchema(freshData[0], toRefresh));
            refreshes.push(refresh);
        });
        return Promise.all(refreshes);
    }
    /**
     * Get the mapping for provided entity. Can be an instance, constructor or the name of the entity.
     *
     * @param {EntityInterface|string|{}} entity
     *
     * @returns {Mapping}
     */
    getMapping(entity) {
        return this.manager.getMapping(entity);
    }
    /**
     * Get the reference to an entity constructor by name.
     *
     * @param {string} name
     *
     * @returns {Function}
     */
    getEntity(name) {
        return this.manager.getEntity(name);
    }
    /**
     * Get store for provided entity.
     *
     * @param {EntityInterface} entity
     *
     * @returns {Store}
     */
    getStore(entity) {
        let storeName = null;
        if (typeof entity === 'string') {
            storeName = entity;
        }
        else if (entity) {
            storeName = this.manager.getMapping(entity).getStoreName();
        }
        return this.wetland.getStore(storeName);
    }
    /**
     * Get the UnitOfWork.
     *
     * @returns {UnitOfWork}
     */
    getUnitOfWork() {
        return this.unitOfWork;
    }
    /**
     * Get all registered entities.
     *
     * @returns {{}}
     */
    getEntities() {
        return this.manager.getEntities();
    }
    /**
     * Attach an entity (proxy it).
     *
     * @param {EntityInterface} entity
     * @param {boolean}         active
     *
     * @returns {EntityInterface&ProxyInterface}
     */
    attach(entity, active = false) {
        return EntityProxy_1.EntityProxy.patchEntity(entity, this, active);
    }
    /**
     * Detach an entity (remove proxy, and clear from unit of work).
     *
     * @param {ProxyInterface} entity
     *
     * @returns {EntityInterface}
     */
    detach(entity) {
        entity.deactivateProxying();
        this.unitOfWork.clear(entity);
        return entity.getTarget();
    }
    /**
     * Mark provided entity as new.
     *
     * @param {{}[]} entities
     *
     * @returns {Scope}
     */
    persist(...entities) {
        entities.forEach(entity => this.unitOfWork.registerNew(entity));
        return this;
    }
    /**
     * Mark an entity as deleted.
     *
     * @param {{}} entity
     *
     * @returns {Scope}
     */
    remove(entity) {
        this.unitOfWork.registerDeleted(entity);
        return this;
    }
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
    flush(skipClean = false, skipLifecyclehooks = false) {
        return this.unitOfWork.commit(skipClean, skipLifecyclehooks);
    }
    /**
     * Clear the unit of work.
     *
     * @returns {Scope}
     */
    clear() {
        this.unitOfWork.clear();
        return this;
    }
}
exports.Scope = Scope;
