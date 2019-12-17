import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';

import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { ConfirmationService } from 'primeng/primeng';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst, Template } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { IWhtList, IWht, IFilter } from '../../core/models/wht.model';

@Component({
    selector: 'app-view-wht',
    templateUrl: './view-wht.component.html',
    styleUrls: ['wht.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ViewWHTComponent implements OnInit {
    
    @ViewChild('myModal') modal:any;
    searchForm:FormGroup;
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    modalHeader: string;

    isAddNew: boolean = false;
    isBulkUpload: boolean = false;
    paginator: boolean = false;
    
    myFromDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    myToDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    searchFromDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    searchToDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    searchCountryOption: any[] = [{value:'', label:'Select'}];
    searchScheduleNameOption: any[] = [{value:'', label:'Select'}];

    scheduleNameOption: any[] = [];
    countryOption: any[] = [];
    whtTypeOption: any[] = [];
    reitOption: any[] = [];
    masterDataList: IWhtList[] = [];
    groupDataList:IWhtList[] = [];
    //groupDataListBackup:IWhtList[] = [];
    
    userInfo: any;
    postWht: IWht = {};
    filter: IFilter = {};
    modalCss: string = '';

    constructor(private fb:FormBuilder, private router: Router, private service: HttpService, private confirmationService: ConfirmationService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
        this.searchForm = this.fb.group({
            txtScheduleName: [''],
            country: [''],
            effectiveFrom: [''],
            effectiveTo: [''],
            whtType: ['']
        });
        this.getCountryOption();
        this.getWhtTypeOption();
        this.getREITOption();
        this.getTaxScheduleNameOption();
        this.getDataList(ApiConfig.getWhtApi);
    }

    onRowEditInit(rowData: any, index: number, subIndex: number) {
        rowData.childRecord[subIndex].edit= true;
    }

    onRowEditSave(rowData: any, index: number, subIndex: number) {
        if (rowData) {
            this.postWht = this.mapPostData(rowData.childRecord[subIndex]);
            let error: number = 0;
            
            if(!this.postWht.country){
                error++;
                this.showError('Country name is required.');
            }
            if(!this.postWht.taxdetail.effectiveFromDate){
                error++;
                this.showError('From date is required.');
            }
            if(isNaN(parseFloat(this.postWht.taxdetail.taxRate))){
                error++;
                this.showError('Tax rate is required.');
            }
            if (this.postWht.taxdetail.taxRate) {
                let pattern: any = /^(100(?:\.0000?)?|\d?\d(?:\.\d{1,4}?)?)$/;
                let isValid: boolean = pattern.test(this.postWht.taxdetail.taxRate);
                if (!isValid) {
                    error++;
                    this.showError('Tax rate should be 0 or between 1-100.');
                }
            }
            if(!this.postWht.WHTType){
                error++;
                this.showError('Tax Rate Schedule type is required.');
            }
            
            if (error == 0) {
                this.confirmationService.confirm({
                    message: 'Do you really want to change tax schedule? that may impact all transaction.',
                    accept: () => {
                        this.loading = true;
                        //let taxid: any = rowData.childRecord[subIndex].taxid;
                        let detailId: any = rowData.childRecord[subIndex].detailid;
                        let api: any = ApiConfig.updateWhtApi.replace("{id}", String(detailId));
                        this.service.put(api, this.postWht)
                            .subscribe(response => {
                                if (response.result) {
                                    this.showSuccess("Record updated successfully.");
                                    rowData.childRecord[subIndex].edit = false;
                                    this.getDataList(ApiConfig.getWhtApi);
                                }
                                //this.loading = false;
                            }, err => {
                                this.showError("Internal server error.");
                                this.loading = false;
                            });
                    }
                });
            }
        }
    }

    onRowEditCancel(rowData: any, index: number, subIndex: number) {
        rowData = this.groupDataList[index];
        //let groupDataList: any = this.groupDataListBackup;
        //rowData = groupDataList[index];

        let formDate: any = AppUtil.convert_DD_MM_YYYY_2Date(rowData.childRecord[subIndex].effectivefromDate);
        let toDate: any = AppUtil.convert_DD_MM_YYYY_2Date(rowData.childRecord[subIndex].effectivetoDate);
        rowData.childRecord[subIndex].effectiveFromDatePicker = AppUtil.setDate(formDate);
        rowData.childRecord[subIndex].effectiveToDatePicker = AppUtil.setDate(toDate);
        rowData.childRecord[subIndex].edit= false;
    }

    onRowDisabled(rowData: any, index: number, subIndex: number) {
        this.confirmationService.confirm({
            message: 'Do you really want to disable record?',
            accept: () => {
                this.loading = true;
                let detailId: any = rowData.childRecord[subIndex].detailid;
                let api: any = ApiConfig.disabledWhtApi.replace("{detailid}", detailId);
                let model: any = { is_active: 1 };
                this.service.patch(api, model).subscribe(res => {
                    if (res.result) {
                        this.getDataList(ApiConfig.getWhtApi);
                    }
                    //this.loading = false;
                }, error => { this.loading = false; });
            }
        });
    }

    close() {
        this.modal.close();
        if(this.isBulkUpload){
            //this.getDataList(ApiConfig.getWhtApi);
            this.onSearch();
        }
        this.isAddNew = false;
        this.isBulkUpload = false;
        this.modalCss = '';
    }

    open(type: any) {
        if (type == 'AddNew') {
            this.modalCss = 'modal-dialog-600';
            this.isAddNew = true;
            this.modalHeader = "Add New Withholding Tax";
        }
        if(type == 'BulkUpload'){
            this.modalCss = 'modal-dialog-900';
            this.isBulkUpload = true;
            this.modalHeader = "Add New Withholding Tax (Upload)";
        }
        this.modal.open();
    }
    
    onAddNew(event: any) {
        if (event) {
            this.close();
            this.getDataList(ApiConfig.getWhtApi);
        }
    }

    onBulkUpload(event: any) {
        if (event) {
            //this.close();
            //this.getDataList(ApiConfig.getWhtApi);
            this.modalCss = 'modal-dialog-900';
        }
    }

    getDataList(api: any) {
        this.loading = true;
        this.service.get(api).subscribe(res => {
            let rows: any = res.result ? res.results : [];
            this.paginator = rows.length > 5 ? true : false;
            this.masterDataList = this.mapDataList(rows);
            this.groupDataList = this.groupByDataList(this.masterDataList);
            //this.groupDataListBackup = this.groupDataList;
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    mapDataList(rows: IWhtList[]): any {
        let dataList: any[] = [];
        if (rows.length > 0) {
            dataList = rows.map(x => {
                return {
                    detailid: x.detailid,
                    taxid: x.taxid,
                    taxname: x.taxname,
                    country: x.country,
                    countryid: x.countryid ? x.countryid : '',
                    effectivefromDate: x.effectivefromDate ? AppUtil.getDate(x.effectivefromDate,'dd-mm-yyyy') : '',
                    effectivetoDate: x.effectivetoDate ? AppUtil.getDate(x.effectivetoDate,'dd-mm-yyyy') : '',
                    effectiveFromDatePicker: x.effectivefromDate ? AppUtil.setDate(x.effectivefromDate) : '',
                    effectiveToDatePicker: x.effectivetoDate ? AppUtil.setDate(x.effectivetoDate) : '',
                    taxrate: x.taxrate,
                    WHTType: x.WHTType ? x.WHTType : '',
                    reit1: (x.reit1 == 'False' || x.reit1 == '') ? 'No' : 'Yes',
                    edit: false
                };
            });
        }
        return dataList;
    }

    groupByDataList(dataList: any[]): any {
        let subscribe: IWhtList[] = [];
        if (dataList.length > 0) {
            let source = from(dataList);
            let groupArray = source.pipe(
                //groupBy(x => x.taxid),
                groupBy(x => x.taxname),
                // return each item in group as array
                mergeMap(group => group.pipe(toArray()))
            );
            groupArray.subscribe(item => {
                let wht: IWhtList = this.mapWhtData(item[0]);
                for(let row of item){
                    let subWht: IWhtList = this.mapWhtData(row); 
                    wht.childRecord.push(subWht); 
                }
                subscribe.push(wht);
            });
        }
        return subscribe;
    }

    mapWhtData(item: IWhtList): IWhtList {
        let wht: IWhtList = {};
        wht = {
            detailid: item.detailid,
            taxid: item.taxid,
            taxname: item.taxname,
            country: item.country,
            countryid: item.countryid,
            effectivefromDate: item.effectivefromDate,
            effectivetoDate: item.effectivetoDate,
            effectiveFromDatePicker: item.effectiveFromDatePicker,
            effectiveToDatePicker: item.effectiveToDatePicker,
            taxrate: item.taxrate,
            WHTType: item.WHTType,
            reit1: item.reit1,
            edit: false,
            childRecord: []
        };
        return wht;
    }

    mapPostData(rowData: any): IWht {
        let objReg: IWht = {};
        objReg.taxdetail = {};
        if(rowData){
            objReg.taxname = rowData.taxname;
            objReg.country = rowData.countryid;
            objReg.createdby = this.userInfo.username;
            objReg.user = this.userInfo.userid;
            objReg.WHTType = rowData.WHTType;
            objReg.taxdetail.tax = null;
            objReg.taxdetail.effectiveFromDate = rowData.effectiveFromDatePicker ? AppUtil.getFormattedDate(rowData.effectiveFromDatePicker,'')  : '';
            objReg.taxdetail.effectiveToDate = rowData.effectiveToDatePicker ? AppUtil.getFormattedDate(rowData.effectiveToDatePicker,'') : '';
            objReg.taxdetail.taxRate = rowData.taxrate;
            objReg.taxdetail.reit = (rowData.reit1 == 'Yes') ? 1 : 0;
            objReg.taxdetail.is_active = 0;
            objReg.taxdetail.createdby = this.userInfo.username;
        }
        return objReg;
    }

    reSetTable(){
        this.masterDataList = [];
    }

    onAction(event: any){
    }

    onSearch() {
        if (this.searchForm.valid) {
            this.loading = true;
            this.filter = this.filterModelMapping(this.searchForm.value);
            this.service.post(ApiConfig.getWhtApi, this.filter)
                .subscribe(res => {
                    let rows: any = res.result ? res.results : [];
                    this.paginator = rows.length > 5 ? true : false;
                    this.masterDataList = this.mapDataList(rows);
                    this.groupDataList = this.groupByDataList(this.masterDataList);
                    //this.groupDataListBackup = this.groupDataList;
                    this.loading = false;
                }, err => {
                    this.showError("Internal server error");
                    this.loading = false;
                });
        }
    }

    filterModelMapping(formValue: any): IFilter{
        let objFilter: IFilter = {};
        if(formValue){
            objFilter.taxname = formValue.txtScheduleName ? formValue.txtScheduleName : '';
            objFilter.country = formValue.country ? formValue.country.toString() : '';
            objFilter.WHTType = formValue.whtType ? formValue.whtType : '';
            objFilter.effectivefromDate = formValue.effectiveFrom ? AppUtil.getFormattedDate(formValue.effectiveFrom,'')  : '';
            objFilter.effectivetoDate = formValue.effectiveTo ? AppUtil.getFormattedDate(formValue.effectiveTo,'')  : '';
        }
        return objFilter;
    }

    searchOnDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.searchForm.controls['effectiveTo'].setValue('');
        if(event.jsdate){
            //this.searchForm.controls['effectiveTo'].setErrors({'required': true});
            //this.searchForm.controls['effectiveTo'].markAsTouched();
            let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
            toDate.setDate(toDate.getDate() - 1);
            this.searchToDateFormat = {
                dateFormat: 'dd-mm-yyyy',
                disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
            };
        }
    }

    getTaxScheduleNameOption(){
        this.service.get(ApiConfig.getTaxScheduleNameApi).subscribe(res=>{
            let taxNameList: any[] = res.result ? res.TaxList : [];
            /*this.scheduleNameOption = taxNameList.map(x => {
                return { value: x.taxname, label: x.taxname };
            });*/
            let options: any[] = [];
            options.push({ value: '', label: 'Select' });
            taxNameList.forEach(x => {
                options.push({ value: x.taxname, label: x.taxname });
            });
            this.scheduleNameOption = options;
        }, error=>{console.log(error)});
    }

    getCountryOption() {
        this.service.get(ApiConfig.getGetCountryOptionApi).subscribe(res => {
            if (res.result) {
                let countryList: any[] = res.CustomList ? res.CustomList : [];
                /*this.countryOption = countryList.map(x => {
                    return { value: x.id, label: x.name };
                });*/
                let options: any[] = [];
                options.push({ value: '', label: 'Select' });
                countryList.forEach(x => {
                    options.push({ value: x.id, label: x.name });
                });
                this.countryOption = options;
            }
        }, error => { console.log(error) });
    }

    getWhtTypeOption() {
        this.whtTypeOption = [
            { value: 'custom', label: 'Custom' },
            { value: 'standard', label: 'Standard' }
        ];
    }

    getREITOption() {
        this.reitOption = [
            { value: 'Yes', label: 'Yes' },
            { value: 'No', label: 'No' }
        ];
    }

    onChangeWhtType(selectedValue: any): void {
        this.searchCountryOption = [{value:'', label:'Select'}];
        this.searchScheduleNameOption = [{value:'', label:'Select'}];
        this.searchForm.controls['country'].setValue('');
        this.searchForm.controls['txtScheduleName'].setValue('');
        if (selectedValue) {
            this.loading = true;
            let api: any = ApiConfig.getCountryTaxScheduleOnWhtTypeApi.replace("{whtType}", selectedValue ? selectedValue : '');
            this.service.get(api).subscribe(res => {
                if (res.Result) {
                    let countryList: any[] = res.results.country.length > 0 ? res.results.country : [];
                    let taxList: any[] = res.results.tax.length > 0 ? res.results.tax : [];
                    /*this.searchCountryOption = countryList.map(x => {
                        return { value: x.tax__country__id, label: x.tax__country__name };
                    });*/
                    let options: any[] = [];
                    options.push({ value: '', label: 'Select' });
                    countryList.forEach(x => {
                        options.push({ value: x.tax__country__id, label: x.tax__country__name });
                    });
                    this.searchCountryOption = options;

                    /*this.searchScheduleNameOption = taxList.map(x => {
                        return { value: x.tax__taxname, label: x.tax__taxname };
                    });*/
                    let options1: any[] = [];
                    options1.push({ value: '', label: 'Select' });
                    taxList.forEach(x => {
                        options1.push({ value: x.tax__taxname, label: x.tax__taxname });
                    });
                    this.searchScheduleNameOption = options1;
                }
                this.loading = false;
            }, error => {
                this.loading = false;
                console.log(error);
            });
        }
    }

    onChangeCountry(selectedValue: any): void {
        this.searchForm.controls['txtScheduleName'].setValue('');
        let whtType: any = this.searchForm.controls['whtType'].value;
        if (selectedValue) {
            this.loading = true;
            let api: any = ApiConfig.getTaxScheduleOnCountryApi.replace("{whtType}", whtType).replace("{country}", selectedValue ? selectedValue : '');
            this.service.get(api).subscribe(res => {
                if (res.Result) {
                    let taxList: any[] = res.results.tax ? res.results.tax : [];
                    /*this.searchScheduleNameOption = taxList.map(x => {
                        return { value: x.tax__taxname, label: x.tax__taxname };
                    });*/
                    let options1: any[] = [];
                    options1.push({ value: '', label: 'Select' });
                    taxList.forEach(x => {
                        options1.push({ value: x.tax__taxname, label: x.tax__taxname });
                    });
                    this.searchScheduleNameOption = options1;
                }
                this.loading = false;
            },
                error => {
                    console.log(error);
                    this.loading = false;
                });
        }
        else {
            this.loading = true;
            let api: any = ApiConfig.getCountryTaxScheduleOnWhtTypeApi.replace("{whtType}", whtType ? whtType : '');
            this.service.get(api).subscribe(res => {
                if (res.Result) {
                    let countryList: any[] = res.results.country.length > 0 ? res.results.country : [];
                    let taxList: any[] = res.results.tax.length > 0 ? res.results.tax : [];
                    /*this.searchCountryOption = countryList.map(x => {
                        return { value: x.tax__country__id, label: x.tax__country__name };
                    });*/
                    let options: any[] = [];
                    options.push({ value: '', label: 'Select' });
                    countryList.forEach(x => {
                        options.push({ value: x.tax__country__id, label: x.tax__country__name });
                    });
                    this.searchCountryOption = options;

                    /*this.searchScheduleNameOption = taxList.map(x => {
                        return { value: x.tax__taxname, label: x.tax__taxname };
                    });*/
                    let options1: any[] = [];
                    options1.push({ value: '', label: 'Select' });
                    taxList.forEach(x => {
                        options1.push({ value: x.tax__taxname, label: x.tax__taxname });
                    });
                    this.searchScheduleNameOption = options1;
                }
                this.loading = false;
            }, error => {
                this.loading = false;
                console.log(error);
            });
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

}
