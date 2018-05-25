"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("./Query");
const Mapping_1 = require("./Mapping");
const Hydrator_1 = require("./Hydrator");
const Having_1 = require("./Criteria/Having");
const Where_1 = require("./Criteria/Where");
const On_1 = require("./Criteria/On");
class QueryBuilder {
    /**
     * Construct a new QueryBuilder.
     *
     * @param {Scope}             entityManager
     * @param {knex.QueryBuilder} statement
     * @param {Mapping}           mapping
     * @param {string}            alias
     */
    constructor(entityManager, statement, mapping, alias) {
        /**
         * @type {boolean}
         */
        this.prepared = false;
        /**
         * @type {Array}
         */
        this.selects = [];
        /**
         * @type {{}]
         */
        this.appliedPrimaryKeys = {};
        /**
         * @type {Array}
         */
        this.groupBys = [];
        /**
         * @type {Array}
         */
        this.orderBys = [];
        /**
         * @type {string[]}
         */
        this.functions = ['sum', 'count', 'max', 'min', 'avg', 'distinct'];
        /**
         * @type {string[]}
         */
        this.singleJoinTypes = [Mapping_1.Mapping.RELATION_ONE_TO_ONE, Mapping_1.Mapping.RELATION_MANY_TO_ONE];
        /**
         * @type {{}}
         */
        this.aliased = {};
        this.children = [];
        this.queryBuilders = {};
        this.alias = alias;
        this.mappings = { [alias]: mapping };
        this.statement = statement;
        this.whereCriteria = new Where_1.Where(this.statement, mapping, this.mappings, alias);
        this.havingCriteria = new Having_1.Having(this.statement, mapping, this.mappings, alias);
        this.onCriteria = new On_1.On(this.statement, mapping, this.mappings, alias);
        this.entityManager = entityManager;
        this.hydrator = new Hydrator_1.Hydrator(entityManager);
        this.query = new Query_1.Query(statement, this.hydrator, this.children);
        this.hydrator.addRecipe(null, alias, this.mappings[alias]);
    }
    /**
     * Create an alias.
     *
     * @param {string} target
     *
     * @returns {string}
     */
    createAlias(target) {
        this.aliased[target] = this.aliased[target] || 0;
        return target + this.aliased[target]++;
    }
    /**
     * Perform a join.
     *
     * @param {string} joinMethod
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    makeJoin(joinMethod, column, targetAlias) {
        let { owningMapping, join, property, alias } = this.getRelationship(column);
        let TargetReference = this.entityManager.resolveEntityReference(join.targetEntity);
        this.mappings[targetAlias] = this.mappings[targetAlias] || Mapping_1.Mapping.forEntity(TargetReference);
        let targetMapping = this.mappings[targetAlias];
        let joinType = this.singleJoinTypes.indexOf(join.type) > -1 ? 'single' : 'collection';
        let joinColumn = owningMapping.getJoinColumn(property);
        let owning = alias;
        let inversed = targetAlias;
        this.hydrator.addRecipe(alias, targetAlias, targetMapping, joinType, property);
        if (join.type === Mapping_1.Mapping.RELATION_MANY_TO_MANY) {
            let joinTable;
            let joinColumns;
            let inverseJoinColumns;
            if (join.inversedBy) {
                joinTable = owningMapping.getJoinTable(property);
                joinColumns = joinTable.joinColumns;
                inverseJoinColumns = joinTable.inverseJoinColumns;
            }
            else {
                joinTable = targetMapping.getJoinTable(join.mappedBy);
                joinColumns = joinTable.inverseJoinColumns;
                inverseJoinColumns = joinTable.joinColumns;
            }
            let joinTableAlias = this.createAlias(joinTable.name);
            // Join from owning to makeJoin-table.
            let onCriteriaOwning = {};
            joinColumns.forEach((joinColumn) => {
                onCriteriaOwning[`${owning}.${joinColumn.referencedColumnName}`] = `${joinTableAlias}.${joinColumn.name}`;
            });
            this.join(joinMethod, joinTable.name, joinTableAlias, onCriteriaOwning);
            // Join from makeJoin-table to inversed.
            let onCriteriaInversed = {};
            inverseJoinColumns.forEach((inverseJoinColumn) => {
                onCriteriaInversed[`${joinTableAlias}.${inverseJoinColumn.name}`] = `${inversed}.${inverseJoinColumn.referencedColumnName}`;
            });
            this.join(joinMethod, targetMapping.getTableName(), inversed, onCriteriaInversed);
            return this;
        }
        if (join.mappedBy) {
            joinColumn = targetMapping.getJoinColumn(join.mappedBy);
            owning = inversed;
            inversed = alias;
        }
        let onCriteria = { [`${owning}.${joinColumn.name}`]: `${inversed}.${joinColumn.referencedColumnName}` };
        this.join(joinMethod, targetMapping.getTableName(), targetAlias, onCriteria);
        return this;
    }
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
    join(joinMethod, table, alias, on) {
        this.statement[joinMethod](`${table} as ${alias}`, statement => {
            this.onCriteria.stage(on, undefined, statement);
        });
        return this;
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftJoin(column, targetAlias) {
        return this.makeJoin('leftJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    innerJoin(column, targetAlias) {
        return this.makeJoin('innerJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    leftOuterJoin(column, targetAlias) {
        return this.makeJoin('leftOuterJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightJoin(column, targetAlias) {
        return this.makeJoin('rightJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    rightOuterJoin(column, targetAlias) {
        return this.makeJoin('rightOuterJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    outerJoin(column, targetAlias) {
        return this.makeJoin('outerJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    fullOuterJoin(column, targetAlias) {
        return this.makeJoin('fullOuterJoin', column, targetAlias);
    }
    /**
     * Perform a join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    crossJoin(column, targetAlias) {
        return this.makeJoin('crossJoin', column, targetAlias);
    }
    /**
     * Get a child querybuilder.
     *
     * @param {string} alias
     *
     * @returns {QueryBuilder}
     */
    getChild(alias) {
        return this.queryBuilders[alias];
    }
    /**
     * Add a child to query.
     *
     * @param {QueryBuilder} child
     *
     * @returns {QueryBuilder}
     */
    addChild(child) {
        this.children.push(child);
        return this;
    }
    /**
     * Figure out if given target is a collection. If so, populate. Otherwise, left join.
     *
     * @param {string} column
     * @param {string} targetAlias
     *
     * @returns {QueryBuilder}
     */
    quickJoin(column, targetAlias) {
        let { join, alias, property } = this.getRelationship(column);
        let parentQueryBuilder = this.getChild(alias) || this;
        targetAlias = targetAlias || parentQueryBuilder.createAlias(property);
        if (join.type !== Mapping_1.Mapping.RELATION_MANY_TO_MANY && join.type !== Mapping_1.Mapping.RELATION_ONE_TO_MANY) {
            return parentQueryBuilder.leftJoin(column, targetAlias);
        }
        // Collections need to be fetched individually.
        let childQueryBuilder = parentQueryBuilder.populate(column, null, targetAlias);
        this.queryBuilders[targetAlias] = childQueryBuilder;
        return childQueryBuilder;
    }
    /**
     * Populate a collection. This will return a new Querybuilder, allowing you to filter, join etc within it.
     *
     * @param {string}        column
     * @param {QueryBuilder}  [queryBuilder]
     * @param {string}        [targetAlias]
     *
     * @returns {QueryBuilder<{new()}>}
     */
    populate(column, queryBuilder, targetAlias) {
        let { owningMapping, join, property, alias } = this.getRelationship(column);
        if (join.type !== Mapping_1.Mapping.RELATION_MANY_TO_MANY && join.type !== Mapping_1.Mapping.RELATION_ONE_TO_MANY) {
            throw new Error(`It's not possible to populate relations with type '${join.type}', target must be a collection.`);
        }
        let parentQueryBuilder = this.getChild(alias) || this;
        let TargetReference = this.entityManager.resolveEntityReference(join.targetEntity);
        targetAlias = targetAlias || parentQueryBuilder.createAlias(property);
        parentQueryBuilder.mappings[targetAlias] = parentQueryBuilder.mappings[targetAlias] || Mapping_1.Mapping.forEntity(TargetReference);
        // Make sure we have a queryBuilder
        if (!(queryBuilder instanceof QueryBuilder)) {
            queryBuilder = this.entityManager.getRepository(TargetReference).getQueryBuilder(targetAlias);
        }
        let targetMapping = queryBuilder.getHostMapping();
        this.queryBuilders[targetAlias] = queryBuilder;
        let parentColumn;
        parentQueryBuilder.addChild(queryBuilder);
        if (join.type === Mapping_1.Mapping.RELATION_ONE_TO_MANY) {
            parentColumn = `${targetAlias}.${targetMapping.getJoinColumn(join.mappedBy).name}`;
        }
        else {
            // Make queryBuilder join with joinTable and figure out column...
            let joinTable;
            let joinColumn;
            let joinTableAlias;
            if (join.inversedBy) {
                joinTable = owningMapping.getJoinTable(property);
                joinColumn = joinTable.inverseJoinColumns[0];
                parentColumn = joinTable.joinColumns[0].name;
            }
            else {
                joinTable = targetMapping.getJoinTable(join.mappedBy);
                joinColumn = joinTable.joinColumns[0];
                parentColumn = joinTable.inverseJoinColumns[0].name;
            }
            joinTableAlias = queryBuilder.createAlias(joinTable.name);
            parentColumn = `${joinTableAlias}.${parentColumn}`;
            // Join from target to joinTable (treating target as owning side).
            queryBuilder.join('innerJoin', joinTable.name, joinTableAlias, {
                [`${targetAlias}.${joinColumn.referencedColumnName}`]: `${joinTableAlias}.${joinColumn.name}`
            });
        }
        let hydrator = parentQueryBuilder.getHydrator();
        hydrator.getRecipe().hydrate = true;
        // No catalogue yet, ensure we at least fetch PK.
        if (!hydrator.hasCatalogue(alias)) {
            this.applyPrimaryKeySelect(alias);
        }
        return queryBuilder.setParent(property, parentColumn, hydrator.enableCatalogue(alias));
    }
    /**
     * Get the relationship details for a column.
     *
     * @param {string} column
     *
     * @returns {{}}
     */
    getRelationship(column) {
        column = column.indexOf('.') > -1 ? column : `${this.alias}.${column}`;
        let [alias, property] = column.split('.');
        let parent = this.getChild(alias) || this;
        let owningMapping = parent.mappings[alias];
        let field;
        // Ensure existing mapping
        if (!owningMapping) {
            throw new Error(`Cannot find the reference mapping for '${alias}', are you sure you registered it first?`);
        }
        if (property) {
            field = owningMapping.getField(property, true);
        }
        if (!field || !field.relationship) {
            throw new Error(`Invalid relation supplied for join. Property '${property}' not found on entity, or relation not defined.
        Are you registering the joins in the wrong order?`);
        }
        return { owningMapping, join: field.relationship, property, alias };
    }
    /**
     * Set the owner of this querybuilder.
     *
     * @param {string}    property
     * @param {string}    column
     * @param {Catalogue} catalogue
     *
     * @returns {QueryBuilder}
     */
    setParent(property, column, catalogue) {
        this.statement.select(`${column} as ${column}`);
        this.query.setParent({ column, primaries: catalogue.primaries });
        this.hydrator.getRecipe().parent = { entities: catalogue.entities, column, property };
        return this;
    }
    /**
     * Get the Query.
     *
     * @returns {Query}
     */
    getQuery() {
        this.prepare();
        return this.query;
    }
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
    select(alias) {
        this.selects.push(...arguments);
        this.prepared = false;
        return this;
    }
    /**
     * Get the alias of the parent.
     *
     * @returns {string}
     */
    getAlias() {
        return this.alias;
    }
    /**
     * Get the statement being built.
     *
     * @returns {knex.QueryBuilder}
     */
    getStatement() {
        return this.statement;
    }
    /**
     * Get the mapping of the top-most Entity.
     *
     * @returns {Mapping<Entity>}
     */
    getHostMapping() {
        return this.mappings[this.alias];
    }
    /**
     * Get the hydrator of the query builder.
     *
     * @returns {Hydrator}
     */
    getHydrator() {
        return this.hydrator;
    }
    /**
     * Make sure all changes have been applied to the query.
     *
     * @returns {QueryBuilder}
     */
    prepare() {
        if (this.prepared) {
            return this;
        }
        this.whereCriteria.applyStaged();
        this.havingCriteria.applyStaged();
        this.onCriteria.applyStaged();
        this.applyFrom();
        this.applySelects();
        this.applyOrderBys();
        this.applyGroupBys();
        this.prepared = true;
        return this;
    }
    /**
     * Apply the provided derived values.
     *
     * @returns {QueryBuilder}
     */
    applyFrom() {
        if (this.derivedFrom) {
            let { derived, alias } = this.derivedFrom;
            this.statement.from(this.statement['client'].raw(`(${this.derivedFrom.derived.getQuery().getSQL()}) as ${alias}`));
            this.derivedFrom = null;
        }
        return this;
    }
    /**
     * Apply the staged selects to the query.
     *
     * @returns {QueryBuilder}
     */
    applySelects() {
        this.selects.forEach(select => this.applySelect(select));
        this.selects = [];
        return this;
    }
    /**
     * Apply a select to the query.
     *
     * @param {[]} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    applySelect(propertyAlias) {
        if (Array.isArray(propertyAlias)) {
            propertyAlias.forEach(value => this.applySelect(value));
            return this;
        }
        if (typeof propertyAlias === 'string') {
            return this.applyRegularSelect(propertyAlias);
        }
        if (typeof propertyAlias !== 'object') {
            throw new Error(`Unexpected value "${propertyAlias}" of type "${typeof propertyAlias}" for .select()`);
        }
        // Support select functions. Don't add to hydrator, as they aren't part of the entities.
        let select = Object.getOwnPropertyNames(propertyAlias);
        let functionName = select[0] === 'alias' ? select[1] : select[0];
        let alias = propertyAlias[select[0] === 'alias' ? select[0] : select[1]];
        let fieldName = this.whereCriteria.mapToColumn(propertyAlias[functionName]);
        if (this.functions.indexOf(functionName) === -1) {
            throw new Error(`Unknown function "${select[0]}" specified.`);
        }
        select.length > 1
            ? this.statement[functionName](`${fieldName} as ${alias}`)
            : this.statement[functionName](fieldName);
        return this;
    }
    /**
     * Apply a regular select (no functions).
     *
     * @param {string} propertyAlias
     *
     * @returns {QueryBuilder}
     */
    applyRegularSelect(propertyAlias) {
        let alias = this.alias;
        // Set default propertyAlias for context-entity properties.
        if (propertyAlias.indexOf('.') === -1 && !this.mappings[propertyAlias]) {
            propertyAlias = `${alias}.${propertyAlias}`;
        }
        let selectAliases = [];
        let hydrateColumns = {};
        if (propertyAlias.indexOf('.') > -1) {
            let parts = propertyAlias.split('.');
            let property = parts[1];
            let column = this.whereCriteria.mapToColumn(propertyAlias);
            hydrateColumns[column] = property;
            alias = parts[0];
            this.applyPrimaryKeySelect(alias);
            selectAliases.push(`${column} as ${column}`);
        }
        else {
            let mapping = this.mappings[propertyAlias];
            let fields = mapping.getFields();
            alias = propertyAlias;
            Object.getOwnPropertyNames(fields).forEach(field => {
                if (!fields[field].relationship) {
                    let fieldName = fields[field].name || (fields[field].primary ? 'id' : null);
                    if (!fieldName) {
                        throw new Error(`Trying to query for field without a name for '${mapping.getEntityName()}.${field}'.`);
                    }
                    let fieldAlias = (propertyAlias ? propertyAlias + '.' : '') + fieldName;
                    hydrateColumns[fieldAlias] = field;
                    selectAliases.push(`${fieldAlias} as ${fieldAlias}`);
                }
            });
        }
        this.statement.select(selectAliases);
        this.hydrator.getRecipe(alias).hydrate = true;
        this.hydrator.addColumns(alias, hydrateColumns);
        return this;
    }
    /**
     * Ensure the existence of a primary key in the select of the query.
     *
     * @param {string} alias
     *
     * @returns {QueryBuilder}
     */
    applyPrimaryKeySelect(alias) {
        if (!this.appliedPrimaryKeys[alias]) {
            let aliasRecipe = this.hydrator.getRecipe(alias);
            this.appliedPrimaryKeys[alias] = `${aliasRecipe.primaryKey.alias} as ${aliasRecipe.primaryKey.alias}`;
            this.statement.select(this.appliedPrimaryKeys[alias]);
        }
        return this;
    }
    /**
     * Signal an insert.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    insert(values, returning) {
        this.setCriteriaHostAlias();
        this.statement.insert(this.mapToColumns(values), returning);
        return this;
    }
    /**
     * Signal an update.
     *
     * @param {{}}     values
     * @param {string} [returning]
     *
     * @returns {QueryBuilder}
     */
    update(values, returning) {
        this.setCriteriaHostAlias();
        this.statement.from(this.mappings[this.alias].getTableName());
        this.statement.update(this.mapToColumns(values), returning);
        return this;
    }
    /**
     * Set the limit.
     *
     * @param {number} limit
     *
     * @returns {QueryBuilder}
     */
    limit(limit) {
        this.statement.limit(limit);
        return this;
    }
    /**
     * Set the offset.
     *
     * @param {number} offset
     *
     * @returns {QueryBuilder}
     */
    offset(offset) {
        this.statement.offset(offset);
        return this;
    }
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
    groupBy(groupBy) {
        this.groupBys.push({ groupBy });
        return this;
    }
    /**
     * Apply group by to the query.
     *
     * @param {string|string[]} groupBy
     *
     * @returns {QueryBuilder}
     */
    applyGroupBy(groupBy) {
        let properties = [];
        if (typeof groupBy === 'string') {
            properties.push(this.whereCriteria.mapToColumn(groupBy));
        }
        else if (Array.isArray(groupBy)) {
            groupBy.forEach(group => properties.push(this.whereCriteria.mapToColumn(group)));
        }
        this.statement.groupBy(properties);
        return this;
    }
    /**
     * Apply group-by statements to the query.
     *
     * @returns {QueryBuilder}
     */
    applyGroupBys() {
        this.groupBys.forEach(groupBy => this.applyGroupBy(groupBy.groupBy));
        this.groupBys = [];
        return this;
    }
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
    orderBy(orderBy, direction) {
        this.orderBys.push({ orderBy, direction });
        return this;
    }
    /**
     * Apply order by to the query.
     *
     * @param {string|string[]|{}} orderBy
     * @param {string}             [direction]
     *
     * @returns {QueryBuilder}
     */
    applyOrderBy(orderBy, direction) {
        if (typeof orderBy === 'string') {
            this.statement.orderBy(this.whereCriteria.mapToColumn(orderBy), direction);
        }
        else if (Array.isArray(orderBy)) {
            orderBy.forEach(order => this.applyOrderBy(order));
        }
        else if (typeof orderBy === 'object') {
            let property = Object.keys(orderBy)[0];
            this.applyOrderBy(property, orderBy[property]);
        }
        return this;
    }
    /**
     * Apply order-by statements to the query.
     *
     * @returns {QueryBuilder}
     */
    applyOrderBys() {
        this.orderBys.forEach(orderBy => this.applyOrderBy(orderBy.orderBy, orderBy.direction));
        this.orderBys = [];
        return this;
    }
    /**
     * Set the host alias on the criteria parsers.
     *
     * @param {string} [hostAlias]
     */
    setCriteriaHostAlias(hostAlias = null) {
        this.whereCriteria.setHostAlias(hostAlias);
        this.onCriteria.setHostAlias(hostAlias);
        this.havingCriteria.setHostAlias(hostAlias);
        return this;
    }
    /**
     * Signal a delete.
     *
     * @returns {QueryBuilder}
     */
    remove() {
        this.setCriteriaHostAlias();
        this.statement.from(this.mappings[this.alias].getTableName());
        this.statement.del();
        return this;
    }
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
    where(criteria) {
        if (!Object.getOwnPropertyNames(criteria).length) {
            return this;
        }
        this.whereCriteria.stage(criteria);
        this.prepared = false;
        return this;
    }
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
    from(derived, alias) {
        if (!alias) {
            alias = this.createAlias(derived.getHostMapping().getTableName());
        }
        this.derivedFrom = { alias, derived };
        this.prepared = false;
        return this;
    }
    /**
     * Sets the having clause.
     *
     * .having({})
     *
     * @param {{}} criteria
     *
     * @returns {QueryBuilder}
     */
    having(criteria) {
        if (!Object.getOwnPropertyNames(criteria).length) {
            return this;
        }
        this.havingCriteria.stage(criteria);
        this.prepared = false;
        return this;
    }
    /**
     * Map provided values to columns.
     *
     * @param {{}[]} values
     *
     * @returns {{}[]|{}}
     */
    mapToColumns(values) {
        let mappedValues;
        if (Array.isArray(values)) {
            mappedValues = [];
            values.forEach(value => {
                mappedValues.push(this.mapToColumns(value));
            });
            return mappedValues;
        }
        mappedValues = {};
        Object.getOwnPropertyNames(values).forEach(property => {
            let value = values[property];
            let fieldName, type;
            if (property.indexOf('.') > -1) {
                let parts = property.split('.');
                if (this.mappings[parts[0]].isRelation(parts[1]) && typeof value === 'object') {
                    return;
                }
                parts[1] = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);
                type = this.mappings[parts[0]].getType(parts[1]);
                fieldName = parts.join('.');
            }
            else {
                if (this.mappings[this.alias].isRelation(property) && typeof value === 'object') {
                    return;
                }
                fieldName = this.mappings[this.alias].getFieldName(property, property);
                type = this.mappings[this.alias].getType(property);
            }
            if (!fieldName) {
                throw new Error(`No field name found in mapping for ${this.mappings[this.alias].getEntityName()}::${property}.`);
            }
            if (type === 'json') {
                value = JSON.stringify(value);
            }
            mappedValues[fieldName] = value;
        });
        return mappedValues;
    }
}
exports.QueryBuilder = QueryBuilder;
