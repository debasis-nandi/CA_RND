import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { groupBy, mergeMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';

import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { ConfirmationService } from 'primeng/primeng';
import { Table } from 'primeng/table';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst, SanityLevel, SanityFields } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { TableName, Action, Template } from '../../core/config/app-enum';
import { Sanity } from './ca-processing-sanity';
import { IMasterSanity, ISanityItems, ISanityGroupItem, IMaster, IRequest, IRequestPost, ICountryTaxRate, 
    IResponse, IResponsePost, ISanityErrors, ISanity, ISanityFilter, ISanityList, ISanitySummary, IPreview } from '../../core/models/ca-processing-add-new.model';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';

@Component({
    selector: 'app-sanity-check-summary',
    templateUrl: './sanity-check-summary.component.html',
    styleUrls: ['ca-processing.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SanityCheckSummaryComponent implements OnInit {
    
    //@ViewChild('tblSanityList') tableComponent: Table;

    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    myDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };

    userInfo: any;
    commonId?: any;
    sanitySummary: ISanitySummary = {};
    
    reitOption: any[] = [];
    countryOption: any[] = [];
    
    sanityFilter: ISanityFilter[] = [];
    sanitySelectedFilter: any[] = [];
    sanityList: ISanityList[] = [];
    masterSanity: IMasterSanity[] = [];
    previewList: IPreview[] = [];

    updatedSoftSanityCount: number = 0;

    constructor(private router: Router, private route: ActivatedRoute, private service: HttpService, private confirmationService: ConfirmationService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
        this.getReitOption();
        this.getCountryOption();
        this.getMasterSanity();

        this.route.params.subscribe(params => {
            this.commonId = params['commonId'] || null;
            if (this.commonId) {
                this.getSanitySummary(this.commonId);
            }
        });
    }

    backToInput(): void{
        this.router.navigate(['ca-processing/ca-processing-add', this.commonId, 'edit']);
    }

    getSanitySummary(commonId: any): void {
        this.loading = true;
        let api: any = ApiConfig.sanitySummaryApi.replace("{commonId}", commonId);
        this.service.get(api).subscribe(res => {
            this.sanitySummary = res.result ? res.results : {};
            if (this.sanitySummary && this.sanitySummary.hardsanity > 0) {
                let model: any = { common_id: commonId, sanitylevel: this.sanitySummary.sanityLevel, group: null };
                this.getSanityList(model);
            }
            else {
                this.getPreviewList(commonId);
            }
        }, error => {
            this.loading = false;
        });
    }

    downloadSanity(): void {
        let api: any = ApiConfig.downloadSanityApi.replace("{commonId}", this.commonId);
        let fileName: any = 'CA-Input-Sanity.csv';
        this.service.getData(api, 'csv').subscribe(res => {
            let result: any = res.result == undefined ? true : false;
            if (result)
                AppUtil.downloadFile(res, fileName);
            else
                this.showError(res['message']);

            this.loading = false;
        }, err => {
            this.loading = false;
            this.showError("Internal server error");
            console.log(err);
        });
    }

    downloadRequest(): void{
        let api: any = ApiConfig.downloadCaRequestApi.replace("{commonId}", this.commonId);
        let fileName: any = 'CA-Request.csv';
        this.service.getData(api, 'csv').subscribe(res => {
            let result: any = res.result == undefined ? true : false;
            if (result)
                AppUtil.downloadFile(res, fileName);
            else
                this.showError(res['message']);

            this.loading = false;
        }, err => {
            this.loading = false;
            this.showError("Internal server error");
            console.log(err);
        });
    }

    getSanityList(model: any): void {
        //this.loading = true;
        this.service.post(ApiConfig.sanityListApi, model).subscribe(res => {
            if (res.result) {
                //this.tableComponent.reset();
                this.sanityList = [];
                this.sanityList = res.result ? this.mapDataList(res.results) : [];
                let selectedFilter: ISanityFilter[] = res.sanitycount ? res.sanitycount : [];
                this.setSanityFilter(selectedFilter);
            }
            this.loading = false;
        }, error => { 
            this.loading = false; 
        });
    }

    setSanityFilter(selectedFilter: ISanityFilter[]): void{
        this.sanityFilter = [];
        this.sanitySelectedFilter = [];
        if(selectedFilter.length > 0){
            let allSanityGroup: ISanityItems[] = [];
            if(this.sanitySummary.sanityLevel == 1)
            allSanityGroup = this.masterSanity.filter(x=>x.sanityCode == SanityLevel.level1).length > 0 ? this.masterSanity.filter(x=>x.sanityCode == SanityLevel.level1)[0].sanityItems : [];
            if(this.sanitySummary.sanityLevel == 2)
            allSanityGroup = this.masterSanity.filter(x=>x.sanityCode == SanityLevel.level2).length > 0 ? this.masterSanity.filter(x=>x.sanityCode == SanityLevel.level2)[0].sanityItems : [];
            if(this.sanitySummary.sanityLevel == 3)
            allSanityGroup = this.masterSanity.filter(x=>x.sanityCode == SanityLevel.level3).length > 0 ? this.masterSanity.filter(x=>x.sanityCode == SanityLevel.level3)[0].sanityItems : [];

            allSanityGroup.forEach(x=>{
                let item: ISanityFilter = { 
                    sanityGroup: x.groupName, 
                    sanitygrouplabel: x.groupLabel,
                    sanityLevel: this.sanitySummary.sanityLevel,
                    sanityDescription: x.groupDescription,
                    sanityStatus: selectedFilter.filter(a=>a.sanityGroup == x.groupName).length > 0 ? false : true  
                };
                this.sanityFilter.push(item);
            });
            this.sanitySelectedFilter = this.sanityFilter.filter(x=>x.sanityStatus == false).map(x=>x.sanityGroup);
        }
    }

    getPreviewList(commonId: any): void {
        //this.loading = true;
        let api:any = ApiConfig.requestPreviewApi.replace("{commonId}", commonId);
        this.service.get(api).subscribe(res => {
            if (res.result) {
                this.previewList = res.results ? res.results : [];
                this.updatedSoftSanityCount = 0;
                this.sanitySummary = { hardsanity: 0, sanityLevel: 4, totalRecord: this.previewList.length, softsanity: this.previewList.filter(x=>x.softsanity == 1).length, sanityError:'' };
                if(this.previewList.length > 0){
                    this.previewList.forEach(item=>{
                        item.edit = false;
                    });
                } 
            }
            this.loading = false;
        }, error => {
            this.showError('Internal server error!'); 
            this.loading = false; }
        );
    }

    onRowEditInit(rowData: any, index: number) {
        rowData['edit']= true;
    }

    onRowEditSave(rowData: any, index: number, isChild: boolean = false, childIndex: number = 0) {
        if (rowData) {
            let error: number = 0;
            let model: any = isChild ? this.sanityList[index].childRecords[childIndex] : this.sanityList[index];
            let postModel: any = this.mapModel(model);
            
            if (error == 0) {
                this.confirmationService.confirm({
                    message: 'Do you want to save the changes?',
                    accept: () => {
                        this.loading = true;
                        this.service.put(ApiConfig.updateSanityRecApi, postModel).subscribe(res => {
                            if (res.result) {
                                this.showSuccess(res.message);
                                rowData.edit = false;
                            }
                            else{
                                this.showError(res.message);
                            }
                            this.loading = false;
                        }, err => {
                            this.showError("Internal server error.");
                            this.loading = false;
                        });
                    }
                });
            }
        }
    }

    onRowEditCancel(rowData: any, index: number) {
        //rowData = this.sanityList2[index];
        //let exdate: any = AppUtil.convert_DD_MM_YYYY_2Date(rowData.exdate);
        //let paydate: any = AppUtil.convert_DD_MM_YYYY_2Date(rowData.paydate);
        //rowData.exdate = AppUtil.setDate(exdate);
        //rowData.paydate = AppUtil.setDate(paydate);
        rowData['edit']= false;
    }

    onRowDelete(rowData: any, index: number, isChild: boolean = false, childIndex: number = 0) {
        if (rowData) {
            let error: number = 0;
            let model: any = isChild ? this.sanityList[index].childRecords[childIndex] : this.sanityList[index];
            let postModel: any = this.mapModel(model);
            postModel.is_active = 1;
            if (error == 0) {
                this.confirmationService.confirm({
                    message: 'Do you want to delete the record?',
                    accept: () => {
                        this.loading = true;
                        this.service.put(ApiConfig.updateSanityRecApi, postModel).subscribe(res => {
                            if (res.result) {
                                this.showSuccess(res.message);
                                setTimeout(() => {
                                    let model: any = { common_id: this.commonId, sanitylevel: this.sanitySummary.sanityLevel, group: null };
                                    this.getSanityList(model);
                                }, GlobalConst.growlLife);
                            }
                            else {
                                this.showError(res.message);
                                this.loading = false;
                            }
                        }, err => {
                            this.showError("Internal server error.");
                            this.loading = false;
                        });
                    }
                });
            }
        }
    }

    onPreviewRowEditInit(rowData: any, index: number) {
        rowData['edit']= true;
    }

    onPreviewRowEditSave(rowData: any, index: number) {
        if (rowData) {
            let error: number = 0;
            let postModel: any = this.mapPreviewModel(this.previewList[index]);
            if (error == 0) {
                this.confirmationService.confirm({
                    message: 'Do you want to save the changes?',
                    accept: () => {
                        this.loading = true;
                        this.service.put(ApiConfig.updateSanityRecApi, postModel).subscribe(res => {
                            if (res.result) {
                                this.showSuccess(res.message);
                                rowData.edit = false;
                                this.updatedSoftSanityCount++;
                            }
                            else{
                                this.showError(res.message);
                            }
                            this.loading = false;
                        }, err => {
                            this.showError("Internal server error.");
                            this.loading = false;
                        });
                    }
                });
            }
        }
    }

    onPreviewRowEditCancel(rowData: any, index: number) {
        rowData['edit']= false;
    }

    mapModel(row: ISanityList): any{
        return {
            sanityID: row.sanityID,
            sanityname: row.sanityname,
            sanityGroup: row.sanityGroup,
            sanityLevel: row.sanityLevel,
            sanityDescription: row.sanityDescription,
            reqdetailID: row.reqdetailID ? row.reqdetailID : '',
            common_ID: row.common_ID ? row.common_ID : '',
            source: row.source ? row.source : '',
            isin: row.isin ? row.isin : '',
            country: row.country ? row.country : '',
            identifier: row.identifier ? row.identifier : '',
            priceCurrency: row.priceCurrency ? row.priceCurrency : '',
            exdate: row.exdate ? row.exdate : '',
            eventType: row.eventType ? row.eventType : '',
            eventName: row.eventName ? row.eventName : '',
            eventCurrency: row.eventCurrency ? row.eventCurrency : '',
            eventamount: row.eventamount ? row.eventamount : '',
            offerprice: row.offerprice ? row.offerprice : '',
            termoldshares: row.termoldshares ? row.termoldshares : '',
            termnewshares: row.termnewshares ? row.termnewshares : '',
            spunoffstock: row.spunoffstock ? row.spunoffstock : '',
            spunoffcash: row.spunoffcash ? row.spunoffcash : '',
            priceExT1: row.priceExT1 ? row.priceExT1 : '',
            fxexT1: row.fxexT1 ? row.fxexT1 : '',
            paydate: row.paydate ? row.paydate : '',
            payDatePrice: row.payDatePrice ? row.payDatePrice : '',
            buybackShares: row.buybackShares ? row.buybackShares : '',
            payDatePriceT1: row.payDatePriceT1 ? row.payDatePriceT1 : '',
            payDateFx: row.payDateFx ? row.payDateFx : '',
            payDateFxT1: row.payDateFxT1 ? row.payDateFxT1 : '',
            frankingPercent: row.frankingPercent ? row.frankingPercent : '',
            incomePercent: row.incomePercent ? row.incomePercent : '',
            reit: row.reit ? row.reit : '',
            created_date: row.created_date ? row.created_date : '',
            softsanity: row.softsanity,
            sanityWarning: row.sanityWarning,
            is_active: row.is_active
        };
    }

    mapPreviewModel(row: IPreview): any{
        return {
            reqdetailID: row.reqdetailID ? row.reqdetailID : '',
            common_ID: row.common_ID ? row.common_ID : '',
            source: row.source ? row.source : '',
            isin: row.isin ? row.isin : '',
            country: row.country ? row.country : '',
            identifier: row.identifier ? row.identifier : '',
            priceCurrency: row.priceCurrency ? row.priceCurrency : '',
            exdate: row.exdate ? row.exdate : '',
            eventType: row.eventType ? row.eventType : '',
            eventName: row.eventName ? row.eventName : '',
            eventCurrency: row.eventCurrency ? row.eventCurrency : '',
            eventamount: row.eventamount ? row.eventamount : '',
            offerprice: row.offerprice ? row.offerprice : '',
            termoldshares: row.termoldshares ? row.termoldshares : '',
            termnewshares: row.termnewshares ? row.termnewshares : '',
            spunoffstock: row.spunoffstock ? row.spunoffstock : '',
            spunoffcash: row.spunoffcash ? row.spunoffcash : '',
            priceExT1: row.priceExT1 ? row.priceExT1 : '',
            fxexT1: row.fxexT1 ? row.fxexT1 : '',
            paydate: row.paydate ? row.paydate : '',
            payDatePriceT1: row.payDatePriceT1 ? row.payDatePriceT1 : '',
            payDateFxT1: row.payDateFxT1 ? row.payDateFxT1 : '',
            frankingPercent: row.frankingPercent ? row.frankingPercent : '',
            incomePercent: row.incomePercent ? row.incomePercent : '',
            reit: row.reit ? row.reit : '',
            softsanity: row.softsanity,

            sanityID: null,
            sanityname: null,
            sanityGroup: null,
            sanityLevel: null,
            sanityDescription: null,
            sanityWarning: null,
            payDatePrice: null,
            buybackShares: null,
            payDateFx: null,
            created_date: null
        };
    }

    mapErrors(rows: ISanityList[]): any {
        let errors: any = '';
        for (let row of rows) {
            errors += (row.sanityError ? row.sanityError + '<br>' : '') ;
        }
        return errors;
    }

    mapDataList(rows: ISanityList[]): any {
        let dataList: any[] = [];
        if (rows.length > 0) {
            let source = from(rows);
            let groupArray = source.pipe(
                groupBy(x => x.reqdetailID),
                mergeMap(group => group.pipe(toArray()))
            );
            groupArray.subscribe(item => {
                if (item.length > 0) {
                    let listItem: ISanityList = this.mapModel(item[0]);
                    listItem.edit = false;
                    listItem.sanityError = this.mapErrors(item);

                    // push distinct records
                    if(listItem.sanityname == SanityFields.duplicate){
                        let isExist: boolean = this.isDuplicateRecord(dataList, listItem);
                        if(!isExist){
                            // set child records
                            let childItems: ISanityList[] = this.getChildRecord(rows,listItem);
                            listItem.childRecords = [];
                            childItems.forEach(x=> { listItem.childRecords.push(x); });
                            dataList.push(listItem);
                        }
                    }
                    else{
                        dataList.push(listItem);
                    }
                }
            });
        }

        return dataList;
    }

    isDuplicateRecord(itemList:any, item: any): boolean{
        let dupRecords: any[] = itemList.filter(x => 
            x.source.toLowerCase() == item.source.toLowerCase() &&
                x.isin.toLowerCase() == item.isin.toLowerCase() &&
                x.country.toLowerCase() == item.country.toLowerCase() &&
                x.identifier.toLowerCase() == item.identifier.toLowerCase() &&
                x.priceCurrency.toLowerCase() == item.priceCurrency.toLowerCase() &&
                x.eventType.toLowerCase() == item.eventType.toLowerCase() &&
                x.eventName.toLowerCase() == item.eventName.toLowerCase() &&
                x.eventCurrency.toLowerCase() == item.eventCurrency.toLowerCase() &&
                x.eventamount == item.eventamount &&
                x.offerprice == item.offerprice &&
                x.termoldshares == item.termoldshares &&
                x.termnewshares == item.termnewshares &&
                x.spunoffstock == item.spunoffstock &&
                x.spunoffcash == item.spunoffcash &&
                x.priceExT1 == item.priceExT1 &&
                x.fxexT1 == item.fxexT1 &&
                x.payDatePriceT1 == item.payDatePriceT1 &&
                x.payDateFxT1 == item.payDateFxT1 &&
                x.frankingPercent == item.frankingPercent &&
                x.incomePercent == item.incomePercent &&
                x.reit == item.reit &&
                x.paydate == item.paydate &&
                x.exdate == item.exdate
        );
        
        return (dupRecords.length > 0) ? true : false;
    }

    getChildRecord(itemList:ISanityList[], item: ISanityList): ISanityList[]{
        let childRecords: any[] = itemList.filter(x => 
            x.source.toLowerCase() == item.source.toLowerCase() &&
                x.isin.toLowerCase() == item.isin.toLowerCase() &&
                x.country.toLowerCase() == item.country.toLowerCase() &&
                x.identifier.toLowerCase() == item.identifier.toLowerCase() &&
                x.priceCurrency.toLowerCase() == item.priceCurrency.toLowerCase() &&
                x.eventType.toLowerCase() == item.eventType.toLowerCase() &&
                x.eventName.toLowerCase() == item.eventName.toLowerCase() &&
                x.eventCurrency.toLowerCase() == item.eventCurrency.toLowerCase() &&
                x.eventamount == item.eventamount &&
                x.offerprice == item.offerprice &&
                x.termoldshares == item.termoldshares &&
                x.termnewshares == item.termnewshares &&
                x.spunoffstock == item.spunoffstock &&
                x.spunoffcash == item.spunoffcash &&
                x.priceExT1 == item.priceExT1 &&
                x.fxexT1 == item.fxexT1 &&
                x.payDatePriceT1 == item.payDatePriceT1 &&
                x.payDateFxT1 == item.payDateFxT1 &&
                x.frankingPercent == item.frankingPercent &&
                x.incomePercent == item.incomePercent &&
                x.reit == item.reit &&
                x.paydate == item.paydate &&
                x.exdate == item.exdate
        );
        
        return childRecords;
    }

    onSanity(): void {
        this.loading = true;
        let api: any = ApiConfig.caUnProcessedDetailsApi.replace("{commonId}",this.commonId);
        this.service.get(api).subscribe(res => {
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

    onSanityCheck(records: IResponse[]): void {
        let level1MasterSanity: ISanityItems[] = this.masterSanity.filter(x => x.sanityCode == SanityLevel.level1).length > 0 ? this.masterSanity.filter(x => x.sanityCode == SanityLevel.level1)[0].sanityItems : [];
        let objLevel1Errors: any[] = [];
        let objLevel2Errors: any;
        let objLevel3Errors: any;
        
        if (records && records.length > 0) {
            let commonId: any = records.length > 0 ? records[0].common_ID : null; 
            // Level 1 sanity check
            objLevel1Errors = Sanity.onLevel1Sanity(records, level1MasterSanity);
            if (objLevel1Errors.length > 0) {
                let sanityErrors: ISanityErrors = { sanityErrors: objLevel1Errors };
                this.service.post(ApiConfig.caRequestUpdateSanityApi, sanityErrors).subscribe(data => {
                    if (data.result) {
                        this.getSanitySummary(commonId);
                    }
                }, error => {
                    this.showError("Internal server error.");
                    this.loading = false;
                });
            }
            // Level2 sanity check
            if (objLevel1Errors.length == 0) {
                let api: any = ApiConfig.level2SanityApi.replace("{commonId}", commonId);
                this.service.get(api).subscribe(res => {
                    if (res.result) {
                        this.getSanitySummary(commonId);
                    }
                }, error => {
                    this.showError("Internal server error.");
                    this.loading = false;
                });
            }

        }
        
    }

    onChange(item: any, isChecked: boolean) {
        if (isChecked) {
            this.sanitySelectedFilter.push(item.sanityGroup);
        } else {
            let index = this.sanitySelectedFilter.findIndex(x => x == item.sanityGroup);
            if (index > -1) {
                this.sanitySelectedFilter.splice(index, 1);
            }
        }
        this.loading = true;
        let model: any = { common_id: this.commonId, sanitylevel: this.sanitySummary.sanityLevel, group: this.sanitySelectedFilter };
        this.service.post(ApiConfig.sanityListApi, model).subscribe(res => {
            if (res.result) {
                this.sanityList = res.results ? this.mapDataList(res.results) : [];
            }
            this.loading = false;
        }, error => {
            this.loading = false;
        });
    }

    onSubmit(): void {
        this.loading = true;
        let api: any = ApiConfig.CreateCaRequestApi.replace("{commonId}", this.commonId);
        this.service.get(api).subscribe(res => {
            if (res.result) {
                this.showSuccess(res.message);
                setTimeout(() => {
                    this.router.navigate(['ca-processing/ca-processing-output', res['requestID']]);
                }, GlobalConst.growlLife);
            }
            else {
                this.showError(res.message);
            }
            this.loading = false;
        }, error => {
            this.loading = false;
        });
    }

    getMasterSanity(): void {
        this.service.get(ApiConfig.masterSanityApi).subscribe(res => {
            this.masterSanity = res.result ? res.results : [];
        }, error => { 
            console.log(error); 
        });
    }

    getCountryOption(): void {
        this.service.get(ApiConfig.getGetCountryOptionApi).subscribe(res => {
            if (res.result) {
                let countryList: any[] = res.CustomList ? res.CustomList : [];
                let options: any[] = [];
                //options.push({value:'', label:'Select'});
                countryList.forEach(x=>{
                    options.push({ value: x.countryCode, label: x.name +"("+ x.countryCode +")" });
                });
                this.countryOption = options;
            }
        }, error => { 
            console.log(error); 
        });
    }

    getReitOption() {
        this.reitOption = [
            { value: '1', label: '1' },
            { value: '0', label: '0' }
        ];
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
