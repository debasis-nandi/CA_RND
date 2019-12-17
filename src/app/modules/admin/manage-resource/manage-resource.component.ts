import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../../core/services/http.service';
import { ApiConfig } from '../../../core/config/api-config';
import { AppSession } from '../../../core/config/app-session';
import { AppUtil } from '../../../core/config/app-util';
import { GlobalConst, DocType, Template, TableName, Action } from '../../../core/config/app-enum';
import { ITableConfig } from '../../../core/models/datatable.model';
import { IManageResource, IResource, IResourcePost, TreeNode } from "../../../core/models/admin.model";

@Component({
    selector: 'app-manage-resource',
    templateUrl: './manage-resource.component.html',
    styleUrls: ['manage-resource.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ManageResourceComponent implements OnInit {

    @ViewChild('myModal') modal:any;
    
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    modalHeader: string;
    modalCss: string = 'modal-dialog-600';
    
    tableName: string = TableName.manageResource;
    tableConfig:ITableConfig = { table: null, columns: [], rows: [] };
    userInfo: any;

    clientOption: any[] = [];
    roleOption: any[] = [];
    actionType: string;
    isReadOnly: boolean = false;
    
    resourceList: TreeNode[] = [];
    selectedResource: any[] = []
    dataArray: any[] = [];
    preSelectedResource: any[] = [];
    clientId: any;
    roleId: any;

    constructor(private fb: FormBuilder, private router: Router, private service: HttpService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
        this.getClientOption();
        this.getResourceList();
        this.getConfig();
        this.setDefault();
    }

    setDefault(): void {
        this.clientId = '';
        this.roleId = '';
        this.selectedResource = [];
        this.dataArray = [];
    }

    getConfig() {
        let api: string = 'src/assets/tableconfig/manage-resource.json';
        this.service.getConfig(api).subscribe(data => {
            if (data) {
                this.tableConfig.table = data.table;
                this.tableConfig.columns = data.columns;
                //this.tableConfig.rows = data.rows;
                this.getResources();
            }
        }, error => {
            console.log(error);
        });
    }

    getResources() {
        this.loading = true;
        this.service.get(ApiConfig.getACLRolesApi).subscribe(res => {
            let resourceList: any = res.result ? res.resoucelist : [];
            this.tableConfig.rows = this.mapRows(resourceList);
            this.loading = false;
        }, error => {
            this.loading = false;
            console.log(error);
        });
    }

    mapRows(items: IManageResource[]): any {
        let dataRows: IManageResource[] = [];
        if (items.length > 0) {
            for (let item of items) {
                let row: IManageResource = {
                    roleid: item.roleid,
                    rolename: item.rolename,
                    clientid: item.clientid,
                    clientname: item.clientname,
                    resourcename: item.resourcename,
                    active: item.active,
                    action: [Action.edit]
                };
                dataRows.push(row);
            }
        }
        return dataRows;
    }

    onAction(event: any){
        //console.log(event);
        this.setDefault();
        this.isReadOnly = false;
        this.actionType = event.action;
        this.clientId = (event.data && event.data['clientid']) ? event.data['clientid'].toString() : '';
        this.roleId = (event.data && event.data['roleid']) ? event.data['roleid'].toString() : '';
        
        if(event.action == Action.view){
            this.modalHeader = 'View Resource';
            this.isReadOnly = true;
            this.getRoleOnClient(this.clientId);
            this.getResourceOnRole(this.roleId);
            this.open();
        }
        if(event.action == Action.add){
            this.modalHeader = 'Add Resource';
            this.preSelectedResource = [];
            this.open();
        }
        if(event.action == Action.edit){
            this.modalHeader = 'Update Resource';
            this.getRoleOnClient(this.clientId);
            this.getResourceOnRole(this.roleId);
            this.open();
        }
    }

    onSubmit(): void {
        //console.log(this.selectedResource);
        let error: number = 0;
        if (!this.clientId) {
            error++;
            this.showError('Client name cannot be left blank.');
            return;
        }
        if (!this.roleId) {
            error++;
            this.showError('Role name cannot be left blank.');
            return;
        }
        if (this.selectedResource.length == 0) {
            error++;
            this.showError('Resource cannot be left blank, select atleast one item.');
            return;
        }

        //let dd = this.mapPostData();
        //console.log(dd);

        if (error == 0) {
            let postModel: any = { roleacl: this.mapPostData() };
            this.loading = true;
            let api: any = ApiConfig.manageResourceApi.replace("{roleId}", this.roleId);
            if (this.actionType == Action.add) {
                this.service.post(api, postModel).subscribe(res => {
                    if (res.result) {
                        this.showSuccess(res.message);
                        setTimeout(() => {
                            this.close();
                            this.getResources();
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
                this.service.put(api, postModel).subscribe(res => {
                    if (res.result) {
                        this.showSuccess(res.message);
                        setTimeout(() => {
                            this.close();
                            this.getResources();
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

    mapPostData(): IResourcePost[] {
        let postModel: IResourcePost[] = [];
        if (this.selectedResource.length > 0) {
            for (let selectedRes of this.selectedResource) {
                if (selectedRes.data) {
                    let resource: any[] = this.preSelectedResource.filter(x => x.resourceid == parseInt(selectedRes.data));
                    let item: IResourcePost = {};
                    if (resource && resource.length > 0) {
                        item.id = resource[0].id;
                        item.resourceid = resource[0].resourceid;
                        item.resourcename = resource[0].resourcename;
                        item.resourceparent = resource[0].resourceparent;
                        item.active = true;
                    }
                    else {
                        item.id = null;
                        item.resourceid = parseInt(selectedRes.data);
                        item.resourcename = selectedRes.label;
                        item.resourceparent = '';
                        item.active = true;
                    }
                    postModel.push(item);
                }
            }
        }
        if (this.preSelectedResource.length > 0) {
            for (let preSelectedRes of this.preSelectedResource) {
                let resource: any[] = this.selectedResource.filter(x => parseInt(x.data) == preSelectedRes.resourceid);
                let item: IResourcePost = {};
                if (resource.length == 0) {
                    item.id = preSelectedRes.id;
                    item.resourceid = preSelectedRes.resourceid;
                    item.resourcename = preSelectedRes.resourcename;
                    item.resourceparent = preSelectedRes.resourceparent;
                    item.active = false;
                    postModel.push(item);
                }
            }
        }
        return postModel;
    }

    getResourceOnRole(roleId: any): void{
        this.loading = true;
        let api: any = ApiConfig.manageResourceApi.replace("{roleId}", roleId);
        this.service.get(api).subscribe(res=>{
            if(res.result){
                this.setFormData(res.resoucelist);
            }
            this.loading = false;
        },err=>{
            console.log(err);
            this.loading = false;
        });
    }

    setFormData(resourceList: any[]):void{
        //console.log(resourceList);
        //let dataArray : any[] = ["1","2","3","4","5","9"];
        this.preSelectedResource = resourceList;
        this.dataArray = resourceList.map(x=>{ return x.resourceid.toString() });
        this.checkNode(this.resourceList, this.dataArray);
        this.expandAll();
    }

    getClientOption():void {
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

    onChangeClient(selectedValue: any): void {
        this.roleId = '';
        this.roleOption = [];
        if (selectedValue) {
            this.getRoleOnClient(selectedValue);
        }
    }

    getRoleOnClient(clientId: any): void {
        if (clientId) {
            let api: any = ApiConfig.ddlRoleApi.replace("{clientId}", clientId);
            this.service.get(api).subscribe(res => {
                let roleList: any[] = res.result ? res.rolelist : [];
                if (roleList.length > 0) {
                    this.roleOption = roleList.map(x => {
                        return { value: x.roleid, label: x.rolename };
                    });
                }
            }, error => {
                console.log(error);
            });
        }
    }

    getResourceList(): void {
        this.loading = true;
        this.service.get(ApiConfig.getResourceApi).subscribe(res => {
            if(res.result){
                this.setResourceTree(res.resourcelist);
                this.expandAll();
            }
            this.loading = false;
        }, error => { this.loading = false });
    }

    setResourceTree(resource: IResource[]) {
        if (resource.length > 0) {
            let distinctItems : IResource[] = this.getDistinctResource(resource);
            for (let item of distinctItems) {
                let isChild: boolean = resource.filter(x=> x.parent == item.parent && x.name != item.parent).length > 0 ? true : false;
                let treeNode = this.mapParent(item, isChild);
                if (isChild) {
                    let childItems: IResource[] = resource.filter(x=> x.parent == item.parent && x.name != item.parent);
                    for (let count=0; count < childItems.length; count++) {
                        let childNode = this.mapChild(childItems[count]);
                        treeNode.children.push(childNode);
                    }
                }
                this.resourceList.push(treeNode);
            }
        }
    }

    mapParent(item: IResource, isChild: boolean): TreeNode{
        let mapNode:TreeNode = {};
        mapNode.label = item.parent;
        mapNode.data = isChild ? null : item.id.toString();
        mapNode.expandedIcon = "";
        mapNode.collapsedIcon = "";
        mapNode.leaf = true;
        mapNode.children = [];
        return mapNode;
    }

    mapChild(item: IResource): TreeNode{
        let mapNode:TreeNode = {};
        mapNode.label = item.name;
        mapNode.data = item.id.toString();
        mapNode.expandedIcon = "";
        mapNode.collapsedIcon = "";
        mapNode.leaf = true;
        mapNode.children = [];
        return mapNode;
    }

    getDistinctResource(objResource: IResource[]): IResource[]{
        let result: IResource[] = [];
        let map = new Map();
        for (let item of objResource) {
            if(!map.has(item.parent)){
                map.set(item.parent, true); // set any value to Map
                result.push(item);
            }
        }
        return result;
    } 

    checkNode(nodes:TreeNode[], str:string[]) {
        for(let i=0 ; i < nodes.length ; i++) {
            if(!nodes[i].leaf && nodes[i].children[0].leaf) {
                for(let j=0 ; j < nodes[i].children.length ; j++) {
                    if(str.indexOf(nodes[i].children[j].data) >= 0) {
                        if(this.selectedResource.indexOf(nodes[i].children[j]) == -1){
                            this.selectedResource.push(nodes[i].children[j]);
                        }
                    }
                }
            }
            
            /*if (nodes[i].leaf) {
                return;
            }*/

            if (nodes[i].leaf) {
                if(str.indexOf(nodes[i].data) >= 0) {
                    if(this.selectedResource.indexOf(nodes[i]) == -1){
                        this.selectedResource.push(nodes[i]);
                    }
                }
            }

            this.checkNode(nodes[i].children, str);
            let count = nodes[i].children.length;
            let c = 0;
            for(let j=0 ; j < nodes[i].children.length ; j++) {
                if(this.selectedResource.indexOf(nodes[i].children[j]) >= 0) {
                    c++;
                }
                if(nodes[i].children[j].partialSelected) nodes[i].partialSelected = true;
            }
            if(c == 0) {}
            else if(c == count) { 
                nodes[i].partialSelected = false;
                if(this.selectedResource.indexOf(nodes[i]) == -1){
                    this.selectedResource.push(nodes[i]); 
                }
            }
            else {
                nodes[i].partialSelected = true;
            }
        }
    }

    nodeSelect(event) {
        //this.addNode(event.node);
        //this.selectedResource = [];
        //this.checkNode(this.resourceList, this.dataArray);
    }
    
    nodeUnselect(event) {
        //this.removeNode(event.node);
        //this.selectedResource = [];
        //this.checkNode(this.resourceList, this.dataArray);
    }

    removeNode(node: TreeNode) {
        if(node.leaf) {
            this.dataArray.splice(this.dataArray.indexOf(node.data),1);
            return;
        } 
        for(let i=0 ; i < node.children.length ; i++){
            this.removeNode(node.children[i]);
        }
    }

    addNode(node: TreeNode) {
        if(node.leaf) {
            if(this.dataArray.indexOf(node.data) == -1){
                this.dataArray.push(node.data);
            }
            return;
        }
        for(let i=0 ; i < node.children.length ; i++) {
            this.addNode(node.children[i]);
        }
    }

    expandAll() {
        this.resourceList.forEach(node => {
            this.expandRecursive(node, true);
        });
    }

    collapseAll() {
        this.resourceList.forEach(node => {
            this.expandRecursive(node, false);
        });
    }

    expandRecursive(node: any, isExpand: boolean) {
        node.expanded = isExpand;
        if (node.children) {
            node.children.forEach(childNode => {
                this.expandRecursive(childNode, isExpand);
            });
        }
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
