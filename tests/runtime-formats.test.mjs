import test from 'node:test';
import assert from 'node:assert/strict';
import {project,validateExtended} from '../src/model.js';
import {Runtime} from '../src/runtime.js';
import {templateProject} from '../src/templates.js';
test('puzzle platformers use gravity while arcade templates use overhead controls',()=>{
 const p=project(true),s=p.scenes[0];s.gameType='puzzle';assert.equal(new Runtime(s,p).overhead,false);
 s.gameType='arcade';assert.equal(new Runtime(s,p).overhead,true);
});
test('2.5D water-world templates use overhead movement and validate as editable projects',()=>{
 const p=templateProject('2.5d'),s=p.scenes[0];assert.equal(s.gameType,'2.5d');assert.equal(s.biome,'watergarden');assert.ok(s.garden);assert.ok(s.entities.some(e=>e.propKind==='bridge'));assert.equal(new Runtime(s,p).overhead,true);assert.doesNotThrow(()=>validateExtended(JSON.parse(JSON.stringify(p))));
});
test('lava joins spikes as damage terrain and palette events support expanded environments',()=>{
 const p=project(true),s=p.scenes[0];s.layers.find(l=>l.id==='terrain').tiles['0,0']=16;
 const r=new Runtime(s,p);assert.ok(r.hazards.some(x=>x.x===0&&x.y===5));
 r.runAction({action:'palette',value:'jungle'});assert.equal(r.scene.biome,'jungle');
 r.runAction({action:'palette',value:'__proto__'});assert.equal(r.scene.biome,'jungle');
 assert.equal(s.biome,'forest');
});
