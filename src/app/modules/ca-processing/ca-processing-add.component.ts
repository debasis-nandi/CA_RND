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
import { GlobalConst, DocType, EventType, Template, Action } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { ISanityModel, IMasterData, IRequest, IRequestPost, ICountryTaxRate, IMasterSanity } from '../../core/models/ca-processing-add.model';

@Component({
    selector: 'app-ca-processing-add',
    templateUrl: './ca-processing-add2.component.html',
    styleUrls: ['ca-processing.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers:[DatePipe]
})
export class CAProcessingAddComponent implements OnInit, AfterViewInit {
    
    caProcessingAddForm:FormGroup;
    addCountryTaxRateForm:FormGroup;

    loading: boolean = false;
    msgs: any[] = [];
    sanityMsgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    maxUploadedFileSize: number = GlobalConst.maxUploadedFileSize;
    myFromDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', componentDisabled: true };
    
    uploadedFiles: any[] = [];
    keywords: string;
    userInfo: any;
    createdDate: any;
    requestID: any;
    inputFile: any;
    
    total: number;
    error: number;
    success: number;
    fileid: any;
    sanityType: string;

    userPreferencesOption: any[] = [];
    customOption: any[] = [];
    payDateOption: any[] = [];
    calculationMethodologyOption: any[] = [];
    indexTypeOption: any[] = [];
    saveAsOption: any[] = [];
    csvRecords: ISanityModel[] = [];
    validRecords: ISanityModel[] = [];
    downloadRecords: ISanityModel[] = [];

    isCustom: boolean = false;
    isFlat: boolean = false;
    disabled: boolean = false;
    isVisible: boolean = false;
    sanityStatus: boolean = false;
    isSubmitVisible: boolean = false;

    countryOption: any[] = [];
    countryTaxRateList: ICountryTaxRate[] = [];
    
    sanityList: IMasterSanity[] = [];
    sanityGroupList: IMasterSanity[] = [];
    activeSanityList: IMasterSanity[] = []

    constructor(private fb:FormBuilder, private router: Router, private route: ActivatedRoute, private service: HttpService, public datepipe: DatePipe) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
        this.getUserPreferencesOption();
        this.getCustomOption();
        this.getpayDateOption();
        this.getCalculationMethodology();
        this.getIndexType();
        this.getSaveAs();
        this.getCountryOption();
        this.getSanityList();
        
        this.route.params.subscribe(params => {
            this.requestID = params['id'] || null;
            this.disabled = this.requestID ? true : false;
            if (this.requestID){
                this.getPreferenceOnRequestId(this.requestID);
            }   
        });

        this.caProcessingAddForm = this.fb.group({
            userPreferences: [{value: '', disabled: this.disabled},[Validators.required]],
            keywords:[{value: '', disabled: this.disabled}],
            payDate: this.createFormGroup(this.payDateOption),
            calculationMethodology: this.createFormGroup(this.calculationMethodologyOption),
            indexType: this.createFormGroup(this.indexTypeOption),
            withHoldingTax:[''],
            customValue:[''],
            taxRate:[{value: '', disabled: this.disabled}],
            flatTaxRate:[{value: '', disabled: this.disabled}],
            emailAlerts:[false],
            email:[''],
            saveAs: this.createFormGroup(this.saveAsOption),
            comment:[{value: '', disabled: this.disabled}],
            masterSanity:this.createSanityFormGroup(this.sanityList)
        });

        this.formControlValueChanged();

        this.addCountryTaxRateForm = this.fb.group({
            country: [{value: ''},[Validators.required]],
            countryTaxRate: [{value: ''},[Validators.required, Validators.pattern(/^(100(?:\.0000?)?|\d?\d(?:\.\d{1,4}?)?)$/)]]
        });

    }

    ngAfterViewInit() {
    }

    formControlValueChanged(): void {

        // set email address based on email alert
        let email = this.caProcessingAddForm.get('email');
        this.caProcessingAddForm.get('emailAlerts').valueChanges.subscribe(checked => {
            if (checked == 'true') {
                email.setValidators([Validators.required, Validators.email]);
                email.markAsDirty();
            }
            else {
                email.clearValidators()
                email.setValue(['']);
            }
            email.updateValueAndValidity();
        });

        // select value based on withHoldingTax 
        let customValue = this.caProcessingAddForm.get('customValue');
        this.caProcessingAddForm.get('withHoldingTax').valueChanges.subscribe(mode => {
            customValue.clearValidators();
            customValue.setValue("");
            this.isCustom = false;
            if (mode == 'custom') {
                this.isCustom = true;
                customValue.setValidators([Validators.required]);
                customValue.markAsDirty();
            }
            customValue.updateValueAndValidity();
        });

        // get flat tax rate based on select flat check box
        let flatTaxRate = this.caProcessingAddForm.get('flatTaxRate');
        this.caProcessingAddForm.get('taxRate').valueChanges.subscribe(value=>{
            flatTaxRate.clearValidators();
            flatTaxRate.setValue("");
            this.isFlat = false;
            if(value == 'flat'){
                this.isFlat = true;
                this.countryTaxRateList = [];
                flatTaxRate.setValidators([Validators.required, Validators.pattern(/^(100(?:\.0000?)?|\d?\d(?:\.\d{1,4}?)?)$/)]);
                flatTaxRate.markAsDirty();
            }
            if(value == ''){
                this.countryTaxRateList = [];
                // for sanity check
                let file : any = this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : '';
                if(file){
                    this.sanityCheck(file);
                }
            }
            flatTaxRate.updateValueAndValidity();
        });
    }

    onChangeFlatTaxRate(value: any){
        // for sanity check
        let file : any = this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : '';
        if(file){
            this.sanityCheck(file);
        }
    }

    onPreferenceChange(selectedValue: any) {
        this.sanityMsgs = [];
        if (selectedValue) {
            this.getPreference(selectedValue);
        }
        else {
            this.resetFormValue();
        }

        if (this.uploadedFiles.length == 0 && this.csvRecords.length > 0) {
            this.csvRecords = [];
        }
    }

    createFormGroup(items: any[]): FormGroup {
        let formGroup: FormGroup = new FormGroup({});
        for (let item of items) {
            let control: FormControl = new FormControl(item.value);
            formGroup.addControl(item.name, control);
        }
        return formGroup;
    }

    createSanityFormGroup(items: any[]): FormGroup {
        let formGroup: FormGroup = new FormGroup({});
        for (let item of items) {
            let control: FormControl = new FormControl(item.value);
            formGroup.addControl(item.id, control);
        }
        return formGroup;
    }

    multipleCheckboxRequireOne(fa: FormArray) {
        let valid = false;
        for (let x = 0; x < fa.length; ++x) {
            if (fa.at(x).value) {
                valid = true;
                break;
            }
        }
        return valid ? null : {
            multipleCheckboxRequireOne: true
        };
    }

    getPreferenceOnRequestId(requestId: any): void {
        this.loading = true;
        this.service.get(ApiConfig.getRequestApi.replace("{Id}", requestId)).subscribe(res => {
            if (res) {
                this.keywords = res['keywords'] ? res['keywords'] : '';
                this.createdDate = res['createddate'] ? AppUtil.getDate(res['createddate'], 'dd-mm-yyyy') : '';
                this.inputFile = res['fileName'] ? res['fileName'] : '';
                this.caProcessingAddForm.patchValue({
                    //keywords: res['keywords'],
                    comment: res['comments'],
                    //flat: res['flatrate'] ? true : false,
                    //flatValue: res['flatrate']
                });
                this.onPreferenceChange(res['preferenceID']);
            }
            this.loading = false;
        }, error => { this.loading = false; });
    }

    getPreference(id: any) {
        this.loading = true;
        this.service.get(ApiConfig.getPreferenceOnIdApi.replace("{Id}", id)).subscribe(res => {
            let formData: any = res;
            this.setFormValue(formData);
            // for sanity check
            let file: any = this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : '';
            if (file) {
                this.sanityCheck(file);
            }
            this.isVisible = true;
            this.loading = false;
        }, error => { 
            this.loading = false; 
        });
    }

    getUserPreferencesOption() {
        this.loading = true;
        this.service.get(ApiConfig.getUserPreferencesOptionApi).subscribe(res => {
            if (res.result) {
                let preferenceList: any[] = res.PreferenceList ? res.PreferenceList : [];
                /*this.userPreferencesOption = preferenceList.map(x => {
                    return { value: x.id, label: x.profileName };
                });*/
                let options: any[] = [];
                options.push({value:'', label:'Select user preference'});
                preferenceList.forEach(x=>{
                    options.push({ value: x.id, label:x.profileName });
                });
                this.userPreferencesOption = options;
            }
            this.loading = false;
        }, error => { this.loading = false; });
    }

    getCustomOption() {
        this.loading = true;
        this.service.get(ApiConfig.getGetCustomOptionApi).subscribe(res => {
            if (res.result) {
                let customList: any[] = res.CustomList ? res.CustomList : [];
                this.customOption = customList.map(x => {
                    return { value: x.taxname, label: x.taxname };
                });
            }
            this.loading = false;
        }, error => { this.loading = false; });
    }

    getpayDateOption() {
        this.payDateOption = [
            { index:1, name: 'japan', value: false, label: 'Japan', colspan: "1" },
            { index:2, name: 'korea', value: false, label: 'South Korea', colspan: "1" },
            { index:3, name: 'all', value: false, label: 'ALL', colspan: "2" }
        ];
    }
    
    getCalculationMethodology() {
        this.calculationMethodologyOption = [
            { index:1, name: 'stockBase', value: false, label: 'Stock Base', colspan: "1" },
            { index:2, name: 'divisorBase', value: false, label: 'Divisor Base', colspan: "1" },
            { index:3, name: 'accuCash', value: false, label: 'Accu Cash', colspan: "1" },
            { index:4, name: 'all', value: false, label: 'ALL', colspan: "1" }
        ];
    }
    
    getIndexType() {
        this.indexTypeOption = [
            { index:1, name: 'pr', value: false, label: 'PR (Price Return)', colspan: "1" },
            { index:2, name: 'ntr', value: false, label: 'NTR (Net Total Return)', colspan: "1" },
            { index:3, name: 'gtr', value: false, label: 'GTR (Gross Total Return)', colspan: "1" },
            { index:4, name: 'all', value: false, label: 'ALL', colspan: "1" }
        ];
    }
    
    getSaveAs() {
        /*this.saveAsOption = [
            { name: 'csv', value: false, label: 'CSV', colspan: "1" },
            //{ name: 'xml', value: false, label: 'XML', colspan: "1" },
            //{ name: 'pdf', value: false, label: 'PDF', colspan: "1" },
            //{ name: 'xls', value: false, label: 'XLS', colspan: "1" },
            { name: 'json', value: false, label: 'JSON', colspan: "3" }
        ];*/
        this.saveAsOption = [
            { name: 'fileType', value: 'CSV', label: 'CSV', colspan: "1" },
            { name: 'fileType', value: 'JSON', label: 'JSON', colspan: "3" }
        ];
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
                this.sanityCheck(file);
            }
        }
    }

    sanityCheck(file: File) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            let csvData = reader.result;
            let csvRecordsArray = (<string>csvData).split(/\r\n|\n/);
            let headersRow = this.getHeaderArray(csvRecordsArray);
            let clientSanityRecords: any[] = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
            let clientSanityStatus: boolean = clientSanityRecords.filter(x => x.sanityStatus == false).length > 0 ? false : true;
            if (clientSanityStatus){
                this.sanityType = 'server';
                this.onServerSanity(clientSanityRecords);
            }   
            else{
                this.downloadRecords = clientSanityRecords;
                this.csvRecords = clientSanityRecords.filter(x => x.sanityStatus == false);
                this.total = clientSanityRecords.length;
                this.success = clientSanityRecords.filter(x => x.sanityStatus == true).length;
                this.error = clientSanityRecords.filter(x => x.sanityStatus == false).length;
                this.fileid = null;
                this.sanityType = 'client'
                //console.log(this.csvRecords);
            }   
        };

        reader.onerror = function () {
            console.log('error is occured while reading file!');
        };
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
        let csvArr = [];
        for (let i = 1; i < csvRecordsArray.length; i++) {
            let curruntRecord = (<string>csvRecordsArray[i]).split(',');
            if (curruntRecord.length == headerLength) {
                let csvRecord: ISanityModel = {};
                csvRecord.rowId = i;
                csvRecord.source = (curruntRecord[0] && curruntRecord[0].trim() !='') ? curruntRecord[0] : '';
                csvRecord.isin = (curruntRecord[1] && curruntRecord[1].trim() != '') ? curruntRecord[1] : '';
                csvRecord.country = (curruntRecord[2] && curruntRecord[2].trim() != '') ? curruntRecord[2] : '';
                csvRecord.identifier = (curruntRecord[3] && curruntRecord[3].trim() != '') ? curruntRecord[3] : '';
                csvRecord.priceCurrency = (curruntRecord[4] && curruntRecord[4].trim() != '') ? curruntRecord[4] : '';
                csvRecord.exdate = (curruntRecord[5] && curruntRecord[5].trim() != '') ? curruntRecord[5] : '';
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
                csvRecord.paydate = (curruntRecord[17] && curruntRecord[17].trim() != '') ? curruntRecord[17] : '';
                csvRecord.payDatePriceT1 = (curruntRecord[18] && curruntRecord[18].trim() != '') ? curruntRecord[18] : "0.00";
                csvRecord.payDateFxT1 = (curruntRecord[19] && curruntRecord[19].trim() != '') ? curruntRecord[19] : "0.00";
                csvRecord.frankingPercent = (curruntRecord[20] && curruntRecord[20].trim() != '') ? curruntRecord[20] : "0.00";
                csvRecord.incomePercent = (curruntRecord[21] && curruntRecord[21].trim() != '') ? curruntRecord[21] : "0.00";
                csvRecord.reit = (curruntRecord[22] && curruntRecord[22].trim() != '') ? curruntRecord[22] : '';
                // update tax rate
                if(this.caProcessingAddForm.controls['taxRate'].value == 'taxRateCountry'){
                    let objTaxRate: any[] = this.countryTaxRateList.filter(x=>x.countryCode == csvRecord.country);
                    csvRecord.taxRate = objTaxRate.length > 0 ? objTaxRate[0].taxRate : '';
                }
                else{
                    csvRecord.taxRate = '';
                }
                csvRecord.sanityData = this.onClientSanity(csvRecord);
                csvRecord.sanityStatus = csvRecord.sanityData.length == 0 ? true : false;
                csvRecord.errorSummary = this.onClientSanityErrorSummary(csvRecord.sanityData);
                csvArr.push(csvRecord);
            }
        }
        return csvArr;
    }

    onClientSanityErrorSummary(errors: any[]): any{
        let strMsg: string = '';
        if(errors.length > 0){
            for(let err of errors){
                strMsg+= '[' + err.field + ': ' + err.msg + ']';
            }
        }
        return strMsg ? strMsg : ' ';
    }

    mapServerSanityData(records: any) {
        let csvArr = [];
        if (records.length > 0) {
            for (let i = 0; i < records.length; i++) {
                let record: any = {};
                record = records[i];
                record.rowId = i;
                //record.sanityData = this.mapServerSanity(record.Error_list);
                //record.sanityStatus = record.sanityData.length == 0 ? true : false;
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
            // remove file from batch.
            this.uploadedFiles.splice(index, 1);
            this.csvRecords = [];
            this.sanityStatus = false;
        }
    }

    mapServerSanity(errorList: any[]) {
        let sanityData: any[] = [];
        if (errorList.length > 0) {
            for (let rec of errorList) {
                sanityData.push({ field: 'Error', msg: rec.Error });
            }
        }
        return sanityData;
    }

    onClientSanity(rowData:ISanityModel): any[]{
        let sanityData: any[] = [];
        if(rowData.eventType.toLowerCase() == EventType.cashDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.rightsIssue.toLowerCase() || rowData.eventType.toLowerCase() == EventType.specialCashDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.spinOff.toLowerCase() || rowData.eventType.toLowerCase() == EventType.stockDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.stockSplit.toLowerCase()){
            if (!rowData.identifier){
                sanityData.push({ field: 'Identifier', msg: 'Mandatory field.' });
            }
            if(!rowData.exdate){
                sanityData.push({ field: 'Ex Date', msg: 'Mandatory field.' });
            }
            if (!rowData.eventType){
                sanityData.push({ field: 'Event Type', msg: 'Mandatory field.' });
            }
            if (!rowData.eventCurrency){
                sanityData.push({ field: 'Event Currency', msg: 'Mandatory field.' });
            }
            if (!rowData.priceCurrency){
                sanityData.push({ field: 'Price Currency', msg: 'Mandatory field.' });
            } 
        }

        if(rowData.eventType.toLowerCase() == EventType.cashDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.specialCashDividend.toLowerCase()){
            if (!rowData.eventamount){
                sanityData.push({ field: 'Event Amount', msg: 'Mandatory field.' });
            }
            if (!rowData.priceExT1){
                sanityData.push({ field: 'Price (Ex date -1)', msg: 'Mandatory field.' });
            }   
            if (!rowData.fxexT1){
                sanityData.push({ field: 'FX(Ex date -1)', msg: 'Mandatory field.' });
            }
            /*if (!rowData.paydate){
                sanityData.push({ field: 'Pay Date', msg: 'Mandatory field.' });
            }*/
            if (!rowData.payDatePriceT1){
                sanityData.push({ field: 'Pay Date PriceT1', msg: 'Mandatory field.' });
            }
            if (!rowData.payDateFxT1){
                sanityData.push({ field: 'Pay Date FxT1', msg: 'Mandatory field.' });
            }
            if (!rowData.frankingPercent){
                sanityData.push({ field: 'Franking Percent', msg: 'Mandatory field.' });
            }
            if (!rowData.incomePercent){
                sanityData.push({ field: 'Income Percent', msg: 'Mandatory field.' });
            }
            if (!rowData.reit){
                sanityData.push({ field: 'REIT', msg: 'Mandatory field.' });
            }
        }

        if(rowData.eventType.toLowerCase() == EventType.stockDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.rightsIssue.toLowerCase()){
            if (!rowData.termoldshares){
                sanityData.push({ field: 'Term Old Shares', msg: 'Mandatory field.' });
            }
            if (!rowData.termnewshares){
                sanityData.push({ field: 'Term New Shares', msg: 'Mandatory field.' });
            }
            if (!rowData.priceExT1){
                sanityData.push({ field: 'Price ExT1', msg: 'Mandatory field.' });
            }
            if (!rowData.fxexT1){
                sanityData.push({ field: 'FxExT1', msg: 'Mandatory field.' });
            }
            if (!rowData.reit){
                sanityData.push({ field: 'REIT', msg: 'Mandatory field.' });
            }
            if (!rowData.offerprice && rowData.eventType.toLowerCase() == EventType.rightsIssue.toLowerCase()){
                sanityData.push({ field: 'Offer Price', msg: 'Mandatory field.' });
            }
        }
        
        if(rowData.eventType.toLowerCase() == EventType.spinOff.toLowerCase()){
            if (!rowData.offerprice){
                sanityData.push({ field: 'Offer Price', msg: 'Mandatory field.' });
            }
            if (!rowData.termoldshares){
                sanityData.push({ field: 'Term Old Shares', msg: 'Mandatory field.' });
            }
            if (!rowData.termnewshares){
                sanityData.push({ field: 'Term New Shares', msg: 'Mandatory field.' });
            }
            if (!rowData.spunoffcash){
                sanityData.push({ field: 'Spun Off Cash', msg: 'Mandatory field.' });
            }
            if (!rowData.spunoffstock){
                sanityData.push({ field: 'Spun Off Stock', msg: 'Mandatory field.' });
            }
            if (!rowData.fxexT1){
                sanityData.push({ field: 'FxExT1', msg: 'Mandatory field.' });
            }
            if (!rowData.priceExT1){
                sanityData.push({ field: 'Price ExT1', msg: 'Mandatory field.' });
            }
        }
        
        if(rowData.eventType.toLowerCase() == EventType.stockSplit.toLowerCase()){
            if (!rowData.termoldshares){
                sanityData.push({ field: 'Term Old Shares', msg: 'Mandatory field.' });
            }
            if (!rowData.termnewshares){
                sanityData.push({ field: 'Term New Shares', msg: 'Mandatory field.' });
            }
            if (!rowData.fxexT1){
                sanityData.push({ field: 'FxExT1', msg: 'Mandatory field.' });
            }
            if (!rowData.priceExT1){
                sanityData.push({ field: 'Price ExT1', msg: 'Mandatory field.' });
            }
        }
        
        // check (pay date) mandatory when country is Japan(JP)
        if(rowData.country && rowData.country.toLowerCase() == 'jp'){
            let payDate: any = this.caProcessingAddForm.controls['payDate'].value;
             if(payDate['japan'] && !rowData.paydate){
                sanityData.push({ field: 'Pay Date', msg: 'Mandatory field.' });
             }
        }
        // check (pay date) mandatory when country is South Korea(KR) 
        if(rowData.country && rowData.country.toLowerCase() == 'kr'){
            let payDate: any = this.caProcessingAddForm.controls['payDate'].value;
             if(payDate['korea'] && !rowData.paydate){
                sanityData.push({ field: 'Pay Date', msg: 'Mandatory field.' });
             }
        }

        // check date format
        if (rowData.exdate && !AppUtil.checkDateFormat(rowData.exdate, 'mmddyyyy')){
            sanityData.push({ field: 'ExDate', msg: 'Invalid date format found. Should be mm-dd-yyyy or mm/dd/yyyy.' });
        }   
        if (rowData.paydate && !AppUtil.checkDateFormat(rowData.paydate, 'mmddyyyy')){
            sanityData.push({ field: 'PayDate', msg: 'Invalid date format found. Should be mm-dd-yyyy or mm/dd/yyyy.' });
        }

        // check number
        if (Number.isNaN(Number(rowData.eventamount))){
            sanityData.push({ field: 'Event Amount', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.offerprice))){
            sanityData.push({ field: 'Offer Price', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.termoldshares))){
            sanityData.push({ field: 'Terms Old Shares', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.termnewshares))){
            sanityData.push({ field: 'Terms New Shares', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.spunoffcash))){
            sanityData.push({ field: 'Spun Off Cash', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.priceExT1))){
            sanityData.push({ field: 'Price ExDate1', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.fxexT1))){
            sanityData.push({ field: 'Fx ExDate1', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.payDatePriceT1))){
            sanityData.push({ field: 'Price PayDate1', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.payDateFxT1))){
            sanityData.push({ field: 'Fx PayDate1', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.frankingPercent))){
            sanityData.push({ field: 'Franking', msg: 'Invalid data.' });
        }   
        if (Number.isNaN(Number(rowData.incomePercent))){
            sanityData.push({ field: 'For Income', msg: 'Invalid data.' });
        }
        
        // check for mandatory value.
        if(rowData.reit == ''){
            sanityData.push({ field: 'REIT', msg: 'Mandatory field. Should be 0 or 1.' });
        }
        // check for boolean value.
        if (rowData.reit != '' && rowData.reit != Number(1) && rowData.reit != Number(0)){
            sanityData.push({ field: 'REIT', msg: 'Invalid REIT flag. Should be 0 or 1.' });
        }
        
        // file level duplicate data entry check based on isin, country, ex date, event type, event name.
        let dupRecords: any[] = this.csvRecords.filter(x => x.isin == rowData.isin && x.country == rowData.country && x.exdate == rowData.exdate && x.eventType == rowData.eventType && x.eventName == rowData.eventName);
        if (dupRecords.length > 1){
            sanityData.push({ field: 'Duplicate', msg: 'Duplicate record found.' });
        }

        return sanityData;
    }

    setFormValue(formData: any) {
        //console.log(formData);
        this.caProcessingAddForm.patchValue({
            userPreferences: formData['id'],
            payDate: {
                japan: formData['pay_date_japan'] == 1 ? true : false,
                korea: formData['pay_date_korea'] == 1 ? true : false,
                all: formData['pay_date_japan'] == 1 && formData['pay_date_korea'] == 1 ? true : false
            },
            calculationMethodology: {
                stockBase: (formData['caltype'].indexOf("Stock Base") > -1) ? true : false,
                divisorBase: (formData['caltype'].indexOf("Divisor Base") > -1) ? true : false,
                accuCash: (formData['caltype'].indexOf("Accu Cash") > -1) ? true : false,
                all: (formData['caltype'].indexOf("Stock Base") > -1 && formData['caltype'].indexOf("Divisor Base") > -1 && formData['caltype'].indexOf("Accu Cash") > -1) ? true : false
            },
            indexType: {
                pr: (formData['indextype'].indexOf("PR") > -1) ? true : false,
                ntr: (formData['indextype'].indexOf("NTR") > -1) ? true : false,
                gtr: (formData['indextype'].indexOf("GTR") > -1) ? true : false,
                all: (formData['indextype'].indexOf("PR") > -1 && formData['indextype'].indexOf("NTR") > -1 && formData['indextype'].indexOf("GTR") > -1) ? true : false
            },
            saveAs: {
                /*csv: (formData['saveas'].indexOf("CSV") > -1) ? true : false,
                //xml: (formData['saveas'].indexOf("PDF") > -1) ? true : false,
                //pdf: (formData['saveas'].indexOf("XLS") > -1) ? true : false,
                //xls: (formData['saveas'].indexOf("XML") > -1) ? true : false,
                json: (formData['saveas'].indexOf("JSON") > -1) ? true : false*/
                fileType: formData['saveas'] ? formData['saveas'][0] : ''
            },
            withHoldingTax: formData['whttype'],
            customValue: formData['countryTaxRate'],
            emailAlerts: formData['emailalert'] ? "true" : "false",
            email: formData['emailalert']
            //comment: formData['comment'],
            //flat: formData['flatValue'] ? true : false,
            //flatValue: formData['flatValue']
        });
    }

    resetFormValue() {
        this.uploadedFiles = [];
        this.csvRecords = [];
        this.isVisible = false;
        this.sanityMsgs = [];
        this.caProcessingAddForm.patchValue({
            keywords:"",
            payDate: {
                japan: false,
                korea: false,
                all: false
            },
            calculationMethodology: {
                stockBase: false,
                divisorBase: false,
                accuCash: false,
                all: false
            },
            indexType: {
                pr: false,
                ntr: false,
                gtr: false,
                all: false
            },
            saveAs: {
                csv: false,
                //xml: false,
                //pdf: false,
                //xls: false,
                json: false
            },
            withHoldingTax: "",
            customValue: "",
            taxRate: "",
            flatTaxRate: "",
            emailAlerts: false,
            email: "",
            comment:""
        });
    }

    onReset(){
        //this.uploadedFiles = [];
        //this.csvRecords = [];
        this.caProcessingAddForm.patchValue({
            userPreferences:''
        });
        this.resetFormValue();
    }

    onServerSanity(records: any[]): void{
        if(this.caProcessingAddForm.valid){
            // master data
            let masterData: IMasterData = {
                fileName: this.uploadedFiles.length > 0 ? this.uploadedFiles[0].name : null,
                preferenceID: this.caProcessingAddForm.controls['userPreferences'].value,
                account: this.userInfo.account_id,
                client: this.userInfo.client_id,
                flatrate: this.caProcessingAddForm.controls['flatTaxRate'].value ? this.caProcessingAddForm.controls['flatTaxRate'].value : null,
                comment: this.caProcessingAddForm.controls['comment'].value ? this.caProcessingAddForm.controls['comment'].value : null,
                keywords: this.caProcessingAddForm.controls['keywords'].value ? this.caProcessingAddForm.controls['keywords'].value : null, 
                user: this.userInfo.userid,
                createdby: this.userInfo.username,
                createddate: this.datepipe.transform(new Date(), 'yyyy-MM-dd')
            };
            // request data
            let requestData: IRequest[] = this.csvMapping(records);
            // post model
            let requestPostModel: IRequestPost = {
                masterdata : masterData,
                request : requestData
            };
            //console.log(JSON.stringify(requestPostModel));
            this.loading = true;
            this.service.post(ApiConfig.serverSanityApi, requestPostModel).subscribe(res=>{
                if (res.result) {
                    this.total = res.total;
                    this.success = res.success;
                    this.error = res.error;
                    this.fileid = res.fileid;
                    this.csvRecords = this.mapServerSanityData(res.results);
                    //this.csvRecords = [];
                    this.sanityMsgs = [];
                    this.sanityStatus = this.csvRecords.length == 0 ? true : false;
                    if (this.sanityStatus){
                        this.validRecords = records;
                        this.sanityMsgs.push({severity:'success', summary:'', detail:'Input data successfully loaded. Request ready for processing.'});
                    }
                    else{
                        this.validRecords = [];
                    }   
                }
                this.loading = false;
            }, error=>{
                this.showError("Internal server error.");
                this.loading = false;
            });
        }
    }

    onSubmit(): void{
        //let dd: any = this.caProcessingAddForm.controls['masterSanity'].value;
        console.log(this.activeSanityList);
        if(this.caProcessingAddForm.valid){
            // master data
            let masterData: IMasterData = {
                fileName: this.uploadedFiles.length > 0 ? this.uploadedFiles[0].name : null,
                preferenceID: this.caProcessingAddForm.controls['userPreferences'].value,
                account: this.userInfo.account_id,
                client: this.userInfo.client_id,
                flatrate: this.caProcessingAddForm.controls['flatTaxRate'].value ? this.caProcessingAddForm.controls['flatTaxRate'].value : null,
                comment: this.caProcessingAddForm.controls['comment'].value ? this.caProcessingAddForm.controls['comment'].value : null,
                keywords: this.caProcessingAddForm.controls['keywords'].value ? this.caProcessingAddForm.controls['keywords'].value : null, 
                user: this.userInfo.userid,
                createdby: this.userInfo.username,
                createddate: this.datepipe.transform(new Date(), 'yyyy-MM-dd')
            };
            // request data
            let requestData: IRequest[] = this.csvMapping(this.validRecords);
            // post model
            let requestPostModel: IRequestPost = {
                masterdata : masterData,
                request : requestData
            };

            //console.log(JSON.stringify(requestPostModel));
            this.loading = true;
            this.service.post(ApiConfig.createRequestApi, requestPostModel).subscribe(res=>{
                if (res.result) {
                    this.showSuccess(res['message']);
                    setTimeout(() => {
                        this.router.navigateByUrl('ca-processing');
                    }, GlobalConst.growlLife);
                }
                this.loading = false;
            }, error=>{
                this.showError("Internal server error.");
                this.loading = false;
            });
        }
    }

    isDisabled(): boolean{
        return (this.caProcessingAddForm.valid && this.sanityStatus) ? false : true;
    }

    csvMapping(csvList:ISanityModel[]): IRequest[] {
        let req: IRequest[] = [];
        if(csvList.length > 0){
            csvList.forEach(item=>{
                let row:IRequest = {
                    source: item.source,
                    isin: item.isin,
                    country: item.country,
                    identifier: item.identifier,
                    priceCurrency: item.priceCurrency,
                    exdate: item.exdate ? AppUtil.getDate(item.exdate, 'mm-dd-yyyy') : '',
                    eventType: item.eventType,
                    eventName: item.eventName,
                    eventCurrency: item.eventCurrency,
                    eventamount: item.eventamount,
                    offerprice: item.offerprice,
                    termoldshares: item.termoldshares,
                    termnewshares: item.termnewshares,
                    spunoffstock: item.spunoffstock,
                    spunoffcash: item.spunoffcash,
                    priceExT1: item.priceExT1,
                    fxexT1: item.fxexT1,
                    taxRate: item.taxRate,
                    paydate: item.paydate ? AppUtil.getDate(item.paydate,'mm-dd-yyyy') : '',
                    payDatePriceT1:item.payDatePriceT1,
                    payDateFxT1: item.payDateFxT1,
                    frankingPercent: item.frankingPercent,
                    incomePercent: item.incomePercent,
                    reit: item.reit
                };
                req.push(row);
            });
        }
        return req;
    }

    onTemplateDownload(): void {
        this.service.getCsv(ApiConfig.templatePath + Template.caInput).subscribe(data => {
            AppUtil.downloadFile(data, Template.caInput);
        }, error => { console.log(error) });
    }

    onDownloadGuidelines(): void{
        AppUtil.downloadStaticFile(ApiConfig.templatePath, Template.instructionsGuidelines);
    }
    
    onDownloadSanity(){
        let fileName: any = 'sanity-errors.csv';
        if(this.sanityType == 'client'){
            let fields: any[] = ['errorSummary','source','isin','country','priceCurrency','exdate','eventType','eventName',
            'eventCurrency','eventamount','offerprice','termoldshares','termnewshares','spunoffstock','spunoffcash',
            'priceExT1','fxexT1','taxRate','paydate','payDatePriceT1','payDateFxT1','frankingPercent','incomePercent',
            'reit'];
            let csvData = AppUtil.ConvertToCSV(this.downloadRecords, fields); 
            AppUtil.downloadFile(csvData, fileName);
        }
        if(this.sanityType == 'server'){
            let api: any = ApiConfig.downloadSanityErrorsApi.replace("{fileid}",this.fileid);
            this.service.getData(api, 'csv').subscribe(res => {
                //res = {"result":false,"message":"Input Request still in process."};
                let result : any = res.result == undefined ? true : false;
                if (result) {
                    AppUtil.downloadFile(res, fileName);
                }
                else {
                    this.showError(res['message']);
                }
                this.loading = false;
            }, err => {
                this.loading = false;
                this.showError("Internal server error");
                console.log(err);
            });
        }
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
            fileType = this.caProcessingAddForm.controls['saveAs'].value['fileType'];
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

    addNewTaxRate(event: any, overlayPanel: OverlayPanel){
        this.addCountryTaxRateForm.controls['country'].setValue('');
        this.addCountryTaxRateForm.controls['countryTaxRate'].setValue('');
        overlayPanel.toggle(event);
    }

    getCountryOption() {
        this.loading = true;
        this.service.get(ApiConfig.getGetCountryOptionApi).subscribe(res => {
            if (res.result) {
                let countryList: any[] = res.CustomList ? res.CustomList : [];
                /*this.countryOption = countryList.map(x => {
                    return { value: x.countryCode, label: x.name +"("+ x.countryCode +")" };
                });*/
                let options: any[] = [];
                options.push({value:'', label:'Select'});
                countryList.forEach(x=>{
                    options.push({ value: x.countryCode, label: x.name +"("+ x.countryCode +")" });
                });
                this.countryOption = options;
            }
            this.loading = false;
        }, error => { this.loading = false });
    }

    AddTaxRate(){
        if(this.addCountryTaxRateForm.valid){
            let selectedCountry: any = this.addCountryTaxRateForm.controls['country'].value;
            let countryTaxRate: any = this.addCountryTaxRateForm.controls['countryTaxRate'].value;
            let countryName: any = this.countryOption.filter(x=>x.value == selectedCountry)[0].label;
            let objTaxRate: ICountryTaxRate = {
                countryCode : selectedCountry,
                countryName : countryName ? countryName : '',
                taxRate : countryTaxRate
            };
            let isExist: boolean = this.countryTaxRateList.filter(x=>x.countryCode == selectedCountry).length > 0 ? true : false;
            if (!isExist) {
                this.countryTaxRateList.push(objTaxRate);
                this.addCountryTaxRateForm.controls['country'].setValue('');
                this.addCountryTaxRateForm.controls['countryTaxRate'].setValue('');
                // for sanity check
                let file : any = this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : '';
                if(file){
                    this.sanityCheck(file);
                }
            }
            else {
                this.showError("Duplicate entry for country : " + objTaxRate.countryName);
            }
        }
    }

    onDelete(index: any){
        this.countryTaxRateList.splice(index,1);
        // for sanity check
        let file : any = this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : '';
        if(file){
            this.sanityCheck(file);
        }
    }

    showSuccess(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'success', detail: message });
    }

    showError(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', detail: message });
    }

    getSanityList(): void {
        this.sanityList = [{
            "id": 1,
            "name": "Pay Date",
            "value": true,
            "level": 1,
            "group": "DataValidation",
            "description": null,
            "softsanity": 0
        },
        {
            "id": 2,
            "name": "Event Amount",
            "value": false,
            "level": 1,
            "group": "DataValidation",
            "description": null,
            "softsanity": 0
        },
        {
            "id": 3,
            "name": "Pay Date",
            "value": false,
            "level": 1,
            "group": "MandatoryData",
            "description": null,
            "softsanity": 0
        },
        {
            "id": 4,
            "name": "Event Amount",
            "value": true,
            "level": 1,
            "group": "MandatoryData",
            "description": null,
            "softsanity": 0
        }];

        this.activeSanityList = this.sanityList.filter(x=>x.value == true);

        if (this.sanityList.length > 0) {
            this.sanityGroupList = [];
            let source = from(this.sanityList);
            let groupArray = source.pipe(
                groupBy(x => x.group),
                mergeMap(group => group.pipe(toArray()))
            );
            groupArray.subscribe(item => {
                if (item.length > 0) {
                    let sanity: IMasterSanity = {};
                    sanity = item[0];
                    sanity.child = item;
                    this.sanityGroupList.push(sanity);
                }
            });
        }
    }

    onChange(item: any, isChecked: boolean) {
        if (isChecked) {
            this.activeSanityList.push(item);
        } else {
            let index = this.activeSanityList.findIndex(x => x.id == item.id);
            if (index > -1) {
                this.activeSanityList.splice(index, 1);
            }
        }
    }

}
