import { Mapping } from '../../../../src/Mapping';
import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Tracker } from './Tracker';
export declare class User {
    id: number;
    name: string;
    trackers: ArrayCollection<Tracker>;
    static setMapping(mapping: Mapping<User>): void;
}
