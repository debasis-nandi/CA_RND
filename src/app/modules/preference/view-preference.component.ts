import { Component, OnInit, OnChanges } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst, Action } from '../../core/config/app-enum';
import { ITableConfig } from '../../core/models/datatable.model';
import { TableName } from '../../core/config/app-enum';
import { IPreferenceFilter } from '../../core/models/preferences.model';

@Component({
    selector: 'app-view-preference',
    templateUrl: './view-preference.component.html'
})
export class ViewPreferenceComponent implements OnInit {
    
    viewPreferenceForm:FormGroup;
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;

    tableName: string = TableName.preferences;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };
    preferenceFilter: IPreferenceFilter = { profileName: '', caltype: '', indextype: '', whttype: '' };
    
    preferenceOption: any[] = [];
    caltypeOption: any[] = [];
    indextypeOption: any[] = [];
    whttypeOption: any[] = [];

    constructor(private fb:FormBuilder, private router: Router, private service: HttpService) {
    }

    ngOnInit() {
        this.getConfig();
        this.getPreferences();
        this.getCalculationMethodology();
        this.getIndexType();
        this.getWhtType();
    }

    getConfig() {
        let api: string = 'src/assets/tableconfig/preference.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                this.tableConfig.rows = data.rows;
                this.getData();
            }
        }, error => {
        });
    }

    getData() {
        this.loading = true;
        this.service.post(ApiConfig.getPreferencesApi, this.preferenceFilter).subscribe(res => {
            let rows: any[] = res.result ? res.results : [];
            this.tableConfig.rows = this.mapActions(rows);
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        })
    }

    mapActions(rows: any[]): any{
        if(rows.length > 0){
            for(let row of rows){
                row.action = [Action.delete];
            }
        }
        return rows;
    }

    onAction(event: any){
        if(event.action == Action.search){
            this.preferenceFilter = event.data;
            this.getData();
        }
        if(event.action == Action.delete){
            this.disabledPreference(event.data.id);
        }
    }

    reSetTable(){
        this.tableConfig.table = null;
        this.tableConfig.columns = [];
        this.tableConfig.rows = [];
    }

    disabledPreference(id: any): void{
        this.loading = true;
        let api: any = ApiConfig.disabledPreferenceApi.replace("{Id}",id);
        let model: any = {is_active : 1};
        this.service.patch(api, model).subscribe(res => {
            if (res.result) {
                this.getData();
            }
            //this.loading = false;
        }, error => { this.loading = false; });
    }

    getPreferences() {
        this.loading = true;
        this.service.get(ApiConfig.getUserPreferencesOptionApi).subscribe(res => {
            if (res.result) {
                let preferenceList: any[] = res.PreferenceList ? res.PreferenceList : [];
                /*this.preferenceOption = preferenceList.map(x => {
                    return { value: x.profileName, label: x.profileName };
                });*/
                let options: any[] = [];
                options.push({value:'', label:'Select'});
                preferenceList.forEach(x=>{
                    options.push({ value: x.profileName, label:x.profileName});
                });
                this.preferenceOption = options;
            }
            this.loading = false;
        }, error => { this.loading = false; });
    }

    getCalculationMethodology() {
        this.caltypeOption = [
            { value: 'Stock Base', label: 'Stock Base' },
            { value: 'Divisor Base', label: 'Divisor Base' },
            { value: 'Accu Cash', label: 'Accu Cash' }
        ];
    }
    
    getIndexType() {
        this.indextypeOption = [
            { value: 'ALL', label: 'ALL' },
            { value: 'PR', label: 'PR (Price Return)' },
            { value: 'NTR', label: 'NTR (Net Total Return)' },
            { value: 'GTR', label: 'GTR (Gross Total Return)' }
        ];
    }

    getWhtType() {
        this.whttypeOption = [
            { value: 'custom', label: 'Custom' },
            { value: 'standard', label: 'Standard' }
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
