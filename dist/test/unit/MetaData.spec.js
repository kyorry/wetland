"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Wetland_1 = require("../../src/Wetland");
const MetaData_1 = require("../../src/MetaData");
const Mapping_1 = require("../../src/Mapping");
const product_1 = require("../resource/entity/shop/product");
const homefront_1 = require("homefront");
const EntityProxy_1 = require("../../src/EntityProxy");
function getUnitOfWork(entity) {
    let wetland = new Wetland_1.Wetland;
    if (entity) {
        wetland.registerEntity(product_1.Product);
    }
    return wetland.getManager().getUnitOfWork();
}
describe('forTarget()', () => {
    it('should get metadata for provided target', () => {
        let metaData = MetaData_1.MetaData.forTarget(product_1.Product);
        chai_1.assert.isTrue(MetaData_1.MetaData['metaMap'].has(product_1.Product));
        chai_1.assert.instanceOf(metaData, homefront_1.Homefront);
        chai_1.assert.instanceOf(metaData.fetch('mapping'), Mapping_1.Mapping);
    });
});
describe('ensure', () => {
    it('should ensure metadata', () => {
        let metaData = MetaData_1.MetaData.forTarget(product_1.Product);
        chai_1.assert.isTrue(MetaData_1.MetaData['metaMap'].has(product_1.Product));
        chai_1.assert.instanceOf(metaData, homefront_1.Homefront);
    });
});
describe('forInstance()', () => {
    it('should get metadata for provided instance', () => {
        let unitOfWork = getUnitOfWork(product_1.Product);
        let proxied = EntityProxy_1.EntityProxy.patchEntity(new product_1.Product, unitOfWork.getEntityManager());
        unitOfWork.registerNew(proxied.getTarget());
        proxied.activateProxying();
        let metadata = MetaData_1.MetaData.forInstance(proxied);
        chai_1.assert.strictEqual(metadata.fetch('entityState.state'), 'new');
    });
});
describe('clear()', () => {
    it('should clear metadata for provided targets', () => {
        chai_1.assert.isTrue(MetaData_1.MetaData['metaMap'].has(product_1.Product));
        MetaData_1.MetaData.clear(product_1.Product);
        chai_1.assert.isFalse(MetaData_1.MetaData['metaMap'].has(product_1.Product));
    });
});
