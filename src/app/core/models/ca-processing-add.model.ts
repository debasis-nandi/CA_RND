export interface ISanityModel{
    rowId?:number;
    source?: any;
    isin?: any;
    country?: any;
    identifier?: any;
    priceCurrency?: any;
    exdate?: any;
    eventType?: any;
    eventName?: any;
    eventCurrency?: any;
    eventamount?: any;
    offerprice?: any;
    termoldshares?: any;
    termnewshares?: any;
    spunoffstock?: any;
    spunoffcash?: any;
    priceExT1?: any;
    fxexT1?: any;
    taxRate?: any;
    paydate?: any;
    payDatePriceT1?: any;
    payDateFxT1?: any;
    frankingPercent?: any;
    incomePercent?: any;
    reit?: any;
    sanityStatus?: boolean;
    sanityData?: any[];
    errorSummary?: any;
}

export interface IMasterData {
    fileName?: any;
    preferenceID?: any;
    account?: any;
    client?: any;
    flatrate?: any;
    comment?: string;
    keywords?: string;
    user?: any;
    createdby?: string;
    createddate?: any;
}

export interface IRequest {
    source?: any;
    isin?: any;
    country?: any;
    identifier?: any;
    priceCurrency?: any;
    exdate?: any;
    eventType?: any;
    eventName?: any;
    eventCurrency?: any;
    eventamount?: any;
    offerprice?: any;
    termoldshares?: any;
    termnewshares?: any;
    spunoffstock?: any;
    spunoffcash?: any;
    priceExT1?: any;
    fxexT1?: any;
    taxRate?: any;
    paydate?: any;
    payDatePriceT1?: any;
    payDateFxT1?: any;
    frankingPercent?: any;
    incomePercent?: any;
    reit?: any;
}

export interface IRequestPost {
    masterdata: IMasterData;
    request: IRequest[];
}

export interface ICountryTaxRate{
    countryCode?: any;
    countryName?: any,
    taxRate?: any
}

export interface IMasterSanity {
    id?: number;
    name?: string;
    value?: any;
    level?: number;
    group?: any;
    description?: string;
    softsanity?: any;
    child?:IMasterSanity[]
}