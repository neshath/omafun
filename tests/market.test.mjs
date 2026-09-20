import test from 'node:test';
import assert from 'node:assert/strict';
import {project} from '../src/model.js';
import {createListing,validateListing,forkListing,MarketLibrary,fetchCatalog,fetchListing,webURL} from '../src/market.js';
const make=()=>createListing(project(true),{name:'Test world',author:'Test author',description:'Original test fixture.',license:'MIT',sourceUrl:'https://example.com/source',tags:['platformer']});
test('shared games require editable source, explicit author and a supported license',()=>{
 const listing=make();assert.equal(listing.project.scenes.length,1);
 for(const invalid of [{license:'proprietary'},{author:''},{project:undefined},{sourceUrl:'javascript:alert(1)'},{openSource:false}]){
  assert.throws(()=>validateListing({...listing,...invalid}));
 }
 assert.equal(webURL('https://secret:password@example.com'),null);
});
test('fork preserves attribution without modifying the source or reusing identity',()=>{
 const listing=make(),original=JSON.stringify(listing),fork=forkListing(listing);
 assert.notEqual(fork.id,listing.project.id);assert.equal(fork.upstream.license,'MIT');
 assert.equal(fork.upstream.author,'Test author');assert.equal(fork.share.author,'');
 fork.scenes[0].name='Changed';assert.equal(JSON.stringify(listing),original);
});
test('local library deduplicates packages and supports recoverable removal',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const library=new MarketLibrary(storage),listing=make();
 library.import(listing);library.import(listing);assert.equal(library.list().length,1);
 library.remove(listing.id);assert.equal(library.list().length,0);
 library.undoRemove();assert.equal(library.list()[0].id,listing.id);
});
test('remote catalogs validate listings and reject mismatched downloaded identities',async()=>{
 const listing=make();const summary={...listing,project:undefined,packageUrl:'https://example.com/game.json'};
 const fetcher=async()=>({ok:true,text:async()=>JSON.stringify([summary])});
 assert.equal((await fetchCatalog('https://example.com/catalog.json',fetcher)).length,1);
 await assert.rejects(fetchCatalog('http://example.com/catalog.json',fetcher),/HTTPS/);
 await assert.rejects(fetchListing(summary,async()=>({ok:true,text:async()=>JSON.stringify({...listing,id:'changed'})})),/identity/);
 assert.equal((await fetchListing(summary,async()=>({ok:true,text:async()=>JSON.stringify(listing)}))).id,listing.id);
});
