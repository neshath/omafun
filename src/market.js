import {clone,validateExtended} from './model.js';

export const OPEN_LICENSES=['MIT','Apache-2.0','BSD-2-Clause','GPL-3.0-only','CC0-1.0'];
export const MARKET_FORMAT='pixel-forge-open-game';
export function webURL(value){
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}
}
function boundedString(value,name,max){if(typeof value!=='string'||!value.trim()||value.length>max)throw Error(`${name} is required (maximum ${max} characters).`);return value.trim();}
export function validateListing(input,{requireProject=true}={}){
 if(!input||input.format!==MARKET_FORMAT||input.version!==1||input.openSource!==true)throw Error('This is not an open-source Pixel Forge package.');
 if(!OPEN_LICENSES.includes(input.license))throw Error('Choose a supported open-source license.');
 const sourceUrl=webURL(input.sourceUrl);if(!sourceUrl)throw Error('Source must be a public HTTPS repository URL.');
 const listing={format:MARKET_FORMAT,version:1,id:boundedString(input.id,'Package ID',120),name:boundedString(input.name,'Title',100),author:boundedString(input.author,'Author',100),description:boundedString(input.description,'Description',1000),license:input.license,sourceUrl,openSource:true,tags:Array.isArray(input.tags)?input.tags.filter(x=>typeof x==='string').slice(0,12).map(x=>x.slice(0,32)):[],updatedAt:Number.isFinite(input.updatedAt)?input.updatedAt:0};
 if(input.project)listing.project=validateExtended(clone(input.project));
 else if(requireProject)throw Error('The editable project must be included.');
 if(input.packageUrl){listing.packageUrl=webURL(input.packageUrl);if(!listing.packageUrl)throw Error('Package URL must use HTTPS.');}
 if(!listing.project&&!listing.packageUrl)throw Error('Catalog listing must include project data or a package URL.');
 return listing;
}
export function createListing(project,metadata){
 return validateListing({...metadata,format:MARKET_FORMAT,version:1,id:project.id,openSource:true,project,updatedAt:Date.now()});
}
export function forkListing(listing){const p=clone(validateListing(listing).project);p.id=crypto.randomUUID();p.name=listing.name+' remix';p.sample=false;p.upstream={id:listing.id,author:listing.author,sourceUrl:listing.sourceUrl,license:listing.license};p.share={name:p.name,author:'',description:listing.description,sourceUrl:'',license:listing.license,tags:listing.tags.join(', ')};return p;}
export class MarketLibrary{
 constructor(storage=globalThis.localStorage){this.storage=storage;this.key='pixel-forge-library-v1';}
 list(){const raw=this.storage.getItem(this.key);if(!raw)return[];const data=JSON.parse(raw);if(!Array.isArray(data))throw Error('Local game library is invalid. Export your projects before clearing browser storage.');return data.map(x=>validateListing(x));}
 import(data){const listing=validateListing(data),items=this.list().filter(x=>x.id!==listing.id);items.unshift(listing);this.storage.setItem(this.key,JSON.stringify(items.slice(0,64)));return listing;}
 remove(id){const items=this.list();const removed=items.find(x=>x.id===id);if(!removed)return;this.storage.setItem(this.key+'-undo',JSON.stringify(removed));this.storage.setItem(this.key,JSON.stringify(items.filter(x=>x.id!==id)));}
 undoRemove(){const raw=this.storage.getItem(this.key+'-undo');if(!raw)return;const item=this.import(JSON.parse(raw));this.storage.removeItem(this.key+'-undo');return item;}
}
export async function fetchCatalog(url,fetcher=fetch){
 const safe=webURL(url);if(!safe)throw Error('Use a public HTTPS catalog URL.');
 const response=await fetcher(safe,{signal:AbortSignal.timeout(12000),credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error(`Catalog request failed (${response.status}).`);
 const text=await response.text();if(text.length>12_000_000)throw Error('Catalog is too large.');
 const data=JSON.parse(text);if(!Array.isArray(data)||data.length>256)throw Error('Catalog must contain at most 256 listings.');
 return data.map(x=>validateListing(x,{requireProject:false}));
}
export async function fetchListing(summary,fetcher=fetch){
 const listing=validateListing(summary,{requireProject:false});if(listing.project)return listing;
 const response=await fetcher(listing.packageUrl,{signal:AbortSignal.timeout(12000),credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)throw Error(`Package request failed (${response.status}).`);
 const text=await response.text();if(text.length>20_000_000)throw Error('Package exceeds 20 MB.');
 const complete=validateListing(JSON.parse(text));if(complete.id!==listing.id||complete.license!==listing.license||complete.sourceUrl!==listing.sourceUrl)throw Error('Package identity or license differs from its catalog listing.');return complete;
}
