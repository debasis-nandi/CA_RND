
export class ApiConfig{

    //public static baseApi: string = 'http://evs01dvp04:8000/'; // local server
    public static baseApi: string = 'http://172.16.4.124:8000/'; // dev server
    //public static baseApi: string = 'http://13.232.140.224:8088/'; // uat server
    
    // authentication apis
    public static getTokenApi: string = 'api/auth-token/';
    public static userRegistrationApi: string = 'api/v1/auth/Users/';

    // menu apis
    public static getUserInfoApi: string = 'api/v1/auth/ACLRoles/GetACL/{pageName}/';
    
    // manage preference apis
    public static getGetCustomOptionApi: string = 'api/v1/cajust/preferences/GetCustom/';
    public static getGetCountryOptionApi: string = 'api/v1/cajust/preferences/GetCountry/';
    public static preferencesApi: string = 'api/v1/cajust/preferences/';
    public static getPreferencesApi: string = 'api/v1/cajust/preferences/GetCustomPreference/';
    public static getPreferenceOnIdApi: string = 'api/v1/cajust/preferences/{Id}';
    public static getUserPreferencesOptionApi: string = 'api/v1/cajust/preferences/GetCustomPreference/?fields=id,profileName';
    public static disabledPreferenceApi: string = 'api/v1/cajust/preferences/{Id}';

    // wht api
    public static createWhtApi: string = 'api/v1/cajust/countrytaxratedetail/';
    public static getWhtApi: string = 'api/v1/cajust/countrytaxratedetail/GetTax/';
    public static updateWhtApi: string = 'api/v1/cajust/countrytaxratedetail/{id}/';
    public static bulkUploadApi: string = 'api/v1/taxbulkupload/';
    public static getTaxScheduleNameApi: string = 'api/v1/cajust/countrytaxrate/';
    //public static taxScheduleSearchApi: string = 'api/v1/cajust/countrytaxratedetail/GetCascade/?WHTType={whtType}&Effectivefrom={from}&Effectiveto={to}&Country={country}&TaxSchedule={taxSchedule}';
    public static getCountryTaxScheduleOnWhtTypeApi: string = 'api/v1/cajust/countrytaxratedetail/GetCascade/?WHTType={whtType}';
    public static getTaxScheduleOnCountryApi: string = 'api/v1/cajust/countrytaxratedetail/GetCascade/?WHTType={whtType}&Country={country}';
    public static disabledWhtApi: string = 'api/v1/cajust/countrytaxratedetail/{detailid}';

    // ca processing api
    //public static caProcessingApi: string = 'api/v1/cajust/CARequestInput/';
    public static caProcessingApi: string = 'api/v1/cajust/CARequestInput/customCaRequest/';
    public static getRequestApi: string = 'api/v1/cajust/CARequestInput/{Id}';
    public static createRequestApi: string = 'api/v1/cajust/CARequestInputDetails/';
    public static serverSanityApi: string = 'api/v1/cajust/CARequestInputDetails/ServerSanity/';
    public static inputFileDownloadApi: string = 'api/v1/cajust/CARequestInputDetails/FileHandling/{id}';
    public static outputFileDownloadApi: string = 'api/v1/cajust/CARequestOutputViewSet/FileHandling/{id}';
    public static downloadSanityErrorsApi: string = 'api/v1/cajust/CARequestInputDetails/downloadSanity/{fileid}';
    public static disabledRequestApi: string = 'api/v1/cajust/CARequestInput/{requestID}';

    // historical data api
    public static historicalDataApi: string = 'api/v1/cajust/HistoricalViewSet/historical/';
    public static downloadHistoricalDataApi: string = 'api/v1/cajust/HistoricalViewSet/FileHandling/{fileid}';

    // admin module api
    public static getManageClientApi: string = 'api/v1/auth/clients/';
    public static updateManageClientApi: string = 'api/v1/auth/clients/{id}';
    public static ddlClientApi: string = 'api/v1/auth/clients/?fields=clientid,clientname';
    public static getManageAccountApi: string = 'api/v1/auth/Accounts/';
    public static updateManageAccountApi: string = 'api/v1/auth/Accounts/{id}';
    public static ddlAccountApi: string = 'api/v1/auth/Accounts/?fields=accid,acc_name';
    public static getManageUserApi: string = 'api/v1/auth/Users/';
    public static updateManageUserApi: string = 'api/v1/auth/Users/{id}';
    public static activateUserApi: string = 'api/v1/auth/Users/ActiveUser/';
    public static ddlRoleApi: string = 'api/v1/auth/Roles/GetRole/{clientId}';
    public static getACLRolesApi: string = 'api/v1/auth/ACLRoles/';
    public static getResourceApi: string = 'api/v1/auth/Resources/';
    public static manageResourceApi: string = 'api/v1/auth/ACLRoles/GetRoleACL/{roleId}/';
    
    // template download
    public static templatePath: string = 'src/assets/template/';
}