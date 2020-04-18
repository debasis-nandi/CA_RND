import { ISanityItems, ISanityGroupItem, IResponse, ISanityErrors } from '../../core/models/ca-processing-add-new.model';
import { EventType, SanityGroup, SanityFields } from '../../core/config/app-enum';
import { AppUtil } from '../../core/config/app-util';

export class Sanity{
    
    public static onLevel1Sanity(response: IResponse[], level1MasterSanity: ISanityItems[]): any[] {
        let sanityErrors: any[] = [];
        if (response && response.length > 0) {
            for (let item of response) {
                let objArray: any[] = this.getSanity(item, response, level1MasterSanity);
                if (objArray.length > 0) {
                    objArray.forEach(item => {
                        let isExist: boolean = sanityErrors.filter(x=>x.reqDetailId == item.reqDetailId && x.sanityId == item.sanityId).length > 0 ? true : false;
                        if(!isExist){
                            sanityErrors.push(item);
                        }
                    });
                }
            }
        }
        return sanityErrors;
    }

    // get sanity id from master sanity list based on sanity group and field.
    public static getSanityId(fieldName: string, groupName: string, sanityList: ISanityItems[]): number{
        let sanityId: any;
        let sanityGroup: ISanityGroupItem[] = sanityList.filter(x=>x.groupName == groupName).length > 0 ? sanityList.filter(x=>x.groupName == groupName)[0].groupItems : [];
        if(sanityGroup.length > 0){
            sanityId = sanityGroup.filter(x=>x.name.toLowerCase() == fieldName.toLowerCase()).length > 0 ? sanityGroup.filter(x=>x.name.toLowerCase() == fieldName.toLowerCase())[0].id : 0;
        }
        return sanityId;
    }

    public static getSanity(rowData:IResponse, records: IResponse[], level1SanityItems: ISanityItems[]): any{
        let sanityList: any[] = [];
        if (!rowData.source.trim()) {
            let sanityId: any = this.getSanityId(SanityFields.source, SanityGroup.mandatory, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }
        if (!rowData.eventType.trim()) {
            let sanityId: any = this.getSanityId(SanityFields.eventType, SanityGroup.mandatory, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }
        if(rowData.eventType.toLowerCase() == EventType.cashDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.rightsIssue.toLowerCase() || rowData.eventType.toLowerCase() == EventType.specialCashDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.spinOff.toLowerCase() || rowData.eventType.toLowerCase() == EventType.stockDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.stockSplit.toLowerCase()){
            if (!rowData.identifier){
                let sanityId: any = this.getSanityId(SanityFields.identifier, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if(!rowData.exdate){
                let sanityId: any = this.getSanityId(SanityFields.exdate, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.eventType){
                let sanityId: any = this.getSanityId(SanityFields.eventType, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.eventCurrency){
                let sanityId: any = this.getSanityId(SanityFields.eventCurrency, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.priceCurrency){
                let sanityId: any = this.getSanityId(SanityFields.priceCurrency, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            } 
        }

        if(rowData.eventType.toLowerCase() == EventType.cashDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.specialCashDividend.toLowerCase()){
            if (!rowData.eventamount){
                let sanityId: any = this.getSanityId(SanityFields.eventamount, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.priceExT1){
                let sanityId: any = this.getSanityId(SanityFields.priceExT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }   
            if (!rowData.fxexT1){
                let sanityId: any = this.getSanityId(SanityFields.fxexT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.payDatePriceT1){
                let sanityId: any = this.getSanityId(SanityFields.payDatePriceT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.payDateFxT1){
                let sanityId: any = this.getSanityId(SanityFields.payDateFxT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.frankingPercent){
                let sanityId: any = this.getSanityId(SanityFields.frankingPercent, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.incomePercent){
                let sanityId: any = this.getSanityId(SanityFields.incomePercent, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.reit){
                let sanityId: any = this.getSanityId(SanityFields.reit, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
        }

        if(rowData.eventType.toLowerCase() == EventType.stockDividend.toLowerCase() || rowData.eventType.toLowerCase() == EventType.rightsIssue.toLowerCase()){
            if (!rowData.termoldshares){
                let sanityId: any = this.getSanityId(SanityFields.termoldshares, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.termnewshares){
                let sanityId: any = this.getSanityId(SanityFields.termnewshares, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.priceExT1){
                let sanityId: any = this.getSanityId(SanityFields.priceExT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.fxexT1){
                let sanityId: any = this.getSanityId(SanityFields.fxexT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.reit){
                let sanityId: any = this.getSanityId(SanityFields.reit, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.offerprice && rowData.eventType.toLowerCase() == EventType.rightsIssue.toLowerCase()){
                let sanityId: any = this.getSanityId(SanityFields.offerprice, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
        }
        
        if(rowData.eventType.toLowerCase() == EventType.spinOff.toLowerCase()){
            if (!rowData.offerprice){
                let sanityId: any = this.getSanityId(SanityFields.offerprice, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.termoldshares){
                let sanityId: any = this.getSanityId(SanityFields.termoldshares, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.termnewshares){
                let sanityId: any = this.getSanityId(SanityFields.termnewshares, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.spunoffcash){
                let sanityId: any = this.getSanityId(SanityFields.spunoffcash, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.spunoffstock){
                let sanityId: any = this.getSanityId(SanityFields.spunoffstock, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.fxexT1){
                let sanityId: any = this.getSanityId(SanityFields.fxexT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.priceExT1){
                let sanityId: any = this.getSanityId(SanityFields.priceExT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
        }
        
        if(rowData.eventType.toLowerCase() == EventType.stockSplit.toLowerCase()){
            if (!rowData.termoldshares){
                let sanityId: any = this.getSanityId(SanityFields.termoldshares, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.termnewshares){
                let sanityId: any = this.getSanityId(SanityFields.termnewshares, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.fxexT1){
                let sanityId: any = this.getSanityId(SanityFields.fxexT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
            if (!rowData.priceExT1){
                let sanityId: any = this.getSanityId(SanityFields.priceExT1, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
            }
        }
        
        // check (pay date) mandatory when country is Japan(JP)
        if(rowData.country && rowData.country.toLowerCase() == 'jp'){
             if(!rowData.paydate){
                let sanityId: any = this.getSanityId(SanityFields.paydate, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
             }
        }
        // check (pay date) mandatory when country is South Korea(KR) 
        if(rowData.country && rowData.country.toLowerCase() == 'kr'){
             if(!rowData.paydate){
                let sanityId: any = this.getSanityId(SanityFields.paydate, SanityGroup.mandatory, level1SanityItems);
                sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
             }
        }

        // check date format
        if (rowData.exdate && !AppUtil.checkDateFormat(rowData.exdate, 'mmddyyyy')){
            let sanityId: any = this.getSanityId(SanityFields.exdate, SanityGroup.dateFormat, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.paydate && !AppUtil.checkDateFormat(rowData.paydate, 'mmddyyyy')){
            let sanityId: any = this.getSanityId(SanityFields.paydate, SanityGroup.dateFormat, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }

        // check number
        if (rowData.eventamount && Number.isNaN(Number(rowData.eventamount))){
            let sanityId: any = this.getSanityId(SanityFields.eventamount, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.offerprice && Number.isNaN(Number(rowData.offerprice))){
            let sanityId: any = this.getSanityId(SanityFields.offerprice, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.termoldshares && Number.isNaN(Number(rowData.termoldshares))){
            let sanityId: any = this.getSanityId(SanityFields.termoldshares, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.termnewshares && Number.isNaN(Number(rowData.termnewshares))){
            let sanityId: any = this.getSanityId(SanityFields.termnewshares, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.spunoffcash && Number.isNaN(Number(rowData.spunoffcash))){
            let sanityId: any = this.getSanityId(SanityFields.spunoffcash, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.priceExT1 && Number.isNaN(Number(rowData.priceExT1))){
            let sanityId: any = this.getSanityId(SanityFields.priceExT1, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.fxexT1 && Number.isNaN(Number(rowData.fxexT1))){
            let sanityId: any = this.getSanityId(SanityFields.fxexT1, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.payDatePriceT1 && Number.isNaN(Number(rowData.payDatePriceT1))){
            let sanityId: any = this.getSanityId(SanityFields.payDatePriceT1, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.payDateFxT1 && Number.isNaN(Number(rowData.payDateFxT1))){
            let sanityId: any = this.getSanityId(SanityFields.payDateFxT1, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.frankingPercent && Number.isNaN(Number(rowData.frankingPercent))){
            let sanityId: any = this.getSanityId(SanityFields.frankingPercent, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }   
        if (rowData.incomePercent && Number.isNaN(Number(rowData.incomePercent))){
            let sanityId: any = this.getSanityId(SanityFields.incomePercent, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }
        
        // check for mandatory value.
        if(rowData.reit == ''){
            let sanityId: any = this.getSanityId(SanityFields.reit, SanityGroup.mandatory, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }
        // check for boolean value.
        if (rowData.reit != '' && rowData.reit != Number(1) && rowData.reit != Number(0)){
            let sanityId: any = this.getSanityId(SanityFields.reit, SanityGroup.invalidData, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }
        
        // file level duplicate data entry check based on isin, country, ex date, event type, event name.
        //let dupRecords: any[] = records.filter(x => x.isin == rowData.isin && x.country == rowData.country && x.exdate == rowData.exdate && x.eventType == rowData.eventType && x.eventName == rowData.eventName);
        
        let dupRecords: any[] = records.filter(x => 
            x.source.toLowerCase() == rowData.source.toLowerCase() &&
                x.isin.toLowerCase() == rowData.isin.toLowerCase() &&
                x.country.toLowerCase() == rowData.country.toLowerCase() &&
                x.identifier.toLowerCase() == rowData.identifier.toLowerCase() &&
                x.priceCurrency.toLowerCase() == rowData.priceCurrency.toLowerCase() &&
                x.eventType.toLowerCase() == rowData.eventType.toLowerCase() &&
                x.eventName.toLowerCase() == rowData.eventName.toLowerCase() &&
                x.eventCurrency.toLowerCase() == rowData.eventCurrency.toLowerCase() &&
                x.eventamount == rowData.eventamount &&
                x.offerprice == rowData.offerprice &&
                x.termoldshares == rowData.termoldshares &&
                x.termnewshares == rowData.termnewshares &&
                x.spunoffstock == rowData.spunoffstock &&
                x.spunoffcash == rowData.spunoffcash &&
                x.priceExT1 == rowData.priceExT1 &&
                x.fxexT1 == rowData.fxexT1 &&
                x.taxRate == rowData.taxRate &&
                x.payDatePriceT1 == rowData.payDatePriceT1 &&
                x.payDateFxT1 == rowData.payDateFxT1 &&
                x.frankingPercent == rowData.frankingPercent &&
                x.incomePercent == rowData.incomePercent &&
                x.reit == rowData.reit &&
                x.paydate == rowData.paydate &&
                x.exdate == rowData.exdate
        );
        
        if (dupRecords.length > 1){
            let sanityId: any = this.getSanityId(SanityFields.duplicate, SanityGroup.duplicate, level1SanityItems);
            sanityList.push({ reqDetailId: rowData.reqdetailID, sanityId: sanityId });
        }

        return sanityList;
    }

}