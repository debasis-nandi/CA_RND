import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { IWht } from '../../core/models/wht.model';

@Component({
    selector: 'app-add-wht',
    templateUrl: './add-wht.component.html',
    styleUrls: ['wht.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AddWHTComponent implements OnInit {
    
    @Output() valueChange = new EventEmitter();
    
    addWhtForm:FormGroup;
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    
    userInfo: any;
    postWht: IWht = {};

    countryOption: any[] = [];
    whtTypeOption: any[] = [];
    scheduleNameOption: any[] = [];

    myFromDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false };
    myToDateFormat: IMyDpOptions = { dateFormat: 'mm-dd-yyyy', editableDateField: false };

    isExistingTaxScheduleName: boolean = false;

    constructor(private fb:FormBuilder, private router: Router, private service: HttpService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
        this.getCountryOption();
        this.getWhtTypeOption();
        this.getTaxScheduleNameOption();
        this.addWhtForm = this.fb.group({
            txtScheduleName: ['', Validators.required],
            country: ['', [Validators.required]],
            effectiveFrom: ['', [Validators.required]],
            effectiveTo: [''],
            taxRate: ['', [Validators.required, Validators.pattern(/^(100(?:\.0000?)?|\d?\d(?:\.\d{1,4}?)?)$/)]],
            whtType: ['', Validators.required],
            reit: ['false']
        });
    }

    onSubmit() {
        if (this.addWhtForm.valid) {
            let error: number = 0;
            let scheduleName: string = this.addWhtForm.controls['txtScheduleName'].value;
            let whtType: any = this.addWhtForm.controls['whtType'].value;
            let isValidScheduleName: boolean = (whtType == 'custom' && scheduleName.trim().toLowerCase() == 'standard') ? false : true;
            if (!isValidScheduleName) {
                error++;
                this.showError('Invalid schedule name.');
            }

            if (error == 0) {
                this.loading = true;
                this.postWht = this.modelMapping(this.addWhtForm.value);
                this.service.post(ApiConfig.createWhtApi, this.postWht)
                    .subscribe(res => {
                        if (res.result) {
                            this.showSuccess(res.message);
                            setTimeout(() => {
                                this.valueChange.emit(true);
                            }, GlobalConst.growlLife);
                        }
                        else {
                            this.showError(res.message);
                        }
                        this.loading = false;
                    }, err => {
                        this.showError("Internal server error.");
                        this.loading = false;
                    });
            }
        }
    }

    onDateChanged(event: IMyDateModel) {
        // event properties are: event.date, event.jsdate, event.formatted and event.epoc
        this.addWhtForm.controls['effectiveTo'].setValue('');
        let toDate: Date = new Date(AppUtil.getFormattedDate(event,''));
        toDate.setDate(toDate.getDate() - 1);
        this.myToDateFormat = {
            dateFormat: 'mm-dd-yyyy',
            disableUntil: { year: toDate.getFullYear(), month: toDate.getMonth() + 1, day: toDate.getDate() }
        };
    }

    getCountryOption() {
        this.loading = true;
        this.service.get(ApiConfig.getGetCountryOptionApi).subscribe(res => {
            if (res.result) {
                let countryList: any[] = res.CustomList ? res.CustomList : [];
                this.countryOption = countryList.map(x => {
                    return { value: x.id, label: x.name };
                });
            }
            this.loading = false;
        }, error => { this.loading = false });
    }

    getWhtTypeOption() {
        this.whtTypeOption = [
            { value: 'custom', label: 'Custom' },
            { value: 'standard', label: 'Standard' }
        ];
    }

    modelMapping(formValue: any): IWht {
        let objReg: IWht = {};
        objReg.taxdetail = {};
        if(formValue){
            objReg.taxname = formValue.txtScheduleName ? formValue.txtScheduleName : '';
            objReg.country = formValue.country ? formValue.country : '';
            objReg.createdby = this.userInfo.username;
            objReg.user = this.userInfo.userid;
            objReg.WHTType = formValue.whtType ? formValue.whtType : '';
            objReg.taxdetail.tax = null;
            objReg.taxdetail.effectiveFromDate = formValue.effectiveFrom ? AppUtil.getFormattedDate(formValue.effectiveFrom,'')  : '';
            objReg.taxdetail.effectiveToDate = formValue.effectiveTo ? AppUtil.getFormattedDate(formValue.effectiveTo,'') : '';
            objReg.taxdetail.taxRate = formValue.taxRate ? formValue.taxRate : null;
            objReg.taxdetail.reit = formValue.reit == 'true' ? 1 : 0;
            objReg.taxdetail.is_active = 0;
            objReg.taxdetail.createdby = this.userInfo.username;
        }
        return objReg;
    }

    onSwitchScheduleName(checked: any): void{
        this.addWhtForm.controls['txtScheduleName'].setValue("");
        this.isExistingTaxScheduleName = checked;
    }

    getTaxScheduleNameOption(){
        this.service.get(ApiConfig.getTaxScheduleNameApi).subscribe(res=>{
            let taxNameList: any[] = res.result ? res.TaxList : [];
            this.scheduleNameOption = taxNameList.map(x => {
                return { value: x.taxname, label: x.taxname };
            });
        }, error=>{console.log(error)});
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
