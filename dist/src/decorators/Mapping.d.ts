import { JoinColumn, Relationship, JoinTable, FieldOptions } from '../Mapping';
import { EntityRepository } from '../EntityRepository';
/**
 * Decorate an entity. Examples:
 *
 *  - Default name and repository
 *    @entity()
 *    class Foo {}
 *
 *  - Custom name and repository
 *    @entity({repository: MyRepository, name: 'custom'})
 *    class Foo {}
 *
 * @param {{}} [options]
 *
 * @return {Mapping}
 */
export declare function entity(options?: {
    repository?: typeof EntityRepository;
    name?: string;
    [key: string]: any;
}): (target: Object) => void;
/**
 * Decorate autoFields (id, createdAt, updatedAt) for an entity.
 *
 * @return {Mapping}
 */
export declare function autoFields(): (target: Object) => void;
/**
 * Decorate your entity with an index. Examples:
 *
 *  - Compound
 *    @index('idx_something', ['property1', 'property2'])
 *
 *  - Single
 *    @index('idx_something', ['property'])
 *    @index('idx_something', 'property')
 *
 *  - Generated index name "idx_property"
 *    @index('property')
 *    @index(['property1', 'property2'])
 *
 * @param {Array|string} indexName
 * @param {Array|string} [fields]
 *
 * @return {Mapping}
 */
export declare function index(indexName: string | Array<string>, fields?: string | Array<string>): (target: Object) => void;
/**
 * Decorate your entity with a uniqueConstraint
 *
 *  - Compound:
 *    @uniqueConstraint('something_unique', ['property1', 'property2'])
 *
 *  - Single:
 *    @uniqueConstraint('something_unique', ['property'])
 *    @uniqueConstraint('something_unique', 'property')
 *
 *  - Generated uniqueConstraint name:
 *    @uniqueConstraint('property')
 *    @uniqueConstraint(['property1', 'property2'])
 *
 * @param {Array|string} constraintName
 * @param {Array|string} [fields]
 *
 * @return {Function}
 */
export declare function uniqueConstraint(constraintName: string | Array<string>, fields?: string | Array<string>): (target: Object) => void;
/**
 * Decorate a property as a field. Examples:
 *
 *  - Default (property) name
 *    @field('username', {type: 'string', length: 255})
 *    username: string;
 *
 *  - Custom name
 *    @field('password', {type: 'string', name: 'passwd'})
 *    password: string;
 *
 * @param {{}} options
 *
 * @return {Mapping}
 */
export declare function field(options: FieldOptions): (target: Object, property: string) => void;
/**
 * Map to be the primary key.
 *
 * @return {Field}
 */
export declare function primary(): (target: Object, property: string) => void;
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
export declare function generatedValue(type: string): (target: Object, property: string) => void;
/**
 * Set cascade values.
 *
 * @param {string[]}  cascades
 *
 * @returns {Field}
 */
export declare function cascade(cascades: Array<string>): (target: Object, property: string) => void;
/**
 * Convenience method for auto incrementing values.
 *
 * @returns {Field}
 */
export declare function increments(): (target: Object, property: string) => void;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export declare function oneToOne(options: Relationship): (target: Object, property: string) => void;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export declare function oneToMany(options: Relationship): (target: Object, property: string) => void;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export declare function manyToOne(options: Relationship): (target: Object, property: string) => void;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
export declare function manyToMany(options: Relationship): (target: Object, property: string) => void;
/**
 * Register a join table.
 *
 * @param {JoinTable} options
 *
 * @returns {Field}
 */
export declare function joinTable(options: JoinTable): (target: Object, property: string) => void;
/**
 * Register a join column.
 *
 * @param {JoinTable} options
 *
 * @returns {Field}
 */
export declare function joinColumn(options: JoinColumn): (target: Object, property: string) => void;
