import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { ITableConfig } from '../../core/models/datatable.model';
import { TableName } from '../../core/config/app-enum';
import { IFilter } from '../../core/models/historical-data.model';

@Component({
    selector: 'app-historical-data',
    templateUrl: './historical-data.component.html',
    styleUrls: ['historical-data.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class HistoricalDataComponent implements OnInit {

    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;

    tableConfig: ITableConfig = { table: null, columns: [], rows: [] };

    exFromDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    exToDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };

    payFromDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    payToDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };

    processingFromDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    processingToDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };

    fileid: any;
    isin: string;
    exFromDate: any;
    exToDate: any;
    payFromDate: any;
    payToDate: any;
    processingFromDate: any;
    processingToDate: any;

    processedPreferencesOption: any[] = [];
    regionOption: any[] = [];
    stockCurrencyOption: any[] = [];
    countryOption: any[] = [];

    filter: IFilter = {};

    constructor(private fb: FormBuilder, private router: Router, private service: HttpService) {
    }

    ngOnInit() {
        this.getUserPreferencesOption();
        this.setDefault();
    }

    setDefault(): void {
        this.msgs = [];
        this.fileid = '';
        this.isin = '';
        this.exFromDate = '';
        this.exToDate = '';
        this.payFromDate = '';
        this.payToDate = '';
        this.processingFromDate = '';
        this.processingToDate = '';
        this.filter = {
            isin: [],
            processedPreference: '',
            exFromDate: '',
            exToDate: '',
            payFromDate: '',
            payToDate: '',
            processingFromDate:'',
            processingToDate: '',
            region: '',
            stockCurrency: '',
            country: ''
        };
    }

    onSearch(): void{
        this.getHistoricalData();
    }

    reSet(): void{
        this.setDefault();
    }

    onDownload() {
        this.msgs = [];
        let fileName: any = 'historical-data.csv';
        let api: any = ApiConfig.downloadHistoricalDataApi.replace("{fileid}", this.fileid);
        this.loading = true;
        let dataType: any = 'csv';
        this.service.getData(api, dataType).subscribe(res => {
            let objRes: any[] = (JSON.stringify(res)).split('\\');
            if(objRes[0] == '"{' && objRes[6] == '"}"' ){
                let jsonObj: any = JSON.parse(res);
                this.showError(res['message']);
            }
            else {
                AppUtil.downloadFile(res, fileName);
            }
            this.loading = false;
        }, err => {
            this.loading = false;
            this.showError("Internal server error");
            console.log(err);
        });
    }

    getHistoricalData() {
        this.msgs = [];
        let postModel: any = {
            isin: this.isin.trim().length > 0 ? this.isin.split(',') : [],
            exFromDate: this.exFromDate ? AppUtil.getFormattedDate(this.exFromDate,'yyyy-mm-dd', false) : null,
            exToDate: this.exToDate ? AppUtil.getFormattedDate(this.exToDate,'yyyy-mm-dd', false) : null,
            payFromDate: this.payFromDate ? AppUtil.getFormattedDate(this.payFromDate,'yyyy-mm-dd', false) : null,
            payToDate: this.payToDate ? AppUtil.getFormattedDate(this.payToDate,'yyyy-mm-dd', false) : null,
            preferenceID : this.filter.processedPreference ? this.filter.processedPreference : null,
            processingFromDate: this.processingFromDate ? AppUtil.getFormattedDate(this.processingFromDate,'yyyy-mm-dd', false) : null,
            processingToDate: this.processingToDate ? AppUtil.getFormattedDate(this.processingToDate,'yyyy-mm-dd', false) : null
        };
        this.loading = true;
        this.service.post(ApiConfig.historicalDataApi, postModel).subscribe(res => {
            if (res.result) {
                this.fileid = res['fileid'];
                this.showSuccess('Search result has been generated successfully. Please click on file link below to download the search result file.');
            }
            else{
                this.fileid = res['fileid'];
                this.showError(res['message']);
            }
            this.loading = false;
        }, err => {
            this.showError('Internal server error.');
            this.loading = false;
        });
    }

    onExDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.exToDate = '';
        let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
        toDate.setDate(toDate.getDate() - 1);
        this.exToDateFormat = {
            dateFormat: 'mm-dd-yyyy',
            disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
        };
    }

    onPayDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.payToDate = '';
        let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
        toDate.setDate(toDate.getDate() - 1);
        this.payToDateFormat = {
            dateFormat: 'mm-dd-yyyy',
            disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
        };
    }

    onProcessingDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.processingToDate = '';
        let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
        toDate.setDate(toDate.getDate() - 1);
        this.processingToDateFormat = {
            dateFormat: 'mm-dd-yyyy',
            disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
        };
    }

    getUserPreferencesOption() {
        this.loading = true;
        this.service.get(ApiConfig.getUserPreferencesOptionApi).subscribe(res => {
            if (res.result) {
                let preferenceList: any[] = res.PreferenceList ? res.PreferenceList : [];
                /*this.processedPreferencesOption = preferenceList.map(x => {
                    return { value: x.id, label: x.profileName };
                });*/
                let options: any[] = [];
                options.push({value:'', label:'Select Preference'});
                preferenceList.forEach(x=>{
                    options.push({ value: x.id, label: x.profileName });
                });
                this.processedPreferencesOption = options;
            }
            this.loading = false;
        }, error => { this.loading = false; });
    }

    showSuccess(message: string) {
        this.msgs = [];
        this.msgs.push({severity:'success', summary:'', detail: message });
    }

    showError(message: string) {
        this.msgs = [];
        this.msgs.push({severity:'error', summary:'', detail: message });
    }

}
