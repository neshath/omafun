import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {templateProject} from '../src/templates.js';
import {gardenPacks} from '../src/garden.js';
import {project,entity,makeScene} from '../src/model.js';
import {Runtime} from '../src/runtime.js';
import {ProjectStore,STORAGE_KEY,LEGACY_KEY} from '../src/storage.js';
import {buildGameHTML,buildProjectPackage} from '../src/export.js';

class MemoryStorage {
  data=new Map();fail=null;
  getItem(key){return this.data.get(key)??null;}
  setItem(key,value){if(this.fail?.(key))throw Error('Quota exceeded');this.data.set(key,String(value));}
  removeItem(key){if(this.fail?.(key))throw Error('Storage unavailable');this.data.delete(key);}
}
test('stable IDs, metadata, independent loads and full project package',()=>{
  const store=new ProjectStore(new MemoryStorage()),p=project();
  p.settings={audio:true};p.assets=[{data:'data:image/png;base64,AA=='}];p.events=[{type:'start'}];
  const first=store.save(p);assert.equal(first.id,p.id);assert.equal(first.sceneCount,1);
  p.name='Renamed';store.save(p);assert.equal(store.list().length,1);assert.equal(store.list()[0].id,first.id);
  const loaded=store.load(p.id);loaded.name='Not saved';assert.equal(store.load(p.id).name,'Renamed');
  assert.deepEqual(JSON.parse(buildProjectPackage(p)),p);assert.equal(store.load('missing'),null);
});
test('versions are bounded per project and globally, and restoration is a new save',()=>{
  const store=new ProjectStore(new MemoryStorage()),p=project();
  for(let i=0;i<12;i++){p.name='v'+i;store.save(p);}
  assert.equal(store.versions(p.id).length,8);
  const oldest=store.versions(p.id).at(-1);assert.equal(oldest.name,'v4');
  assert.equal(store.restoreVersion(p.id,oldest.id).name,'v4');assert.equal(store.versions(p.id).length,8);
  const ids=[p.id];for(let i=0;i<10;i++){const q=project();ids.push(store.save(q).id);for(let j=0;j<8;j++)store.save(q);}
  assert.ok(ids.reduce((sum,id)=>sum+store.versions(id).length,0)<=64);
});
test('trash is recoverable, survives a new store, and retains history',()=>{
  const storage=new MemoryStorage(),store=new ProjectStore(storage),p=project();store.save(p);
  assert.equal(store.remove(p.id),true);assert.equal(store.load(p.id),null);assert.equal(store.listTrash()[0].id,p.id);
  assert.equal(store.loadLatest(),null);assert.throws(()=>store.save(p),/trash/);
  const reopened=new ProjectStore(storage);assert.deepEqual(reopened.restoreTrash(p.id),p);
  assert.equal(reopened.versions(p.id).length,1);assert.equal(reopened.listTrash().length,0);
});
test('legacy-only autosaves migrate once and later editor writes remain loadable',()=>{
  const storage=new MemoryStorage(),p=project();storage.setItem(LEGACY_KEY,JSON.stringify(p));
  const store=new ProjectStore(storage),loaded=store.loadLatest();assert.ok(loaded.id);
  assert.equal(store.list().length,1);assert.equal(store.loadLatest().id,loaded.id);assert.equal(store.versions(loaded.id).length,1);
  loaded.name='Edited in app';storage.setItem(LEGACY_KEY,JSON.stringify(loaded));
  assert.equal(store.loadLatest().name,'Edited in app');assert.equal(store.list().length,1);
});
test('failed writes at each transaction stage preserve the previous project and mirror',()=>{
  for(const failedKey of [STORAGE_KEY+'-journal',LEGACY_KEY,STORAGE_KEY]){
    const storage=new MemoryStorage(),store=new ProjectStore(storage),p=project();store.save(p);
    const before=storage.getItem(STORAGE_KEY),legacy=storage.getItem(LEGACY_KEY),stamp=p.updatedAt;
    p.name='Unsaved';storage.fail=key=>key===failedKey;
    assert.throws(()=>store.save(p));assert.equal(storage.getItem(STORAGE_KEY),before);assert.equal(p.updatedAt,stamp);
    storage.fail=null;const reopened=new ProjectStore(storage);assert.equal(reopened.load(p.id).name,'Untitled project');
    assert.equal(storage.getItem(LEGACY_KEY),legacy);
  }
});
test('saving a new project before migration preserves the old editor autosave',()=>{
  const storage=new MemoryStorage(),legacy=project();legacy.name='Old editor work';
  storage.setItem(LEGACY_KEY,JSON.stringify(legacy));const store=new ProjectStore(storage),p=project();p.name='New project';
  store.save(p);assert.equal(store.list().length,2);
  assert.equal(store.load(store.list().find(m=>m.name==='Old editor work').id).name,'Old editor work');
});
test('interrupted mirror rollback is retried and committed cleanup failure stays committed',()=>{
  const storage=new MemoryStorage(),store=new ProjectStore(storage),p=project();store.save(p);
  let failAll=false;storage.fail=key=>{if(key===STORAGE_KEY)failAll=true;return failAll;};
  p.name='Interrupted';assert.throws(()=>store.save(p));assert.ok(storage.getItem(STORAGE_KEY+'-journal'));
  storage.fail=null;assert.equal(new ProjectStore(storage).loadLatest().name,'Untitled project');
  const remove=storage.removeItem.bind(storage);storage.removeItem=()=>{throw Error('cleanup denied');};
  store.save(p);storage.removeItem=remove;assert.equal(new ProjectStore(storage).loadLatest().name,'Interrupted');
});
test('invalid input and corrupt persisted JSON never reset existing data',()=>{
  const storage=new MemoryStorage(),store=new ProjectStore(storage),p=project();store.save(p);
  const before=storage.getItem(STORAGE_KEY);assert.throws(()=>store.save({}));assert.equal(storage.getItem(STORAGE_KEY),before);
  storage.setItem(STORAGE_KEY,'broken');assert.throws(()=>store.list());assert.equal(storage.getItem(STORAGE_KEY),'broken');
});
const fsLoader=url=>readFile(new URL(url),'utf8');
for(const format of ['platformer','topdown','2.5d',...Object.keys(gardenPacks)])test('actual '+format+' sources bundle, compile and start offline with full project',async()=>{
  const p=templateProject(gardenPacks[format]?'2.5d':format);if(gardenPacks[format])p.scenes[0].biome=format;p.settings={volume:.5};p.assets=[];p.events=[];
  p.name='Test </script><script>throw Error("injection")</script> & title';
  const requested=[];const html=await buildGameHTML(p,undefined,async url=>{requested.push(url);return fsLoader(url);});
  assert.ok(requested.some(url=>url.endsWith('/runtime.js')));assert.equal(new Set(requested).size,requested.length);
  assert.ok(html.includes('&lt;/script&gt;'));assert.equal((html.match(/<script>/g)||[]).length,1);
  const source=html.match(/<script>([\s\S]*)<\/script>/)[1];new vm.Script(source);
  const handlers={},elements={};const context=new Proxy({},{get:(_,key)=>key==='canvas'?elements.game:()=>{},set:()=>true});
  for(const id of ['game','start','begin','pause','restart','status'])elements[id]={getContext:()=>context,focus(){}};
  let tick;vm.runInNewContext(source,{document:{getElementById:id=>elements[id]},navigator:{getGamepads:()=>[]},addEventListener:(name,fn)=>handlers[name]=fn,requestAnimationFrame:fn=>{tick=fn;},console});
  await elements.begin.onclick();assert.equal(elements.start.hidden,true);assert.equal(elements.status.textContent,undefined);
  tick(16);handlers.keydown({key:'Escape',preventDefault(){}});tick(32);elements.restart.onclick();tick(48);
  assert.equal(elements.game.width,p.scenes[0].camera.w);
});
test('recursive optional sources, duplicate local declarations and aliased exports',async()=>{
  const sources={
    'model.js':'const local=1; export {local as value};',
    'render.js':"import {value as local} from './model.js'; export function draw(){return local;}",
    'runtime.js':"import {value} from './logic.js'; import {draw} from './render.js'; export class Runtime {constructor(scene,project){this.project=project;} update(){} render(){draw();}}",
    'logic.js':"import {art} from './art.js'; const local=2; export const value=local+art;",
    'art.js':'const local=3; export const art=local;'
  };
  const requests=[];const html=await buildGameHTML(project(true),undefined,url=>{const name=new URL(url).pathname.split('/').at(-1);requests.push(name);return sources[name];});
  assert.equal(requests.length,5);new vm.Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
  await assert.rejects(buildGameHTML(project(), 'missing',fsLoader),/Scene not found/);
  await assert.rejects(buildGameHTML(project(),undefined,()=>"import x from 'https://example.com/x.js';"),/Unsupported source import/);
});


test('runtime audio covers formats, effects, music switching, volume and respawn',async()=>{
  const originalAudio=globalThis.Audio;
  const played=[];
  class FakeAudio{
    constructor(src){this.src=src;this.loop=false;this.volume=1;this.currentTime=0;this.paused=true;this.listeners={};played.push(this);}
    async play(){this.paused=false;return true;}
    pause(){this.paused=true;}
    addEventListener(name,fn){this.listeners[name]=fn;}
  }
  globalThis.Audio=FakeAudio;
  try{
    const p=project(),first=p.scenes[0],second=makeScene('Second'),silent=makeScene('Silent');
    first.entities=[entity('player',32,32)];
    second.entities=[entity('player',32,32)];
    silent.entities=[entity('player',32,32)];
    const files=[
      {id:'mp3',name:'theme.mp3',mime:'audio/mpeg',bytes:3,data:'data:audio/mpeg;base64,AAA',loop:true},
      {id:'wav',name:'jump.wav',mime:'audio/wav',bytes:3,data:'data:audio/wav;base64,BBB',loop:false},
      {id:'ogg',name:'theme.ogg',mime:'audio/ogg',bytes:3,data:'data:audio/ogg;base64,CCC',loop:true}
    ];
    p.audio.music=[files[0],files[2]];p.audio.effects=[files[1]];p.settings.volume=.6;
    first.musicId='mp3';second.musicId='ogg';p.scenes.push(second,silent);

    const runtime=new Runtime(first,p);
    await runtime.unlockAudio();
    assert.equal(played.length,1);
    assert.equal(played[0].src,files[0].data);
    assert.equal(played[0].loop,true);
    assert.equal(played[0].volume,.6);

    await runtime.playAudio('jump');
    assert.equal(played.length,2);
    assert.equal(played[1].src,files[1].data);
    assert.equal(played[1].loop,false);
    assert.equal(played[1].volume,.6);

    const firstMusic=runtime.currentMusic;
    assert.equal(runtime.transition(second.id),true);
    await Promise.resolve();
    assert.equal(firstMusic.paused,true);
    assert.equal(runtime.currentMusic.src,files[2].data);
    assert.equal(runtime.currentMusic.loop,true);

    assert.equal(runtime.transition(silent.id),true);
    assert.equal(runtime.currentMusic,null);
    runtime.respawn();
    assert.equal(runtime.currentMusic,null);
  }finally{
    if(originalAudio===undefined)delete globalThis.Audio;else globalThis.Audio=originalAudio;
  }
});

test('export smoke embeds audio and restarts with scene music still active',async()=>{
  const originalAudio=globalThis.Audio;
  const played=[];
  class FakeAudio{
    constructor(src){this.src=src;this.loop=false;this.volume=1;this.currentTime=0;this.paused=true;played.push(this);}
    async play(){this.paused=false;return true;}
    pause(){this.paused=true;}
    addEventListener(){}
  }
  globalThis.Audio=FakeAudio;
  try{
    const p=project(),scene=p.scenes[0];
    scene.entities=[entity('player',32,32)];
    scene.musicId='export-theme';
    p.settings.volume=.7;
    p.audio.music=[{id:'export-theme',name:'theme.mp3',mime:'audio/mpeg',bytes:3,data:'data:audio/mpeg;base64,AAA',loop:true}];
    p.audio.effects=[{id:'export-hit',name:'hit.wav',mime:'audio/wav',bytes:3,data:'data:audio/wav;base64,BBB',loop:false}];
    const html=await buildGameHTML(p,scene.id,fsLoader);
    assert.ok(html.includes('data:audio/mpeg;base64,AAA'));
    assert.ok(html.includes('data:audio/wav;base64,BBB'));
    const source=html.match(/<script>([\\s\\S]*)<\\/script>/)[1];
    const handlers={},elements={},context=new Proxy({},{get:(_,key)=>key==='canvas'?elements.game:()=>{},set:()=>true});
    for(const id of ['game','start','begin','pause','restart','status'])elements[id]={hidden:false,getContext:()=>context,focus(){}};
    let tick;
    const vmContext={document:{getElementById:id=>elements[id]},navigator:{getGamepads:()=>[]},addEventListener:(name,fn)=>handlers[name]=fn,requestAnimationFrame:fn=>{tick=fn;},console,Audio:FakeAudio};
    vm.runInNewContext(source,vmContext);
    await elements.begin.onclick();
    assert.equal(elements.start.hidden,true);
    assert.equal(played.length,1);
    assert.equal(played[0].src,'data:audio/mpeg;base64,AAA');
    assert.equal(played[0].loop,true);
    assert.equal(played[0].volume,.7);
    await elements.restart.onclick();
    assert.equal(played.length,2);
    assert.equal(played[1].src,'data:audio/mpeg;base64,AAA');
    assert.equal(played[1].loop,true);
    tick?.(16);
  }finally{
    if(originalAudio===undefined)delete globalThis.Audio;else globalThis.Audio=originalAudio;
  }
});
