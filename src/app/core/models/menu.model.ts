export interface IMenu {
    Dashboard?: MenuItem[];
    Menu?: MenuItem[];
    Analytics?: MenuItem[];
    Admin?: MenuItem[];
    Userdetail?:UserDetail;
}

export interface MenuItem{
    resource__id?: number;
    resource__name?: string;
    resource__url?: string;
    resource__parent?: string;
    resource__sequence?: number;
}

export interface UserDetail{
    username?: string;
    client?: string;
    account?: string;
    role?: string;
}