import {gardenPacks} from './garden.js';
import {createPanels} from './editor-panels.js';
import {createMarketplace} from './marketplace-ui.js';
import {createEditorTools} from './editor-tools.js';
import {createGardenEditor} from './garden-editor.js';

export function mountWorkbench(api){
 const css=document.createElement('link');css.rel='stylesheet';css.href='workbench.css';document.head.append(css);
 const panels=createPanels(api),market=createMarketplace(api),editor=createEditorTools(api);
 const garden=createGardenEditor(api);
 const tabs=document.querySelector('.asset-tabs'),workspace=document.querySelector('.workspace');
 const inspect=document.createElement('button');inspect.textContent='◈ Inspector';inspect.className='mobile-inspector';inspect.setAttribute('aria-expanded','false');
 inspect.onclick=()=>{const open=document.body.classList.toggle('inspector-open');inspect.setAttribute('aria-expanded',String(open));};
 document.querySelector('.workspace-modes').append(inspect);
 const close=document.createElement('button');close.textContent='×';close.className='mobile-inspector';close.setAttribute('aria-label','Close inspector');
 close.onclick=()=>{document.body.classList.remove('inspector-open');inspect.setAttribute('aria-expanded','false');};
 document.querySelector('.inspector .panel-heading').append(close);
 for(const [id,label]of [['audio','♫ Audio'],['logic','⌘ Logic'],['market','✦ Market'],['garden','≋ Water']]){
  const button=document.createElement('button');button.dataset.tab=id;button.textContent=label;
  button.onclick=()=>api.setTab(id);tabs.insertBefore(button,document.querySelector('#collapse'));
 }
 return {...panels,...editor,renderGardenKit:garden.render,
  pointerDown(event,a,q){return garden.pointerDown(event,a,q)||editor.pointerDown(event,a,q);},
  renderAssets(tab){
   workspace.classList.toggle('market-mode',tab==='market');
   document.querySelector('.studio').classList.toggle('exchange-open',tab==='market');
   workspace.classList.toggle('expanded-assets',['garden','audio','logic','files','hud','collisions'].includes(tab));
   document.querySelector('#assets').className='asset-grid';
   if(tab==='market')return market.render();
   if(tab==='garden')return garden.render();
   return panels.renderAssets(tab);
  },
  completeTutorial(step){api.project.tutorial??=[];if(!api.project.tutorial.includes(step))api.project.tutorial.push(step);},
  touchAsset(id){api.project.recentAssets=[id,...api.project.recentAssets.filter(x=>x!==id)].slice(0,20);},
  assetFilter(asset,tab){return tab!=='tiles'||(!gardenPacks[api.scene.biome]&&![19,20,21].includes(asset.id));}
 };
}
