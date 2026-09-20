import {project,makeScene,initializeScene,entity,createRule} from './model.js';

/** Every template is an explicitly labeled original sample; empty projects stay empty. */
export function templateProject(type='platformer') {
 const p=project(true);p.name=type==='platformer'?'Moonfern · Sample':type==='topdown'?'Understone · Sample':'Nightwire · Sample';
 if(type==='platformer')return p;
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
