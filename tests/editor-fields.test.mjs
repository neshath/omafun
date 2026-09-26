import test from 'node:test';
import assert from 'node:assert/strict';
import {field,clearSceneReferences} from '../src/editor-panels.js';
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

test('deleting a scene clears entity and visual-logic references to it',()=>{
 const project={scenes:[
  {entities:[{id:'door',targetScene:'scene-b'}],events:[{id:'rule-1',action:'scene',targetId:'scene-b'}]},
  {entities:[{id:'other',targetScene:'scene-a'}],events:[{id:'rule-2',action:'open',targetId:'scene-b'}]}
 ]};
 clearSceneReferences(project,'scene-b');
 assert.equal(project.scenes[0].entities[0].targetScene,'');
 assert.equal(project.scenes[0].events[0].targetId,'');
 assert.equal(project.scenes[1].entities[0].targetScene,'scene-a');
 assert.equal(project.scenes[1].events[0].targetId,'scene-b');
});
