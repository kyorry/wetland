"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Wetland_1 = require("../../src/Wetland");
const Criteria_1 = require("../../src/Criteria/Criteria");
const Mapping_1 = require("../../src/Mapping");
const Delivery_1 = require("../resource/entity/postal/Delivery");
const Address_1 = require("../resource/entity/postal/Address");
const Order_1 = require("../resource/entity/postal/Order");
const Tracker_1 = require("../resource/entity/postal/Tracker");
const User_1 = require("../resource/entity/postal/User");
const queries_1 = require("../resource/queries");
function getMappings() {
    return {
        a: Mapping_1.Mapping.forEntity(Address_1.Address),
        d: Mapping_1.Mapping.forEntity(Delivery_1.Delivery),
        o: Mapping_1.Mapping.forEntity(Order_1.Order),
        t: Mapping_1.Mapping.forEntity(Tracker_1.Tracker),
        u: Mapping_1.Mapping.forEntity(User_1.User)
    };
}
function getStatement(wetland, table, alias) {
    return wetland.getStore().getConnection()(`${table} as ${alias}`);
}
let wetland = new Wetland_1.Wetland({
    entityPath: __dirname + '/../resource/entity/postal',
    stores: {
        defaultStore: {
            client: 'mysql',
            connection: {
                user: 'root',
                host: '127.0.0.1',
                database: 'wetland_test'
            }
        }
    }
});
describe('Criteria', () => {
    describe('.mapToColumn()', () => {
        it('should apply provided columns to an alias, when set and found.', () => {
            let withAlias = getStatement(wetland, 'delivery', 'd');
            let criteria = new Criteria_1.Criteria(withAlias, Mapping_1.Mapping.forEntity(Delivery_1.Delivery), getMappings(), 'd');
            let mappedId = criteria.mapToColumn('id');
            let mappedCreated = criteria.mapToColumn('created');
            let mappedNonsense = criteria.mapToColumn('nonsense');
            chai_1.assert.strictEqual(mappedId, 'd.id');
            chai_1.assert.strictEqual(mappedCreated, 'd.created');
            chai_1.assert.strictEqual(mappedNonsense, 'nonsense');
        });
        it('should not apply provided columns to an alias, when not set.', () => {
            let withAlias = getStatement(wetland, 'delivery', 'd');
            let criteria = new Criteria_1.Criteria(withAlias, Mapping_1.Mapping.forEntity(Delivery_1.Delivery), getMappings());
            let mappedId = criteria.mapToColumn('id');
            let mappedCreated = criteria.mapToColumn('created');
            let mappedNonsense = criteria.mapToColumn('nonsense');
            chai_1.assert.strictEqual(mappedId, 'id');
            chai_1.assert.strictEqual(mappedCreated, 'created');
            chai_1.assert.strictEqual(mappedNonsense, 'nonsense');
        });
    });
    describe('.apply()', () => {
        it('should compose a simple where query', () => {
            let withAlias = getStatement(wetland, 'delivery', 'd');
            let criteriaAlias = new Criteria_1.Criteria(withAlias, Mapping_1.Mapping.forEntity(Delivery_1.Delivery), getMappings());
            let withoutAlias = getStatement(wetland, 'delivery', 'd');
            let criteria = new Criteria_1.Criteria(withoutAlias, Mapping_1.Mapping.forEntity(Delivery_1.Delivery), getMappings());
            criteria.apply({ id: 6 });
            criteriaAlias.apply({ 'd.id': 6 });
            chai_1.assert.strictEqual(withAlias.toString(), queries_1.queries.criteria.withAlias);
            chai_1.assert.strictEqual(withoutAlias.toString(), queries_1.queries.criteria.withoutAlias);
        });
        it('should compose a simple where query with custom column names', () => {
            let withAlias = getStatement(wetland, 'address', 'a');
            let criteriaAlias = new Criteria_1.Criteria(withAlias, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings());
            let withoutAlias = getStatement(wetland, 'address', 'a');
            let criteria = new Criteria_1.Criteria(withoutAlias, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings());
            criteria.apply({ houseNumber: 6 });
            criteriaAlias.apply({ 'a.houseNumber': 6 });
            chai_1.assert.strictEqual(withAlias.toString(), queries_1.queries.criteria.customColumnWithAlias);
            chai_1.assert.strictEqual(withoutAlias.toString(), queries_1.queries.criteria.customColumnWithoutAlias);
        });
        it('should compose a simple where query with multiple criteria', () => {
            let statement = getStatement(wetland, 'address', 'a');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings());
            criteria.apply({
                street: { contains: 'straat' },
                houseNumber: { gt: 2 },
                id: { between: [1, 200] },
                country: { not: 'Imagination land' }
            });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.multipleOperators);
        });
        it('should use correct operator for is null', () => {
            let statement = getStatement(wetland, 'address', 'a');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings());
            criteria.apply({ street: null });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.defaultsIsNull);
        });
        it('should use correct operator for is not null', () => {
            let statement = getStatement(wetland, 'address', 'a');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings());
            criteria.apply({ street: { not: null } });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.defaultsIsNotNull);
        });
        it('should use correct operator for in', () => {
            let statement = getStatement(wetland, 'address', 'a');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings());
            criteria.apply({ houseNumber: [1, 2, 3, 7] });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.defaultsIn);
        });
        it('should use correct operator for not in', () => {
            let statement = getStatement(wetland, 'address', 'a');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings());
            criteria.apply({ houseNumber: { not: [1, 2, 3, 7] } });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.defaultsNotIn);
        });
        it('should use correct operator for not in with alias', () => {
            let statement = getStatement(wetland, 'address', 'a');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Address_1.Address), getMappings(), 'a');
            criteria.apply({ houseNumber: { not: [1, 2, 3, 7] } });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.defaultsNotInWithAlias);
        });
        it('should create queries when supplying nested criteria ("and", or "or" method), the sensible edition', () => {
            let statement = getStatement(wetland, 'delivery', 'd');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Delivery_1.Delivery), getMappings());
            criteria.apply({
                id: 1337,
                'a.country': 'Netherlands',
                'a.street': { endsWith: 'street' },
                or: [
                    { 't.status': 1 },
                    {
                        and: [
                            { 't.status': 2 },
                            { 'u.name': 'Frank' }
                        ]
                    },
                ]
            });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.sensible);
        });
        it('should create queries when supplying nested criteria ("and", or "or" method), the mental edition', () => {
            let statement = getStatement(wetland, 'delivery', 'd');
            let criteria = new Criteria_1.Criteria(statement, Mapping_1.Mapping.forEntity(Delivery_1.Delivery), getMappings());
            criteria.apply({
                id: 1337,
                'a.country': 'Netherlands',
                'a.street': { endsWith: 'street' },
                or: [
                    { id: { between: [1, 100] } },
                    { 'a.houseNumber': { gt: 12 } },
                    {
                        and: [
                            { id: { between: [100, 500] } },
                            { role: { not: ['guest', 'spectator'] } },
                            {
                                or: [
                                    { role: 'no idea' },
                                    {
                                        and: [
                                            { id: { notBetween: [6, 9] } },
                                            { 't.status': 2 },
                                            { 'u.name': 'Frank' },
                                            {
                                                or: [
                                                    { id: { not: [5, 6, 7, 8] } },
                                                    { role: { gt: 666 } }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            chai_1.assert.strictEqual(statement.toString(), queries_1.queries.criteria.mental);
        });
    });
});
