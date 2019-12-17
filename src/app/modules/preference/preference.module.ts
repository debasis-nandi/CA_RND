import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GrowlModule, AccordionModule, KeyFilterModule, ConfirmDialogModule, ConfirmationService, DropdownModule } from 'primeng/primeng';

import { PreferenceRoutingModule } from './preference-routing.module';
import { ViewPreferenceComponent } from './view-preference.component';
import { AddPreferenceComponent } from './add-preference.component';
import { SharedModule } from '../../shared/shared.module';
import { LoaderModule } from '../../widgets/spinner/spinner.module';
import { DataTableModule } from '../../widgets/datatable/datatable.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PreferenceRoutingModule,
    SharedModule,
    LoaderModule,
    GrowlModule,
    AccordionModule,
    DataTableModule,
    KeyFilterModule,
    ConfirmDialogModule,
    DropdownModule
  ],
  declarations: [
    ViewPreferenceComponent,
    AddPreferenceComponent
  ],
  providers:[
    ConfirmationService
  ]
})
export class PreferenceModule { }
