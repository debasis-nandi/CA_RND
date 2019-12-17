import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../../core/services/http.service';
import { ApiConfig } from '../../../core/config/api-config';
import { AppSession } from '../../../core/config/app-session';
import { AppUtil } from '../../../core/config/app-util';
import { GlobalConst, DocType, Template, TableName, Action } from '../../../core/config/app-enum';
import { ITableConfig } from '../../../core/models/datatable.model';
import { IManageAccount } from "../../../core/models/admin.model";

@Component({
    selector: 'app-manage-account',
    templateUrl: './manage-account.component.html',
    styleUrls: ['manage-account.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ManageAccountComponent implements OnInit {

    @ViewChild('myModal') modal:any;
    addAccountForm:FormGroup;

    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    modalHeader: string;
    modalCss: string = 'modal-dialog-600';
    
    tableName: string = TableName.manageAccount;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };
    userInfo: any;

    clientOption: any[] = [];
    isReadOnly: boolean = false;
    accId?: any = null;
    actionType: string;

    constructor(private fb: FormBuilder, private router: Router, private service: HttpService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
        this.addAccountForm = this.fb.group({
            accountName: ['', Validators.required],
            client: ['', [Validators.required]],
            keywords: ['', [Validators.required]]
        });
        this.getClientOption();
        this.getConfig();
    }

    setDefault(): void {
        this.addAccountForm.patchValue({
            accountName: "",
            client: "",
            keywords: ""
        });
    }

    getConfig() {
        let api: string = 'src/assets/tableconfig/manage-account.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                //this.tableConfig.rows = data.rows;
                this.getAccounts();
            }
        }, error => {
        });
    }

    getAccounts() {
        this.loading = true;
        this.service.get(ApiConfig.getManageAccountApi).subscribe(res => {
            let accList: any = res.result ? res.accountlist : [];
            this.tableConfig.rows = this.mapRows(accList);
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    mapRows(items: any[]): any {
        let dataRows: IManageAccount[] = [];
        if (items.length > 0) {
            for (let item of items) {
                let row: IManageAccount = {
                    accid: item.accid,
                    acc_name: item.acc_name,
                    client: item.client,
                    clientname: item.clientname,
                    keywords: item.accountkey,
                    is_active: item.is_active == 0 ? 'Yes' : 'No',
                    action: [Action.edit, (item.is_active == 0 ? Action.enable : Action.disable)]
                };
                dataRows.push(row);
            }
        }
        return dataRows;
    }

    onAction(event: any){
        this.setDefault();
        this.addAccountForm.enable();
        this.isReadOnly = false;
        this.actionType = event.action;
        this.accId = (event.data && event.data['accid']) ? event.data['accid'] : null;

        if(event.action == Action.view){
            this.modalHeader = 'View Account';
            this.isReadOnly = true;
            this.setFormData(event.data);
            this.addAccountForm.disable();
            this.open();
        }
        if(event.action == Action.add){
            this.modalHeader = 'Add Account';
            this.open();
        }
        if(event.action == Action.edit){
            this.modalHeader = 'Update Account';
            this.setFormData(event.data);
            this.open();
        }
        if(event.action == Action.disable){
            this.enableDisableRecord(true);
        }
        if(event.action == Action.enable){
            this.enableDisableRecord(false);
        }
    }

    onSubmit(): void {
        if (this.addAccountForm.valid) {
            let formData: any = this.addAccountForm.value;
            let postModel: any = {
                acc_name: formData.accountName ? formData.accountName : null,
                client: formData.client ? formData.client : null,
                keywords: formData.keywords ? formData.keywords : null,
                fromdate: null,
                enddate: null
            };
            this.loading = true;
            if(this.actionType == Action.add){
                this.service.post(ApiConfig.getManageAccountApi, postModel).subscribe(res => {
                    if (res.result) {
                        this.showSuccess(res.message);
                        setTimeout(() => {
                            this.close();
                            this.getAccounts();
                        }, GlobalConst.growlLife);
                    }
                    else {
                        this.showError(res.message);
                    }
                    this.loading = false;
                }, err => {
                    this.loading = false;
                    this.showError('Internal server error!');
                });
            }
            else{
                let accUpdateApi:any = ApiConfig.updateManageAccountApi.replace("{id}", this.accId);
                this.service.put(accUpdateApi, postModel).subscribe(res => {
                    if (res.result) {
                        this.showSuccess(res.message);
                        setTimeout(() => {
                            this.close();
                            this.getAccounts();
                        }, GlobalConst.growlLife);
                    }
                    else {
                        this.showError(res.message);
                    }
                    this.loading = false;
                }, err => {
                    this.loading = false;
                    this.showError('Internal server error!');
                });
            }
        }
    }

    getClientOption() {
        this.loading = true;
        this.service.get(ApiConfig.ddlClientApi).subscribe(res => {
            let clientList: any[] = res ? res : [];
            if (clientList.length > 0) {
                this.clientOption = clientList.map(x => {
                    return { value: x.clientid, label: x.clientname };
                });
            }
            this.loading = false;
        }, error => { this.loading = false });
    }
    
    setFormData(formData: any):void{
        this.addAccountForm.patchValue({
            accountName:formData['acc_name'],
            client:formData['client'],
            keywords:formData['keywords']
        });
    }

    enableDisableRecord(isEnable: boolean): void {
        let postModel: any = {
            is_active: isEnable ? 0 : 1
        };
        this.loading = true;
        let updateAccountApi: any = ApiConfig.updateManageAccountApi.replace("{id}", this.accId);
        this.service.put(updateAccountApi, postModel).subscribe(res => {
            if (res.result) {
                this.showSuccess(res.message);
                setTimeout(() => {
                    this.getAccounts();
                }, GlobalConst.growlLife);
            }
            else {
                this.loading = false;
                this.showError(res.message);
            }
        }, err => {
            this.loading = false;
            this.showError('Internal server error!');
        });
    }

    close(): void{
        this.modal.close();
    }

    open(): void{
        this.modal.open();
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
