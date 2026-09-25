import test from 'node:test';
import assert from 'node:assert/strict';
import {gardenPacks,gardenTheme,gardenProps,makeGardenProp,drawGardenProp,drawGardenTile,gardenDepth} from '../src/garden.js';
import {templateProject} from '../src/templates.js';
import {validateExtended,palettes,biomeNames} from '../src/model.js';
import {Runtime} from '../src/runtime.js';
test('ten additional packs have distinct palettes and valid landmarks',()=>{
 assert.equal(Object.keys(gardenPacks).length,11);
 assert.equal(new Set(Object.keys(gardenPacks).map(id=>JSON.stringify(gardenTheme(id)))).size,11);
});
for(const [id,pack] of Object.entries(gardenPacks))test(id+' pack renders and round trips',()=>{
 assert.equal(biomeNames[id],pack.name);assert.equal(palettes[id].length,16);assert.equal(pack.tiles.length,4);assert.ok(gardenProps[pack.landmark]);
 const p=templateProject('2.5d'),s=p.scenes[0];s.biome=id;const e=makeGardenProp(pack.landmark,100,216);e.packId=id;s.entities.push(e);
 const loaded=validateExtended(JSON.parse(JSON.stringify(p)));assert.equal(loaded.scenes[0].entities.at(-1).packId,id);
 let draws=0;const c=new Proxy({},{get:()=>()=>{draws++;},set:()=>true});
 for(const tile of [6,19,20,21])drawGardenTile(c,tile,0,0,0,{},gardenTheme(id));
 drawGardenProp(c,e,0);assert.ok(draws>20);
 const r=new Runtime(s,p);for(let i=0;i<90;i++)r.update(1/60,new Set(['ArrowRight']));
 assert.ok(r.player.x+r.player.w<=100,'solid landmark blocks walking');
 assert.ok(gardenDepth({...e,y:200})>gardenDepth({...e,y:100}));
});
