"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityProxy_1 = require("../../src/EntityProxy");
const chai_1 = require("chai");
const UnitOfWork_1 = require("../../src/UnitOfWork");
const Wetland_1 = require("../../src/Wetland");
const Simple_1 = require("../resource/entity/Simple");
const Parent_1 = require("../resource/entity/Parent");
const SimpleDifferent_1 = require("../resource/entity/SimpleDifferent");
const ArrayCollection_1 = require("../../src/ArrayCollection");
const MetaData_1 = require("../../src/MetaData");
function getUnitOfWork(entities) {
    let wetland = new Wetland_1.Wetland({});
    if (entities) {
        wetland.registerEntities(entities);
    }
    return wetland.getManager().getUnitOfWork();
}
describe('EntityProxy', () => {
    describe('static .patchEntity()', () => {
        it('should patch an entity, and be disabled by default', () => {
            let unitOfWork = getUnitOfWork();
            let entityManager = unitOfWork.getEntityManager();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, entityManager);
            chai_1.assert.strictEqual(patched.isEntityProxy, true);
            chai_1.assert.strictEqual(patched.isProxyingActive(), false);
            unitOfWork.registerClean(patched.getTarget());
            patched.activateProxying();
            chai_1.assert.strictEqual(patched.isProxyingActive(), true);
        });
        it('should patch the collections on an un-patched entity', () => {
            let unitOfWork = getUnitOfWork([Parent_1.Parent]);
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            chai_1.assert.strictEqual(patched.simples['isCollectionProxy'], true);
        });
        it('should throw an error when an entity of the wrong type was supplied for one relation', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            let simple = new SimpleDifferent_1.SimpleDifferent;
            unitOfWork.registerClean(parent);
            patched.activateProxying();
            chai_1.assert.throws(() => {
                patched.single = simple;
            }, "Can't assign to 'Parent.single'. Expected instance of 'Simple'.");
        });
        it('should throw an error when an entity of the wrong type was supplied for many relation', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            let simple = new SimpleDifferent_1.SimpleDifferent;
            unitOfWork.registerClean(parent);
            patched.activateProxying();
            chai_1.assert.throws(() => {
                patched.simples.push(simple);
            }, "Can't add to 'Parent.simples'. Expected instance of 'Simple'.");
        });
        it('should register collection changes when adding an entity to a collection', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            let simple = new Simple_1.Simple;
            let simpleTwo = new Simple_1.Simple;
            simple.name = 'hello';
            simpleTwo.name = 'world';
            patched.name = 'Simple test';
            unitOfWork.registerClean(parent);
            patched.activateProxying();
            chai_1.assert.deepEqual(unitOfWork.getRelationshipsChangedObjects(), new ArrayCollection_1.ArrayCollection);
            patched.simples.add(simple);
            patched.simples.add(simpleTwo);
            let patchedCollection = new ArrayCollection_1.ArrayCollection();
            patchedCollection.push(patched);
            chai_1.assert.deepEqual(unitOfWork.getRelationshipsChangedObjects(), patchedCollection);
        });
        it('should properly detect date changes', () => {
            const unitOfWork = getUnitOfWork();
            const target = EntityProxy_1.EntityProxy.patchEntity(new Simple_1.Simple, unitOfWork.getEntityManager());
            const dateConstant = new Date;
            const compare = new ArrayCollection_1.ArrayCollection;
            compare.add(target);
            target.name = 'date test';
            target.dateOfBirth = dateConstant;
            unitOfWork.registerClean(target, true);
            target.activateProxying();
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), new ArrayCollection_1.ArrayCollection);
            target.dateOfBirth = new Date;
            // Should remain clean
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), compare);
        });
        it('should leave alone dates that are the same', () => {
            const unitOfWork = getUnitOfWork([Simple_1.Simple]);
            const target = EntityProxy_1.EntityProxy.patchEntity(new Simple_1.Simple, unitOfWork.getEntityManager());
            const dateConstant = new Date;
            const dateClone = new Date(dateConstant);
            target.name = 'date test';
            target.dateOfBirth = dateConstant;
            unitOfWork.registerClean(target, true);
            target.activateProxying();
            chai_1.assert.strictEqual(dateClone.toString(), dateConstant.toString());
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), new ArrayCollection_1.ArrayCollection);
            chai_1.assert.strictEqual((new Date(dateClone)).toString(), (new Date(dateConstant)).toString());
            target.dateOfBirth = dateClone;
            // Should remain clean
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), new ArrayCollection_1.ArrayCollection);
        });
        it('should register collection changes when adding an entity to a collection extended', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            let simple = new Simple_1.Simple;
            let simpleTwo = EntityProxy_1.EntityProxy.patchEntity(new Simple_1.Simple, unitOfWork.getEntityManager());
            let simpleThree = new Simple_1.Simple;
            simple.name = 'hello';
            simpleTwo.name = 'world';
            simpleThree.name = 'Cake';
            patched.name = 'Simple test';
            parent.simples.add(simple, simpleTwo);
            unitOfWork.registerClean(parent, true);
            unitOfWork.registerClean(simpleTwo, true);
            patched.activateProxying();
            simpleTwo.activateProxying();
            let compareCollection = new ArrayCollection_1.ArrayCollection();
            compareCollection.push(parent, simpleTwo.getTarget());
            chai_1.assert.deepEqual(unitOfWork.getRelationshipsChangedObjects(), new ArrayCollection_1.ArrayCollection);
            chai_1.assert.deepEqual(unitOfWork.getNewObjects(), new ArrayCollection_1.ArrayCollection);
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), new ArrayCollection_1.ArrayCollection);
            chai_1.assert.deepEqual(unitOfWork.getCleanObjects(), compareCollection);
            let meta = MetaData_1.MetaData.forInstance(patched);
            patched.simples.splice(0);
            simpleTwo.name = 'universe';
            let newSimples = new ArrayCollection_1.ArrayCollection;
            newSimples.add(simple, simpleTwo, simpleThree);
            patched.simples = newSimples;
            let metaSimple = MetaData_1.MetaData.forInstance(simpleTwo);
            let simpleTwoCollection = new ArrayCollection_1.ArrayCollection;
            let patchedCollection = new ArrayCollection_1.ArrayCollection;
            patchedCollection.push(patched);
            simpleTwoCollection.push(simpleTwo);
            chai_1.assert.strictEqual(meta.fetch('entityState.relations.added.simples')[0], simpleThree);
            chai_1.assert.deepEqual(meta.fetch('entityState.relations.removed'), {}); // broken
            chai_1.assert.deepEqual(unitOfWork.getDirtyObjects(), simpleTwoCollection);
            chai_1.assert.deepEqual(metaSimple.fetch('entityState.dirty'), ['name']);
            chai_1.assert.deepEqual(unitOfWork.getRelationshipsChangedObjects(), patchedCollection);
        });
        it('should not register collection changes when re-adding an entity to a collection', () => {
            let unitOfWork = getUnitOfWork();
            let parent = new Parent_1.Parent;
            let simple = new Simple_1.Simple;
            simple.name = 'hello';
            parent.simples.push(simple);
            let patched = EntityProxy_1.EntityProxy.patchEntity(parent, unitOfWork.getEntityManager());
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.STATE_UNKNOWN, UnitOfWork_1.UnitOfWork.getObjectState(patched));
            unitOfWork.registerClean(patched);
            patched.activateProxying();
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(patched), UnitOfWork_1.UnitOfWork.STATE_CLEAN);
            // Remove, make it dirty!
            patched.simples.pop();
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isDirty(patched));
            // Add again, clean it up.
            patched.simples.push(simple);
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isClean(patched));
            // Some different ways of adding / removing.
            patched.simples.splice(0, patched.simples.length);
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isDirty(patched));
            patched.simples[0] = simple;
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isClean(patched));
            delete patched.simples[0];
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isDirty(patched));
            patched.simples.unshift(simple);
            chai_1.assert.isTrue(UnitOfWork_1.UnitOfWork.isClean(patched));
            chai_1.assert.strictEqual(UnitOfWork_1.UnitOfWork.getObjectState(patched), UnitOfWork_1.UnitOfWork.STATE_CLEAN);
        });
        it('should disallow deleting toMany values from entity', () => {
            let unitOfWork = getUnitOfWork();
            let patched = unitOfWork.getEntityManager().attach(new Parent_1.Parent);
            chai_1.assert.throws(() => {
                delete patched.simples;
            }, `It is not allowed to delete a collection; trying to delete 'Parent.simples'.`);
        });
    });
});
