import { Profile } from './Profile';
import { Mapping } from '../../../../src/Mapping';
export declare class User {
    name: string;
    profile: Profile;
    static setMapping(mapping: Mapping<User>): void;
}
