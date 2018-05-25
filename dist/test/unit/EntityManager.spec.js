"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wetland_1 = require("../../src/Wetland");
const User_1 = require("../resource/entity/postal/User");
const Order_1 = require("../resource/entity/postal/Order");
const Address_1 = require("../resource/entity/postal/Address");
const Tracker_1 = require("../resource/entity/postal/Tracker");
const chai_1 = require("chai");
function getManager() {
    let wetland = new Wetland_1.Wetland({
        entities: [User_1.User, Order_1.Order],
        mapping: {
            defaultNamesToUnderscore: true
        }
    });
    return wetland.getEntityManager();
}
describe('EntityManager', () => {
    describe('.constructor()', () => {
        it('should set wetland', () => {
            let config = getManager().getConfig();
            chai_1.assert.propertyVal(config.fetch('mapping'), 'defaultNamesToUnderscore', true);
        });
    });
    describe('.createScope()', () => {
        it('should create a scope', () => {
            let scope = getManager().createScope();
            chai_1.assert.property(scope.getIdentityMap(), 'map');
        });
    });
    describe('.getEntity()', () => {
        it('should fetch the entity', () => {
            let entity = getManager().getEntity('User');
            chai_1.assert.typeOf(entity, 'function');
        });
        it('should throw an error while fetching an unknown entity', () => {
            chai_1.assert.throws(() => {
                return getManager().getEntity('Product');
            }, 'No entity found for "Product".');
        });
    });
    describe('.getEntities()', () => {
        it('should retrieve all the registered entities', () => {
            let entities = getManager().getEntities();
            chai_1.assert.property(entities, 'User');
            chai_1.assert.property(entities, 'Order');
        });
    });
    describe('.registerEntity()', () => {
        it('Should register an entity', () => {
            let manager = getManager().registerEntity(Address_1.Address);
            chai_1.assert.doesNotThrow(() => {
                return manager.getEntity('Address');
            }, 'No entity found for "Address".');
        });
    });
    describe('.getMapping()', () => {
        it('Should get the mapping of the provided entity', () => {
            let fieldNames = getManager().getMapping('User').getFieldNames();
            chai_1.assert.deepEqual(fieldNames, ['id', 'name']);
        });
    });
    describe('.registerEntities()', () => {
        it('Should register multiple entities', () => {
            let manager = getManager().registerEntities([Address_1.Address, Tracker_1.Tracker]);
            chai_1.assert.doesNotThrow(() => {
                return manager.getEntity('Address');
            }, 'No entity found for "Address".');
            chai_1.assert.doesNotThrow(() => {
                return manager.getEntity('Tracker');
            }, 'No entity found for "Tracker".');
        });
    });
    describe('.resolveEntityReference()', () => {
        it('Should resolve provided value to an entity reference', () => {
            chai_1.assert.equal(getManager().resolveEntityReference('User'), getManager().getEntity('User'));
            chai_1.assert.isFunction(getManager().resolveEntityReference(() => { }));
            chai_1.assert.isArray(getManager().resolveEntityReference([]));
            chai_1.assert.isNull(getManager().resolveEntityReference(null));
        });
    });
});
