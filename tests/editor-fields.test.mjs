import test from 'node:test';
import assert from 'node:assert/strict';
import {field} from '../src/editor-panels.js';
test('multiline fields preserve the read-only textarea type and commit text',()=>{
 const original=globalThis.document;
 globalThis.document={createElement(tag){
  const element={children:[],append(...children){this.children.push(...children);}};
  if(tag==='textarea')Object.defineProperty(element,'type',{get:()=> 'textarea'});
  return element;
 }};
 try{
  let value;const parent={append(){}};
  const input=field(parent,'Description','Original',v=>value=v,{multiline:true});
  assert.equal(input.type,'textarea');assert.equal(input.value,'Original');
  input.value='Edited description';input.onchange();assert.equal(value,'Edited description');
 }finally{globalThis.document=original;}
});
