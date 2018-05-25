import { Scope } from './Scope';
import { EntityCtor } from './EntityInterface';
import { ArrayCollection as Collection } from './ArrayCollection';
export declare class Populate {
    /**
     * @type {Scope}
     */
    private entityManager;
    /**
     * @type {UnitOfWork}
     */
    private unitOfWork;
    constructor(entityManager: Scope);
    /**
     * Find records for update based on provided data.
     *
     * @param {number|string} primaryKey
     * @param {EntityCtor}    Entity
     * @param {{}}            data
     *
     * @returns {Promise<{new()}>}
     */
    findDataForUpdate(primaryKey: string | number, Entity: EntityCtor<{
        new ();
    }>, data: Object): Promise<any>;
    /**
     * Assign data based on a collection.
     *
     * @param {EntityCtor}      Entity
     * @param {{}}              data
     * @param {{}}              [base]
     * @param {boolean|number}  [recursive]
     *
     * @returns {Collection<T>}
     */
    private assignCollection<T>(Entity, data, base?, recursive?);
    /**
     * Assign data to base. Create new if not provided.
     *
     * @param {EntityCtor}      Entity
     * @param {{}}              data
     * @param {{}}              [base]
     * @param {boolean|number}  [recursive]
     *
     * @returns {T}
     */
    assign<T>(Entity: EntityCtor<T>, data: Object, base?: T | Collection<T>, recursive?: boolean | number): T;
}
