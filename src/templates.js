import {makeGardenProp} from './garden.js';
import {project,makeScene,initializeScene,entity,createRule} from './model.js';

/** Every template is an explicitly labeled original sample; empty projects stay empty. */
export function templateProject(type='platformer') {
 const p=project(true);p.name=type==='platformer'?'Moonfern · Sample':type==='topdown'?'Understone · Sample':type==='2.5d'?'Willowmere · Water World':'Nightwire · Sample';
 if(type==='platformer')return p;
 if(type==='2.5d'){
  const s=initializeScene(makeScene('Willowmere · Lotus gardens'));s.width=32;s.height=36;s.gameType='2.5d';s.biome='watergarden';s.camera={x:0,y:160,w:480,h:320};
  s.garden={water:'#419baa',light:'#82d2cb',deep:'#267284',animate:true};
  const terrain=s.layers.find(l=>l.id==='terrain').tiles;
  const paint=(x0,y0,x1,y1,id=19)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)terrain[x+','+y]=id;};
  paint(1,1,13,3);paint(1,4,3,14);paint(26,0,29,14);paint(1,13,11,15);paint(20,13,29,15);
  paint(26,16,29,25);paint(10,23,13,35);paint(18,29,29,31);paint(26,26,29,35);paint(3,7,6,9);paint(21,20,24,22);
  for(let y=25;y<=32;y++)for(let x=2;x<=9;x++)if(((x-5.5)/4)**2+((y-28.5)/4.4)**2<1)terrain[x+','+y]=20;
  paint(6,24,10,25,21);paint(10,20,13,23,21);
  const props=[['bridge',176,200],['fountain',128,288],['fountain',336,288],['fountain',336,64],['basin',-24,288],['palm',64,464],['palm',96,432],['reeds',64,304],['reeds',320,72],['reeds',376,448],['lotus',190,305],['lotus',286,311],['lotus',98,496],['lotus',63,448],['lily',58,84],['lily',260,398],['lily',358,408],['lily',162,530],['rock',45,514],['reeds',400,536]];
  s.entities=props.map(([kind,x,y])=>makeGardenProp(kind,x,y));
  for(const [x,y]of [[92,179],[136,174],[313,157],[371,180],[155,345],[179,369],[276,342],[440,373],[51,405],[193,128],[332,449]]){const e=makeGardenProp('lily',x,y);e.w=14;e.h=9;s.entities.push(e);}
  const player=entity('player',64,216);player.speed=95;
  const npc=entity('npc',350,219);npc.text='Welcome to Lotus Gardens. Cross the limestone bridge and follow the boardwalk.';npc.behavior='stationary';
  s.entities.push(player,npc,entity('gem',235,224),entity('checkpoint',430,232),entity('door',442,510));
  s.hud.objective='Cross the bridge and follow the boardwalk to the garden gate.';p.name='Willowmere · Garden sample';p.scenes=[s];return p;
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
