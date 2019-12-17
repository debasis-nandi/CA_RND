import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../../core/services/http.service';
import { ApiConfig } from '../../../core/config/api-config';
import { AppSession } from '../../../core/config/app-session';
import { AppUtil } from '../../../core/config/app-util';
import { GlobalConst, DocType, Template, TableName, Action } from '../../../core/config/app-enum';
import { ITableConfig } from '../../../core/models/datatable.model';
import { IManageUser } from '../../../core/models/admin.model';

@Component({
    selector: 'app-manage-user',
    templateUrl: './manage-user.component.html',
    styleUrls: ['manage-user.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ManageUserComponent implements OnInit {

    @ViewChild('myModal') modal:any;
    userForm: FormGroup;
    userActivationForm: FormGroup;

    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    modalHeader: string;
    modalCss: string = 'modal-dialog-600';

    tableName: string = TableName.manageUser;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };
    
    clientOption: any[] = [];
    accountOption: any[] = [];
    roleOption: any[] = [];

    userInfo: any;
    userId?: any = null;
    actionType: string;

    constructor(private fb: FormBuilder, private router: Router, private service: HttpService) {
        this.userForm = this.fb.group({
            userName: [''],
            email: [''],
            firstName: [''],
            lastName: [''],
            clientName: [''],
            accountName: [''],
            active: ['']
        });
        this.userActivationForm = this.fb.group({
            client: [''],
            account: ['',[Validators.required]],
            role: ['',[Validators.required]],
            active: ['']
        });
        this.userInfo = AppSession.getSessionStorage("UserInfo");
        //console.log(this.userInfo);
    }

    ngOnInit() {
        this.getClientOption();
        this.getAccountOption();
        this.getConfig();
    }

    getConfig() {
        let api: string = 'src/assets/tableconfig/manage-user.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                //this.tableConfig.rows = data.rows;
                this.getUsers();
            }
        }, error => {
        });
    }

    getUsers(): void {
        this.loading = true;
        this.service.get(ApiConfig.getManageUserApi).subscribe(res => {
            if(res.result){
                let userList: any = res.userlist;
                this.tableConfig.rows = this.mapRows(userList);
            }
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    mapRows(items: any[]): any {
        let dataRows: IManageUser[] = [];
        if (items.length > 0) {
            for (let item of items) {
                let row: IManageUser = {
                    id: item.id,
                    username: item.username,
                    email: item.email,
                    active: item.active ? 'Yes' : 'No',
                    first_name: item.first_name,
                    last_name: item.last_name,
                    clientname: item.clientname,
                    accountname: item.accountname,
                    action: [(item.active ? Action.enable : Action.disable)]
                };
                dataRows.push(row);
            }
        }
        return dataRows;
    }

    onAction(event: any){
        this.setDefault();
        this.userForm.enable();
        this.actionType = event.action;
        this.userId = (event.data && event.data['id']) ? event.data['id'] : null;

        if(event.action == Action.view){
            this.modalHeader = 'View User';
            this.setFormData(event.data);
            this.userForm.disable();
            this.open();
        }
        if(event.action == Action.enable){
            this.modalHeader = 'Activate User';
            this.getUserDetails();
            this.open();
        }
        if(event.action == Action.disable){
            this.enableDisableUser(event.data);
        }
    }

    getUserDetails(): void {
        let api: any = ApiConfig.getManageUserApi + this.userId;
        this.loading = true;
        this.service.get(api).subscribe(res => {
            if(res.result){
                this.setFormData2(res.userdetail);
            }
            this.loading = false;
        }, error => {
            this.loading = false;
            this.showError('Internal server error!');
        });
    }

    setDefault(): void {
        this.userForm.patchValue({
            userName: '',
            email: '',
            firstName: '',
            lastName: '',
            clientName: '',
            accountName: '',
            active: ''
        });
        
        this.userActivationForm.patchValue({
            client: '',
            account: '',
            role: '',
            active: ''
        });
    }

    setFormData(formData: any): void {
        this.userForm.patchValue({
            userName: formData['username'],
            email: formData['email'],
            firstName: formData['first_name'],
            lastName: formData['last_name'],
            clientName: formData['clientname'],
            accountName: formData['accountname'],
            active: formData['active'] == 'Yes' ? 'true' : 'false'
        });
    }

    setFormData2(formData: any): void {
        this.userActivationForm.patchValue({
            client: formData['clientid'] ? formData['clientid'] : '',
            account: formData['accountid'] ? formData['accountid'] : '',
            role: formData['userroleid'] ? formData['userroleid'] : '',
            active: formData['active'] ? 'true' : 'false'
        });
        this.userActivationForm.controls['client'].disable();
        this.getRoleOption(formData['clientid']);
    }

    onSubmit(): void {
        if (this.userActivationForm.valid) {
            let formData: any = this.userActivationForm.value;
            let model: any = {
                userid: this.userId,
                role: formData['role'] ? parseInt(formData['role']) : null,
                account: formData['account'] ? formData['account'] : null,
                active: formData['active'] == 'true' ? true : false
            }
            this.loading = true;
            this.service.post(ApiConfig.activateUserApi, model).subscribe(response => {
                if (response.result) {
                    this.showSuccess(response.message);
                    setTimeout(() => {
                        this.close();
                        this.getUsers();
                    }, GlobalConst.growlLife);
                }
                else {
                    this.showError(response.message);
                }
                this.loading = false;
            }, err => {
                this.loading = false;
                this.showError('Internal server error!');
            });
        }
    }

    enableDisableUser(formData: any): void {
        let model: any = {
            userid: formData['id'],
            active: formData['active'] == 'Yes' ? false : true
        };
        this.loading = true;
        this.service.put(ApiConfig.activateUserApi, model).subscribe(res => {
            if (res.result) {
                setTimeout(() => {
                    this.getUsers();
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

    getAccountOption() {
        this.loading = true;
        this.service.get(ApiConfig.ddlAccountApi).subscribe(res => {
            let accountList: any[] = res.result ? res.accountlist : [];
            if (accountList.length > 0) {
                this.accountOption = accountList.map(x => {
                    return { value: x.accid, label: x.acc_name };
                });
            }
            this.loading = false;
        }, error => { this.loading = false });
    }

    getRoleOption(clientId: any) {
        this.loading = true;
        let api: any = ApiConfig.ddlRoleApi.replace("{clientId}",clientId);
        this.service.get(api).subscribe(res => {
            let roleList: any[] = res.result ? res.rolelist : [];
            if (roleList.length > 0) {
                this.roleOption = roleList.map(x => {
                    return { value: x.roleid, label: x.rolename };
                });
            }
            this.loading = false;
        }, error => { this.loading = false });
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
