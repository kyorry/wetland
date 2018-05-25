"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UnitOfWork_1 = require("./UnitOfWork");
const Mapping_1 = require("./Mapping");
const ArrayCollection_1 = require("./ArrayCollection");
const homefront_1 = require("homefront");
const fs = require("fs");
const parse = require("csv-parse");
const path = require("path");
const Bluebird = require("bluebird");
class Seeder {
    constructor(wetland) {
        this.config = new homefront_1.Homefront();
        this.wetland = wetland;
        this.config = this.config.merge(wetland.getConfig().fetch('seed'));
    }
    /**
     * Bulk features insertion.
     *
     * @param {string} entityName
     * @param {Array<Object>} features
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    cleanlyInsertFeatures(entityName, features, bypassLifecyclehooks) {
        const manager = this.wetland.getManager();
        const unitOfWork = manager.getUnitOfWork();
        const populator = this.wetland.getPopulator(manager);
        const Entity = manager.getEntity(entityName);
        const entities = new ArrayCollection_1.ArrayCollection();
        features.forEach(feature => {
            let entity = populator.assign(Entity, feature);
            unitOfWork.setEntityState(entity, UnitOfWork_1.UnitOfWork.STATE_NEW);
            entities.push(entity);
        });
        return manager.persist(...entities).flush(false, bypassLifecyclehooks);
    }
    /**
     * Safe (no duplicate) features insertion going through the lifecylehooks.
     *
     * @param {string} entityName
     * @param {Array<Object>} features
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    safelyInsertFeatures(entityName, features, bypassLifecyclehooks) {
        const manager = this.wetland.getManager();
        const unitOfWork = manager.getUnitOfWork();
        const populator = this.wetland.getPopulator(manager);
        const Entity = manager.getEntity(entityName);
        const correctFields = Mapping_1.Mapping.forEntity(Entity).getFieldNames();
        const entityRepository = manager.getRepository(Entity);
        const queries = [];
        features.forEach(feature => {
            let target = {};
            Reflect.ownKeys(feature).forEach((field) => {
                if (correctFields.includes(field)) {
                    target[field] = feature[field];
                }
            });
            queries.push(entityRepository.findOne(target).then(response => {
                if (!response) {
                    let populated = populator.assign(Entity, feature);
                    unitOfWork.setEntityState(populated, UnitOfWork_1.UnitOfWork.STATE_NEW);
                    return Promise.resolve(populated);
                }
                return Promise.resolve(null);
            }));
        });
        return Promise.all(queries).then((entities) => {
            entities = entities.filter(e => e != null);
            if (!entities.length) {
                return Promise.resolve();
            }
            return manager.persist(...entities).flush(false, bypassLifecyclehooks);
        });
    }
    /**
     * Seed features according to options.
     *
     * @param {string} entityName
     * @param {Array<Object>} features
     * @param {boolean} clean
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    seedFeatures(entityName, features, clean, bypassLifecyclehooks) {
        if (clean) {
            return this.cleanlyInsertFeatures(entityName, features, bypassLifecyclehooks);
        }
        return this.safelyInsertFeatures(entityName, features, bypassLifecyclehooks);
    }
    /**
     * Seed from file.
     *
     * @param {string} src
     * @param {string} file
     * @param {boolean} clean
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    seedFile(src, file, clean, bypassLifecyclehooks) {
        const readFile = Bluebird.promisify(fs.readFile);
        return readFile(path.join(src, file), 'utf8')
            .then(data => {
            let [entityName, extension] = file.split('.'); // Very naive **might** need better
            if (extension === 'json') {
                let features = JSON.parse(data);
                return this.seedFeatures(entityName, features, clean, bypassLifecyclehooks);
            }
            if (extension === 'csv') {
                const parseP = Bluebird.promisify(parse);
                return parseP(data, { columns: true })
                    .then(features => this.seedFeatures(entityName, features, clean, bypassLifecyclehooks));
            }
            return Promise.resolve();
        });
    }
    /**
     * Seed files contained in the fixtures directory.
     *
     * @return {Promise}
     */
    seed() {
        if (!this.config) {
            return Promise.reject(new Error('Seed configuration is not valid.'));
        }
        const fixturesDirectory = this.config.fetch('fixturesDirectory');
        if (!fixturesDirectory) {
            return Promise.reject(new Error('Seed configuration is not complete.'));
        }
        const bypassLifecyclehooks = this.config.fetchOrPut('bypassLifecyclehooks', false);
        const clean = this.config.fetchOrPut('clean', false);
        const readDir = Bluebird.promisify(fs.readdir);
        return readDir(fixturesDirectory)
            .then(files => {
            const readers = [];
            files.forEach(file => {
                readers.push(this.seedFile(fixturesDirectory, file, clean, bypassLifecyclehooks));
            });
            return Promise.all(readers);
        });
    }
}
exports.Seeder = Seeder;
