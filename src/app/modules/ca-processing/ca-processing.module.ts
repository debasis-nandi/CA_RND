import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GrowlModule, AccordionModule, KeyFilterModule, FileUploadModule, DropdownModule, MessagesModule, TooltipModule, OverlayPanelModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { MyDatePickerModule } from 'mydatepicker';

import { SharedModule } from '../../shared/shared.module';
import { LoaderModule } from '../../widgets/spinner/spinner.module';
import { DataTableModule } from '../../widgets/datatable/datatable.module';

import { CAProcessingRoutingModule } from './ca-processing-routing.module';
import { CAProcessingComponent } from './ca-processing.component';
import { CAProcessingAddComponent } from './ca-processing-add.component';

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
    OverlayPanelModule
  ],
  declarations: [
    CAProcessingComponent,
    CAProcessingAddComponent
  ],
  providers:[]
})
export class CAProcessingModule { }
