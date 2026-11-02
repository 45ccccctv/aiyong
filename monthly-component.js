(function(){
  'use strict';
  const key='aiyong-monthly-component-v1',desktop=window.__desktopComponents,flow=window.__themeWidgetFlow;
  const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const firstMonth=()=>new Date(new Date().getFullYear(),new Date().getMonth(),1,12);
  const info=d=>({offset:new Date(d.getFullYear(),d.getMonth(),1,12).getDay(),days:new Date(d.getFullYear(),d.getMonth()+1,0,12).getDate(),prefix:dayKey(d).slice(0,8)});
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>`<i data-lucide="${name}"></i>`;
  const schemes={peach:{name:'暖杏',normal:'#f9e9dc',checked:'#f5d1b7',future:'#fbf3ec',accent:'#e88c52'},mint:{name:'薄荷',normal:'#e0f0e7',checked:'#a8d7be',future:'#f0f7f3',accent:'#518a6b'},lilac:{name:'浅紫',normal:'#ece5f5',checked:'#cdb8e3',future:'#f5f1fa',accent:'#9b77bd'},sky:{name:'晴蓝',normal:'#dfedf8',checked:'#aacde7',future:'#eff6fb',accent:'#5c93bc'}};
  let state={version:2,profiles:{}};try{const value=JSON.parse(localStorage.getItem(key)||'null');if([1,2].includes(value?.version)&&value.profiles)state={...value,version:2};}catch(_){}
  let id=state.selected||desktop.monthlyDefaultId,lastDay=dayKey(),uploadToken=0,imageLoading=false,returnPage='home';
  const images=new Map(),pending=new Map(),failed=new Set();
  const page=document.createElement('section');page.className='app-page monthly-page';page.dataset.appPage='monthly';document.querySelector('.app-phone').append(page);
  const active=()=>page.classList.contains('active'),ownId=(component=id)=>'board-monthly-'+component;
  const design=(component=id)=>desktop.get(component)?.monthly||{copy:'每天锻炼一小时',icons:[]};
  const validImage=value=>/^data:image\//.test(value||'')?value:'';
  function history(component=id){const p=state.profiles[component]||{};return [...new Set([...(Array.isArray(p.history)?p.history:[]),...(Array.isArray(p.records)?p.records:[])].filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<=dayKey()))];}
  function profile(component=id){
    const p=state.profiles[component]||{},d=design(component),icons=d.icons||[],bg=p.backgroundImage===null?'':p.backgroundImage||d.background;
    return {copy:p.copy??d.copy,history:history(component),records:history(component).filter(day=>day.startsWith(dayKey().slice(0,8))),scheme:schemes[p.scheme]?p.scheme:'peach',iconId:icons.some(i=>i.id===p.iconId)?p.iconId:icons[0]?.id,textColor:/^#[0-9a-f]{6}$/i.test(p.textColor||'')?p.textColor:'#493c50',background:/^#[0-9a-f]{6}$/i.test(p.background||'')?p.background:'#ffffff',backgroundImage:validImage(bg),transparent:!!p.transparent};
  }
  const imageSource=(component=id)=>validImage(design(component).icons?.find(i=>i.id===profile(component).iconId)?.image);
  const ready=(component=id)=>!!imageSource(component)&&[imageSource(component),profile(component).backgroundImage].every(src=>!src||images.has(src));
  function persist(next){try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch(_){showToast('存储空间不足，修改未保存');return false;}}
  function normalizeRecords(){const next=structuredClone(state);for(const component of Object.keys(next.profiles)){next.profiles[component].history=history(component);next.profiles[component].records=history(component).filter(d=>d.startsWith(dayKey().slice(0,8)));}persist(next);}
  function warm(src){if(!src||images.has(src)||pending.has(src))return;const image=new Image();image.src=src;pending.set(src,image.decode().then(()=>{images.set(src,image);failed.delete(src);}).catch(()=>failed.add(src)).finally(()=>{pending.delete(src);updatePreview();refreshHome();syncSaved();}));}
  function warmAll(){for(const c of desktop.resources('monthly')){for(const item of design(c.id).icons||[])warm(validImage(item.image));warm(profile(c.id).backgroundImage);}}
  function change(values){const next=structuredClone(state);next.profiles[id]={...next.profiles[id],...values};if(!persist(next))return false;warmAll();updatePreview();refreshHome();syncSaved();return true;}
  function checkin(component=id){const p=profile(component),today=dayKey();if(p.history.includes(today)){showToast('今天已经打卡啦');return false;}const next=structuredClone(state),records=[...p.history,today];next.profiles[component]={...next.profiles[component],history:records,records:records.filter(d=>d.startsWith(today.slice(0,8)))};if(!persist(next))return false;updatePreview();refreshHome();syncSaved();showToast('今日打卡成功');return true;}
  function widget(component=id,date=firstMonth()){
    const p=profile(component),s=schemes[p.scheme],m=info(date),today=dayKey(),checked=p.history.includes(today),rows=Math.ceil((m.offset+m.days)/7),src=imageSource(component);
    const cells=Array.from({length:rows*7},(_,index)=>{const n=index-m.offset+1;if(n<1||n>m.days)return '<span class="monthly-blank"></span>';const day=m.prefix+String(n).padStart(2,'0'),done=p.history.includes(day);return `<span class="${day===today?'is-today ':''}${done?'is-checked ':''}${day>today?'monthly-future':''}" aria-label="${day}${done?' 已打卡':''}" title="${day}">${done&&src?`<img src="${esc(src)}" alt="打卡图标" />`:''}</span>`;}).join('');
    return `<div class="monthly-widget ${p.transparent?'is-transparent':''}" style="--monthly-bg:${p.background};--monthly-text:${p.textColor};--monthly-cell:${s.normal};--monthly-checked:${s.checked};--monthly-future:${s.future};--monthly-accent:${s.accent};--month-rows:${rows};${!p.transparent&&p.backgroundImage?'background-image:url(&quot;'+esc(p.backgroundImage)+'&quot;)':''}"><header><strong title="${esc(p.copy)}">${esc(p.copy)}</strong><button type="button" class="monthly-header-check" data-monthly="checkin" aria-label="${checked?'今日已打卡':'今日打卡'}" title="${checked?'今日已打卡':'今日打卡'}" aria-pressed="${checked}" ${checked?'disabled':''}>${checked?'已打卡':'打卡'}</button></header><div class="monthly-week">${['日','一','二','三','四','五','六'].map(v=>`<span>${v}</span>`).join('')}</div><div class="monthly-grid">${cells}</div></div>`;
  }
  function swatches(field,colors){const p=profile(),text=field==='textColor';return WidgetAppearance.swatches({mode:text?'text':'background',field,value:p[field],colors,image:p.backgroundImage,action:'data-monthly',custom:'data-monthly-color',uploadId:text?'':'monthlyBackground'});}
  function renderControls(){const p=profile(),controls=page.querySelector('.monthly-controls'),scroll=controls.scrollTop;controls.innerHTML=`<label class="reminder-field"><span>文案</span><input id="monthlyCopy" maxlength="40" value="${esc(p.copy)}" /></label><section class="monthly-config-field"><h3>方框样式</h3><div class="monthly-style-options" role="group" aria-label="方框样式">${Object.entries(schemes).map(([key,s])=>`<button type="button" data-monthly="scheme" data-scheme="${key}" title="${s.name}" aria-label="${s.name}" aria-pressed="${p.scheme===key}" style="--scheme-color:${s.checked}">${'<i></i>'.repeat(6)}</button>`).join('')}</div></section><section class="monthly-config-field"><h3>打卡图标</h3><div class="monthly-icon-options" role="group" aria-label="打卡图标">${(design().icons||[]).map(item=>`<button type="button" data-monthly="icon" data-id="${esc(item.id)}" title="${esc(item.name)}" aria-label="${esc(item.name)}" aria-pressed="${p.iconId===item.id}"><img src="${esc(validImage(item.image))}" alt="${esc(item.name)}" /></button>`).join('')}</div></section>${WidgetAppearance.field('字体颜色',swatches('textColor',['#493c50','#ffffff','#dc7fa5','#7b9b8d','#8d7ca6']))}${WidgetAppearance.field('背景',swatches('background',['#ffffff','#fff1e0','#fce8f2','#e9f2f0','#eeeaf8']))}${WidgetAppearance.toggle({id:'monthlyTransparent',checked:p.transparent})}<p class="monthly-error" role="alert" hidden></p>`;controls.scrollTop=scroll;updatePreview();}
  function open(component=id,from='home'){id=component;returnPage=from;uploadToken++;imageLoading=false;normalizeRecords();persist({...state,selected:id});warmAll();
    page.innerHTML=`<header class="reminder-head"><button type="button" class="reminder-icon-button" data-monthly="back" aria-label="返回首页" title="返回">${icon('chevron-left')}</button><h2>月历打卡</h2><span></span></header><div class="monthly-stage"></div><div class="monthly-controls"></div><footer class="monthly-footer"><button type="button" data-monthly="save">保存到我的组件</button></footer>`;setAppPage('monthly');renderControls();
  }
  function updatePreview(){
    if(!active()||!page.querySelector('.monthly-stage'))return;
    const p=profile(),date=firstMonth(),stage=page.querySelector('.monthly-stage');
    if(!stage.querySelector('.monthly-widget'))stage.innerHTML=widget()+'<div class="monthly-toolbar"><span></span></div><p class="monthly-total"></p>';
    else{
      // Keep the action button mounted when an input blur updates the preview.
      const template=document.createElement('template');template.innerHTML=widget();const next=template.content.firstElementChild,live=stage.querySelector('.monthly-widget');
      live.className=next.className;live.style.cssText=next.style.cssText;live.querySelector('strong').textContent=p.copy;live.querySelector('strong').title=p.copy;
      const button=live.querySelector('.monthly-header-check'),replacement=next.querySelector('.monthly-header-check');
      button.disabled=replacement.disabled;for(const name of ['aria-label','aria-pressed','title'])button.setAttribute(name,replacement.getAttribute(name));button.innerHTML=replacement.innerHTML;
      live.querySelector('.monthly-grid').innerHTML=next.querySelector('.monthly-grid').innerHTML;
    }
    stage.querySelector('.monthly-toolbar span').textContent=date.getFullYear()+'年'+(date.getMonth()+1)+'月 · 本月 '+p.records.length+' 天';
    stage.querySelector('.monthly-total').innerHTML='已打卡 <b>'+p.history.length+'</b> 天';
    page.querySelector('#monthlyTransparent').checked=p.transparent;WidgetAppearance.sync(page,p,p.backgroundImage);
    page.querySelectorAll('[data-monthly="scheme"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scheme===p.scheme));page.querySelectorAll('[data-monthly="icon"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===p.iconId));
    page.querySelector('[data-monthly="save"]').disabled=imageLoading||!ready();const error=page.querySelector('.monthly-error');if(error&&failed.has(imageSource())){error.hidden=false;error.textContent='图标加载失败，请在中台重新上传';}window.lucide?.createIcons();
  }
  function snapshot(component=id,date=firstMonth()){
    const p=profile(component),s=schemes[p.scheme],m=info(date),rows=Math.ceil((m.offset+m.days)/7),c=document.createElement('canvas');c.width=c.height=300;const x=c.getContext('2d');x.beginPath();x.roundRect(0,0,300,300,24);x.clip();
    if(!p.transparent){x.fillStyle=p.background;x.fillRect(0,0,300,300);const img=images.get(p.backgroundImage);if(img){const scale=Math.max(300/img.width,300/img.height);x.drawImage(img,(300-img.width*scale)/2,(300-img.height*scale)/2,img.width*scale,img.height*scale);}}
    x.fillStyle=s.accent;x.fillRect(18,20,5,24);x.fillStyle=p.textColor;x.font='600 18px "Microsoft YaHei",sans-serif';let text=p.copy;while(text&&x.measureText(text).width>182)text=text.slice(0,-1);if(text!==p.copy)text=text.slice(0,-1)+'…';x.fillText(text,30,39);
    const checked=p.history.includes(dayKey());x.fillStyle=s.accent;x.font='500 16px "Microsoft YaHei",sans-serif';x.textAlign='right';x.globalAlpha=checked ? .65 : 1;x.fillText(checked?'已打卡':'打卡',282,39);x.globalAlpha=1;
    x.fillStyle='#9f90a6';x.font='12px "Microsoft YaHei",sans-serif';x.textAlign='center';['日','一','二','三','四','五','六'].forEach((v,i)=>x.fillText(v,34+i*39,64));
    const height=(214-(rows-1)*5)/rows;for(let n=1;n<=m.days;n++){const index=m.offset+n-1,px=18+index%7*39,py=74+Math.floor(index/7)*(height+5),day=m.prefix+String(n).padStart(2,'0'),done=p.history.includes(day);x.fillStyle=done?s.checked:day>dayKey()?s.future:s.normal;x.beginPath();x.roundRect(px,py,34,height,4);x.fill();if(done){const img=images.get(imageSource(component));if(img){const side=Math.min(24,height-6),scale=Math.min(side/img.width,side/img.height);x.drawImage(img,px+(34-img.width*scale)/2,py+(height-img.height*scale)/2,img.width*scale,img.height*scale);}}}
    return c.toDataURL('image/png');
  }
  function save(quiet=false,component=id){if(imageLoading||!ready(component)){if(!quiet)showToast('图片加载中，请稍后保存');return false;}const p=profile(component),image=snapshot(component);try{flow.save([{id:ownId(component),name:p.copy,type:'打卡组件',size:'2*2',image,words:p.copy}]);const stored=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}');if(stored.extraCatalog?.find(i=>i.id===ownId(component))?.image!==image)throw Error();if(!quiet)showToast('已保存到我的组件');return true;}catch(_){showToast('保存失败，请清理存储空间后重试');return false;}}
  function syncSaved(){const saved=flow.getSaved();for(const c of desktop.resources('monthly'))if(saved.some(i=>i.id===ownId(c.id)))save(true,c.id);}
  function refreshHome(){const grid=document.querySelector('.current-widget-grid'),filter=document.querySelector('[data-widget-filter].active')?.dataset.widgetFilter;if(!grid)return;grid.querySelectorAll('[data-monthly-open]').forEach(i=>i.remove());if(!['热门','月历'].includes(filter))return;for(const c of desktop.resources('monthly').filter(c=>c.enabled))grid.insertAdjacentHTML('beforeend',`<button type="button" class="current-widget-card" data-monthly-open="${esc(c.id)}"><img src="${snapshot(c.id)}" alt="月历打卡组件" /><span>${esc(c.name)}</span></button>`);}
  document.addEventListener('click',e=>{const entry=e.target.closest('[data-monthly-open]');if(entry){open(entry.dataset.monthlyOpen,entry.closest('[data-app-page="mine"]')?'mine':'home');return;}if(e.target.closest('[data-widget-filter]'))refreshHome();const b=e.target.closest('[data-monthly]');if(!b)return;const action=b.dataset.monthly;
    if(action==='back'){uploadToken++;imageLoading=false;if(returnPage==='desktop-demo')window.__desktopDemo.open();else setAppPage(returnPage);}
    if(action==='checkin')checkin();
    if(action==='scheme')change({scheme:b.dataset.scheme});
    if(action==='icon')change({iconId:b.dataset.id});
    if(action==='reset-color')change(b.dataset.field==='textColor'?{textColor:'#493c50'}:{background:'#ffffff',backgroundImage:''});
    if(action==='color')change({[b.dataset.field]:b.dataset.color,...(b.dataset.field==='background'?{backgroundImage:null}:{})});
    if(action==='save')save();
  });
  document.addEventListener('change',async e=>{const el=e.target;
    if(el.id==='monthlyCopy'){const copy=el.value.trim();if(copy)change({copy:copy.slice(0,40)});else{el.value=profile().copy;showToast('请填写文案');}}
    if(el.id==='monthlyTransparent')change({transparent:el.checked});
    if(el.dataset.monthlyColor)change({[el.dataset.monthlyColor]:el.value,...(el.dataset.monthlyColor==='background'?{backgroundImage:null}:{})});
    if(el.id!=='monthlyBackground')return;const file=el.files[0];if(!file)return;const token=++uploadToken;imageLoading=true;updatePreview();
    try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('请选择5MB以内的图片');const url=URL.createObjectURL(file),img=new Image();img.src=url;try{await img.decode();const scale=Math.min(1,700/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/png'),picture=new Image();picture.src=data;await picture.decode();if(token!==uploadToken)return;images.set(data,picture);change({backgroundImage:data,transparent:false});}finally{URL.revokeObjectURL(url);}}catch(error){if(token===uploadToken)showToast(error.message);}finally{if(token===uploadToken){imageLoading=false;updatePreview();syncSaved();}}
  });
  const oldRefresh=flow.refreshMine;flow.refreshMine=function(){oldRefresh.call(this);for(const w of flow.getSaved().filter(i=>i.id.startsWith('board-monthly-'))){const row=document.querySelector(`[data-fs="single-install"][data-id="${w.id}"]`)?.closest('.fs-component-row');if(row&&!row.querySelector('[data-monthly-open]'))row.querySelector('span').insertAdjacentHTML('beforeend',`<button type="button" class="fs-mini" data-monthly-open="${esc(w.id.slice('board-monthly-'.length))}">编辑</button>`);}};
  document.querySelector('.current-widget-cats').insertAdjacentHTML('beforeend','<button type="button" data-widget-filter="月历">月历</button>');
  window.addEventListener('desktop-components-changed',()=>{warmAll();if(active())renderControls();refreshHome();syncSaved();});
  function tick(){if(document.hidden||lastDay===dayKey())return;lastDay=dayKey();normalizeRecords();updatePreview();refreshHome();syncSaved();}
  setInterval(tick,15000);document.addEventListener('visibilitychange',tick);normalizeRecords();warmAll();refreshHome();flow.refreshMine();
  window.__monthlyComponent={open,snapshot,dayKey,info,checkin,profile,ready,totalDays:(component=id)=>history(component).length};
})();
