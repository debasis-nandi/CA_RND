export interface IWht{
    taxname?: string;
    country?:any;
    WHTType?: any;
    createdby?: string;
    user?: number;
    taxdetail?: ITaxDetail;
}
export interface ITaxDetail{
    tax?: any;
    effectiveFromDate?: any;
    effectiveToDate?: any;
    taxRate?: any;
    reit?: any;
    is_active?: any;
    createdby?: any;
}

export interface IWhtList {
    detailid?: number;
    taxid?: number;
    taxname?: string;
    countryid?: any;
    country?: string;
    effectivefromDate?: any;
    effectivetoDate?: any;
    effectiveFromDatePicker?: any;
    effectiveToDatePicker?: any;
    WHTType?: string;
    taxrate?: any;
    reit1?: any;
    edit?: boolean;
    childRecord?: any[];
}

export interface IFilter {
    taxname?: string;
    country?: string;
    effectivetoDate?: any;
    effectivefromDate?: any;
    WHTType?: any;
}

export interface IBulkUpload{
    taxName?: string;
    country?: string;
    whtType?: any;
    effectiveFrom?: any;
    effectiveTo?: any;
    taxRate?: any;
    reIT?:any;
    user?: any;
    status?:boolean;
    statusMsg?: string;
}
