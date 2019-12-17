
export interface IUser {
    email?: string;
    password?: string;
}

export interface IToken {
    refresh?: any;
    access?: any;
}

export interface IUserDetail{
    username?: string;
    client?: string;
    account?: string;
    role?: string;
}