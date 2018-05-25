export interface MigrationsResults {
    baz: string;
    foo: string;
    bar: string;
}
declare let migrations: {
    up?: MigrationsResults;
    down?: MigrationsResults;
    latest?: string;
    revert?: string;
};
export { migrations };
