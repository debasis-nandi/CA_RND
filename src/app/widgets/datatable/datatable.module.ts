import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ConfirmDialogModule, ConfirmationService, TooltipModule, DropdownModule } from 'primeng/primeng';
import { MyDatePickerModule } from 'mydatepicker';

import { DataTableComponent } from './datatable.component';

@NgModule({
    imports:[
        CommonModule,
        FormsModule,
        RouterModule,
        TableModule,
        ConfirmDialogModule,
        TooltipModule,
        DropdownModule,
        MyDatePickerModule
    ],
    declarations:[
        DataTableComponent
    ],
    providers:[
        ConfirmationService
    ],
    exports: [
        DataTableComponent
    ]
})

export class DataTableModule { }