import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AuthGuardService {

    constructor(private router: Router) { }

    canActivate(): boolean | Promise<boolean> {
        return true;
    }

    redirectToLoginPage() {
        this.router.navigate(['/login']);
    }

}