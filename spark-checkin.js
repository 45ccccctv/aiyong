(function(){
  'use strict';
  const desktop=window.__desktopComponents,flow=window.__themeWidgetFlow,key='aiyong-checkin2-v1',parts=['before','after'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>`<i data-lucide="${name}"></i>`;
  const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const widgetId=id=>'board-checkin2-'+id;
  const imageSource=value=>window.sparkCheckinImages?.[value]||(/^data:image\/(png|jpeg|webp|gif);base64,/.test(value||'')?value:'');
  const blank={before:{image:'',text:'',textColor:'#77717f'},after:{image:'',text:'',textColor:'#a64c25'}};
  let state={version:1,profiles:{}};try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1&&saved.profiles)state=saved;}catch(_){}
  let current=desktop.checkin2DefaultId,editing='before',lastDay=dayKey(),uploading=false,uploadToken=0;
  const images=new Map(),pending=new Map(),failed=new Set();
  const page=document.createElement('section');page.className='app-page spark-page';page.dataset.appPage='spark-checkin';document.querySelector('.app-phone').append(page);
  const active=()=>page.classList.contains('active');
  const design=id=>desktop.get(id)?.checkin2||state.profiles[id]?.design||blank;
  const stateFor=(id=current)=>state.profiles[id]?.checkedDay===dayKey()?'after':'before';
  function profile(id=current){
    const defaults=design(id),overrides=state.profiles[id]?.overrides||{};
    return Object.fromEntries(parts.map(part=>{const value={...blank[part],...defaults[part],...overrides[part]};value.text=String(value.text||'').slice(0,40);if(!/^#[0-9a-f]{6}$/i.test(value.textColor))value.textColor=blank[part].textColor;return [part,value];}));
  }
  function persist(id,values){
    const next={...state,profiles:{...state.profiles,[id]:{...state.profiles[id],...values}}};
    try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch(_){showToast('存储空间不足，本次修改未保存');return false;}
  }
  const ready=(id=current)=>parts.every(part=>images.has(imageSource(profile(id)[part].image)));
  function warm(id){
    for(const part of parts){const src=imageSource(profile(id)[part].image);if(!src||images.has(src)||pending.has(src))continue;
      const img=new Image();img.src=src;pending.set(src,img.decode().then(()=>{images.set(src,img);failed.delete(src);}).catch(()=>failed.add(src)).finally(()=>{pending.delete(src);renderPreview();refreshHome();syncSaved(id);}));
    }
  }
  function widget(){const item=profile()[editing];return `<button type="button" class="spark-widget" data-spark="checkin" data-checkin-state="${editing}" style="--spark-text:${item.textColor}" aria-label="${stateFor()==='after'?'今日已打卡':'点击续火花'}"><img src="${esc(imageSource(item.image))}" alt="${editing==='before'?'打卡前背景':'打卡后背景'}" /><strong>${esc(item.text)}</strong></button>`;}
  function snapshot(id=current,part=stateFor(id)){
    const item=profile(id)[part],c=document.createElement('canvas');c.width=c.height=300;const x=c.getContext('2d');
    x.beginPath();x.roundRect(0,0,300,300,24);x.clip();x.fillStyle='#fff';x.fillRect(0,0,300,300);
    const img=images.get(imageSource(item.image));if(img){const scale=Math.max(300/img.width,300/img.height);x.drawImage(img,(300-img.width*scale)/2,(300-img.height*scale)/2,img.width*scale,img.height*scale);}
    x.fillStyle=item.textColor;x.font='20px "Microsoft YaHei",sans-serif';x.textAlign='left';x.textBaseline='top';let lines=[''];
    for(const char of item.text){if(x.measureText(lines[lines.length-1]+char).width>252)lines.push(char);else lines[lines.length-1]+=char;}
    lines.slice(0,4).forEach((line,i)=>x.fillText(line,24,24+i*26));return c.toDataURL('image/png');
  }
  function setError(text=''){const el=page.querySelector('.spark-error');if(el){el.textContent=text;el.hidden=!text;}}
  function renderPreview(){
    if(!active()||!page.querySelector('.spark-stage'))return;
    const item=profile()[editing];page.querySelector('.spark-stage').innerHTML=widget()+`<small>小号 2×2 · ${editing==='before'?'打卡前':'打卡后'}</small>`;
    page.querySelectorAll('[data-spark="edit-state"]').forEach(b=>b.setAttribute('aria-selected',b.dataset.state===editing));
    page.querySelector('[data-spark="undo"]').hidden=stateFor()!=='after';page.querySelector('[data-spark="save"]').disabled=uploading||!ready();
    page.querySelector('.spark-controls').inert=uploading;WidgetAppearance.sync(page,item,item.image);
    if(failed.has(imageSource(item.image)))setError('背景图加载失败，请重新上传图片');
    window.lucide?.createIcons();
  }
  function renderControls(){
    const item=profile()[editing],controls=page.querySelector('.spark-controls'),scroll=controls.scrollTop;
    controls.innerHTML=`<div class="spark-state-tabs" role="tablist" aria-label="编辑打卡状态">${parts.map(part=>`<button type="button" role="tab" data-spark="edit-state" data-state="${part}" aria-selected="${part===editing}" aria-controls="sparkStatePanel">${part==='before'?'打卡前':'打卡后'}</button>`).join('')}</div><div id="sparkStatePanel" role="tabpanel" aria-label="${editing==='before'?'打卡前设置':'打卡后设置'}"><label class="reminder-field spark-text-field"><span>文案</span><input id="sparkText" value="${esc(item.text)}" maxlength="40" aria-label="${editing==='before'?'打卡前':'打卡后'}文案" /></label>${WidgetAppearance.field('字体颜色',WidgetAppearance.swatches({field:'textColor',value:item.textColor,colors:['#77717f','#493c50','#ffffff','#dc7fa5','#a64c25','#4a705f'],action:'data-spark',custom:'data-spark-color'}))}${WidgetAppearance.field('背景',WidgetAppearance.swatches({mode:'background',field:'image',value:'#ffffff',colors:[],image:item.image,action:'data-spark',uploadId:'sparkBackground',resetAction:'reset-background'}))}</div><p class="spark-error" role="alert" hidden></p>`;
    controls.scrollTop=scroll;renderPreview();
  }
  function open(id=desktop.checkin2DefaultId){
    current=id;editing=stateFor(id);uploadToken++;uploading=false;warm(id);
    page.innerHTML=`<header class="reminder-head"><button type="button" class="reminder-icon-button" data-spark="back" title="返回" aria-label="返回首页">${icon('chevron-left')}</button><h2>${esc(desktop.get(id)?.name||'自定义打卡组件2')}</h2><button type="button" class="reminder-icon-button" data-spark="undo" title="撤销今日打卡" aria-label="撤销今日打卡" hidden>${icon('rotate-ccw')}</button></header><div class="spark-stage"></div><div class="spark-controls"></div><footer class="spark-footer"><button type="button" data-spark="save">保存到我的组件</button></footer>`;
    setAppPage('spark-checkin');renderControls();refreshAnnotations();
  }
  function syncSaved(id){
    if(!ready(id)||!flow.getSaved().some(w=>w.id===widgetId(id)))return;
    flow.update(widgetId(id),{image:snapshot(id),words:profile(id)[stateFor(id)].text});
  }
  function refresh(){renderPreview();refreshHome();syncSaved(current);}
  function setOverride(part,field,value,id=current){
    const overrides=structuredClone(state.profiles[id]?.overrides||{});overrides[part]??={};
    if(value===undefined)delete overrides[part][field];else overrides[part][field]=value;
    if(!persist(id,{overrides}))return false;warm(id);refresh();return true;
  }
  function checkin(id=current){
    if(stateFor(id)==='after'){if(id===current&&active()){editing='after';renderControls();}showToast('今天已经续过火花啦');return;}
    if(!persist(id,{checkedDay:dayKey()}))return;
    if(id===current&&active()){editing='after';renderControls();}refreshHome();syncSaved(id);showToast('今天的火花，续上啦');
  }
  function save(){
    if(uploading||!ready()){showToast('图片处理中，请稍后保存');return;}
    if(!parts.every(part=>profile()[part].text.trim())){setError('请填写打卡前和打卡后的文案');return;}
    if(!persist(current,{design:structuredClone(design(current))}))return;
    try{const image=snapshot(),item={id:widgetId(current),name:desktop.get(current)?.name||'自定义打卡组件2',type:'打卡组件',size:'2*2',image,words:profile()[stateFor()].text};flow.save([item]);const saved=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}');if(!saved.saved?.[item.id]||saved.extraCatalog?.find(w=>w.id===item.id)?.image!==image)throw Error();showToast('已保存到我的组件');}catch(_){setError('保存失败，请清理存储空间后重试');}
  }
  function refreshHome(){
    const grid=document.querySelector('.current-widget-grid'),filter=document.querySelector('[data-widget-filter].active')?.dataset.widgetFilter;if(!grid)return;
    grid.querySelectorAll('[data-spark-open]').forEach(el=>el.remove());if(!['热门','打卡'].includes(filter))return;
    for(const c of desktop.resources('checkin2').filter(c=>c.enabled))grid.insertAdjacentHTML('beforeend',`<button type="button" class="current-widget-card" data-spark-open="${esc(c.id)}" data-widget-size="2*2"><img src="${ready(c.id)?snapshot(c.id):esc(imageSource(c.image))}" alt="续火花打卡组件" /><span>${esc(c.name)}</span></button>`);
  }
  document.addEventListener('click',e=>{
    const entry=e.target.closest('[data-spark-open]');if(entry){open(entry.dataset.sparkOpen);return;}if(e.target.closest('[data-widget-filter]'))refreshHome();
    const b=e.target.closest('[data-spark]');if(!b)return;
    if(b.dataset.spark==='back'){uploadToken++;uploading=false;setAppPage('home');}
    if(b.dataset.spark==='edit-state'&&!uploading){editing=b.dataset.state;renderControls();}
    if(b.dataset.spark==='checkin'&&!uploading)checkin();
    if(b.dataset.spark==='undo'){if(persist(current,{checkedDay:''})){editing='before';renderControls();refresh();}}
    if(b.dataset.spark==='color')setOverride(editing,'textColor',b.dataset.color);
    if(b.dataset.spark==='reset-color')setOverride(editing,'textColor',undefined);
    if(b.dataset.spark==='reset-background')setOverride(editing,'image',undefined);
    if(b.dataset.spark==='save')save();
  });
  document.addEventListener('change',async e=>{
    const el=e.target;
    if(el.id==='sparkText'){const text=el.value.trim();if(!text){setError('请填写文案');el.value=profile()[editing].text;}else{setError();setOverride(editing,'text',text.slice(0,40));}}
    if(el.dataset.sparkColor&&/^#[0-9a-f]{6}$/i.test(el.value))setOverride(editing,'textColor',el.value);
    if(el.id!=='sparkBackground')return;const file=el.files[0];if(!file)return;
    const id=current,part=editing,token=++uploadToken;uploading=true;renderPreview();setError();
    try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw Error('请选择 5MB 以内的 PNG、JPG 或 WebP 图片');
      const src=URL.createObjectURL(file),img=new Image();img.src=src;
      try{await img.decode();if(token!==uploadToken||!active())return;const scale=Math.min(1,700/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/webp',.88),picture=new Image();picture.src=data;await picture.decode();if(token!==uploadToken||!active())return;images.set(data,picture);setOverride(part,'image',data,id);}finally{URL.revokeObjectURL(src);}
    }catch(error){if(token===uploadToken)setError(error.message||'图片读取失败');}finally{if(token===uploadToken){uploading=false;renderPreview();syncSaved(id);}}
  });
  const previousRefresh=flow.refreshMine;flow.refreshMine=function(){previousRefresh.call(this);for(const item of flow.getSaved().filter(w=>w.id.startsWith('board-checkin2-'))){const row=document.querySelector(`[data-fs="single-install"][data-id="${item.id}"]`)?.closest('.fs-component-row');if(row&&!row.querySelector('[data-spark-open]'))row.querySelector('span').insertAdjacentHTML('beforeend',`<button type="button" class="fs-mini" data-spark-open="${esc(item.id.slice('board-checkin2-'.length))}">编辑</button>`);}};
  function update(){const ids=new Set([...desktop.resources('checkin2').map(c=>c.id),...flow.getSaved().filter(w=>w.id.startsWith('board-checkin2-')).map(w=>w.id.slice('board-checkin2-'.length))]);for(const id of ids){warm(id);syncSaved(id);}refreshHome();if(active())renderControls();}
  function rollover(){if(lastDay===dayKey())return;lastDay=dayKey();if(active()){editing=stateFor();renderControls();}update();}
  setInterval(()=>{if(!document.hidden)rollover();},15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)rollover();});
  window.addEventListener('desktop-components-changed',update);
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const next=JSON.parse(e.newValue||'null');if(next?.version===1&&next.profiles){state=next;if(active())editing=stateFor();update();}}catch(_){}});
  update();flow.refreshMine();window.__sparkCheckin={open,checkin,snapshot,profile,stateFor,ready,dayKey};
})();
