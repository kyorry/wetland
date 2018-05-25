import { Homefront } from 'homefront';
import { EntityRepository } from './EntityRepository';
import { EntityManager } from './EntityManager';
import { EntityCtor, EntityInterface, ProxyInterface } from './EntityInterface';
export declare class Mapping<T> {
    /**
     * @type {string}
     */
    static RELATION_ONE_TO_MANY: string;
    /**
     * @type {string}
     */
    static RELATION_MANY_TO_MANY: string;
    /**
     * @type {string}
     */
    static RELATION_MANY_TO_ONE: string;
    /**
     * @type {string}
     */
    static RELATION_ONE_TO_ONE: string;
    /**
     * @type {string}
     */
    static CASCADE_PERSIST: string;
    /**
     * The mapping data.
     *
     * @type {Homefront}
     */
    private mapping;
    /**
     * Entity this mapping is for.
     *
     * @type {EntityCtor}
     */
    private target;
    /**
     * @type {EntityManager}
     */
    private entityManager;
    /**
     * @type {Array}
     */
    private stagedMappings;
    /**
     * Get the mapping for a specific entity.
     *
     * @param {EntityCtor} target
     *
     * @return {Mapping}
     */
    static forEntity<T>(target: EntityCtor<T> | T | ProxyInterface): Mapping<T>;
    /**
     * Create a new mapping.
     *
     * @param {EntityCtor} [entity]
     */
    constructor(entity?: EntityCtor<T>);
    /**
     * Get the target this mapping is for.
     *
     * @returns {EntityCtor}
     */
    getTarget(): EntityCtor<T>;
    /**
     * Set the entity manager target was registered to.
     *
     * @param {EntityManager} entityManager
     *
     * @returns {Mapping}
     */
    setEntityManager(entityManager: EntityManager): this;
    /**
     * Apply staged mappings.
     *
     * @returns {Mapping}
     */
    private applyStagedMappings();
    /**
     * Stage given method, or get the entity manager based on the presence of the entity manager.
     *
     * @param {string} method     The method to call.
     * @param {*}      parameters The arguments to call the method with.
     *
     * @returns {EntityManager}
     */
    private stageOrGetManager(method, parameters);
    /**
     * Raw command for current timestamp.
     *
     * @returns {{}}
     */
    now(): {
        __raw: string;
    };
    /**
     * Raw command for current timestamp.
     *
     * @returns {{}}
     */
    static now(): {
        __raw: string;
    };
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
    field(property: string, options: FieldOptions): this;
    /**
     * Replace name case to underscore.
     *
     * @param {string} property
     *
     * @returns {string}
     */
    private nameToUnderscore(property);
    /**
     * Get the repository class for this mapping's entity.
     *
     * @returns {EntityRepository}
     */
    getRepository(): new (...args: any[]) => EntityRepository<T>;
    /**
     * Get the column name for a property.
     *
     * @param {string} property
     *
     * @returns {string|null}
     */
    getColumnName(property: any): string | null;
    /**
     * Get the options for provided `property` (field).
     *
     * @param {string}  property
     * @param {boolean} [tolerant] Don't throw an error, but return null
     *
     * @returns {FieldOptions}
     */
    getField(property: string, tolerant?: boolean): FieldOptions;
    /**
     * @returns {Homefront}
     */
    getMappingData(): Homefront;
    /**
     * Get the property name for a column name
     *
     * @param {string} column
     *
     * @returns {string|null}
     */
    getPropertyName(column: any): string | null;
    /**
     * Map a column to a property.
     *
     * @param {string} column
     * @param {string} property
     *
     * @returns {Mapping}
     */
    private mapColumn(column, property);
    /**
     * Get the field names (property names) from the mapping.
     *
     * @param {boolean} includeRelations
     */
    getFieldNames(includeRelations?: boolean): Array<string>;
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
    entity(options?: Object): this;
    /**
     * Convenience method, returning an array of column names mapped from provided properties.
     *
     * @param {string|string[]} properties
     *
     * @returns {string[]}
     */
    getColumnNames(properties: Array<string>): Array<string>;
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
    index(indexName: string | Array<string>, fields?: string | Array<string>): this;
    /**
     * Process unprocessed indexes.
     *
     * @returns {Mapping}
     */
    private processIndexes();
    /**
     * Get the indexes.
     *
     * @returns {{}}
     */
    getIndexes(): {
        [key: string]: Array<string>;
    };
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
    uniqueConstraint(constraintName: string | Array<string>, fields?: string | Array<string>): this;
    /**
     * Process unprocessed constraints.
     *
     * @returns {Mapping}
     */
    private processUniqueConstraints();
    /**
     * Get the unique constraints.
     *
     * @returns {{}}
     */
    getUniqueConstraints(): {
        [key: string]: Array<string>;
    };
    /**
     * Map a property to be the primary key. Example:
     *
     *  mapping.id('id');
     *
     * @param {string} property
     *
     * @return {Mapping}
     */
    primary(property: string): this;
    /**
     * Convenience method that automatically sets a PK id.
     *
     * @returns {Mapping}
     */
    autoPK(): this;
    /**
     * Convenience method that automatically sets a createdAt.
     *
     * @returns {Mapping}
     */
    autoCreatedAt(): this;
    /**
     * Convenience method that automatically sets an updatedAt.
     *
     * @returns {Mapping}
     */
    autoUpdatedAt(): this;
    /**
     * Convenience method that automatically sets a PK, updatedAt and createdAt.
     *
     * @returns {Mapping}
     */
    autoFields(): this;
    /**
     * Get the column name for the primary key.
     *
     * @returns {string|null}
     */
    getPrimaryKeyField(): string;
    /**
     * Get the property that has been assigned as the primary key.
     *
     * @returns {string}
     */
    getPrimaryKey(): string;
    /**
     * Get the column name for given property.
     *
     * @param {string} property
     * @param {string} [defaultValue]
     *
     * @returns {string}
     */
    getFieldName(property: string, defaultValue?: any): string;
    /**
     * Get the fields for mapped entity.
     *
     * @returns {FieldOptions[]}
     */
    getFields(): {
        [key: string]: FieldOptions;
    };
    /**
     * Get the name of the entity.
     *
     * @returns {string}
     */
    getEntityName(): string;
    /**
     * Get the name of the table.
     *
     * @returns {string}
     */
    getTableName(): string;
    /**
     * Get the name of the store mapped to this entity.
     *
     * @returns {string}
     */
    getStoreName(): string;
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
    generatedValue(property: string, type: string): this;
    /**
     * Convenience method to set auto increment.
     *
     * @param {string} property
     *
     * @returns {Mapping}
     */
    increments(property: string): this;
    /**
     * Set cascade values.
     *
     * @param {string}    property
     * @param {string[]}  cascades
     *
     * @returns {Mapping}
     */
    cascade(property: string, cascades: Array<string>): this;
    /**
     * Add a relation to the mapping.
     *
     * @param {string}       property
     * @param {Relationship} options
     *
     * @returns {Mapping}
     */
    addRelation(property: string, options: Relationship): this;
    /**
     * Sets the default cascades if no cascade options exist
     *
     * @param {string} property
     *
     * @returns {Mapping}
     */
    private setDefaultCascades(property);
    /**
     * Does property exist as relation.
     *
     * @param {string} property
     *
     * @returns {boolean}
     */
    isRelation(property: string): boolean;
    /**
     * Get the type for a property.
     *
     * @param {string}property
     *
     * @returns {string}
     */
    getType(property: string): string;
    /**
     * Get the relations for mapped entity.
     *
     * @returns {{}}
     */
    getRelations(): {
        [key: string]: Relationship;
    };
    /**
     * Get the relations for mapped entity.
     *
     * @returns {Relationship}
     */
    getRelation(property: string): Relationship;
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToOne(property: string, options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    oneToMany(property: string, options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToOne(property: string, options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {string}        property
     * @param {Relationship}  options
     *
     * @returns {Mapping}
     */
    manyToMany(property: string, options: Relationship): this;
    /**
     * Register a join table.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinTable(property: string, options: JoinTable): this;
    /**
     * Register a join column.
     *
     * @param {string}    property
     * @param {JoinTable} options
     *
     * @returns {Mapping}
     */
    joinColumn(property: string, options: JoinColumn): this;
    /**
     * Get the join column for the relationship mapped via property.
     *
     * @param {string}    property
     * @param {JoinTable} [options]
     *
     * @returns {Mapping}
     */
    ensureJoinColumn(property: string, options?: JoinColumn): this;
    /**
     * Get join table.
     *
     * @param {string} property
     *
     * @returns {JoinTable}
     */
    getJoinTable(property: string): JoinTable;
    /**
     * Get join column.
     *
     * @param {string} property
     *
     * @returns {JoinColumn}
     */
    getJoinColumn(property: string): JoinColumn;
    /**
     * Extend the options of a field. This allows us to allow a unspecified order in defining mappings.
     *
     * @param {string} property
     * @param {{}}     additional
     *
     * @returns {Mapping}
     */
    extendField(property: string, additional: Object): this;
    /**
     * Get a Field scope mapping.
     *
     * @param {string} property
     *
     * @returns {Field}
     */
    forProperty(property: string): Field;
    /**
     * Complete the mapping.
     *
     * @returns {Mapping}
     */
    completeMapping(): this;
    /**
     * Returns the mapping in complete mode. Doesn't include the repository.
     *
     * @returns {{}}
     */
    serializable(): Object;
    /**
     * Restore a serialized mapping.
     *
     * NOTE: Unless provided, there won't be an entity reference.
     *
     * @param {{}} mappingData
     *
     * @returns {Mapping}
     */
    static restore(mappingData: Object): Mapping<ProxyInterface>;
}
/**
 * Convenience class for chaining field definitions.
 */
export declare class Field {
    /**
     * @type {string}
     */
    private property;
    /**
     * @type {Mapping}
     */
    private mapping;
    /**
     * Construct convenience class to map property.
     *
     * @param {string}  property
     * @param {Mapping} mapping
     */
    constructor(property: string, mapping: Mapping<EntityInterface>);
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
    field(options: FieldOptions): this;
    /**
     * Map to be the primary key.
     *
     * @return {Field}
     */
    primary(): this;
    /**
     * Generate a PK field id
     *
     * @return {Field}
     */
    autoPK(): this;
    /**
     * Generate a createdAt field
     *
     * @return {Field}
     */
    autoCreatedAt(): this;
    /**
     * Generate an updatedAt field
     *
     * @return {Field}
     */
    autoUpdatedAt(): this;
    /**
     * Generate a PK, createdAt and updatedAt field
     *
     * @return {Field}
     */
    autoFields(): this;
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
    generatedValue(type: string): this;
    /**
     * Set cascade values.
     *
     * @param {string[]}  cascades
     *
     * @returns {Field}
     */
    cascade(cascades: Array<string>): this;
    /**
     * Convenience method for auto incrementing values.
     *
     * @returns {Field}
     */
    increments(): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    oneToOne(options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    oneToMany(options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    manyToOne(options: Relationship): this;
    /**
     * Map a relationship.
     *
     * @param {Relationship} options
     *
     * @returns {Field}
     */
    manyToMany(options: Relationship): this;
    /**
     * Register a join table.
     *
     * @param {JoinTable} options
     *
     * @returns {Field}
     */
    joinTable(options: JoinTable): this;
    /**
     * Register a join column.
     *
     * @param {JoinTable} options
     *
     * @returns {Field}
     */
    joinColumn(options: JoinColumn): this;
}
export interface FieldOptions {
    type: string;
    primary?: boolean;
    textType?: string;
    precision?: number;
    enumeration?: Array<any>;
    generatedValue?: string;
    scale?: number;
    nullable?: boolean;
    defaultTo?: any | Object;
    unsigned?: boolean;
    comment?: string;
    size?: number;
    name?: string;
    cascades?: Array<string>;
    relationship?: Relationship;
    joinColumn?: JoinColumn;
    joinTable?: JoinTable;
    [key: string]: any;
}
export interface JoinTable {
    name: string;
    complete?: boolean;
    joinColumns?: Array<JoinColumn>;
    inverseJoinColumns?: Array<JoinColumn>;
}
export interface JoinColumn {
    referencedColumnName?: string;
    name?: string;
    type?: string;
    size?: number;
    indexName?: string;
    onDelete?: string;
    onUpdate?: string;
    unique?: boolean;
    nullable?: boolean;
}
export interface Relationship {
    targetEntity: string | {
        new ();
    };
    type?: string;
    inversedBy?: string;
    mappedBy?: string;
}
