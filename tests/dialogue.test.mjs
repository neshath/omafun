import test from 'node:test';
import assert from 'node:assert/strict';
import {project,entity} from '../src/model.js';
import {Runtime} from '../src/runtime.js';
test('dialogue finished fires on dismissal, not opening, and one press cannot reopen it',()=>{
 const p=project(true),s=p.scenes[0];s.gameType='topdown';
 const player=s.entities.find(e=>e.type==='player'),npc=entity('npc',player.x+20,player.y);
 npc.text='Welcome';s.entities=[player,npc];
 s.events=[{id:'finished',enabled:true,once:false,event:'dialogue',sourceId:npc.id,action:'message',value:'Finished'}];
 const r=new Runtime(s,p);
 r.update(1/60,new Set(['e']));assert.equal(r.dialogue?.text,'Welcome');assert.equal(r.message,null);
 r.update(1/60,new Set());r.update(1/60,new Set(['e']));
 assert.equal(r.dialogue,null);assert.equal(r.message?.text,'Finished');
});
