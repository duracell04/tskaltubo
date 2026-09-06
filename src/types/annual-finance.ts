export type Value = number | null;
export interface AnnualService {name:string;share:Value;rate:Value;period:'month'|'day';occupancy:Value[];personnel:Value;variable:Value;}
export interface AnnualInput {
 version:1;conceptId:string;propertyId:string|null;acquisition:Value;currency:'EUR'|'GEL'|'CHF'|'USD';fx:Value;fxDate:string;transaction:Value;acquisitionBundled:boolean;
 area:Value;renovation:Value;capacity:Value;ffe:Value;medical:Value;equipmentBundled:boolean;hydro:Value;soft:Value;contingency:Value;contingencyBase:'direct'|'direct_plus_soft';preOpening:Value;workingCapital:Value;preOpeningBundled:boolean;
 phases:{year:number;capacity:Value}[];spending:number[];services:AnnualService[];ancillary:Value;costMode:'derived'|'margin';margin:Value;fixed:Value;maintenance:Value;provenance:string;
}
export type ReturnResult={status:'available';rate:number}|{status:'unavailable'|'ambiguous';reason:string};
export interface AnnualRow {year:number;capacity:Value;revenue:Value;opex:Value;ebitda:Value;margin:Value;maintenance:Value;operatingCash:Value;expenditure:Value;projectCash:Value;cumulative:Value;cashYield:Value;}
export interface AnnualResult {issues:string[];missing:string[];investment:Value;acquisition:Value;renovation:Value;equipment:Value;direct:Value;soft:Value;contingency:Value;development:Value;investmentPerBed:Value;annual:AnnualRow[];roi:Value;payback:number|null;irr:ReturnResult;}
