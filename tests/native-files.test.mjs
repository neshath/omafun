import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('native file commands are enabled without broad path grants',async()=>{
 const c=JSON.parse(await readFile(new URL('../src-tauri/capabilities/default.json',import.meta.url)));
 for(const p of ['fs:allow-read-text-file','fs:allow-write-text-file'])assert.ok(c.permissions.includes(p),p);
 assert.ok(c.permissions.every(p=>typeof p==='string'&&!p.includes('scope-home')));
});
test('native adapter handles selected paths, cancellation and write errors (mock APIs)',async()=>{
 let path='/chosen/game.pixel.json',written=null;
 globalThis.__TAURI__={dialog:{open:async()=>path,save:async()=>path},fs:{readTextFile:async()=>'{"test":true}',writeTextFile:async(p,data)=>{written=[p,data];}}};
 try{
  const api=await import('../src/platform.js?native-test');
  assert.deepEqual(await api.openProjectFile(),{name:'game.pixel.json',text:'{"test":true}'});
  assert.equal(await api.saveProjectFile('data','game.pixel.json'),true);assert.deepEqual(written,[path,'data']);
  path=null;written=null;assert.equal(await api.openProjectFile(),null);assert.equal(await api.saveProjectFile('data','game.pixel.json'),false);assert.equal(written,null);
  path='/chosen/fail';globalThis.__TAURI__.fs.writeTextFile=async()=>{throw Error('disk full');};await assert.rejects(api.saveProjectFile('data','game.pixel.json'),/disk full/);
 }finally{delete globalThis.__TAURI__;}
});
