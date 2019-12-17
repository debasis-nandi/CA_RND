export interface IPreference{
    profileName?: string;
    caltype?: any;
    indextype?: any;
    whttype?: any;
    ref_preference?: any;
    countryTaxRate?: any;
    pay_date_japan?: any;
    pay_date_korea?: any;
    flatrate?: any;
    saveas?: any;
    emailalert?: any;
    country?: any;
    user?: any;
    createddate?: any;
    createdby?: any;
}

export interface IPreferenceFilter {
    profileName?: string;
    caltype?: string;
    indextype?: string;
    whttype?: string;
}