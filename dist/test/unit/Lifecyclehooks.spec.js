"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Wetland_1 = require("../../src/Wetland");
const Entity_1 = require("../../src/Entity");
const path = require("path");
const Bluebird = require("bluebird");
const rimraf = require("rimraf");
const tmpTestDir = path.join(__dirname, '../.tmp');
const dataDir = `${tmpTestDir}/.data`;
class User extends Entity_1.Entity {
    static setMapping(mapping) {
        mapping.forProperty('id').increments().primary();
        mapping.forProperty('username').field({ type: 'string' });
        mapping.forProperty('password').field({ type: 'string' });
    }
    beforeCreate() {
        this.password = (new Buffer(this.password).toString('base64')); // Do not do that in prod
    }
    beforeUpdate(values) {
        values.password = (new Buffer(values.password).toString('base64')); // Do not do that in prod
    }
}
function getWetland(name) {
    return new Wetland_1.Wetland({
        entities: [User],
        dataDirectory: `${tmpTestDir}/.data`,
        stores: {
            defaultStore: {
                useNullAsDefault: true,
                client: 'sqlite3',
                connection: {
                    filename: `${tmpTestDir}/lifecyclehooks-${name}.sqlite`
                }
            }
        }
    });
}
describe('Lifecyclehooks', () => {
    beforeEach(() => {
        const rmDir = Bluebird.promisify(rimraf);
        return rmDir(dataDir);
    });
    describe('.beforeCreate()', () => {
        it('should correctly base64 the password', () => {
            const wetland = getWetland('before-create');
            const manager = wetland.getManager();
            const UserRepository = manager.getRepository(User);
            const password = 'Test';
            const username = 'Test';
            const newUser = new User;
            newUser.username = username;
            newUser.password = password;
            return wetland.getMigrator().devMigrations(false)
                .then(() => {
                return manager.persist(newUser)
                    .flush();
            })
                .then(() => {
                return UserRepository.findOne({ username });
            })
                .then((user) => {
                chai_1.assert.notEqual(user.password, password);
                chai_1.assert.equal(user.password, (new Buffer(password)).toString('base64'));
            });
        });
    });
    describe('.beforeUpdate()', () => {
        it('should correctly base64 the password', () => {
            const wetland = getWetland('before-update');
            const manager = wetland.getManager();
            const populator = wetland.getPopulator(manager);
            const UserRepository = manager.getRepository(manager.getEntity('User'));
            const username = 'John Doe.';
            const password = '123456789';
            const updatedPassword = 'popopopop';
            const newUser = new User;
            newUser.username = username;
            newUser.password = password;
            return wetland.getMigrator().devMigrations(false)
                .then(() => {
                return manager.persist(newUser).flush();
            })
                .then(() => {
                return UserRepository.findOne({ username });
            })
                .then((user) => {
                user.password = updatedPassword;
                return manager.flush();
            })
                .then(() => {
                return UserRepository.findOne({ username });
            })
                .then((user) => {
                chai_1.assert.notEqual(user.password, updatedPassword);
                chai_1.assert.equal(user.password, (new Buffer(updatedPassword)).toString('base64'));
            });
        });
    });
});
