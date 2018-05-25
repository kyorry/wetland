/// <reference types="knex" />
import * as knex from 'knex';
import { Query } from './Query';
import { Mapping } from './Mapping';
import { Entity, Scope } from './Scope';
import { Catalogue, Hydrator } from './Hydrator';
export declare class QueryBuilder<T> {
    /**
     * @type {Query}
     */
    private query;
    /**
     * @type {boolean}
     */
    private prepared;
    /**
     * @type {string}
     */
    private alias;
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {{}}
     */
    private statement;
    /**
     * @type {Array}
     */
    private selects;
    /**
     * @type {{}]
     */
    private appliedPrimaryKeys;
    /**
     * @type {Array}
     */
    private groupBys;
    /**
     * @type {QueryBuilder}
     */
    private derivedFrom;
    /**
     * @type {Array}
     */
    private orderBys;
    /**
     * @type {Where}
     */
    private whereCriteria;
    /**
     * @type {On}
     */
    private onCriteria;
    /**
     * @type {Having}
     */
    private havingCriteria;
    /**
     * @type {{}}
     */
    mappings: {
        [key: string]: Mapping<Entity>;
    };
    /**
     * @type {string[]}
     */
    private functions;
    /**
     * @type {string[]}
     */
    private singleJoinTypes;
    /**
     * @type {Hydrator}
     */
    private hydrator;
    /**
     * @type {{}}
     */
    private aliased;
    private children;
    private queryBuilders;
    /**
     * Construct a new QueryBuilder.
     *
     * @param {Scope}             entityManager
     * @param {knex.QueryBuilder} statement
     * @param {Mapping}           mapping
     * @param {string}            alias
     */
    constructor(entityManager: Scope, statement: knex.QueryBuilder, mapping: Mapping<T>, alias: string);
    /**
     * Create an alias.
     *
     * @param {string} target
     *
     * @returns {string}
     */
    createAlias(target: string): string;
    /**
     * Perform a join.
     *
     * @param {string} joinMethod
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    makeJoin(joinMethod: string, column: string, targetAlias: string): this;
    /**
     * Perform a custom join (bring-your-own on criteria!)
     *
     * @param {string} joinMethod
     * @param {string} table
     * @param {string} alias
     * @param {{}}     on
     *
     * @returns {QueryBuilder}
     */
    join(joinMethod: string, table: string, alias: string, on: Object): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    innerJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftOuterJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightOuterJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    outerJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    fullOuterJoin(column: string, targetAlias: string): this;
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    crossJoin(column: string, targetAlias: string): this;
    /**
     * Get a child querybuilder.
     *
     * @param {string} alias
     *
     * @returns {QueryBuilder}
     */
    getChild(alias: string): QueryBuilder<{
        new ();
    }>;
    /**
     * Add a child to query.
     *
     * @param {QueryBuilder} child
     *
     * @returns {QueryBuilder}
     */
    addChild(child: QueryBuilder<{
        new ();
    }>): this;
    /**
     * Figure out if given target is a collection. If so, populate. Otherwise, left join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    quickJoin(column: string, targetAlias?: string): QueryBuilder<{
        new ();
    }>;
    /**
     * Populate a collection. This will return a new Querybuilder, allowing you to filter, join etc within it.
     *
     * @param {string}        column
     * @param {QueryBuilder}  [queryBuilder]
     * @param {string}        [targetAlias]
     *
     * @returns {QueryBuilder<{new()}>}
     */
    populate(column: string, queryBuilder?: QueryBuilder<{
        new ();
    }>, targetAlias?: string): QueryBuilder<{
        new ();
    }>;
    /**
     * Get the relationship details for a column.
     *
     * @param {string} column
     *
     * @returns {{}}
     */
    private getRelationship(column);
    /**
     * Set the owner of this querybuilder.
     *
     * @param {string}    property
     * @param {string}    column
     * @param {Catalogue} catalogue
     *
     * @returns {QueryBuilder}
     */
    setParent(property: string, column: string, catalogue: Catalogue): this;
    /**
     * Get the Query.
     *
     * @returns {Query}
     */
    getQuery(): Query;
    /**
     * Columns to select. Chainable, and allows an array of arguments typed below.
     *
     *  .select('f');           // select f.*
     *  .select('f.name')       // select f.name
     *  .select({sum: 'field'}) // select sum(field)
     *
     * @param {string[]|string|{}} alias
     *
     * @returns {QueryBuilder}
     */
    select(alias: Array<string> | string | {
        [key: string]: string;
    }): this;
    /**
     * Get the alias of the parent.
     *
     * @returns {string}
     */
    getAlias(): string;
    /**
     * Get the statement being built.
     *
     * @returns {knex.QueryBuilder}
     */
    getStatement(): knex.QueryBuilder;
    /**
     * Get the mapping of the top-most Entity.
     *
     * @returns {Mapping<Entity>}
     */
    getHostMapping(): Mapping<Entity>;
    /**
     * Get the hydrator of the query builder.
     *
     * @returns {Hydrator}
     */
    getHydrator(): Hydrator;
    /**
     * Make sure all changes have been applied to the query.
     *
     * @returns {QueryBuilder}
     */
    prepare(): this;
    /**
     * Apply the provided derived values.
     *
     * @returns {QueryBuilder}
     */
    private applyFrom();
    /**
     * Apply the staged selects to the query.
     *
     * @returns {QueryBuilder}
     */
    private applySelects();
    /**
     * Apply a select to the query.
     *
     * @param {[]} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    private applySelect(propertyAlias);
    /**
     * Apply a regular select (no functions).
     *
     * @param {string} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    private applyRegularSelect(propertyAlias);
    /**
     * Ensure the existence of a primary key in the select of the query.
     *
     * @param {string} alias
     *
     * @returns {QueryBuilder}
     */
    private applyPrimaryKeySelect(alias);
    /**
     * Signal an insert.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    insert(values: any, returning?: string): this;
    /**
     * Signal an update.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    update(values: any, returning?: any): this;
    /**
     * Set the limit.
     *
     * @param {number} limit
     *
     * @returns {QueryBuilder}
     */
    limit(limit: any): this;
    /**
     * Set the offset.
     *
     * @param {number} offset
     *
     * @returns {QueryBuilder}
     */
    offset(offset: any): this;
    /**
     * Set the group by.
     *
     * .groupBy('name')
     * .groupBy(['name'])
     * .groupBy(['name', 'age'])
     *
     * @param {string|string[]} groupBy
     *
     * @returns {QueryBuilder}
     */
    groupBy(groupBy: string | Array<string>): this;
    /**
     * Apply group by to the query.
     *
     * @param {string|string[]} groupBy
     *
     * @returns {QueryBuilder}
     */
    private applyGroupBy(groupBy);
    /**
     * Apply group-by statements to the query.
     *
     * @returns {QueryBuilder}
     */
    private applyGroupBys();
    /**
     * Set the order by.
     *
     *  .orderBy('name')
     *  .orderBy('name', 'desc')
     *  .orderBy({name: 'desc'})
     *  .orderBy(['name', {age: 'asc'}])
     *
     * @param {string|string[]|{}} orderBy
     * @param {string}             [direction]
     *
     * @returns {QueryBuilder}
     */
    orderBy(orderBy: string | Array<string> | Object, direction?: any): this;
    /**
     * Apply order by to the query.
     *
     * @param {string|string[]|{}} orderBy
     * @param {string}             [direction]
     *
     * @returns {QueryBuilder}
     */
    private applyOrderBy(orderBy, direction?);
    /**
     * Apply order-by statements to the query.
     *
     * @returns {QueryBuilder}
     */
    private applyOrderBys();
    /**
     * Set the host alias on the criteria parsers.
     *
     * @param {string} [hostAlias]
     */
    private setCriteriaHostAlias(hostAlias?);
    /**
     * Signal a delete.
     *
     * @returns {QueryBuilder}
     */
    remove(): this;
    /**
     * Sets the where clause.
     *
     *  .where({name: 'Wesley'})
     *  .where({name: ['Wesley', 'Roberto']}
     *  .where({name: 'Wesley', company: 'SpoonX', age: {gt: '25'}})
     *
     * @param {{}} criteria
     *
     * @returns {QueryBuilder}
     */
    where(criteria: Object): this;
    /**
     * Select `.from()` a derived table (QueryBuilder).
     *
     *  .from(queryBuilder, 'foo');
     *
     * @param {QueryBuilder} derived
     * @param {string}       [alias] alias
     *
     * @returns {QueryBuilder}
     */
    from(derived: QueryBuilder<T>, alias?: string): this;
    /**
     * Sets the having clause.
     *
     * .having({})
     *
     * @param {{}} criteria
     *
     * @returns {QueryBuilder}
     */
    having(criteria: Object): this;
    /**
     * Map provided values to columns.
     *
     * @param {{}[]} values
     *
     * @returns {{}[]|{}}
     */
    private mapToColumns(values);
}
