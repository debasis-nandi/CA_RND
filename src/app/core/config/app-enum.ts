
export enum GlobalConst {
    growlLife = 3000,
    maxTextAreaLength = 1000,
    maxUploadedFileSize = 10485760
}

export enum Resource{
    dashboard="dashboard",
    caProcessing="CA Processing",
    preferenceManagement="Preference Management",
    whtManagement="WHT Management",
    historicalData="Historical Data",
    analytics="Analytics",
    userManagement="User Management",
    roleManagement="Role Management"
}

export enum Action {
    delete = "Delete",
    download = "Download",
    share = "Share",
    copy = "Copy",
    edit = "Edit",
    search = "Search",
    templateDownload = "TemplateDownload",
    add = "Add",
    view = "View",
    disable = "Disable",
    enable = "Enable",
    downloadInput = "DownloadInput",
    downloadOutput = "DownloadOutput",
}

export enum TableName {
    preferences = "preferences",
    wht = "wht",
    caProcessing = "caProcessing",
    caUnProcessing = "caUnProcessing",
    caProcessingDashboard = "caProcessingDashboard",
    manageAccount = "manageAccount",
    manageClient = "manageClient",
    manageUser = "manageUser",
    manageResource = "manageResource",
    caProcessingOutput = "caProcessingOutput"
}

export enum DocType{
    doc = "doc",
    docx = "docx",
    pdf = "pdf",
    csv = "csv",
    xls = "xls",
    xlsx = "xlsx",
    ppt = "ppt",
    pptx = "pptx",
    png = "png",
    jpg = "jpg",
    jpeg = "jpeg",
    gif = "gif",
    txt = "txt"
}

export enum Template {
    wht = "WHT-Template.csv",
    caInput = "CA-Input-Template.csv",
    instructionsGuidelines = "Instructions  Guidelines - Quick Reference.xlsx"
}

export enum EventType {
    cashDividend = "Cash Dividend",
    specialCashDividend = "Special Cash Dividend",
    stockDividend = "Stock Dividend",
    rightsIssue = "Rights Issue",
    spinOff = "Spin Off",
    stockSplit = "Stock Split"
}

export enum SanityLevel {
    level1 = 'Level1',
    level2 = 'Level2',
    level3 = 'Level3'
}

export enum SanityGroup{
    mandatory = 'Mandatory',
    dateFormat = 'DateFormat',
    invalidData = 'InvalidData',
    duplicate = 'Duplicate'
}

export enum SanityFields{
    source = 'source',
    isin = 'isin',
    country = 'country',
    identifier = 'identifier',
    priceCurrency = 'priceCurrency',
    exdate = 'exdate',
    eventType = 'eventType',
    eventName = 'eventName',
    eventCurrency = 'eventCurrency',
    eventamount = 'eventamount',
    offerprice = 'offerprice',
    termoldshares = 'termoldshares',
    termnewshares = 'termnewshares',
    spunoffstock = 'spunoffstock',
    spunoffcash = 'spunoffcash',
    priceExT1 = 'priceExT1',
    fxexT1 = 'fxexT1',
    paydate = 'paydate',
    payDatePriceT1 = 'payDatePriceT1',
    payDateFxT1 = 'payDateFxT1',
    frankingPercent = 'frankingPercent',
    incomePercent = 'incomePercent',
    reit = 'reit',
    duplicate= 'duplicate'
}