import { Criteria } from './Criteria';
export declare class Having extends Criteria {
    protected conditions: {
        and: string;
        or: string;
    };
}
