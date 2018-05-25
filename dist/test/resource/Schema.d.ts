export declare class Schema {
    static getColumns(connection: any, table?: any): any;
    static getReferentialConstraints(connection: any, table?: any): any;
    static getConstraints(connection: any, table?: any): any;
    static getAllInfo(connection: any, table?: any): Promise<{
        columns: any;
        constraints: any;
        referentialConstraints: any;
    }>;
    static getData(connection: any, constraint: any, select: any, from: any, orderBy: any, table?: any): any;
    static resetDatabase(done: any): void;
}
