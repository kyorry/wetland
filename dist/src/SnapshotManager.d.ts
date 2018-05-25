/// <reference types="bluebird" />
import * as Bluebird from 'bluebird';
import { Wetland } from './index';
export declare class SnapshotManager {
    /**
     * @type {Wetland}
     */
    private wetland;
    /**
     * @type {EntityManager}
     */
    private entityManager;
    /**
     * @type {{}}
     */
    private config;
    static SNAPSHOTS_PATH: string;
    static DEV_SNAPSHOTS_PATH: string;
    /**
     * Construct a new SnapshotManager manager.
     *
     * @param {Wetland} wetland
     */
    constructor(wetland: Wetland);
    /**
     * Create a new snapshot.
     *
     * @param {string}  name
     * @param {boolean} devSnapshot
     *
     * @returns {Bluebird}
     */
    create(name?: string, devSnapshot?: boolean): Bluebird<any>;
    /**
     * Remove an existing snapshot.
     *
     * @param {string}  name
     * @param {boolean} devSnapshot
     *
     * @returns {Bluebird}
     */
    remove(name?: string, devSnapshot?: boolean): Bluebird<any>;
    /**
     * Fetch a snapshot's contents.
     *
     * @param {string}  name
     * @param {boolean} devSnapshot
     *
     * @returns {Bluebird}
     */
    fetch(name?: string, devSnapshot?: boolean): Bluebird<any>;
    /**
     * Resolve to file location.
     *
     * @param {string}  name
     * @param {boolean} devSnapshot
     *
     * @returns {string}
     */
    private fileLocation(name, devSnapshot);
    /**
     * Serialize and return the mappings.
     *
     * @returns {string}
     */
    serializeMappings(): string;
    /**
     * Get the current mappings in serializable format.
     *
     * @returns {{}}
     */
    getSerializable(): Object;
    /**
     * Diff two mappings.
     *
     * @param {{}} oldMapping
     * @param {{}} newMapping
     *
     * @returns {Object}
     */
    diff(oldMapping: Object, newMapping: Object): Object;
    /**
     * Do some post-diffing operations on drafted instructions.
     *
     * @param {{}} instructions
     *
     * @returns {{}}}
     */
    private postDiffingOperations(instructions);
    /**
     * Make sure the snapshot directory exists.
     */
    private ensureSnapshotDirectory();
}
