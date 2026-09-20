import {validate} from './model.js';

/** ProjectStore contract: synchronous, JSON-only projects; missing IDs return null.
 * save assigns id/updatedAt to the caller only after commit. Versions include the
 * current save (8/project, 64 globally). Trash retains projects and their versions
 * without automatic eviction. Restore creates a fresh version. Reads are clones.
 * A write-ahead journal reconciles the legacy mirror after interrupted writes.
 * localStorage has no cross-tab CAS: callers must serialize concurrent writers.
 * Corrupt data and quota/access errors throw; existing data is never reset silently.
 */
export const STORAGE_KEY='pixel-forge-projects-v1';
export const LEGACY_KEY='pixel-forge-autosave';
const JOURNAL_KEY=STORAGE_KEY+'-journal';
const copy=value=>JSON.parse(JSON.stringify(value));
const uid=()=>globalThis.crypto.randomUUID();
const clean=value=>validate(copy(value));
const meta=p=>({id:p.id,name:p.name,updatedAt:p.updatedAt,sceneCount:p.scenes.length});

export class ProjectStore {
  constructor(storage=globalThis.localStorage){this.storage=storage;}
  _mirror(value){if(value===null)this.storage.removeItem(LEGACY_KEY);else this.storage.setItem(LEGACY_KEY,value);}
  _recover(){
    const raw=this.storage.getItem(JOURNAL_KEY);if(!raw)return;
    const j=JSON.parse(raw);
    if(typeof j.after!=='string'||!(j.beforeLegacy===null||typeof j.beforeLegacy==='string'))throw Error('Invalid project recovery journal');
    this._mirror(this.storage.getItem(STORAGE_KEY)===j.after?j.afterLegacy:j.beforeLegacy);
    this.storage.removeItem(JOURNAL_KEY);
  }
  _read(){
    this._recover();const raw=this.storage.getItem(STORAGE_KEY);
    if(raw===null)return {version:1,projects:[],trash:[],latest:null};
    const state=JSON.parse(raw);
    if(state.version!==1||!Array.isArray(state.projects)||!Array.isArray(state.trash))throw Error('Invalid project storage');
    return state;
  }
  _commit(state){
    const latest=state.projects.find(r=>r.project.id===state.latest)?.project;
    const afterLegacy=latest?JSON.stringify(latest):null;
    const after=JSON.stringify(state),beforeLegacy=this.storage.getItem(LEGACY_KEY);
    this.storage.setItem(JOURNAL_KEY,JSON.stringify({after,beforeLegacy,afterLegacy}));
    try{this._mirror(afterLegacy);this.storage.setItem(STORAGE_KEY,after);}
    catch(error){try{this._recover();}catch{/* Journal remains for the next successful access. */}throw error;}
    // Once the canonical write succeeds the transaction is committed. Cleanup may
    // fail; the next operation completes it, without reporting a failed save.
    try{this.storage.removeItem(JOURNAL_KEY);}catch{}
  }
  _bound(state){
    const records=[...state.projects,...state.trash];
    for(const r of records)r.versions=r.versions.slice(-8);
    const all=records.flatMap(r=>r.versions.map(v=>({r,v}))).sort((a,b)=>a.v.at-b.v.at);
    for(const {r,v} of all.slice(0,Math.max(0,all.length-64)))r.versions=r.versions.filter(x=>x.id!==v.id);
  }
  save(project){
    const p=clean(project),state=this._read();
    // A first save must not overwrite an older editor-only autosave. Preserve it
    // even when the UI creates a new project before calling loadLatest().
    const legacy=this.storage.getItem(LEGACY_KEY);
    if(this.storage.getItem(STORAGE_KEY)===null&&legacy!==null){
      const old=clean(JSON.parse(legacy));
      if(JSON.stringify(old)!==JSON.stringify(p)&&(!old.id||old.id!==p.id)){
        old.id=old.id||uid();old.updatedAt=old.updatedAt||Date.now();
        state.projects.push({project:old,versions:[{id:uid(),at:old.updatedAt,name:old.name,project:copy(old)}]});
      }
    }
    p.id=typeof p.id==='string'&&p.id?p.id:uid();p.updatedAt=Date.now();
    if(state.trash.some(r=>r.project.id===p.id))throw Error('Restore this project from trash before saving');
    let record=state.projects.find(r=>r.project.id===p.id);
    if(!record){record={project:p,versions:[]};state.projects.push(record);}
    record.project=p;record.versions.push({id:uid(),at:p.updatedAt,name:p.name,project:copy(p)});
    state.latest=p.id;this._bound(state);this._commit(state);
    project.id=p.id;project.updatedAt=p.updatedAt;return meta(p);
  }
  list(){return this._read().projects.map(r=>meta(r.project)).sort((a,b)=>b.updatedAt-a.updatedAt);}
  load(id){const p=this._read().projects.find(r=>r.project.id===id)?.project;return p?clean(p):null;}
  versions(id){return (this._read().projects.find(r=>r.project.id===id)?.versions||[]).map(({id,at,name})=>({id,at,name})).reverse();}
  restoreVersion(projectId,versionId){
    const r=this._read().projects.find(r=>r.project.id===projectId);
    const v=r?.versions.find(v=>v.id===versionId);if(!v)return null;
    const p=clean(v.project);p.id=projectId;this.save(p);return p;
  }
  remove(id){
    const state=this._read(),index=state.projects.findIndex(r=>r.project.id===id);if(index<0)return false;
    const [r]=state.projects.splice(index,1);r.deletedAt=Date.now();state.trash.push(r);
    if(state.latest===id)state.latest=state.projects.at(-1)?.project.id||null;
    this._commit(state);return true;
  }
  listTrash(){return this._read().trash.map(r=>({...meta(r.project),deletedAt:r.deletedAt}));}
  restoreTrash(id){
    const state=this._read(),index=state.trash.findIndex(r=>r.project.id===id);if(index<0)return null;
    const [r]=state.trash.splice(index,1);delete r.deletedAt;state.projects.push(r);state.latest=id;
    this._commit(state);return clean(r.project);
  }
  loadLatest(){
    const state=this._read();const raw=this.storage.getItem(LEGACY_KEY);
    // The editor may have written the compatibility key since the last store save.
    if(raw!==null){const p=clean(JSON.parse(raw));const current=state.projects.find(r=>r.project.id===state.latest)?.project;
      if(!current||JSON.stringify(p)!==JSON.stringify(current)){this.save(p);return p;}
      return clean(current);
    }
    const p=state.projects.find(r=>r.project.id===state.latest)?.project;return p?clean(p):null;
  }
}
