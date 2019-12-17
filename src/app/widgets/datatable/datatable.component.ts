import { Component, Input, OnInit, ViewEncapsulation, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { LazyLoadEvent, ConfirmationService } from 'primeng/primeng';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { Action, TableName } from '../../core/config/app-enum';
import { AppUtil} from '../../core/config/app-util';
import { ITableConfig, Table, Column } from '../../core/models/datatable.model';
import { IPreferenceFilter } from '../../core/models/preferences.model';
import { IRequestFilter } from '../../core/models/ca-processing.model';

@Component({
    selector: 'my-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['datatable.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class DataTableComponent implements OnInit {

    @ViewChild('myTable') myTable: any;
    
    @Output() valueChange = new EventEmitter();
    @Output() onLazyLoading = new EventEmitter();

    @Input() table: Table;
    @Input() columns: Column[];
    @Input() rows: any;
    @Input() tableName: any;
    @Input() totalRecords: any;
    @Input() loading: boolean = false;
    
    @Input() preferenceOption: any[] = [];
    @Input() caltypeOption: any[] = [];
    @Input() indextypeOption: any[] = [];
    @Input() whttypeOption: any[] = [];

    isAddButton: boolean = false;
    isPreferenceFilter: boolean = false;
    isRequestFilter: boolean = false;
    
    preferenceFilter: IPreferenceFilter = { profileName: '', caltype: '', indextype: '', whttype: '' };
    requestFilter: IRequestFilter = { preference: '', filename: '', keywords: '', fromDate: '', toDate: '', outputfrom: '', outputto: '' };

    myFromDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    myToDateFormat: IMyDpOptions = { dateFormat: 'dd-mm-yyyy', editableDateField: false, selectorHeight: '200px', selectorWidth: '190px' };
    
    constructor(private router: Router, private confirmationService: ConfirmationService){
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (this.table) {
            this.table.paginator = this.rows.length > this.table.rows ? true : false;
            this.isAddButton = (this.tableName == TableName.preferences || this.tableName == TableName.caProcessing || this.tableName == TableName.manageClient || this.tableName == TableName.manageAccount || this.tableName == TableName.manageResource) ? true : false;
            this.isPreferenceFilter = (this.tableName == TableName.preferences) ? true : false;
            this.isRequestFilter = (this.tableName == TableName.caProcessing) ? true : false;
        }
    }

    onSearch() {
        if (this.tableName == TableName.preferences) {
            let emited: any = { action: Action.search, data: this.preferenceFilter };
            this.valueChange.emit(emited);
        }
        if (this.tableName == TableName.caProcessing) {
            let emited: any = { action: Action.search, data: this.requestFilter };
            this.valueChange.emit(emited);
        }
    }

    onDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.requestFilter.toDate = '';
        if(event.jsdate){
            let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
            toDate.setDate(toDate.getDate() - 1);
            this.myToDateFormat = {
                dateFormat: 'dd-mm-yyyy',
                disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
            };
        }
    }

    onAction(actionType: any, index?: any, row?: any) {
        let emited: any = { action: actionType, data: row };
        if (actionType == Action.delete) {
            this.confirmationService.confirm({
                message: 'Do you really want to disable record?',
                accept: () => {
                    this.valueChange.emit(emited);
                }
            });
        }
        else if (actionType == Action.disable) {
            this.confirmationService.confirm({
                message: 'Do you really want to enable record?',
                accept: () => {
                    this.valueChange.emit(emited);
                }
            });
        }
        else if (actionType == Action.enable) {
            if (this.tableName == TableName.manageUser) {
                this.valueChange.emit(emited);
            }
            else {
                this.confirmationService.confirm({
                    message: 'Do you really want to disable record?',
                    accept: () => {
                        this.valueChange.emit(emited);
                    }
                });
            }
        }
        else {
            this.valueChange.emit(emited);
        }
    }

    onLinkClick(routeLink: any, field: any, rowIndex?: any, row?: any){
        if(this.tableName == TableName.manageClient || this.tableName == TableName.manageAccount || this.tableName == TableName.manageUser || this.tableName == TableName.manageResource){
            let emited: any = { action: Action.view, data: row };
            this.valueChange.emit(emited);
        }
        else{
            this.router.navigate([routeLink, field]);
        }
    }

    onEdit(routeLink: any, id: any) {
        this.router.navigate([routeLink, id]);
    }

    onDelete(id: any) {
        this.valueChange.emit(id);
    }

    onAddNew(): void {
        if (this.tableName == TableName.preferences){
            this.router.navigateByUrl("/preference/add-preference");
        }   
        if (this.tableName == TableName.caProcessing){
            this.router.navigateByUrl("/ca-processing/ca-processing-add");
        }   
        if (this.tableName == TableName.manageClient || this.tableName == TableName.manageAccount || this.tableName == TableName.manageUser || this.tableName == TableName.manageResource){
            let emited: any = { action: Action.add, data: null };
            this.valueChange.emit(emited);
        }   
    }

    loadDataLazy(event: LazyLoadEvent) {
        this.onLazyLoading.emit();
    }

    isDelete(actionList: any[] = []): Boolean {
        return (actionList && actionList.filter(x => x == Action.delete).length > 0) ? true : false;
    }

    isDownload(actionList: any[] = []): Boolean {
        return (actionList && actionList.filter(x => x == Action.download).length > 0) ? true : false;
    }

    isDownloadInput(actionList: any[] = []): Boolean {
        return (actionList && actionList.filter(x => x == Action.downloadInput).length > 0) ? true : false;
    }

    isDownloadOutput(actionList: any[] = []): Boolean {
        return (actionList && actionList.filter(x => x == Action.downloadOutput).length > 0) ? true : false;
    }

    isShare(actionList: any[] = []): Boolean {
        return (actionList && actionList.filter(x => x == Action.share).length > 0) ? true : false;
    }

    isCopy(actionList: any[] = []): boolean {
        return (actionList && actionList.filter(x => x == Action.copy).length > 0) ? true : false;
    }

    isEdit(actionList: any[] = []): boolean {
        return (actionList && actionList.filter(x => x == Action.edit).length > 0) ? true : false;
    }

    isDisable(actionList: any[] = []): boolean {
        return (actionList && actionList.filter(x => x == Action.disable).length > 0) ? true : false;
    }

    isEnable(actionList: any[] = []): boolean {
        return (actionList && actionList.filter(x => x == Action.enable).length > 0) ? true : false;
    }
    
    
}