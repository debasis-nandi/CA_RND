import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  GrowlModule, AccordionModule, KeyFilterModule, FileUploadModule, DropdownModule,
  MessagesModule, TooltipModule, OverlayPanelModule, TabViewModule, ConfirmDialogModule, ConfirmationService
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { MyDatePickerModule } from 'mydatepicker';

import { SharedModule } from '../../shared/shared.module';
import { LoaderModule } from '../../widgets/spinner/spinner.module';
import { DataTableModule } from '../../widgets/datatable/datatable.module';

import { CAProcessingRoutingModule } from './ca-processing-routing.module';
import { CAProcessingComponent } from './ca-processing.component';
import { CAProcessingAddComponent } from './ca-processing-add.component';
import { CaProcessingAddNewComponent } from './ca-processing-add-new.component';
import { SanityCheckSummaryComponent } from './sanity-check-summary.component';
import { CAProcessingOutputComponent } from './ca-processing-output.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CAProcessingRoutingModule,
    SharedModule,
    LoaderModule,
    GrowlModule,
    AccordionModule,
    DataTableModule,
    KeyFilterModule,
    FileUploadModule,
    TableModule,
    MyDatePickerModule,
    DropdownModule,
    MessagesModule,
    TooltipModule,
    OverlayPanelModule,
    TabViewModule,
    ConfirmDialogModule
  ],
  declarations: [
    CAProcessingComponent,
    CAProcessingAddComponent,
    CaProcessingAddNewComponent,
    SanityCheckSummaryComponent,
    CAProcessingOutputComponent
  ],
  providers:[
    ConfirmationService
  ]
})
export class CAProcessingModule { }
