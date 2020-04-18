
 export interface ISanityGroupItem {
    id?: number;
    name?: string;
    level?: number;
    group?: string;
    grouplabel?: string;
    description?: any;
    softsanity?: number;
}

export interface ISanityItems{
    groupName?: string;
    groupLabel?: string;
    groupDescription?: string;
    groupItems?:ISanityGroupItem[]
}

export interface IMasterSanity {
    sanityCode?: string;
    sanityDisplayLabel?: string;
    sanityItems?: ISanityItems[];
}

export interface IMaster {
    preferenceID?: any;
    fileName?: any;
    keywords?: string;
    account?: any;
    client?: any;
    flatrate?: any;
    comment?: string;
}

export interface ICountryTaxRate{
    countryID?: any;
    countryName?: any,
    taxRate?: any
}

export interface ISanityApplied{
    sanityid?: any;
    threshold?: any;
}

export interface ISoftSanityItem {
    id?: number;
    label?: string;
    value?: any;
    threshold?: any;
    isVisibleThreshold?: any;
    description?: string;
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
    paydate?: any;
    payDatePriceT1?: any;
    payDateFxT1?: any;
    frankingPercent?: any;
    incomePercent?: any;
    reit?: any;
}

export interface IResponse {
    reqdetailID?: any;
    common_ID?: any;
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
    masterdata: IMaster;
    countrytaxrate: ICountryTaxRate[];
    sanityapplied: ISanityApplied[];
    request: IRequest[];
}

export interface IResponsePost {
    masterdata: IMaster;
    countrytaxrate: ICountryTaxRate[];
    sanityapplied: ISanityApplied[];
    request: IResponse[];
}

export interface ISanityErrors{
    sanityErrors: ISanity[];
}

export interface ISanity {
    reqDetailId?: number;
    sanityId?: number;
}

export interface ISanityFilter{
    sanityGroup?: any;
    sanitygrouplabel?: any;
    sanityLevel?: any;
    sanitycount?: any;
    sanityDescription?: string;
    sanityStatus?: boolean;
}

export interface ISanityList{
    sanityID?: any;
    sanityname?: any;
    sanityGroup?: any;
    sanityLevel?: any;
    sanityError?: any;
    sanityDescription?: any;
    sanityWarning?: any;
    reqdetailID?: any;
    common_ID?: any;
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
    paydate?: any;
    payDatePrice?: any;
    buybackShares?: any;
    payDatePriceT1?: any;
    payDateFx?: any;
    payDateFxT1?: any;
    frankingPercent?: any;
    incomePercent?: any;
    reit?: any;
    created_date?: any;
    edit?: boolean;
    softsanity?: any;
    is_active?: any;
    childRecords?: ISanityList[]
}

export interface ISanitySummary{
    totalRecord?: number;
    hardsanity?: number;
    softsanity?: number;
    sanityError?: string;
    sanityLevel?: number;
}

export interface IPreview {
    reqdetailID?: any;
    common_ID?: any;
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
    softsanity?: any,
    error?: any;
    warning?: any;
    edit?: boolean;

    sanityID?: any;
    sanityname?: any;
    sanityGroup?: any;
    sanityLevel?: any;
    sanityDescription?: any;
    sanityWarning?: any;
    payDatePrice?: any;
    buybackShares?: any;
    payDateFx?: any;
    created_date?: any;
}