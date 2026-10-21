(function(){
  'use strict';
  const key='aiyong-energy-columns-v1';
  const materials=window.__energyMaterials;
  const initial={enabled:true,sort:100,columns:['wind','mountain','water','bamboo','gold','jade','fortune'].map((id,i)=>({...materials.categories().find(c=>c.id===id),enabled:true,sort:(i+1)*10}))};
  let state=initial;
  try{const data=JSON.parse(localStorage.getItem(key)||'null');if(data&&Array.isArray(data.columns))state={...initial,...data,columns:initial.columns.map(c=>({...c,...data.columns.find(s=>s.id===c.id),name:c.name}))};}catch(_){}
  const stamp=()=>new Date().toLocaleString('sv-SE');
  const sourceId=(column,id)=>'209200'+String(initial.columns.findIndex(c=>c.id===column)+1).padStart(2,'0')+String(materials.resources(column).findIndex(r=>r.id===id)+1).padStart(10,'0');
  function hydrateLinks(){
    state.links=state.links||{};
    initial.columns.forEach(c=>{if(!Array.isArray(state.links[c.id]))state.links[c.id]=materials.resources(c.id).map((r,i)=>({id:r.id,resourceId:'209100'+sourceId(c.id,r.id).slice(6),sort:(i+1)*10,enabled:true,updated:stamp()}));});
  }
  hydrateLinks();
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ordered=()=>[...state.columns].sort((a,b)=>a.sort-b.sort);
  const linked=column=>(state.links[column]||[]).filter(link=>materials.resources(column).some(r=>r.id===link.id)).map((link,index)=>({...materials.resources(column).find(r=>r.id===link.id),...link,index})).sort((a,b)=>a.sort-b.sort||a.index-b.index);
  function refreshGallery(){
    const grid=document.querySelector('.fs-summary-grid');if(!grid)return;
    ordered().forEach(c=>{const el=grid.querySelector(`[data-kind="${c.id}"]`);if(el){el.hidden=!window.__energyColumns.visible(c.id);grid.append(el);}});
  }
  const energyEnabled=()=>state.enabled&&window.__appSwitches?.showEnergy()!==false;
  window.__energyColumns={enabled:energyEnabled,visible:kind=>energyEnabled()&&!!state.columns.find(c=>c.id===kind)?.enabled&&linked(kind).some(r=>r.enabled),resourceIds:kind=>linked(kind).filter(r=>r.enabled).map(r=>r.id),refreshGallery};
  const screen=document.createElement('section');screen.className='screen fs-admin energy-columns';screen.dataset.screen='energy-columns';
  document.querySelector('.workspace').append(screen);
  const menu=document.querySelector('.sidebar nav button:nth-child(2)');
  let level='root',kind='',query={id:'',name:'',status:''};
  let resourceQuery={resourceId:'',tableId:'',name:''};
  let selectedResources=new Set();
  const previousColumns=[['我的',''],['动态壁纸','dynamic_wallpaper'],['静态壁纸','static_wallpaper'],['主题','theme_template'],['首页顶部banner','wallpaper_top_banner'],['首页顶部金刚区','wallpaper_top_category'],['开通页资源','open_page_resources'],['小组件',''],['挂件壁纸','hanging_wallpaper']];
  const rowId=id=>id==='energy'?'208900000000000001':'2089000000000000'+String(state.columns.findIndex(c=>c.id===id)+2).padStart(2,'0');
  function applyApp(){
    const enabled=energyEnabled();
    document.querySelector('.phone-shell').classList.toggle('energy-disabled',!enabled);
    const tab=document.querySelector('[data-current-tab="fengshui"]');tab.hidden=!enabled;
    if(!enabled){const active=document.querySelector('.app-page.active')?.dataset.appPage;if(active?.startsWith('fs-')||active==='themes')setAppPage('home');}
    window.dispatchEvent(new Event('energy-columns-changed'));
  }
  function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch(_){showToast('浏览器存储已满，本次修改仅在当前页面保留');}applyApp();}
  function open(){
    document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===menu));
    document.querySelector('.topbar h1').textContent='栏目管理';document.querySelector('.topbar p').textContent='小组件中台 / 栏目管理';document.querySelector('.top-actions').hidden=true;setScreen('energy-columns');
    render();
  }
  function status(enabled){return `<span class="${enabled?'fs-live':'energy-off'}">${enabled?'启用':'停用'}</span>`;}
  function columnRow(item,i,existing=false){
    const id=existing?'2088730000000000'+i:rowId(item.id);
    return `<tr><td>${i+1}</td><td>${id}</td><td>爱用小组件</td><td><b>${esc(item.name)}</b></td><td>—</td><td>${esc(item.binding||'')}</td><td>无封面</td><td>无图片</td><td>${level==='root'?'栏目':'桌面组件'}</td><td>${item.sort??i*10}</td><td>${status(item.enabled)}</td><td>${existing?'—':`<button class="text-link" data-ec="edit" data-id="${item.id}">编辑</button><button class="text-link" data-ec="next" data-id="${item.id}">${level==='root'?'下级':'查看'}</button>`}</td></tr>`;
  }
  function render(){
    const category=state.columns.find(c=>c.id===kind);
    const path=`<button class="text-link" data-ec="root">爱用小组件</button>${level!=='root'?'<span>/</span><button class="text-link" data-ec="children">能量组件</button>':''}${level==='resources'?`<span>/</span><span>${esc(category.name)}</span>`:''}`;
    const header=`<div class="energy-crumb">首页 / ${path}</div>`;
    if(level==='resources'){
      renderResources(header,category);return;
    }
    let rows=level==='root'?[...previousColumns.map(([name,binding],i)=>({id:'existing-'+i,name,binding,enabled:true,sort:i*10,existing:true})),{id:'energy',name:'能量组件',binding:'energy_widget',enabled:state.enabled,sort:state.sort}]:ordered();
    rows=rows.filter(r=>(!query.id||(r.existing?'2088730000000000'+previousColumns.findIndex(c=>c[0]===r.name):rowId(r.id)).includes(query.id))&&r.name.includes(query.name)&&(!query.status||String(r.enabled)===query.status));
    screen.innerHTML=`${header}<div class="fs-admin-heading"><h2>${level==='root'?'App 栏目':'能量组件 · 下级栏目'}</h2>${level!=='root'?'<button class="text-link" data-ec="root">返回上级</button>':''}</div><form class="energy-search" id="energyColumnSearch"><label>栏目 ID<input name="id" value="${esc(query.id)}" placeholder="请输入栏目 ID" /></label><label>栏目名称<input name="name" value="${esc(query.name)}" placeholder="请输入栏目名称" /></label><label>状态<select name="status"><option value="">全部</option><option value="true" ${query.status==='true'?'selected':''}>启用</option><option value="false" ${query.status==='false'?'selected':''}>停用</option></select></label><button class="primary" type="submit"><i data-lucide="search"></i>查询</button><button class="ghost" type="button" data-ec="reset"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="fs-table-wrap"><table class="fs-table energy-column-table"><thead><tr>${['序号','栏目 ID','应用编码','栏目名称','最小版本号','与前端约定参数','封面图','背景图','下级资源类型','排序','状态','操作'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>columnRow(r,i,r.existing)).join('')||'<tr><td colspan="12" class="fs-empty">暂无匹配栏目</td></tr>'}</tbody></table></div><p class="energy-count">共 ${rows.length} 条</p><p class="fs-annotation">批注：能量组件 → 栏目（竹、山、水等）→ 素材。能量组件启用时展示 App 能量入口，停用时隐藏；下级栏目停用后，App 不展示该类素材。原有栏目沿用现网功能。</p>`;
    window.lucide?.createIcons();refreshAnnotations();
  }
  const dialog=document.createElement('dialog');dialog.className='energy-edit-dialog';dialog.setAttribute('aria-labelledby','energyEditTitle');document.body.append(dialog);
  function renderResources(header,category){
    const all=linked(kind),defaultId=all.find(r=>r.enabled)?.id;
    const rows=all.filter(r=>r.resourceId.includes(resourceQuery.resourceId)&&sourceId(kind,r.id).includes(resourceQuery.tableId)&&(category.name+' · '+r.name).includes(resourceQuery.name));
    screen.innerHTML=`${header}<div class="fs-admin-heading"><h2>${esc(category.name)} · 栏目资源</h2><button class="text-link" data-ec="children">返回栏目</button></div><form class="energy-search" id="energyResourceSearch"><label>资源 ID<input name="resourceId" value="${esc(resourceQuery.resourceId)}" placeholder="请输入资源 ID" /></label><label>资源表 ID<input name="tableId" value="${esc(resourceQuery.tableId)}" placeholder="请输入资源表 ID" /></label><label>资源名称<input name="name" value="${esc(resourceQuery.name)}" placeholder="请输入资源名称" /></label><button type="submit" class="primary"><i data-lucide="search"></i>查询</button><button class="ghost" type="button" data-ec="reset-resources"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="energy-resource-actions"><button class="primary" data-ec="add-resources" type="button"><i data-lucide="plus"></i>添加资源</button><button class="ghost" data-ec="remove-selected" type="button" ${selectedResources.size?'':'disabled'}><i data-lucide="unlink"></i>解除关联</button><span>已选择 ${selectedResources.size} 项</span></div><div class="fs-table-wrap"><table class="fs-table energy-resource-table"><thead><tr><th><input type="checkbox" data-ec-check="all" aria-label="全选当前资源" ${rows.length&&rows.every(r=>selectedResources.has(r.id))?'checked':''} /></th>${['序号','资源 ID','资源名称','资源类型','资源表 ID','最小版本号','资源角标','封面图','尺寸','排序','状态','更新时间','操作'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr data-resource-id="${esc(r.id)}"><td><input type="checkbox" data-ec-check="resource" value="${esc(r.id)}" aria-label="选择${esc(r.name)}" ${selectedResources.has(r.id)?'checked':''} /></td><td>${i+1}</td><td>${esc(r.resourceId)}</td><td><b>${esc(category.name)} · ${esc(r.name)}</b>${r.id===defaultId?'<span class="energy-default">默认</span>':''}</td><td>桌面组件（2）</td><td>${sourceId(kind,r.id)}</td><td>—</td><td>${r.vip?'VIP':'—'}</td><td><img class="energy-resource-image" src="${esc(r.image)}" alt="${esc(r.name)}" /></td><td>2*2</td><td>${r.sort}</td><td>${status(r.enabled)}</td><td>${esc(r.updated)}</td><td><button class="text-link" data-ec="edit-resource" data-id="${esc(r.id)}">编辑</button><button class="fs-delete" data-ec="remove-resource" data-id="${esc(r.id)}">删除</button></td></tr>`).join('')||'<tr><td colspan="14" class="fs-empty">暂无关联资源</td></tr>'}</tbody></table></div><p class="energy-count">共 ${rows.length} 条</p><p class="fs-annotation">批注：在此关联已有组件。排序数字越小越靠前，相同排序按关联先后展示；排序最前的启用组件作为 App 端默认预览，停用及未关联组件不展示。用户已确认的个人图片优先保留。删除仅解除栏目关联，不删除组件本身。</p>`;
    window.lucide?.createIcons();refreshAnnotations();
  }
  function addResources(){
    const existing=new Set((state.links[kind]||[]).map(r=>r.id));
    dialog.classList.add('energy-associate-dialog');
    dialog.innerHTML=`<form id="energyResourceAdd"><header><h2 id="energyEditTitle">关联组件 · ${esc(state.columns.find(c=>c.id===kind).name)}</h2><button type="button" data-ec="close" aria-label="关闭"><i data-lucide="x"></i></button></header><label>组件名称<input id="energyAssociateSearch" placeholder="搜索组件名称" /></label><div class="energy-associate-list">${materials.resources(kind).map(r=>`<label data-associate-name="${esc(r.name)}"><input type="checkbox" name="components" value="${esc(r.id)}" ${existing.has(r.id)?'disabled':''} /><img src="${esc(r.image)}" alt="" /><span>${esc(r.name)}<small>${existing.has(r.id)?'已关联':r.vip?'会员用户':'所有用户'}</small></span></label>`).join('')}</div><p id="energyAssociateError" class="fs-annotation" role="alert"></p><footer><button class="primary" type="submit">确认关联</button></footer></form>`;
    window.lucide?.createIcons();dialog.showModal();
  }
  function editResource(id){
    const item=linked(kind).find(r=>r.id===id);
    dialog.classList.remove('energy-associate-dialog');
    dialog.innerHTML=`<form id="energyResourceEdit"><header><h2 id="energyEditTitle">编辑栏目资源</h2><button type="button" data-ec="close" aria-label="关闭"><i data-lucide="x"></i></button></header><input type="hidden" name="resource" value="${esc(id)}" /><label>资源名称<input value="${esc(item.name)}" readonly /></label><label>排序<input name="sort" type="number" min="0" max="999999" step="1" required value="${item.sort}" /></label><label>状态<select name="enabled"><option value="true" ${item.enabled?'selected':''}>启用</option><option value="false" ${!item.enabled?'selected':''}>停用</option></select></label><p class="fs-annotation">排序最前的启用组件为 App 默认展示组件。</p><footer><button class="primary" type="submit">保存</button></footer></form>`;
    window.lucide?.createIcons();dialog.showModal();
  }
  function removeResources(ids){
    if(!ids.length||!confirm('解除所选组件与此栏目的关联？组件本身及用户已保存的组件不会被删除。'))return;
    state.links[kind]=state.links[kind].filter(r=>!ids.includes(r.id));ids.forEach(id=>selectedResources.delete(id));persist();render();showToast('已解除关联');
  }
  function edit(id){
    dialog.classList.remove('energy-associate-dialog');
    const item=id==='energy'?{id,name:'能量组件',enabled:state.enabled,sort:state.sort}:state.columns.find(c=>c.id===id);
    dialog.innerHTML=`<form id="energyColumnEdit"><header><h2 id="energyEditTitle">编辑栏目</h2><button type="button" data-ec="close" aria-label="关闭"><i data-lucide="x"></i></button></header><input type="hidden" name="id" value="${item.id}" /><label>栏目名称<input value="${esc(item.name)}" readonly /></label><label>下级资源类型<input value="${id==='energy'?'栏目':'桌面组件'}" readonly /></label><label>排序<input name="sort" type="number" min="0" max="9999" step="1" required value="${item.sort}" /></label><label>状态<select name="enabled"><option value="true" ${item.enabled?'selected':''}>启用</option><option value="false" ${!item.enabled?'selected':''}>停用</option></select></label><p class="fs-annotation">${id==='energy'?'停用后，App 内不展示能量入口。':'停用后，App 内不展示该类素材。'}</p><footer><button class="primary" type="submit">保存</button></footer></form>`;
    window.lucide?.createIcons();dialog.showModal();
  }
  menu.addEventListener('click',()=>{level='root';query={id:'',name:'',status:''};open();});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-ec]');if(!b)return;
    switch(b.dataset.ec){
      case 'root':level='root';query={id:'',name:'',status:''};render();break;
      case 'children':level='children';query={id:'',name:'',status:''};render();break;
      case 'next':if(level==='root')level='children';else{level='resources';kind=b.dataset.id;resourceQuery={resourceId:'',tableId:'',name:''};selectedResources.clear();}query={id:'',name:'',status:''};render();break;
      case 'reset':query={id:'',name:'',status:''};render();break;
      case 'edit':edit(b.dataset.id);break;
      case 'close':dialog.close();break;
      case 'reset-resources':resourceQuery={resourceId:'',tableId:'',name:''};render();break;
      case 'add-resources':addResources();break;
      case 'edit-resource':editResource(b.dataset.id);break;
      case 'remove-resource':removeResources([b.dataset.id]);break;
      case 'remove-selected':removeResources([...selectedResources]);break;
    }
  });
  document.addEventListener('submit',e=>{
    if(e.target.matches('#energyResourceSearch')){e.preventDefault();resourceQuery=Object.fromEntries(new FormData(e.target));render();}
    if(e.target.matches('#energyResourceEdit')){
      e.preventDefault();const data=new FormData(e.target);Object.assign(state.links[kind].find(r=>r.id===data.get('resource')),{sort:Number(data.get('sort')),enabled:data.get('enabled')==='true',updated:stamp()});persist();dialog.close();render();showToast('资源已保存');
    }
    if(e.target.matches('#energyResourceAdd')){
      e.preventDefault();const ids=new FormData(e.target).getAll('components');
      if(!ids.length){document.querySelector('#energyAssociateError').textContent='请至少选择一个未关联组件';return;}
      let sort=Math.max(0,...state.links[kind].map(r=>r.sort));
      ids.forEach((id,i)=>{if(!materials.resources(kind).some(r=>r.id===id)||state.links[kind].some(r=>r.id===id))return;sort+=10;state.links[kind].push({id,resourceId:'2093'+String(Date.now())+i,sort,enabled:true,updated:stamp()});});
      persist();dialog.close();render();showToast('组件已关联');
    }
    if(e.target.matches('#energyColumnSearch')){e.preventDefault();const data=new FormData(e.target);query=Object.fromEntries(data);render();}
    if(e.target.matches('#energyColumnEdit')){
      e.preventDefault();const data=new FormData(e.target),id=data.get('id'),enabled=data.get('enabled')==='true',sort=Number(data.get('sort'));
      if(id==='energy'){state.enabled=enabled;state.sort=sort;}else Object.assign(state.columns.find(c=>c.id===id),{enabled,sort});
      persist();dialog.close();render();showToast('栏目已保存');
    }
  });
  document.addEventListener('change',e=>{
    const mode=e.target.dataset.ecCheck;if(!mode)return;
    if(mode==='resource'){if(e.target.checked)selectedResources.add(e.target.value);else selectedResources.delete(e.target.value);}
    else screen.querySelectorAll('[data-ec-check="resource"]').forEach(el=>{if(e.target.checked)selectedResources.add(el.value);else selectedResources.delete(el.value);});
    render();
  });
  document.addEventListener('input',e=>{if(e.target.id==='energyAssociateSearch')dialog.querySelectorAll('[data-associate-name]').forEach(el=>{el.hidden=!el.dataset.associateName.includes(e.target.value.trim());});});
  window.addEventListener('storage',e=>{if(e.key===key){try{const data=JSON.parse(e.newValue);if(data&&Array.isArray(data.columns)){state=data;hydrateLinks();applyApp();if(screen.classList.contains('active'))render();}}catch(_){}}});
  window.addEventListener('energy-columns-changed',refreshGallery);
  window.addEventListener('app-switches-changed',applyApp);
  applyApp();
})();
