"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Wetland_1 = require("../../src/Wetland");
const Hydrator_1 = require("../../src/Hydrator");
const User_1 = require("../resource/entity/postal/User");
const chai_1 = require("chai");
function getHydrator() {
    return new Hydrator_1.Hydrator(getManager());
}
function getManager() {
    let wetland = new Wetland_1.Wetland();
    return wetland.getManager();
}
describe('Hydrator', () => {
    describe('.consturctor()', () => {
        it('should define constructor properties', () => {
            let hydrator = getHydrator();
            chai_1.assert.property(hydrator, 'unitOfWork');
            chai_1.assert.property(hydrator, 'entityManager');
            chai_1.assert.property(hydrator, 'identityMap');
        });
    });
    describe('.fromSchema()', () => {
        it('should map to entities', () => {
            let entity = getHydrator().fromSchema({
                name: 'foo'
            }, User_1.User);
            chai_1.assert.propertyVal(entity, 'name', 'foo');
        });
        it('should not map invalid value to entities', () => {
            let entity = getHydrator().fromSchema({
                bar: 'foo'
            }, User_1.User);
            chai_1.assert.notProperty(entity, 'bar');
        });
        it('should map to entities with empty object', () => {
            let entity = getHydrator().fromSchema({
                name: 'foo'
            }, {});
            chai_1.assert.notProperty(entity, 'name');
        });
    });
    describe('.addRecipe', () => {
        it('should add a recipe', () => {
            let recipe = getHydrator().addRecipe(null, 'foo', getManager().getMapping(User_1.User), 'single');
            chai_1.assert.deepEqual(recipe.primaryKey, { alias: 'foo.id', property: 'id' });
            chai_1.assert.isNull(recipe.parent);
            chai_1.assert.isFalse(recipe.hydrate);
            chai_1.assert.equal(recipe.type, 'single');
            chai_1.assert.isObject(recipe.columns);
            chai_1.assert.isUndefined(recipe.property);
            chai_1.assert.equal(recipe.alias, 'foo');
        });
    });
});
