import { ArrayCollection } from '../../../../src/ArrayCollection';
import { Mapping } from '../../../../src/Mapping';
import { Book } from './book';
export declare class Publisher {
    id: number;
    name: string;
    books: ArrayCollection<Book>;
    static setMapping(mapping: Mapping<Publisher>): void;
}
