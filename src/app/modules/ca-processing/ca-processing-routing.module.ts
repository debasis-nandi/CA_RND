import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainLayoutComponent } from '../../shared/layout/main-layout/main-layout.component';
import { CAProcessingComponent } from './ca-processing.component';
//import { CAProcessingAddComponent } from './ca-processing-add.component';
import { CaProcessingAddNewComponent } from './ca-processing-add-new.component';
import { SanityCheckSummaryComponent } from './sanity-check-summary.component';
import { CAProcessingOutputComponent } from './ca-processing-output.component';

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
      { path: '', component: CaProcessingAddNewComponent }
    ]
  },
  {
    path: 'ca-processing-add/:id',
    component: MainLayoutComponent,
    children: [
      { path: '', component: CaProcessingAddNewComponent }
    ]
  },
  {
    path: 'ca-processing-add/:id/:action',
    component: MainLayoutComponent,
    children: [
      { path: '', component: CaProcessingAddNewComponent }
    ]
  },
  {
    path: 'sanity-check-summary',
    component: MainLayoutComponent,
    children: [
      { path: '', component: SanityCheckSummaryComponent }
    ]
  },
  {
    path: 'sanity-check-summary/:commonId',
    component: MainLayoutComponent,
    children: [
      { path: '', component: SanityCheckSummaryComponent }
    ]
  },
  {
    path: 'ca-processing-output/:requestId',
    component: MainLayoutComponent,
    children: [
      { path: '', component: CAProcessingOutputComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CAProcessingRoutingModule { }
