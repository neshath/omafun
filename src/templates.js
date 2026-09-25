import {project,makeScene,initializeScene,entity,createRule} from './model.js';

/** Every template is an explicitly labeled original sample; empty projects stay empty. */
export function templateProject(type='platformer') {
 const p=project(true);p.name=type==='platformer'?'Moonfern · Sample':type==='topdown'?'Understone · Sample':type==='2.5d'?'Willowmere · Water World':'Nightwire · Sample';
 if(type==='platformer')return p;
 if(type==='2.5d'){
  const s=initializeScene(makeScene('Willowmere waters'));s.width=40;s.height=28;s.gameType='2.5d';s.biome='coast';s.camera={x:0,y:0,w:512,h:288};
  const water=s.layers.find(l=>l.id==='background').tiles,terrain=s.layers.find(l=>l.id==='terrain').tiles,details=s.layers.find(l=>l.id==='details').tiles;
  for(let x=0;x<s.width;x++)for(let y=0;y<s.height;y++)water[`${x},${y}`]=6;
  const paint=(x0,y0,x1,y1,id=2)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)terrain[`${x},${y}`]=id;};
  paint(0,0,2,27);paint(37,0,39,27);paint(3,5,12,8,17);paint(27,19,36,23,17);paint(10,13,29,15,2);paint(15,10,18,18,2);paint(4,24,11,26,17);paint(31,3,36,7,17);
  for(const [x,y,id] of [[5,4,18],[9,9,18],[12,7,10],[14,12,18],[20,12,10],[25,14,18],[29,18,10],[34,18,18],[33,8,10],[7,23,18],[30,22,18]])details[`${x},${y}`]=id;
  s.entities=[entity('player',176,208),entity('npc',288,192),entity('enemy',464,176),entity('enemy',496,320),entity('key',80,96),entity('door',560,48),entity('platform',224,224),entity('checkpoint',448,304)];
  const npc=s.entities.find(e=>e.type==='npc');npc.text='Welcome to Willowmere. Cross the bridge, explore the islands, and find the key.';
  const platform=s.entities.find(e=>e.type==='platform');platform.w=64;platform.h=8;platform.behavior='moving';platform.path=[{x:224,y:224},{x:352,y:224}];platform.speed=28;
  s.hud.objective='Cross the waterway and find the island key.';p.scenes=[s];return p;
 }
 const s=initializeScene(makeScene(type==='topdown'?'The lantern vault':'Nightwire arena'));
 s.width=32;s.height=24;s.gameType=type;s.biome=type==='topdown'?'temple':'city';
 const terrain=s.layers.find(l=>l.id==='terrain').tiles,details=s.layers.find(l=>l.id==='details').tiles;
 for(let x=0;x<32;x++)for(let y=0;y<24;y++){
  if(x===0||x===31||y===0||y===23||(x===16&&y>3&&y<19&&y!==11&&y!==12))terrain[`${x},${y}`]=3;
  if(x>1&&x<30&&y>1&&y<22&&(x%7===0&&y%6===0))details[`${x},${y}`]=8;
 }
 s.entities=[entity('player',48,160),entity('enemy',160,96),entity('enemy',360,220),entity('key',96,288),entity('door',456,64),entity('switch',208,176),entity('npc',64,80)];
 const door=s.entities.find(e=>e.type==='door');door.locked=true;door.keyId='vault-key';
 s.entities.find(e=>e.type==='key').keyId='vault-key';
 s.entities.find(e=>e.type==='npc').text='A lantern marks the way. Find the key, or activate the switch to open the vault.';
 const rule=createRule();Object.assign(rule,{name:'Switch opens the vault',sourceId:s.entities.find(e=>e.type==='switch').id,targetId:door.id});s.events.push(rule);
 if(type==='arcade'){s.entities.find(e=>e.type==='enemy').behavior='chasing';s.entities.push(entity('emitter',400,128));}
 s.hud.objective=type==='topdown'?'Open the lantern vault':'Find the exit. Watch the sentries.';
 p.scenes=[s];return p;
}
