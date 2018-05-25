"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Wetland_1 = require("../../src/Wetland");
const path = require("path");
const Bluebird = require("bluebird");
const fs = require("fs");
const parse = require("csv-parse");
const Seeder_1 = require("../resource/Seeder");
function getWetland(clean, bypassLifecyclehooks) {
    const fileName = `${clean ? 'clean' : 'safe'}-${Seeder_1.getType(bypassLifecyclehooks)}.sqlite`;
    return new Wetland_1.Wetland({
        dataDirectory: `${Seeder_1.tmpTestDir}/.data`,
        stores: {
            defaultStore: {
                client: 'sqlite3',
                useNullAsDefault: true,
                connection: {
                    filename: `${Seeder_1.tmpTestDir}/${fileName}`
                }
            }
        },
        seed: {
            fixturesDirectory: path.join(Seeder_1.fixturesDir, Seeder_1.getType(bypassLifecyclehooks)),
            bypassLifecyclehooks: bypassLifecyclehooks,
            clean: clean
        },
        entities: [Seeder_1.User, Seeder_1.Pet, Seeder_1.Post]
    });
}
function testUsers(manager, bypassLifecyclehooks) {
    let usersFromFile = require(path.join(Seeder_1.fixturesDir, Seeder_1.getType(bypassLifecyclehooks), 'User.json'));
    return manager.getRepository(Seeder_1.User)
        .find(null, { populate: ['posts'] })
        .then(users => {
        chai_1.assert.lengthOf(users, usersFromFile.length);
        if (bypassLifecyclehooks) {
            users.forEach(user => {
                chai_1.assert.lengthOf(user['posts'], 1);
            });
        }
    });
}
function testPosts(manager, bypassLifecyclehooks) {
    let postsFromFile = require(path.join(Seeder_1.fixturesDir, Seeder_1.getType(bypassLifecyclehooks), 'Post.json'));
    return manager.getRepository(Seeder_1.Post)
        .find(null, { populate: ['author'] })
        .then(posts => {
        chai_1.assert.lengthOf(posts, postsFromFile.length);
        if (bypassLifecyclehooks) {
            posts.forEach(post => {
                chai_1.assert.isDefined(post['author']);
            });
        }
    });
}
function testPets(manager, bypassLifecyclehooks) {
    const readFile = Bluebird.promisify(fs.readFile);
    return readFile(path.join(Seeder_1.fixturesDir, Seeder_1.getType(bypassLifecyclehooks), 'Pet.csv'))
        .then(data => {
        const parseP = Bluebird.promisify(parse);
        return parseP(data, { columns: true });
    })
        .then(petsFromFile => {
        return manager.getRepository(Seeder_1.Pet)
            .find()
            .then(pets => {
            chai_1.assert.lengthOf(pets, petsFromFile.length);
        });
    });
}
describe('Seeder', () => {
    beforeEach(() => Seeder_1.rmDataDir());
    describe('CleanSeed', () => {
        describe('.seed(): no lifecyclehooks', () => {
            it('Should seed the database', () => {
                const clean = true;
                const bypassLifecyclehooks = true;
                const wetland = getWetland(clean, bypassLifecyclehooks);
                const migrator = wetland.getMigrator();
                const seeder = wetland.getSeeder();
                const cleaner = wetland.getCleaner();
                const manager = wetland.getManager();
                return cleaner.clean()
                    .then(() => migrator.devMigrations(false))
                    .then(() => seeder.seed())
                    .then(() => testUsers(manager, bypassLifecyclehooks))
                    .then(() => testPosts(manager, bypassLifecyclehooks))
                    .then(() => testPets(manager, bypassLifecyclehooks));
            });
        });
        describe('.clean() : lifecyclehooks', () => {
            it('Should seed the database', () => {
                const clean = true;
                const bypassLifecyclehooks = false;
                const wetland = getWetland(clean, bypassLifecyclehooks);
                const migrator = wetland.getMigrator();
                const seeder = wetland.getSeeder();
                const manager = wetland.getManager();
                const cleaner = wetland.getCleaner();
                return cleaner.clean()
                    .then(() => migrator.devMigrations(false))
                    .then(() => seeder.seed())
                    .then(() => testUsers(manager, bypassLifecyclehooks))
                    .then(() => testPosts(manager, bypassLifecyclehooks))
                    .then(() => testPets(manager, bypassLifecyclehooks));
            });
        });
    });
    describe('SafeSeed', () => {
        describe('.seed(): no lifecyclehooks', () => {
            it('Should safely seed the database', () => {
                const clean = false;
                const bypassLifecyclehooks = true;
                const wetland = getWetland(clean, bypassLifecyclehooks);
                const migrator = wetland.getMigrator();
                const seeder = wetland.getSeeder();
                const manager = wetland.getManager();
                return migrator.devMigrations(false)
                    .then(() => seeder.seed())
                    .then(() => seeder.seed()) // Called a second time on purpose
                    .then(() => testUsers(manager, bypassLifecyclehooks))
                    .then(() => testPosts(manager, bypassLifecyclehooks))
                    .then(() => testPets(manager, bypassLifecyclehooks));
            });
        });
        describe('.seed(): lifecyclehooks', () => {
            it('Should safely seed', () => {
                const clean = false;
                const bypassLifecyclehooks = false;
                const wetland = getWetland(clean, bypassLifecyclehooks);
                const migrator = wetland.getMigrator();
                const seeder = wetland.getSeeder();
                const manager = wetland.getManager();
                return migrator.devMigrations(false)
                    .then(() => seeder.seed())
                    .then(() => seeder.seed()) // Called a second time on purpose
                    .then(() => testUsers(manager, bypassLifecyclehooks))
                    .then(() => testPosts(manager, bypassLifecyclehooks))
                    .then(() => testPets(manager, bypassLifecyclehooks));
            });
        });
    });
});
