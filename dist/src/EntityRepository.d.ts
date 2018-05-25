/// <reference types="knex" />
import { Mapping } from './Mapping';
import { QueryBuilder } from './QueryBuilder';
import * as knex from 'knex';
import { Scope } from './Scope';
import { EntityCtor } from './EntityInterface';
export declare class EntityRepository<T> {
    /**
     * @type {Scope}
     */
    protected entityManager: Scope;
    /**
     * @type {{}}
     */
    protected entity: EntityCtor<T>;
    /**
     * @type {Mapping}
     */
    protected mapping: Mapping<T>;
    protected queryOptions: Array<string>;
    /**
     * Construct a new EntityRepository.
     *
     * @param {Scope} entityManager
     * @param {{}}    entity
     */
    constructor(entityManager: Scope, entity: EntityCtor<T>);
    /**
     * Get mapping for the entity this repository is responsible for.
     *
     * @returns {Mapping}
     */
    getMapping(): Mapping<T>;
    /**
     * Get a reference to the entity manager.
     *
     * @returns {Scope}
     */
    protected getEntityManager(): Scope;
    /**
     * Get a new query builder.
     *
     * @param {string}            [alias]
     * @param {knex.QueryBuilder} [statement]
     *
     * @returns {QueryBuilder}
     */
    getQueryBuilder(alias?: string, statement?: knex.QueryBuilder): QueryBuilder<T>;
    /**
     * Get a new query builder that will be applied on the derived table (query builder).
     *
     * e.g. `select count(*) from (select * from user) as user0;`
     *
     * @param {QueryBuilder} derivedFrom
     * @param {string}       [alias]
     *
     * @returns {QueryBuilder}
     */
    getDerivedQueryBuilder(derivedFrom: QueryBuilder<T>, alias?: string): QueryBuilder<T>;
    /**
     * Get a raw knex connection
     *
     * @param {string} [role] Defaults to slave
     *
     * @returns {knex}
     */
    getConnection(role?: string): knex;
    /**
     * Find entities based on provided criteria.
     *
     * @param {{}}          [criteria]
     * @param {FindOptions} [options]
     *
     * @returns {Promise<Array>}
     */
    find(criteria?: {} | number | string, options?: FindOptions): Promise<Array<T>>;
    /**
     * Find a single entity.
     *
     * @param {{}|number|string}  [criteria]
     * @param {FindOptions}       [options]
     *
     * @returns {Promise<Object>}
     */
    findOne(criteria?: {} | number | string, options?: FindOptions): Promise<T>;
    /**
     * Apply options to queryBuilder
     *
     * @param {QueryBuilder<T>} queryBuilder
     * @param {FindOptions}     options
     *
     * @returns {QueryBuilder}
     */
    applyOptions(queryBuilder: QueryBuilder<T>, options: any): QueryBuilder<T>;
}
export interface FindOptions {
    select?: Array<string>;
    orderBy?: any;
    groupBy?: any;
    alias?: string;
    limit?: number;
    offset?: number;
    debug?: boolean;
    populate?: boolean | {} | Array<string | {}>;
}
