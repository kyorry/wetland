"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const migrations_1 = require("../../resource/migrations");
const Wetland_1 = require("../../../src/Wetland");
const Migrator_1 = require("../../../src/Migrator/Migrator");
const Schema_1 = require("../../resource/Schema");
let getWetland = () => {
    return new Wetland_1.Wetland({
        migrator: { directory: __dirname + '/../../resource/migrations' },
        stores: {
            defaultStore: {
                client: 'mysql',
                connection: { user: 'root', host: '127.0.0.1', database: 'wetland_test' }
            }
        }
    });
};
describe('Migrator', () => {
    beforeEach(done => {
        Schema_1.Schema.resetDatabase(done);
    });
    describe('.up()', () => {
        it('should run with action run', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.up(Migrator_1.Migrator.ACTION_RUN)
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('ticket', 'name').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('ticket', 'id').then(chai_1.assert.isTrue))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'id').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'name').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'deadly_skill').then(chai_1.assert.isTrue))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isTrue))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .then(() => done())
                .catch(done);
        });
        it('should run and return the queries with action get_sql', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.up(Migrator_1.Migrator.ACTION_GET_SQL)
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.up.baz))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_RUN))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_GET_SQL))
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.up.foo))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_RUN))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_GET_SQL))
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.up.bar))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .then(() => done())
                .catch(done);
        });
    });
    describe('.down()', () => {
        it('should run with action run', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.latest(Migrator_1.Migrator.ACTION_RUN)
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isFalse))
                .then(() => done())
                .catch(done);
        });
        it('should run and return the queries with action get_sql', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.latest(Migrator_1.Migrator.ACTION_RUN)
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isTrue))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_GET_SQL))
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.down.bar))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isTrue))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_GET_SQL))
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.down.foo))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_GET_SQL))
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.down.baz))
                .then(() => migrator.down(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .then(() => done())
                .catch(done);
        });
    });
    describe('.latest()', () => {
        it('should run with action run', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.latest(Migrator_1.Migrator.ACTION_RUN)
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('ticket', 'name').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('ticket', 'id').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'id').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'name').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'deadly_skill').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isTrue))
                .then(() => migrator.revert(Migrator_1.Migrator.ACTION_RUN))
                .then(() => done())
                .catch(done);
        });
        it('should run and return the queries with action get_sql', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.latest(Migrator_1.Migrator.ACTION_GET_SQL)
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.latest))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .then(() => done())
                .catch(done);
        });
    });
    describe('.revert()', () => {
        it('should run with action run', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.latest(Migrator_1.Migrator.ACTION_RUN)
                .then(() => migrator.revert(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isFalse))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .then(() => migrator.revert(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isFalse))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_RUN))
                .then(() => migrator.up(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'id').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'name').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasColumn('robot', 'deadly_skill').then(chai_1.assert.isTrue))
                .then(() => migrator.revert(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isFalse))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isFalse))
                .then(() => migrator.revert(Migrator_1.Migrator.ACTION_RUN))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isFalse))
                .then(() => done())
                .catch(done);
        });
        it('should run and return the queries with action get_sql', done => {
            let wetland = getWetland();
            let migrator = wetland.getMigrator();
            let connection = migrator.getConnection();
            migrator.latest(Migrator_1.Migrator.ACTION_RUN)
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isTrue))
                .then(() => migrator.revert(Migrator_1.Migrator.ACTION_GET_SQL))
                .tap(query => chai_1.assert.equal(query, migrations_1.migrations.revert))
                .tap(() => connection.schema.hasTable('ticket').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('person').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('animal').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('robot').then(chai_1.assert.isTrue))
                .tap(() => connection.schema.hasTable('user').then(chai_1.assert.isTrue))
                .then(() => migrator.revert(Migrator_1.Migrator.ACTION_RUN))
                .then(() => done())
                .catch(done);
        });
    });
});
