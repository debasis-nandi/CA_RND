import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { TableName, Action, Template } from '../../core/config/app-enum';
import { ITableConfig } from '../../core/models/datatable.model';
import { IRequestFilter } from '../../core/models/ca-processing.model';

@Component({
    selector: 'app-ca-processing',
    templateUrl: './ca-processing.component.html'
})
export class CAProcessingComponent implements OnInit {
    
    caProcessingForm:FormGroup;
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;

    tableName: string;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };
    
    preferenceOption: any[] = [];
    filterModel: IRequestFilter = {};

    constructor(private fb:FormBuilder, private router: Router, private service: HttpService) {
    }

    ngOnInit() {
        this.getPreferences();
        this.getConfig();
    }

    getConfig() {
        this.tableName = TableName.caProcessing;
        this.reSetTable();
        let api: string = 'src/assets/tableconfig/ca-processing.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                //this.tableConfig.rows = data.rows;
                this.getData();
            }
        }, error => {
        });
    }

    getUnConfig() {
        this.tableName = TableName.caUnProcessing;
        this.reSetTable();
        let api: string = 'src/assets/tableconfig/ca-unprocessing.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                //this.tableConfig.rows = data.rows;
                this.getUnData();
            }
        }, error => {
        });
    }


    getData() {
        this.loading = true;
        this.service.post(ApiConfig.caProcessingApi, this.filterModel).subscribe(res => {
            let rows: any[] = res.result ? res.results : [];
            this.tableConfig.rows = this.mapActions(rows);
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    getUnData() {
        this.loading = true;
        this.service.get(ApiConfig.caUnProcessingApi).subscribe(res => {
            this.tableConfig.rows = res.result ? res.results : [];
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    onTabChange(event){
        if(event.index == 0){
            this.getConfig();
        }
        if(event.index == 1){
            this.getUnConfig();
        }
    }

    mapActions(rows: any[]): any{
        if(rows.length > 0){
            for(let row of rows){
                row.action = [Action.downloadInput, Action.downloadOutput, Action.delete];
            }
        }
        return rows;
    }

    onAction(event: any) {
        if (event.action == Action.delete) {
            this.disabledRequest(event.data['requestID']);
        }
        if (event.action == Action.downloadInput) {
            let requestID: any = event.data['requestID'];
            let api: string = ApiConfig.inputFileDownloadApi.replace("{id}", requestID);
            let fileName: string = event.data['fileName'];
            let fileType: string = 'csv';
            this.onDownload(api, fileName, fileType);
        }
        if (event.action == Action.downloadOutput) {
            let requestID: any = event.data['requestID'];
            let api: string = ApiConfig.outputFileDownloadApi.replace("{id}", requestID);
            let preferenceID: any = event.data['preferenceID'];
            this.loading = true;
            this.service.get(ApiConfig.getPreferenceOnIdApi.replace("{Id}", preferenceID)).subscribe(res => {
                if (res) {
                    let fileType: string = res['saveas'] ? res['saveas'][0] : '';
                    let fileName: string = event.data['fileName'].split('.')[0] + (fileType.toLowerCase() == 'json' ? '_output.json' : '_output.csv');
                    this.onDownload(api, fileName, fileType);
                }
            }, error => {
                this.loading = false;
                this.showError("Internal server error");
                console.log(error);
            });
        }
        if (event.action == Action.search) {
            let filterData: any = event.data;
            this.filterModel = {
                preference: filterData.preference ? filterData.preference : null,
                keywords: filterData.keywords ? filterData.keywords : null,
                filename: filterData.filename ? filterData.filename : null,
                fromDate: filterData.fromDate ? AppUtil.getFormattedDate(filterData.fromDate, '', false) : null,
                toDate: filterData.toDate ? AppUtil.getFormattedDate(filterData.toDate, '', false) : null,
                outputfrom: null,
                outputto: null
            };
            this.getData();
        }
    }

    onDownload(api: any, fileName: any, fileType: any){
        this.loading = true;
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

    disabledRequest(id: any): void{
        this.loading = true;
        let api: any = ApiConfig.disabledRequestApi.replace("{requestID}",id);
        let model: any = {is_active : 1};
        this.service.patch(api, model).subscribe(res => {
            if (res.result) {
                this.getData();
            }
            //this.loading = false;
        }, error => { this.loading = false; });
    }

    reSetTable(){
        this.tableConfig.table = null;
        this.tableConfig.columns = [];
        this.tableConfig.rows = [];
    }

    getPreferences() {
        this.service.get(ApiConfig.getUserPreferencesOptionApi).subscribe(res => {
            if (res.result) {
                let preferenceList: any[] = res.PreferenceList ? res.PreferenceList : [];
                let options: any[] = [];
                options.push({ value: '', label: 'Select' });
                preferenceList.forEach(x => {
                    options.push({ value: x.id, label: x.profileName });
                });
                this.preferenceOption = options;
            }
        }, error => { 
            console.log(error);
        });
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
