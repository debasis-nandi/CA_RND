import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GrowlModule, AccordionModule, DropdownModule , MessagesModule} from 'primeng/primeng';
import { MyDatePickerModule } from 'mydatepicker';

import { HistoricalDataRoutingModule } from './historical-data-routing.module';
import { HistoricalDataComponent } from './historical-data.component';
import { SharedModule } from '../../shared/shared.module';
import { LoaderModule } from '../../widgets/spinner/spinner.module';
import { DataTableModule } from '../../widgets/datatable/datatable.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HistoricalDataRoutingModule,
    SharedModule,
    LoaderModule,
    DataTableModule,
    DropdownModule,
    GrowlModule,
    AccordionModule,
    MyDatePickerModule,
    MessagesModule
  ],
  declarations: [
    HistoricalDataComponent
  ]
})
export class HistoricalDataModule { }
