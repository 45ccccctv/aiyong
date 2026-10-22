(function(){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const targets=['来电铃声','信息铃声','闹钟铃声','日历通知提醒','日历响铃提醒','通知铃声','联系人铃声'];
  const stamp=()=>new Date().toLocaleString('sv-SE');
  const seed=[
    ['breeze','山风轻响','万籁轻响，带来山间的清新',4680000],
    ['lucky','好运来电','把好心情，装进每一次来电',8950000],
    ['call','主人来电话了','轻快跳跃，不错过重要来电',10050000],
    ['energy','元气满满','清脆节拍，唤醒今天的好状态',4180000],
    ['bamboo','清风竹语','风过竹林，一声清亮的问候',3180000],
    ['soft','软萌提示音','小小提示，轻轻落在耳边',3020000],
    ['morning','晨光轻唤','伴着明亮音符，开启新的一天',530000],
    ['night','星河晚安','温柔的旋律，给日常留一份宁静',1920000]
  ].map(([id,name,description,playCount])=>({id:'ringtone-'+id,name,author:'爱用音频',description,playCount,audio:'./assets/ringtone-'+id+'.wav',fileName:name+'.wav',enabled:true,updated:stamp()}));
  let items=seed,search='',query={name:'',author:'',enabled:''};
  let column={enabled:true,sort:110,links:[]},resourceQuery={name:'',author:''},columnSaving=false;
  let draft=null,pendingFile=null,uploading=false,saving=false,editSession=0;
  let playingId=null,playingScope='app',playRequest=0,sheetItem=null,returnFocus=null;
  const audio=new Audio(),objectUrls=new Map();
  audio.preload='metadata';
  const dbPromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open('aiyong-ringtones-v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('state');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
  async function readState(key){const db=await dbPromise;return new Promise((resolve,reject)=>{const request=db.transaction('state').objectStore('state').get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  async function writeState(key,value){const db=await dbPromise;return new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite');tx.objectStore('state').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('保存失败'));});}
  const ready=(async()=>{
    try{
      const data=await readState('catalog');
      if(Array.isArray(data))items=data.map(({category,...item})=>({...item,playCount:item.playCount??null}));
      const savedColumn=await readState('column');
      if(savedColumn&&Array.isArray(savedColumn.links))column=savedColumn;
      else{
        column.links=items.map((item,index)=>({id:item.id,sort:(index+1)*10,enabled:true}));
        await writeState('column',column);
      }
    }catch(_){
      column.links=items.map((item,index)=>({id:item.id,sort:(index+1)*10,enabled:true}));
      showToast('铃声存储暂不可用，当前展示内置铃声');
    }
    applyColumn();
  })();
  const icons=()=>window.lucide?.createIcons();
  const phone=document.querySelector('.phone-shell');
  const homeTools=document.querySelector('.current-tools');
  homeTools.classList.add('has-ringtones');
  const entry=document.createElement('button');entry.type='button';entry.dataset.ring='open';entry.className='ringtone-home-entry';entry.dataset.annotationId='ringtone-entry';entry.innerHTML='<span class="ringtone-home-icon"><i data-lucide="bell-ring"></i></span><span>铃声</span>';homeTools.append(entry);
  const app=document.createElement('section');app.className='app-page ringtone-page';app.dataset.appPage='ringtones';document.querySelector('.app-phone').append(app);
  const player=document.createElement('div');player.className='ringtone-player';player.hidden=true;phone.append(player);
  const overlay=document.createElement('div');overlay.className='ringtone-overlay';overlay.hidden=true;phone.append(overlay);
  const menu=document.createElement('button');menu.type='button';menu.textContent='铃声提示音';menu.dataset.ringtoneMenu='true';document.querySelector('.sidebar nav').append(menu);
  const admin=document.createElement('section');admin.className='screen fs-admin ringtone-admin';admin.dataset.screen='ringtones';document.querySelector('.workspace').append(admin);
  const dialog=document.createElement('dialog');dialog.className='ringtone-admin-dialog';dialog.setAttribute('aria-labelledby','ringtoneEditTitle');document.body.append(dialog);
  const resourceScreen=document.createElement('section');resourceScreen.className='screen fs-admin ringtone-resources';resourceScreen.dataset.screen='ringtone-resources';document.querySelector('.workspace').append(resourceScreen);
  const columnDialog=document.createElement('dialog');columnDialog.className='energy-edit-dialog ringtone-column-dialog';columnDialog.setAttribute('aria-labelledby','ringtoneColumnTitle');document.body.append(columnDialog);
  const isAppActive=()=>app.classList.contains('active')&&document.querySelector('[data-demo-panel="app"]').classList.contains('active');
  const formatCount=n=>n>=100000000?+(n/100000000).toFixed(1)+'亿':n>=10000?+(n/10000).toFixed(1)+'万':String(n);
  const countText=n=>n==null?'—':n.toLocaleString('zh-CN');
  const linkedItems=()=>column.links.map((link,index)=>{const item=items.find(item=>item.id===link.id);return item?{...item,link,index}:null;}).filter(Boolean).sort((a,b)=>a.link.sort-b.link.sort||a.index-b.index);
  function audioUrl(item){
    if(typeof item.audio==='string')return item.audio;
    const cached=objectUrls.get(item.id);
    if(cached?.blob===item.audio)return cached.url;
    if(cached)URL.revokeObjectURL(cached.url);
    const url=URL.createObjectURL(item.audio);objectUrls.set(item.id,{blob:item.audio,url});return url;
  }
  function stop(){playRequest++;audio.pause();audio.currentTime=0;playingId=null;syncPlayback();}
  function syncPlayback(){
    const item=items.find(r=>r.id===playingId);
    document.querySelectorAll('[data-ring="preview"]').forEach(button=>{
      const selected=button.dataset.id===playingId&&!audio.paused;
      button.classList.toggle('is-playing',selected);button.setAttribute('aria-pressed',String(selected));
      if(button.dataset.adminPreview!==undefined)button.innerHTML=`<i data-lucide="${selected?'pause':'play'}"></i>${selected?'暂停':'试听'}`;
      else button.setAttribute('aria-label',(selected?'暂停':'试听')+'：'+(items.find(r=>r.id===button.dataset.id)?.name||''));
    });
    player.hidden=!item||!isAppActive()||playingScope!=='app';
    if(item)player.innerHTML=`<span class="ringtone-player-icon"><i data-lucide="audio-lines"></i></span><div><b>${esc(item.name)}</b><small>${esc(item.author)}</small></div><button type="button" data-ring="toggle-play" aria-label="${audio.paused?'继续播放':'暂停播放'}" title="${audio.paused?'播放':'暂停'}"><i data-lucide="${audio.paused?'play':'pause'}"></i></button><button type="button" data-ring="stop" aria-label="关闭播放" title="关闭"><i data-lucide="x"></i></button>`;
    app.classList.toggle('has-player',!player.hidden);icons();
  }
  async function preview(id,scope){
    const item=items.find(r=>r.id===id);if(!item)return;
    const request=++playRequest;
    if(playingId===id&&!audio.paused){audio.pause();syncPlayback();return;}
    if(playingId!==id){audio.pause();audio.src=audioUrl(item);}
    playingId=id;playingScope=scope;
    try{await audio.play();if(request===playRequest)syncPlayback();}
    catch(_){if(request===playRequest){stop();showToast('音频暂时无法播放，请在中台重新上传');}}
  }
  audio.addEventListener('ended',()=>{playingId=null;syncPlayback();});
  audio.addEventListener('pause',syncPlayback);
  function renderApp(){
    app.innerHTML=`<header class="ringtone-app-head"><button type="button" data-ring="back" aria-label="返回首页" title="返回"><i data-lucide="chevron-left"></i></button><h2>铃声</h2><button type="button" data-ring="search-toggle" aria-label="搜索铃声" title="搜索"><i data-lucide="search"></i></button></header><form class="ringtone-app-search" role="search" hidden><i data-lucide="search"></i><input type="search" aria-label="搜索铃声名称或作者" placeholder="搜索铃声、作者" value="${esc(search)}" /><button type="button" data-ring="search-clear" aria-label="清空搜索" title="清空"><i data-lucide="x"></i></button></form><div class="ringtone-app-list" data-annotation-id="ringtone-list"></div>`;
    renderAppList();icons();refreshAnnotations();
  }
  function renderAppList(){
    const list=column.enabled?linkedItems().filter(r=>r.enabled&&r.link.enabled&&(!search||[r.name,r.author].some(text=>text.toLowerCase().includes(search.toLowerCase())))):[];
    app.querySelector('.ringtone-app-list').innerHTML=list.map(item=>`<article class="ringtone-row"><button type="button" class="ringtone-preview" data-ring="preview" data-id="${esc(item.id)}" aria-label="试听：${esc(item.name)}"><span class="ringtone-title-line"><b title="${esc(item.name)}">${esc(item.name)}</b>${item.playCount==null?'':`<span class="ringtone-count" title="播放量 ${item.playCount}" aria-label="播放量 ${item.playCount}"><i data-lucide="play"></i>${formatCount(item.playCount)}</span>`}</span><span class="ringtone-subtitle" title="${esc(item.author+' | '+item.description)}">${esc(item.author)}<span> | </span>${esc(item.description)}</span></button><button type="button" class="ringtone-set" data-ring="set" data-id="${esc(item.id)}" aria-label="为${esc(item.name)}设置铃声">设置铃声</button></article>`).join('')||'<div class="ringtone-empty"><i data-lucide="music-2"></i><p>暂无铃声</p></div>';
    syncPlayback();
  }
  async function openApp(){await ready;if(!column.enabled)return;renderApp();setAppPage('ringtones');syncPlayback();app.scrollTop=0;}
  function closeSheet(){
    overlay.hidden=true;overlay.innerHTML='';app.removeAttribute('inert');player.removeAttribute('inert');
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;
  }
  function showSheet(id){
    const item=items.find(r=>r.id===id);if(!item)return;
    if(overlay.hidden)returnFocus=document.activeElement;
    sheetItem=item;app.setAttribute('inert','');player.setAttribute('inert','');overlay.hidden=false;
    const body=`<h3 id="ringtoneSheetTitle">设为</h3><div class="ringtone-targets">${targets.map(target=>`<button type="button" data-ring="assign" data-target="${target}">${target}</button>`).join('')}</div>`;
    overlay.innerHTML=`<section class="ringtone-sheet" role="dialog" aria-modal="true" aria-labelledby="ringtoneSheetTitle" data-annotation-id="ringtone-set-sheet">${body}<button class="ringtone-sheet-cancel" type="button" data-ring="sheet-close">取消</button></section>`;
    overlay.querySelector('button').focus({preventScroll:true});icons();refreshAnnotations();
  }
  function applyColumn(){
    entry.hidden=!column.enabled;homeTools.classList.toggle('has-ringtones',column.enabled);
    if(!column.enabled&&app.classList.contains('active')){closeSheet();setAppPage('home');}
    if(playingScope==='app'&&playingId&&!linkedItems().some(item=>column.enabled&&item.enabled&&item.link.enabled&&item.id===playingId))stop();
    if(app.querySelector('.ringtone-app-list'))renderAppList();
    window.__appColumns?.refresh();
  }
  async function openResources(){
    await ready;stop();resourceQuery={name:'',author:''};
    document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===document.querySelector('.sidebar nav button:nth-child(2)')));
    document.querySelector('.topbar h1').textContent='栏目管理';document.querySelector('.topbar p').textContent='小组件中台 / 栏目管理';document.querySelector('.top-actions').hidden=true;
    setScreen('ringtone-resources');renderResources();
  }
  function renderResources(){
    const list=linkedItems().filter(item=>item.name.includes(resourceQuery.name)&&item.author.includes(resourceQuery.author));
    resourceScreen.innerHTML=`<div class="energy-crumb">首页 / <button type="button" class="text-link" data-rcol="root">爱用小组件</button><span>/</span><span>铃声提示音</span></div><div class="fs-admin-heading"><h2>铃声提示音 · 栏目资源</h2><button type="button" class="text-link" data-rcol="root">返回上级</button></div><form class="energy-search" id="ringtoneResourceSearch"><label>名称<input name="name" placeholder="请输入铃声名称" value="${esc(resourceQuery.name)}" /></label><label>作者<input name="author" placeholder="请输入作者" value="${esc(resourceQuery.author)}" /></label><button type="submit" class="primary"><i data-lucide="search"></i>查询</button><button type="button" class="ghost" data-rcol="reset"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="energy-resource-actions"><button type="button" class="primary" data-rcol="associate"><i data-lucide="plus"></i>添加资源</button></div><div class="fs-table-wrap"><table class="fs-table ringtone-resource-table"><thead><tr>${['序号','资源 ID','名称','作者','播放量','排序','资源状态','关联状态','操作'].map(text=>`<th>${text}</th>`).join('')}</tr></thead><tbody>${list.map((item,index)=>`<tr data-ringtone-link="${esc(item.id)}"><td>${index+1}</td><td>${esc(item.id)}</td><td><b>${esc(item.name)}</b></td><td>${esc(item.author)}</td><td>${countText(item.playCount)}</td><td>${item.link.sort}</td><td><span class="${item.enabled?'fs-live':'energy-off'}">${item.enabled?'启用':'停用'}</span></td><td><span class="${item.link.enabled?'fs-live':'energy-off'}">${item.link.enabled?'启用':'停用'}</span></td><td class="ringtone-admin-actions"><button type="button" class="text-link ringtone-admin-preview" data-ring="preview" data-id="${esc(item.id)}" data-admin-preview><i data-lucide="play"></i>试听</button><button type="button" class="text-link" data-rcol="edit-link" data-id="${esc(item.id)}">编辑</button><button type="button" class="fs-delete" data-rcol="remove" data-id="${esc(item.id)}">解除关联</button></td></tr>`).join('')||'<tr><td colspan="9" class="fs-empty">暂无关联铃声</td></tr>'}</tbody></table></div><p class="energy-count">共 ${list.length} 条</p><p class="fs-annotation" data-annotation-id="ringtone-column">批注：直接关联铃声，不设置分类。栏目、铃声资源和关联均启用时，App 按排序值从小到大展示。解除关联不删除铃声；播放量非必填，未填写时不展示。</p>`;
    syncPlayback();refreshAnnotations();
  }
  function associationDialog(){
    const linked=new Set(column.links.map(link=>link.id));
    columnDialog.classList.add('energy-associate-dialog');
    columnDialog.innerHTML=`<form id="ringtoneAssociate"><header><h2 id="ringtoneColumnTitle">关联铃声</h2><button type="button" data-rcol="close" aria-label="关闭"><i data-lucide="x"></i></button></header><label>名称或作者<input id="ringtoneAssociateSearch" placeholder="搜索铃声名称或作者" /></label><div class="energy-associate-list ringtone-associate-list">${items.map(item=>`<label data-ringtone-associate-name="${esc(item.name+' '+item.author)}"><input type="checkbox" name="ringtones" value="${esc(item.id)}" ${linked.has(item.id)?'disabled':''} /><i data-lucide="music-2"></i><span>${esc(item.name)}<small>${esc(item.author)} · ${linked.has(item.id)?'已关联':item.enabled?'启用':'停用'}</small></span></label>`).join('')||'<p class="fs-empty">暂无可关联铃声</p>'}</div><p id="ringtoneColumnError" class="fs-annotation" role="alert"></p><footer><button type="submit" class="primary">确认关联</button></footer></form>`;
    icons();columnDialog.showModal();
  }
  function editLink(id){
    const item=items.find(item=>item.id===id),link=column.links.find(link=>link.id===id);if(!item||!link)return;
    columnDialog.classList.remove('energy-associate-dialog');
    columnDialog.innerHTML=`<form id="ringtoneLinkEdit"><header><h2 id="ringtoneColumnTitle">编辑栏目资源</h2><button type="button" data-rcol="close" aria-label="关闭"><i data-lucide="x"></i></button></header><input type="hidden" name="resource" value="${esc(id)}" /><label>名称<input value="${esc(item.name)}" readonly /></label><label>排序<input name="sort" type="number" min="0" max="999999" step="1" required value="${link.sort}" /></label><label>关联状态<select name="enabled"><option value="true" ${link.enabled?'selected':''}>启用</option><option value="false" ${!link.enabled?'selected':''}>停用</option></select></label><p id="ringtoneColumnError" class="fs-annotation" role="alert"></p><footer><button type="button" class="ghost" data-rcol="close">取消</button><button type="submit" class="primary">保存</button></footer></form>`;
    icons();columnDialog.showModal();
  }
  async function editColumn(){
    await ready;columnDialog.classList.remove('energy-associate-dialog');
    columnDialog.innerHTML=`<form id="ringtoneColumnEdit"><header><h2 id="ringtoneColumnTitle">编辑栏目</h2><button type="button" data-rcol="close" aria-label="关闭"><i data-lucide="x"></i></button></header><label>栏目名称<input value="铃声提示音" readonly /></label><label>下级资源类型<input value="铃声" readonly /></label><label>排序<input name="sort" type="number" min="0" max="9999" step="1" required value="${column.sort}" /></label><label>状态<select name="enabled"><option value="true" ${column.enabled?'selected':''}>启用</option><option value="false" ${!column.enabled?'selected':''}>停用</option></select></label><p class="fs-annotation">批注：停用后，首页不展示铃声入口。</p><p id="ringtoneColumnError" class="fs-annotation" role="alert"></p><footer><button type="button" class="ghost" data-rcol="close">取消</button><button type="submit" class="primary">保存</button></footer></form>`;
    icons();columnDialog.showModal();
  }
  async function saveColumn(next){
    await writeState('column',next);column=next;applyColumn();
    if(resourceScreen.classList.contains('active'))renderResources();
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-rcol]');if(!button)return;
    const action=button.dataset.rcol,id=button.dataset.id;
    if(action==='root')window.__appColumns.openRoot();
    if(action==='reset'){resourceQuery={name:'',author:''};renderResources();}
    if(action==='associate')associationDialog();
    if(action==='edit-link')editLink(id);
    if(action==='close'&&!columnSaving)columnDialog.close();
    if(action==='remove'&&confirm('解除这条铃声的栏目关联？铃声资源本身不会被删除。')){
      if(columnSaving)return;columnSaving=true;
      try{await saveColumn({...column,links:column.links.filter(link=>link.id!==id)});showToast('已解除关联');}
      catch(_){showToast('保存失败，原关联已保留');}
      finally{columnSaving=false;}
    }
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='ringtoneAssociateSearch')columnDialog.querySelectorAll('[data-ringtone-associate-name]').forEach(label=>{label.hidden=!label.dataset.ringtoneAssociateName.includes(event.target.value.trim());});
  });
  document.addEventListener('submit',async event=>{
    const form=event.target;
    if(form.id==='ringtoneResourceSearch'){event.preventDefault();resourceQuery=Object.fromEntries(new FormData(form));renderResources();return;}
    if(!['ringtoneAssociate','ringtoneLinkEdit','ringtoneColumnEdit'].includes(form.id))return;
    event.preventDefault();if(columnSaving)return;
    const data=new FormData(form);let next;
    if(form.id==='ringtoneAssociate'){
      const ids=data.getAll('ringtones').filter(id=>items.some(item=>item.id===id)&&!column.links.some(link=>link.id===id));
      if(!ids.length){form.querySelector('#ringtoneColumnError').textContent='请至少选择一条未关联铃声';return;}
      const lastSort=Math.max(0,...column.links.map(link=>link.sort));
      next={...column,links:[...column.links,...ids.map((id,index)=>({id,sort:lastSort+(index+1)*10,enabled:true}))]};
    }else{
      const sort=Number(data.get('sort'));if(!Number.isSafeInteger(sort)||sort<0)return;
      next=form.id==='ringtoneColumnEdit'?{...column,sort,enabled:data.get('enabled')==='true'}:{...column,links:column.links.map(link=>link.id===data.get('resource')?{...link,sort,enabled:data.get('enabled')==='true'}:link)};
    }
    columnSaving=true;form.querySelectorAll('button').forEach(button=>{button.disabled=true;});
    try{await saveColumn(next);columnDialog.close();showToast(form.id==='ringtoneAssociate'?'铃声已关联':'配置已保存');}
    catch(_){form.querySelector('#ringtoneColumnError').textContent='保存失败，请检查浏览器存储空间后重试';}
    finally{columnSaving=false;form.querySelectorAll('button').forEach(button=>{button.disabled=false;});}
  });
  columnDialog.addEventListener('cancel',event=>{if(columnSaving)event.preventDefault();});
  window.__appColumns.register({id:'208900000000000002',name:'铃声提示音',binding:'ringtone',resourceType:'铃声',get enabled(){return column.enabled;},get sort(){return column.sort;},openResources,editColumn});
  async function openAdmin(){await ready;stop();document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===menu));document.querySelector('.topbar h1').textContent='铃声提示音';document.querySelector('.topbar p').textContent='小组件中台 / 铃声提示音';document.querySelector('.top-actions').hidden=true;setScreen('ringtones');renderAdmin();}
  function renderAdmin(){
    const list=items.filter(r=>r.name.includes(query.name)&&r.author.includes(query.author)&&(!query.enabled||String(r.enabled)===query.enabled));
    admin.innerHTML=`<div class="ringtone-admin-heading"><h2>铃声列表</h2><button type="button" class="primary" data-ring="new"><i data-lucide="plus"></i>新增铃声</button></div><form class="energy-search" id="ringtoneSearch"><label>名称<input name="name" placeholder="请输入铃声名称" value="${esc(query.name)}" /></label><label>作者<input name="author" placeholder="请输入作者" value="${esc(query.author)}" /></label><label>状态<select name="enabled"><option value="">全部</option><option value="true" ${query.enabled==='true'?'selected':''}>启用</option><option value="false" ${query.enabled==='false'?'selected':''}>停用</option></select></label><button type="submit" class="primary"><i data-lucide="search"></i>查询</button><button type="button" class="ghost" data-ring="reset"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="fs-table-wrap"><table class="fs-table ringtone-table"><thead><tr>${['序号','名称','作者','描述','播放量','音频','状态','更新时间','操作'].map(text=>`<th>${text}</th>`).join('')}</tr></thead><tbody>${list.map((item,i)=>`<tr data-ringtone-id="${esc(item.id)}"><td>${i+1}</td><td><b>${esc(item.name)}</b></td><td>${esc(item.author)}</td><td class="ringtone-description-cell">${esc(item.description)}</td><td>${countText(item.playCount)}</td><td><button type="button" class="text-link ringtone-admin-preview" data-ring="preview" data-id="${esc(item.id)}" data-admin-preview><i data-lucide="play"></i>试听</button></td><td><span class="${item.enabled?'fs-live':'energy-off'}">${item.enabled?'启用':'停用'}</span></td><td>${esc(item.updated)}</td><td class="ringtone-admin-actions"><button type="button" class="text-link" data-ring="edit" data-id="${esc(item.id)}">编辑</button><button type="button" class="text-link" data-ring="toggle" data-id="${esc(item.id)}">${item.enabled?'停用':'启用'}</button><button type="button" class="fs-delete" data-ring="delete" data-id="${esc(item.id)}">删除</button></td></tr>`).join('')||'<tr><td colspan="9" class="fs-empty">暂无铃声</td></tr>'}</tbody></table></div><p class="energy-count">共 ${list.length} 条</p><p class="fs-annotation" data-annotation-id="ringtone-admin">批注：铃声在栏目管理中关联，资源与关联均启用时在 App 展示。播放量非必填，由运营手动填写，试听不自动累加；未填写时 App 不展示播放量。内置音频为演示提示音，原型不实际修改系统铃声。</p>`;
    syncPlayback();refreshAnnotations();
  }
  function edit(id){
    stop();editSession++;pendingFile=null;uploading=false;saving=false;
    draft=items.find(r=>r.id===id)||{id:'ringtone-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:'',author:'',description:'',playCount:null,audio:null,fileName:'',enabled:true};
    dialog.innerHTML=`<form id="ringtoneEdit"><header><h2 id="ringtoneEditTitle">${id?'编辑':'新增'}铃声</h2><button type="button" data-ring="edit-close" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button></header><div class="ringtone-edit-body"><label for="ringtoneName"><em>*</em>名称<input id="ringtoneName" name="name" placeholder="请输入铃声名称" maxlength="60" required value="${esc(draft.name)}" /></label><label for="ringtoneAuthor"><em>*</em>作者<input id="ringtoneAuthor" name="author" placeholder="请输入作者" maxlength="40" required value="${esc(draft.author)}" /></label><label class="ringtone-form-wide" for="ringtoneDescription"><em>*</em>描述<textarea id="ringtoneDescription" name="description" placeholder="请输入铃声描述" maxlength="200" required rows="3">${esc(draft.description)}</textarea></label><label for="ringtonePlayCount">播放量<input id="ringtonePlayCount" name="playCount" type="number" min="0" max="9007199254740991" step="1" placeholder="选填，请输入播放量" value="${draft.playCount??''}" /><small class="fs-annotation">非必填；运营自定义数字，试听不自动累加。</small></label><label for="ringtoneEnabled">状态<select id="ringtoneEnabled" name="enabled"><option value="true" ${draft.enabled?'selected':''}>启用</option><option value="false" ${!draft.enabled?'selected':''}>停用</option></select></label><div class="ringtone-form-wide ringtone-upload-field"><label for="ringtoneAudio"><em>*</em>铃声音频</label><label class="ringtone-upload" for="ringtoneAudio"><i data-lucide="upload"></i><span>${draft.audio?'替换音频':'上传音频'}</span><input id="ringtoneAudio" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac" /></label><p class="ringtone-file-name" id="ringtoneFileName">${esc(draft.fileName||'未上传音频')}</p><small>支持 MP3、WAV、OGG、M4A 等音频，单个不超过 10MB</small></div><p class="ringtone-edit-error ringtone-form-wide" id="ringtoneError" role="alert" hidden></p></div><footer><button type="button" class="ghost" data-ring="edit-close">取消</button><button type="submit" class="primary">保存</button></footer></form>`;
    icons();dialog.showModal();
  }
  function showError(text){const error=dialog.querySelector('#ringtoneError');error.textContent=text;error.hidden=false;}
  function updateSaveButton(){dialog.querySelector('button[type="submit"]').disabled=uploading||saving;dialog.querySelector('button[type="submit"]').textContent=uploading?'音频校验中…':saving?'保存中…':'保存';}
  async function validateAudio(file){
    if(file.size>10*1024*1024)throw new Error('请上传 10MB 以内的音频文件');
    if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name))throw new Error('请选择有效的音频文件');
    const url=URL.createObjectURL(file),test=new Audio();test.preload='metadata';
    try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{test.src='';reject(new Error('音频读取超时，请重新选择'));},8000);test.onloadedmetadata=()=>{clearTimeout(timer);resolve();};test.onerror=()=>{clearTimeout(timer);reject(new Error('浏览器无法播放此音频，请使用 MP3 或 WAV'));};test.src=url;});}
    finally{test.src='';URL.revokeObjectURL(url);}
  }
  async function persist(next){await writeState('catalog',next);items=next;applyColumn();renderAdmin();if(resourceScreen.classList.contains('active'))renderResources();}
  async function changeItem(id,remove){
    const item=items.find(r=>r.id===id);if(!item)return;
    if(remove&&!confirm('删除“'+item.name+'”？删除后 App 不再展示该铃声。'))return;
    const next=remove?items.filter(r=>r.id!==id):items.map(r=>r.id===id?{...r,enabled:!r.enabled,updated:stamp()}:r);
    try{await persist(next);if(playingId===id)stop();showToast(remove?'铃声已删除':item.enabled?'铃声已停用':'铃声已启用');}
    catch(_){showToast('保存失败，原数据已保留，请重试');}
  }
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-ring]');
    if(!button)return;
    const action=button.dataset.ring,id=button.dataset.id;
    if(action==='open')await openApp();
    if(action==='back'){stop();closeSheet();setAppPage('home');}
    if(action==='search-toggle'){const form=app.querySelector('.ringtone-app-search');form.hidden=!form.hidden;if(!form.hidden)form.querySelector('input').focus();else if(search){search='';form.querySelector('input').value='';renderAppList();}}
    if(action==='search-clear'){search='';app.querySelector('input[type="search"]').value='';renderAppList();}
    if(action==='preview')await preview(id,button.dataset.adminPreview!==undefined?'admin':'app');
    if(action==='toggle-play')await preview(playingId,'app');
    if(action==='stop')stop();
    if(action==='set')showSheet(id);
    if(action==='sheet-close')closeSheet();
    if(action==='assign'){
      const item=sheetItem,target=button.dataset.target;button.disabled=true;
      try{const settings=await readState('assigned')||{};await writeState('assigned',{...settings,[target]:item.id});closeSheet();showToast('已模拟将“'+item.name+'”设为'+target);}
      catch(_){button.disabled=false;showToast('设置未保存，请重试');}
    }
    if(action==='new')edit();
    if(action==='edit')edit(id);
    if(action==='edit-close'&&!saving){editSession++;dialog.close();}
    if(action==='reset'){query={name:'',author:'',enabled:''};renderAdmin();}
    if(action==='toggle'||action==='delete')await changeItem(id,action==='delete');
  });
  document.addEventListener('input',event=>{if(event.target.matches('.ringtone-app-search input')){search=event.target.value.trim();renderAppList();}});
  document.addEventListener('change',async event=>{
    if(event.target.id!=='ringtoneAudio')return;
    const file=event.target.files[0];if(!file)return;
    const session=editSession;uploading=true;updateSaveButton();
    try{await validateAudio(file);if(session!==editSession)return;pendingFile=file;dialog.querySelector('#ringtoneFileName').textContent=file.name;dialog.querySelector('#ringtoneError').hidden=true;}
    catch(error){if(session===editSession){pendingFile=null;event.target.value='';dialog.querySelector('#ringtoneFileName').textContent=draft.fileName||'未上传音频';showError(error.message);}}
    finally{if(session===editSession){uploading=false;updateSaveButton();}}
  });
  document.addEventListener('submit',async event=>{
    if(event.target.matches('.ringtone-app-search')){event.preventDefault();renderAppList();}
    if(event.target.id==='ringtoneSearch'){event.preventDefault();query=Object.fromEntries(new FormData(event.target));renderAdmin();}
    if(event.target.id!=='ringtoneEdit')return;
    event.preventDefault();if(uploading||saving)return;
    const data=new FormData(event.target),name=String(data.get('name')).trim(),author=String(data.get('author')).trim(),description=String(data.get('description')).trim(),rawCount=String(data.get('playCount')).trim(),playCount=rawCount===''?null:Number(rawCount);
    if(!name||!author||!description){showError('请填写名称、作者和描述');return;}
    if(playCount!==null&&(!Number.isSafeInteger(playCount)||playCount<0)){showError('播放量须为不小于 0 的整数，或留空');return;}
    if(!pendingFile&&!draft.audio){showError('请上传铃声音频');return;}
    const item={...draft,name,author,description,playCount,enabled:data.get('enabled')==='true',audio:pendingFile||draft.audio,fileName:pendingFile?.name||draft.fileName,updated:stamp()};
    const next=items.some(r=>r.id===item.id)?items.map(r=>r.id===item.id?item:r):[...items,item];
    saving=true;updateSaveButton();
    try{await persist(next);editSession++;dialog.close();showToast('铃声已保存');}
    catch(_){showError('保存失败，请检查浏览器存储空间后重试，当前表单已保留');}
    finally{saving=false;if(dialog.open)updateSaveButton();}
  });
  overlay.addEventListener('click',event=>{if(event.target===overlay)closeSheet();});
  document.addEventListener('keydown',event=>{
    if(overlay.hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeSheet();}
    if(event.key==='Tab'){
      const controls=[...overlay.querySelectorAll('button:not(:disabled),a[href]')],index=controls.indexOf(document.activeElement);
      if(event.shiftKey&&index<=0){event.preventDefault();controls.at(-1).focus();}
      else if(!event.shiftKey&&index===controls.length-1){event.preventDefault();controls[0].focus();}
    }
  });
  dialog.addEventListener('cancel',event=>{if(saving)event.preventDefault();else editSession++;});
  menu.addEventListener('click',openAdmin);
  document.querySelector('.sidebar nav').addEventListener('click',event=>{if(event.target.closest('button')!==menu){menu.classList.remove('active');if(playingScope==='admin')stop();}});
  const setPage=window.setAppPage;
  window.setAppPage=function(name){setPage(name);if(name!=='ringtones'&&playingScope==='app'){stop();closeSheet();}syncPlayback();};
  document.addEventListener('click',event=>{if(event.target.closest('[data-demo-view]')){stop();closeSheet();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  icons();
})();
