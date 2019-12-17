import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { ErrorRoutingModule } from './error-routing.module';
import { PageNotFoundComponent } from './page-not-found.component';
import { UnAuthorizedComponent } from './unauthorized.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ErrorRoutingModule
  ],
  declarations: [
      PageNotFoundComponent,
      UnAuthorizedComponent
    ]
})
export class ErrorModule { }
