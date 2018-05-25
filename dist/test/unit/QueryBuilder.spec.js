"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("../../src/Query");
const Wetland_1 = require("../../src/Wetland");
const queries_1 = require("../resource/queries");
const Todo_1 = require("../resource/entity/todo/Todo");
const List_1 = require("../resource/entity/todo/List");
const chai_1 = require("chai");
let wetland = new Wetland_1.Wetland({
    stores: {
        defaultStore: {
            client: 'mysql',
            connection: {
                user: 'root',
                host: '127.0.0.1',
                database: 'wetland_test'
            }
        }
    },
    entities: [Todo_1.Todo, List_1.List]
});
function getQueryBuilder() {
    return wetland.getManager().getRepository(Todo_1.Todo).getQueryBuilder('t');
}
describe('QueryBuilder', () => {
    describe('.from()', () => {
        it('should create the alias when none was supplied', () => {
            let repository = wetland.getManager().getRepository(Todo_1.Todo);
            let derived = repository.getQueryBuilder('t');
            let qb = repository.getDerivedQueryBuilder(derived).select({ distinct: '*' });
            chai_1.assert.strictEqual(qb.getQuery().getSQL(), queries_1.queries.queryBuilder.derivedCreatesAlias);
        });
        it('should correctly render and wrap the derived table (origin should not matter)', () => {
            let manager = wetland.getManager();
            let todoRepository = manager.getRepository(Todo_1.Todo);
            let listRepository = manager.getRepository(List_1.List);
            let derived = todoRepository.getQueryBuilder('t');
            let qb = listRepository.getDerivedQueryBuilder(derived, 'alias_derived').select({ distinct: '*' });
            chai_1.assert.strictEqual(qb.getQuery().getSQL(), queries_1.queries.queryBuilder.derivedRegular);
        });
    });
    describe('.createAlias()', () => {
        it('should create an alias', () => {
            let alias = getQueryBuilder().createAlias('t');
            chai_1.assert.strictEqual(alias, 't0');
        });
    });
    describe('.makeJoin()', () => {
        it('should create a select query with a join clause by specifying the type of join manually', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('task')
                .makeJoin('innerJoin', 'list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.join);
        });
        it('should throw an error on invalid join property', () => {
            let queryBuilder = getQueryBuilder();
            let expectedError = 'Invalid relation supplied for join. Property \'death\' not found on entity, or relation not defined.\n        Are you registering the joins in the wrong order?';
            chai_1.assert.throws(() => {
                queryBuilder
                    .select('task')
                    .makeJoin('innerJoin', 'death', 'toJoins');
            }, expectedError);
        });
    });
    describe('.leftJoin()', () => {
        it('should create a query with a left join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .leftJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.leftJoin);
        });
    });
    describe('.join()', () => {
        it('should create a custom join query', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .join('leftJoin', 'list', 'l', { 't.list_id': 'l.id' })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.customOnJoinSimple);
        });
        it('should create a more complex custom join query', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .join('leftJoin', 'list', 'l', { or: [{ 't.list_id': 'l.id' }, { 't.task': 'l.name' }] })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.customOnJoinComplex);
        });
    });
    describe('.rightJoin()', () => {
        it('should create a query with a right join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .rightJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.rightJoin);
        });
    });
    describe('.innerJoin()', () => {
        it('should create a query with a inner join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .innerJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.innerJoin);
        });
    });
    describe('.leftOuterJoin()', () => {
        it('should create a query with a left outer join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .leftOuterJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.leftOuterJoin);
        });
    });
    describe('.rightOuterJoin()', () => {
        it('should create a query with a right outer join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .rightOuterJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.rightOuterJoin);
        });
    });
    describe('.outerJoin()', () => {
        it('should create a query with a outer join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .outerJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.outerJoin);
        });
    });
    describe('.fullOuterJoin()', () => {
        it('should create a query with a full outer join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .fullOuterJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.fullOuterJoin);
        });
    });
    describe('.crossJoin()', () => {
        it('should create a query with a cross join clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .crossJoin('list', 'l')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.crossJoin);
        });
    });
    describe('.getQuery()', () => {
        it('should return a Query instance', () => {
            chai_1.assert.instanceOf(getQueryBuilder().getQuery(), Query_1.Query);
        });
    });
    describe('.select()', () => {
        it('should create a query without having to specify the columns', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.selectAll);
        });
        it('should create a query by passing one string as argument', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('task')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.selectOne);
        });
        it('should create a query by passing one array of strings as argument', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select(['t.task', 't.done'])
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.selectArray);
        });
        it('should create a `sum()` query', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select({ sum: 'id' })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.selectSum);
        });
    });
    describe('.insert()', () => {
        it('should create an insert query', () => {
            let queryBuilder = getQueryBuilder();
            let keys = ['task', 'done'];
            let query = queryBuilder
                .insert({ 'task': 'Bake cake', 'done': true })
                .getQuery()
                .getSQL();
            keys.forEach(key => {
                chai_1.assert.include(query, key);
            });
        });
    });
    describe('.update()', () => {
        it('should created an update query', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .update({ 'done': true })
                .where({ 'id': 1 })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.update);
        });
    });
    describe('.limit()', () => {
        it('should create a query containing a limit clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .limit(69)
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.limit);
        });
    });
    describe('.offset()', () => {
        it('should create a query that contains an offset following the limit clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t.done')
                .limit(5)
                .offset(15)
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.offset);
        });
    });
    describe('.groupBy()', () => {
        it('should create a query that groups by given property as a string', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t.task')
                .groupBy('t.list')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.groupByOne);
        });
        it('should create a query that groups by given property as an array', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t.task')
                .groupBy(['t.list'])
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.groupByOne);
        });
        it('should create a query that groups by multiple properties', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .groupBy(['t.list', 't.done'])
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.groupByMultiple);
        });
    });
    describe('.orderBy()', () => {
        it('should create a query that sorts by a property (asc)', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .orderBy('t.task')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.orderByAsc);
        });
        it('should create a query that sorts by a property (desc)', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .orderBy('t.done', 'desc')
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.orderByDesc);
        });
        it('should create a query by passing the conditionals as an object', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .orderBy({ 't.task': 'desc' })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.orderByDescObj);
        });
        it('should create a query by passing the conditionals as an array of objects', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .orderBy(['t.task', { 't.done': 'desc' }])
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.orderByDescArr);
        });
    });
    describe('.remove()', () => {
        it('should create a delete query.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .remove()
                .where({ 'id': 1 })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.deleteById);
        });
    });
    describe('.where()', () => {
        it('should create a select query with a `where` clause.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .where({ 't.done': true })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.where);
        });
        it('should create a select query with a `where in` clause.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .where({ 't.task': ['Pet cat', 'Pet cat again'] })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.whereIn);
        });
        it('should create a select query with a `where and` clause.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .where({ 't.task': 'Rob bank', 't.done': false })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.whereAnd);
        });
        it('should create a select query with a `where` clause and an operator.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t.task')
                .where({ 't.id': { lte: 13 } })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.whereLTE);
        });
        it('should create a select query with a nested `where or` clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t.task')
                .where({ or: [{ 'id': { gte: 50, lte: 20 } }], 'done': true })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.whereNestedOr);
        });
        it('should create a select query with a nested `where and` clause', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t.task')
                .where({ 'task': ['buy cake', 'rob bank'], or: [{ 'id': { lt: 100 }, 'done': false }] })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.whereNestedIn);
        });
    });
    describe('.having()', () => {
        it('should create a select query with a `having` clause.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder.select({ count: 't.task', alias: 'tasks' })
                .having({ 'tasks': { lte: 13 } }).getQuery().getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.having);
        });
        it('should create a select query with `where`, `groupBy` and `having` clauses.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select({ count: 't.task', alias: 'tasks' })
                .where({ 't.id': { gte: 10 } })
                .groupBy('t.done')
                .having({ 'tasks': { lte: 4 } })
                .getQuery().getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.havingGroupBy);
        });
        it('should create a select query with `groupBy` and multiple `having` clauses.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select({ count: 't.task', alias: 'tasks' })
                .groupBy('t.done')
                .having({ 'tasks': { gt: 5, lte: 100 } })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.havingMultiple);
        });
        it('should create a super cool query with a lot of clauses.', () => {
            let queryBuilder = getQueryBuilder();
            let query = queryBuilder
                .select('t')
                .select({ sum: 't.id', alias: 'sum_id' })
                .innerJoin('list', 'l')
                .where({ 't.done': false })
                .groupBy('t.id')
                .having({ 'sum_id': { lte: 200 } })
                .getQuery()
                .getSQL();
            chai_1.assert.strictEqual(query, queries_1.queries.queryBuilder.havingALot);
        });
    });
});
