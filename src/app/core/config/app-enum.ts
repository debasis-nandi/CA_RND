
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
    caProcessingDashboard = "caProcessingDashboard",
    manageAccount = "manageAccount",
    manageClient = "manageClient",
    manageUser = "manageUser",
    manageResource = "manageResource"
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