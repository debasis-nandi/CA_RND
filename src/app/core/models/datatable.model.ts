export interface Table {
    tableStyleClass?: string;
    paginator?: boolean;
    rows?: number;
    rowsPerPageOptions?: number[];
    reorderableColumns?: boolean;
    responsive?: boolean;
    globalsearch?: boolean;
    scrollable?: boolean;
    scrollHeight?: any;
    frozenWidth?: any;
    unfrozenWidth?: any;
    lazy?: boolean;
    first?: number;
    selectionMode?: string;
    globalFilterFields?: string[];
}

export interface Column {
    field?: string;
    header?: string;
    sortable?: boolean;
    filter?: boolean;
    filterMatchMode?: string;
    styleClass?: string;
    hidden?: boolean;
    type?: string;
    routerLink?: string;
    valueField?: string;
}

export interface ITableConfig {
    table?: Table;
    columns?: Column[];
    rows?: any;
    totalRecords?: any;
}