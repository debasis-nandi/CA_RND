import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { HttpService } from '../../core/services/http.service';
import { ApiConfig } from '../../core/config/api-config';
import { AppSession } from '../../core/config/app-session';
import { GlobalConst, DocType, Template } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';
import { IBulkUpload } from '../../core/models/wht.model';

@Component({
    selector: 'app-bulkupload-wht',
    templateUrl: './bulkupload-wht.component.html',
    styleUrls: ['wht.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class BulkUploadWHTComponent implements OnInit {
    
    @Output() valueChange = new EventEmitter();
    
    bulkUploadWhtForm:FormGroup;
    growlLife: number = GlobalConst.growlLife;
    maxUploadedFileSize: number = GlobalConst.maxUploadedFileSize;
    loading: boolean = false;
    userInfo: any;
    comment: string;
    paginator: boolean = false;

    msgs: any[] = [];
    uploadedFiles: any[] = [];
    uploadedRecords:IBulkUpload[] = [];
    successCount: number;
    failedCount: number;
    
    constructor(private fb:FormBuilder, private router: Router, private service: HttpService) {
        this.userInfo = AppSession.getSessionStorage("UserInfo");
    }

    ngOnInit() {
    }

    onClose() {
        this.valueChange.emit(true);
    }

    onSubmit() {
        let uploadFile: any = this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : null;
        if (uploadFile) {
            let formData: FormData = new FormData();
            formData.append('file', uploadFile, uploadFile.name);
            this.loading = true;
            this.service.postFormData(ApiConfig.bulkUploadApi, formData)
                .subscribe(response => {
                    if(response.result){
                        this.successCount = response['success_count'];
                        this.failedCount = response['failed_count'];
                        let resArray: any[] = response['results'].length > 0 ? response['results'] : [];
                        this.uploadedRecords = [];
                        this.uploadedRecords = this.mapResponseData(resArray);
                        //this.paginator = this.uploadedRecords.length > 5 ? true : false;
                        this.valueChange.emit(true);
                    }
                    this.loading = false;
                }, err => {
                    this.showError("Internal Server Error.");
                    this.loading = false;
                });
        }
        
    }

    mapResponseData(responseList: any): IBulkUpload[] {
        let records: IBulkUpload[] = [];
        if (responseList.length > 0) {
            for (let res of responseList) {
                let record: IBulkUpload = {};
                let recordArray: any[] = res['data'].split(',');

                record.taxName = recordArray[0] ? recordArray[0] : '';
                record.country = recordArray[1] ? recordArray[1] : '';
                record.whtType = recordArray[2] ? recordArray[2] : '';
                record.effectiveFrom = recordArray[3] ? recordArray[3] : '';
                record.effectiveTo = recordArray[4] ? recordArray[4] : '';
                record.taxRate = recordArray[5] ? recordArray[5] : '';
                record.reIT = recordArray[6] ? recordArray[6] : '';
                record.status = res['result'];
                record.statusMsg = res['message'];
                records.push(record);
            }
        }
        return records;
    }

    onSelect(event: any) {
        var isValidType: boolean = false;
        var isValidSize: boolean = true;
        for (let file of event.files) {
            isValidType = this.isFileTypeValid(file);
            isValidSize = this.isFileSizeValid(file);

            if (!isValidType) {
                this.showError("You can only upload an csv file.");
            }
            else if (!isValidSize) {
                this.showError("You have uploaded an invalid file size.");
            }
            else {
                this.uploadedFiles = [];
                this.uploadedFiles.push(file);
            }
        }
    }

    onDownload() {
        this.service.getCsv(ApiConfig.templatePath + Template.wht).subscribe(data => {
            AppUtil.downloadFile(data, Template.wht);
        }, error => { console.log(error) });
    }

    onDownloadGuidelines(): void{
        AppUtil.downloadStaticFile(ApiConfig.templatePath, Template.instructionsGuidelines);
    }

    isFileTypeValid(file: any): boolean {
        var isValid: boolean = false;
        if (file) {
            var fileType = this.getFileExtension(file.name).toLowerCase();
            if (fileType == DocType.csv) {
                isValid = true;
            }
        }
        return isValid;
    }

    getFileExtension(filename: string): string {
        return filename.split('.').pop();
    }

    isFileSizeValid(file: any): boolean {
        var isValid: boolean = false;

        if (file) {
            // check for indivisual file size
            if (file.size <= this.maxUploadedFileSize) {
                isValid = true;
            }
            else {
                isValid = false;
            }
        }

        return isValid;
    }

    formatSize(bytes: any): any {
        if (bytes == 0) {
            return '0 B';
        }
        let k = 1000,
            dm = 3,
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    onRemove(event: any, index: any) {
        if (index != -1) {
            // remove file from batch.
            this.uploadedFiles.splice(index, 1);
        }
    }

    isValidRow(rowData: IBulkUpload): boolean {
        return rowData.status;
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
