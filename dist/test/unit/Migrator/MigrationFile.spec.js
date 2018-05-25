"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = require("fs");
const path = require("path");
const MigrationFile_1 = require("../../../src/Migrator/MigrationFile");
let migrationsDir = __dirname + '/../../resource/migrations';
let tmpMigrations = path.join(migrationsDir, 'tmp');
let cleanDirectory = directory => {
    try {
        fs.readdirSync(directory).forEach(file => {
            try {
                fs.unlinkSync(path.join(directory, file));
            }
            catch (error) {
                cleanDirectory(path.join(directory, file));
                fs.unlinkSync(path.join(directory, file));
            }
        });
        fs.rmdirSync(directory);
    }
    catch (e) {
    }
};
describe('MigrationFile', () => {
    describe('.constructor()', () => {
        it('should set the config', () => {
            let config = { extension: 'js', tableName: 'wetland_migrations', directory: tmpMigrations };
            let migrationFile = new MigrationFile_1.MigrationFile(config);
            chai_1.assert.typeOf(migrationFile.getConfig(), 'object');
        });
    });
    describe('.getConfig()', () => {
        it('should get the config', () => {
            let config = { directory: '' };
            let migrationFile = new MigrationFile_1.MigrationFile(config);
            chai_1.assert.typeOf(migrationFile.getConfig(), 'object');
        });
    });
    describe('.create()', () => {
        before(() => {
            cleanDirectory(tmpMigrations);
            fs.mkdirSync(tmpMigrations);
        });
        after(() => {
            cleanDirectory(tmpMigrations);
        });
        it('should create a new migration file', done => {
            let migrationFile = new MigrationFile_1.MigrationFile({
                extension: 'js',
                tableName: 'wetland_migrations',
                directory: tmpMigrations
            });
            migrationFile.create('created').then(() => {
                let migrations = fs.readdirSync(tmpMigrations);
                let migration = require(tmpMigrations + '/' + migrations[0])['Migration'];
                chai_1.assert.isTrue(Reflect.has(migration, 'up'));
                chai_1.assert.isTrue(Reflect.has(migration, 'down'));
                chai_1.assert.match(migrations[0], /^\d{14}_created\.js$/);
                chai_1.assert.equal(migrations.length, 1);
                done();
            });
        });
        it('should complain about an invalid write path', done => {
            let migrationFile = new MigrationFile_1.MigrationFile({
                extension: 'js',
                tableName: 'wetland_migrations',
                directory: tmpMigrations
            });
            migrationFile.create('foo/created').catch(error => {
                chai_1.assert.equal(error.code, 'ENOENT');
                done();
            });
        });
        it('should complain about an invalid read path', done => {
            let migrationFile = new MigrationFile_1.MigrationFile({
                extension: 'js',
                tableName: 'wetland_migrations',
                directory: tmpMigrations + '/ooooops'
            });
            migrationFile.create('foo/created').catch(error => {
                chai_1.assert.equal(error.code, 'ENOENT');
                done();
            });
        });
    });
    describe('.getMigrations()', () => {
        it('Should give me the names of all available migrations', done => {
            let migrationFile = new MigrationFile_1.MigrationFile({
                extension: 'js',
                tableName: 'wetland_migrations',
                directory: __dirname + '/../../resource/migrations'
            });
            migrationFile.getMigrations().then(files => {
                chai_1.expect(files).to.have.same.members([
                    '20161004123412_foo',
                    '20161004123413_bar',
                    '20161004123411_baz'
                ]);
                done();
            }).catch(done);
        });
    });
});
