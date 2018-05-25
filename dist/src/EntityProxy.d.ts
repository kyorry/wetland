import { ProxyInterface } from './EntityInterface';
import { Scope } from './Scope';
export declare class EntityProxy {
    /**
     * Patch provided entity with a proxy to track changes.
     *
     * @param {EntityInterface} entity
     * @param {Scope}           entityManager
     * @param {boolean}         active
     *
     * @returns {Object}
     */
    static patchEntity<T>(entity: T, entityManager: Scope, active?: boolean): T & ProxyInterface;
}
