
export interface IRequestFilter{
    preference?: any;
    keywords?: any;
    fromDate?: any;
    toDate?: any;
    filename?: any;
    outputfrom?: any;
    outputto?: any;
}

export interface IProcessOutput{
    Source?: any;
    ISIN?: any;
    Identifier?: any;
    EventType?: any;
    TaxRate?: any;
    ExDate?: any;
    EventAmount?: any;
    OfferPrice?: any;
    TermNewShares?: any;
    TermOldShares?: any;
    PayDate?: any;
    REIT?: any;
    Div_GTR_PAF?: any;
    Div_NTR_PAF?: any;
    Div_PR_PAF?: any;
    Div_NSAF?: any;
    SCR_NSAF?: any;
    SCR_GTR_NSAF?: any;
    SCR_NTR_NSAF?: any;
    SCR_PR_NSAF?: any;
    AddC_GTR_CASH?: any;
    AddC_NTR_CASH?: any;
    AddC_PR_CASH?: any;
    Handled_Nn_PayDate?: any;
    Multiple_Case?: any;
}
