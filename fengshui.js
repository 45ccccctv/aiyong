(function () {
  'use strict';
  const root = document.querySelector('.app-phone');
  const key = 'aiyong-theme-prototype-v1';
  const catalog = [
    {id:'peak',name:'峰峦守望',size:'2*2',type:'照片墙组件',image:'./assets/peak.png',words:'心有定力，步履从容'},
    {id:'ink',name:'山间寄语',size:'2*2',type:'照片墙组件',image:'./assets/ink.png',words:'所行皆坦途'},
    {id:'water',name:'流水生意',size:'2*4',type:'照片墙组件',image:'./assets/water.png',words:'好事缓缓而来'}
  ];
  const initial = [
    {id:'career',name:'山水有靠 · 事业顺遂',category:'事业顺遂',intro:'把山的沉稳与水的从容，留在每天看见的地方。',ids:['peak','ink','water'],cover:'./assets/peak.png',layout:'',updated:'2026-10-15',audience:'会员用户'},
    {id:'peace',name:'山间静好 · 平安常伴',category:'平安常伴',intro:'一方山水，一份安定。愿日常自在，心有所安。',ids:['water','peak'],cover:'./assets/water.png',layout:'',updated:'2026-10-15',audience:'会员用户'},
    {id:'wish',name:'落笔成愿 · 学业进步',category:'学业进步',intro:'把心愿写在桌面，让每一次出发都有方向。',ids:['ink','peak'],cover:'./assets/ink.png',layout:'',updated:'2026-10-15',audience:'会员用户'}
  ];
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) {}
  if(Array.isArray(stored.extraCatalog))catalog.push(...stored.extraCatalog.filter(w=>w&&String(w.id).startsWith('board-')));
  let plans = Array.isArray(stored.plans) ? stored.plans : initial;
  let saved = stored.saved || {};
  let installed = stored.installed || {};
  let edits = stored.edits || {};
  let activePlan = plans[0]?.id;
  let activeWidget = 'peak';
  let filter = '全部';
  let installQueue = [];
  let queueIndex = 0;
  let editPlanId = null;
  let coverFile = '';
  let layoutFile = '';
  let externalPlan = null;
  let externalBack = null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const persist = () => { try { localStorage.setItem(key,JSON.stringify({plans,saved,installed,edits,extraCatalog:catalog.filter(w=>w.id.startsWith('board-'))})); } catch (_) { showToast('浏览器存储已满，本次修改仅在当前页面保留'); } };
  const getPlan = () => externalPlan || plans.find(p=>p.id===activePlan) || plans[0];
  const widget = id => catalog.find(w=>w.id===id);
  const page = (name,body) => {
    let el = root.querySelector(`[data-app-page="${name}"]`);
    if (!el) { el=document.createElement('section'); el.className='app-page fs-page';el.dataset.appPage=name;root.append(el); }
    el.innerHTML=body;setAppPage(name);el.scrollTop=0;refreshAnnotations();
  };
  const head = (title,back='themes') => `<header class="fs-head"><button type="button" data-fs="${back}" aria-label="返回">‹</button><h2>${esc(title)}</h2><span></span></header>`;
  const art = (w,cls='') => `<img class="fs-art ${cls}" src="${w.image}" alt="${esc(w.name)}" />`;
  const arrangement = (p=initial[0],small=false) => `<div class="fs-arrangement ${small?'small':''}" aria-label="${esc(p.name)}摆放示意">${p.layout?`<img class="fs-layout-image" src="${esc(p.layout)}" alt="摆放示意图" />`:`<div class="fs-desktop-dots">${'<i></i>'.repeat(12)}</div>${p.ids.map((id,i)=>`<img class="fs-position fs-pos-${i%3} ${widget(id).size==='2*4'?'fs-is-wide':''}" src="${widget(id).image}" alt="${esc(widget(id).name)}" />`).join('')}<div class="fs-dock">${'<i></i>'.repeat(4)}</div>`}</div>`;
  const note = text => `<p class="fs-annotation">批注：${text}</p>`;

  function themes() {
    externalPlan=null;externalBack=null;
    page('themes', `${head('能量主题','home')}<p class="fs-eyebrow">山水寄意 · 桌面焕新</p><h3 class="fs-title">把好寓意，放在眼前</h3><nav class="fs-categories" aria-label="主题分类">${['全部','事业顺遂','平安常伴','学业进步'].map(v=>`<button type="button" data-fs="filter" data-value="${v}" class="${v===filter?'active':''}">${v}</button>`).join('')}</nav><div data-annotation-id="fs-themes">${plans.filter(p=>filter==='全部'||p.category===filter).map(p=>`<button type="button" class="fs-plan-card" data-fs="plan" data-id="${p.id}"><div class="fs-plan-cover"><img src="${esc(p.cover)}" alt="${esc(p.name)}封面" /><span>${esc(p.category)}</span></div><div class="fs-plan-copy"><h3>${esc(p.name)}</h3><p>${p.ids.length} 款组件 · ${esc(p.audience)}</p><span>查看搭配 <b>↗</b></span></div></button>`).join('')||'<p class="fs-empty">暂无该主题方案</p>'}</div><p class="fs-culture">以山水寄托美好祝愿</p>`);
  }
  function planDetail() {
    if(externalBack){externalBack();return;}
    const p=getPlan();if(!p){themes();return;}
    page('fs-plan',`${head('桌面方案')}<div data-annotation-id="fs-plan">${arrangement(p)}<div class="fs-plan-info"><span class="fs-tag">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.intro)}</p></div><div class="fs-section-line"><h3>搭配组件</h3><span>${p.ids.length} 款</span></div>${p.ids.map((id,i)=>{const w=widget(id);return `<button class="fs-component-row" type="button" data-fs="widget" data-id="${id}">${art(w)}<span><strong>${esc(w.name)}</strong><small>${w.size} · ${installed[id]?'已演示安装':saved[id]?'已保存':'推荐位置 '+(i+1)}</small></span><b>›</b></button>`}).join('')}<p class="fs-footnote">摆放图仅为屏幕布局建议，可按桌面空间自行调整。</p><button class="fs-primary" type="button" data-fs="install-all">逐个添加整套组件</button><button class="fs-link" type="button" data-fs="guide">查看 Android 添加指引</button></div>`);
  }
  function widgetDetail() {
    const w=widget(activeWidget);
    page('fs-widget',`${head(w.name,'back-plan')}<div class="fs-widget-preview">${art(w)}<span id="fsPreviewWords">${esc(edits[w.id]??w.words)}</span></div><section class="fs-word-editor"><label for="fsWords">祝福文案</label><input id="fsWords" maxlength="24" value="${esc(edits[w.id]??w.words)}" /><small>文字内容可修改</small></section><dl class="fs-spec"><div><dt>组件尺寸</dt><dd>${w.size}</dd></div><div><dt>组件类型</dt><dd>${w.type}</dd></div></dl><button class="fs-primary" type="button" data-fs="save-widget">保存到我的组件</button><button class="fs-link" type="button" data-fs="back-plan">返回整套搭配</button>${note('沿用模板图层权限。当前演示为无照片槽位的静态素材组件，用户可编辑祝福文字。')}`);
  }
  function installPage() {
    const id=installQueue[queueIndex],w=widget(id);
    if(!w){planDetail();return;}
    page('fs-install',`${head('添加到桌面','back-plan')}<div data-annotation-id="fs-install"><p class="fs-progress">安装进度 ${queueIndex+1} / ${installQueue.length}</p><div class="fs-step-track">${installQueue.map((_,i)=>`<i class="${i<=queueIndex?'active':''}"></i>`).join('')}</div><div class="fs-install-preview">${art(w)}</div><h3 class="fs-center">${esc(w.name)}</h3><p class="fs-center fs-muted">${w.size} · 已保存到我的组件</p><div class="fs-native-request"><strong>添加到主屏幕</strong><p>爱用小组件 · ${esc(w.name)}</p><div><button type="button" data-fs="cancel-install">取消</button><button type="button" data-fs="confirm-install">添加</button></div></div>${note('这里演示 Android 系统添加流程；网页原型不实际向桌面安装组件。实际位置由系统与用户决定。')}<label class="fs-boundary"><input id="fsNoSpace" type="checkbox" />演示：桌面空间不足</label><button class="fs-link" type="button" data-fs="skip">暂不安装，继续下一款</button></div>`);
  }
  function guide() {
    page('fs-guide',`${head('添加桌面指引','back-plan')}<div class="fs-guide-art">${arrangement(getPlan())}</div><ol class="fs-guide-steps"><li><b>整理桌面空间</b><p>长按桌面空白处，移动图标或切换到其他桌面页。</p></li><li><b>添加小组件</b><p>进入桌面“小组件”，找到“爱用小组件”，选择对应尺寸。</p></li><li><b>选择已保存的组件</b><p>选择刚刚保存的组件，按个人喜好调整位置。</p></li></ol><button class="fs-primary" data-fs="retry" type="button">返回继续添加</button><button class="fs-link" data-fs="saved" type="button">查看已保存组件</button>${note('不同 Android 桌面操作可能不同；空间不足或取消添加不会删除已保存组件。')}`);
  }
  function savedPage() {
    page('fs-saved',`${head('我的主题组件','themes')}<div class="fs-saved-list">${Object.keys(saved).filter(id=>widget(id)).map(id=>`<div class="fs-component-row">${art(widget(id))}<span><strong>${widget(id).name}</strong><small>${widget(id).size} · ${installed[id]?'已演示安装':'待安装'}</small><button type="button" class="fs-mini" data-fs="single-install" data-id="${id}">安装</button></span><button class="fs-delete" title="从我的组件删除" aria-label="删除${widget(id).name}" data-fs="delete-saved" data-id="${id}" type="button">${trashIcon()}</button></div>`).join('')||'<p class="fs-empty">暂无保存的主题组件</p>'}</div><button class="fs-link" data-fs="themes" type="button">去挑选主题</button>`);
  }
  function trashIcon(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';}
  function startInstall(ids){installQueue=[...ids];queueIndex=0;ids.forEach(id=>saved[id]=true);persist();installPage();}
  function nextInstall(){queueIndex++;if(queueIndex<installQueue.length)installPage();else{page('fs-complete',`${head('本套添加流程已结束','back-plan')}<div class="fs-success">✓</div><h3 class="fs-center">让好寓意，常伴桌面</h3><p class="fs-center fs-muted">${installQueue.filter(id=>installed[id]).length} 款已演示安装，全部组件已保存</p><button class="fs-primary" data-fs="saved" type="button">查看我的主题组件</button><button class="fs-link" data-fs="back-plan" type="button">返回桌面方案</button>`);}}

  const menu=document.createElement('button');menu.textContent='主题桌面方案';menu.dataset.fs='admin-list';
  document.querySelector('.sidebar nav').insertBefore(menu,document.querySelector('.sidebar nav button:nth-child(4)'));
  const admin=document.createElement('section');admin.className='screen fs-admin';admin.dataset.screen='fs-admin';
  document.querySelector('.workspace').append(admin);
  function openAdmin(){document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===menu));document.querySelector('.topbar h1').textContent='主题桌面方案';document.querySelector('.topbar p').textContent='小组件中台 / 主题桌面方案';document.querySelector('.top-actions').hidden=true;setScreen('fs-admin');}
  function adminList(){openAdmin();admin.innerHTML=`<div class="fs-admin-heading"><div><h2>主题桌面方案</h2><p>关联已有组件，配置主题搭配与摆放示意。</p></div><button type="button" class="primary" data-fs="new-plan">新建方案</button></div><div class="fs-admin-search"><label>方案名称<input id="fsSearchName" placeholder="请输入方案名称" /></label><label>主题分类<select id="fsSearchCategory"><option>全部</option>${['事业顺遂','平安常伴','学业进步'].map(t=>`<option>${t}</option>`).join('')}</select></label></div><div class="fs-table-wrap" data-annotation-id="fs-admin-list"><table class="fs-table"><thead><tr>${['方案名称','主题分类','关联组件','可见人群','状态','更新时间','操作'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${plans.map(p=>`<tr data-plan-name="${esc(p.name)}" data-plan-category="${esc(p.category)}"><td><div class="fs-cell-name"><img src="${esc(p.cover)}" alt="" /><b>${esc(p.name)}</b></div></td><td>${esc(p.category)}</td><td>${p.ids.length} 款</td><td>${esc(p.audience)}</td><td><span class="fs-live">有效</span></td><td>${p.updated}</td><td><button class="text-link" data-fs="preview-plan" data-id="${p.id}">预览</button><button class="text-link" data-fs="edit-plan" data-id="${p.id}">编辑</button><button class="fs-delete" data-fs="delete-plan" data-id="${p.id}">删除</button></td></tr>`).join('')}</tbody></table><p id="fsSearchEmpty" hidden>没有匹配的方案</p></div>${note('能量主题为内容分类；组件制作复用已有模板。栏目关联与排序仍由现有栏目管理负责。保存默认上线；本地演示数据保存在当前浏览器。')}`;refreshAnnotations();}
  function adminEdit(id){
    openAdmin();editPlanId=id||null;const p=plans.find(p=>p.id===id);coverFile=p?.cover||'';layoutFile=p?.layout||'';
    admin.innerHTML=`<div class="fs-admin-heading"><h2>${p?'编辑':'新建'}主题方案</h2><button class="text-link" data-fs="admin-list">返回列表</button></div><form id="fsPlanForm" data-annotation-id="fs-admin-editor"><h3>方案基础信息</h3><div class="fs-form-grid"><label>方案名称 <em>*</em><input name="name" required maxlength="30" value="${esc(p?.name||'')}" placeholder="例如：山水有靠 · 事业顺遂" /></label><label>主题分类 <em>*</em><select name="category">${['事业顺遂','平安常伴','学业进步'].map(t=>`<option ${p?.category===t?'selected':''}>${t}</option>`).join('')}</select></label><label>可见人群 <em>*</em><select name="audience"><option ${p?.audience==='会员用户'?'selected':''}>会员用户</option><option ${p?.audience==='所有用户'?'selected':''}>所有用户</option></select></label><label>方案封面 <em>*</em><input type="file" id="fsCoverUpload" accept="image/png,image/jpeg,image/webp" /><img id="fsCoverThumb" class="fs-upload-thumb" src="${esc(coverFile||'./assets/peak.png')}" alt="封面" /><button type="button" class="text-link" data-fs="default-cover">使用山水示例封面</button></label><label class="fs-full">方案介绍 <em>*</em><textarea name="intro" required maxlength="120" rows="3" placeholder="填写主题寓意与搭配介绍">${esc(p?.intro||'')}</textarea></label><label class="fs-full">摆放示意图<input type="file" id="fsLayoutUpload" accept="image/png,image/jpeg,image/webp" /><span id="fsLayoutStatus">${layoutFile?'已上传摆放示意图':'未上传时按关联顺序生成默认屏幕布局'}</span></label></div><h3>关联组件与安装顺序 <em>*</em></h3><div class="fs-picker">${catalog.map(w=>`<label><input type="checkbox" name="widget" value="${w.id}" ${(p?.ids||[]).includes(w.id)?'checked':''} />${art(w)}<span><b>${w.name}</b><small>${w.type} · ${w.size}</small></span></label>`).join('')}</div><ol id="fsOrderList" class="fs-order-list"></ol>${note('排序仅决定本方案的组件安装顺序，不修改已有栏目排序。布局坐标不对应真实地理方位。')}<p id="fsFormError" class="fs-annotation" role="alert"></p><footer class="fs-admin-footer"><span>保存后默认上线</span><button class="primary" type="submit">保存</button></footer></form>`;
    renderOrder(p?.ids||[]);refreshAnnotations();
  }
  function renderOrder(ids){document.querySelector('#fsOrderList').innerHTML=ids.map((id,i)=>`<li data-id="${id}"><span>${i+1}. ${widget(id).name}</span><div><button type="button" data-fs="move-up" title="上移" ${i===0?'disabled':''}>↑</button><button type="button" data-fs="move-down" title="下移" ${i===ids.length-1?'disabled':''}>↓</button></div></li>`).join('');}
  function searchAdmin(){const q=document.querySelector('#fsSearchName').value.trim();const cat=document.querySelector('#fsSearchCategory').value;let count=0;document.querySelectorAll('.fs-table tbody tr').forEach(r=>{r.hidden=!(r.dataset.planName.includes(q)&&(cat==='全部'||cat===r.dataset.planCategory));if(!r.hidden)count++;});document.querySelector('#fsSearchEmpty').hidden=count>0;}

  const banner=document.createElement('button');banner.type='button';banner.className='fs-home-banner';banner.dataset.fs='themes';banner.dataset.annotationId='fs-entry';banner.innerHTML='<img src="./assets/peak.png" alt="山水主题" /><span><small>主题桌面</small><strong>山水寄意，好愿常伴</strong><b>查看能量主题 ↗</b></span>';
  document.querySelector('[data-app-page="home"] .app-cats').after(banner);
  const savedEntry=document.createElement('button');savedEntry.className='fs-link';savedEntry.dataset.fs='saved';savedEntry.textContent='查看我的主题组件';document.querySelector('[data-app-page="mine"] .size-tabs').after(savedEntry);

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-fs]');if(!b)return;
    const action=b.dataset.fs;
    if(action==='home'){setAppPage('home');return;}
    if(action==='themes')themes();
    if(action==='filter'){filter=b.dataset.value;themes();}
    if(action==='plan'){activePlan=b.dataset.id;planDetail();}
    if(action==='back-plan')planDetail();
    if(action==='widget'){activeWidget=b.dataset.id;widgetDetail();}
    if(action==='save-widget'){edits[activeWidget]=document.querySelector('#fsWords').value;saved[activeWidget]=true;persist();startInstall([activeWidget]);}
    if(action==='install-all')startInstall(getPlan().ids);
    if(action==='single-install')startInstall([b.dataset.id]);
    if(action==='confirm-install'){if(document.querySelector('#fsNoSpace')?.checked){guide();}else{installed[installQueue[queueIndex]]=true;persist();showToast('已演示添加到桌面');nextInstall();}}
    if(action==='cancel-install'){planDetail();showToast('已取消添加，组件保留在我的组件');}
    if(action==='skip')nextInstall();
    if(action==='guide')guide();
    if(action==='retry'){if(installQueue.length&&queueIndex<installQueue.length)installPage();else planDetail();}
    if(action==='saved')savedPage();
    if(action==='delete-saved'){if(confirm('从我的组件中删除？此操作不移除桌面已有组件。')){delete saved[b.dataset.id];persist();window.__themeWidgetFlow.refreshMine();if(root.querySelector('[data-app-page="fs-saved"].active'))savedPage();}}
    if(action==='admin-list')adminList();
    if(action==='new-plan')adminEdit();
    if(action==='edit-plan')adminEdit(b.dataset.id);
    if(action==='preview-plan'){activePlan=b.dataset.id;setDemoView('app');planDetail();}
    if(action==='delete-plan'){if(confirm('删除该桌面方案？关联的小组件会保留。')){plans=plans.filter(p=>p.id!==b.dataset.id);persist();adminList();}}
    if(action==='default-cover'){coverFile='./assets/peak.png';document.querySelector('#fsCoverThumb').src=coverFile;}
    if(action==='move-up'||action==='move-down'){const items=[...document.querySelectorAll('#fsOrderList li')].map(li=>li.dataset.id);const index=items.indexOf(b.closest('li').dataset.id);const target=index+(action==='move-up'?-1:1);[items[index],items[target]]=[items[target],items[index]];renderOrder(items);}
  });
  document.addEventListener('input',e=>{if(e.target.id==='fsWords'){edits[activeWidget]=e.target.value;document.querySelector('#fsPreviewWords').textContent=e.target.value;}if(e.target.id==='fsSearchName')searchAdmin();});
  document.addEventListener('change',async e=>{
    if(e.target.id==='fsSearchCategory')searchAdmin();
    if(e.target.name==='widget'){const ids=[...document.querySelectorAll('#fsOrderList li')].map(li=>li.dataset.id).filter(id=>document.querySelector(`[name="widget"][value="${id}"]`).checked);if(e.target.checked&&!ids.includes(e.target.value))ids.push(e.target.value);renderOrder(ids);}
    if(['fsCoverUpload','fsLayoutUpload'].includes(e.target.id)){
      const file=e.target.files[0];if(!file)return;
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024){showToast('请选择 4MB 以内的 PNG、JPG 或 WebP 图片');e.target.value='';return;}
      const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
      if(e.target.id==='fsCoverUpload'){coverFile=data;document.querySelector('#fsCoverThumb').src=data;}else{layoutFile=data;document.querySelector('#fsLayoutStatus').textContent='已上传：'+file.name;}
    }
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='fsPlanForm')return;e.preventDefault();
    const data=new FormData(e.target),ids=[...document.querySelectorAll('#fsOrderList li')].map(li=>li.dataset.id);
    const error=document.querySelector('#fsFormError');
    if(!String(data.get('name')).trim()||!String(data.get('intro')).trim()){error.textContent='请填写方案名称和介绍';return;}
    if(!coverFile){error.textContent='请上传方案封面，或选择示例封面';return;}
    if(!ids.length){error.textContent='请至少关联一个小组件';return;}
    const p={id:editPlanId||'plan-'+Date.now(),name:String(data.get('name')).trim(),intro:String(data.get('intro')).trim(),category:data.get('category'),audience:data.get('audience'),ids,cover:coverFile,layout:layoutFile,updated:new Date().toLocaleDateString('sv-SE')};
    const index=plans.findIndex(item=>item.id===p.id);if(index>=0)plans[index]=p;else plans.unshift(p);persist();adminList();showToast('方案已保存，默认上线');
  });
  document.querySelector('.sidebar nav button:nth-child(3)').addEventListener('click',()=>{document.querySelector('.topbar h1').textContent='小组件模板配置';document.querySelector('.topbar p').textContent='小组件中台 / 模板配置';document.querySelector('.top-actions').hidden=false;menu.classList.remove('active');document.querySelector('.sidebar nav button:nth-child(3)').classList.add('active');setScreen('list');});
  window.addEventListener('storage',e=>{if(e.key===key)showToast('其他窗口的方案已更新，刷新页面查看');});
  window.__themeWidgetFlow = {
    register(items){items.forEach(item=>{const index=catalog.findIndex(w=>w.id===item.id);if(index<0)catalog.push(item);else catalog[index]=item;});},
    save(items){this.register(items);items.forEach(item=>{saved[item.id]=true;});persist();this.refreshMine();},
    refreshMine(){
      let host=root.querySelector('.fs-mine-energy');
      if(!host){host=document.createElement('div');host.className='fs-mine-energy fs-saved-list';savedEntry.after(host);}
      host.innerHTML=Object.keys(saved).filter(id=>id.startsWith('board-')&&widget(id)).map(id=>`<div class="fs-component-row">${art(widget(id))}<span><strong>${esc(widget(id).name)}</strong><small>${widget(id).size}</small><button type="button" class="fs-mini" data-fs="single-install" data-id="${esc(id)}">安装</button></span><button class="fs-delete" title="从我的组件删除" aria-label="删除${esc(widget(id).name)}" data-fs="delete-saved" data-id="${esc(id)}" type="button">${trashIcon()}</button></div>`).join('');
    },
    install(items,plan,onReturn){this.register(items);externalPlan=plan;externalBack=onReturn;startInstall(items.map(w=>w.id));},
    browse(){themes();}
  };
  window.__themeWidgetFlow.refreshMine();
  if(location.hash==='#themes')themes();
})();
