/// <reference types="knex" />
import { Mapping } from '../Mapping';
import { QueryBuilder } from 'knex';
/**
 * Parse and apply criteria to statement.
 */
export declare class Criteria {
    /**
     * Available operators and the handlers.
     *
     * @type {{}}
     */
    private operators;
    /**
     * Maps operators to knex methods.
     *
     * @type {{}}
     */
    protected conditions: {
        and: string;
        or: string;
    };
    /**
     * @type {string}
     */
    protected defaultCondition: string;
    /**
     * Mapping for the host entity.
     *
     * @type {Mapping}
     */
    private hostMapping;
    /**
     * Alias for the host entity.
     *
     * @type {string}
     */
    private hostAlias;
    /**
     * Mappings for entities (joins).
     *
     * @type {{}}
     */
    private mappings;
    /**
     * Statement to apply criteria to.
     *
     * {QueryBuilder}
     */
    private statement;
    /**
     * Criteria staged to apply.
     *
     * @type {Array}
     */
    private staged;
    /**
     * Construct a new Criteria parser.
     * @constructor
     *
     * @param {QueryBuilder} statement
     * @param {Mapping}      hostMapping
     * @param {{}}           [mappings]
     * @param {string}       [hostAlias]
     */
    constructor(statement: QueryBuilder, hostMapping: Mapping<any>, mappings?: {
        [key: string]: Mapping<any>;
    }, hostAlias?: string);
    /**
     * Set the host alias.
     *
     * @param {string} hostAlias
     * @returns {Criteria}
     */
    setHostAlias(hostAlias: string): Criteria;
    /**
     * Stage criteria to be applied later.
     *
     * @param {{}}           criteria
     * @param {string}       condition
     * @param {QueryBuilder} statement
     *
     * @returns {Criteria}
     */
    stage(criteria: Object, condition?: string, statement?: QueryBuilder): Criteria;
    /**
     * Apply staged criteria.
     *
     * @returns {Criteria}
     */
    applyStaged(): Criteria;
    /**
     * Apply criteria to statement.
     *
     * @param {{}}           criteria     Criteria object.
     * @param {string}       [condition]  'and' or 'or'. Defaults to 'this.defaultCondition' ('or').
     * @param {QueryBuilder} [statement]  Knex query builder.
     * @param {string}       [property]   Property name (for nested criteria, used internally).
     *
     * @returns {void}
     */
    apply(criteria: Object, condition?: string, statement?: QueryBuilder, property?: string): void;
    /**
     * Apply nested conditions ((foo and bar) or (bat and baz)).
     *
     * @param {QueryBuilder}  statement
     * @param {string}        condition
     * @param {*}             value
     * @param {string}        wrapCondition
     *
     * @returns {void}
     */
    protected applyNestedCondition(statement: QueryBuilder, condition: string, value: any, wrapCondition: string): void;
    /**
     * Translates null finds to 'is null', and arrays to 'in' (same for is not null and not in).
     *
     * @param {*}       value
     * @param {string}  operator
     *
     * @returns {string} Potentially mutated operator
     */
    protected applyConvenience(value: any, operator: string): string;
    /**
     * Map a property to a column name.
     *
     * @param {string} property
     *
     * @returns {string}
     */
    mapToColumn(property: string): string;
}
