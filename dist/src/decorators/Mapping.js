"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mapping_1 = require("../Mapping");
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
function entity(options) {
    return (target) => {
        Mapping_1.Mapping.forEntity(target).entity(options);
    };
}
exports.entity = entity;
/**
 * Decorate autoFields (id, createdAt, updatedAt) for an entity.
 *
 * @return {Mapping}
 */
function autoFields() {
    return (target) => {
        Mapping_1.Mapping.forEntity(target).autoFields();
    };
}
exports.autoFields = autoFields;
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
function index(indexName, fields) {
    return (target) => {
        Mapping_1.Mapping.forEntity(target).index(indexName, fields);
    };
}
exports.index = index;
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
function uniqueConstraint(constraintName, fields) {
    return (target) => {
        Mapping_1.Mapping.forEntity(target).uniqueConstraint(constraintName, fields);
    };
}
exports.uniqueConstraint = uniqueConstraint;
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
function field(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).field(property, options);
    };
}
exports.field = field;
/**
 * Map to be the primary key.
 *
 * @return {Field}
 */
function primary() {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).primary(property);
    };
}
exports.primary = primary;
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
function generatedValue(type) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).generatedValue(property, type);
    };
}
exports.generatedValue = generatedValue;
/**
 * Set cascade values.
 *
 * @param {string[]}  cascades
 *
 * @returns {Field}
 */
function cascade(cascades) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).cascade(property, cascades);
    };
}
exports.cascade = cascade;
/**
 * Convenience method for auto incrementing values.
 *
 * @returns {Field}
 */
function increments() {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).increments(property);
    };
}
exports.increments = increments;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
function oneToOne(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).oneToOne(property, options);
    };
}
exports.oneToOne = oneToOne;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
function oneToMany(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).oneToMany(property, options);
    };
}
exports.oneToMany = oneToMany;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
function manyToOne(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).manyToOne(property, options);
    };
}
exports.manyToOne = manyToOne;
/**
 * Map a relationship.
 *
 * @param {Relationship} options
 *
 * @returns {Field}
 */
function manyToMany(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).manyToMany(property, options);
    };
}
exports.manyToMany = manyToMany;
/**
 * Register a join table.
 *
 * @param {JoinTable} options
 *
 * @returns {Field}
 */
function joinTable(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).joinTable(property, options);
    };
}
exports.joinTable = joinTable;
/**
 * Register a join column.
 *
 * @param {JoinTable} options
 *
 * @returns {Field}
 */
function joinColumn(options) {
    return (target, property) => {
        Mapping_1.Mapping.forEntity(target).joinColumn(property, options);
    };
}
exports.joinColumn = joinColumn;
