export declare const tmpTestDir: string;
export declare const dataDir: string;
export declare const fixturesDir: string;
export declare class User {
    static setMapping(mapping: any): void;
}
export declare class Post {
    static setMapping(mapping: any): void;
}
export declare class Pet {
    static setMapping(mapping: any): void;
}
export declare function getType(bypassLifecyclehooks: boolean): string;
export declare function rmDataDir(): Promise<any>;
