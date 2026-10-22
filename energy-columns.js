(function(){
  'use strict';
  const key='aiyong-energy-columns-v1',materials=window.__desktopComponents;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stamp=()=>new Date().toLocaleString('sv-SE');
  const elementOrder=['wind','mountain','water','bamboo','gold','jade','fortune','ingot','gourd','abacus','seal','lotus'];
  const makeLink=(r,i)=>({id:r.id,resourceId:'209100'+r.id.slice(6),sort:(i+1)*10,enabled:true,updated:stamp()});
  function restore(data){
    const ordered=materials.resources().sort((a,b)=>(elementOrder.indexOf(a.kind)<0?99:elementOrder.indexOf(a.kind))-(elementOrder.indexOf(b.kind)<0?99:elementOrder.indexOf(b.kind)));
    const base={enabled:true,sort:100,modelVersion:3,referenceVersion:1,resources:ordered.map(makeLink)};
    if(!data)return base;
    base.enabled=data.enabled!==false;base.sort=data.sort??100;
    if(data.modelVersion===3&&Array.isArray(data.resources)){
      base.resources=[...data.resources];
      if(!data.referenceVersion){
        const added=ordered.filter(r=>['ingot','gourd','abacus','seal','lotus'].includes(r.kind)&&!base.resources.some(link=>link.id===r.id));
        const lastSort=Math.max(0,...base.resources.map(link=>Number(link.sort)||0));
        base.resources.push(...added.map((r,i)=>({...makeLink(r,i),sort:lastSort+(i+1)*10})));
      }
      return base;
    }
    const columns=Array.isArray(data.columns)?[...data.columns].sort((a,b)=>a.sort-b.sort):materials.categories();
    const seen=new Set(),merged=[];
    columns.forEach(column=>{
      const source=materials.resources(column.id),old=data.links?.[column.id];
      let links;
      if(!Array.isArray(old))links=source.map(makeLink);
      else if(data.modelVersion===2)links=old;
      else links=old.length&&source.length?[{...old[0],id:source[0].id,enabled:old.some(r=>r.enabled)}]:[];
      [...links].sort((a,b)=>a.sort-b.sort).forEach(link=>{if(!seen.has(link.id)){seen.add(link.id);merged.push({...link,enabled:link.enabled!==false&&column.enabled!==false,sort:(merged.length+1)*10});}});
    });
    ordered.filter(r=>['ingot','gourd','abacus','seal','lotus'].includes(r.kind)&&!seen.has(r.id)).forEach(r=>merged.push(makeLink(r,merged.length)));
    base.resources=merged;return base;
  }
  let stored=null;try{stored=JSON.parse(localStorage.getItem(key)||'null');}catch(_){}
  let state=restore(stored);
  try{localStorage.setItem(key,JSON.stringify(state));}catch(_){}
  const linked=()=>state.resources.map((link,index)=>{const component=materials.resources().find(r=>r.id===link.id);return component?{...component,...link,enabled:link.enabled&&component.enabled!==false,index}:null;}).filter(Boolean).sort((a,b)=>a.sort-b.sort||a.index-b.index);
  const energyEnabled=()=>state.enabled&&window.__appSwitches?.showEnergy()!==false;
  const kinds=()=>[...new Set(linked().filter(r=>r.enabled).map(r=>r.kind))];
  function refreshGallery(){
    const grid=document.querySelector('.fs-summary-grid');if(!grid)return;
    grid.querySelectorAll('[data-kind]').forEach(el=>{el.hidden=!window.__energyColumns.visible(el.dataset.kind);});
    kinds().forEach(kind=>{const el=[...grid.children].find(child=>child.dataset.kind===kind);if(el)grid.append(el);});
  }
  window.__energyColumns={enabled:energyEnabled,kinds,visible:kind=>energyEnabled()&&linked().some(r=>r.enabled&&r.kind===kind),resourceIds:kind=>linked().filter(r=>r.enabled&&r.kind===kind).map(r=>r.id),refreshGallery};
  const screen=document.createElement('section');screen.className='screen fs-admin energy-columns';screen.dataset.screen='energy-columns';document.querySelector('.workspace').append(screen);
  const menu=document.querySelector('.sidebar nav button:nth-child(2)');
  const dialog=document.createElement('dialog');dialog.className='energy-edit-dialog';dialog.setAttribute('aria-labelledby','energyEditTitle');document.body.append(dialog);
  let level='root',query={id:'',name:'',status:''},resourceQuery={resourceId:'',tableId:'',name:''};
  const selectedResources=new Set();
  const previousColumns=[['我的',''],['动态壁纸','dynamic_wallpaper'],['静态壁纸','static_wallpaper'],['主题','theme_template'],['首页顶部banner','wallpaper_top_banner'],['首页顶部金刚区','wallpaper_top_category'],['开通页资源','open_page_resources'],['小组件',''],['挂件壁纸','hanging_wallpaper']];
  const extraColumns=new Map();
  window.__appColumns={
    register:column=>{extraColumns.set(column.id,column);if(screen.classList.contains('active')&&level==='root')render();},
    refresh:()=>{if(screen.classList.contains('active')&&level==='root')render();},
    openRoot:()=>{level='root';query={id:'',name:'',status:''};open();}
  };
  const status=enabled=>`<span class="${enabled?'fs-live':'energy-off'}">${enabled?'启用':'停用'}</span>`;
  function applyApp(){
    const enabled=energyEnabled();document.querySelector('.phone-shell').classList.toggle('energy-disabled',!enabled);document.querySelector('[data-current-tab="fengshui"]').hidden=!enabled;
    const active=document.querySelector('.app-page.active')?.dataset.appPage;
    if(!enabled&&(active?.startsWith('fs-')||active==='themes'))setAppPage('home');
    window.dispatchEvent(new Event('energy-columns-changed'));
  }
  function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch(_){showToast('浏览器存储已满，本次修改仅在当前页面保留');}applyApp();}
  function open(){
    document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===menu));
    document.querySelector('.topbar h1').textContent='栏目管理';document.querySelector('.topbar p').textContent='小组件中台 / 栏目管理';document.querySelector('.top-actions').hidden=true;setScreen('energy-columns');render();
  }
  function render(){
    const header=`<div class="energy-crumb">首页 / <button class="text-link" data-ec="root">爱用小组件</button>${level==='resources'?'<span>/</span><span>能量组件</span>':''}</div>`;
    if(level==='resources'){renderResources(header);return;}
    const all=[...previousColumns.map(([name,binding],i)=>({id:'2088730000000000'+i,name,binding,sort:i*10,enabled:true})),{id:'208900000000000001',name:'能量组件',binding:'energy_widget',sort:state.sort,enabled:state.enabled,energy:true},...[...extraColumns.values()].map(column=>({...column,external:true}))];
    const rows=all.filter(r=>r.id.includes(query.id)&&r.name.includes(query.name)&&(!query.status||String(r.enabled)===query.status));
    screen.innerHTML=`${header}<div class="fs-admin-heading"><h2>App 栏目</h2></div><form id="energyColumnSearch" class="energy-search"><label>栏目 ID<input name="id" value="${esc(query.id)}" placeholder="请输入栏目 ID" /></label><label>栏目名称<input name="name" value="${esc(query.name)}" placeholder="请输入栏目名称" /></label><label>状态<select name="status"><option value="">全部</option><option value="true" ${query.status==='true'?'selected':''}>启用</option><option value="false" ${query.status==='false'?'selected':''}>停用</option></select></label><button class="primary" type="submit"><i data-lucide="search"></i>查询</button><button class="ghost" type="button" data-ec="reset"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="fs-table-wrap"><table class="fs-table energy-column-table"><thead><tr>${['序号','栏目 ID','应用编码','栏目名称','最小版本号','与前端约定参数','封面图','背景图','下级资源类型','排序','状态','操作'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.id)}</td><td>爱用小组件</td><td><b>${esc(r.name)}</b></td><td>—</td><td>${esc(r.binding)}</td><td>无封面</td><td>无图片</td><td>${r.energy?'桌面组件':esc(r.resourceType||'栏目')}</td><td>${r.sort}</td><td>${status(r.enabled)}</td><td>${r.energy?'<button class="text-link" data-ec="edit" data-id="energy">编辑</button><button class="text-link" data-ec="next" data-id="energy">下级</button>':r.external?`<button class="text-link" data-ec="external-edit" data-id="${esc(r.id)}">编辑</button><button class="text-link" data-ec="external-next" data-id="${esc(r.id)}">下级</button>`:'—'}</td></tr>`).join('')||'<tr><td colspan="12" class="fs-empty">暂无匹配栏目</td></tr>'}</tbody></table></div><p class="energy-count">共 ${rows.length} 条</p><p class="fs-annotation">批注：能量组件栏目直接关联桌面组件（金、山、水等），无中间分类栏目。总开关为展示且栏目启用时显示 App 能量入口。铃声提示音下配置 Tab 栏目，各栏目下分别关联铃声资源。</p>`;
    window.lucide?.createIcons();refreshAnnotations();
  }
  function renderResources(header){
    const all=linked(),defaultId=all.find(r=>r.enabled)?.id;
    const rows=all.filter(r=>r.resourceId.includes(resourceQuery.resourceId)&&r.id.includes(resourceQuery.tableId)&&r.name.includes(resourceQuery.name));
    screen.innerHTML=`${header}<div class="fs-admin-heading"><h2>能量组件 · 栏目资源</h2><button class="text-link" data-ec="root">返回上级</button></div><form id="energyResourceSearch" class="energy-search"><label>资源 ID<input name="resourceId" value="${esc(resourceQuery.resourceId)}" placeholder="请输入资源 ID" /></label><label>资源表 ID<input name="tableId" value="${esc(resourceQuery.tableId)}" placeholder="请输入资源表 ID" /></label><label>资源名称<input name="name" value="${esc(resourceQuery.name)}" placeholder="请输入资源名称" /></label><button type="submit" class="primary"><i data-lucide="search"></i>查询</button><button class="ghost" type="button" data-ec="reset-resources"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="energy-resource-actions"><button class="primary" data-ec="add-resources" type="button"><i data-lucide="plus"></i>添加资源</button><button class="ghost" data-ec="remove-selected" type="button" ${selectedResources.size?'':'disabled'}><i data-lucide="unlink"></i>解除关联</button><span>已选择 ${selectedResources.size} 项</span></div><div class="fs-table-wrap"><table class="fs-table energy-resource-table"><thead><tr><th><input type="checkbox" data-ec-check="all" aria-label="全选当前资源" ${rows.length&&rows.every(r=>selectedResources.has(r.id))?'checked':''} /></th>${['序号','资源 ID','资源名称','资源类型','资源表 ID','最小版本号','资源角标','封面图','尺寸','排序','状态','更新时间','操作'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr data-resource-id="${esc(r.id)}"><td><input type="checkbox" data-ec-check="resource" value="${esc(r.id)}" aria-label="选择${esc(r.name)}" ${selectedResources.has(r.id)?'checked':''} /></td><td>${i+1}</td><td>${esc(r.resourceId)}</td><td><b>${esc(r.name)}</b>${r.id===defaultId?'<span class="energy-default">默认</span>':''}<small class="dc-resource-count">${r.backgroundCount} 张背景图</small></td><td>桌面组件（2）</td><td>${esc(r.id)}</td><td>—</td><td>${r.vip?'VIP':'—'}</td><td><img class="energy-resource-image" src="${esc(r.image)}" alt="${esc(r.name)}" /></td><td>${esc(r.size)}</td><td>${r.sort}</td><td>${status(r.enabled)}</td><td>${esc(r.updated)}</td><td><button class="text-link" data-ec="edit-resource" data-id="${esc(r.id)}">编辑</button><button class="fs-delete" data-ec="remove-resource" data-id="${esc(r.id)}">删除</button></td></tr>`).join('')||'<tr><td colspan="14" class="fs-empty">暂无关联资源</td></tr>'}</tbody></table></div><p class="energy-count">共 ${rows.length} 条</p><p class="fs-annotation">批注：能量组件栏目直接添加桌面组件资源。组件排序越小越靠前，背景图及其顺序在“桌面组件”内维护；用户已保存的个人图片优先保留，删除仅解除栏目关联。</p>`;
    window.lucide?.createIcons();refreshAnnotations();
  }
  function addResources(){
    const existing=new Set(state.resources.map(r=>r.id));dialog.classList.add('energy-associate-dialog');
    dialog.innerHTML=`<form id="energyResourceAdd"><header><h2 id="energyEditTitle">关联桌面组件</h2><button type="button" data-ec="close" aria-label="关闭"><i data-lucide="x"></i></button></header><label>组件名称<input id="energyAssociateSearch" placeholder="搜索组件名称" /></label><div class="energy-associate-list">${materials.resources().map(r=>`<label data-associate-name="${esc(r.name)}"><input type="checkbox" name="components" value="${esc(r.id)}" ${existing.has(r.id)?'disabled':''} /><img src="${esc(r.image)}" alt="" /><span>${esc(r.name)}<small>${existing.has(r.id)?'已关联':r.vip?'会员用户':'所有用户'} · ${r.backgroundCount} 张背景图</small></span></label>`).join('')}</div><p id="energyAssociateError" class="fs-annotation" role="alert"></p><footer><button class="primary" type="submit">确认关联</button></footer></form>`;
    window.lucide?.createIcons();dialog.showModal();
  }
  function editResource(id){
    const item=state.resources.find(r=>r.id===id),component=materials.get(id);dialog.classList.remove('energy-associate-dialog');
    dialog.innerHTML=`<form id="energyResourceEdit"><header><h2 id="energyEditTitle">编辑栏目资源</h2><button type="button" data-ec="close" aria-label="关闭"><i data-lucide="x"></i></button></header><input type="hidden" name="resource" value="${esc(id)}" /><label>资源名称<input value="${esc(component.name)}" readonly /></label><label>排序<input name="sort" type="number" min="0" max="999999" step="1" required value="${item.sort}" /></label><label>状态<select name="enabled"><option value="true" ${item.enabled?'selected':''}>启用</option><option value="false" ${!item.enabled?'selected':''}>停用</option></select></label><footer><button class="primary" type="submit">保存</button></footer></form>`;
    window.lucide?.createIcons();dialog.showModal();
  }
  function editColumn(){
    dialog.classList.remove('energy-associate-dialog');
    dialog.innerHTML=`<form id="energyColumnEdit"><header><h2 id="energyEditTitle">编辑栏目</h2><button type="button" data-ec="close" aria-label="关闭"><i data-lucide="x"></i></button></header><label>栏目名称<input value="能量组件" readonly /></label><label>下级资源类型<input value="桌面组件" readonly /></label><label>排序<input name="sort" type="number" min="0" max="9999" step="1" required value="${state.sort}" /></label><label>状态<select name="enabled"><option value="true" ${state.enabled?'selected':''}>启用</option><option value="false" ${!state.enabled?'selected':''}>停用</option></select></label><p class="fs-annotation">批注：停用后，App 内不展示能量入口。</p><footer><button class="primary" type="submit">保存</button></footer></form>`;
    window.lucide?.createIcons();dialog.showModal();
  }
  function removeResources(ids){if(!ids.length||!confirm('解除所选组件与此栏目的关联？组件本身及用户已保存的组件不会被删除。'))return;state.resources=state.resources.filter(r=>!ids.includes(r.id));ids.forEach(id=>selectedResources.delete(id));persist();render();showToast('已解除关联');}
  menu.addEventListener('click',()=>{level='root';query={id:'',name:'',status:''};open();});
  document.querySelector('.sidebar nav').addEventListener('click',e=>{if(e.target.closest('button')!==menu)menu.classList.remove('active');});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-ec]');if(!b)return;
    switch(b.dataset.ec){
      case 'root':level='root';query={id:'',name:'',status:''};render();break;
      case 'next':level='resources';resourceQuery={resourceId:'',tableId:'',name:''};selectedResources.clear();render();break;
      case 'reset':query={id:'',name:'',status:''};render();break;
      case 'reset-resources':resourceQuery={resourceId:'',tableId:'',name:''};render();break;
      case 'edit':editColumn();break;
      case 'external-edit':extraColumns.get(b.dataset.id)?.editColumn();break;
      case 'external-next':extraColumns.get(b.dataset.id)?.openResources();break;
      case 'close':dialog.close();break;
      case 'add-resources':addResources();break;
      case 'edit-resource':editResource(b.dataset.id);break;
      case 'remove-resource':removeResources([b.dataset.id]);break;
      case 'remove-selected':removeResources([...selectedResources]);break;
    }
  });
  document.addEventListener('submit',e=>{
    if(e.target.matches('#energyColumnSearch')){e.preventDefault();query=Object.fromEntries(new FormData(e.target));render();}
    if(e.target.matches('#energyResourceSearch')){e.preventDefault();resourceQuery=Object.fromEntries(new FormData(e.target));render();}
    if(e.target.matches('#energyColumnEdit')){e.preventDefault();const d=new FormData(e.target);state.sort=Number(d.get('sort'));state.enabled=d.get('enabled')==='true';persist();dialog.close();render();showToast('栏目已保存');}
    if(e.target.matches('#energyResourceEdit')){e.preventDefault();const d=new FormData(e.target);Object.assign(state.resources.find(r=>r.id===d.get('resource')),{sort:Number(d.get('sort')),enabled:d.get('enabled')==='true',updated:stamp()});persist();dialog.close();render();showToast('资源已保存');}
    if(e.target.matches('#energyResourceAdd')){
      e.preventDefault();const ids=new FormData(e.target).getAll('components');
      if(!ids.length){document.querySelector('#energyAssociateError').textContent='请至少选择一个未关联组件';return;}
      let sort=Math.max(0,...state.resources.map(r=>r.sort));
      ids.forEach((id,i)=>{if(!materials.get(id)||state.resources.some(r=>r.id===id))return;sort+=10;state.resources.push({id,resourceId:'2093'+Date.now()+i,sort,enabled:true,updated:stamp()});});
      persist();dialog.close();render();showToast('组件已关联');
    }
  });
  document.addEventListener('change',e=>{const mode=e.target.dataset.ecCheck;if(!mode)return;if(mode==='resource'){if(e.target.checked)selectedResources.add(e.target.value);else selectedResources.delete(e.target.value);}else screen.querySelectorAll('[data-ec-check="resource"]').forEach(el=>{if(e.target.checked)selectedResources.add(el.value);else selectedResources.delete(el.value);});render();});
  document.addEventListener('input',e=>{if(e.target.id==='energyAssociateSearch')dialog.querySelectorAll('[data-associate-name]').forEach(el=>{el.hidden=!el.dataset.associateName.includes(e.target.value.trim());});});
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{state=restore(JSON.parse(e.newValue||'null'));applyApp();if(screen.classList.contains('active'))render();}catch(_){}});
  window.addEventListener('energy-columns-changed',refreshGallery);
  window.addEventListener('app-switches-changed',applyApp);
  window.addEventListener('desktop-components-changed',()=>{applyApp();if(screen.classList.contains('active'))render();});
  applyApp();
})();
