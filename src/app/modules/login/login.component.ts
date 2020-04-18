import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst, Resource } from '../../core/config/app-enum';
import { IUser, IToken } from '../../core/models/authentication.model';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
    
    loginForm:FormGroup;
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    user: IUser;
    token: IToken;

    constructor(private fb:FormBuilder, private router: Router, private service: HttpService) {
    }

    ngOnInit() {
        this.loginForm = this.fb.group({
            email:['', [Validators.required, Validators.email]],
            password:['', [Validators.required]],
            rememberMe:['']
        });
    }

    ngAfterViewInit(){
    }

    ngOnDestroy(){
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.loading = true;
            this.user = { email: this.loginForm.value.email, password: this.loginForm.value.password };
            this.service.post(ApiConfig.getTokenApi, this.user)
                .subscribe(response => {
                    if (response.result == undefined) {
                        this.token = response.token;
                        AppSession.setSessionStorage("token", this.token);
                        this.getUserInfo();
                    }
                    else{
                        this.showError(response.message);
                        this.loading = false;
                    }
                }, err => {
                    console.log(err);
                    this.loading = false;
                });
        }
    }

    getUserInfo(): void {
        this.loading = true;
        let api: any = ApiConfig.getUserInfoApi.replace("{pageName}", Resource.dashboard);
        this.service.get(api)
            .subscribe(response => {
                if (response.result) {
                    AppSession.setSessionStorage("UserInfo", response.user_detail);
                    AppSession.setSessionStorage("UserMenu", response.menu);
                    this.router.navigateByUrl('dashboard');
                    //this.getUserInfoJson();
                }
                else {
                    this.showError(response.message);
                }
                this.loading = false;
            }, err => {
                console.log(err);
                this.loading = false;
            });
    }

    getUserInfoJson(){
        let api: string = 'src/assets/metadata/userinfo.json';
        this.service.getConfig(api).subscribe(response => {
            if (response.result) {
                AppSession.setSessionStorage("UserMenu", response.menu);
                this.router.navigateByUrl('dashboard');
            }
        }, error => {
        });
    }

    onRegistration():void{
        this.router.navigateByUrl('registration');
    }

    showSuccess(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'success', detail: message });
    }

    showError(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', detail: message });
    }
    
}
