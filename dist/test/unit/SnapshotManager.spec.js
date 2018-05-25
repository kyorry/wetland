"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Wetland_1 = require("../../src/Wetland");
const SchemaBuilder_1 = require("../../src/SchemaBuilder");
const old_1 = require("../resource/entity/snapshot/old");
const new_1 = require("../resource/entity/snapshot/new");
const book_1 = require("../resource/entity/book/book");
const publisher_1 = require("../resource/entity/book/publisher");
function getWetland(entities) {
    let wetland = new Wetland_1.Wetland({
        stores: {
            defaultStore: {
                client: 'mysql',
                connection: {
                    user: 'root',
                    host: '127.0.0.1',
                    database: 'wetland_test'
                }
            }
        }
    });
    if (entities) {
        wetland.registerEntities(entities);
    }
    return wetland;
}
function getMapping(entities) {
    return getWetland(entities).getSnapshotManager().getSerializable();
}
describe('SnapshotManager', () => {
    describe('diff(fk): change foreign key', () => {
        it('Should drop the old foreign key and create a new one', () => {
            let oldMapping = getMapping(old_1.default), newMapping = getMapping(new_1.default);
            let wetland = getWetland(), snapshotManager = wetland.getSnapshotManager(), schemaBuilder = new SchemaBuilder_1.SchemaBuilder(wetland.getManager());
            let diff = snapshotManager.diff(oldMapping, newMapping);
            let sqlStatement = schemaBuilder.process(diff).getSQL().split('\n');
            chai_1.assert.equal(sqlStatement[0], 'alter table `media` drop foreign key `media_offer_id_foreign`;');
            chai_1.assert.equal(sqlStatement[1], 'alter table `media` add constraint `media_offer_id_foreign` foreign key (`offer_id`) references `offer` (`id`) on delete cascade');
        });
    });
    describe('diff(jc): create join column', () => {
        it('Should be able to create a non null foreign key', () => {
            let oldMapping = getMapping([]), newMapping = getMapping([book_1.Book, publisher_1.Publisher]);
            let wetland = getWetland(), snapshotManager = wetland.getSnapshotManager(), schemaBuilder = new SchemaBuilder_1.SchemaBuilder(wetland.getManager());
            let diff = snapshotManager.diff(oldMapping, newMapping);
            let sqlStatement = schemaBuilder.process(diff).getSQL().split('\n');
            chai_1.assert.equal(sqlStatement[1], 'create table `publisher` (`id` int unsigned not null auto_increment primary key, `name` varchar(24) not null);');
            chai_1.assert.equal(sqlStatement[0], 'create table `book` (`id` int unsigned not null auto_increment primary key, `name` varchar(24) not null, `publisher_id` int unsigned not null);');
        });
    });
});
