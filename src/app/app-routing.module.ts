import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const appRoutes: Routes = [
    {
        path: '',
        loadChildren: './modules/login/login.module#LoginModule'
    },
    {
        path: 'login',
        loadChildren: './modules/login/login.module#LoginModule'
    },
    {
        path: 'registration',
        loadChildren: './modules/registration/registration.module#RegistrationModule'
    },
    {
        path: 'dashboard',
        loadChildren: './modules/dashboard/dashboard.module#DashboardModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'preference',
        loadChildren: './modules/preference/preference.module#PreferenceModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'wht',
        loadChildren: './modules/wht/wht.module#WHTModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'ca-processing',
        loadChildren: './modules/ca-processing/ca-processing.module#CAProcessingModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'historical-data',
        loadChildren: './modules/historical-data/historical-data.module#HistoricalDataModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        loadChildren: './modules/admin/admin.module#AdminModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'error',
        loadChildren: './modules/error/error.module#ErrorModule'
    },
    {
        path: '**', 
        redirectTo: 'error', 
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }


