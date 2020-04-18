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
    @Input() loaderType: string = 'default';
    template: string =`<img src="http://pa1.narvii.com/5722/2c617cd9674417d272084884b61e4bb7dd5f0b15_hq.gif" />`;

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