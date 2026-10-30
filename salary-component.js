(function(){
  'use strict';
  const model=window.SalaryModel,key='aiyong-salary-component-v1',defaults={...model.defaults},components=window.__desktopComponents;
  let componentId=components.salaryDefaultId,widgetId='board-salary-calculator';
  const configKey=(id=componentId)=>id===components.salaryDefaultId?key:key+'-'+id;
  const ownWidgetId=id=>id===components.salaryDefaultId?'board-salary-calculator':'board-salary-'+id;
  const refreshTimes=new Map(),refreshing=new Set();
  function readTimestamp(id=componentId){try{const value=Number(JSON.parse(localStorage.getItem(configKey(id))||'{}').refreshedAt);return Number.isFinite(value)&&value>0?value:Date.now();}catch(_){return Date.now();}}
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=(value,digits=2)=>Number(value).toLocaleString('zh-CN',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const safeImage=url=>/^data:image\/(png|jpeg|webp|gif);base64,/.test(url)||/^\.\/assets\/[\w-]+\.png$/.test(url)?url:'';
  const validColor=color=>/^#[0-9a-f]{6}$/i.test(color);
  function readConfig(id=componentId){
    let stored={};try{stored=JSON.parse(localStorage.getItem(configKey(id))||'{}');}catch(_){}
    const old=stored.config||{},value=Object.fromEntries(Object.keys(defaults).map(field=>[field,old[field]??defaults[field]]));
    value.transparent=Boolean(old.transparent??(old.opacity===0));value.backgroundImage=safeImage(Object.hasOwn(old,'backgroundImage')?value.backgroundImage:components.get(id)?.salaryBackground||'');
    if(!validColor(value.textColor))value.textColor=defaults.textColor;
    if(!validColor(value.backgroundColor))value.backgroundColor=defaults.backgroundColor;
    return model.analyze(value).error?{...defaults}:value;
  }
  let config=readConfig();
  let draft={...config},refreshedAt=readTimestamp(),dirty=false,saving=false,uploading=false,uploadToken=0,salaryDraft=null,returnFocus=null;
  const phone=document.querySelector('.phone-shell'),page=document.createElement('section');page.className='app-page salary-page';page.dataset.appPage='salary';document.querySelector('.app-phone').append(page);
  const overlay=document.createElement('div');overlay.className='salary-overlay';overlay.hidden=true;phone.append(overlay);
  const help=document.createElement('section');help.className='app-page salary-help-page';help.dataset.appPage='salary-help';document.querySelector('.app-phone').append(help);
  const icons=()=>window.lucide?.createIcons();
  const active=()=>page.classList.contains('active');
  const font='-apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif';
  const measure=document.createElement('canvas').getContext('2d');
  const numericFields=['monthlySalary','lunchHours','workDays'];
  function artwork(id=componentId){
    const url=components.get(id)?.backgrounds[0]?.url;
    return /^data:image\/(png|jpeg|webp|gif);base64,/.test(url||'')?url:window.salaryAnimalsImage;
  }
  function refreshHome(){
    const filter=document.querySelector('[data-widget-filter].active')?.dataset.widgetFilter,grid=document.querySelector('.current-widget-grid');
    if(!grid)return;
    grid.querySelectorAll('[data-current-widget="薪资计算"]').forEach(el=>el.remove());
    if(filter!=='热门'&&filter!=='薪资计算')return;
    grid.insertAdjacentHTML('beforeend',components.resources('salary').filter(c=>c.enabled).map(c=>`<button type="button" data-current-widget="薪资计算" data-salary-component="${esc(c.id)}" class="current-widget-card"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy" /><span>${esc(c.name)}</span></button>`).join(''));
  }
  function markDirty(){dirty=true;page.querySelector('.salary-save').textContent='保存到我的组件';}
  function updatePreview(){
    const widget=page.querySelector('.salary-live-widget');if(!widget)return;
    const result=model.progress(draft,new Date(refreshedAt)),background=widget.querySelector('.salary-widget-background');
    widget.style.setProperty('--salary-bg',draft.backgroundColor);widget.style.setProperty('--salary-color',draft.textColor);
    widget.style.setProperty('--salary-artwork',`url("${artwork()}")`);
    background.style.backgroundImage=draft.backgroundImage?`url("${safeImage(draft.backgroundImage)}")`:'';
    background.hidden=draft.transparent;page.querySelector('.salary-stage').classList.toggle('is-transparent',draft.transparent);
    const amount=widget.querySelector('.salary-earned');amount.hidden=false;
    amount.innerHTML=`<small>今日到手</small><strong>¥${money(result.earned)}</strong>`;
    const text=amount.querySelector('strong');measure.font='600 25px '+font;
    text.style.fontSize=Math.min(25,25*(widget.clientWidth-20)/Math.max(1,measure.measureText(text.textContent).width))+'px';
    widget.setAttribute('aria-label','点击更新薪资，今日到手 '+money(result.earned)+' 元');
  }
  function swatches(field,colors){
    const text=field==='textColor';return WidgetAppearance.swatches({mode:text?'text':'background',field,value:draft[field],colors,image:draft.backgroundImage,action:'data-salary',custom:text?'data-salary-field':'',uploadId:text?'':'salaryBackgroundUpload'});
  }
  function renderAppearance(){
    page.querySelector('#salarySummary').textContent='¥'+money(draft.monthlySalary,0)+'/月 · '+draft.start+'–'+draft.end;
    page.querySelector('#salaryFontColors').innerHTML=swatches('textColor',['#ffffff','#fff3c4','#ffeacc','#d7eaf6','#d67fa2','#444444']);
    page.querySelector('#salaryBackgrounds').innerHTML=swatches('backgroundColor',['#252932','#ff6148','#8e2c12','#914561','#d47799','#ffffff']);
    page.querySelector('#salaryTransparent').checked=draft.transparent;updatePreview();icons();refreshAnnotations();
  }
  function open(id=components.salaryDefaultId){
    componentId=id;widgetId=id===components.salaryDefaultId?'board-salary-calculator':'board-salary-'+id;config=readConfig();
    draft={...config};refreshedAt=refreshTimes.get(id)||readTimestamp(id);dirty=false;uploading=false;closeSheet();
    page.innerHTML=`<header class="salary-head"><button type="button" data-salary="back" aria-label="返回首页" title="返回"><i data-lucide="chevron-left"></i></button><h2>薪资计算</h2><button type="button" class="salary-guide" data-salary="guide">教程</button></header><div class="salary-stage" data-annotation-id="salary-preview"><p class="salary-refresh-hint">点击组件更新到手薪资</p><div class="salary-live-widget" data-salary="refresh" tabindex="0" role="button"><div class="salary-widget-background"></div><div class="salary-widget-content"><div class="salary-earned"></div></div></div></div><div class="salary-controls" data-annotation-id="salary-appearance"><button type="button" class="salary-settings-row" data-salary="settings"><span>薪资设置<small id="salarySummary"></small></span><i data-lucide="chevron-right"></i></button><button type="button" class="salary-analysis-row" data-salary="analysis"><span>薪资分析</span><span><i data-lucide="chart-no-axes-column"></i><i data-lucide="chevron-right"></i></span></button><section class="salary-appearance-field"><h3>字体颜色</h3><div id="salaryFontColors"></div></section><section class="salary-appearance-field"><h3>背景</h3><div id="salaryBackgrounds"></div></section><label class="salary-transparent-row" for="salaryTransparent"><span>透明背景</span><span class="salary-switch"><input type="checkbox" id="salaryTransparent" role="switch" data-salary-field="transparent" aria-label="透明背景" /><span></span></span></label></div><p class="salary-error" id="salaryError" role="alert" hidden></p><footer class="salary-footer"><button type="button" class="salary-save" data-salary="save">保存到我的组件</button></footer>`;
    page.querySelector('h2').textContent=components.get(componentId)?.name||'薪资计算';
    page.querySelectorAll('.salary-appearance-field').forEach(el=>el.classList.add('appearance-field'));
    page.querySelector('.salary-transparent-row').outerHTML=WidgetAppearance.toggle({id:'salaryTransparent',checked:draft.transparent,attributes:'data-salary-field="transparent"'});
    setAppPage('salary');renderAppearance();icons();
  }
  function closeSheet(){
    overlay.hidden=true;overlay.innerHTML='';page.removeAttribute('inert');salaryDraft=null;
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;
  }
  function showSheet(mode){
    returnFocus=document.activeElement;page.setAttribute('inert','');overlay.hidden=false;
    let content='';
    if(mode==='settings'){
      salaryDraft={...draft};
      content=`<form id="salarySettings" novalidate data-annotation-id="salary-settings"><label>每月薪资<span class="salary-input-unit"><input type="number" inputmode="decimal" data-salary-parameter="monthlySalary" min="0" max="100000000" step="0.01" value="${draft.monthlySalary}" required aria-label="每月薪资" /><small>元</small></span></label><div class="salary-time-fields"><label>上班时间<input type="time" data-salary-parameter="start" value="${draft.start}" required /></label><label>下班时间<input type="time" data-salary-parameter="end" value="${draft.end}" required /></label></div><label>午休时长<span class="salary-input-unit"><input type="number" inputmode="decimal" data-salary-parameter="lunchHours" min="0" max="23" step="0.5" value="${draft.lunchHours}" required aria-label="午休时长" /><small>小时</small></span></label><label>每月上班天数<span class="salary-input-unit"><input type="number" inputmode="decimal" data-salary-parameter="workDays" min="1" max="31" step="0.01" value="${draft.workDays}" required aria-label="每月上班天数" /><small>天</small></span></label><p class="salary-field-note">午休按班次中段扣除。</p><p class="salary-sheet-error" role="alert" hidden></p></form>`;
    }else{
      const result=model.analyze(draft);
      content=`<section class="salary-analysis" data-annotation-id="salary-analysis"><h4>基本薪资</h4><dl>${[['monthly','月薪',result.salary,2],['yearly','年薪',result.yearly,2]].map(([id,label,value,digits])=>`<div><dt>${label}</dt><dd data-salary-result="${id}">¥${money(value,digits)}</dd></div>`).join('')}<div><dt>工作时间</dt><dd>${draft.start}–${draft.end}${result.overnight?'（跨日）':''}</dd></div><div><dt>每日净工作时间</dt><dd data-salary-result="hours">${money(result.hours)} 小时</dd></div></dl><h4>时间单位薪资</h4><dl>${[['daily','每日薪资',result.daily,2],['hourly','每小时薪资',result.hourly,2],['minute','每分钟薪资',result.perMinute,2],['second','每秒薪资',result.perSecond,4]].map(([id,label,value,digits])=>`<div><dt>${label}</dt><dd data-salary-result="${id}">¥${money(value,digits)}</dd></div>`).join('')}</dl></section>`;
    }
    overlay.innerHTML=`<section class="salary-sheet" role="dialog" aria-modal="true" aria-labelledby="salarySheetTitle"><header><h3 id="salarySheetTitle">${mode==='settings'?'薪资设置':'薪资分析'}</h3><button type="button" data-salary="close-sheet" aria-label="关闭" title="关闭"><i data-lucide="x"></i></button></header><div class="salary-sheet-body">${content}</div><footer>${mode==='settings'?'<button type="button" class="salary-sheet-cancel" data-salary="close-sheet">取消</button><button type="submit" class="salary-sheet-confirm" form="salarySettings">完成</button>':'<button type="button" class="salary-sheet-confirm" data-salary="close-sheet">完成</button>'}</footer></section>`;
    overlay.querySelector('input,button').focus({preventScroll:true});icons();refreshAnnotations();
  }
  function showError(message){const error=page.querySelector('#salaryError');error.hidden=false;error.textContent=message;}
  async function snapshot(value,id=componentId,at=refreshTimes.get(id)||(id===componentId?refreshedAt:readTimestamp(id))){
    const result=model.progress(value,new Date(at));
    const canvas=document.createElement('canvas');canvas.width=300;canvas.height=300;const ctx=canvas.getContext('2d');
    ctx.beginPath();ctx.roundRect(0,0,300,300,24);ctx.clip();
    if(!value.transparent){
      ctx.fillStyle=value.backgroundColor;ctx.fillRect(0,0,300,300);
      if(safeImage(value.backgroundImage)){const img=new Image();img.src=safeImage(value.backgroundImage);await img.decode();const scale=Math.max(300/img.naturalWidth,300/img.naturalHeight);ctx.drawImage(img,(300-img.naturalWidth*scale)/2,(300-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);}
    }
    const animals=new Image();animals.src=artwork(id);await animals.decode();ctx.drawImage(animals,0,0,300,300);
    ctx.fillStyle=value.textColor;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='20px '+font;ctx.fillText('今日到手',150,42);
    ctx.font='600 50px '+font;ctx.fillText('¥'+money(result.earned),150,101,260);
    return canvas.toDataURL('image/png');
  }
  async function saveWidget(){
    if(saving||uploading)return;
    saving=true;const button=page.querySelector('.salary-save');button.disabled=true;button.textContent='保存中…';page.querySelector('.salary-controls').inert=true;
    try{
      const next={...draft},image=await snapshot(next,componentId,refreshedAt);localStorage.setItem(configKey(),JSON.stringify({version:2,config:next,refreshedAt}));refreshTimes.set(componentId,refreshedAt);
      config=next;window.__themeWidgetFlow.save([{id:widgetId,name:components.get(componentId)?.name||'薪资计算',type:'时间日历组件',size:'2*2',image,words:'',renderVersion:2}]);
      const saved=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}');
      if(!saved.saved?.[widgetId]||saved.extraCatalog?.find(item=>item.id===widgetId)?.image!==image)throw new Error('我的组件存储空间不足，请清理后重试');
      dirty=false;button.textContent='已保存到我的组件';showToast('薪资组件已保存到我的组件');
    }catch(error){button.textContent='保存到我的组件';showError(error.message||'保存失败，请压缩背景图片后重试');}
    finally{saving=false;button.disabled=false;page.querySelector('.salary-controls').inert=false;}
  }
  async function refreshSaved(id=components.salaryDefaultId,at=Date.now(),quiet=false){
    const flow=window.__themeWidgetFlow,item=flow.get(ownWidgetId(id));if(!item||refreshing.has(id))return false;
    refreshing.add(id);
    try{const value=readConfig(id),image=await snapshot(value,id,at);localStorage.setItem(configKey(id),JSON.stringify({version:2,config:value,refreshedAt:at}));refreshTimes.set(id,at);flow.update(item.id,{image,renderVersion:2});if(id===componentId&&!dirty){refreshedAt=at;updatePreview();}if(!quiet)showToast('薪资已更新');return true;}
    catch(_){showToast('薪资更新失败，请重试');return false;}finally{refreshing.delete(id);}
  }
  document.addEventListener('click',event=>{
    const card=event.target.closest('[data-current-widget="薪资计算"]');if(!card)return;
    event.preventDefault();event.stopImmediatePropagation();open(card.dataset.salaryComponent||components.salaryDefaultId);
  },true);
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-salary]');if(!button)return;const action=button.dataset.salary;
    if(action==='open')open(button.dataset.salaryComponent||components.salaryDefaultId);
    if(action==='back'&&!saving&&(!dirty||confirm('尚未保存本次修改，确认返回首页？'))){uploadToken++;closeSheet();setAppPage('home');}
    if(action==='refresh'&&!saving&&!uploading){refreshedAt=Date.now();refreshTimes.set(componentId,refreshedAt);updatePreview();if(!dirty)await refreshSaved(componentId,refreshedAt);}
    if(action==='settings'||action==='analysis')showSheet(action);
    if(action==='close-sheet')closeSheet();
    if(action==='color'||action==='reset-color'){
      const field=button.dataset.field;draft[field]=action==='color'?button.dataset.color:defaults[field];
      if(field==='backgroundColor')draft.backgroundImage='';markDirty();renderAppearance();
    }
    if(action==='save')await saveWidget();
    if(action==='guide'){
      closeSheet();help.innerHTML='<header class="salary-head"><button type="button" data-salary="guide-back" aria-label="返回薪资计算"><i data-lucide="chevron-left"></i></button><h2>添加教程</h2><span></span></header><video controls playsinline preload="metadata" aria-label="添加到桌面教程" src="./assets/add-to-desktop.webm"></video>';setAppPage('salary-help');icons();
    }
    if(action==='guide-back'){help.querySelector('video')?.pause();setAppPage('salary');}
  });
  document.addEventListener('input',event=>{
    const input=event.target;if(input.dataset.salaryParameter&&salaryDraft){const field=input.dataset.salaryParameter;salaryDraft[field]=numericFields.includes(field)?input.value===''?'':Number(input.value):input.value;}
    if(input.dataset.salaryField==='textColor'){draft.textColor=input.value;markDirty();updatePreview();}
  });
  document.addEventListener('change',async event=>{
    const input=event.target;
    if(input.dataset.salaryField==='transparent'){draft.transparent=input.checked;markDirty();updatePreview();}
    if(input.dataset.salaryField==='textColor'){draft.textColor=input.value;markDirty();renderAppearance();}
    if(input.id!=='salaryBackgroundUpload')return;
    const file=input.files[0];if(!file)return;const token=++uploadToken;uploading=true;page.querySelector('.salary-save').disabled=true;
    try{
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('请选择 5MB 以内的 PNG、JPG 或 WebP 图片');
      const url=URL.createObjectURL(file),img=new Image();img.src=url;
      try{await img.decode();const scale=Math.min(1,800/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);if(token!==uploadToken||!active())return;draft.backgroundImage=canvas.toDataURL('image/webp',.85);draft.transparent=false;markDirty();renderAppearance();}finally{URL.revokeObjectURL(url);}
    }catch(error){if(token===uploadToken)showError(error.message);}
    finally{uploading=false;if(token===uploadToken)page.querySelector('.salary-save').disabled=false;}
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='salarySettings')return;event.preventDefault();
    const missing=numericFields.some(field=>salaryDraft[field]===''),result=missing?{error:'请完整填写薪资、午休时长和每月上班天数'}:model.analyze(salaryDraft);
    if(result.error){const error=overlay.querySelector('.salary-sheet-error');error.hidden=false;error.textContent=result.error;return;}
    draft={...salaryDraft};markDirty();closeSheet();renderAppearance();
  });
  overlay.addEventListener('click',event=>{if(event.target===overlay)closeSheet();});
  document.addEventListener('keydown',event=>{
    if(event.target.matches('.salary-live-widget')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.target.click();return;}
    if(overlay.hidden)return;
    if(event.key==='Escape'){event.preventDefault();closeSheet();}
    if(event.key==='Tab'){
      const controls=[...overlay.querySelectorAll('button,input')].filter(el=>!el.disabled),index=controls.indexOf(document.activeElement);
      if(event.shiftKey&&index<=0){event.preventDefault();controls.at(-1).focus();}else if(!event.shiftKey&&index===controls.length-1){event.preventDefault();controls[0].focus();}
    }
  });
  const setPage=window.setAppPage;
  window.setAppPage=function(name){setPage(name);if(name!=='salary')closeSheet();if(name!=='salary-help')help.querySelector('video')?.pause();};
  document.addEventListener('click',event=>{if(event.target.closest('[data-demo-view]')){closeSheet();help.querySelector('video')?.pause();}});
  const refreshMine=window.__themeWidgetFlow.refreshMine;
  window.__themeWidgetFlow.refreshMine=function(){
    refreshMine.call(this);
    document.querySelectorAll('.fs-mine-energy [data-fs="single-install"]').forEach(install=>{
      const id=install.dataset.id;if(id!=='board-salary-calculator'&&!id.startsWith('board-salary-'))return;
      const row=install.closest('.fs-component-row');if(row.querySelector('[data-salary="open"]'))return;
      const edit=document.createElement('button');edit.type='button';edit.className='fs-mini';edit.dataset.salary='open';edit.dataset.salaryComponent=id==='board-salary-calculator'?components.salaryDefaultId:id.slice('board-salary-'.length);edit.textContent='编辑';row.querySelector('span').append(edit);
    });
  };
  window.__themeWidgetFlow.refreshMine();
  window.__salaryComponent={open,snapshot,refresh:refreshSaved,defaults:{...defaults}};
  document.addEventListener('click',event=>{if(event.target.closest('[data-widget-filter]'))refreshHome();});
  window.addEventListener('desktop-components-changed',()=>{refreshHome();if(active()){if(!dirty)draft={...readConfig()};updatePreview();}});
  for(const c of components.resources('salary')){const saved=window.__themeWidgetFlow.get(ownWidgetId(c.id));if(saved&&saved.renderVersion!==2)refreshSaved(c.id,readTimestamp(c.id),true);}
  refreshHome();
})();
