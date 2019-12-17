import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { FooterOnlyLayoutComponent } from './layout/footer-only-layout/footer-only-layout.component';
import { LoginLayoutComponent } from './layout/login-layout/login-layout.component';

@NgModule({
    imports: [
      RouterModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule
    ],
    declarations: [
      HeaderComponent,
      FooterComponent,
      MainLayoutComponent,
      FooterOnlyLayoutComponent,
      LoginLayoutComponent
    ],
    exports: [
      HeaderComponent,
      FooterComponent,
      MainLayoutComponent,
      FooterOnlyLayoutComponent,
      LoginLayoutComponent
    ],
    entryComponents: [ ]
  })
  export class SharedModule { }