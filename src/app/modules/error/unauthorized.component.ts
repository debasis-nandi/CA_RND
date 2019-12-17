import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-unauthorized',
    templateUrl: './unauthorized.component.html',
    styleUrls: ['error.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UnAuthorizedComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit() {
    }

    redirectToHome() {
        this.router.navigateByUrl('dashboard');
    }

}
