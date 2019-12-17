import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainLayoutComponent } from '../../shared/layout/main-layout/main-layout.component';
import { ManageClientComponent } from './manage-client/manage-client.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { ManageResourceComponent } from './manage-resource/manage-resource.component';

const routes: Routes = [
  {
    path: 'client',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ManageClientComponent }
    ]
  },
  {
    path: 'account',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ManageAccountComponent }
    ]
  },
  {
    path: 'user',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ManageUserComponent }
    ]
  },
  {
    path: 'resource',
    component: MainLayoutComponent,
    children: [
      { path: '', component: ManageResourceComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
