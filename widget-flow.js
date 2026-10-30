(function(){
  'use strict';
  const root=document.querySelector('.app-phone'),key='aiyong-theme-prototype-v1',removedId='board-reminder-list';
  let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){}
  const saved=stored.saved||{},installed=stored.installed||{},edits=stored.edits||{};
  const legacySavedItems=[
    {id:'peak',name:'峰峦守望',size:'2*2',type:'照片墙组件',image:'./assets/peak.png',words:'心有定力，步履从容'},
    {id:'ink',name:'山间寄语',size:'2*2',type:'照片墙组件',image:'./assets/ink.png',words:'所行皆坦途'},
    {id:'water',name:'流水生意',size:'2*4',type:'照片墙组件',image:'./assets/water.png',words:'好事缓缓而来'}
  ];
  const catalog=legacySavedItems.filter(w=>saved[w.id]||installed[w.id]);
  for(const item of Array.isArray(stored.extraCatalog)?stored.extraCatalog:[]){
    if(!item||item.id===removedId)continue;
    const index=catalog.findIndex(w=>w.id===item.id);if(index<0)catalog.push(item);else catalog[index]=item;
  }
  const hadRetiredData=Object.hasOwn(stored,'plans')||Boolean(saved[removedId]||installed[removedId]||edits[removedId])||(Array.isArray(stored.extraCatalog)&&stored.extraCatalog.some(w=>w?.id===removedId));
  delete saved[removedId];delete installed[removedId];delete edits[removedId];
  let queue=[],queueIndex=0,onReturn=null;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const widget=id=>catalog.find(w=>w.id===id);
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify({saved,installed,edits,extraCatalog:catalog}));return true;}catch(_){showToast('浏览器存储已满，本次修改仅在当前页面保留');return false;}};
  const art=w=>`<img class="fs-art" src="${esc(w.image)}" alt="${esc(w.name)}" />`;
  const head=title=>`<header class="fs-head"><button type="button" data-fs="back" aria-label="返回"><i data-lucide="chevron-left"></i></button><h2>${title}</h2><span></span></header>`;
  function page(name,body){
    let el=root.querySelector(`[data-app-page="${name}"]`);if(!el){el=document.createElement('section');el.className='app-page fs-page';el.dataset.appPage=name;root.append(el);}
    el.innerHTML=body;setAppPage(name);el.scrollTop=0;window.lucide?.createIcons();refreshAnnotations();
  }
  function mine(){setAppPage('mine');window.__themeWidgetFlow.refreshMine();}
  function back(){if(onReturn)onReturn();else mine();}
  function installPage(){
    const w=widget(queue[queueIndex]);if(!w){back();return;}
    page('fs-install',`${head('添加到桌面')}<div data-annotation-id="fs-install"><p class="fs-progress">安装进度 ${queueIndex+1} / ${queue.length}</p><div class="fs-step-track">${queue.map((_,i)=>`<i class="${i<=queueIndex?'active':''}"></i>`).join('')}</div><div class="fs-install-preview">${art(w)}</div><h3 class="fs-center">${esc(w.name)}</h3><p class="fs-center fs-muted">${w.size} · 已保存到我的组件</p><div class="fs-native-request"><strong>添加到主屏幕</strong><p>爱用小组件 · ${esc(w.name)}</p><div><button type="button" data-fs="cancel-install">取消</button><button type="button" data-fs="confirm-install">添加</button></div></div><p class="fs-annotation">批注：此处模拟系统添加流程；网页原型不会实际向系统桌面安装组件。</p><label class="fs-boundary"><input id="fsNoSpace" type="checkbox" />演示：桌面空间不足</label><button class="fs-link" data-fs="skip" type="button">暂不安装，继续下一款</button></div>`);
  }
  function nextInstall(){
    queueIndex++;
    if(queueIndex<queue.length){installPage();return;}
    page('fs-complete',`${head('添加流程已结束')}<div class="fs-success"><i data-lucide="check"></i></div><h3 class="fs-center">组件已保存</h3><p class="fs-center fs-muted">${queue.filter(id=>installed[id]).length} 款已演示安装</p><button class="fs-primary" data-fs="saved" type="button">查看我的组件</button><button class="fs-link" data-fs="back" type="button">返回</button>`);
  }
  function guide(){
    page('fs-guide',`${head('添加桌面指引')}<ol class="fs-guide-steps"><li><b>整理桌面空间</b><p>长按桌面空白处，移动图标或切换桌面页。</p></li><li><b>添加小组件</b><p>进入桌面“小组件”，找到“爱用小组件”，选择对应尺寸。</p></li><li><b>选择已保存的组件</b><p>选择刚刚保存的组件，按个人喜好调整位置。</p></li></ol><button class="fs-primary" data-fs="retry" type="button">返回继续添加</button><button class="fs-link" data-fs="saved" type="button">查看我的组件</button>`);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-fs]');if(!button)return;
    switch(button.dataset.fs){
      case 'single-install':queue=[button.dataset.id].filter(id=>widget(id));queueIndex=0;onReturn=null;installPage();break;
      case 'confirm-install':if(root.querySelector('#fsNoSpace')?.checked){guide();return;}if(widget(queue[queueIndex])){installed[queue[queueIndex]]=true;persist();nextInstall();}break;
      case 'cancel-install':back();showToast('已取消添加，组件保留在我的组件');break;
      case 'skip':nextInstall();break;
      case 'guide':guide();break;
      case 'retry':if(queueIndex<queue.length)installPage();else back();break;
      case 'saved':mine();break;
      case 'back':back();break;
      case 'delete-saved':if(confirm('从我的组件中删除？此操作不移除桌面已有组件。')){delete saved[button.dataset.id];persist();window.__themeWidgetFlow.refreshMine();}break;
    }
  });
  window.__themeWidgetFlow={
    get(id){const item=widget(id);return item?structuredClone(item):null;},
    getInstalling(){const item=widget(queue[queueIndex]);return item?structuredClone(item):null;},
    getSaved(){return Object.keys(saved).filter(id=>saved[id]&&widget(id)).map(id=>structuredClone(widget(id)));},
    getInstalled(){return Object.keys(installed).filter(id=>installed[id]&&widget(id)).map(id=>structuredClone(widget(id)));},
    setInstalled(id,value){if(!widget(id))return;installed[id]=!!value;if(value)saved[id]=true;persist();this.refreshMine();},
    register(items){items.filter(item=>item&&item.id!==removedId).forEach(item=>{const index=catalog.findIndex(w=>w.id===item.id);if(index<0)catalog.push(item);else catalog[index]=item;});},
    save(items){this.register(items);items.filter(item=>item&&item.id!==removedId).forEach(item=>saved[item.id]=true);persist();this.refreshMine();},
    update(id,values){const item=widget(id);if(!item)return false;this.register([{...item,...values,id}]);persist();this.refreshMine();return true;},
    refreshMine(){
      let host=root.querySelector('.fs-mine-energy');if(!host){host=document.createElement('div');host.className='fs-mine-energy fs-saved-list';root.querySelector('[data-app-page="mine"] .size-tabs').after(host);}
      host.innerHTML=this.getSaved().map(w=>`<div class="fs-component-row">${art(w)}<span><strong>${esc(w.name)}</strong><small>${esc(w.size)}</small><button type="button" class="fs-mini" data-fs="single-install" data-id="${esc(w.id)}">安装</button></span><button class="fs-delete" title="从我的组件删除" aria-label="删除${esc(w.name)}" data-fs="delete-saved" data-id="${esc(w.id)}" type="button"><i data-lucide="trash-2"></i></button></div>`).join('');window.lucide?.createIcons();
    },
    install(items,context,onBack){this.register(items);queue=items.map(w=>w.id).filter(id=>widget(id));queueIndex=0;onReturn=onBack||null;queue.forEach(id=>saved[id]=true);persist();installPage();}
  };
  // Retire scheme definitions without clearing saved widgets or desktop state.
  if(hadRetiredData)persist();
  window.__themeWidgetFlow.refreshMine();
  window.addEventListener('storage',event=>{if(event.key===key)showToast('组件数据已在其他窗口更新，刷新页面查看');});
})();
