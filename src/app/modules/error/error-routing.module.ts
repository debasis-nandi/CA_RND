import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FooterOnlyLayoutComponent } from '../../shared/layout/footer-only-layout/footer-only-layout.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { UnAuthorizedComponent } from './unauthorized.component';

const routes: Routes = [
  {
    path: '',
    component: FooterOnlyLayoutComponent,
    children: [
      { path: '', component: PageNotFoundComponent },
      { path: 'unauthorized', component: UnAuthorizedComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorRoutingModule { }
