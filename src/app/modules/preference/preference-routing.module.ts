import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainLayoutComponent } from '../../shared/layout/main-layout/main-layout.component';
import { ViewPreferenceComponent } from './view-preference.component';
import { AddPreferenceComponent } from './add-preference.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ViewPreferenceComponent }
    ]
  },
  {
    path: 'add-preference',
    component: MainLayoutComponent,
    children: [
      { path: '', component: AddPreferenceComponent }
    ]
  },
  {
    path: 'add-preference/:id',
    component: MainLayoutComponent,
    children: [
      { path: '', component: AddPreferenceComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreferenceRoutingModule { }
