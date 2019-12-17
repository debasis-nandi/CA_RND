import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
    selector: 'my-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['spinner.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SpinnerComponent implements OnInit {

    @Input() loading: boolean = false;

    constructor(private spinner: Ng4LoadingSpinnerService){
    }

    ngOnInit() {
    }

    ngOnChanges(){
        if(this.loading){
            this.spinner.show();
        }
        else{
            this.spinner.hide();
        }
    }
    
}