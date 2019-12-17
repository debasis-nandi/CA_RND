
export class AppUtil {
    
    public static getDate(selectedDate: any, format: any): string {
        let strDate: string = '';
        if (selectedDate) {
            var _date = new Date(selectedDate);
            var dd = _date.getDate();
            var mm = _date.getMonth() + 1; //because January is 0! 
            var yyyy = _date.getFullYear();

            var year = yyyy;
            var month = (mm < 10) ? '0' + mm.toString() : mm;
            var day = (dd < 10) ? '0' + dd.toString() : dd;
            if (format == 'mm-dd-yyyy')
                strDate = month.toString() + '-' + day.toString() + '-' + year.toString();
            else if (format == 'dd-mm-yyyy')
                strDate = day.toString() + '-' + month.toString() + '-' + year.toString();
            else
                strDate = year.toString() + '-' + month.toString() + '-' + day.toString();
        }
        return strDate;
    }

    public static getFormattedDate(selectedDate: any, format: string, isDefaultTime: boolean = true): string {
        let strDate: string = '';
        if (selectedDate) {
            var _date = selectedDate.date;
            var year = _date.year;
            var month = _date.month;
            var day = _date.day;
            if (month < 10) {
                month = `0${month}`;
            }
            if (day < 10) {
                day = `0${day}`;
            }
            if (format === 'mm-dd-yyyy')
                strDate = month.toString() + '-' + day.toString() + '-' + year.toString();
            else
                strDate = year.toString() + '-' + month.toString() + '-' + day.toString();
        }
        
        //return strDate + " 00:00:00";
        return isDefaultTime ? strDate + " 00:00:00" : strDate;
    }

    public static setDate(dt: any): any {
        let getdate = null;
        if (dt) {
            let date = new Date(dt);
            getdate = {
                date: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate()
                },
                formatted: dt
            };
        }
        return getdate;
    }

    public static convert_DD_MM_YYYY_2Date(date: any): any{
        let dt:any = null;
        if(date){
            let dtArray:any[] = date.split('-');
            dt = dtArray[2] + '-' + dtArray[1] + '-' + dtArray[0];
        }
        return dt;
    }

    public static checkDateFormat(input: any, formatType: any): boolean {
        let isValid: boolean = false;
        let pattern: any;

        if (formatType == 'dd-mm-yyyy') {
            pattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        }
        if (formatType == 'yyyy-mm-dd') {
            pattern = /(\d{4})-(\d{2})-(\d{2})/;
        }
        if (formatType == 'mm-dd-yyyy') {
            pattern = /^((0|1)\d{1})-((0|1|2)\d{1})-((19|20)\d{2})/g;
        }
        if (formatType == 'mm/dd/yyyy') {
            pattern = /^([0-9]{2}[-/][0-9]{2}[-/][0-9]{4})|([0-9]{8})/;
        }
        if (formatType == 'mmddyyyy') {
            //pattern = /^([0-9]{2}[-/][0-9]{2}[-/][0-9]{4})|([0-9]{8})/; // pattern for mm/dd/yyyy
            //pattern = /^((0|1)\d{1})-((0|1|2)\d{1})-((19|20)\d{2})/g; // pattern for mm-dd-yyyy
            
            // pattern for mm/dd/yyyy, mm-dd-yyyy, m/d/yyyy, m-d-yyyy  
            pattern = /^([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{4})|([0-9]{8})/; 
        }

        isValid = pattern.test(input);
        return isValid;
    }

    public static downloadFile(data: any, fileName: any) {
        //const blob = new Blob([data], { type: "text/csv" });
        let blob : any;
        let fileType: string = fileName.split('.').pop();
        if (fileType.toLowerCase() == 'json')
            blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        else if (fileType.toLowerCase() == 'pdf')
            blob = new Blob([data], { type: "application/pdf" });
        else
            blob = new Blob([data], { type: "text/csv" });
            
        if (window.navigator.msSaveOrOpenBlob) //IE & Edge
        {
            //msSaveBlob only available for IE & Edge
            window.navigator.msSaveBlob(blob, fileName);
        }
        else //Chrome & FF
        {
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor); //For FF
            anchor.click();
            //It's better to remove the elem
            document.body.removeChild(anchor);
        }
    }

    public static ConvertToCSV(objArray, headerList) {
        let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        let str = '';
        let row = '';
        for (let index in headerList) {
            row += headerList[index] + ',';
        }
        row = row.slice(0, -1);
        str += row + '\r\n';
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in headerList) {
                let head = headerList[index];
                if (line != '') line += ',';
                line += array[i][head];
            }
            str += line + '\r\n';
        }
        return str;
    }
    
    public static downloadStaticFile(basePath: any, fileName: any){
        let filePath: any = basePath + fileName;
        const link = document.createElement('a');
        //link.setAttribute('target', '_blank');
        link.setAttribute('href', filePath);
        //ink.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

}