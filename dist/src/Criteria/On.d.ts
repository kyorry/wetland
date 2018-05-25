import { Criteria } from './Criteria';
export declare class On extends Criteria {
    protected conditions: {
        and: string;
        or: string;
    };
}
