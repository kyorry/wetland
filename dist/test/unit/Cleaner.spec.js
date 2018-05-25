"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wetland_1 = require("../../src/Wetland");
const Schema_1 = require("../resource/Schema");
const path = require("path");
const Seeder_1 = require("../resource/Seeder");
describe('Cleaner', () => {
    beforeEach(() => Seeder_1.rmDataDir());
    describe('.clean() : database', () => {
        before((done) => {
            Schema_1.Schema.resetDatabase(done);
        });
        it('Should clean the database correctly and be able to do the migration', () => {
            const bypassLifecyclehooks = false;
            const wetland = new Wetland_1.Wetland({
                dataDirectory: `${Seeder_1.tmpTestDir}/.data`,
                stores: {
                    defaultStore: {
                        client: 'mysql',
                        connection: {
                            database: 'wetland_test',
                            user: 'root',
                            password: ''
                        }
                    }
                },
                seed: {
                    fixturesDirectory: path.join(Seeder_1.fixturesDir, Seeder_1.getType(bypassLifecyclehooks)),
                    clean: true,
                    bypassLifecyclehooks
                },
                entities: [Seeder_1.User, Seeder_1.Pet, Seeder_1.Post]
            });
            const seeder = wetland.getSeeder();
            const cleaner = wetland.getCleaner();
            const migrator = wetland.getMigrator();
            return migrator.devMigrations(false)
                .then(() => seeder.seed())
                .then(() => cleaner.clean())
                .then(() => migrator.devMigrations(false))
                .then(() => seeder.seed());
        });
    });
    describe('.clean() : embedded database', () => {
        it('Should clean the database correctly and be able to do the migration', () => {
            const bypassLifecyclehooks = false;
            const wetland = new Wetland_1.Wetland({
                dataDirectory: `${Seeder_1.tmpTestDir}/.data`,
                stores: {
                    defaultStore: {
                        client: 'sqlite3',
                        useNullAsDefault: true,
                        connection: {
                            filename: `${Seeder_1.tmpTestDir}/cleaner.sqlite`
                        }
                    }
                },
                seed: {
                    fixturesDirectory: path.join(Seeder_1.fixturesDir, Seeder_1.getType(bypassLifecyclehooks)),
                    clean: true,
                    bypassLifecyclehooks
                },
                entities: [Seeder_1.User, Seeder_1.Pet, Seeder_1.Post]
            });
            const seeder = wetland.getSeeder();
            const cleaner = wetland.getCleaner();
            const migrator = wetland.getMigrator();
            return migrator.devMigrations(false)
                .then(() => seeder.seed())
                .then(() => cleaner.clean())
                .then(() => migrator.devMigrations(false))
                .then(() => seeder.seed());
        });
    });
});
