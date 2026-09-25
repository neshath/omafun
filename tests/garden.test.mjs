import test from 'node:test';
import assert from 'node:assert/strict';
import {templateProject} from '../src/templates.js';
import {Runtime} from '../src/runtime.js';
import {validateExtended} from '../src/model.js';
function run(){const p=templateProject('2.5d');return new Runtime(p.scenes[0],p);}
function walk(r,key,seconds){for(let i=0;i<seconds*60;i++)r.update(1/60,new Set([key]));}
test('garden bridge connects both banks and reaches the gate',()=>{
 const r=run();walk(r,'ArrowRight',4);assert.ok(r.player.x>420,'right bank must be reachable');walk(r,'ArrowDown',4);assert.ok(r.won,'garden gate must complete');
});
test('water stops the player without mutating the editing project',()=>{
 const r=run();walk(r,'ArrowUp',2);assert.ok(r.player.y>=208);assert.equal(r.project.scenes[0].entities.find(e=>e.type==='player').y,216);
});
test('garden projects round trip and reject malformed props',()=>{
 const p=templateProject('2.5d');assert.doesNotThrow(()=>validateExtended(JSON.parse(JSON.stringify(p))));
 p.scenes[0].entities.find(e=>e.type==='prop').elevation=Infinity;assert.throws(()=>validateExtended(p),/garden prop/);
});
