"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArrayCollection_1 = require("./ArrayCollection");
const Mapping_1 = require("./Mapping");
class Populate {
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.unitOfWork = entityManager.getUnitOfWork();
    }
    /**
     * Find records for update based on provided data.
     *
     * @param {number|string} primaryKey
     * @param {EntityCtor}    Entity
     * @param {{}}            data
     *
     * @returns {Promise<{new()}>}
     */
    findDataForUpdate(primaryKey, Entity, data) {
        let repository = this.entityManager.getRepository(Entity);
        let mapping = this.entityManager.getMapping(Entity);
        let options = { populate: new ArrayCollection_1.ArrayCollection(), alias: mapping.getTableName() };
        let relations = mapping.getRelations();
        Reflect.ownKeys(data).forEach(property => {
            if (!relations || !relations[property]) {
                return;
            }
            let relation = relations[property];
            let reference = this.entityManager.resolveEntityReference(relation.targetEntity);
            let type = relation.type;
            if (type === Mapping_1.Mapping.RELATION_ONE_TO_MANY || type === Mapping_1.Mapping.RELATION_MANY_TO_MANY) {
                return options.populate.add({ [property]: property });
            }
            if (typeof data[property] !== 'object' || data[property] === null) {
                return;
            }
            if (!data[property][Mapping_1.Mapping.forEntity(reference).getPrimaryKey()]) {
                return;
            }
            options.populate.add({ [property]: property });
        });
        return repository.findOne(primaryKey, options);
    }
    /**
     * Assign data based on a collection.
     *
     * @param {EntityCtor}      Entity
     * @param {{}}              data
     * @param {{}}              [base]
     * @param {boolean|number}  [recursive]
     *
     * @returns {Collection<T>}
     */
    assignCollection(Entity, data, base, recursive = 1) {
        base = base || new ArrayCollection_1.ArrayCollection;
        base.splice(0);
        data.forEach(rowData => {
            base.push(this.assign(Entity, rowData, null, recursive));
        });
        return base;
    }
    /**
     * Assign data to base. Create new if not provided.
     *
     * @param {EntityCtor}      Entity
     * @param {{}}              data
     * @param {{}}              [base]
     * @param {boolean|number}  [recursive]
     *
     * @returns {T}
     */
    assign(Entity, data, base, recursive = 1) {
        let mapping = this.entityManager.getMapping(Entity);
        let fields = mapping.getFields();
        let primary = mapping.getPrimaryKey();
        // Ensure base.
        if (!(base instanceof Entity)) {
            if (typeof data === 'string' || typeof data === 'number') {
                // Convenience, allow the primary key value.
                return this.entityManager.getReference(Entity, data, false);
            }
            if (data && data[primary]) {
                // Get the reference (from identity map or mocked)
                base = this.entityManager.getReference(Entity, data[primary]);
                base['activateProxying']();
            }
            else {
                // Create a new instance and persist.
                base = new Entity();
                this.entityManager.persist(base);
            }
        }
        Reflect.ownKeys(data).forEach((property) => {
            let field = fields[property];
            // Only allow mapped fields to be assigned.
            if (!field) {
                return;
            }
            // Only relationships require special treatment. This isn't one, so just assign and move on.
            if (!field.relationship) {
                if (['date', 'dateTime', 'datetime', 'time'].indexOf(field.type) > -1 && !(data[property] instanceof Date)) {
                    data[property] = new Date(data[property]);
                }
                base[property] = data[property];
                return;
            }
            if (!data[property]) {
                if (base[property]) {
                    delete base[property];
                }
                return;
            }
            if (!recursive) {
                return;
            }
            if (Array.isArray(data[property]) && !data[property].length && (!base[property] || !base[property].length)) {
                return;
            }
            let level = recursive;
            if (typeof level === 'number') {
                level--;
            }
            let targetConstructor = this.entityManager.resolveEntityReference(field.relationship.targetEntity);
            if (Array.isArray(data[property])) {
                base[property] = this.assignCollection(targetConstructor, data[property], base[property], level);
            }
            else if (data[property]) {
                base[property] = this.assign(targetConstructor, data[property], base[property], level);
            }
        });
        return base;
    }
}
exports.Populate = Populate;
