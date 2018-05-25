"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Parse and apply criteria to statement.
 */
class Criteria {
    /**
     * Construct a new Criteria parser.
     * @constructor
     *
     * @param {QueryBuilder} statement
     * @param {Mapping}      hostMapping
     * @param {{}}           [mappings]
     * @param {string}       [hostAlias]
     */
    constructor(statement, hostMapping, mappings, hostAlias) {
        /**
         * Available operators and the handlers.
         *
         * @type {{}}
         */
        this.operators = {
            '<': { operator: '<', value: value => value },
            'lt': { operator: '<', value: value => value },
            'lessThan': { operator: '<', value: value => value },
            '<=': { operator: '<=', value: value => value },
            'lte': { operator: '<=', value: value => value },
            'lessThanOrEqual': { operator: '<=', value: value => value },
            '>': { operator: '>', value: value => value },
            'gt': { operator: '>', value: value => value },
            'greaterThan': { operator: '>', value: value => value },
            '>=': { operator: '>=', value: value => value },
            'greaterThanOrEqual': { operator: '>=', value: value => value },
            'gte': { operator: '>=', value: value => value },
            '!': { operator: '<>', value: value => value },
            'not': { operator: '<>', value: value => value },
            'between': { operator: 'between', value: value => value },
            'notBetween': { operator: 'not between', value: value => value },
            'in': { operator: 'in', value: value => value },
            'notIn': { operator: 'not in', value: value => value },
            'is': { operator: 'is', value: value => value },
            'isNot': { operator: 'is not', value: value => value },
            'like': { operator: 'like', value: value => `%${value}%` },
            'notLike': { operator: 'not like', value: value => `%${value}%` },
            'contains': { operator: 'like', value: value => `%${value}%` },
            'notContains': { operator: 'not like', value: value => `%${value}%` },
            'startsWith': { operator: 'like', value: value => `${value}%` },
            'notStartsWith': { operator: 'not like', value: value => `${value}%` },
            'endsWith': { operator: 'like', value: value => `%${value}` },
            'notEndsWith': { operator: 'not like', value: value => `%${value}` }
        };
        /**
         * Maps operators to knex methods.
         *
         * @type {{}}
         */
        this.conditions = { and: 'where', or: 'orWhere' };
        /**
         * @type {string}
         */
        this.defaultCondition = 'and';
        /**
         * Criteria staged to apply.
         *
         * @type {Array}
         */
        this.staged = [];
        this.statement = statement;
        this.mappings = mappings || {};
        this.hostMapping = hostMapping;
        this.hostAlias = hostAlias;
    }
    /**
     * Set the host alias.
     *
     * @param {string} hostAlias
     * @returns {Criteria}
     */
    setHostAlias(hostAlias) {
        this.hostAlias = hostAlias;
        return this;
    }
    /**
     * Stage criteria to be applied later.
     *
     * @param {{}}           criteria
     * @param {string}       condition
     * @param {QueryBuilder} statement
     *
     * @returns {Criteria}
     */
    stage(criteria, condition = this.defaultCondition, statement) {
        this.staged.push({ criteria, condition, statement });
        return this;
    }
    /**
     * Apply staged criteria.
     *
     * @returns {Criteria}
     */
    applyStaged() {
        this.staged.forEach(criteria => this.apply(criteria.criteria, criteria.condition, criteria.statement));
        this.staged = [];
        return this;
    }
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
    apply(criteria, condition = this.defaultCondition, statement, property) {
        statement = statement || this.statement;
        Reflect.ownKeys(criteria).forEach((key) => {
            let value = criteria[key];
            let operator = '=';
            if (this.conditions[key]) {
                // Create a grouped condition
                return this.applyNestedCondition(statement, key, value, condition);
            }
            // If value is a pojo, deep-process criteria for property.
            if (!(value === null || typeof value !== 'object') && value.constructor === Object) {
                return this.apply(value, condition, statement, key);
            }
            // Apply operator logic
            if (this.operators[key]) {
                value = this.operators[key].value(value);
                operator = this.operators[key].operator;
            }
            else {
                property = key;
            }
            // Apply convenience checks (in, not in, is, is not).
            operator = this.applyConvenience(value, operator);
            statement[this.conditions[condition || this.defaultCondition]](this.mapToColumn(property), operator, value);
        });
    }
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
    applyNestedCondition(statement, condition, value, wrapCondition) {
        statement[this.conditions[wrapCondition || condition]]((subStatement) => {
            value.forEach((criteria) => {
                this.apply(criteria, condition, subStatement);
            });
        });
    }
    /**
     * Translates null finds to 'is null', and arrays to 'in' (same for is not null and not in).
     *
     * @param {*}       value
     * @param {string}  operator
     *
     * @returns {string} Potentially mutated operator
     */
    applyConvenience(value, operator) {
        if (value === null) {
            if (operator === '=') {
                operator = this.operators.is.operator;
            }
            else if (operator === '<>') {
                operator = this.operators.isNot.operator;
            }
        }
        if (Array.isArray(value)) {
            if (operator === '=') {
                operator = this.operators.in.operator;
            }
            else if (operator === '<>') {
                operator = this.operators.notIn.operator;
            }
        }
        return operator;
    }
    /**
     * Map a property to a column name.
     *
     * @param {string} property
     *
     * @returns {string}
     */
    mapToColumn(property) {
        if (property.indexOf('.') === -1 && this.mappings[property]) {
            return `${property}.${this.mappings[property].getPrimaryKeyField()}`;
        }
        if (property.indexOf('.') > -1) {
            let parts = property.split('.');
            if (!this.mappings[parts[0]]) {
                return property;
            }
            parts[1] = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);
            return parts.join('.');
        }
        let columnName = this.hostMapping.getFieldName(property, property);
        if (this.hostAlias && this.hostMapping.getField(property, true)) {
            columnName = this.hostAlias + '.' + columnName;
        }
        return columnName;
    }
}
exports.Criteria = Criteria;
