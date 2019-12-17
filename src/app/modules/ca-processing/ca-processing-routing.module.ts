import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainLayoutComponent } from '../../shared/layout/main-layout/main-layout.component';
import { CAProcessingComponent } from './ca-processing.component';
import { CAProcessingAddComponent } from './ca-processing-add.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: CAProcessingComponent }
    ]
  },
  {
    path: 'ca-processing-add',
    component: MainLayoutComponent,
    children: [
      { path: '', component: CAProcessingAddComponent }
    ]
  },
  {
    path: 'ca-processing-add/:id',
    component: MainLayoutComponent,
    children: [
      { path: '', component: CAProcessingAddComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CAProcessingRoutingModule { }
