import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DropdownModule, GrowlModule, TreeModule } from 'primeng/primeng';
import { MyDatePickerModule } from 'mydatepicker';
import { ModalModule } from "ngx-modal";

import { SharedModule } from '../../shared/shared.module';
import { LoaderModule } from '../../widgets/spinner/spinner.module';
import { DataTableModule } from '../../widgets/datatable/datatable.module';
import { AdminRoutingModule } from './admin-routing.module';

import { ManageClientComponent } from './manage-client/manage-client.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { ManageResourceComponent } from './manage-resource/manage-resource.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    LoaderModule,
    DataTableModule,
    DropdownModule,
    MyDatePickerModule,
    AdminRoutingModule,
    GrowlModule,
    ModalModule,
    TreeModule
  ],
  declarations: [
    ManageClientComponent,
    ManageAccountComponent,
    ManageUserComponent,
    ManageResourceComponent
  ]
})
export class AdminModule { }
