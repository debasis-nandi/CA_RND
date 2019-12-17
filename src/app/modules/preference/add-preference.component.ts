import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm, FormArray, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';

import { ConfirmationService } from 'primeng/primeng';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst } from '../../core/config/app-enum';
import { IPreference } from '../../core/models/preferences.model';

@Component({
    selector: 'app-add-preference',
    templateUrl: './add-preference.component.html',
    styleUrls: ['preference.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AddPreferenceComponent implements OnInit, AfterViewInit {
    
    addPreferenceForm:FormGroup;
    loading: boolean = false;
    msgs: any[] = [];
    growlLife: number = GlobalConst.growlLife;
    userInfo: any;

    countryOption: any[] = [];
    customOption: any[] = [];
    payDateOption: any[] = [];
    calculationMethodologyOption: any[] = [];
    indexTypeOption: any[] = [];
    saveAsOption: any[] = [];

    isDisabled: boolean = false;
    isDisabledEmail : boolean = false;
    userId: any;
    preference: IPreference = {};

    isCustom: boolean = false;
    //isFlat: boolean = false;

    constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private service: HttpService, private confirmationService: ConfirmationService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
        //console.log(this.userInfo);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id: any = params['id'] || null;
            this.isDisabled = id ? true : false;
            if (id){
                this.getPreference(id);
            }   
        });

        //this.getCountryOption();
        this.getCustomOption();
        this.getpayDateOption();
        this.getCalculationMethodology();
        this.getIndexType();
        this.getSaveAs();

        this.isDisabledEmail = this.isDisabled ? this.isDisabled : true;
        this.addPreferenceForm = this.fb.group({
            preferenceName: [{value: '', disabled: this.isDisabled},[Validators.required]],
            payDate: this.createFormGroup(this.payDateOption),
            calculationMethodology: this.createFormGroup(this.calculationMethodologyOption),
            indexType: this.createFormGroup(this.indexTypeOption),
            withHoldingTax:[{value: '', disabled: this.isDisabled}],
            customValue:[{value: '', disabled: this.isDisabled}],
            //flatValue:[''],
            //country:[{value: '', disabled: this.isDisabled}],
            emailAlerts:[{value: 'false', disabled: this.isDisabled}],
            email:[{value: this.userInfo['emailid'], disabled: this.isDisabledEmail}],
            saveAs: this.createFormGroup(this.saveAsOption)
        });

        this.formControlValueChanged();
    }

    ngAfterViewInit() {
    }

    getPreference(id: any) {
        this.loading = true;
        this.service.get(ApiConfig.getPreferenceOnIdApi.replace("{Id}", id)).subscribe(res => {
            this.setFormValue(res);
            this.loading = false;
        }, error => {
            console.log(error);
            this.loading = false;
        });
    }

    onSave(): void {
        console.log(this.addPreferenceForm.value);
        if(this.addPreferenceForm.invalid){
            this.getErrors(this.addPreferenceForm);
            return;
        }

        let error: number = 0;
        let postData: IPreference = this.postDataMapping(this.addPreferenceForm.value);

        if (!postData.caltype) {
            error++;
            this.showError("Atleast one calculation methodology required.");
        }
        else if (!postData.indextype) {
            error++;
            this.showError("Atleast one index type required.");
        }
        else if (!postData.whttype) {
            error++;
            this.showError("A tax rate schedule is required. Please select one.");
        }
        /*else if (!postData.country) {
            error++;
            this.showError("Select country name.");
        }*/
        /*else if (!postData.saveas) {
            error++;
            this.showError("typeAtleast one output file format type is required.");
        }*/

        if (error == 0) {
            let isPayDate: boolean = (postData.pay_date_japan == 0 && postData.pay_date_korea == 0) ? false : true;
            if (isPayDate) {
                this.postData(postData);
            }
            else {
                this.confirmationService.confirm({
                    message: 'Japanese and South Korean dividends would be adjusted on Ex-Date. Do you wish to proceed?',
                    accept: () => {
                        this.postData(postData);
                    }
                });
            }
        }

    }

    postData(postData: any): void {
        this.loading = true;
        this.service.post(ApiConfig.preferencesApi, postData).subscribe(res => {
            if (res.id) {
                this.addPreferenceForm.reset();
                this.showSuccess("Preference created successfully.");
                setTimeout(() => {
                    this.router.navigateByUrl('preference');
                }, GlobalConst.growlLife);
            }
            else {
                this.showError(res.detail);
            }
            this.loading = false;
        }, error => {
            this.loading = false;
            this.showError("Internal server error");
        });
    }

    commaSepEmail = (control: AbstractControl): { [key: string]: any } | null => {
        const emails = control.value.split(',');
        const forbidden = emails.some(email => Validators.email(new FormControl(email)));
        console.log(forbidden);
        return forbidden ? { 'email': { value: control.value } } : null;
    };

    formControlValueChanged(): void {

        // set email address based on email alert
        let email = this.addPreferenceForm.get('email');
        this.addPreferenceForm.get('emailAlerts').valueChanges.subscribe(checked => {
            if (checked == 'true') {
                email.enable();
                email.setValue(this.userInfo['emailid']);
                email.setValidators([Validators.required, this.commaSepEmail]);
                email.markAsDirty();
            }
            else {
                email.disable();
                email.setValue(this.userInfo['emailid']);
                email.clearValidators();
            }
            email.updateValueAndValidity();
        });

        // select value based on withHoldingTax 
        let customValue = this.addPreferenceForm.get('customValue');
        //let flatValue = this.addPreferenceForm.get('flatValue');
        this.addPreferenceForm.get('withHoldingTax').valueChanges.subscribe(mode => {
            customValue.clearValidators();
            customValue.setValue("");
            //flatValue.clearValidators()
            //flatValue.setValue("");
            this.isCustom = false;
            //this.isFlat = false;
            
            if (mode == 'custom') {
                this.isCustom = true;
                customValue.setValidators([Validators.required]);
                customValue.markAsDirty();
            }
            /*if(mode == 'flat'){
                this.isFlat = true;
                flatValue.setValidators([Validators.required]);
                flatValue.markAsDirty();
            }*/

            customValue.updateValueAndValidity();
            //flatValue.updateValueAndValidity();
        });
    }

    onIndexTypeChange(event: any, ctrlName: any): void {
        let values: any  = this.addPreferenceForm.controls['indexType'].value;
        if (event.target.checked && ctrlName == 'all') {
            let updatedValue: any = { all : true, gtr: true, ntr: true, pr: true };
            this.addPreferenceForm.controls['indexType'].setValue(updatedValue);
        }
        else if(!event.target.checked && ctrlName == 'all'){
            let updatedValue: any = { all : false, gtr: false, ntr: false, pr: false };
            this.addPreferenceForm.controls['indexType'].setValue(updatedValue);
        }
        else{
            let updatedValue: any = {  
                all : values['gtr'] && values['ntr'] && values['pr'] ? true : false,
                gtr: values['gtr'], ntr: values['ntr'], pr: values['pr']
            };
            this.addPreferenceForm.controls['indexType'].setValue(updatedValue);
        }
    }

    onCalculationMethodologyChange(event: any, ctrlName: any): void {
        let values: any  = this.addPreferenceForm.controls['calculationMethodology'].value;
        if (event.target.checked && ctrlName == 'all') {
            let updatedValue: any = { all : true, stockBase: true, divisorBase: true, accuCash: true };
            this.addPreferenceForm.controls['calculationMethodology'].setValue(updatedValue);
        }
        else if(!event.target.checked && ctrlName == 'all'){
            let updatedValue: any = { all : false, stockBase: false, divisorBase: false, accuCash: false };
            this.addPreferenceForm.controls['calculationMethodology'].setValue(updatedValue);
        }
        else{
            let updatedValue: any = {  
                all : values['stockBase'] && values['divisorBase'] && values['accuCash'] ? true : false,
                stockBase: values['stockBase'], divisorBase: values['divisorBase'], accuCash: values['accuCash']
            };
            this.addPreferenceForm.controls['calculationMethodology'].setValue(updatedValue);
        }
    }

    onPayDateChange(event: any, ctrlName: any): void {
        let values: any  = this.addPreferenceForm.controls['payDate'].value;
        if (event.target.checked && ctrlName == 'all') {
            let updatedValue: any = { all : true, japan: true, korea: true };
            this.addPreferenceForm.controls['payDate'].setValue(updatedValue);
        }
        else if(!event.target.checked && ctrlName == 'all'){
            let updatedValue: any = { all : false, japan: false, korea: false };
            this.addPreferenceForm.controls['payDate'].setValue(updatedValue);
        }
        else{
            let updatedValue: any = {  
                all : values['japan'] && values['korea'] ? true : false,
                japan: values['japan'], korea: values['korea']
            };
            this.addPreferenceForm.controls['payDate'].setValue(updatedValue);
        }
    }

    createFormGroup(items: any[]): FormGroup {
        let formGroup: FormGroup = new FormGroup({});
        for (let item of items) {
            let control: FormControl = new FormControl({value: item.value, disabled: this.isDisabled});
            formGroup.addControl(item.name, control);
        }
        return formGroup;
    }

    multipleCheckboxRequireOne(fa: FormArray) {
        let valid = false;
        for (let x = 0; x < fa.length; ++x) {
            if (fa.at(x).value) {
                valid = true;
                break;
            }
        }
        return valid ? null : {
            multipleCheckboxRequireOne: true
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

    getCustomOption() {
        this.loading = true;
        this.service.get(ApiConfig.getGetCustomOptionApi).subscribe(res => {
            if (res.result) {
                let customList: any[] = res.CustomList ? res.CustomList : [];
                /*this.customOption = customList.map(x => {
                    return { value: x.taxname, label: x.taxname };
                });*/
                let options: any[] = [];
                options.push({value:'', label:'Select'});
                customList.forEach(x=>{
                    options.push({ value: x.taxname, label:x.taxname});
                });
                this.customOption = options;
            }
            this.loading = false;
        }, error => { this.loading = false });
    }

    getpayDateOption() {
        this.payDateOption = [
            { name: 'japan', value: false, label: 'Japan', colspan: "1" },
            { name: 'korea', value: false, label: 'South Korea', colspan: "1" },
            { name: 'all', value: false, label: 'ALL', colspan: "2" }
        ];
    }
    
    getCalculationMethodology() {
        this.calculationMethodologyOption = [
            { name: 'stockBase', value: false, label: 'Stock Base', colspan: "1" },
            { name: 'divisorBase', value: false, label: 'Divisor Base', colspan: "1" },
            { name: 'accuCash', value: false, label: 'Accu Cash', colspan: "1" },
            { name: 'all', value: false, label: 'ALL', colspan: "1" }
        ];
    }
    
    getIndexType() {
        this.indexTypeOption = [
            { name: 'pr', value: false, label: 'PR (Price Return)', colspan: "1" },
            { name: 'ntr', value: false, label: 'NTR (Net Total Return)', colspan: "1" },
            { name: 'gtr', value: false, label: 'GTR (Gross Total Return)', colspan: "1" },
            { name: 'all', value: false, label: 'ALL', colspan: "1" }
        ];
    }
    
    getSaveAs() {
        /*this.saveAsOption = [
            { name: 'csv', value: true, label: 'CSV', colspan: "1" },
            //{ name: 'xml', value: false, label: 'XML', colspan: "1" },
            //{ name: 'pdf', value: false, label: 'PDF', colspan: "1" },
            //{ name: 'xls', value: false, label: 'XLS', colspan: "1" },
            { name: 'json', value: false, label: 'JSON', colspan: "3" }
        ];*/
        this.saveAsOption = [
            { name: 'fileType', value: 'CSV', label: 'CSV', colspan: "1" },
            { name: 'fileType', value: 'JSON', label: 'JSON', colspan: "3" }
        ];
    }

    showSuccess(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'success', detail: message });
    }

    showError(message: string) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', detail: message });
    }

    postDataMapping(formData: any): IPreference {
        let model: IPreference = {};
        model.profileName = formData.preferenceName ? formData.preferenceName : '';
        model.caltype = this.mapCaltype(formData.calculationMethodology);
        model.indextype = this.mapIndexType(formData.indexType);
        model.whttype = formData.withHoldingTax ? formData.withHoldingTax : null;
        model.pay_date_japan = formData.payDate.japan ? 1 : 0;
        model.pay_date_korea = formData.payDate.korea ? 1 : 0;
        model.countryTaxRate = formData.withHoldingTax == "custom" ? formData.customValue : "";
        //model.flatrate = formData.withHoldingTax == "flat" ? formData.flatValue : 0;
        //model.country = formData.country ? formData.country : null;
        model.emailalert = formData.emailAlerts == 'true' ? formData.email : '';
        //model.saveas = this.mapSaveAs(formData.saveAs);
        model.saveas = formData.saveAs['fileType'];
        model.user = this.userInfo.userid;
        model.createdby = this.userInfo.username;
        model.createddate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
        return model;
    }

    mapCaltype(calculationMethodology : any): string{
        let res: string ="";
        if (calculationMethodology.all) {
            res += "Stock Base,Divisor Base,Accu Cash";
        }
        else{
            res += calculationMethodology.stockBase ? "Stock Base," : "";
            res += calculationMethodology.divisorBase ? "Divisor Base," : "";
            res += calculationMethodology.accuCash ? "Accu Cash," : "";
        }
        return res.replace(/,\s*$/, "");
    }

    mapIndexType(indexType: any): string {
        let res: string = "";
        if (indexType.all) {
            res += "GTR,PR,NTR";
        }
        else {
            //res += indexType.all ? "ALL," : "";
            res += indexType.gtr ? "GTR," : "";
            res += indexType.pr ? "PR," : "";
            res += indexType.ntr ? "NTR," : "";
        }
        return res.replace(/,\s*$/, "");
    }

    mapSaveAs(saveAs: any): string{
        let res: string ="";
        res += saveAs.csv ? "CSV," : "";
        //res += saveAs.pdf ? "PDF," : "";
        //res += saveAs.xls ? "XLS," : "";
        //res += saveAs.xml ? "XML," : "";
        res += saveAs.json ? "JSON," : "";
        return res.replace(/,\s*$/, "");
    }

    getErrors(form: any) {
        let controls: any[] = [];
        controls = Object.keys(form.controls);
        for (let key of controls) {
            let control = form.controls[key];
            if (control.errors) {
                control.markAsTouched({ onlySelf: true });
            }
        }
    }

    setFormValue(formData: any) {
        let emailAlert: boolean = false;
        if (formData['emailalert'] != '') {
            let emailList: any[] = formData['emailalert'].split(',');
            if (emailList.length > 0) {
                emailAlert = (emailList.length == 1 && emailList[0] == this.userInfo['emailid']) ? false : true;
            }
        }
        
        this.addPreferenceForm.patchValue({
            preferenceName:formData['profileName'],
            payDate: {
                japan: formData['pay_date_japan'] == 1 ? true : false,
                korea: formData['pay_date_korea'] == 1 ? true : false,
                all: formData['pay_date_japan'] == 1 && formData['pay_date_korea'] == 1 ? true : false
            },
            calculationMethodology: {
                stockBase: (formData['caltype'].indexOf("Stock Base") > -1) ? true : false,
                divisorBase: (formData['caltype'].indexOf("Divisor Base") > -1) ? true : false,
                accuCash: (formData['caltype'].indexOf("Accu Cash") > -1) ? true : false,
                all: (formData['caltype'].indexOf("Stock Base") > -1 && formData['caltype'].indexOf("Divisor Base") > -1 && formData['caltype'].indexOf("Accu Cash") > -1)  ? true : false
            },
            indexType: {
                pr: (formData['indextype'].indexOf("PR") > -1) ? true : false,
                ntr: (formData['indextype'].indexOf("NTR") > -1) ? true : false,
                gtr: (formData['indextype'].indexOf("GTR") > -1) ? true : false,
                all: (formData['indextype'].indexOf("PR") > -1 && formData['indextype'].indexOf("NTR") > -1 && formData['indextype'].indexOf("GTR") > -1)  ? true : false
            },
            saveAs: {
                /*csv: (formData['saveas'].indexOf("CSV") > -1) ? true : false,
                //xml: (formData['saveas'].indexOf("PDF") > -1) ? true : false,
                //pdf: (formData['saveas'].indexOf("XLS") > -1) ? true : false,
                //xls: (formData['saveas'].indexOf("XML") > -1) ? true : false,
                json: (formData['saveas'].indexOf("JSON") > -1) ? true : false*/
                fileType: formData['saveas'] ? formData['saveas'][0] : ''
            },
            withHoldingTax: formData['whttype'],
            customValue: formData['countryTaxRate'],
            //country: formData['country'] ? formData['country'] : '',
            emailAlerts: emailAlert ? "true" : "false",
            email: formData['emailalert'],
            comment: formData['comment']
        });
    }

}
