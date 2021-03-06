"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mapping_1 = require("./Mapping");
const QueryBuilder_1 = require("./QueryBuilder");
const Store_1 = require("./Store");
class EntityRepository {
    /**
     * Construct a new EntityRepository.
     *
     * @param {Scope} entityManager
     * @param {{}}    entity
     */
    constructor(entityManager, entity) {
        this.queryOptions = ['orderBy', 'limit', 'offset', 'groupBy', 'select'];
        this.entityManager = entityManager;
        this.entity = entity;
        this.mapping = Mapping_1.Mapping.forEntity(entity);
    }
    /**
     * Get mapping for the entity this repository is responsible for.
     *
     * @returns {Mapping}
     */
    getMapping() {
        return this.mapping;
    }
    /**
     * Get a reference to the entity manager.
     *
     * @returns {Scope}
     */
    getEntityManager() {
        return this.entityManager;
    }
    /**
     * Get a new query builder.
     *
     * @param {string}            [alias]
     * @param {knex.QueryBuilder} [statement]
     *
     * @returns {QueryBuilder}
     */
    getQueryBuilder(alias, statement) {
        alias = alias || this.mapping.getTableName();
        if (!statement) {
            let connection = this.getConnection();
            statement = connection(`${this.mapping.getTableName()} as ${alias}`);
        }
        return new QueryBuilder_1.QueryBuilder(this.entityManager, statement, this.mapping, alias);
    }
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
    getDerivedQueryBuilder(derivedFrom, alias) {
        return this.getQueryBuilder().from(derivedFrom, alias);
    }
    /**
     * Get a raw knex connection
     *
     * @param {string} [role] Defaults to slave
     *
     * @returns {knex}
     */
    getConnection(role = Store_1.Store.ROLE_SLAVE) {
        return this.entityManager.getStore(this.entity).getConnection(role);
    }
    /**
     * Find entities based on provided criteria.
     *
     * @param {{}}          [criteria]
     * @param {FindOptions} [options]
     *
     * @returns {Promise<Array>}
     */
    find(criteria, options = {}) {
        options.alias = options.alias || this.mapping.getTableName();
        let queryBuilder = this.getQueryBuilder(options.alias);
        if (!options.select) {
            queryBuilder.select(options.alias);
        }
        if (criteria) {
            queryBuilder.where(criteria);
        }
        // Apply limit, offset etc.
        this.applyOptions(queryBuilder, options);
        if (!options.populate) {
            return queryBuilder.getQuery().getResult();
        }
        if (options.populate === true) {
            let relations = this.mapping.getRelations();
            if (typeof relations === 'object' && relations !== null) {
                options.populate = Reflect.ownKeys(relations);
            }
        }
        else if (typeof options.populate === 'string') {
            options.populate = [options.populate];
        }
        if (Array.isArray(options.populate) && options.populate.length) {
            options.populate.forEach(join => {
                let column = join;
                let alias = join;
                if (typeof join === 'object') {
                    column = Object.keys(join)[0];
                    alias = join[column];
                }
                else if (join.indexOf('.') > -1) {
                    alias = join.split('.')[1];
                }
                let targetBuilder = queryBuilder.quickJoin(column, alias);
                if (!options.select) {
                    targetBuilder.select(alias);
                }
            });
        }
        else if (options.populate && !Array.isArray(options.populate)) {
            Object.getOwnPropertyNames(options.populate).forEach(column => {
                let targetBuilder = queryBuilder.quickJoin(column, options.populate[column]);
                if (!options.select) {
                    targetBuilder.select(options.populate[column]);
                }
            });
        }
        return queryBuilder.getQuery().getResult();
    }
    /**
     * Find a single entity.
     *
     * @param {{}|number|string}  [criteria]
     * @param {FindOptions}       [options]
     *
     * @returns {Promise<Object>}
     */
    findOne(criteria, options = {}) {
        options.alias = options.alias || this.mapping.getTableName();
        if (typeof criteria === 'number' || typeof criteria === 'string') {
            criteria = { [options.alias + '.' + this.mapping.getPrimaryKeyField()]: criteria };
        }
        options.limit = 1;
        return this.find(criteria, options).then(result => result ? result[0] : null);
    }
    /**
     * Apply options to queryBuilder
     *
     * @param {QueryBuilder<T>} queryBuilder
     * @param {FindOptions}     options
     *
     * @returns {QueryBuilder}
     */
    applyOptions(queryBuilder, options) {
        this.queryOptions.forEach(clause => {
            if (options[clause]) {
                queryBuilder[clause](options[clause]);
            }
        });
        return queryBuilder;
    }
}
exports.EntityRepository = EntityRepository;
