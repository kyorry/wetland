/**
 * Represents Array collections.
 */
export declare class ArrayCollection<T> extends Array {
    /**
     * Add items to the collection when not already in the collection.
     *
     * @param {...*} items
     *
     * @returns this Fluent interface
     */
    add(...items: Array<any>): ArrayCollection<T>;
    /**
     * Loop over each item in the collection, without worrying about index changes.
     *
     * @param {Function} callback
     *
     * @returns {ArrayCollection}
     */
    each(callback: (target: any) => void): ArrayCollection<T>;
    /**
     * Remove items from the collection when part of the collection.
     *
     * @param {...*} items
     *
     * @returns this Fluent interface
     */
    remove(...items: Array<any>): ArrayCollection<T>;
}
