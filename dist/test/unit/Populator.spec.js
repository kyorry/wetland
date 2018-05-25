"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wetland_1 = require("../../src/Wetland");
const Address_1 = require("../resource/entity/postal/Address");
const chai_1 = require("chai");
const Delivery_1 = require("../resource/entity/postal/Delivery");
const Order_1 = require("../resource/entity/postal/Order");
const EntityProxy_1 = require("../../src/EntityProxy");
const MetaData_1 = require("../../src/MetaData");
const UnitOfWork_1 = require("../../src/UnitOfWork");
const ArrayCollection_1 = require("../../src/ArrayCollection");
describe('Populator', () => {
    describe('.assign()', () => {
        it('should populate a new entity', () => {
            let wetland = new Wetland_1.Wetland({});
            let manager = wetland.getManager();
            let populator = wetland.getPopulator(manager);
            let dataToPopulate = {
                street: 'I lack imagination',
                houseNumber: 1,
                postcode: '1234ab',
                country: 'Land'
            };
            wetland.registerEntity(Address_1.Address);
            let populatedAddress = populator.assign(Address_1.Address, dataToPopulate);
            chai_1.assert.deepEqual(populatedAddress, dataToPopulate);
            chai_1.assert.instanceOf(populatedAddress, Address_1.Address);
            chai_1.assert.strictEqual(manager.getUnitOfWork().getNewObjects()[0], populatedAddress);
            chai_1.assert.strictEqual(manager.getUnitOfWork().getNewObjects().length, 1);
        });
        it('should populate a new entity, but nested! Wooooo, spooky', () => {
            let wetland = new Wetland_1.Wetland({ mapping: { defaults: { cascades: ['persist'] } } });
            let manager = wetland.getManager();
            let populator = wetland.getPopulator(manager);
            let unitOfWork = manager.getUnitOfWork();
            let dataToPopulate = {
                street: 'I lack imagination',
                houseNumber: 1,
                postcode: '1234ab',
                country: 'Land',
                deliveries: [
                    { id: 1, order: { name: 'an order' } },
                    { created: 'todaaaaaay', order: { id: 10, name: 'changed' } }
                ]
            };
            wetland.registerEntities([Address_1.Address, Delivery_1.Delivery, Order_1.Order]);
            let populatedAddress = populator.assign(Address_1.Address, dataToPopulate, null, true);
            let changedCollection = new ArrayCollection_1.ArrayCollection;
            changedCollection.push({ id: 10, name: 'changed' });
            unitOfWork.prepareCascades();
            chai_1.assert.deepEqual(populatedAddress, dataToPopulate);
            chai_1.assert.deepEqual(populatedAddress['deliveries'][1], { created: 'todaaaaaay', order: { id: 10, name: 'changed' } });
            chai_1.assert.instanceOf(populatedAddress, Address_1.Address);
            chai_1.assert.strictEqual(unitOfWork.getNewObjects()[0], populatedAddress);
            chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 3);
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), changedCollection);
            chai_1.assert.strictEqual(unitOfWork.getDirtyObjects().length, 1);
            chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 3);
        });
        it('should modify base', () => {
            let wetland = new Wetland_1.Wetland({ mapping: { defaults: { cascades: ['persist'] } } });
            let manager = wetland.getManager();
            let populator = wetland.getPopulator(manager);
            let unitOfWork = manager.getUnitOfWork();
            let cleanOrder = new Order_1.Order;
            let cleanDelivery = new Delivery_1.Delivery;
            let cleanAddress = new Address_1.Address;
            let dataToPopulate = {
                id: 1337,
                street: 'I lack imagination',
                houseNumber: 1,
                postcode: '1234ab',
                country: 'Land',
                deliveries: [
                    { id: 1, order: { name: 'an order' } },
                    { created: 'todaaaaaay', order: { id: 10, name: 'changed' } }
                ]
            };
            Object.assign(cleanDelivery, {
                id: 123
            });
            Object.assign(cleanAddress, {
                id: 1337,
                street: 'I lack imagination',
                houseNumber: 1,
                postcode: '1234ab',
                country: 'Country',
                deliveries: [cleanDelivery]
            });
            wetland.registerEntities([Address_1.Address, Delivery_1.Delivery, Order_1.Order]);
            Object.assign(cleanOrder, { id: 10, name: 'changed' });
            unitOfWork.registerClean(cleanOrder);
            unitOfWork.registerClean(cleanAddress);
            unitOfWork.registerClean(cleanDelivery);
            manager.getIdentityMap().register(cleanOrder, EntityProxy_1.EntityProxy.patchEntity(cleanOrder, manager));
            manager.getIdentityMap().register(cleanDelivery, EntityProxy_1.EntityProxy.patchEntity(cleanDelivery, manager));
            let addressProxy = EntityProxy_1.EntityProxy.patchEntity(cleanAddress, manager);
            addressProxy.activateProxying();
            manager.getIdentityMap().register(cleanAddress, addressProxy);
            let populatedAddress = populator.assign(Address_1.Address, dataToPopulate, null, true);
            let dataToPopulateCollection = new ArrayCollection_1.ArrayCollection;
            dataToPopulateCollection.push(dataToPopulate);
            unitOfWork.prepareCascades();
            let addressEntityState = MetaData_1.MetaData.forInstance(addressProxy).fetch('entityState');
            chai_1.assert.deepEqual(populatedAddress, dataToPopulate);
            chai_1.assert.deepEqual(populatedAddress['deliveries'][1], { created: 'todaaaaaay', order: { id: 10, name: 'changed' } });
            chai_1.assert.instanceOf(populatedAddress, Address_1.Address);
            chai_1.assert.equal(addressEntityState.state, UnitOfWork_1.UnitOfWork.STATE_DIRTY);
            chai_1.assert.deepEqual(addressEntityState.dirty, ['country']);
            chai_1.assert.strictEqual(populatedAddress, addressProxy);
            chai_1.assert.strictEqual(unitOfWork.getNewObjects().length, 2);
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), dataToPopulateCollection);
            chai_1.assert.strictEqual(unitOfWork.getDirtyObjects().length, 1);
            chai_1.assert.strictEqual(unitOfWork.getRelationshipsChangedObjects().length, 3);
        });
        it('should listen to the recursion level passed in', () => {
            let wetland = new Wetland_1.Wetland({ mapping: { defaults: { cascades: ['persist'] } } });
            let manager = wetland.getManager();
            let populator = wetland.getPopulator(manager);
            let cleanDelivery = new Delivery_1.Delivery;
            let cleanAddress = new Address_1.Address;
            let dataToPopulate = {
                id: 1337,
                street: 'I lack imagination',
                houseNumber: 1,
                postcode: '1234ab',
                country: 'Land',
                deliveries: [
                    { id: 1, order: { name: 'an order' } },
                    { created: 'todaaaaaay', order: { id: 10, name: 'changed' } }
                ]
            };
            let expectedData = {
                id: 1337,
                street: 'I lack imagination',
                houseNumber: 1,
                postcode: '1234ab',
                country: 'Land',
                deliveries: [{ id: 1 }, { created: 'todaaaaaay' }]
            };
            wetland.registerEntities([Address_1.Address, Delivery_1.Delivery, Order_1.Order]);
            Object.assign(cleanAddress, {
                id: 1337,
                street: 'I lack imagination',
                houseNumber: 1,
                postcode: '1234ab',
                country: 'Country',
                deliveries: [cleanDelivery]
            });
            let populatedAddress = populator.assign(Address_1.Address, dataToPopulate, null, 1);
            let populatedAddressDeep = populator.assign(Address_1.Address, dataToPopulate, null, 2);
            chai_1.assert.deepEqual(populatedAddress, expectedData);
            chai_1.assert.deepEqual(populatedAddressDeep, dataToPopulate);
        });
    });
});
