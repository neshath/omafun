import {clone} from './model.js';
import {button,node} from './editor-panels.js';

export function createEditorTools(api){
 let ids=new Set(),gesture=null,clipboard=[],stamp=null,measure=null;
 const entities=()=>api.scene.entities.filter(e=>ids.has(e.id));
 const world=q=>({x:(q.x-api.pan.x)/api.zoom,y:(q.y-api.pan.y)/api.zoom});
 const locked=()=>api.scene.layers.find(l=>l.id==='entities')?.locked;
 const changed=()=>{api.changed();api.renderInspector();};
 function choose(id){api.setTool(id);api.note(id==='path'?'Click to add path points to the selected object.':id==='stamp'?'Drag an area to capture tiles. Click to stamp; Shift-drag to capture another area.':'Drag to measure a distance.');}
 for(const[id,icon,label]of [['path','⌁','Movement path (P)'],['stamp','▥','Tile stamp (T)'],['measure','↔','Measure (M)']]){const b=button(icon,()=>choose(id));b.dataset.tool=id;b.title=label;b.setAttribute('aria-label',label);document.querySelector('#tools').append(b);}
 function duplicate(items){if(locked())return;api.checkpoint();const mapping=new Map(items.filter(e=>e.type!=='player').map(e=>[e.id,crypto.randomUUID()]));const copies=items.filter(e=>e.type!=='player').map(e=>{const c=clone(e);c.id=mapping.get(e.id);c.x=Math.min(api.scene.width*16-c.w,c.x+16);c.y=Math.min(api.scene.height*16-c.h,c.y+16);return c;});api.scene.entities.push(...copies);ids=new Set(copies.map(e=>e.id));api.selected=copies[0]?.id||null;changed();}
 function pointerDown(event,a,q){if(api.runtime||api.mode!=='world'||api.keys.has(' ')||event.button!==0)return false;
  if(api.tool==='path'){const e=api.scene.entities.find(e=>e.id===api.selected);if(!e){api.note('Select an entity before adding a path.');return true;}if(locked())return true;if(a.x<0||a.y<0||a.x>=api.scene.width||a.y>=api.scene.height)return true;api.checkpoint();e.path??=[];e.path.push({x:a.x*16,y:a.y*16});changed();return true;}
  if(api.tool==='measure'){measure={a:world(q),b:world(q)};gesture={type:'measure'};return true;}
  if(api.tool==='stamp'){if(api.layer.locked||!api.layer.visible){api.note('Unlock and show this layer to stamp.');return true;}if(!stamp||event.shiftKey){gesture={type:'stamp',a,b:a};}else{api.checkpoint();for(const[k,id]of Object.entries(stamp.tiles)){const[x,y]=k.split(',').map(Number),xx=x+a.x,yy=y+a.y;if(xx>=0&&yy>=0&&xx<api.scene.width&&yy<api.scene.height)api.layer.tiles[`${xx},${yy}`]=id;}changed();}return true;}
  if(api.tool!=='select')return false;const p=world(q),hit=[...api.scene.entities].reverse().find(e=>e.visible!==false&&p.x>=e.x&&p.x<e.x+e.w&&p.y>=e.y&&p.y<e.y+e.h);
  if(hit){if(event.shiftKey){if(ids.has(hit.id))ids.delete(hit.id);else ids.add(hit.id);}else if(!ids.has(hit.id))ids=new Set([hit.id]);api.selected=hit.id;api.renderInspector();if(!locked()){api.checkpoint();gesture={type:'move',start:p,originals:entities().map(e=>({id:e.id,x:e.x,y:e.y}))};}}
  else{if(!event.shiftKey)ids.clear();api.selected=null;gesture={type:'select',a:p,b:p};}return true;
 }
 function pointerMove(event,a,q){if(!gesture)return;const p=world(q);
  if(gesture.type==='measure'){measure.b=p;api.note(`${Math.round(Math.hypot(p.x-measure.a.x,p.y-measure.a.y))} px · ΔX ${Math.round(p.x-measure.a.x)} · ΔY ${Math.round(p.y-measure.a.y)}`);}
  if(gesture.type==='stamp')gesture.b=a;if(gesture.type==='select')gesture.b=p;
  if(gesture.type==='move'){for(const original of gesture.originals){const e=api.scene.entities.find(x=>x.id===original.id);if(e){e.x=Math.max(0,Math.min(api.scene.width*16-e.w,Math.round((original.x+p.x-gesture.start.x)/8)*8));e.y=Math.max(0,Math.min(api.scene.height*16-e.h,Math.round((original.y+p.y-gesture.start.y)/8)*8));}}api.changed();}
 }
 function pointerUp(){if(!gesture)return;
  if(gesture.type==='select'){const {a,b}=gesture;for(const e of api.scene.entities)if(e.x>=Math.min(a.x,b.x)&&e.x+e.w<=Math.max(a.x,b.x)&&e.y>=Math.min(a.y,b.y)&&e.y+e.h<=Math.max(a.y,b.y))ids.add(e.id);api.selected=[...ids][0]||null;api.renderInspector();api.note(`${ids.size} entities selected.`);}
  if(gesture.type==='stamp'){const {a,b}=gesture;const x0=Math.max(0,Math.min(a.x,b.x)),y0=Math.max(0,Math.min(a.y,b.y)),x1=Math.min(api.scene.width-1,Math.max(a.x,b.x)),y1=Math.min(api.scene.height-1,Math.max(a.y,b.y));const data={};for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const id=api.layer.tiles[`${x},${y}`];if(id)data[`${x-x0},${y-y0}`]=id;}stamp={tiles:data,w:x1-x0+1,h:y1-y0+1};api.note(`Captured ${stamp.w} × ${stamp.h} tile stamp. Click to place it.`);}
  gesture=null;
 }
 function keyDown(event,key){if(api.runtime)return false;
  if(event.metaKey||event.ctrlKey){if(key==='a'){event.preventDefault();ids=new Set(api.scene.entities.map(e=>e.id));api.selected=[...ids][0];api.renderInspector();return true;}if(key==='c'){event.preventDefault();clipboard=clone(entities().length?entities():api.scene.entities.filter(e=>e.id===api.selected));api.note(`Copied ${clipboard.length} entities.`);return true;}if(key==='v'){event.preventDefault();duplicate(clipboard);return true;}if(key==='d'&&ids.size>1){event.preventDefault();duplicate(entities());return true;}return false;}
  if((key==='Delete'||key==='Backspace')&&ids.size>1){event.preventDefault();if(!locked()){api.checkpoint();api.scene.entities=api.scene.entities.filter(e=>!ids.has(e.id));ids.clear();api.selected=null;changed();}return true;}
  const custom=Object.entries(api.project.settings.shortcuts||{}).find(([,k])=>k===key);if(custom){api.setTool(custom[0]);return true;}
  const defaults={p:'path',t:'stamp',m:'measure'};if(defaults[key]){choose(defaults[key]);return true;}return false;
 }
 function drawOverlay(ctx){if(api.runtime||api.mode!=='world')return;ctx.save();ctx.translate(api.pan.x,api.pan.y);ctx.scale(api.zoom,api.zoom);ctx.lineWidth=1/api.zoom;ctx.strokeStyle='#f58dad';for(const e of entities())ctx.strokeRect(e.x-2,e.y-2,e.w+4,e.h+4);
  if(gesture&&['select','stamp'].includes(gesture.type)){const f=gesture.type==='stamp'?16:1,a=gesture.a,b=gesture.b;ctx.fillStyle='#63c9bf22';const x=Math.min(a.x,b.x)*f,y=Math.min(a.y,b.y)*f,w=(Math.abs(b.x-a.x)+(f===16?1:0))*f,h=(Math.abs(b.y-a.y)+(f===16?1:0))*f;ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h);}
  if(measure&&api.tool==='measure'){ctx.strokeStyle='#f4dfa0';ctx.beginPath();ctx.moveTo(measure.a.x,measure.a.y);ctx.lineTo(measure.b.x,measure.b.y);ctx.stroke();}ctx.restore();
 }
 return {pointerDown,pointerMove,pointerUp,keyDown,drawOverlay};
}
