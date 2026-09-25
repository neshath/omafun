// Original oblique pixel artwork. No external textures or renderer dependency.
export const gardenColors={water:'#419baa',light:'#82d2cb',deep:'#267284',wood:'#bc883c',woodDark:'#936029',woodLight:'#e0b467',stone:'#d6ddd0',stoneDark:'#a7b5b2',cream:'#fff2ce',leaf:'#47972f',leafDark:'#276c36',leafLight:'#8dc94d',pink:'#df79ad'};
// Each pack is an original material/palette variant of the shared oblique kit.
export const gardenPacks={
 watergarden:{name:'Willowmere · Watergarden',colors:gardenColors,tiles:['Clear water','Timber deck','Planted island','Limestone path'],landmark:'tree'},
 moonfen:{name:'Moonfern · Moonlit marsh',swatches:['#35495c','#a2d9c1','#203346','#817456','#b7c7b6','#68886a','#d7b5e8'],tiles:['Moonlit water','Bog boardwalk','Moss bank','Moonstone'],landmark:'mushroom'},
 desertstone:{name:'Desertstone · Oasis',swatches:['#418b93','#afe0c0','#275b72','#bb8143','#e9c98e','#84954b','#ea957b'],tiles:['Oasis water','Cedar deck','Dune garden','Sandstone'],landmark:'cactus'},
 frostbloom:{name:'Frostbloom · Tundra',swatches:['#6596b2','#d6f0ee','#3a597c','#8891a2','#dfebed','#92b7b2','#dfa9d6'],tiles:['Glacier water','Frost deck','Lichen bank','Ice stone'],landmark:'crystal'},
 emberroot:{name:'Emberroot · Caldera',swatches:['#ac573e','#ffd18b','#573547','#765152','#b08e7c','#947b47','#efaa59'],tiles:['Hot spring','Charred deck','Ash garden','Basalt path'],landmark:'crystal'},
 sakuravale:{name:'Sakuravale · Blossom',swatches:['#659f9d','#c3e2d3','#426977','#ac7764','#e9d4c3','#9db46d','#f0a5bf'],tiles:['Petal pond','Rosewood deck','Tea garden','Ivory path'],landmark:'tree'},
 copperquay:{name:'Copperquay · Canal',swatches:['#477f7b','#a1cdb8','#2c5358','#b57b49','#b9aa8b','#687c57','#e8ac66'],tiles:['Canal water','Copper deck','Reed bed','Patina stone'],landmark:'gear'},
 amethyst:{name:'Amethyst · Grotto',swatches:['#625583','#c9b5eb','#332c50','#776283','#b6a0ca','#6b9b9a','#e8aad7'],tiles:['Crystal pool','Violet deck','Glow moss','Amethyst path'],landmark:'crystal'},
 sunharbor:{name:'Sunharbor · Lagoon',swatches:['#379aa7','#b5eee0','#216379','#c59958','#f0dfb4','#64ab64','#f4b28e'],tiles:['Lagoon water','Beach deck','Palm island','Coral path'],landmark:'tree'},
 autumnmere:{name:'Autumnmere · Orchard',swatches:['#668582','#c2cfad','#3b575b','#a36a41','#d7bc91','#c68b49','#d57954'],tiles:['Still water','Walnut deck','Amber bank','Ochre path'],landmark:'tree'},
 nightlotus:{name:'Nightlotus · Lantern pools',swatches:['#343e66','#91a5d0','#1e2845','#665272','#a8a1bd','#657f87','#e6a1ce'],tiles:['Night pool','Indigo deck','Lotus bank','Silver path'],landmark:'mushroom'}
};
const packLandmarks={
 watergarden:['fountain','lotus'],moonfen:['mushroom','reeds'],desertstone:['cactus','palm'],
 frostbloom:['crystal','rock'],emberroot:['crystal','rock'],sakuravale:['tree','lotus'],
 copperquay:['gear','reeds'],amethyst:['crystal','mushroom'],sunharbor:['tree','palm'],
 autumnmere:['tree','rock'],nightlotus:['mushroom','lotus']
};
for(const [id,landmarks] of Object.entries(packLandmarks))gardenPacks[id].landmarks=landmarks;
function shade(hex,factor){return '#'+hex.slice(1).match(/../g).map(x=>Math.min(255,Math.round(parseInt(x,16)*factor)).toString(16).padStart(2,'0')).join('');}
export function gardenTheme(id='watergarden'){
 const pack=gardenPacks[id]||gardenPacks.watergarden;if(pack.colors)return pack.colors;
 const [water,light,deep,wood,stone,leaf,pink]=pack.swatches;
 return {water,light,deep,wood,woodDark:shade(wood,.72),woodLight:shade(wood,1.2),stone,stoneDark:shade(stone,.77),cream:shade(stone,1.12),leaf,leafDark:shade(leaf,.65),leafLight:shade(leaf,1.22),pink};
}
export const gardenProps={
 tree:{name:'Canopy tree',w:32,h:24,elevation:0,solid:true},
 cactus:{name:'Oasis cactus',w:24,h:20,elevation:0,solid:true},
 crystal:{name:'Crystal spire',w:28,h:24,elevation:0,solid:true},
 mushroom:{name:'Glow mushroom',w:28,h:20,elevation:0,solid:true},
 gear:{name:'Canal machinery',w:32,h:28,elevation:0,solid:true},
 bridge:{name:'Arched bridge',w:144,h:64,elevation:20,solid:false},
 fountain:{name:'Crystal fountain',w:40,h:36,elevation:4,solid:true},
 palm:{name:'Fan palm',w:24,h:20,elevation:0,solid:true},
 reeds:{name:'Water reeds',w:24,h:16,elevation:0,solid:false},
 lotus:{name:'Lotus cluster',w:28,h:20,elevation:0,solid:false},
 lily:{name:'Giant lily pad',w:40,h:28,elevation:0,solid:false},
 basin:{name:'Octagonal pool',w:96,h:72,elevation:6,solid:true},
 rock:{name:'Limestone rocks',w:32,h:24,elevation:0,solid:true}
};
export function makeGardenProp(kind,x,y){const d=gardenProps[kind];if(!d)throw Error('Unknown garden prop');return{id:crypto.randomUUID(),type:'prop',propKind:kind,name:d.name,x,y,w:d.w,h:d.h,elevation:d.elevation,solid:d.solid,depthOffset:0,visible:true,speed:0,health:1,damage:0,behavior:'stationary',spriteId:'',scale:1,rotation:0};}
export function gardenSurface(s,x,y){
 for(const e of s.entities||[])if(e.type==='prop'&&e.propKind==='bridge'&&e.visible!==false&&x>=e.x&&x<e.x+e.w&&y>=e.y+8&&y<e.y+e.h-8)return true;
 for(const l of s.layers||[])if([19,20,21].includes(l.tiles?.[Math.floor(x/16)+','+Math.floor(y/16)]))return true;
 return false;
}
export function gardenDepth(e){return e.y+(e.h||16)+(e.depthOffset||0);}
const hash=(x,y,n=0)=>{let v=(x*374761393+y*668265263+n*1442695041)|0;v=(v^(v>>>13))*1274126177;return((v^(v>>>16))>>>0)/4294967295;};
function rect(c,col,x,y,w,h){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
function oval(c,col,x,y,w,h){for(let j=0;j<h;j++){const q=Math.sqrt(Math.max(0,1-((j-h/2)/(h/2))**2))*w/2;rect(c,col,x+w/2-q,y+j,q*2,1);}}
function poly(c,col,points){c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
function line(c,col,x,y,xx,yy){const d=Math.max(Math.abs(xx-x),Math.abs(yy-y),1);for(let i=0;i<=d;i++)rect(c,col,x+(xx-x)*i/d,y+(yy-y)*i/d,1,1);}

export function drawGardenTile(c,id,x,y,time=0,neighbors={},settings={}){
 const p={...gardenColors,...settings};
 if(id===6){
  rect(c,p.water,x,y,16,16);
  for(let i=0;i<18;i++){const a=hash(x,y,i),b=hash(y,x,i+19);rect(c,i%3===0?p.deep:'#58b7bd',x+a*15,y+b*15,2+a*3,1); }
  const t=Math.floor(time*5);for(let i=0;i<4;i++){const xx=(i*7+x/16+t)%16,yy=(i*5+y/16+t)%16;rect(c,p.light,x+xx,y+yy,3,1);rect(c,'#69c5c9',x+xx+1,y+yy+1,1,2);}return;
 }
 if(id===19){
  rect(c,p.woodDark,x,y,16,16);
  for(let i=0;i<2;i++){rect(c,p.woodLight,x+i*8+1,y,7,1);rect(c,p.wood,x+i*8+1,y+1,6,14);rect(c,'#a77533',x+i*8+2,y+4,1,7);rect(c,'#765329',x+i*8+3,y+2,1,1);rect(c,'#765329',x+i*8+3,y+13,1,1);}
  if(!neighbors.bottom){rect(c,'#72522d',x,y+16,16,6);rect(c,p.woodDark,x,y+16,16,2);rect(c,'#2c8190',x+2,y+22,14,2);rect(c,'#9a8354',x+2,y+19,3,9);}
  if(!neighbors.left)rect(c,p.woodLight,x,y,1,16);
  return;
 }
 if(id===20){
  rect(c,p.leaf,x,y,16,16);for(let i=0;i<16;i++)rect(c,i%3?p.leafLight:p.leafDark,x+hash(x,y,i)*15,y+hash(y,x,i)*15,1,1);
  if(!neighbors.bottom){rect(c,'#96744a',x,y+16,16,5);rect(c,'#d4c393',x,y+16,16,1);rect(c,p.light,x,y+22,16,1);}
  return;
 }
 if(id===21){rect(c,p.stoneDark,x,y,16,16);rect(c,p.stone,x+1,y+1,14,13);rect(c,p.cream,x+1,y+1,14,1);rect(c,'#c1cabe',x+3,y+10,7,1);}
}

export function drawGardenProp(c,e,time=0,part='all',settings={}){
 const kind=e.propKind,x=e.x,y=e.y,w=e.w,h=e.h,z=e.elevation||0,p={...gardenTheme(e.packId),...settings};
 if(e.visible===false||e.dead)return;
 c.save();c.translate(Math.round(x),Math.round(y-(kind==='bridge'?0:z)));
 if(['tree','cactus','crystal','mushroom','gear'].includes(kind)){
  oval(c,p.deep,-3,h-5,w+6,10);
  if(kind==='tree'){rect(c,p.woodDark,w/2-4,h-36,8,36);for(const [xx,yy,ww,hh]of [[-12,-32,w+24,30],[-6,-48,w+12,30],[2,-58,w-4,24]]){oval(c,p.leafDark,xx,yy+3,ww,hh);oval(c,p.leaf,xx,yy,ww,hh-4);oval(c,p.leafLight,xx+5,yy+3,ww/2,hh/3);}}
  if(kind==='cactus'){rect(c,p.leafDark,8,-28,10,h+28);rect(c,p.leaf,9,-29,6,h+28);rect(c,p.leaf,0,-12,10,7);rect(c,p.leaf,0,-23,5,15);rect(c,p.leaf,16,-3,9,6);rect(c,p.leaf,21,-16,5,18);rect(c,p.pink,9,-32,6,4);}
  if(kind==='crystal'){poly(c,p.stoneDark,[[0,h],[4,-8],[w/2,-40],[w-4,-5],[w,h]]);poly(c,p.light,[[4,-8],[w/2,-40],[w/2,h],[0,h]]);poly(c,p.pink,[[w/2,-40],[w-4,-5],[w,h],[w/2,h]]);line(c,p.cream,w/2,-40,w/2,h);}
  if(kind==='mushroom'){rect(c,p.stoneDark,w/2-5,-12,10,h+12);rect(c,p.cream,w/2-4,-12,4,h+10);oval(c,p.deep,-8,-24,w+16,24);oval(c,p.pink,-8,-29,w+16,23);for(let i=0;i<5;i++)rect(c,p.cream,-2+i*7,-23+(i%2)*6,4,3);}
  if(kind==='gear'){rect(c,p.stoneDark,0,0,w,h);rect(c,p.wood,3,3,w-6,h-6);for(let i=0;i<8;i++){const a=i*Math.PI/4;rect(c,p.woodLight,w/2+Math.cos(a)*12-3,3+Math.sin(a)*12-3,6,6);}oval(c,p.woodDark,w/2-10,-7,20,20);oval(c,p.cream,w/2-4,-1,8,8);}
 }else if(kind==='bridge'){
  const arch=i=>Math.sin(i/w*Math.PI)*z;
  if(part!=='front'){
   oval(c,'#287887',-3,h+z-6,w+12,18);
   for(let i=0;i<w;i+=4){const a=arch(i);rect(c,'#9baeb0',i,8-a,4,h-16);rect(c,i%8===0?p.cream:p.stone,i+1,8-a,3,h-19);rect(c,'#a4b7b5',i,h-10-a,4,6);}
   for(let i=0;i<w;i+=12){const a=arch(i);rect(c,p.stoneDark,i,-10-a,5,24);rect(c,p.cream,i,-10-a,2,23);}
   for(let i=0;i<w;i++){const a=arch(i);rect(c,p.cream,i,-12-a,1,4);rect(c,'#b7c9c4',i,4-a,1,3);}
  }
  if(part!=='back'){
   for(let i=0;i<w;i+=12){const a=arch(i);rect(c,p.stoneDark,i,h-20-a,5,22);rect(c,p.cream,i,h-20-a,2,20);}
   for(let i=0;i<w;i++){const a=arch(i);rect(c,p.cream,i,h-22-a,1,4);rect(c,'#a5babc',i,h-a,1,5);rect(c,'#e8e8d5',i,h-1-a,1,2);}
   for(const i of [0,w-7]){rect(c,p.stoneDark,i,h-23,7,30);rect(c,p.cream,i-1,h-26,9,5);}
  }
 }else if(kind==='palm'){
  oval(c,'#276f65',-12,h-5,w+33,13);
  for(let j=0;j<35;j+=4){rect(c,j%8?'#aa8237':'#86612d',w/2-3+j/10,h-30+j,7,4);rect(c,'#caa054',w/2-2+j/10,h-30+j,2,2);}
  const cx=w/2,cy=h-36;
  for(let a=0;a<9;a++){const angle=a*Math.PI*2/9,dx=Math.cos(angle)*31,dy=Math.sin(angle)*19;
   poly(c,p.leafDark,[[cx,cy+3],[cx+dx*.6-dy*.24,cy+dy*.6+dx*.18],[cx+dx,cy+dy+7],[cx+dx*.55+dy*.25,cy+dy*.55-dx*.16]]);
   line(c,p.leaf,cx,cy,cx+dx*.9,cy+dy+3);line(c,p.leafLight,cx,cy-1,cx+dx*.55,cy+dy*.55);
  }oval(c,'#6aa93e',cx-7,cy-5,14,9);
 }else if(kind==='lily'||kind==='lotus'){
  const pad=(a,b,ww,hh)=>{oval(c,p.deep,a+2,b+3,ww,hh);oval(c,'#b3da58',a,b,ww,hh);oval(c,'#67b639',a+2,b+2,ww-4,hh-4);oval(c,'#8cc946',a+5,b+3,ww-11,hh-9);poly(c,p.water,[[a+ww/2,b+hh/2],[a+ww-3,b+hh],[a+ww-10,b+hh]]);};
  pad(0,0,w,h);
  if(kind==='lotus'){const cx=w*.55,cy=h*.2;for(let i=0;i<7;i++){const a=i*Math.PI*2/7;poly(c,i%2?'#ffd1d9':p.pink,[[cx,cy+3],[cx+Math.cos(a)*12,cy+Math.sin(a)*9-5],[cx+Math.cos(a+.4)*7,cy+Math.sin(a+.4)*5]]);}rect(c,'#fff2ac',cx-2,cy-2,4,3);}
 }else if(kind==='reeds'){
  for(let i=0;i<9;i++){const a=hash(x,y,i),xx=a*w;poly(c,i%2?p.leaf:p.leafDark,[[xx,h],[xx-6+a*12,h-20-a*17],[xx+3,h]]);line(c,p.leafLight,xx+1,h-2,xx-3+a*7,h-17-a*11);}
 }else if(kind==='fountain'||kind==='basin'){
  const oct=(col,xx,yy,ww,hh)=>poly(c,col,[[xx+ww*.23,yy],[xx+ww*.77,yy],[xx+ww,yy+hh*.25],[xx+ww,yy+hh*.75],[xx+ww*.77,yy+hh],[xx+ww*.23,yy+hh],[xx,yy+hh*.75],[xx,yy+hh*.25]]);
  oval(c,p.deep,-2,h-3,w+9,12);oct('#789ca2',0,7,w,h);oct('#bba77c',0,3,w,h);oct(p.cream,0,0,w,h);oct('#a9cbc4',4,3,w-8,h-6);oct('#51b9cd',7,5,w-14,h-10);
  for(let i=0;i<3;i++){const inset=8+i*5+Math.sin(time*2+i)*2;if(w>inset*2+4){c.strokeStyle=i%2?'#a1e4df':'#78d6e0';c.beginPath();c.ellipse(w/2,h/2,(w-inset*2)/2,(h-inset)/3,0,0,Math.PI*2);c.stroke();}}
  const cx=w/2,cy=h/2;rect(c,'#a6bcb7',cx-5,cy-13,10,17);rect(c,p.cream,cx-5,cy-13,3,17);
  oval(c,p.cream,cx-10,cy-15,20,7);oval(c,'#75d9e2',cx-8,cy-15,16,5);
  for(let i=0;i<7;i++){const dx=(i-3)*3,yy=cy-26+Math.abs(i-3)*2;line(c,i%2?'#c9f3e3':'#74daee',cx,cy-28,cx+dx,yy+5);line(c,'#7fd8de',cx+dx,yy+5,cx+dx*1.5,cy+4);rect(c,p.cream,cx+dx*1.5,cy+2+(Math.floor(time*8+i)%6),1,2);}
  oval(c,'#d7f6e9',cx-3,cy-30,6,5);
 }else{
  oval(c,p.deep,-2,h-3,w+5,8);poly(c,p.stoneDark,[[0,h*.6],[w*.15,3],[w*.7,0],[w,h*.5],[w*.85,h],[w*.1,h]]);
  poly(c,p.stone,[[2,h*.5],[w*.2,4],[w*.65,2],[w*.8,h*.5]]);line(c,p.cream,w*.2,4,w*.65,2);
 }
 c.restore();
}
