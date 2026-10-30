(function(){
  'use strict';
  const flow=window.__themeWidgetFlow,key='aiyong-desktop-demo-v1',root=document.querySelector('.app-phone'),mine=root.querySelector('[data-app-page="mine"]');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>`<i data-lucide="${name}"></i>`;
  const sizes={small:{value:'2*2',label:'小号 2×2',w:2,h:2},medium:{value:'2*4',label:'中号 2×4',w:4,h:2},large:{value:'4*4',label:'大号 4×4',w:4,h:4}};
  function sizeOf(value){const size=String(value||'').replace(/[×xX\\\s]/g,'*').replace(/\*+/g,'*');return size==='4*4'?'large':['2*4','4*2'].includes(size)?'medium':'small';}
  const legacy=[{id:'board-demo-summer',name:'夏日贴纸组件',size:'2*4',type:'照片墙组件',image:'./assets/app-album.png',words:''},{id:'board-demo-battery',name:'摇摆爱心电量',size:'2*2',type:'电量组件',image:'./assets/app-battery.png',words:''}];
  flow.register(legacy);
  const source=id=>{const w=flow.get(id);return w?{...w,size:sizes[sizeOf(w.size)].value}:null;};
  const overlaps=(a,b)=>a.page===b.page&&a.col<b.col+b.w&&a.col+a.w>b.col&&a.row<b.row+b.h&&a.row+a.h>b.row;
  let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'{}');}catch(_){}
  let layout=[];
  for(const item of Array.isArray(stored.items)?stored.items:[]){const s=sizes[sizeOf(item.size)],entry={widgetId:String(item.widgetId),size:s.value,w:s.w,h:s.h,page:Number(item.page),row:Number(item.row),col:Number(item.col)};if(!source(entry.widgetId)||layout.some(i=>i.widgetId===entry.widgetId)||![entry.page,entry.row,entry.col].every(Number.isInteger)||entry.page<0||entry.page>99||entry.row<0||entry.row+entry.h>6||entry.col<0||entry.col+entry.w>4||layout.some(i=>overlaps(i,entry)))continue;layout.push(entry);}
  let pageIndex=0,editing=false,filter='all',pendingInstall='',continuePage='';
  const desktop=document.createElement('section');desktop.className='app-page desktop-demo-page';desktop.dataset.appPage='desktop-demo';root.append(desktop);
  const active=()=>desktop.classList.contains('active');
  function persist(items){try{localStorage.setItem(key,JSON.stringify({version:1,items}));layout=items;return true;}catch(_){showToast('桌面布局保存失败，请清理存储空间后重试');return false;}}
  if(Array.isArray(stored.items)&&stored.items.some(item=>item.widgetId==='board-reminder-list'))persist(layout);
  function place(widgetId){const old=layout.find(i=>i.widgetId===widgetId);if(old)return old;const w=source(widgetId);if(!w)return null;const size=sizes[sizeOf(w.size)],last=Math.max(0,...layout.map(i=>i.page));
    for(let page=0;page<=last+1&&page<100;page++)for(let row=0;row<=6-size.h;row++)for(let col=0;col<=4-size.w;col++){const item={widgetId,size:size.value,w:size.w,h:size.h,page,row,col};if(!layout.some(other=>overlaps(item,other))){if(persist([...layout,item]))return item;return null;}}
    showToast('模拟桌面已满，请移除部分组件');return null;
  }
  function install(widgetId){const item=place(widgetId);if(!item)return;flow.setInstalled(widgetId,true);pageIndex=item.page;editing=false;showDesktop();showToast('已安装到模拟桌面');}
  function showDesktop(){setAppPage('desktop-demo');renderDesktop();}
  function interactive(w){if(w.id.startsWith('board-checkin2-'))return {action:'checkin2',label:'点击续火花'};if(w.id.startsWith('board-pet-'))return {action:'pet',label:'和娃娃互动'};if(w.id.startsWith('board-water-'))return {action:'water',label:'喝一杯水'};if(w.id.startsWith('board-salary-'))return {action:'salary',label:'更新薪资'};if(w.id==='board-reminder-habit')return {action:'checkin',label:'今日打卡'};if(w.id.startsWith('board-monthly-'))return {action:'monthly',label:'今日月历打卡或撤销'};return null;}
  function renderDesktop(){if(!active())return;const pages=Math.max(1,...layout.map(i=>i.page+1));pageIndex=Math.min(Math.max(0,pageIndex),pages-1);
    desktop.innerHTML=`<header class="desktop-demo-head"><button type="button" data-desktop="mine" title="我的组件" aria-label="返回我的组件">${icon('chevron-left')}</button><h2>模拟桌面</h2>${continuePage?'<button type="button" class="desktop-continue" data-desktop="continue">继续添加</button>':''}<button type="button" data-desktop="edit" title="${editing?'完成':'管理桌面'}" aria-label="${editing?'完成桌面管理':'管理桌面'}">${icon(editing?'check':'settings-2')}</button><button type="button" data-desktop="mine" title="添加组件" aria-label="添加组件">${icon('plus')}</button></header><div class="desktop-demo-grid">${layout.filter(i=>i.page===pageIndex).map(item=>{const w=source(item.widgetId),hit=interactive(w);return `<div class="desktop-widget" data-desktop-widget="${esc(w.id)}" data-size="${item.size}" style="grid-column:${item.col+1}/span ${item.w};grid-row:${item.row+1}/span ${item.h}" aria-label="${esc(w.name)}，${sizes[sizeOf(item.size)].label}"><div class="desktop-widget-visual"><img src="${esc(w.image)}" alt="${esc(w.name)}" />${hit&&!editing?`<button type="button" class="desktop-widget-hit ${hit.action==='water'?'water-hit':''}" data-desktop="activate" data-id="${esc(w.id)}" data-widget-action="${hit.action}" title="${hit.label}" aria-label="${hit.label}"></button>`:''}</div><span class="desktop-widget-name" title="${esc(w.name)}">${esc(w.name)}</span>${editing?`<button type="button" class="desktop-widget-remove" data-desktop="remove" data-id="${esc(w.id)}" title="从桌面移除" aria-label="从桌面移除${esc(w.name)}">${icon('x')}</button>`:''}</div>`;}).join('')||'<p class="desktop-demo-empty">暂无桌面组件</p>'}</div><nav class="desktop-demo-pagination" aria-label="桌面分页">${Array.from({length:pages},(_,i)=>`<button type="button" data-desktop="page" data-page="${i}" aria-label="第${i+1}页桌面" aria-current="${i===pageIndex}"><i></i></button>`).join('')}</nav><div class="desktop-demo-dock" aria-hidden="true">${['phone','message-circle','camera','grid-2x2'].map(name=>`<span>${icon(name)}</span>`).join('')}</div>`;
    if(!editing)desktop.querySelectorAll('[data-desktop-widget]').forEach(el=>{const id=el.dataset.desktopWidget;if(!id.startsWith('board-todo-')||!window.__clockTodo)return;const component=id.slice('board-todo-'.length).split('--')[0];window.__clockTodo.profile(component).items.slice(0,4).forEach((item,i)=>el.querySelector('.desktop-widget-visual').insertAdjacentHTML('beforeend',`<button type="button" class="desktop-todo-hit" style="top:${20+i*13}%" data-desktop="todo-task" data-id="${esc(component)}" data-task="${esc(item.id)}" aria-label="${item.done?'撤销完成':'完成'}${esc(item.text)}" title="${esc(item.text)}"></button>`));});
    window.lucide?.createIcons();
  }
  const tabs=mine.querySelector('.size-tabs');tabs.innerHTML=`<button type="button" data-desktop-size="all" class="active">全部<small>所有尺寸</small></button>${Object.entries(sizes).map(([k,s])=>`<button type="button" data-desktop-size="${k}">${s.label.split(' ')[0]}<small>${s.label.split(' ')[1]}</small></button>`).join('')}`;
  const shortcut=document.createElement('button');shortcut.type='button';shortcut.className='desktop-mine-link';shortcut.dataset.desktop='view';shortcut.innerHTML=icon('panels-top-left')+'查看模拟桌面';mine.querySelector('header').after(shortcut);
  const empty=document.createElement('p');empty.className='desktop-size-empty';empty.hidden=true;mine.append(empty);
  mine.querySelectorAll('.my-list article').forEach((row,index)=>{const w=legacy[index];if(!w)return;row.dataset.legacyWidget=w.id;const cover=row.querySelector('.list-cover');cover.innerHTML=`<img src="${w.image}" alt="${w.name}" />`;const label=document.createElement('small');label.className='desktop-size-label';label.textContent=sizes[sizeOf(w.size)].label;row.querySelector('strong').after(label);const button=row.querySelector('[data-app-action="install"]');button.dataset.desktopInstall=w.id;button.textContent='安装到桌面';});
  function decorate(){
    root.querySelectorAll('.fs-component-row').forEach(row=>{const button=row.querySelector('[data-fs="single-install"]');if(!button)return;const w=source(button.dataset.id);if(!w)return;let label=row.querySelector('small');if(!label){label=document.createElement('small');row.querySelector('span')?.append(label);}if(label){const text=sizes[sizeOf(w.size)].label;if(label.textContent!==text)label.textContent=text;label.classList.add('desktop-size-label');}row.dataset.widgetSize=sizeOf(w.size);if(button.textContent!=='安装到桌面')button.textContent='安装到桌面';});
    const savedIds=new Set(flow.getSaved().map(w=>w.id));let count=0;
    mine.querySelectorAll('.fs-mine-energy .fs-component-row').forEach(row=>{row.hidden=filter!=='all'&&row.dataset.widgetSize!==filter;if(!row.hidden)count++;});
    mine.querySelectorAll('[data-legacy-widget]').forEach(row=>{const w=source(row.dataset.legacyWidget);row.hidden=savedIds.has(w.id)||(filter!=='all'&&sizeOf(w.size)!==filter);if(!row.hidden)count++;});
    empty.hidden=count>0;const text=filter==='all'?'暂无保存的组件':`暂无${sizes[filter].label.split(' ')[0]}组件`;if(empty.textContent!==text)empty.textContent=text;
    tabs.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.desktopSize===filter);b.setAttribute('aria-pressed',String(b.dataset.desktopSize===filter));});
  }
  const oldRefresh=flow.refreshMine;flow.refreshMine=function(){oldRefresh.call(this);decorate();};
  const oldRegister=flow.register;flow.register=function(items){oldRegister.call(this,items.map(w=>({...w,size:sizes[sizeOf(w.size)].value})));if(active())renderDesktop();};
  document.addEventListener('click',e=>{
    const size=e.target.closest('[data-desktop-size]');if(size){filter=size.dataset.desktopSize;decorate();return;}
    const originalInstall=e.target.closest('[data-fs="single-install"],[data-desktop-install]');
    if(originalInstall){e.preventDefault();e.stopImmediatePropagation();continuePage='';install(originalInstall.dataset.id||originalInstall.dataset.desktopInstall);return;}
    if(e.target.closest('[data-fs="confirm-install"]'))pendingInstall={id:flow.getInstalling()?.id,blocked:!!document.querySelector('#fsNoSpace')?.checked};
  },true);
  document.addEventListener('click',e=>{
    const original=e.target.closest('[data-fs="confirm-install"]');
    if(original&&pendingInstall){if(pendingInstall.id&&!pendingInstall.blocked){continuePage=root.querySelector('[data-app-page="fs-install"].active')?'fs-install':'';install(pendingInstall.id);}pendingInstall='';}
    const b=e.target.closest('[data-desktop]');if(!b)return;
    switch(b.dataset.desktop){
      case 'view':showDesktop();break;
      case 'mine':setAppPage('mine');flow.refreshMine();break;
      case 'continue':if(continuePage)setAppPage(continuePage);continuePage='';break;
      case 'edit':editing=!editing;renderDesktop();break;
      case 'page':pageIndex=Number(b.dataset.page);renderDesktop();break;
      case 'todo-task':window.__clockTodo?.toggleTask(b.dataset.id,b.dataset.task);renderDesktop();break;
      case 'remove':if(persist(layout.filter(i=>i.widgetId!==b.dataset.id))){flow.setInstalled(b.dataset.id,false);renderDesktop();showToast('已从模拟桌面移除，组件仍保留');}break;
      case 'activate':if(b.dataset.widgetAction==='checkin2')window.__sparkCheckin?.checkin(b.dataset.id.slice('board-checkin2-'.length));if(b.dataset.widgetAction==='pet')window.__desktopPet?.interact(b.dataset.id.slice('board-pet-'.length));if(b.dataset.widgetAction==='water'){const [base,format]=b.dataset.id.split('--');window.__waterComponent?.drink(base==='board-water-checkin'?window.__desktopComponents.waterDefaultId:base.slice('board-water-'.length),format==='2x4'?'2*4':'2*2');}if(b.dataset.widgetAction==='salary')window.__salaryComponent?.refresh(b.dataset.id==='board-salary-calculator'?window.__desktopComponents.salaryDefaultId:b.dataset.id.slice('board-salary-'.length));if(b.dataset.widgetAction==='checkin')window.__reminderComponents?.checkin();if(b.dataset.widgetAction==='monthly')window.__monthlyComponent?.checkin(b.dataset.id.slice('board-monthly-'.length));renderDesktop();break;
    }
  });
  const observer=new MutationObserver(()=>decorate());observer.observe(mine,{childList:true,subtree:true});
  const previousSetPage=window.setAppPage;window.setAppPage=function(name){previousSetPage(name);if(name==='mine')decorate();};
  for(const w of flow.getInstalled())place(w.id);
  flow.refreshMine();window.lucide?.createIcons();
  window.__desktopDemo={open:showDesktop,install,sizeOf,sizeLabel:value=>sizes[sizeOf(value)].label,getLayout:()=>structuredClone(layout)};
})();
