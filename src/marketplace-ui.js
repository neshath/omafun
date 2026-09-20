import {MarketLibrary,createListing,validateListing,fetchCatalog,fetchListing,forkListing,OPEN_LICENSES} from './market.js';
import {node,button,field,dialog} from './editor-panels.js';
import {drawScene} from './render.js';

export function createMarketplace(api){
 const library=new MarketLibrary();let remote=[],search='',catalogUrl='',filter='all',loading=false;
 const safe=fn=>async()=>{try{await fn();}catch(error){api.note(error.message,true);}};
 const listingUI=node('input');listingUI.type='file';listingUI.accept='.json,.pixel-market.json';listingUI.hidden=true;document.body.append(listingUI);
 listingUI.onchange=async()=>{const file=listingUI.files[0];if(!file)return;try{if(file.size>20_000_000)throw Error('Package exceeds 20 MB.');const item=library.import(JSON.parse(await file.text()));api.note(`Added ${item.name} to your local library.`);render();}catch(e){api.note(e.message,true);}listingUI.value='';};
 function showShare(){
  const p=api.project,m={name:p.share?.name||p.name,author:p.share?.author||'',description:p.share?.description||'',license:p.share?.license||p.upstream?.license||'MIT',sourceUrl:p.share?.sourceUrl||'',tags:p.share?.tags||''};
  const d=dialog('Share an open-source game');d.append(node('p','empty-copy','Every shared game includes its editable project, an open-source license, and a public source repository. Export a package, then submit it to a community catalog.'));
  for(const[key,label]of [['name','Title'],['author','Author'],['description','Description'],['sourceUrl','Public source repository'],['tags','Tags (comma separated)']])field(d,label,m[key],v=>m[key]=v,{maxLength:key==='description'?1000:200,multiline:key==='description',placeholder:key==='sourceUrl'?'https://github.com/you/your-game':''});
  field(d,'Open-source license',m.license,v=>m.license=v,{choices:OPEN_LICENSES});
  if(p.upstream)d.append(node('p','empty-copy',`Remixed from ${p.upstream.author} · ${p.upstream.license}. Preserve all original license notices when sharing.`));
  const status=node('p','form-status');status.setAttribute('role','status');d.append(status);
  d.append(button('↓ Export open-source package',()=>{try{
   if(p.upstream?.license==='GPL-3.0-only'&&m.license!=='GPL-3.0-only')throw Error('This remix must retain the original GPL-3.0-only license.');
   const listing=createListing(p,{...m,tags:m.tags.split(',').map(x=>x.trim()).filter(Boolean)});
   api.checkpoint();p.share={...m};api.changed();api.download(JSON.stringify(listing,null,2),m.name.replace(/[^a-z0-9]+/gi,'-')+'.pixel-market.json');
   library.import(listing);status.textContent='Package downloaded and saved to your library. It has not been published online.';api.note('Source-included game package exported.');render();
  }catch(e){status.textContent=e.message;}},'primary'));
  d.showModal();
 }
 async function connect(){
  if(!catalogUrl){api.note('Enter the HTTPS URL of a catalog JSON file.',true);return;}loading=true;render();
  try{remote=await fetchCatalog(catalogUrl);api.note(`Loaded ${remote.length} games from the public catalog.`);}catch(e){api.note(e.message,true);}finally{loading=false;render();}
 }
 function preview(item,origin){
  const card=node('article','market-card'),cover=document.createElement('canvas');cover.width=320;cover.height=144;cover.className='market-cover';
  if(item.project){const scene=item.project.scenes[item.project.activeScene],scale=Math.min(320/(scene.width*16),144/(scene.height*16));drawScene(cover.getContext('2d'),scene,{scale,width:320,height:144,assets:item.project.assets,customSprite:item.project.sprite});}
  else{const c=cover.getContext('2d');c.fillStyle='#192833';c.fillRect(0,0,320,144);c.fillStyle='#67c9bf';c.font='32px monospace';c.fillText('▦',140,70);c.font='10px monospace';c.fillText('PROJECT PREVIEW AFTER DOWNLOAD',62,110);}
  card.append(cover);const body=node('div','market-card-body'),meta=node('div','market-meta');meta.append(node('span','',origin==='local'?'YOUR LIBRARY':'PUBLIC CATALOG'),node('span','',item.license));body.append(meta,node('h3','',item.name),node('p','',item.description),node('small','',`By ${item.author}`));
  const actions=node('div','market-actions');actions.append(button('▶ Play',safe(async()=>{const full=await fetchListing(item);library.import(full);api.loadProject(forkListing(full));api.setTab('tiles');api.play();})),button('Fork in editor',safe(async()=>{const full=await fetchListing(item);library.import(full);api.loadProject(forkListing(full));api.setTab('tiles');api.note(`Created a new editable remix of ${item.name}.`);})));const link=node('a','','Source ↗');link.href=item.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';actions.append(link);body.append(actions);
  if(origin==='local')body.append(button('Remove from library',()=>{library.remove(item.id);api.note('Removed from the library. Use Undo removal to recover it.');render();},'quiet'));card.append(body);return card;
 }
 function render(){if(api.tab!=='market')return false;document.querySelector('.asset-filters').hidden=true;const host=document.querySelector('#assets');host.className='marketplace';host.replaceChildren();
  const top=node('div','market-header'),title=node('div');title.append(node('span','market-kicker','OMAFUN EXCHANGE'),node('h2','','Discover. Play. Make it yours.'),node('p','','Every shared world comes with its source.'));const actions=node('div','panel-actions');actions.append(button('↑ Import game',()=>listingUI.click()),button('Share your game',showShare,'primary'));top.append(title,actions);host.append(top);
  const bar=node('div','market-controls');const query=document.createElement('input');query.placeholder='Search games, creators, tags…';query.value=search;query.setAttribute('aria-label','Search marketplace');query.oninput=()=>{search=query.value;renderCards();};const select=document.createElement('select');for(const[k,t]of [['all','All games'],['local','Your library'],['remote','Public catalog']]){const o=node('option','',t);o.value=k;select.append(o);}select.value=filter;select.onchange=()=>{filter=select.value;renderCards();};const url=document.createElement('input');url.type='url';url.placeholder='https://…/catalog.json';url.value=catalogUrl;url.setAttribute('aria-label','Public catalog URL');url.onchange=()=>catalogUrl=url.value;const connectBtn=button(loading?'Connecting…':'Connect catalog',connect);connectBtn.disabled=loading;bar.append(query,select,url,connectBtn);host.append(bar);
  const grid=node('div','market-grid');host.append(grid);
  function renderCards(){grid.replaceChildren();let local=[];try{local=library.list();}catch(e){api.note(e.message,true);}
   const items=[...(filter!=='remote'?local.map(item=>({item,origin:'local'})):[]),...(filter!=='local'?remote.map(item=>({item,origin:'remote'})):[])].filter(({item},i,a)=>a.findIndex(x=>x.item.id===item.id)===i).filter(({item})=>`${item.name} ${item.author} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
   if(!items.length){const empty=node('div','market-empty');empty.append(node('strong','',search?'No games match this search.':'Your next adventure starts here.'),node('p','','Import a shared package or connect a public catalog. Community games appear only when they have been imported or fetched.'),button('Import a game package',()=>listingUI.click()));grid.append(empty);}else for(const {item,origin}of items)grid.append(preview(item,origin));}
  renderCards();const foot=node('div','market-footer');foot.append(node('span','','Open-source licenses required · Source included · Forks are editable'),button('Undo removal',()=>{library.undoRemove();render();},'quiet'));host.append(foot);return true;
 }
 return {render,showShare};
}
