import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Mapping } from '../../../../src/Mapping';
import { Publisher } from './publisher';
export declare class Book {
    id: Number;
    publisher: ArrayCollection<Publisher>;
    name: string;
    static setMapping(mapping: Mapping<Book>): void;
}
