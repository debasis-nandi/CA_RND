export interface IManageClient{
    clientid?: any;
    clientname?: string;
    client_domain?: string;
    is_active?: any;
    subscription_start?: any;
    subscription_end?: any;
    subscription_key?: any;
    createdby?: string;
    createddate?: any;
    action?: any[];
}

export interface IManageAccount{
    acc_name?: string;
    accid?: any;
    client?: any;
    clientname?: string;
    keywords?: string;
    fromdate?: any;
    enddate?: any;
    is_active?:any;
    action?: any[];
}

export interface IManageUser{
    id?: any;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    active?: any;
    clientname?: string;
    accountname?: string;
    action?: any[]
}

export interface IManageResource{
    roleid?: any;
    rolename?: string;
    clientid?: any;
    clientname?: string;
    resourcename?: string;
    active?: any;
    action?:any[];
}

export interface IResource{
    id?: any;
    name?: string;
    url?: string;
    parent?: string;
    sequence?: any;
    level?: any;
    is_active?: any;
    children?:any[]
}

export interface IResourcePost{
    id?: any;
    resourceid?: any;
    resourcename?: string;
    resourceparent?: string;
    active?: boolean;
}

export interface TreeNode {
    label?: string;
    data?: any;
    icon?: any;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: TreeNode[];
    leaf?: boolean;
    expanded?: boolean;
    type?: string;
    parent?: TreeNode;
    partialSelected?: boolean;
    styleClass?: string;
    draggable?: boolean;
    droppable?: boolean;
    selectable?: boolean;
}