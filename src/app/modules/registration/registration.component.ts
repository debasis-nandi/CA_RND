import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst } from '../../core/config/app-enum';
import { IRegistration } from '../../core/models/registration.model';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['registration.component.css']
})
export class RegistrationComponent implements OnInit {
    
    registrationForm:FormGroup;
    loading: boolean = false;
    registration:IRegistration;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;

    constructor(private fb:FormBuilder, private router: Router, private service: HttpService) {
    }

    ngOnInit() {
        this.registrationForm = this.fb.group({
            userName: ['', Validators.required],
            firstName:[''],
            lastName:[''],
            email:['', [Validators.required, Validators.email]],
            password:['', [Validators.required, Validators.minLength(8)]],
            accountName:['']
        });
    }

    onSubmit(): void {
        if (this.registrationForm.valid) {
            this.loading = true;
            this.registration = this.modelMapping(this.registrationForm.value);
            this.service.post(ApiConfig.userRegistrationApi, this.registration)
                .subscribe(response => {
                    let res: any = response;
                    if (res.id) {
                        this.registrationForm.reset();
                        this.showSuccess("User registration done successfully. Please contact the administrator for activation of account.");
                        setTimeout(() => {  
                            this.router.navigateByUrl('login');
                        }, GlobalConst.growlLife);
                    }
                    else{
                        this.showError(res.error);
                    }
                    this.loading = false;
                }, err => {
                    this.showError(err.message);
                    this.loading = false;
                });
        }
    }

    onLogin(): void{
        this.router.navigateByUrl('login');
    }

    showSuccess(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'success', detail: message });
    }

    showError(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', detail: message });
    }

    modelMapping(formValue: any): IRegistration {
        let objReg: IRegistration = {};
        if (formValue) {
            objReg.username = formValue.userName ? formValue.userName : "",
                objReg.first_name = formValue.firstName ? formValue.firstName : "",
                objReg.last_name = formValue.lastName ? formValue.lastName : "",
                objReg.email = formValue.email ? formValue.email : "",
                objReg.password = formValue.password ? formValue.password : "",
                objReg.account_keyword = formValue.accountName ? formValue.accountName : null,
                objReg.account = null,
                objReg.active = true,
                objReg.staff = false,
                objReg.admin = false
        }
        return objReg;
    }

}
