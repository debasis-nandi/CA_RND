import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { AppUtil } from '../../core/config/app-util';
import { GlobalConst, DocType, TableName, Template } from '../../core/config/app-enum';
import { ITableConfig } from '../../core/models/datatable.model';
import { IFilter } from '../../core/models/dashboard.model';

declare var $: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard2.component.html',
    styleUrls: ['dashboard.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;

    tableName: string = TableName.caProcessingDashboard;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };

    templateOption: any[] = [];
    selectedTemplate: string = '';

    filter: IFilter = {};
    fromDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false };
    toDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false };
    preferencesOption: any[] = [];
    preference: any;
    keyword: any;
    fromDate: any;
    toDate:any;
    
    constructor(private fb: FormBuilder, private router: Router, private service: HttpService) {
    }

    ngOnInit() {
        //this.setDefault();
        //this.getPreferencesOption();
        //this.getConfig();
        this.getTemplates();
    }

    setDefault(): void{
        this.fromDate = '';
        this.toDate = '';
        this.preference = '';
        this.keyword = '';
    }

    getConfig() {
        let api: string = 'src/assets/tableconfig/ca-processing-dashboard.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                //this.tableConfig.rows = data.rows;
                this.getRequestData();
            }
        }, error => {
        });
    }

    getRequestData() {
        this.loading = true;
        this.service.post(ApiConfig.caProcessingApi, this.filter).subscribe(res => {
            this.tableConfig.rows = res.result ? res.results : [];
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    onSearch(): void{
        $(".filter_panel").hide();
        this.filter = {
            fromDate : this.fromDate ? AppUtil.getFormattedDate(this.fromDate,'', false) : null,
            toDate : this.toDate ? AppUtil.getFormattedDate(this.toDate,'', false) : null,
            preference : this.preference ? this.preference : null,
            keywords : this.keyword ? this.keyword : null
        };
        this.getRequestData();
    }

    onDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.toDate = '';
        let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
        toDate.setDate(toDate.getDate() - 1);
        this.toDateFormat = {
            dateFormat: 'mm-dd-yyyy',
            disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
        };
    }

    onAction(event: any){
    }

    getTemplates(): void{
        this.templateOption = [
            { label:'Select Templates & Guidelines', value:'' },
            { label: 'Withholding Tax Rate Management', value: 'WHT-Template.csv' },
            { label: 'CA Processing Input Data Template', value: 'CA-Input-Template.csv' },
            { label: 'Instructions  Guidelines', value: 'Instructions  Guidelines - Quick Reference.xlsx' }
        ];
    }

    onDownload() {
        if (this.selectedTemplate) {
            let fileExt: string = this.selectedTemplate.split('.')[0];
            if (fileExt.toLowerCase() == DocType.csv) {
                this.service.getCsv(ApiConfig.templatePath + this.selectedTemplate).subscribe(data => {
                    AppUtil.downloadFile(data, this.selectedTemplate);
                }, error => { console.log(error) });
            }
            else {
                AppUtil.downloadStaticFile(ApiConfig.templatePath, this.selectedTemplate);
            }
        }
    }

    getPreferencesOption() {
        this.service.get(ApiConfig.getUserPreferencesOptionApi).subscribe(res => {
            if (res.result) {
                let preferenceList: any[] = res.PreferenceList ? res.PreferenceList : [];
                this.preferencesOption = preferenceList.map(x => {
                    return { value: x.id, label: x.profileName };
                });
            }
        }, error => { 
        });
    }

}
