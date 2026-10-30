(function(){
  'use strict';
  const key='aiyong-monthly-component-v1',desktop=window.__desktopComponents,flow=window.__themeWidgetFlow;
  const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const firstMonth=()=>new Date(new Date().getFullYear(),new Date().getMonth(),1,12);
  const info=d=>({offset:new Date(d.getFullYear(),d.getMonth(),1,12).getDay(),days:new Date(d.getFullYear(),d.getMonth()+1,0,12).getDate(),prefix:dayKey(d).slice(0,8)});
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>`<i data-lucide="${name}"></i>`;
  let state={version:1,selected:desktop.monthlyDefaultId,profiles:{}};try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1&&saved.profiles&&typeof saved.profiles==='object')state=saved;}catch(_){}
  let id=state.selected||desktop.monthlyDefaultId,month=firstMonth(),lastDay=dayKey(),imageLoading=false,uploadToken=0;
  const page=document.createElement('section');page.className='app-page monthly-page';page.dataset.appPage='monthly';document.querySelector('.app-phone').append(page);
  const images=new Map(),pending=new Map();
  const defaults={copy:'每天锻炼一小时',icon:'custom',iconImage:''};
  const design=(component=id)=>({...defaults,...desktop.get(component)?.monthly});
  function profile(component=id){
    const p=state.profiles[component]||{},bg=p.backgroundImage===null?'':p.backgroundImage||design(component).background;return {copy:p.copy??design(component).copy,records:Array.isArray(p.records)?p.records.filter(d=>d.startsWith(dayKey().slice(0,8))):[],textColor:/^#[0-9a-f]{6}$/i.test(p.textColor||'')?p.textColor:'#493c50',background:/^#[0-9a-f]{6}$/i.test(p.background||'')?p.background:'#ffffff',transparent:!!p.transparent,backgroundImage:/^data:image\/(png|jpeg|webp|gif);base64,/.test(bg||'')?bg:''};
  }
  const active=()=>page.classList.contains('active');
  const ownWidgetId=(component=id)=>'board-monthly-'+component;
  function imageSource(component=id){
    const src=design(component).iconImage;return /^data:image\//.test(src||'')?src:'';
  }
  const decorationSource=(component=id)=>/^data:image\/(png|jpeg|webp|gif);base64,/.test(design(component).decoration||'')?design(component).decoration:'';
  function warm(url){
    if(!url||images.has(url)||pending.has(url))return;
    const image=new Image();image.src=url;pending.set(url,image.decode().then(()=>{images.set(url,image);updatePreview();refreshHome();syncSaved();}).catch(()=>showToast('月历图片加载失败，请在中台重新配置')));
  }
  function warmAll(){desktop.resources('monthly').forEach(c=>{warm(imageSource(c.id));warm(profile(c.id).backgroundImage);warm(decorationSource(c.id));});}
  function persist(next){try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch(_){showToast('存储空间不足，修改未保存');return false;}}
  function change(values){const next=structuredClone(state);next.profiles[id]={...(next.profiles[id]||{}),...values};if(!persist(next))return false;updatePreview();refreshHome();syncSaved();return true;}
  function marker(component=id){const src=imageSource(component);return src?`<img src="${esc(src)}" alt="打卡图标" />`:'';}
  function clearPastMonths(){const next=structuredClone(state);for(const p of Object.values(next.profiles))if(Array.isArray(p.records))p.records=p.records.filter(d=>d.startsWith(dayKey().slice(0,8)));if(JSON.stringify(next)!==JSON.stringify(state))persist(next);}
  function widget(component=id,date=month){
    const p=profile(component),d=design(component),m=info(date),today=dayKey(),rows=Math.ceil((m.offset+m.days)/7);
    const cells=Array.from({length:rows*7},(_,index)=>{const n=index-m.offset+1;if(n<1||n>m.days)return '<span class="monthly-blank"></span>';const key=m.prefix+String(n).padStart(2,'0'),checked=p.records.includes(key),current=key===today,tag=current?'button':'span';return `<${tag} ${current?'type="button" data-monthly="checkin" aria-pressed="'+checked+'"':''} class="${current?'is-today ':''}${checked?'is-checked ':''}${key>today?'monthly-future':''}" aria-label="${key}${checked?' 已打卡':''}" title="${key}${checked?' 已打卡':''}">${checked?marker(component):''}</${tag}>`;}).join('');
    return `<div class="monthly-widget ${p.transparent?'is-transparent':''}" style="--monthly-bg:${p.background};--monthly-text:${p.textColor};--monthly-icon:${esc(d.iconColor)};--month-rows:${rows};${!p.transparent&&p.backgroundImage?'background-image:url(&quot;'+esc(p.backgroundImage)+'&quot;)':''}">${decorationSource(component)?`<img class="monthly-decoration" src="${esc(decorationSource(component))}" alt="月历装饰层" />`:''}<header><strong title="${esc(p.copy)}">${esc(p.copy)}</strong></header><div class="monthly-week">${['日','一','二','三','四','五','六'].map(t=>`<span>${t}</span>`).join('')}</div><div class="monthly-grid">${cells}</div></div>`;
  }
  function swatches(field,colors){const p=profile(),text=field==='textColor';return WidgetAppearance.swatches({mode:text?'text':'background',field,value:p[field],colors,image:p.backgroundImage,action:'data-monthly',custom:'data-monthly-color',uploadId:text?'':'monthlyBackground'});}
  function open(component=id){clearPastMonths();id=component;month=firstMonth();uploadToken++;imageLoading=false;persist({...state,selected:id});warmAll();setAppPage('monthly');const p=profile();
    page.innerHTML=`<header class="reminder-head"><button type="button" class="reminder-icon-button" data-monthly="back" aria-label="返回首页" title="返回">${icon('chevron-left')}</button><h2>月历打卡</h2><span></span></header><div class="monthly-stage"></div><div class="monthly-controls"><label class="reminder-field"><span>文案</span><input id="monthlyCopy" maxlength="40" value="${esc(p.copy)}" /></label>${WidgetAppearance.field('字体颜色',swatches('textColor',['#493c50','#ffffff','#dc7fa5','#7b9b8d','#8d7ca6']))}${WidgetAppearance.field('背景',swatches('background',['#ffffff','#fff1e0','#fce8f2','#e9f2f0','#eeeaf8']))}${WidgetAppearance.toggle({id:'monthlyTransparent',checked:p.transparent})}</div><footer class="monthly-footer"><button type="button" data-monthly="save">保存到我的组件</button></footer>`;updatePreview();
  }
  function updatePreview(){if(!active())return;month=firstMonth();const p=profile(),checked=p.records.includes(dayKey());page.querySelector('.monthly-stage').innerHTML=widget()+`<div class="monthly-toolbar"><span>${month.getFullYear()}年${month.getMonth()+1}月</span></div><p class="monthly-status">本月已打卡 ${p.records.length} 天</p><button type="button" class="monthly-action" data-monthly="checkin">${checked?'撤销今日打卡':'今日打卡'}</button>`;page.querySelector('#monthlyTransparent').checked=p.transparent;WidgetAppearance.sync(page,p,p.backgroundImage);page.querySelector('[data-monthly="save"]').disabled=imageLoading;window.lucide?.createIcons();}
  function snapshot(component=id,date=month){
    const p=profile(component),d=design(component),m=info(date),rows=Math.ceil((m.offset+m.days)/7),c=document.createElement('canvas');c.width=c.height=300;const x=c.getContext('2d');x.beginPath();x.roundRect(0,0,300,300,24);x.clip();
    if(!p.transparent){x.fillStyle=p.background;x.fillRect(0,0,300,300);const bg=images.get(p.backgroundImage);if(bg){const scale=Math.max(300/bg.width,300/bg.height);x.drawImage(bg,(300-bg.width*scale)/2,(300-bg.height*scale)/2,bg.width*scale,bg.height*scale);}}
    const art=images.get(decorationSource(component));if(art){const scale=Math.min(300/art.width,300/art.height);x.drawImage(art,(300-art.width*scale)/2,(300-art.height*scale)/2,art.width*scale,art.height*scale);}
    x.fillStyle='#eda169';x.beginPath();x.roundRect(18,20,5,24,2);x.fill();x.fillStyle=p.textColor;x.font='600 18px "Microsoft YaHei",sans-serif';let copy=p.copy;while(copy.length&&x.measureText(copy).width>245)copy=copy.slice(0,-1);if(copy!==p.copy)copy=copy.slice(0,-1)+'…';x.fillText(copy,30,39);
    x.fillStyle='#9f90a6';x.font='12px "Microsoft YaHei",sans-serif';x.textAlign='center';['日','一','二','三','四','五','六'].forEach((v,i)=>x.fillText(v,34+i*39,64));
    const height=(214-(rows-1)*5)/rows;for(let n=1;n<=m.days;n++){const index=m.offset+n-1,px=18+index%7*39,py=74+Math.floor(index/7)*(height+5),day=m.prefix+String(n).padStart(2,'0'),checked=p.records.includes(day);x.fillStyle=checked?'#f8dfcb':day>dayKey()?'#fbf3ec':'#f9e9dc';x.beginPath();x.roundRect(px,py,34,height,4);x.fill();if(checked){const img=images.get(imageSource(component));if(img){const side=Math.min(24,height-6),scale=Math.min(side/img.width,side/img.height);x.drawImage(img,px+(34-img.width*scale)/2,py+(height-img.height*scale)/2,img.width*scale,img.height*scale);}}}
    return c.toDataURL('image/png');
  }
  function save(quiet=false){const p=profile();if(imageLoading||[imageSource(),p.backgroundImage,decorationSource()].some(src=>src&&!images.has(src))||!imageSource()){if(!quiet)showToast('图片加载中，请稍后保存');return false;}const image=snapshot(id,firstMonth());try{flow.save([{id:ownWidgetId(),name:p.copy,type:'月历打卡',size:'2*2',image,words:p.copy}]);if(JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}').extraCatalog?.find(c=>c.id===ownWidgetId())?.image!==image)throw new Error();if(!quiet)showToast('已保存到我的组件');return true;}catch(_){showToast('保存失败，请清理存储空间后重试');return false;}}
  function syncSaved(){const selected=id;try{const saved=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}').saved||{};for(const c of desktop.resources('monthly'))if(saved[ownWidgetId(c.id)]){id=c.id;save(true);}}catch(_){}finally{id=selected;}}
  function refreshHome(){const grid=document.querySelector('.current-widget-grid'),filter=document.querySelector('[data-widget-filter].active')?.dataset.widgetFilter;if(!grid)return;grid.querySelectorAll('.current-widget-card[data-monthly-open]').forEach(el=>el.remove());if(!['热门','月历'].includes(filter))return;desktop.resources('monthly').filter(c=>c.enabled).forEach(c=>grid.insertAdjacentHTML('beforeend',`<button type="button" class="current-widget-card" data-monthly-open="${esc(c.id)}"><img src="${snapshot(c.id,firstMonth())}" alt="月历打卡组件" /><span>${esc(c.name)}</span></button>`));}
  document.addEventListener('click',e=>{const entry=e.target.closest('[data-monthly-open]');if(entry){open(entry.dataset.monthlyOpen);return;}if(e.target.closest('[data-widget-filter]'))refreshHome();const b=e.target.closest('[data-monthly]');if(!b)return;const action=b.dataset.monthly;
    if(action==='back'){uploadToken++;imageLoading=false;setAppPage('home');}
    if(action==='reset-color')change(b.dataset.field==='textColor'?{textColor:'#493c50'}:{background:'#ffffff',backgroundImage:''});
    if(action==='checkin'){const today=dayKey(),records=profile().records,done=records.includes(today);if(change({records:done?records.filter(d=>d!==today):[...records,today]}))showToast(done?'已撤销今日打卡':'今日打卡成功');}
    if(action==='color')change({[b.dataset.field]:b.dataset.color,...(b.dataset.field==='background'?{backgroundImage:null}:{})});
    if(action==='clear-background')change({backgroundImage:null});if(action==='save')save();
  });
  document.addEventListener('change',async e=>{const el=e.target;
    if(el.id==='monthlyCopy'){const copy=el.value.trim();if(!copy){el.value=profile().copy;showToast('请填写文案');}else change({copy:copy.slice(0,40)});}
    if(el.id==='monthlyTransparent')change({transparent:el.checked});
    if(el.dataset.monthlyColor)change({[el.dataset.monthlyColor]:el.value,...(el.dataset.monthlyColor==='background'?{backgroundImage:null}:{})});
    if(el.id!=='monthlyBackground')return;const file=el.files[0];if(!file)return;const token=++uploadToken;imageLoading=true;updatePreview();
    try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('请选择 5MB 以内的 PNG、JPG 或 WebP 图片');const url=URL.createObjectURL(file),img=new Image();img.src=url;try{await img.decode();const scale=Math.min(1,700/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/png'),picture=new Image();picture.src=data;await picture.decode();if(token!==uploadToken)return;images.set(data,picture);change({backgroundImage:data,transparent:false});}finally{URL.revokeObjectURL(url);}}catch(error){if(token===uploadToken)showToast(error.message);}finally{if(token===uploadToken){imageLoading=false;updatePreview();syncSaved();}}
  });
  const oldRefresh=flow.refreshMine;flow.refreshMine=function(){oldRefresh.call(this);document.querySelectorAll('.fs-mine-energy [data-fs="single-install"]').forEach(b=>{if(!b.dataset.id.startsWith('board-monthly-'))return;const row=b.closest('.fs-component-row');if(!row.querySelector('[data-monthly-open]'))row.querySelector('span').insertAdjacentHTML('beforeend',`<button type="button" class="fs-mini" data-monthly-open="${esc(b.dataset.id.slice('board-monthly-'.length))}">编辑</button>`);});};flow.refreshMine();
  document.querySelector('.current-widget-cats').insertAdjacentHTML('beforeend','<button type="button" data-widget-filter="月历">月历</button>');
  window.addEventListener('desktop-components-changed',()=>{warmAll();updatePreview();refreshHome();syncSaved();});
  const tick=()=>{if(document.hidden||lastDay===dayKey())return;lastDay=dayKey();month=firstMonth();clearPastMonths();updatePreview();refreshHome();syncSaved();};setInterval(tick,15000);document.addEventListener('visibilitychange',tick);
  clearPastMonths();warmAll();refreshHome();window.__monthlyComponent={open,snapshot,dayKey,info,checkin(component=id){clearPastMonths();const previous=id;id=component;try{const today=dayKey(),records=profile().records,done=records.includes(today);if(change({records:done?records.filter(d=>d!==today):[...records,today]}))showToast(done?'已撤销今日打卡':'今日打卡成功');}finally{id=previous;}}};
})();
