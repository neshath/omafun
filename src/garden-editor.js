import {gardenPacks,gardenTheme,gardenProps,makeGardenProp,drawGardenProp,drawGardenTile} from './garden.js';
import {packExampleProject} from './templates.js';
import {node,button,field} from './editor-panels.js';

export function createGardenEditor(api){
 let chosen='fountain';
 const change=fn=>{if(api.runtime)return;api.checkpoint();fn();api.changed();api.refresh();};
 function active(){return api.scene.gameType==='2.5d'&&!!api.scene.garden;}
 function render(){
  if(!['tiles','garden'].includes(api.tab)||!gardenPacks[api.scene.biome])return false;
  const host=document.querySelector('#assets'),pack=gardenPacks[api.scene.biome],theme=gardenTheme(api.scene.biome);
  if(api.tab==='garden'){
   host.replaceChildren();document.querySelector('.asset-filters').hidden=true;document.querySelector('#assetCount').textContent='Water settings';
   const settings=node('div','garden-settings garden-settings-tab');settings.append(node('h3','','WATER SETTINGS'),node('p','empty-copy','Tune the water surface for this garden. Changes stay with the scene and export with the game.'));
   const options=node('div','garden-options');for(const [key,label]of [['water','Water'],['light','Caustic highlights'],['deep','Depth tint']])field(options,label,(api.scene.garden.packId===api.scene.biome?api.scene.garden[key]:undefined)||theme[key],v=>change(()=>{if(api.scene.garden.packId!==api.scene.biome)Object.assign(api.scene.garden,{water:theme.water,light:theme.light,deep:theme.deep,packId:api.scene.biome});api.scene.garden[key]=v;}),{type:'color'});
   field(options,'Animate water',api.scene.garden.animate,v=>change(()=>api.scene.garden.animate=v));field(options,'Large water tiles',!!api.scene.garden.largeWater,v=>change(()=>api.scene.garden.largeWater=v));settings.append(options);host.append(settings);return true;
  }
  if(!active())host.append(node('p','empty-copy','Garden materials and props can be placed in any scene. Enable garden mode for water boundaries and bridge walking.'),button('Enable garden mode',()=>change(()=>{api.scene.gameType='2.5d';api.scene.garden={animate:true};})));
  const grid=document.createDocumentFragment(),query=document.querySelector('#assetSearch').value.trim().toLowerCase();
  for(const [id,name]of [6,19,20,21].map((id,i)=>[id,pack.tiles[i]])){
   if(query&&!(pack.name+' '+name).toLowerCase().includes(query))continue;
   const b=button('',()=>{api.selected=null;api.tileId=id;api.layerId='terrain';api.setTool('pencil');api.renderLayers();api.renderInspector();api.note(name+' brush · B paints, R draws a filled region.');},'asset');
   const c=node('canvas');c.width=c.height=32;const ctx=c.getContext('2d');ctx.scale(1.5,1.5);drawGardenTile(ctx,id,3,3,0,{},theme);b.append(c,node('span','',name));grid.append(b);
  }
  for(const [kind,d]of Object.entries(gardenProps)){
   if(['tree','oak','sakura','willow','cactus','crystal','mushroom','gear'].includes(kind)&&!pack.landmarks.includes(kind))continue;
   if(query&&!(pack.name+' '+d.name).toLowerCase().includes(query))continue;
   const b=button('',()=>{chosen=kind;api.selected=null;api.layerId='entities';api.setTool('garden-prop');api.renderLayers();api.note('Click the scene to place '+d.name+'. V selects and moves props.');},'asset');
   const c=node('canvas');c.width=c.height=32;const ctx=c.getContext('2d'),scale=Math.min(28/d.w,26/(d.h+d.elevation+28));ctx.translate(16,17);ctx.scale(scale,scale);drawGardenProp(ctx,{...makeGardenProp(kind,0,0),x:-d.w/2,y:-d.h/2+12,packId:api.scene.biome});
   b.append(c,node('span','',d.name));grid.append(b);
  }
  const count=document.querySelector('#assetCount');count.textContent=(parseInt(count.textContent,10)+grid.childElementCount)+' assets';host.append(grid);if(!active())return true;
  host.append(button('＋ Add '+pack.name+' example scene',()=>change(()=>{const example=packExampleProject(api.scene.biome);api.project.scenes.push(example.scenes[0]);api.project.activeScene=api.project.scenes.length-1;}),'pack-example'));
  return true;
 }
 return {render,
  pointerDown(event,a){if(api.mode!=='world'||api.runtime||api.tool!=='garden-prop'||event.button!==0||api.keys.has(' '))return false;
   if(api.scene.layers.find(l=>l.id==='entities')?.locked){api.note('Unlock Entities to place props.');return true;}
   if(a.x<0||a.y<0||a.x>=api.scene.width||a.y>=api.scene.height)return true;
   change(()=>{const e=makeGardenProp(chosen,a.x*16,a.y*16);e.packId=api.scene.biome;e.x=Math.min(e.x,api.scene.width*16-e.w);e.y=Math.min(e.y,api.scene.height*16-e.h);api.scene.entities.push(e);api.selected=e.id;});return true;
  }
 };
}
