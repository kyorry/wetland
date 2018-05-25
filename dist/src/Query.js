"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Query {
    /**
     * Construct a new Query.
     *
     * @param {knex.QueryBuilder} statement
     * @param {Hydrator}          hydrator
     * @param {[]}                children
     */
    constructor(statement, hydrator, children = []) {
        /**
         * The child queries.
         *
         * @type {Array}
         */
        this.children = [];
        this.statement = statement;
        this.hydrator = hydrator;
        this.children = children;
    }
    /**
     * Set the parent for this query.
     *
     * @param parent
     * @returns {Query}
     */
    setParent(parent) {
        this.parent = parent;
        return this;
    }
    /**
     * Execute the query.
     *
     * @returns {Promise<[]>}
     */
    execute() {
        let query = this.restrictToParent();
        if (process.env.LOG_QUERIES) {
            console.log('Executing query:', query.toString());
        }
        return query.then();
    }
    /**
     * Restrict this query to parents.
     *
     * @returns {any}
     */
    restrictToParent() {
        let statement = this.statement;
        if (!this.parent || !this.parent.primaries.length) {
            return statement;
        }
        let parent = this.parent;
        if (parent.primaries.length === 1) {
            statement.where(parent.column, parent.primaries[0]);
            return statement;
        }
        let client = statement['client'];
        let unionized = client.queryBuilder();
        parent.primaries.forEach(primary => {
            let toUnion = statement.clone().where(parent.column, primary);
            if (client.config.client === 'sqlite3') {
                unionized.union(client.queryBuilder().select('*').from(client.raw(toUnion).wrap('(', ')')));
                return unionized;
            }
            unionized.union(toUnion, true);
        });
        return unionized;
    }
    /**
     * Get a single scalar result (for instance for count, sum or max).
     *
     * @returns {Promise<number>}
     */
    getSingleScalarResult() {
        return this.execute().then(result => {
            if (!result || typeof result[0] !== 'object') {
                return null;
            }
            return result[0][Object.keys(result[0])[0]];
        });
    }
    /**
     * Get the result for the query.
     *
     * @returns {Promise<{}[]>}
     */
    getResult() {
        return this.execute().then(result => {
            if (!result || !result.length) {
                return null;
            }
            let hydrated = this.hydrator.hydrateAll(result);
            return Promise.all(this.children.map(child => {
                return child.getQuery().getResult();
            })).then(() => hydrated);
        });
    }
    /**
     * Get the SQL query for current query.
     *
     * @returns {string}
     */
    getSQL() {
        return this.statement.toString();
    }
    /**
     * Get the statement for this query.
     *
     * @returns {knex.QueryBuilder}
     */
    getStatement() {
        return this.statement;
    }
}
exports.Query = Query;
