"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArrayCollection_1 = require("./ArrayCollection");
const Store_1 = require("./Store");
const Mapping_1 = require("./Mapping");
const MetaData_1 = require("./MetaData");
/**
 * Maintains a list of objects affected by a business transaction and -
 *  coordinates the writing out of changes and the resolution of concurrency problems.
 *
 * @export
 * @class UnitOfWork
 */
class UnitOfWork {
    /**
     * Create a new UnitOfWork.
     *
     * @param {Scope} entityManager
     */
    constructor(entityManager) {
        /**
         * Holds a list of objects that have been marked as being "dirty".
         *
         * @type {ArrayCollection}
         */
        this.dirtyObjects = new ArrayCollection_1.ArrayCollection;
        /**
         * Holds a list of objects that have been marked as being "new".
         *
         * @type {ArrayCollection}
         */
        this.newObjects = new ArrayCollection_1.ArrayCollection;
        /**
         * Holds a list of objects that have been marked as being "deleted".
         *
         * @type {ArrayCollection}
         */
        this.deletedObjects = new ArrayCollection_1.ArrayCollection;
        /**
         * Holds a list of objects that have been marked as being "clean".
         *
         * @type {ArrayCollection}
         */
        this.cleanObjects = new ArrayCollection_1.ArrayCollection;
        /**
         * Holds a list of objects that have been marked as having relationship changes.
         *
         * @type {ArrayCollection}
         */
        this.relationshipsChangedObjects = new ArrayCollection_1.ArrayCollection;
        /**
         * @type {{}|null}
         */
        this.transactions = {};
        /**
         * @type {Array}
         */
        this.afterCommit = [];
        this.entityManager = entityManager;
    }
    /**
     * Return objects marked as dirty.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getDirtyObjects() {
        return this.dirtyObjects;
    }
    /**
     * Return objects marked as new.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getNewObjects() {
        return this.newObjects;
    }
    /**
     * Return objects marked as deleted.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getDeletedObjects() {
        return this.deletedObjects;
    }
    /**
     * Return objects marked as clean.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getCleanObjects() {
        return this.cleanObjects;
    }
    /**
     * Return objects marked as having relationship changes.
     *
     * @returns {ArrayCollection<EntityProxy>}
     */
    getRelationshipsChangedObjects() {
        return this.relationshipsChangedObjects;
    }
    /**
     * Get the entity manager used by this unit of work.
     *
     * @returns {Scope}
     */
    getEntityManager() {
        return this.entityManager;
    }
    /**
     * Get the state for provided entity.
     *
     * @param {ProxyInterface} entity
     *
     * @returns {string}
     */
    static getObjectState(entity) {
        return MetaData_1.MetaData.forInstance(entity).fetch('entityState.state', UnitOfWork.STATE_UNKNOWN);
    }
    /**
     * Returns if provided entity has relationship changes.
     *
     * @param {EntityInterface} entity
     *
     * @returns {boolean}
     */
    static hasRelationChanges(entity) {
        return !!MetaData_1.MetaData.forInstance(entity).fetch('entityState.relations');
    }
    /**
     * Returns as provided entity is clean
     *
     * @param {EntityInterface} entity
     *
     * @returns {boolean}
     */
    static isClean(entity) {
        return UnitOfWork.getObjectState(entity) === UnitOfWork.STATE_CLEAN && !UnitOfWork.hasRelationChanges(entity);
    }
    /**
     * Returns if provided entity is dirty.
     *
     * @param {EntityInterface} entity
     *
     * @returns {boolean}
     */
    static isDirty(entity) {
        return !UnitOfWork.isClean(entity);
    }
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
    registerCollectionChange(change, targetEntity, property, relationEntity) {
        let addTo = change === UnitOfWork.RELATIONSHIP_ADDED ? 'added' : 'removed';
        let removeFrom = change === UnitOfWork.RELATIONSHIP_ADDED ? 'removed' : 'added';
        let targetMeta = MetaData_1.MetaData.forInstance(targetEntity);
        let relationChanges = targetMeta.fetchOrPut('entityState.relations', { added: {}, removed: {} });
        let removeFromList = relationChanges[removeFrom];
        // If given relationEntity was already staged as a change for the other side.
        if (removeFromList[property] && removeFromList[property].includes(relationEntity)) {
            // Unstage it.
            removeFromList[property].remove(relationEntity);
            // If this then was the last staged item in the list for this relation, remove the list.
            if (removeFromList[property].length === 0) {
                delete removeFromList[property];
            }
            // If after all this the added and removed lists are empty...
            if (Object.keys(relationChanges.added).length === 0 && Object.keys(relationChanges.removed).length === 0) {
                // remove the entity from staged...
                this.relationshipsChangedObjects.remove(targetEntity);
                // and remove the relations meta data.
                targetMeta.remove('entityState.relations');
            }
            // And return. It's not a change when simply being un-staged (re-added or re-removed).
            return this;
        }
        let addToList = relationChanges[addTo];
        let addToCollection = addToList[property] ? addToList[property] : addToList[property] = new ArrayCollection_1.ArrayCollection;
        addToCollection.add(relationEntity);
        this.relationshipsChangedObjects.add(targetEntity);
        return this;
    }
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
    registerRelationChange(change, targetEntity, property, relationEntity) {
        let addTo = change === UnitOfWork.RELATIONSHIP_ADDED ? 'added' : 'removed';
        let removeFrom = change === UnitOfWork.RELATIONSHIP_ADDED ? 'removed' : 'added';
        let targetMeta = MetaData_1.MetaData.forInstance(targetEntity);
        let relationChanges = targetMeta.fetchOrPut('entityState.relations', { added: {}, removed: {} });
        let removeFromList = relationChanges[removeFrom];
        // If provided relationEntity was already staged for the other side...
        if (removeFromList[property] === relationEntity) {
            // Remove it. We don't have to add anything.
            delete removeFromList[property];
            // If after all this the added and removed lists are empty...
            if (Object.keys(relationChanges.added).length === 0 && Object.keys(relationChanges.removed).length === 0) {
                // remove the entity from staged...
                this.relationshipsChangedObjects.remove(targetEntity);
                // and remove the relations meta data.
                targetMeta.remove('entityState.relations');
            }
            // And return. It's not a change when simply being un-staged (re-added or re-removed).
            return this;
        }
        relationChanges[addTo][property] = relationEntity;
        this.relationshipsChangedObjects.add(targetEntity);
        return this;
    }
    /**
     * Set the state of an entity.
     *
     * @param {ProxyInterface} entity
     * @param {string}          state
     *
     * @returns {UnitOfWork}
     */
    setEntityState(entity, state) {
        let target = entity.isEntityProxy ? entity.getTarget() : entity;
        let metaData = MetaData_1.MetaData.forInstance(target);
        let previousState = metaData.fetch('entityState.state', UnitOfWork.STATE_UNKNOWN);
        if (previousState === state) {
            return this;
        }
        // Doesn't make sense. But is just to prevent user from changing clean to new.
        if (previousState === UnitOfWork.STATE_CLEAN && state === UnitOfWork.STATE_NEW) {
            return this;
        }
        if (previousState !== UnitOfWork.STATE_UNKNOWN) {
            this[`${previousState}Objects`].remove(target);
        }
        this[`${state}Objects`].add(target);
        metaData.put('entityState.state', state);
        return this;
    }
    /**
     * Register an object as "new".
     *
     * @param {Object} newObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerNew(newObject) {
        let objectState = UnitOfWork.getObjectState(newObject);
        if (objectState === UnitOfWork.STATE_NEW) {
            return this;
        }
        if (objectState !== UnitOfWork.STATE_UNKNOWN) {
            throw new Error(`Only unregistered entities can be marked as new. Entity '${newObject.constructor.name}' has state '${objectState}'.`);
        }
        this.setEntityState(newObject, UnitOfWork.STATE_NEW);
        return this;
    }
    /**
     * Register an object as "dirty".
     *
     * @param {Object}   dirtyObject
     * @param {String[]} property
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDirty(dirtyObject, ...property) {
        if (!property.length) {
            throw new Error(`Can't mark instance of '${dirtyObject.constructor.name}' as dirty without supplying properties.`);
        }
        let metaData = MetaData_1.MetaData.forInstance(dirtyObject);
        let entityState = metaData.fetchOrPut('entityState', { state: UnitOfWork.STATE_UNKNOWN });
        if (entityState.state === UnitOfWork.STATE_NEW || entityState.state === UnitOfWork.STATE_UNKNOWN) {
            return this;
        }
        if (entityState.state === UnitOfWork.STATE_DELETED) {
            throw new Error('Trying to mark entity staged for deletion as dirty.');
        }
        this.setEntityState(dirtyObject, UnitOfWork.STATE_DIRTY);
        metaData.fetchOrPut('entityState.dirty', []).push(...property);
        return this;
    }
    /**
     * Register an object as "deleted".
     *
     * @param {Object} deletedObject
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerDeleted(deletedObject) {
        return this.setEntityState(deletedObject, UnitOfWork.STATE_DELETED);
    }
    /**
     * Register an object as "clean".
     *
     * @param {Object}  cleanObject The clean object
     * @param {boolean} fresh       Skip checks for other states (performance).
     *
     * @returns {UnitOfWork} Fluent interface
     */
    registerClean(cleanObject, fresh = false) {
        if (!fresh) {
            this.revertRelationshipChanges(cleanObject);
            this.markDirtyAsCleaned(cleanObject);
        }
        this.setEntityState(cleanObject, UnitOfWork.STATE_CLEAN);
        return this;
    }
    /**
     * Prepare the cascades for provided entity.
     *
     * @param {EntityInterface} entity
     * @param {EntityInterface} cascadingParent
     *
     * @returns {UnitOfWork}
     */
    prepareCascadesFor(entity, cascadingParent = null) {
        let mapping = Mapping_1.Mapping.forEntity(entity);
        let relations = mapping.getRelations();
        // If no relations, no need to check for cascade operations.
        if (null === relations) {
            return this;
        }
        // There are relations, let's check if there's anything that could and should be cascaded.
        Object.getOwnPropertyNames(relations).forEach(property => {
            // Not even an object? No need to perform _any_ checks.
            if (typeof entity[property] !== 'object' || entity[property] === null) {
                return;
            }
            // Are we trying to persist the parent that just persisted us? Tsk tsk.
            if (entity[property] === cascadingParent) {
                return;
            }
            // Is this relation a *ToMany?
            if (!(entity[property] instanceof Array)) {
                this.cascadeSingle(entity, property, entity[property], mapping);
                this.registerRelationChange(UnitOfWork.RELATIONSHIP_ADDED, entity, property, entity[property]);
                return;
            }
            entity[property].forEach(relation => {
                this.cascadeSingle(entity, property, relation, mapping);
                // Let's link up this new relation with entity.
                this.registerCollectionChange(UnitOfWork.RELATIONSHIP_ADDED, entity, property, relation);
            });
        });
        return this;
    }
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
    cascadeSingle(entity, property, relation, mapping) {
        let relationState = UnitOfWork.getObjectState(relation);
        // Why are you trying to link this entity up with something that will be deleted? Silly.
        if (relationState === UnitOfWork.STATE_DELETED) {
            throw new Error(`Trying to add relation with entity on "${mapping.getEntityName()}.${property}" that has been staged for removal.`);
        }
        // Is the entity we're trying to set up a relationship with un-persisted?
        if (relationState === UnitOfWork.STATE_UNKNOWN) {
            let cascades = mapping.getField(property).cascades;
            // No cascades? Then throw an error. We can't cascade-persist something we don't have.
            if (!Array.isArray(cascades) || !cascades.includes(Mapping_1.Mapping.CASCADE_PERSIST)) {
                throw new Error(`Un-persisted relation found on "${mapping.getEntityName()}.${property}". Either persist the entity, or use the cascade persist option.`);
            }
            // Woo, cascade persist. Cascade child as well.
            this.prepareCascadesFor(relation, entity);
            // And register relation as new.
            this.registerNew(relation);
        }
        return this;
    }
    /**
     * Prepare cascades for all staged changes.
     *
     * @returns {UnitOfWork}
     */
    prepareCascades() {
        if (this.newObjects.length) {
            this.newObjects.forEach(entity => this.prepareCascadesFor(entity));
        }
        if (!this.relationshipsChangedObjects.length) {
            return this;
        }
        this.relationshipsChangedObjects.forEach(changed => {
            let relationChanges = MetaData_1.MetaData.forInstance(changed).fetch('entityState.relations');
            let mapping = Mapping_1.Mapping.forEntity(changed);
            let relations = mapping.getRelations();
            let processChanged = changedType => {
                Object.getOwnPropertyNames(relationChanges[changedType]).forEach(property => {
                    let changes = relationChanges[changedType];
                    if (!(changes[property] instanceof Array)) {
                        this.cascadeSingle(changed, property, changes[property], mapping);
                        return;
                    }
                    changes[property].forEach(target => {
                        this.cascadeSingle(changed, property, target, mapping);
                    });
                });
            };
            processChanged('added');
            processChanged('removed');
        });
        return this;
    }
    /**
     * Commit the current state.
     *
     * @param {boolean} skipClean
     * @param {boolean} skipLifecycleHooks
     *
     * @returns {Promise<UnitOfWork>}
     */
    commit(skipClean = false, skipLifecycleHooks = false) {
        this.prepareCascades();
        return this.insertNew(skipLifecycleHooks)
            .then(() => this.updateDirty(skipLifecycleHooks))
            .then(() => this.deleteDeleted(skipLifecycleHooks))
            .then(() => this.updateRelationships())
            .then(() => this.commitOrRollback(true))
            .then(() => this.entityManager.getConfig().fetch('entityManager.refreshUpdated') && this.refreshDirty())
            .then(() => this.entityManager.getConfig().fetch('entityManager.refreshCreated') && this.refreshNew())
            .then(() => !skipClean && this.cleanObjectsAndTransactions())
            .then(() => !skipClean && this.processAfterCommit())
            .then(() => !skipClean && this.cleanAfterCommit())
            .catch(error => this.commitOrRollback(false, error));
    }
    /**
     * Execute post commit lifecyle callbacks.
     *
     * @return {Promise<Array<Function>>}
     */
    processAfterCommit() {
        let methods = [];
        this.afterCommit.forEach(action => {
            methods.push(action.target[action.method](...action.parameters, this.entityManager));
        });
        return Promise.all(methods);
    }
    /**
     * Apply lifecycle callbacks for entity.
     *
     * @param {string}          method
     * @param {EntityInterface} entity
     * @param {*[]}             parameters
     *
     * @returns {Promise<any>}
     */
    lifecycleCallback(method, entity, ...parameters) {
        let beforeMethod = 'before' + method[0].toUpperCase() + method.substr(1);
        let afterMethod = 'after' + method[0].toUpperCase() + method.substr(1);
        if (typeof entity[afterMethod] === 'function') {
            this.afterCommit.push({ target: entity, method: afterMethod, parameters });
        }
        let callbackResult = typeof entity[beforeMethod] === 'function'
            ? entity[beforeMethod](...parameters, this.entityManager)
            : null;
        return Promise.resolve(callbackResult);
    }
    /**
     * Either commit or rollback current transactions.
     *
     * @param {boolean} commit
     * @param {Error}   error
     *
     * @returns {Promise}
     */
    commitOrRollback(commit = true, error) {
        let resolves = [];
        let method = commit ? 'commit' : 'rollback';
        Object.getOwnPropertyNames(this.transactions).forEach(store => {
            resolves.push(this.transactions[store].transaction[method]());
        });
        if (!commit) {
            this.rollbackIds();
        }
        return Promise.all(resolves).then(() => {
            this.transactions = {};
            if (error) {
                throw error;
            }
        });
    }
    /**
     * Rollback previously applied IDs.
     *
     * @returns {UnitOfWork}
     */
    rollbackIds() {
        this.newObjects.forEach(newObject => {
            if (newObject.isEntityProxy) {
                newObject.deactivateProxying();
            }
            delete newObject[Mapping_1.Mapping.forEntity(newObject).getPrimaryKey()];
        });
        return this;
    }
    /**
     * Mark all dirty entities as cleaned.
     *
     * @param {EntityInterface} target
     *
     * @returns {UnitOfWork}
     */
    markDirtyAsCleaned(target) {
        if (target) {
            MetaData_1.MetaData.forInstance(target).remove('entityState.dirty');
            this.dirtyObjects.remove(target);
        }
        else if (this.dirtyObjects && this.dirtyObjects.length > 0) {
            this.dirtyObjects.forEach(dirty => this.markDirtyAsCleaned(dirty));
        }
        else {
            this.dirtyObjects = new ArrayCollection_1.ArrayCollection;
        }
        return this;
    }
    /**
     * Mark all dirty entities as cleaned.
     *
     * @param {EntityInterface} target
     *
     * @returns {UnitOfWork}
     */
    revertRelationshipChanges(target) {
        if (target) {
            MetaData_1.MetaData.forInstance(target).remove('entityState.relations');
            this.relationshipsChangedObjects.remove(target);
        }
        else if (this.relationshipsChangedObjects && this.relationshipsChangedObjects.length > 0) {
            this.relationshipsChangedObjects.forEach(changed => this.revertRelationshipChanges(changed));
        }
        else {
            this.relationshipsChangedObjects = new ArrayCollection_1.ArrayCollection;
        }
        return this;
    }
    /**
     * Clear the state for provided entity.
     *
     * @param {EntityInterface} entity
     * EntityInterface
     * @returns {UnitOfWork}
     */
    clearEntityState(entity) {
        MetaData_1.MetaData.forInstance(entity).remove('entityState');
        return this;
    }
    /**
     * Refresh all dirty entities.
     *
     * @returns {Promise<any>}
     */
    refreshDirty() {
        return this.entityManager.refresh(...this.dirtyObjects);
    }
    /**
     * Refresh all new entities.
     *
     * @returns {Promise<any>}
     */
    refreshNew() {
        return this.entityManager.refresh(...this.newObjects);
    }
    /**
     * Get the transaction for this unit of work, and provided target entity.
     *
     * @param {EntityInterface} target
     *
     * @returns {Promise}
     */
    getTransaction(target) {
        let store = this.entityManager.getStore(target);
        let storeName = store.getName();
        if (!this.transactions[storeName]) {
            this.transactions[storeName] = new Promise((resolve, reject) => {
                let connection = store.getConnection(Store_1.Store.ROLE_MASTER);
                connection.transaction(transaction => {
                    this.transactions[storeName] = { connection: connection, transaction: transaction };
                    resolve(this.transactions[storeName]);
                }).catch(error => reject(error));
            });
        }
        if (this.transactions[storeName] instanceof Promise) {
            return this.transactions[storeName];
        }
        return Promise.resolve(this.transactions[storeName]);
    }
    /**
     * Persist provided targets using provided handler.
     *
     * @param {EntityInterface} targets
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    persist(targets, handler) {
        let statementHandlers = [];
        targets.forEach(target => statementHandlers.push(this.persistTarget(target, handler)));
        return Promise.all(statementHandlers);
    }
    /**
     * Persist specific target.
     *
     * @param {EntityInterface} target
     * @param {Function}        handler
     *
     * @returns {Promise<any>}
     */
    persistTarget(target, handler) {
        return this.getTransaction(target)
            .then(transaction => {
            let tableName = Mapping_1.Mapping.forEntity(target).getTableName();
            let queryBuilder = this.entityManager
                .getRepository(this.entityManager.resolveEntityReference(target))
                .getQueryBuilder(null, transaction.connection(tableName));
            queryBuilder.getQuery().getStatement().transacting(transaction.transaction);
            return handler(queryBuilder, target);
        });
    }
    /**
     * Persist new entities.
     *
     * @param {boolean} skipLifecyclehooks
     *
     * @returns {Promise<any>}
     */
    insertNew(skipLifecyclehooks = false) {
        return this.persist(this.newObjects, (queryBuilder, target) => {
            let mapping = Mapping_1.Mapping.forEntity(target);
            let primaryKey = mapping.getPrimaryKey();
            const executeInsertion = () => {
                return queryBuilder.insert(target, primaryKey).getQuery().execute()
                    .then(result => {
                    if (target.isEntityProxy) {
                        target[primaryKey] = { _skipDirty: result[0] };
                        target.activateProxying();
                    }
                    else {
                        target[primaryKey] = result[0];
                    }
                });
            };
            if (skipLifecyclehooks) {
                return executeInsertion();
            }
            return this.lifecycleCallback('create', target)
                .then(() => executeInsertion());
        });
    }
    /**
     * Update dirty entities.
     *
     * @param {boolean} skipLifecyclehooks
     *
     * @returns {Promise<any>}
     */
    updateDirty(skipLifecyclehooks = false) {
        return this.persist(this.dirtyObjects, (queryBuilder, target) => {
            let dirtyProperties = MetaData_1.MetaData.forInstance(target).fetch(`entityState.dirty`, []);
            let targetMapping = Mapping_1.Mapping.forEntity(target);
            let primaryKey = targetMapping.getPrimaryKeyField();
            let newValues = {};
            if (dirtyProperties.length > 0) {
                dirtyProperties.forEach(dirtyProperty => {
                    newValues[dirtyProperty] = target[dirtyProperty];
                });
            }
            const executeUpdate = () => {
                return queryBuilder.update(newValues).where({ [primaryKey]: target[primaryKey] }).getQuery().execute();
            };
            if (skipLifecyclehooks) {
                return executeUpdate();
            }
            return this.lifecycleCallback('update', target, newValues)
                .then(() => executeUpdate());
        });
    }
    /**
     * Delete removed entities from the database.
     *
     * @param {boolean} skipLifecyclehooks
     *
     * @returns {Promise<any>}
     */
    deleteDeleted(skipLifecyclehooks = false) {
        return this.persist(this.deletedObjects, (queryBuilder, target) => {
            let primaryKey = Mapping_1.Mapping.forEntity(target).getPrimaryKeyField();
            // @todo Use target's mapping to delete relations for non-cascaded properties.
            const executeDelete = () => {
                return queryBuilder.remove().where({ [primaryKey]: target[primaryKey] }).getQuery().execute();
            };
            if (skipLifecyclehooks) {
                return executeDelete();
            }
            return this.lifecycleCallback('remove', target, this.deletedObjects)
                .then(() => executeDelete());
        });
    }
    /**
     * Apply relationship changes in the database.
     *
     * @returns {Promise<{}>}
     */
    updateRelationships() {
        // Whoa boy! This is going to be fun!
        let relationshipUpdates = [];
        this.relationshipsChangedObjects.forEach(changed => {
            let changedMapping = Mapping_1.Mapping.forEntity(changed);
            let changedMeta = MetaData_1.MetaData.forInstance(changed).fetch('entityState.relations');
            let relations = changedMapping.getRelations();
            // Apply changes (remove or add)
            let applyChanges = (from, action) => {
                Object.getOwnPropertyNames(changedMeta[from]).forEach(property => {
                    let newRelations = changedMeta[from][property];
                    if (!(newRelations instanceof ArrayCollection_1.ArrayCollection)) {
                        return relationshipUpdates.push(persistRelationChange(action, changed, property, newRelations));
                    }
                    newRelations.forEach(newRelation => {
                        relationshipUpdates.push(persistRelationChange(action, changed, property, newRelation));
                    });
                });
            };
            // Persist the relation change
            let persistRelationChange = (action, owning, property, other) => {
                let relation = relations[property];
                if (relation.type !== Mapping_1.Mapping.RELATION_MANY_TO_MANY) {
                    let mapping = relation.mappedBy ? Mapping_1.Mapping.forEntity(other) : changedMapping;
                    let owningSide = relation.mappedBy ? other : changed;
                    let otherSide = relation.mappedBy ? changed : other;
                    let joinColumn = mapping.getJoinColumn(relation.mappedBy ? relation.mappedBy : property);
                    let primaryKey = mapping.getPrimaryKey();
                    // Update id of property on own side, based on joinColumn.
                    return this.persistTarget(owningSide, (queryBuilder, target) => {
                        let query = queryBuilder.where({ [primaryKey]: target[primaryKey] });
                        let newValue = otherSide[joinColumn.referencedColumnName];
                        if (action === UnitOfWork.RELATIONSHIP_REMOVED) {
                            query.where({ [joinColumn.name]: newValue });
                            newValue = null;
                        }
                        return query.update({ [joinColumn.name]: newValue }).getQuery().execute();
                    });
                }
                let owningSide = relation.mappedBy ? other : owning;
                let otherSide = relation.mappedBy ? owning : other;
                let joinTable = relation.mappedBy
                    ? Mapping_1.Mapping.forEntity(other).getJoinTable(relation.mappedBy)
                    : changedMapping.getJoinTable(property);
                // Create a new row in join table.
                return this.getTransaction(owningSide)
                    .then(transaction => {
                    let queryBuilder = transaction.connection(joinTable.name);
                    let values = {};
                    joinTable.joinColumns.forEach(column => {
                        values[column.name] = owningSide[column.referencedColumnName];
                    });
                    joinTable.inverseJoinColumns.forEach(column => {
                        values[column.name] = otherSide[column.referencedColumnName];
                    });
                    if (action === UnitOfWork.RELATIONSHIP_ADDED) {
                        let query = queryBuilder.insert(values).transacting(transaction.transaction);
                        UnitOfWork.logQuery(query);
                        return query.then();
                    }
                    let query = queryBuilder.where(values).del().transacting(transaction.transaction).then();
                    UnitOfWork.logQuery(query);
                    return query;
                });
            };
            applyChanges('added', UnitOfWork.RELATIONSHIP_ADDED);
            applyChanges('removed', UnitOfWork.RELATIONSHIP_REMOVED);
        });
        return Promise.all(relationshipUpdates);
    }
    /**
     * Log a query.
     *
     * @param {knex.QueryBuilder} query
     */
    static logQuery(query) {
        if (process.env.LOG_QUERIES) {
            console.log('Executing query:', query.toString());
        }
    }
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
    clear(...entities) {
        (entities.length ? entities : this.newObjects)
            .forEach((created) => this.clearEntityState(created));
        (entities.length ? entities : this.deletedObjects)
            .forEach(deleted => this.clearEntityState(deleted));
        (entities.length ? entities : this.cleanObjects)
            .forEach(clean => this.clearEntityState(clean));
        (entities.length ? entities : this.relationshipsChangedObjects)
            .forEach(changed => this.clearEntityState(changed));
        if (entities.length) {
            this.relationshipsChangedObjects.remove(...entities);
            this.dirtyObjects.remove(...entities);
            this.deletedObjects.remove(...entities);
            this.newObjects.remove(...entities);
            this.cleanObjects.remove(...entities);
        }
        else {
            this.relationshipsChangedObjects = new ArrayCollection_1.ArrayCollection;
            this.dirtyObjects = new ArrayCollection_1.ArrayCollection;
            this.deletedObjects = new ArrayCollection_1.ArrayCollection;
            this.newObjects = new ArrayCollection_1.ArrayCollection;
            this.cleanObjects = new ArrayCollection_1.ArrayCollection;
        }
        this.transactions = {};
        this.afterCommit = [];
        return this;
    }
    /**
     * Empty after commit.
     *
     * @return {Promise<void>}
     */
    cleanAfterCommit() {
        this.afterCommit = [];
        return Promise.resolve();
    }
    /**
     * Mark everything as clean and empty transactions.
     *
     * @return {Promise<void>}
     */
    cleanObjectsAndTransactions() {
        this.newObjects.each(created => this.registerClean(created));
        this.dirtyObjects.each(updated => this.registerClean(updated));
        this.relationshipsChangedObjects.each(changed => this.registerClean(changed));
        this.deletedObjects.each(deleted => this.clearEntityState(deleted));
        this.deletedObjects = new ArrayCollection_1.ArrayCollection;
        this.transactions = {};
        return Promise.resolve();
    }
    /**
     * Mark everything as clean, empty transactions and empty after commits.
     *
     * @returns {UnitOfWork}
     */
    clean() {
        return this.cleanObjectsAndTransactions()
            .then(() => this.cleanAfterCommit());
    }
}
/**
 * @type {string}
 */
UnitOfWork.STATE_UNKNOWN = 'unknown';
/**
 * @type {string}
 */
UnitOfWork.STATE_CLEAN = 'clean';
/**
 * @type {string}
 */
UnitOfWork.STATE_DIRTY = 'dirty';
/**
 * @type {string}
 */
UnitOfWork.STATE_NEW = 'new';
/**
 * @type {string}
 */
UnitOfWork.STATE_DELETED = 'deleted';
/**
 * @type {string}
 */
UnitOfWork.RELATIONSHIP_ADDED = 'relationship_new';
/**
 * @type {string}
 */
UnitOfWork.RELATIONSHIP_REMOVED = 'relationship_removed';
exports.UnitOfWork = UnitOfWork;
