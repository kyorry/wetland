"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homefront_1 = require("homefront");
const EntityRepository_1 = require("./EntityRepository");
const MetaData_1 = require("./MetaData");
const ArrayCollection_1 = require("./ArrayCollection");
class Mapping {
    /**
     * Create a new mapping.
     *
     * @param {EntityCtor} [entity]
     */
    constructor(entity) {
        /**
         * The mapping data.
         *
         * @type {Homefront}
         */
        this.mapping = new homefront_1.Homefront;
        /**
         * @type {Array}
         */
        this.stagedMappings = [];
        if (!entity) {
            return;
        }
        this.target = entity;
        // Set up default entity mapping information.
        this.entity();
    }
    /**
     * Get the mapping for a specific entity.
     *
     * @param {EntityCtor} target
     *
     * @return {Mapping}
     */
    static forEntity(target) {
        if (!target) {
            throw new Error('Trying to get mapping for non-target.');
        }
        target = target['isEntityProxy'] ? target.getTarget() : target;
        let entity = MetaData_1.MetaData.getConstructor(target);
        let metadata = MetaData_1.MetaData.forTarget(entity);
        if (!metadata.fetch('mapping')) {
            metadata.put('mapping', new Mapping(entity));
        }
        return metadata.fetch('mapping');
    }
    /**
     * Get the target this mapping is for.
     *
     * @returns {EntityCtor}
     */
    getTarget() {
        return this.target;
    }
    /**
     * Set the entity manager target was registered to.
     *
     * @param {EntityManager} entityManager
     *
     * @returns {Mapping}
     */
    setEntityManager(entityManager) {
        this.entityManager = entityManager;
        this.applyStagedMappings();
        return this;
    }
    /**
     * Apply staged mappings.
     *
     * @returns {Mapping}
     */
    applyStagedMappings() {
        this.stagedMappings.forEach(stagedMapping => {
            this[stagedMapping.method](...stagedMapping.parameters);
        });
        this.stagedMappings = [];
        return this;
    }
    /**
     * Stage given method, or get the entity manager based on the presence of the entity manager.
     *
     * @param {string} method     The method to call.
     * @param {*}      parameters The arguments to call the method with.
     *
     * @returns {EntityManager}
     */
    stageOrGetManager(method, parameters) {
        if (!this.entityManager) {
            this.stagedMappings.push({ method, parameters });
            return;
        }
        return this.entityManager;
    }
    /**
     * Raw command for current timestamp.
     *
     * @returns {{}}
     */
    now() {
        return Mapping.now();
    }
    /**
     * Raw command for current timestamp.
     *
     * @returns {{}}
     */
    static now() {
        return { __raw: 'CURRENT_TIMESTAMP' };
    }
    /**
     * Map a field to this property. Examples:
     *
     *  mapping.field('username', {type: 'string', length: 255});
     *  mapping.field('password', {type: 'string', name: 'passwd'});
     *
     * @param {string}       property
     * @param {FieldOptions} options
     *
     * @return {Mapping}
     */
    field(property, options) {
        let entityManager = this.stageOrGetManager('field', arguments);
        if (!entityManager) {
            return;
        }
        let toUnderscore = entityManager.getConfig().fetch('mapping.defaultNamesToUnderscore');
        let propertyName = toUnderscore ? this.nameToUnderscore(property) : property;
        let field = this.mapping.fetchOrPut(`fields.${property}`, {});
        if (field.name) {
            this.mapping.remove(`columns.${this.getColumnName(property)}`);
        }
        else {
            field.name = propertyName;
        }
        homefront_1.Homefront.merge(field, options);
        this.mapColumn(this.getColumnName(property), property);
        return this;
    }
    /**
     * Replace name case to underscore.
     *
     * @param {string} property
     *
     * @returns {string}
     */
    nameToUnderscore(property) {
        let name = property[0].toLowerCase() + property.slice(1);
        return name.replace(/[A-Z]/g, '_$&').replace('__', '_').toLowerCase();
    }
    /**
     * Get the repository class for this mapping's entity.
     *
     * @returns {EntityRepository}
     */
    getRepository() {
        return this.mapping.fetch('entity.repository');
    }
    /**
     * Get the column name for a property.
     *
     * @param {string} property
     *
     * @returns {string|null}
     */
    getColumnName(property) {
        return this.getField(property).name;
    }
    /**
     * Get the options for provided `property` (field).
     *
     * @param {string}  property
     * @param {boolean} [tolerant] Don't throw an error, but return null
     *
     * @returns {FieldOptions}
     */
    getField(property, tolerant = false) {
        let field = this.mapping.fetch(`fields.${property}`);
        if (!field) {
            if (tolerant) {
                return null;
            }
            throw new Error(`Unknown field "${property}" supplied on entity "${this.getEntityName()}".`);
        }
        return field;
    }
    /**
     * @returns {Homefront}
     */
    getMappingData() {
        return this.mapping;
    }
    /**
     * Get the property name for a column name
     *
     * @param {string} column
     *
     * @returns {string|null}
     */
    getPropertyName(column) {
        return this.mapping.fetch(`columns.${column}`, null);
    }
    /**
     * Map a column to a property.
     *
     * @param {string} column
     * @param {string} property
     *
     * @returns {Mapping}
     */
    mapColumn(column, property) {
        this.mapping.put(`columns.${column}`, property);
        return this;
    }
    /**
     * Get the field names (property names) from the mapping.
     *
     * @param {boolean} includeRelations
     */
    getFieldNames(includeRelations = false) {
        let fields = this.getFields();
        return Reflect.ownKeys(fields).reduce((fieldNames, fieldName) => {
            if (!fields[fieldName].relationship || includeRelations) {
                fieldNames.push(fieldName);
            }
            return fieldNames;
        }, []);
    }
    /**
     * Map an entity. Examples:
     *
     *  mapping.entity();
     *  mapping.entity({repository: MyRepository, name: 'custom'});
     *
     * @param {{}} [options]
     *
     * @return {Mapping}
     */
    entity(options = {}) {
        let entityManager = this.stageOrGetManager('entity', arguments);
        if (!entityManager) {
            return;
        }
        let toUnderscore = entityManager.getConfig().fetch('mapping.defaultNamesToUnderscore');
        let tableName = toUnderscore ? this.nameToUnderscore(this.target.name) : this.target.name.toLowerCase();
        let defaultMapping = {
            repository: EntityRepository_1.EntityRepository,
            name: this.target.name,
            tableName: tableName,
            store: null
        };
        homefront_1.Homefront.merge(this.mapping.fetchOrPut(`entity`, defaultMapping), options);
        return this;
    }
    /**
     * Convenience method, returning an array of column names mapped from provided properties.
     *
     * @param {string|string[]} properties
     *
     * @returns {string[]}
     */
    getColumnNames(properties) {
        if (!Array.isArray(properties)) {
            properties = [properties];
        }
        return properties.map(column => this.getColumnName(column));
    }
    /**
     * Map an index. Examples:
     *
     *  - Compound
     *    mapping.index('idx_something', ['property1', 'property2']);
     *
     *  - Single
     *    mapping.index('idx_something', ['property']);
     *    mapping.index('idx_something', 'property');
     *
     *  - Generated index name "idx_property"
     *    mapping.index('property');
     *    mapping.index(['property1', 'property2']);
     *
     * @param {Array|string} indexName
     * @param {Array|string} [fields]
     *
     * @return {Mapping}
     */
    index(indexName, fields) {
        let unprocessed = this.mapping.fetchOrPut(`unprocessed_indexes`, []);
        unprocessed.push({ indexName, fields });
        return this;
    }
    /**
     * Process unprocessed indexes.
     *
     * @returns {Mapping}
     */
    processIndexes() {
        let unprocessed = this.mapping.fetch(`unprocessed_indexes`);
        if (!unprocessed) {
            return;
        }
        unprocessed.forEach(index => {
            let indexName = index.indexName;
            let fields = index.fields;
            if (!fields) {
                fields = this.getColumnNames(Array.isArray(indexName) ? indexName : [indexName]);
                indexName = `idx_${this.getTableName()}_${fields.join('_').toLowerCase()}`;
            }
            else {
                fields = this.getColumnNames(fields);
            }
            let indexes = this.mapping.fetchOrPut(`index.${indexName}`, new ArrayCollection_1.ArrayCollection);
            indexes.add(...fields);
        });
        this.mapping.remove(`unprocessed_indexes`);
        return this;
    }
    /**
     * Get the indexes.
     *
     * @returns {{}}
     */
    getIndexes() {
        this.processIndexes();
        return this.mapping.fetch('index', {});
    }
    /**
     * Map a unique constraint.
     *
     *  - Compound:
     *    mapping.uniqueConstraint('something_unique', ['property1', 'property2']);
     *
     *  - Single:
     *    mapping.uniqueConstraint('something_unique', ['property']);
     *    mapping.uniqueConstraint('something_unique', 'property');
     *
     *  - Generated uniqueConstraint name:
     *    mapping.uniqueConstraint('property');
     *    mapping.uniqueConstraint(['property1', 'property2']);
     *
     * @param {Array|string} constraintName
     * @param {Array|string} [fields]
     *
     * @return {Mapping}
     */
    uniqueConstraint(constraintName, fields) {
        let unprocessed = this.mapping.fetchOrPut(`unprocessed_uniques`, []);
        unprocessed.push({ constraintName, fields });
        return this;
    }
    /**
     * Process unprocessed constraints.
     *
     * @returns {Mapping}
     */
    processUniqueConstraints() {
        let unprocessed = this.mapping.fetch(`unprocessed_uniques`);
        if (!unprocessed) {
            return;
        }
        unprocessed.forEach(constraint => {
            let constraintName = constraint.constraintName;
            let fields = constraint.fields;
            if (!fields) {
                fields = this.getColumnNames(Array.isArray(constraintName) ? constraintName : [constraintName]);
                constraintName = `${this.getTableName()}_${fields.join('_').toLowerCase()}_unique`;
            }
            else {
                fields = this.getColumnNames(fields);
            }
            let constraints = this.mapping.fetchOrPut(`unique.${constraintName}`, new ArrayCollection_1.ArrayCollection);
            constraints.add(...fields);
        });
        this.mapping.remove(`unprocessed_uniques`);
        return this;
    }
    /**
     * Get the unique constraints.
     *
     * @returns {{}}
     */
    getUniqueConstraints() {
        this.processUniqueConstraints();
        return this.mapping.fetch('unique', {});
    }
    /**
     * Map a property to be the primary key. Example:
     *
     *  mapping.id('id');
     *
     * @param {string} property
     *
     * @return {Mapping}
     */
    primary(property) {
        this.mapping.put('primary', property);
        this.extendField(property, { primary: true });
        return this;
    }
    /**
     * Convenience method that automatically sets a PK id.
     *
     * @returns {Mapping}
     */
    autoPK() {
        return this.increments('id').primary('id');
    }
    /**
     * Convenience method that automatically sets a createdAt.
     *
     * @returns {Mapping}
     */
    autoCreatedAt() {
        return this.field('createdAt', { type: 'datetime', defaultTo: this.now() });
    }
    /**
     * Convenience method that automatically sets an updatedAt.
     *
     * @returns {Mapping}
     */
    autoUpdatedAt() {
        return this.field('updatedAt', { type: 'datetime', defaultTo: this.now() });
    }
    /**
     * Convenience method that automatically sets a PK, updatedAt and createdAt.
     *
     * @returns {Mapping}
     */
    autoFields() {
        return this.autoPK().autoCreatedAt().autoUpdatedAt();
    }
    /**
     * Get the column name for the primary key.
     *
     * @returns {string|null}
     */
    getPrimaryKeyField() {
        let primaryKey = this.getPrimaryKey();
        if (!primaryKey) {
            return null;
        }
        return this.getFieldName(primaryKey, primaryKey);
    }
    /**
     * Get the property that has been assigned as the primary key.
     *
     * @returns {string}
     */
    getPrimaryKey() {
        return this.mapping.fetch('primary', null);
    }
    /**
     * Get the column name for given property.
     *
     * @param {string} property
     * @param {string} [defaultValue]
     *
     * @returns {string}
     */
    getFieldName(property, defaultValue = null) {
        return this.mapping.fetch(`fields.${property}.name`, defaultValue);
    }
    /**
     * Get the fields for mapped entity.
     *
     * @returns {FieldOptions[]}
     */
    getFields() {
        return this.mapping.fetch('fields', null);
    }
    /**
     * Get the name of the entity.
     *
     * @returns {string}
     */
    getEntityName() {
        return this.mapping.fetch('entity.name');
    }
    /**
     * Get the name of the table.
     *
     * @returns {string}
     */
    getTableName() {
        return this.mapping.fetch('entity.tableName');
    }
    /**
     * Get the name of the store mapped to this entity.
     *
     * @returns {string}
     */
    getStoreName() {
        return this.mapping.fetch('entity.store');
    }
    /**
     * Map generatedValues. Examples:
     *
     *  // Auto increment
     *  mapping.generatedValue('id', 'autoIncrement');
     *
     * @param {string} property
     * @param {string} type
     *
     * @return {Mapping}
     */
    generatedValue(property, type) {
        this.extendField(property, { generatedValue: type });
        return this;
    }
    /**
     * Convenience method to set auto increment.
     *
     * @param {string} property
     *
     * @returns {Mapping}
     */
    increments(property) {
        return this.generatedValue(property, 'autoIncrement');
    }
    /**
     * Set cascade values.
     *
     * @param {string}    property
     * @param {string[]}  cascades
     *
     * @returns {Mapping}
     */
    cascade(property, cascades) {
        return this.extendField(property, { cascades: cascades });
    }
    /**
     * Add a relation to the mapping.
     *
     * @param {string}       property
     * @param {Relationship} options
     *
     * @returns {Mapping}
     */
    addRelation(property, options) {
        if (!options.targetEntity) {
            throw new Error('Required property "targetEntity" not found in options.');
        }
        this.setDefaultCascades(property);
        this.extendField(property, { relationship: options });
        homefront_1.Homefront.merge(this.mapping.fetchOrPut('relations', {}), { [property]: options });
        return this;
    }
    /**
     * Sets the default cascades if no cascade options exist
     *
     * @param {string} property
     *
     * @returns {Mapping}
     */
    setDefaultCascades(property) {
        if (!this.entityManager) {
            return;
        }
        const field = this.getField(property, true);
        if (field && typeof field.cascades === 'undefined') {
            this.cascade(property, this.entityManager.getConfig().fetch('mapping.defaults.cascades', []));
        }
        return this;
    }
    /**
     * Does property exist as relation.
     *
     * @param {string} property
     *
     * @returns {boolean}
     */
    isRelation(property) {
        return !!this.mapping.fetch(`relations.${property}`);
    }
    /**
     * Get the type for a property.
     *
     * @param {string}property
     *
     * @returns {string}
     */
    getType(property) {
        return this.mapping.fetch(`fields.${property}.type`, 'string');
    }
    /**
     * Get the relations for mapped entity.
     *
     * @returns {{}}
     */
    getRelations() {
        return this.mapping.fetch('relations');
    }
    /**
     * Get the relations for mapped entity.
     *
     * @returns {Relationship}
     */
    getRelation(property) {
        return this.mapping.fetch(`relations.${property}`);
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToOne(property, options) {
        this.addRelation(property, {
            type: Mapping.RELATION_ONE_TO_ONE,
            targetEntity: options.targetEntity,
            inversedBy: options.inversedBy,
            mappedBy: options.mappedBy
        });
        if (!options.mappedBy) {
            this.ensureJoinColumn(property);
        }
        return this;
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToMany(property, options) {
        return this.addRelation(property, {
            targetEntity: options.targetEntity,
            type: Mapping.RELATION_ONE_TO_MANY,
            mappedBy: options.mappedBy
        });
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToOne(property, options) {
        this.addRelation(property, {
            targetEntity: options.targetEntity,
            type: Mapping.RELATION_MANY_TO_ONE,
            inversedBy: options.inversedBy
        });
        this.ensureJoinColumn(property);
        return this;
    }
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToMany(property, options) {
        return this.addRelation(property, {
            targetEntity: options.targetEntity,
            type: Mapping.RELATION_MANY_TO_MANY,
            inversedBy: options.inversedBy,
            mappedBy: options.mappedBy
        });
    }
    /**
     * Register a join table.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinTable(property, options) {
        this.extendField(property, { joinTable: options });
        return this;
    }
    /**
     * Register a join column.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinColumn(property, options) {
        return this.ensureJoinColumn(property, options);
    }
    /**
     * Get the join column for the relationship mapped via property.
     *
     * @param {string}    property
     * @param {JoinTable} [options]
     *
     * @returns {Mapping}
     */
    ensureJoinColumn(property, options) {
        let field = this.mapping.fetchOrPut(`fields.${property}`, { joinColumn: {} });
        field.joinColumn = homefront_1.Homefront.merge({
            name: `${property}_id`,
            referencedColumnName: 'id',
            unique: false,
            nullable: true
        }, options || field.joinColumn);
        return this;
    }
    /**
     * Get join table.
     *
     * @param {string} property
     *
     * @returns {JoinTable}
     */
    getJoinTable(property) {
        if (!this.entityManager) {
            throw new Error('EntityManager is required on the mapping. Make sure you registered the entity.');
        }
        let field = this.mapping.fetchOrPut(`fields.${property}`, { joinTable: { name: '' } });
        if (field.joinTable && field.joinTable.complete) {
            return field.joinTable;
        }
        let relationMapping = Mapping.forEntity(this.entityManager.resolveEntityReference(field.relationship.targetEntity));
        let ownTableName = this.getTableName();
        let withTableName = relationMapping.getTableName();
        let ownPrimary = this.getPrimaryKeyField();
        let withPrimary = relationMapping.getPrimaryKeyField();
        field.joinTable = homefront_1.Homefront.merge({
            complete: true,
            name: `${ownTableName}_${withTableName}`,
            joinColumns: [{
                    referencedColumnName: ownPrimary,
                    name: `${ownTableName}_id`,
                    type: 'integer'
                }],
            inverseJoinColumns: [{
                    referencedColumnName: withPrimary,
                    name: `${withTableName}_id`,
                    type: 'integer'
                }]
        }, field.joinTable);
        return field.joinTable;
    }
    /**
     * Get join column.
     *
     * @param {string} property
     *
     * @returns {JoinColumn}
     */
    getJoinColumn(property) {
        return this.getField(property).joinColumn;
    }
    /**
     * Extend the options of a field. This allows us to allow a unspecified order in defining mappings.
     *
     * @param {string} property
     * @param {{}}     additional
     *
     * @returns {Mapping}
     */
    extendField(property, additional) {
        let field = this.mapping.fetchOrPut(`fields.${property}`, {});
        let needsName = !field.name;
        if (needsName) {
            field.name = property;
        }
        homefront_1.Homefront.merge(field, additional);
        if (needsName) {
            this.mapColumn(this.getColumnName(property) || property, property);
        }
        return this;
    }
    /**
     * Get a Field scope mapping.
     *
     * @param {string} property
     *
     * @returns {Field}
     */
    forProperty(property) {
        return new Field(property, this);
    }
    /**
     * Complete the mapping.
     *
     * @returns {Mapping}
     */
    completeMapping() {
        let relations = this.getRelations();
        let manager = this.entityManager;
        for (let property in relations) {
            let relation = relations[property];
            this.setDefaultCascades(property);
            // Make sure joinTable is complete.
            if (relation.type === Mapping.RELATION_MANY_TO_MANY && relation.inversedBy) {
                this.getJoinTable(property);
            }
            if (!relation.mappedBy) {
                this.ensureJoinColumn(property);
            }
            // Make sure refs are strings
            if (typeof relation.targetEntity !== 'string') {
                let reference = manager.resolveEntityReference(relation.targetEntity);
                relation.targetEntity = Mapping.forEntity(reference).getEntityName();
            }
        }
        this.processIndexes();
        this.processUniqueConstraints();
        return this;
    }
    /**
     * Returns the mapping in complete mode. Doesn't include the repository.
     *
     * @returns {{}}
     */
    serializable() {
        return this.completeMapping().mapping.expand();
    }
    /**
     * Restore a serialized mapping.
     *
     * NOTE: Unless provided, there won't be an entity reference.
     *
     * @param {{}} mappingData
     *
     * @returns {Mapping}
     */
    static restore(mappingData) {
        let mapping = new Mapping();
        mapping.getMappingData().merge(mappingData);
        return mapping;
    }
}
/**
 * @type {string}
 */
Mapping.RELATION_ONE_TO_MANY = 'oneToMany';
/**
 * @type {string}
 */
Mapping.RELATION_MANY_TO_MANY = 'manyToMany';
/**
 * @type {string}
 */
Mapping.RELATION_MANY_TO_ONE = 'manyToOne';
/**
 * @type {string}
 */
Mapping.RELATION_ONE_TO_ONE = 'oneToOne';
/**
 * @type {string}
 */
Mapping.CASCADE_PERSIST = 'persist';
exports.Mapping = Mapping;
/**
 * Convenience class for chaining field definitions.
 */
class Field {
    /**
     * Construct convenience class to map property.
     *
     * @param {string}  property
     * @param {Mapping} mapping
     */
    constructor(property, mapping) {
        this.property = property;
        this.mapping = mapping;
    }
    /**
     * Map a field to this property. Examples:
     *
     *  mapping.field({type: 'string', length: 255});
     *  mapping.field({type: 'string', name: 'passwd'});
     *
     * @param {FieldOptions} options
     *
     * @return {Field}
     */
    field(options) {
        this.mapping.field(this.property, options);
        return this;
    }
    /**
     * Map to be the primary key.
     *
     * @return {Field}
     */
    primary() {
        this.mapping.primary(this.property);
        return this;
    }
    /**
     * Generate a PK field id
     *
     * @return {Field}
     */
    autoPK() {
        this.mapping.autoPK();
        return this;
    }
    /**
     * Generate a createdAt field
     *
     * @return {Field}
     */
    autoCreatedAt() {
        this.mapping.autoCreatedAt();
        return this;
    }
    /**
     * Generate an updatedAt field
     *
     * @return {Field}
     */
    autoUpdatedAt() {
        this.mapping.autoUpdatedAt();
        return this;
    }
    /**
     * Generate a PK, createdAt and updatedAt field
     *
     * @return {Field}
     */
    autoFields() {
        this.mapping.autoFields();
        return this;
    }
    /**
     * Map generatedValues. Examples:
     *
     *  // Auto increment
     *  mapping.generatedValue('autoIncrement');
     *
     * @param {string} type
     *
     * @return {Field}
     */
    generatedValue(type) {
        this.mapping.generatedValue(this.property, type);
        return this;
    }
    /**
     * Set cascade values.
     *
     * @param {string[]}  cascades
     *
     * @returns {Field}
     */
    cascade(cascades) {
        this.mapping.cascade(this.property, cascades);
        return this;
    }
    /**
     * Convenience method for auto incrementing values.
     *
     * @returns {Field}
     */
    increments() {
        this.mapping.increments(this.property);
        return this;
    }
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    oneToOne(options) {
        this.mapping.oneToOne(this.property, options);
        return this;
    }
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    oneToMany(options) {
        this.mapping.oneToMany(this.property, options);
        return this;
    }
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    manyToOne(options) {
        this.mapping.manyToOne(this.property, options);
        return this;
    }
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    manyToMany(options) {
        this.mapping.manyToMany(this.property, options);
        return this;
    }
    /**
     * Register a join table.
     *
     * @param {JoinTable} options
     *
     * @returns {Field}
     */
    joinTable(options) {
        this.mapping.joinTable(this.property, options);
        return this;
    }
    /**
     * Register a join column.
     *
     * @param {JoinTable} options
     *
     * @returns {Field}
     */
    joinColumn(options) {
        this.mapping.joinColumn(this.property, options);
        return this;
    }
}
exports.Field = Field;
