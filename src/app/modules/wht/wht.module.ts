import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GrowlModule, DropdownModule, FileUploadModule, KeyFilterModule, ConfirmDialogModule, ConfirmationService, TooltipModule, CheckboxModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { ModalModule } from "ngx-modal";
import { MyDatePickerModule } from 'mydatepicker';

import { ViewWHTComponent } from './view-wht.component';
import { AddWHTComponent } from './add-wht.component';
import { BulkUploadWHTComponent } from './bulkupload-wht.component';
import { WHTRoutingModule } from './wht-routing.module';

import { SharedModule } from '../../shared/shared.module';
import { LoaderModule } from '../../widgets/spinner/spinner.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WHTRoutingModule,
    SharedModule,
    LoaderModule,
    GrowlModule,
    TableModule,
    DropdownModule,
    ModalModule,
    KeyFilterModule,
    MyDatePickerModule,
    FileUploadModule,
    ConfirmDialogModule,
    TooltipModule,
    CheckboxModule
  ],
  declarations: [
    ViewWHTComponent,
    AddWHTComponent,
    BulkUploadWHTComponent
  ],
  providers:[
    ConfirmationService
  ]
})
export class WHTModule { }
