import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

import { SpinnerComponent } from './spinner.component';

@NgModule({
    imports:[
        CommonModule,
        FormsModule,
        Ng4LoadingSpinnerModule.forRoot()
    ],
    declarations:[
        SpinnerComponent
    ],
    providers:[
    ],
    exports: [
        SpinnerComponent
    ]
})

export class LoaderModule { }