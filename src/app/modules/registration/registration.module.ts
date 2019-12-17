import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GrowlModule } from 'primeng/primeng';

import { RegistrationRoutingModule } from './registration-routing.module';
import { RegistrationComponent } from './registration.component';
import { SharedModule } from '../../shared/shared.module';
import { LoaderModule } from '../../widgets/spinner/spinner.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RegistrationRoutingModule,
    SharedModule,
    LoaderModule,
    GrowlModule
  ],
  declarations: [
    RegistrationComponent
  ],
  providers:[]
})
export class RegistrationModule { }
