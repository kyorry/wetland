import { Wetland } from './Wetland';
import { Homefront } from 'homefront';
export declare class Seeder {
    config: Homefront;
    wetland: Wetland;
    constructor(wetland: Wetland);
    /**
     * Bulk features insertion.
     *
     * @param {string} entityName
     * @param {Array<Object>} features
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    private cleanlyInsertFeatures(entityName, features, bypassLifecyclehooks);
    /**
     * Safe (no duplicate) features insertion going through the lifecylehooks.
     *
     * @param {string} entityName
     * @param {Array<Object>} features
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    private safelyInsertFeatures(entityName, features, bypassLifecyclehooks);
    /**
     * Seed features according to options.
     *
     * @param {string} entityName
     * @param {Array<Object>} features
     * @param {boolean} clean
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    private seedFeatures(entityName, features, clean, bypassLifecyclehooks);
    /**
     * Seed from file.
     *
     * @param {string} src
     * @param {string} file
     * @param {boolean} clean
     * @param {boolean} bypassLifecyclehooks
     * @return {Promise<any>}
     */
    private seedFile(src, file, clean, bypassLifecyclehooks);
    /**
     * Seed files contained in the fixtures directory.
     *
     * @return {Promise}
     */
    seed(): Promise<any>;
}
