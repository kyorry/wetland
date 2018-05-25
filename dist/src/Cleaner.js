"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SnapshotManager_1 = require("./SnapshotManager");
const rm = require("del");
const path = require("path");
const SchemaBuilder_1 = require("./SchemaBuilder");
class Cleaner {
    /**
     * Construct a cleaner instance.
     *
     * @param {Wetland} wetland
     */
    constructor(wetland) {
        this.wetland = wetland;
    }
    /**
     * Clean the dev snapshots in the data directory.
     *
     * @return {Promise<any>}
     */
    cleanDataDirectory() {
        return rm(path.join(this.wetland.getConfig().fetch('dataDirectory'), SnapshotManager_1.SnapshotManager.DEV_SNAPSHOTS_PATH, '*'))
            .catch(error => {
            if (error.code === 'ENOENT') {
                return Promise.resolve();
            }
            return Promise.reject(error);
        });
    }
    /**
     * Drop all tables' entities.
     *
     * @return {Promise<any>}
     */
    dropTables() {
        const manager = this.wetland.getManager();
        const snapshotManager = this.wetland.getSnapshotManager();
        const schemaBuilder = new SchemaBuilder_1.SchemaBuilder(manager);
        return snapshotManager
            .fetch()
            .then(previous => {
            let instructions = snapshotManager.diff(previous, {});
            return schemaBuilder.process(instructions).apply();
        });
    }
    /**
     * Clean wetland's related tables and wetland's dev snapshots'.
     *
     * @return {Promise<any>}
     */
    clean() {
        return this.dropTables()
            .then(() => this.cleanDataDirectory());
    }
}
exports.Cleaner = Cleaner;
