"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Migration {
    static up(migration) {
        let schemaBuilder = migration.getSchemaBuilder();
        schemaBuilder.createTable('ticket', tableBuilder => {
            tableBuilder.increments();
            tableBuilder.string('name');
        });
    }
    static down(migration) {
        let schemaBuilder = migration.getSchemaBuilder();
        schemaBuilder.dropTable('ticket');
    }
}
exports.Migration = Migration;
