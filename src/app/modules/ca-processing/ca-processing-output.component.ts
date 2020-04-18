import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { TableName, Action, Template } from '../../core/config/app-enum';
import { ITableConfig } from '../../core/models/datatable.model';
import { IProcessOutput } from '../../core/models/ca-processing.model';

@Component({
    selector: 'app-ca-processing-output',
    templateUrl: './ca-processing-output.component.html'
})
export class CAProcessingOutputComponent implements OnInit {
    
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;

    tableName: string = TableName.caProcessingOutput;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };
    requestId: any;
    
    constructor(private router: Router, private route: ActivatedRoute, private service: HttpService) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.requestId = params['requestId'] || null;
            this.getConfig();
        });
    }

    onBack(): void{
        this.router.navigate(['ca-processing']);
    }

    getConfig() {
        let api: string = 'src/assets/tableconfig/ca-processing-output.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                this.tableConfig.rows = data.rows;
                this.getRequestOutput();
            }
        }, error => {
        });
    }

    getRequestOutput(): void {
        this.loading = true;
        let api: string = ApiConfig.processOutputApi.replace("{requestId}", this.requestId);
        this.service.get(api).subscribe(res => {
            if (res.result) {
                if (res.results && res.results.length > 0) {
                    this.tableConfig.rows = res.results;
                    this.loading = false;
                }
                else {
                    setInterval(() => {
                        this.getRequestOutput();
                    }, 5000);
                }
            }
            else {
                this.showError(res['message']);
                this.loading = false;
            }
        }, err => {
            this.loading = false;
            this.showError("Internal server error");
            console.log(err);
        });
    }

    downloadOutput(event: any) {
        this.loading = true;
        this.service.get(ApiConfig.getRequestApi.replace("{Id}", this.requestId)).subscribe(res => {
            if (res) {
                let fileType: string = 'csv';                
                let fileName: string = res['fileName'].split('.')[0] + (fileType.toLowerCase() == 'json' ? '_output.json' : '_output.csv');
                this.onDownload(fileName, fileType);
            }
        }, error => {
            this.loading = false;
            this.showError("Internal server error");
            console.log(error);
        });
    }

    onDownload(fileName: string, fileType: string): void {
        this.loading = true;
        let api: string = ApiConfig.outputFileDownloadApi.replace("{id}", this.requestId);
        this.service.getData(api, fileType).subscribe(res => {
            //res = {"result":false,"message":"Input Request still in process."};
            let objRes: any[] = (JSON.stringify(res)).split('\\');
            if (objRes[0] == '"{' && objRes[6] == '"}"') {
                let jsonObj: any = JSON.parse(res);
                this.showError(jsonObj['message']);
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

    showSuccess(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'success', detail: message });
    }

    showError(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', detail: message });
    }

}
