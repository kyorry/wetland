export declare let schemas: {
    todo: {
        columns: {
            column_default: any;
            table_name: string;
            column_name: string;
            data_type: string;
            extra: string;
            column_key: string;
            column_type: string;
            is_nullable: string;
        }[];
        constraints: {
            table_name: string;
            column_name: string;
            constraint_name: string;
            referenced_table_name: string;
            referenced_column_name: string;
        }[];
        referentialConstraints: {
            constraint_name: string;
            unique_constraint_schema: string;
            unique_constraint_name: string;
            update_rule: string;
            delete_rule: string;
            table_name: string;
            referenced_table_name: string;
        }[];
    };
    postal: {
        columns: {
            column_default: string;
            table_name: string;
            column_name: string;
            data_type: string;
            extra: string;
            column_key: string;
            column_type: string;
            is_nullable: string;
        }[];
        constraints: {
            table_name: string;
            column_name: string;
            constraint_name: string;
            referenced_table_name: string;
            referenced_column_name: string;
        }[];
        referentialConstraints: {
            constraint_name: string;
            unique_constraint_schema: string;
            unique_constraint_name: string;
            update_rule: string;
            delete_rule: string;
            table_name: string;
            referenced_table_name: string;
        }[];
    };
};
