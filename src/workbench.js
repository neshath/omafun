import {createPanels} from './editor-panels.js';
import {createMarketplace} from './marketplace-ui.js';
import {createEditorTools} from './editor-tools.js';

export function mountWorkbench(api){
 const css=document.createElement('link');css.rel='stylesheet';css.href='workbench.css';document.head.append(css);
 const panels=createPanels(api),market=createMarketplace(api),editor=createEditorTools(api);
 const tabs=document.querySelector('.asset-tabs'),workspace=document.querySelector('.workspace');
 const inspect=document.createElement('button');inspect.textContent='◈ Inspector';inspect.className='mobile-inspector';inspect.setAttribute('aria-expanded','false');
 inspect.onclick=()=>{const open=document.body.classList.toggle('inspector-open');inspect.setAttribute('aria-expanded',String(open));};
 document.querySelector('.workspace-modes').append(inspect);
 const close=document.createElement('button');close.textContent='×';close.className='mobile-inspector';close.setAttribute('aria-label','Close inspector');
 close.onclick=()=>{document.body.classList.remove('inspector-open');inspect.setAttribute('aria-expanded','false');};
 document.querySelector('.inspector .panel-heading').append(close);
 for(const [id,label]of [['logic','⌘ Logic'],['market','✦ Market']]){
  const button=document.createElement('button');button.dataset.tab=id;button.textContent=label;
  button.onclick=()=>api.setTab(id);tabs.insertBefore(button,document.querySelector('#collapse'));
 }
 return {...panels,...editor,
  renderAssets(tab){
   workspace.classList.toggle('market-mode',tab==='market');
   document.querySelector('.studio').classList.toggle('exchange-open',tab==='market');
   workspace.classList.toggle('expanded-assets',['logic','files','hud','collisions'].includes(tab));
   document.querySelector('#assets').className='asset-grid';
   if(tab==='market')return market.render();
   return panels.renderAssets(tab);
  },
  completeTutorial(step){api.project.tutorial??=[];if(!api.project.tutorial.includes(step))api.project.tutorial.push(step);},
  touchAsset(id){api.project.recentAssets=[id,...api.project.recentAssets.filter(x=>x!==id)].slice(0,20);},
  assetFilter(){return true;}
 };
}
