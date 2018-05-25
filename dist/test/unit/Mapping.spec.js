"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mapping_1 = require("../../src/Mapping");
const ToUnderscore_1 = require("../resource/entity/ToUnderscore");
const product_1 = require("../resource/entity/shop/product");
const category_1 = require("../resource/entity/shop/category");
const user_1 = require("../resource/entity/shop/user");
const Foo_1 = require("../resource/entity/Foo");
const book_1 = require("../resource/entity/book/book");
const publisher_1 = require("../resource/entity/book/publisher");
const EntityRepository_1 = require("../../src/EntityRepository");
const Wetland_1 = require("../../src/Wetland");
const chai_1 = require("chai");
let wetland = new Wetland_1.Wetland({
    mapping: {
        defaultNamesToUnderscore: true
    },
    entities: [ToUnderscore_1.ToUnderscore, product_1.Product, user_1.User]
});
let wetland2 = new Wetland_1.Wetland({
    entities: [Foo_1.FooEntity]
});
let wetlandCascades = new Wetland_1.Wetland({
    entities: [book_1.Book, publisher_1.Publisher, product_1.Product, user_1.User],
    mapping: {
        defaults: { cascades: ['persist'] }
    }
});
function getMapping(wetland, entity) {
    return wetland.getEntityManager().getMapping(entity);
}
describe('Mapping', () => {
    describe('forEntity()', () => {
        it('should get the mapping for a specific entity', () => {
            chai_1.assert.instanceOf(Mapping_1.Mapping.forEntity(ToUnderscore_1.ToUnderscore), Mapping_1.Mapping);
        });
        it('should return an new mapping instance if no mapping was found', () => {
            chai_1.assert.instanceOf(Mapping_1.Mapping.forEntity(new Foo_1.FooEntity()), Mapping_1.Mapping);
        });
    });
    describe('.getTarget()', () => {
        it('should return the entity this mapping is for', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.deepEqual(mapping.getTarget(), ToUnderscore_1.ToUnderscore);
        });
    });
    describe('.setEntityManager()', () => {
        it('should set the entity manager and apply staged mappings', () => {
            let mapping = new Mapping_1.Mapping(Foo_1.FooEntity);
            let entityManager = wetland.getEntityManager();
            let entity = {
                repository: EntityRepository_1.EntityRepository,
                name: 'FooEntity',
                tableName: 'foo_entity',
                store: null
            };
            chai_1.assert.isUndefined(mapping['entityManager']);
            chai_1.assert.lengthOf(mapping['stagedMappings'], 1);
            chai_1.assert.isNull(mapping.getMappingData().fetch('entity'));
            mapping.setEntityManager(entityManager);
            chai_1.assert.deepEqual(mapping['entityManager'], entityManager);
            chai_1.assert.lengthOf(mapping['stagedMappings'], 0);
            chai_1.assert.deepEqual(mapping.getMappingData().fetch('entity'), entity);
        });
    });
    describe('.field()', () => {
        it('should replace case to underscore by default and add the options', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let camel = {
                name: 'camel_case_to_underscore',
                type: 'string',
                size: 20
            };
            let pascal = {
                name: 'pascal_to_underscore',
                type: 'integer'
            };
            chai_1.assert.deepEqual(mapping.getField('camelCaseToUnderscore'), camel);
            chai_1.assert.deepEqual(mapping.getField('PascalToUnderscore'), pascal);
        });
        it('should not duplicate underscores on properties containing both underscore and case', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getField('camelCaseAnd_underscore').name, 'camel_case_and_underscore');
        });
        it('should not underscore custom property names', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getField('customName').name, 'customColumnName');
        });
        it('should not change underscored lower case property names', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getField('already_underscore').name, 'already_underscore');
        });
        it('should set column name to the property name', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let columnNames = {
                camel_case_to_underscore: 'camelCaseToUnderscore',
                pascal_to_underscore: 'PascalToUnderscore',
                already_underscore: 'already_underscore',
                customColumnName: 'customName',
                camel_case_and_underscore: 'camelCaseAnd_underscore',
                underscore_id: 'id'
            };
            chai_1.assert.deepEqual(mapping.getMappingData().fetch('columns'), columnNames);
        });
        it('should keep casing if `defaultNamesToUnderscore` is set to false', () => {
            let mapping = getMapping(wetland2, Foo_1.FooEntity);
            let columnName = {
                camelCase: 'camelCase',
                PascalCase: 'PascalCase'
            };
            chai_1.assert.deepEqual(mapping.getMappingData().fetch('columns'), columnName);
        });
    });
    describe('.completeMapping()', () => {
        it('should complete mapping with cascades option from wetland config', function () {
            let manager = wetlandCascades.getEntityManager();
            let mapping = getMapping(wetlandCascades, book_1.Book).setEntityManager(manager);
            let field = mapping.getField('publisher');
            let joinColumn = {
                name: 'publisher_id',
                referencedColumnName: 'id',
                unique: false,
                nullable: false
            };
            mapping.completeMapping();
            chai_1.assert.deepEqual(field.cascades, ['persist']);
            chai_1.assert.deepEqual(field.joinColumn, joinColumn);
        });
        it('should overwrite default cascades option', function () {
            let manager = wetlandCascades.getEntityManager();
            let mapping = getMapping(wetlandCascades, user_1.User).setEntityManager(manager);
            let field = mapping.getField('profile');
            mapping.completeMapping();
            chai_1.assert.sameMembers(field.cascades, ['persist', 'delete']);
        });
    });
    describe('.getRepository()', () => {
        it('should get the repository class for this mapping entity', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.deepEqual(mapping.getRepository(), EntityRepository_1.EntityRepository);
        });
    });
    describe('.getColumnName()', () => {
        it('should get the column name for a property', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getColumnName('camelCaseToUnderscore'), 'camel_case_to_underscore');
        });
    });
    describe('.getPropertyName()', () => {
        it('should get the property name for a column name', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getPropertyName('camel_case_to_underscore'), 'camelCaseToUnderscore');
        });
    });
    describe('.entity()', () => {
        it('should map entity with default options', () => {
            let mapping = getMapping(wetland2, Foo_1.FooEntity);
            mapping.entity({});
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.name'), 'FooEntity');
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.repository'), EntityRepository_1.EntityRepository);
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.tableName'), 'fooentity');
            chai_1.assert.isNull(mapping.getMappingData().fetch('entity.store'));
        });
        it('should map custom options for an entity', () => {
            let mapping = getMapping(wetland2, Foo_1.FooEntity);
            let options = {
                name: 'foo_custom_name',
                tableName: 'custom_table_name',
                store: 'myStore'
            };
            mapping.entity(options);
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.name'), options.name);
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.tableName'), options.tableName);
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.store'), options.store);
        });
        it('should map an entity with default names set to underscore', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            mapping.entity({});
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.name'), 'ToUnderscore');
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('entity.tableName'), 'to_underscore');
        });
    });
    describe('.index()', () => {
        it('should map an single index with default index name', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let index = { idx_to_underscore_camel_case_to_underscore: ['camel_case_to_underscore'] };
            mapping.index('camelCaseToUnderscore');
            chai_1.assert.deepEqual(mapping.getIndexes(), index);
        });
        it('should map indexes using a custom index name', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let indexes = ['customName', 'already_underscore'];
            let expected = {
                idx_to_underscore_camel_case_to_underscore: ['camel_case_to_underscore'],
                myIndex: ['customColumnName', 'already_underscore']
            };
            mapping.index('myIndex', indexes);
            chai_1.assert.deepEqual(mapping.getIndexes(), expected);
        });
    });
    describe('.getIndexes()', () => {
        it('should get the indexes', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let indexes = {
                idx_to_underscore_camel_case_to_underscore: ['camel_case_to_underscore'],
                myIndex: ['customColumnName', 'already_underscore']
            };
            chai_1.assert.deepEqual(mapping.getIndexes(), indexes);
        });
    });
    describe('.primary()', () => {
        it('should map a property to be the primary key', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getMappingData().fetch('primary'), 'id');
        });
    });
    describe('.getPrimaryKeyField()', () => {
        it('should get the column name for the primary key', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getPrimaryKeyField(), 'underscore_id');
        });
    });
    describe('.getPrimaryKey()', () => {
        it('should get the property that has be assigned as the primary key', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getPrimaryKey(), 'id');
        });
    });
    describe('.getFieldName()', () => {
        it('should get the column name of the property', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getFieldName('customName'), 'customColumnName');
        });
    });
    describe('.getFields()', () => {
        it('should get the fields for mapped entity', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let fields = {
                id: {
                    primary: true,
                    generatedValue: 'autoIncrement',
                    name: 'underscore_id'
                },
                camelCaseToUnderscore: {
                    name: 'camel_case_to_underscore',
                    type: 'string',
                    size: 20
                },
                PascalToUnderscore: {
                    name: 'pascal_to_underscore',
                    type: 'integer'
                },
                already_underscore: {
                    name: 'already_underscore',
                    type: 'boolean'
                },
                camelCaseAnd_underscore: {
                    name: 'camel_case_and_underscore',
                    type: 'boolean'
                },
                customName: {
                    name: 'customColumnName',
                    type: 'string'
                }
            };
            chai_1.assert.deepEqual(mapping.getFields(), fields);
        });
    });
    describe('.getEntityName()', () => {
        it('should get the name of the entity', () => {
            let mapping = getMapping(wetland2, Foo_1.FooEntity);
            chai_1.assert.strictEqual(mapping.getEntityName(), 'foo_custom_name');
        });
    });
    describe('.getTableName()', () => {
        it('should get the name of the table', () => {
            let mapping = getMapping(wetland2, Foo_1.FooEntity);
            chai_1.assert.strictEqual(mapping.getTableName(), 'custom_table_name');
        });
    });
    describe('.getStoreName()', () => {
        it('should get the store mapped to this entity', () => {
            let mapping = getMapping(wetland2, Foo_1.FooEntity);
            chai_1.assert.strictEqual(mapping.getStoreName(), 'myStore');
        });
    });
    describe('.generatedValue()', () => {
        it('should map generated values', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.isNotNull(mapping.getField('id').generatedValue);
        });
    });
    describe('.increments()', () => {
        it('should set auto increment', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            chai_1.assert.strictEqual(mapping.getField('id').generatedValue, 'autoIncrement');
        });
    });
    describe('.uniqueConstraint()', () => {
        it('should map a unique constraint', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let expected = { to_underscore_underscore_id_unique: ['underscore_id'] };
            mapping.uniqueConstraint('id');
            chai_1.assert.deepEqual(mapping.getUniqueConstraints(), expected);
        });
        it('should map a unique constraint with custom name', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let expected = {
                to_underscore_underscore_id_unique: ['underscore_id'],
                custom_unique: ['already_underscore']
            };
            mapping.uniqueConstraint('custom_unique', 'already_underscore');
            chai_1.assert.deepEqual(mapping.getUniqueConstraints(), expected);
        });
    });
    describe('.getUniqueConstraints()', () => {
        it('should get unique constraints', () => {
            let mapping = getMapping(wetland, ToUnderscore_1.ToUnderscore);
            let unique = {
                to_underscore_underscore_id_unique: ['underscore_id'],
                custom_unique: ['already_underscore']
            };
            chai_1.assert.deepEqual(mapping.getUniqueConstraints(), unique);
        });
    });
    describe('.cascade()', () => {
        it('should set cascade values', () => {
            let mapping = getMapping(wetland, product_1.Product);
            chai_1.assert.sameMembers(mapping.getField('categories').cascades, ['persist']);
        });
    });
    describe('.isRelation()', () => {
        it('should return true if property exist as relation', () => {
            let mapping = getMapping(wetland, product_1.Product);
            chai_1.assert.isTrue(mapping.isRelation('author'));
        });
        it('should return false if property does not exist as a relation', () => {
            let mapping = getMapping(wetland, product_1.Product);
            chai_1.assert.isFalse(mapping.isRelation('name'));
        });
    });
    describe('.getRelations()', () => {
        it('should get the relations for mapped entity', () => {
            let mapping = getMapping(wetland, product_1.Product);
            let relations = {
                image: {
                    type: 'oneToOne',
                    targetEntity: 'Image'
                },
                categories: {
                    type: 'manyToMany',
                    targetEntity: category_1.Category,
                    inversedBy: 'products'
                },
                author: {
                    type: 'manyToOne',
                    targetEntity: user_1.User,
                    inversedBy: 'products'
                }
            };
            chai_1.assert.deepEqual(mapping.getRelations(), relations);
        });
    });
    describe('.oneToOne()', () => {
        it('should map a one-to-one relationship', () => {
            let mapping = getMapping(wetland, product_1.Product);
            let relations = mapping.getRelations();
            chai_1.assert.strictEqual(relations['image'].type, 'oneToOne');
        });
    });
    describe('.oneToMany()', () => {
        it('should map a one-to-many relationship', () => {
            let mapping = getMapping(wetland, user_1.User);
            let relations = mapping.getRelations();
            chai_1.assert.strictEqual(relations['products'].type, 'oneToMany');
        });
    });
    describe('.manyToOne()', () => {
        it('should map a many-to-one relationship', () => {
            let mapping = getMapping(wetland, product_1.Product);
            let relations = mapping.getRelations();
            chai_1.assert.strictEqual(relations['author'].type, 'manyToOne');
        });
    });
    describe('.manyToMany()', () => {
        it('should map a many-to-many relationship', () => {
            let mapping = getMapping(wetland, product_1.Product);
            let relations = mapping.getRelations();
            chai_1.assert.strictEqual(relations['categories'].type, 'manyToMany');
        });
    });
    describe('.joinTable(), .getJoinTables()', () => {
        it('should register a join table and fetch all join tables registered', () => {
            let mapping = getMapping(wetland, product_1.Product);
            let joinTable = {
                complete: true,
                name: 'product_custom_join_category',
                joinColumns: [{ referencedColumnName: 'id', name: 'product_id', type: 'integer' }],
                inverseJoinColumns: [{ referencedColumnName: 'id', name: 'category_id', type: 'integer' }]
            };
            chai_1.assert.deepEqual(mapping.getJoinTable('categories'), joinTable);
        });
    });
    describe('.joinColumn(), .getJoinColumn()', () => {
        it('should register a join column and fetch said column via property', () => {
            let mapping = getMapping(wetland, product_1.Product);
            let joinColumn = {
                name: 'author_id',
                referencedColumnName: 'id',
                unique: false,
                nullable: true
            };
            chai_1.assert.deepEqual(mapping.getJoinColumn('author'), joinColumn);
        });
    });
    describe('.getJoinTable()', () => {
        it('should get the join table for the relationship mapped via property', () => {
            let mapping = getMapping(wetland, product_1.Product);
            let joinTable = {
                name: 'product_custom_join_category',
                complete: true,
                joinColumns: [{ referencedColumnName: 'id', name: 'product_id', type: 'integer' }],
                inverseJoinColumns: [{ referencedColumnName: 'id', name: 'category_id', type: 'integer' }]
            };
            chai_1.assert.deepEqual(mapping.getJoinTable('categories'), joinTable);
        });
    });
});
