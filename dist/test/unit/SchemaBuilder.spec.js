"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Promise = require("bluebird");
const Wetland_1 = require("../../src/Wetland");
const Store_1 = require("../../src/Store");
const Schema_1 = require("../resource/Schema");
const schemas_1 = require("../resource/schemas");
describe('SchemaBuilder', () => {
    beforeEach(done => {
        Schema_1.Schema.resetDatabase(done);
    });
    describe('.create()', () => {
        it('should create my tables (todo)', done => testEntities('todo', done));
        it('should create my tables (postal)', done => testEntities('postal', done));
    });
});
function testEntities(section, done) {
    let wetland = new Wetland_1.Wetland({
        entityPath: __dirname + '/../resource/entity/' + section,
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
    let connection = wetland.getStore().getConnection(Store_1.Store.ROLE_MASTER);
    wetland.getSchemaManager().create().then(() => {
        return testProperty(connection, section, 'columns', 'columns')
            .then(() => testProperty(connection, section, 'constraints', 'key_column_usage'))
            .then(() => testProperty(connection, section, 'referentialConstraints', 'referential_constraints'))
            .then(() => done())
            .catch(done);
    });
}
function testProperty(connection, section, property, table) {
    return Promise.all(schemas_1.schemas[section][property].map(target => {
        return connection
            .from('information_schema.' + table)
            .where(target)
            .where(property === 'columns' ? 'table_schema' : 'constraint_schema', '=', 'wetland_test')
            .then(result => chai_1.assert.lengthOf(result, 1, `'${section}' broken with ${JSON.stringify(target)}`));
    }));
}
