import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { HttpService } from '../../../core/services/http.service';
import { ApiConfig } from '../../../core/config/api-config';
import { AppSession } from '../../../core/config/app-session';
import { AppUtil } from '../../../core/config/app-util';
import { GlobalConst, DocType, Template, TableName, Action } from '../../../core/config/app-enum';
import { ITableConfig } from '../../../core/models/datatable.model';
import { IManageClient } from "../../../core/models/admin.model";

@Component({
    selector: 'app-manage-client',
    templateUrl: './manage-client.component.html',
    styleUrls: ['manage-client.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ManageClientComponent implements OnInit {

    @ViewChild('myModal') modal:any;
    addClientForm:FormGroup;

    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    modalHeader: string;
    modalCss: string = 'modal-dialog-600';

    myFromDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false };
    myToDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false };

    tableName: string = TableName.manageClient;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };
    userInfo: any;
    isReadOnly: boolean = false;
    clientId?: any = null;
    actionType: string;

    constructor(private fb: FormBuilder, private router: Router, private service: HttpService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
        //console.log(this.userInfo);
    }

    ngOnInit() {
        this.addClientForm = this.fb.group({
            clientName: ['', [Validators.required]],
            domainName: ['', [Validators.required]],
            subscriptionStart:['', [Validators.required]],
            subscriptionEnd:['', [Validators.required]],
            active: ['true']
        });
        this.getConfig();
    }

    setDefault(): void{
        this.addClientForm.patchValue({
            clientName:"",
            domainName:"",
            subscriptionStart:"",
            subscriptionEnd:"",
            active:"true"
        });
    }

    onDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.addClientForm.controls['subscriptionEnd'].setValue('');
        let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
        toDate.setDate(toDate.getDate() - 1);
        this.myToDateFormat = {
            dateFormat: 'mm-dd-yyyy',
            disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
        };
    }

    getConfig() {
        let api: string = 'src/assets/tableconfig/manage-client.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                //this.tableConfig.rows = data.rows;
                this.getClients();
            }
        }, error => {
        });
    }

    getClients() {
        this.loading = true;
        this.service.get(ApiConfig.getManageClientApi).subscribe(res => {
            if(res.result){
                let clientList: any = res.clientlist;
                this.tableConfig.rows = this.mapRows(clientList);
            }
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    mapRows(items: any[]): any {
        let dataRows: IManageClient[] = [];
        if (items.length > 0) {
            for (let item of items) {
                let row: IManageClient = {
                    clientid: item.clientid,
                    clientname: item.clientname,
                    client_domain: item.client_domain,
                    is_active: item.is_active == 0 ? 'Yes' : 'No',
                    createdby: item.createdby,
                    createddate: item.createddate ? AppUtil.getDate(item.createddate, 'dd-mm-yyyy') : '',
                    subscription_start : item.subscription_start ? AppUtil.getDate(item.subscription_start, 'dd-mm-yyyy') : '',
                    subscription_end : item.subscription_end ? AppUtil.getDate(item.subscription_end, 'dd-mm-yyyy') : '',
                    action: [Action.edit, (item.is_active == 0 ? Action.enable : Action.disable)]
                };
                dataRows.push(row);
            }
        }
        return dataRows;
    }

    onAction(event: any){
        // reset form
        this.setDefault();
        this.addClientForm.enable();
        this.isReadOnly = false;
        this.actionType = event.action;
        this.clientId = (event.data && event.data['clientid']) ? event.data['clientid'] : null;
        
        if(event.action == Action.view){
            this.modalHeader = 'View Client';
            this.isReadOnly = true;
            this.setFormData(event.data);
            this.addClientForm.disable();
            this.open();
        }
        if(event.action == Action.add){
            this.modalHeader = 'Add Client';
            this.open();
        }
        if(event.action == Action.edit){
            this.modalHeader = 'Update Client';
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
        if (this.addClientForm.valid) {
            let formData: any = this.addClientForm.value;
            let postModel: any = {
                clientname: formData.clientName ? formData.clientName : null,
                client_domain: formData.domainName ? formData.domainName : null,
                is_active: formData.active == 'true' ? 0 : 1,
                subscription_start: formData.subscriptionStart ? AppUtil.getFormattedDate(formData.subscriptionStart, '', false) : null,
                subscription_end: formData.subscriptionEnd ? AppUtil.getFormattedDate(formData.subscriptionEnd, '', false) : null,
                createdby: this.userInfo.username,
                createddate: AppUtil.getDate(new Date(), '')
            };
            this.loading = true;
            if (this.actionType == Action.add) {
                this.service.post(ApiConfig.getManageClientApi, postModel).subscribe(res => {
                    if (res.result) {
                        this.showSuccess(res.message);
                        setTimeout(() => {
                            this.close();
                            this.getClients();
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
            else {
                let updateClientApi: any = ApiConfig.updateManageClientApi.replace("{id}",this.clientId);
                this.service.put(updateClientApi, postModel).subscribe(res => {
                    if (res.result) {
                        this.showSuccess(res.message);
                        setTimeout(() => {
                            this.close();
                            this.getClients();
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

    setFormData(formData: any):void{
        this.addClientForm.patchValue({
            clientName:formData['clientname'],
            domainName:formData['client_domain'],
            subscriptionStart:formData['subscription_start'] ? AppUtil.setDate(AppUtil.convert_DD_MM_YYYY_2Date(formData['subscription_start'])) : '',
            subscriptionEnd:formData['subscription_end'] ? AppUtil.setDate(AppUtil.convert_DD_MM_YYYY_2Date(formData['subscription_end'])) : '',
            active:formData['is_active'] == 'Yes' ? 'true' : 'false'
        });
    }

    enableDisableRecord(isEnable: boolean): void {
        let postModel: any = {
            is_active: isEnable ? 0 : 1,
            createdby: this.userInfo.username,
            createddate: AppUtil.getDate(new Date(), '')
        };
        this.loading = true;
        let updateClientApi: any = ApiConfig.updateManageClientApi.replace("{id}", this.clientId);
        this.service.put(updateClientApi, postModel).subscribe(res => {
            if (res.result) {
                this.showSuccess(res.message);
                setTimeout(() => {
                    this.getClients();
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
