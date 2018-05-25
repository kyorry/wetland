import { Mapping } from '../../../../src/Mapping';
import { ArrayCollection } from '../../../../src/ArrayCollection';
import { User } from './User';
export declare class Tracker {
    id: number;
    status: number;
    observers: ArrayCollection<User>;
    static setMapping(mapping: Mapping<Tracker>): void;
}
