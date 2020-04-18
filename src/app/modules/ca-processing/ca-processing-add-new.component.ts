import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm, FormArray, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { formatDate, DatePipe } from '@angular/common';
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';

import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { OverlayPanel } from 'primeng/primeng';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst, DocType, EventType, Template, Action, SanityLevel, SanityGroup, SanityFields } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { IMasterSanity, ISanityItems, ISanityGroupItem, IMaster, IRequest, IRequestPost, ICountryTaxRate, 
        IResponse, IResponsePost, ISanityErrors, ISanity, ISanityApplied, ISoftSanityItem } from '../../core/models/ca-processing-add-new.model';
import { Sanity } from './ca-processing-sanity';

@Component({
    selector: 'app-ca-processing-add-new',
    templateUrl: './ca-processing-add-new.component.html',
    styleUrls: ['ca-processing.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers:[DatePipe]
})
export class CaProcessingAddNewComponent implements OnInit, AfterViewInit {
    
    caProcessingAddForm:FormGroup;
    
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    maxUploadedFileSize: number = GlobalConst.maxUploadedFileSize;
    myFromDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', componentDisabled: true };
    
    userInfo: any;
    createdDate: any;
    requestID: any;
    inputFile: any;
    action: any;
    
    uploadedFiles: any[] = [];
    userPreferencesOption: any[] = [];
    customOption: any[] = [];
    countryOption: any[] = [];
    countryTaxRateList: ICountryTaxRate[] = [];
    
    masterSanity: IMasterSanity[] = [];
    selectedSanity: ISanityApplied[] = [];
    
    level1SoftSanity: ISoftSanityItem[] = [];
    level2SoftSanity: ISoftSanityItem[] = [];
    level3SoftSanity: ISoftSanityItem[] = [];

    disabled: boolean = false;
    isVisible: boolean = false;
    isCustom: boolean = false;
    isFlat: boolean = false;
    isTaxRateByCountry: boolean = false;
    
    masterData: any;
    request: any;

    constructor(private fb:FormBuilder, private router: Router, private route: ActivatedRoute, private service: HttpService, public datepipe: DatePipe) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
        this.getUserPreferencesOption();
        this.getCustomOption();
        this.getCountryOption();
        this.getMasterSanity();
        
        this.route.params.subscribe(params => {
            this.requestID = params['id'] || null;
            this.action = params['action'] || null;
            this.disabled = (this.requestID && this.action == 'read') ? true : false;
            if (this.requestID && this.action == 'read'){
                this.getPreferenceOnRequestId(this.requestID);
            }
            if (this.requestID && this.action == 'edit') {
                this.loading = true;
                setTimeout(() => {
                    this.getCaUnProcessedDetails(this.requestID);
                }, 1000);
            }   
        });

        this.caProcessingAddForm = this.fb.group({
            userPreferences: [{value: '', disabled: this.disabled},[Validators.required]],
            keywords:[{value: '', disabled: this.disabled}],
            payDate: [],
            calMethodology:[],
            indexType:[],
            withHoldingTax:[''],
            taxRate:[{value: '', disabled: this.disabled}],
            flatTaxRate:[{value: '', disabled: this.disabled}],
            email:[''],
            saveAs:[],
            comment:[{value: '', disabled: this.disabled}],
            country: [''],
            countryTaxRate: ['']
        });

        this.formControlValueChanged();
    }

    ngAfterViewInit() {
    }

    createFormGroup(items: any[]): FormGroup {
        let formGroup: FormGroup = new FormGroup({});
        for (let item of items) {
            let control: FormControl = new FormControl(item.value);
            formGroup.addControl(item.name, control);
        }
        return formGroup;
    }

    formControlValueChanged(): void {
        // get flat tax rate based on select flat check box
        let flatTaxRate = this.caProcessingAddForm.get('flatTaxRate');
        let country = this.caProcessingAddForm.get('country');
        let countryTaxRate = this.caProcessingAddForm.get('countryTaxRate');
        this.caProcessingAddForm.get('taxRate').valueChanges.subscribe(value=>{
            flatTaxRate.clearValidators();
            country.clearValidators();
            countryTaxRate.clearValidators();
            
            country.setValue("");
            countryTaxRate.setValue("");
            
            this.isFlat = false;
            this.isTaxRateByCountry = false;
            
            if(value == ''){
                flatTaxRate.setValue("");
                this.countryTaxRateList = [];
            }
            if(value == 'flat'){
                this.isFlat = true;
                flatTaxRate.setValidators([Validators.required, Validators.pattern(/^(100(?:\.0000?)?|\d?\d(?:\.\d{1,4}?)?)$/)]);
                flatTaxRate.markAsDirty();
                flatTaxRate.updateValueAndValidity();
            }
            if(value == 'taxRateCountry'){
                this.isTaxRateByCountry = true;
                country.setValidators([Validators.required]);
                country.markAsDirty();
                countryTaxRate.setValidators([Validators.required, Validators.pattern(/^(100(?:\.0000?)?|\d?\d(?:\.\d{1,4}?)?)$/)]);
                countryTaxRate.markAsDirty();
                country.updateValueAndValidity();
                countryTaxRate.updateValueAndValidity();
            }
        });
    }

    onPreferenceChange(selectedValue: any) {
        if (selectedValue)
            this.getPreference(selectedValue);
        else
            this.resetFormValue();
    }

    getPreference(id: any) {
        this.loading = true;
        this.service.get(ApiConfig.getPreferenceOnIdApi.replace("{Id}", id)).subscribe(res => {
            this.setFormValue(res);
            this.isVisible = true;
            this.loading = false;
        }, error => { 
            this.loading = false; 
        });
    }

    getCaUnProcessedDetails(commonId: any): void {
        this.loading = true;
        this.service.get(ApiConfig.caUnProcessedDetailsApi.replace("{commonId}", commonId)).subscribe(res => {
            let response: IResponsePost = res.result ? res["results"] : {};
            this.masterData = response.masterdata ? response.masterdata : {};
            this.request = response.request ? response.request : [];
            this.selectedSanity = response.sanityapplied.length > 0 ? response.sanityapplied : []; 
            this.countryTaxRateList = (response.countrytaxrate && response.countrytaxrate.length) ? this.setCountryTaxRate(response.countrytaxrate) : [];
            let taxRate: any = '';
            if (response.masterdata.flatrate) {
                taxRate = 'flat';
            }
            if (response.countrytaxrate.length > 0) {
                taxRate = 'taxRateCountry';
            }
            this.caProcessingAddForm.patchValue({
                keywords: response.masterdata.keywords,
                comment: response.masterdata.comment,
                taxRate: taxRate,
                flatTaxRate: response.masterdata.flatrate
            });
            this.setSoftSanity(this.selectedSanity);
            this.onPreferenceChange(response.masterdata.preferenceID);
        }, error => {
            this.loading = false;
        });
    }

    getPreferenceOnRequestId(requestId: any): void {
        this.loading = true;
        this.service.get(ApiConfig.getRequestApi.replace("{Id}", requestId)).subscribe(res => {
            if (res) {
                let taxRate: any = '';
                this.createdDate = res['createddate'] ? AppUtil.getDate(res['createddate'], 'dd-mm-yyyy') : '';
                this.inputFile = res['fileName'] ? res['fileName'] : '';
                if(res['flatrate']){
                    taxRate = 'flat';
                }
                if(this.countryTaxRateList.length > 0){
                    taxRate = 'taxRateCountry';
                }
                this.caProcessingAddForm.patchValue({
                    keywords: res['keywords'],
                    comment: res['comments'],
                    taxRate: taxRate,
                    flatTaxRate: res['flatrate']  
                });
                this.selectedSanity = res['sanityapplied'] ? res['sanityapplied'] : [];
                this.setSoftSanity(this.selectedSanity);
                this.onPreferenceChange(res['preferenceID']);
            }
            this.loading = false;
        }, error => { this.loading = false; });
    }

    setFormValue(formData: any) {
        let payDate: any[] = [];
        if(formData['pay_date_japan'] == 1){
            payDate.push('japan');
        }
        if(formData['pay_date_korea'] == 1){
            payDate.push('korea');
        }

        this.caProcessingAddForm.patchValue({
            userPreferences: formData['id'],
            payDate: payDate.length > 0 ? payDate : null,
            calMethodology: formData['caltype'].length > 0 ? formData['caltype'] : null,
            indexType: formData['indextype'].length > 0 ? formData['indextype'] : null,
            saveAs: formData['saveas'].length > 0 ? formData['saveas'] : null,
            withHoldingTax: formData['whttype'],
            email: formData['emailalert']
        });
    }

    getUserPreferencesOption() {
        this.service.get(ApiConfig.getUserPreferencesOptionApi).subscribe(res => {
            if (res.result) {
                let preferenceList: any[] = res.PreferenceList ? res.PreferenceList : [];
                let options: any[] = [];
                options.push({value:'', label:'Select preference'});
                preferenceList.forEach(x=>{
                    options.push({ value: x.id, label:x.profileName });
                });
                this.userPreferencesOption = options;
            }
        }, error => { 
            console.log(error); 
        });
    }

    getCustomOption() {
        this.service.get(ApiConfig.getGetCustomOptionApi).subscribe(res => {
            if (res.result) {
                let customList: any[] = res.CustomList ? res.CustomList : [];
                this.customOption = customList.map(x => {
                    return { value: x.taxname, label: x.taxname };
                });
            }
        }, error => { 
            console.log(error); 
        });
    }

    onSelect(event: any) {
        var isValidType: boolean = false;
        var isValidSize: boolean = true;
        for (let file of event.files) {
            isValidType = this.isFileTypeValid(file);
            isValidSize = this.isFileSizeValid(file);

            if (!isValidType) {
                this.showError("You can only upload an csv file.");
            }
            else if (!isValidSize) {
                this.showError("You have uploaded an invalid file size.");
            }
            else {
                this.uploadedFiles = [];
                this.uploadedFiles.push(file);
            }
        }
    }

    isValidForm(): boolean {
        if (this.caProcessingAddForm.get('taxRate').value == 'taxRateCountry') {
            let preferences: any = this.caProcessingAddForm.get('userPreferences').value;
            return (preferences != '' && this.countryTaxRateList.length > 0 && (this.uploadedFiles.length > 0 || this.action == 'edit')) ? true : false;
        }
        else {
            return (this.caProcessingAddForm.valid && (this.uploadedFiles.length > 0 || this.action == 'edit')) ? true : false;
        }
    }

    isDisabledOverrideOnCountry(): boolean{
        return (this.caProcessingAddForm.get('country').valid && this.caProcessingAddForm.get('countryTaxRate').valid) ? false : true
    }

    getHeaderArray(csvRecordsArr: any) {
        let headers = (<string>csvRecordsArr[0]).split(',');
        let headerArray = [];
        for (let j = 0; j < headers.length; j++) {
            headerArray.push(headers[j]);
        }
        return headerArray;
    }
    
    getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
        let csvArr: IRequest[] = [];
        for (let i = 1; i < csvRecordsArray.length; i++) {
            let curruntRecord = (<string>csvRecordsArray[i]).split(',');
            if (curruntRecord.length == headerLength) {
                let csvRecord: IRequest = {};
                csvRecord.source = (curruntRecord[0] && curruntRecord[0].trim() !='') ? curruntRecord[0] : '';
                csvRecord.isin = (curruntRecord[1] && curruntRecord[1].trim() != '') ? curruntRecord[1] : '';
                csvRecord.country = (curruntRecord[2] && curruntRecord[2].trim() != '') ? curruntRecord[2] : '';
                csvRecord.identifier = (curruntRecord[3] && curruntRecord[3].trim() != '') ? curruntRecord[3] : '';
                csvRecord.priceCurrency = (curruntRecord[4] && curruntRecord[4].trim() != '') ? curruntRecord[4] : '';
                csvRecord.exdate = (curruntRecord[5] && curruntRecord[5].trim() != '') ? AppUtil.getDate(curruntRecord[5].trim(), 'mm-dd-yyyy') : '';
                csvRecord.eventType = (curruntRecord[6] && curruntRecord[6].trim() != '') ? curruntRecord[6] : '';
                csvRecord.eventName = (curruntRecord[7] && curruntRecord[7].trim() != '') ? curruntRecord[7] : '';
                csvRecord.eventCurrency = (curruntRecord[8] && curruntRecord[8].trim() != '') ? curruntRecord[8] : '';
                csvRecord.eventamount = (curruntRecord[9] && curruntRecord[9].trim() != '') ? curruntRecord[9] : "0.00";
                csvRecord.offerprice = (curruntRecord[10] && curruntRecord[10].trim() != '') ? curruntRecord[10] : "0.00";
                csvRecord.termoldshares = (curruntRecord[11] && curruntRecord[11].trim() != '') ? curruntRecord[11] : "0.00";
                csvRecord.termnewshares = (curruntRecord[12] && curruntRecord[12].trim() != '') ? curruntRecord[12] : "0.00";
                csvRecord.spunoffstock = (curruntRecord[13] && curruntRecord[13].trim() != '') ? curruntRecord[13] : "0.00";
                csvRecord.spunoffcash = (curruntRecord[14] && curruntRecord[14].trim() != '') ? curruntRecord[14] : "0.00";
                csvRecord.priceExT1 = (curruntRecord[15] && curruntRecord[15].trim() != '') ? curruntRecord[15] : "0.00";
                csvRecord.fxexT1 = (curruntRecord[16] && curruntRecord[16].trim() != '') ? curruntRecord[16] : "0.00";
                csvRecord.paydate = (curruntRecord[17] && curruntRecord[17].trim() != '') ? AppUtil.getDate(curruntRecord[17].trim(),'mm-dd-yyyy') : '';
                csvRecord.payDatePriceT1 = (curruntRecord[18] && curruntRecord[18].trim() != '') ? curruntRecord[18] : "0.00";
                csvRecord.payDateFxT1 = (curruntRecord[19] && curruntRecord[19].trim() != '') ? curruntRecord[19] : "0.00";
                csvRecord.frankingPercent = (curruntRecord[20] && curruntRecord[20].trim() != '') ? curruntRecord[20] : "0.00";
                csvRecord.incomePercent = (curruntRecord[21] && curruntRecord[21].trim() != '') ? curruntRecord[21] : "0.00";
                csvRecord.reit = (curruntRecord[22] && curruntRecord[22].trim() != '') ? curruntRecord[22] : '';
                csvArr.push(csvRecord);
            }
        }
        return csvArr;
    }

    mapServerSanityData(records: any) {
        let csvArr = [];
        if (records.length > 0) {
            for (let i = 0; i < records.length; i++) {
                let record: any = {};
                record = records[i];
                record.rowId = i;
                record.sanityStatus = false;
                csvArr.push(record);
            }
        }
        return csvArr;
    }

    isFileTypeValid(file: any): boolean {
        var isValid: boolean = false;
        if (file) {
            var fileType = this.getFileExtension(file.name).toLowerCase();
            if (fileType == DocType.csv) {
                isValid = true;
            }
        }
        return isValid;
    }

    getFileExtension(filename: string): string {
        return filename.split('.').pop();
    }

    isFileSizeValid(file: any): boolean {
        var isValid: boolean = false;

        if (file) {
            // check for indivisual file size
            if (file.size <= this.maxUploadedFileSize) {
                isValid = true;
            }
            else {
                isValid = false;
            }
        }

        return isValid;
    }

    formatSize(bytes: any): any {
        if (bytes == 0) {
            return '0 B';
        }
        let k = 1000,
            dm = 3,
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    onRemove(event: any, index: any) {
        if (index != -1) {
            this.uploadedFiles.splice(index, 1);
        }
    }

    resetFormValue() {
        this.uploadedFiles = [];
        this.isVisible = false;
        this.caProcessingAddForm.patchValue({
            keywords:"",
            payDate: null,
            calMethodology: null,
            indexType: null,
            saveAs: null,
            withHoldingTax: "",
            customValue: "",
            taxRate: "",
            flatTaxRate: "",
            email: "",
            comment:""
        });
    }

    onReset(){
        this.caProcessingAddForm.patchValue({
            userPreferences: ''
        });
        this.resetFormValue();
    }

    onSanity(): void {
        // master data
        let masterData: any = {};
        if(this.action == 'edit'){
            masterData = {
                id: this.masterData.id,
                fileName: this.uploadedFiles.length > 0 ? this.uploadedFiles[0].name : this.masterData.fileName,
                preferenceID: this.caProcessingAddForm.controls['userPreferences'].value,
                account: this.userInfo.account_id,
                client: this.userInfo.client_id,
                flatrate: this.caProcessingAddForm.controls['flatTaxRate'].value ? this.caProcessingAddForm.controls['flatTaxRate'].value : null,
                comment: this.caProcessingAddForm.controls['comment'].value ? this.caProcessingAddForm.controls['comment'].value : null,
                keywords: this.caProcessingAddForm.controls['keywords'].value ? this.caProcessingAddForm.controls['keywords'].value : null
            };
        }
        else{
            masterData = {
                fileName: this.uploadedFiles.length > 0 ? this.uploadedFiles[0].name : null,
                preferenceID: this.caProcessingAddForm.controls['userPreferences'].value,
                account: this.userInfo.account_id,
                client: this.userInfo.client_id,
                flatrate: this.caProcessingAddForm.controls['flatTaxRate'].value ? this.caProcessingAddForm.controls['flatTaxRate'].value : null,
                comment: this.caProcessingAddForm.controls['comment'].value ? this.caProcessingAddForm.controls['comment'].value : null,
                keywords: this.caProcessingAddForm.controls['keywords'].value ? this.caProcessingAddForm.controls['keywords'].value : null
            };    
        }
        

        // selected country taxrate
        let countryTaxRate: any[] = [];
        if (this.countryTaxRateList.length > 0) {
            for (let item of this.countryTaxRateList) {
                let country: any = { countryID: item.countryID, taxrate: item.taxRate };
                countryTaxRate.push(country);
            }
        }

        // request data
        let file: any = this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : '';
        if (file) {
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => {
                let csvData = reader.result;
                let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
                let headersRow = this.getHeaderArray(csvRecordsArray);
                let csvRecords: IRequest[] = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
                if (csvRecords.length > 0) {
                    // post model
                    let requestPostModel: IRequestPost = {
                        masterdata: masterData,
                        countrytaxrate: countryTaxRate,
                        sanityapplied: this.selectedSanity,
                        request: csvRecords
                    };

                    this.loading = true;
                    if(this.action == 'edit'){
                        let api: any = ApiConfig.caRequestUpdateDataApi.replace("{commonId}", this.requestID);
                        this.service.put(api, requestPostModel).subscribe(res => {
                            if (res.result) {
                                let response: IResponsePost = res.results;
                                this.onSanityCheck(response.request);
                            }
                            //this.loading = false;
                        }, error => {
                            this.showError("Internal server error.");
                            this.loading = false;
                        });
                    }
                    else{
                        this.service.post(ApiConfig.caRequestDataApi, requestPostModel).subscribe(res => {
                            if (res.result) {
                                let response: IResponsePost = res.results;
                                this.onSanityCheck(response.request);
                            }
                            //this.loading = false;
                        }, error => {
                            this.showError("Internal server error.");
                            this.loading = false;
                        });
                    }

                }
            };

            reader.onerror = function () {
                console.log('error is occured while reading file!');
            };
        }
        else{
            // post model
            let requestPostModel: any = {
                masterdata: masterData,
                countrytaxrate: countryTaxRate,
                sanityapplied: this.selectedSanity
            };
            let api: any = ApiConfig.caRequestUpdateDataApi.replace("{commonId}", this.requestID);
            this.loading = true;
            this.service.put(api, requestPostModel).subscribe(res => {
                if (res.result) {
                    let response: IResponsePost = res.results;
                    this.onSanityCheck(response.request);
                }
                //this.loading = false;
            }, error => {
                this.showError("Internal server error.");
                this.loading = false;
            });
        }

    }

    onSanityCheck(records: IResponse[]): void {
        let level1MasterSanity: ISanityItems[] = this.masterSanity.filter(x => x.sanityCode == SanityLevel.level1).length > 0 ? this.masterSanity.filter(x => x.sanityCode == SanityLevel.level1)[0].sanityItems : [];
        let objLevel1Errors: any[] = [];
        let objLevel2Errors: any;
        let objLevel3Errors: any;
        
        if (records && records.length > 0) {
            let commonId: any = records.length > 0 ? records[0].common_ID : null;
            // Level1 sanity check
            objLevel1Errors = Sanity.onLevel1Sanity(records, level1MasterSanity);
            if (objLevel1Errors.length > 0) {
                let sanityErrors: ISanityErrors = { sanityErrors: objLevel1Errors };
                //this.loading = true;
                this.service.post(ApiConfig.caRequestUpdateSanityApi, sanityErrors).subscribe(data => {
                    if (data.result) {
                        this.router.navigate(['ca-processing/sanity-check-summary', commonId]);
                    }
                    this.loading = false;
                }, error => {
                    this.showError("Internal server error.");
                    this.loading = false;
                });
            }
            // Level2 sanity check
            if(objLevel1Errors.length == 0){
                let api: any = ApiConfig.level2SanityApi.replace("{commonId}", commonId);
                this.service.get(api).subscribe(res=>{
                    if(res.result){
                        this.router.navigate(['ca-processing/sanity-check-summary', commonId]);
                    }
                }, error=>{
                    this.showError("Internal server error.");
                    this.loading = false;
                });
            }
        }

    }

    onTemplateDownload(): void {
        this.service.getCsv(ApiConfig.templatePath + Template.caInput).subscribe(data => {
            AppUtil.downloadFile(data, Template.caInput);
        }, error => { console.log(error) });
    }

    onDownloadGuidelines(): void{
        AppUtil.downloadStaticFile(ApiConfig.templatePath, Template.instructionsGuidelines);
    }
    
    onDownload(actionType: any){
        this.loading = true;
        let fileName: string ='', fileType: string ='', api: string ='';
        if(actionType == Action.downloadInput){
            fileName = this.inputFile;
            fileType = 'csv';
            api = ApiConfig.inputFileDownloadApi.replace("{id}",this.requestID);
        }
        if(actionType == Action.downloadOutput){
            fileType = this.caProcessingAddForm.controls['saveAs'].value[0];
            fileName = this.inputFile.split('.')[0] + (fileType.toLowerCase() == 'json' ? '_output.json' : '_output.csv');
            api = ApiConfig.outputFileDownloadApi.replace("{id}",this.requestID);
        }
        this.service.getData(api, fileType).subscribe(res => {
            //res = {"result":false,"message":"Input Request still in process."};
            let objRes: any[] = (JSON.stringify(res)).split('\\');
            if(objRes[0] == '"{' && objRes[6] == '"}"' ){
                let jsonObj: any = JSON.parse(res);
                this.showError(jsonObj['message']);
            }
            else{
                AppUtil.downloadFile(res, fileName);
            }
            this.loading = false;
        }, err => {
            this.loading = false;
            this.showError("Internal server error");
            console.log(err);
        });
    }

    getCountryOption() {
        this.service.get(ApiConfig.getGetCountryOptionApi).subscribe(res => {
            if (res.result) {
                let countryList: any[] = res.CustomList ? res.CustomList : [];
                let options: any[] = [];
                options.push({value:'', label:'Select a country'});
                countryList.forEach(x=>{
                    options.push({ value: x.id, label: x.name +"("+ x.countryCode +")" });
                });
                this.countryOption = options;
            }
        }, error => { 
            console.log(error); 
        });
    }

    AddCountryTaxRate() {
        let selectedCountry: any = this.caProcessingAddForm.controls['country'].value;
        let countryTaxRate: any = this.caProcessingAddForm.controls['countryTaxRate'].value;
        let countryName: any = this.countryOption.filter(x => x.value == selectedCountry)[0].label;
        let objTaxRate: ICountryTaxRate = {
            countryID: selectedCountry,
            countryName: countryName ? countryName : '',
            taxRate: countryTaxRate
        };
        let isExist: boolean = this.countryTaxRateList.filter(x => x.countryID == selectedCountry).length > 0 ? true : false;
        if (!isExist) {
            this.countryTaxRateList.push(objTaxRate);
            this.caProcessingAddForm.controls['country'].setValue('');
            this.caProcessingAddForm.controls['countryTaxRate'].setValue('');
        }
        else {
            this.showError("Duplicate entry for country : " + objTaxRate.countryName);
        }
    }

    setCountryTaxRate(countryTaxRateList: any): ICountryTaxRate[]{
        let items: ICountryTaxRate[] = [];
        for(let item of countryTaxRateList){
            let countryName: any = this.countryOption.length > 0 ? this.countryOption.filter(x => x.value == item.countryID)[0].label : ''; 
            let objTaxRate: ICountryTaxRate = {
                countryID: item.countryID,
                countryName: countryName,
                taxRate: item.taxrate
            };  
            items.push(objTaxRate);
        }
        return items;
    }

    onDelete(index: any){
        this.countryTaxRateList.splice(index,1);
    }

    onBack(): void{
        this.router.navigate(['ca-processing']);
    }

    showSuccess(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'success', detail: message });
    }

    showError(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', detail: message });
    }

    getMasterSanity() {
        this.service.get(ApiConfig.masterSanityApi).subscribe(res => {
            if(res.result){
                this.masterSanity = res.results;
                this.getSoftSanity();
            }
        }, error => { 
            console.log(error); 
        });
    }

    getSoftSanity(): void {
        let level2SanityItems: ISanityItems[] = this.masterSanity.filter(x => x.sanityCode == SanityLevel.level2)[0].sanityItems;
        if (level2SanityItems && level2SanityItems.length > 0) {
            for (let item of level2SanityItems) {
                // get soft sanity from group
                let softSanity: ISanityGroupItem[] = item.groupItems.filter(x => x.softsanity == 1);
                if (softSanity && softSanity.length > 0) {
                    // add soft sanity in soft sanity list
                    softSanity.forEach(item => {
                        let softSanityItem: ISoftSanityItem = {
                            id : item.id,
                            label: item.name,
                            value: false,
                            threshold: '',
                            isVisibleThreshold: false,
                            description: item.description
                        };
                        this.level2SoftSanity.push(softSanityItem);
                    });
                }
            }
        }
    }

    onChangeSoftSanity(item:ISoftSanityItem, event: any) {
        if (event.target.checked) {
            item.isVisibleThreshold = true;
            item.value = true;
            item.threshold = '';
            let selectedItem: ISanityApplied = { sanityid: item.id, threshold: '' };
            this.selectedSanity.push(selectedItem);
        }
        else {
            item.isVisibleThreshold = false;
            item.value = false;
            let selectedItem: ISanityApplied = this.selectedSanity.filter(x=>x.sanityid == item.id)[0];
            let index = this.selectedSanity.indexOf(selectedItem);
            this.selectedSanity.splice(index, 1);
        }
    }

    onChangeSoftSanityThreshold(item:ISoftSanityItem, event: any) {
        item.threshold = event.target.value ? event.target.value : null;
        this.selectedSanity.filter(x=>x.sanityid == item.id)[0].threshold = item.threshold;
    }

    setSoftSanity(items: ISanityApplied[]): void{
        if(items.length > 0){
            for(let item of items){
                this.level2SoftSanity.filter(x=>x.id == item.sanityid)[0].value = true;
                this.level2SoftSanity.filter(x=>x.id == item.sanityid)[0].isVisibleThreshold = true;
                this.level2SoftSanity.filter(x=>x.id == item.sanityid)[0].threshold = item.threshold;
            }
        }
    }

    payDate(name: any): any {
        let payDateOption: any[] = [
            { index:1, name: 'japan', value: false, label: 'Japan', colspan: "1" },
            { index:2, name: 'korea', value: false, label: 'South Korea', colspan: "1" },
            { index:3, name: 'all', value: false, label: 'ALL', colspan: "2" }
        ];
        return payDateOption.filter(x=> x.name == name).length > 0 ? payDateOption.filter(x=> x.name == name)[0].label : '';
    }
    
    calMethodology(name: any): any {
        let calMethodologyOption: any[] = [
            { index:1, name: 'stockBase', value: false, label: 'Stock Base', colspan: "1" },
            { index:2, name: 'divisorBase', value: false, label: 'Divisor Base', colspan: "1" },
            { index:3, name: 'accuCash', value: false, label: 'Accu Cash', colspan: "1" },
            { index:4, name: 'all', value: false, label: 'ALL', colspan: "1" }
        ];
        return calMethodologyOption.filter(x=> x.label == name).length > 0 ? calMethodologyOption.filter(x=> x.label == name)[0].label : '';
    }
    
    indexType(name: any): any {
        let indexTypeOption: any[] = [
            { index:1, name: 'PR', value: false, label: 'PR (Price Return)', colspan: "1" },
            { index:2, name: 'NTR', value: false, label: 'NTR (Net Total Return)', colspan: "1" },
            { index:3, name: 'GTR', value: false, label: 'GTR (Gross Total Return)', colspan: "1" },
            { index:4, name: 'ALL', value: false, label: 'ALL', colspan: "1" }
        ];
        return indexTypeOption.filter(x=> x.name == name).length > 0 ? indexTypeOption.filter(x=> x.name == name)[0].label : '';
    }
    
    saveAs(name: any): any {
        let saveAsOption: any[] = [
            { name: 'fileType', value: 'CSV', label: 'CSV', colspan: "1" },
            { name: 'fileType', value: 'JSON', label: 'JSON', colspan: "3" }
        ];
        return saveAsOption.filter(x=> x.value == name).length > 0 ? saveAsOption.filter(x=> x.value == name)[0].label : '';
    }

    customValue(value: any): any{
        return this.customOption.filter(x=>x.value == value).length > 0 ? this.customOption.filter(x=>x.value == value)[0].label : '';
    }

    eMails(value: string): any{
        return value ? value.split(','): [];
    }

}
