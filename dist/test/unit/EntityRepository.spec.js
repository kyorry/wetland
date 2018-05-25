"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wetland_1 = require("../../src/Wetland");
const User_1 = require("../resource/entity/postal/User");
const Tracker_1 = require("../resource/entity/postal/Tracker");
const chai_1 = require("chai");
const path = require("path");
const ArrayCollection_1 = require("../../src/ArrayCollection");
let tmpTestDir = path.join(__dirname, '../.tmp');
function wetland() {
    return new Wetland_1.Wetland({
        stores: {
            defaultStore: {
                client: 'sqlite3',
                useNullAsDefault: true,
                connection: {
                    filename: `${tmpTestDir}/entity-repository.sqlite`
                }
            }
        },
        entities: [User_1.User, Tracker_1.Tracker]
    });
}
function getManager() {
    return wetland().getManager();
}
function getRepository() {
    return getManager().getRepository(User_1.User);
}
let trackers = new ArrayCollection_1.ArrayCollection;
trackers.push({
    id: 1,
    observers: [],
    status: 2
});
describe('EntityRepository', () => {
    before(() => {
        return wetland().getSchemaManager().create();
    });
    describe('.constructor()', () => {
        it('should construct a new repository', () => {
            let repo = getRepository();
            chai_1.assert.property(repo, 'entityManager');
            chai_1.assert.property(repo, 'entity');
            chai_1.assert.property(repo, 'mapping');
        });
    });
    describe('.getQueryBuilder()', () => {
        it('should return a queryBuilder', () => {
            let entityAlias = getRepository().getQueryBuilder();
            chai_1.assert.propertyVal(entityAlias, 'alias', 'user');
            let fooAlias = getRepository().getQueryBuilder('foo');
            chai_1.assert.propertyVal(fooAlias, 'alias', 'foo');
        });
    });
    describe('.find()', () => {
        it('should find all entities', () => {
            let newUser = new User_1.User();
            let newObserver = new User_1.User();
            let newTracker = new Tracker_1.Tracker();
            newObserver.name = 'bar';
            newTracker.status = 2;
            newTracker.observers.add(newObserver);
            newUser.name = 'foo';
            newUser.trackers.add(newTracker);
            return getManager().persist(newUser).flush()
                .then(() => getRepository().find())
                .then(users => {
                chai_1.assert.lengthOf(users, 2);
                chai_1.assert.oneOf(users[0].name, ['foo', 'bar']);
                chai_1.assert.oneOf(users[1].name, ['foo', 'bar']);
            });
        });
        it('should not find entities based on criteria', () => {
            return getRepository().find({ name: 'foobar' })
                .then(users => chai_1.assert.isNull(users));
        });
        it('should find entities based on criteria', () => {
            return getRepository().find({ name: 'foo' })
                .then(users => {
                chai_1.assert.propertyVal(users[0], 'name', 'foo');
                chai_1.assert.oneOf(users[0].id, [1, 2]);
            });
        });
        it('should find entities with alias option', () => {
            return getRepository().find(null, { alias: 'foo' })
                .then(users => {
                chai_1.assert.lengthOf(users, 2);
            });
        });
        it('should find entities with populateAll option', () => {
            return getRepository().find(null, { populate: true })
                .then(users => users.forEach(user => {
                chai_1.assert.lengthOf(user.trackers, 1);
                chai_1.assert.deepEqual(user.trackers, trackers);
            }));
        });
        it('should find entities with specific populate option', () => {
            return getRepository().find(null, { populate: 'trackers' })
                .then(users => users.forEach(user => {
                chai_1.assert.lengthOf(user.trackers, 1);
                chai_1.assert.deepEqual(user.trackers, trackers);
            }));
        });
        it('should find entities with deep populate option', () => {
            return getRepository().find(null, { populate: ['trackers', 'trackers.observers'] })
                .then(users => {
                chai_1.assert.typeOf(users[0].trackers[0].observers[0].id, 'number');
                chai_1.assert.oneOf(users[0].trackers[0].observers[0].id, [1, 2]);
                chai_1.assert.oneOf(users[0].trackers[0].observers[0].name, ['foo', 'bar']);
                chai_1.assert.property(users[0].trackers[0].observers[0], 'trackers');
            });
        });
    });
    describe('.findOne()', () => {
        it('should find one entity', () => {
            return getRepository().findOne()
                .then(user => {
                chai_1.assert.propertyVal(user, 'id', 1);
                chai_1.assert.oneOf(user.name, ['foo', 'bar']);
            });
        });
        it('should find a entity with alias option', () => {
            return getRepository().findOne(null, { alias: 'foo' })
                .then(user => {
                chai_1.assert.propertyVal(user, 'id', 1);
                chai_1.assert.oneOf(user.name, ['foo', 'bar']);
            });
        });
        it('should find a entity with on primary key as criteria', () => {
            return getRepository().findOne(2)
                .then(user => {
                chai_1.assert.propertyVal(user, 'id', 2);
                chai_1.assert.oneOf(user.name, ['foo', 'bar']);
            });
        });
        it('should not find a entity with on primary key as criteria', () => {
            return getRepository().findOne(99)
                .then(user => chai_1.assert.isNull(user));
        });
        it('should find a entity with string as criteria', () => {
            return getRepository().findOne('1')
                .then(user => {
                chai_1.assert.propertyVal(user, 'id', 1);
                chai_1.assert.oneOf(user.name, ['foo', 'bar']);
            });
        });
        it('should find a entity with an object as criteria', () => {
            return getRepository().findOne({ name: 'foo' })
                .then(user => {
                chai_1.assert.propertyVal(user, 'name', 'foo');
                chai_1.assert.oneOf(user.id, [1, 2]);
            });
        });
    });
    describe('.applyOptions()', () => {
        it('should apply options', () => {
            let appliedOptions = getRepository().applyOptions(getRepository().getQueryBuilder(), {
                select: 'name'
            });
            chai_1.assert.notDeepEqual(appliedOptions, getRepository().getQueryBuilder());
        });
    });
});
