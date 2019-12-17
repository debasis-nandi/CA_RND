import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpService } from './services/http.service';
import { HttpInterceptorService } from './services/api-interceptor.service';
import { AuthGuard } from '../core/guards/auth.guard';

@NgModule({
    imports: [
      CommonModule,
      HttpClientModule
    ],
    declarations: [],
    providers: [
      HttpService,
      AuthGuard,
      { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }
    ],
    exports: []
  })
  export class CoreModule {}
