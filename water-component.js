(function(){
  'use strict';
  const key='aiyong-water-component-v1',flow=window.__themeWidgetFlow,desktop=window.__desktopComponents;
  let component=desktop.waterDefaultId;
  const widgetId=(size=state.size)=>(component===desktop.waterDefaultId?'board-water-checkin':'board-water-'+component)+(size==='2*4'?'--2x4':'');
  const design=()=>desktop.get(component)?.water||{};
  const currentPart=()=>state.done>=state.goal?'after':'before';
  function imageSource(part=currentPart()){const src=design().states?.[part]?.image||(part==='before'?design().image:'./assets/water-complete.png');return src==='./assets/water-panda.png'?window.waterPandaImage:src==='./assets/water-complete.png'?window.waterCompleteImage:src||'';}
  const displayCopy=()=>currentPart()==='after'?state.completedCopy:state.copy;
  const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const defaults={version:1,day:dayKey(),goal:8,done:0,copy:'今天也要好好喝水',completedCopy:'今天的喝水目标完成啦',textColor:'#4a705f',background:'#ffffff',backgroundImage:'',transparent:false};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>`<i data-lucide="${name}"></i>`;
  const validNumber=(v,field)=>Number.isInteger(v)&&v>=(field==='goal'?1:0)&&v<=99;
  function read(value){
    const s={...defaults,...design(),...value};
    s.size=s.size==='2*4'?'2*4':'2*2';
    for(const f of ['goal','done'])if(!validNumber(s[f],f))s[f]=defaults[f];
    for(const f of ['textColor','background'])if(!/^#[0-9a-f]{6}$/i.test(s[f]))s[f]=defaults[f];
    s.copy=value.copy??design().states?.before?.copy??s.copy;s.completedCopy=String(value.completedCopy??design().states?.after?.copy??defaults.completedCopy).trim().slice(0,40)||defaults.completedCopy;
    s.copy=String(s.copy||defaults.copy).trim().slice(0,40)||defaults.copy;
    s.backgroundImage=/^data:image\/(png|jpeg|webp|gif);base64,/.test(s.backgroundImage||'')?s.backgroundImage:'';
    s.transparent=Boolean(s.transparent);if(s.day!==dayKey()){s.day=dayKey();s.done=0;}return s;
  }
  let stored={};try{stored=JSON.parse(localStorage.getItem(key)||'{}');}catch(_){}
  let profiles=stored?.version===2?stored.profiles||{}:{[component]:stored};
  component=desktop.implementation(desktop.get(stored.selected))==='water'?stored.selected:component;
  let state=read(profiles[component]||{}),uploading=false,saving=false,uploadToken=0,rendering=false;
  const drawings={before:new Image(),after:new Image()},drawingSources={};
  const picturesReady=()=>['before','after'].every(part=>drawings[part].naturalWidth&&drawingSources[part]===imageSource(part));
  let background=null,backgroundSource='',backgroundLoading=false;
  const page=document.createElement('section');page.className='app-page water-page';page.dataset.appPage='water';document.querySelector('.app-phone').append(page);
  const active=()=>page.classList.contains('active');
  function persist(next,values={}){const nextProfiles={...profiles,[component]:{...(profiles[component]||{}),...values}};try{localStorage.setItem(key,JSON.stringify({...next,version:2,selected:component,profiles:nextProfiles}));profiles=nextProfiles;state=next;return true;}catch(_){showToast('存储空间不足，本次修改未保存');return false;}}
  function change(values){const reset=state.day===dayKey()?{}:{done:0},patch={day:dayKey(),...reset,...values};if(!persist({...state,...patch},patch))return false;loadIllustration();updatePreview();refreshHome();syncSaved();return true;}
  function rollover(){if(state.day===dayKey())return false;rendering=true;if(page.contains(document.activeElement))document.activeElement.blur();rendering=false;return change({day:dayKey(),done:0});}
  function setError(text=''){const el=page.querySelector('#waterError');if(el){el.hidden=!text;el.textContent=text;}}
  const stepper=field=>`<div class="water-stepper"><button type="button" data-water="minus" data-field="${field}" aria-label="减少${field==='goal'?'目标值':'已打卡数量'}" title="减少">${icon('minus')}</button><input id="${field==='goal'?'waterGoal':'waterDone'}" type="number" inputmode="numeric" min="${field==='goal'?1:0}" max="99" step="1" value="${state[field]}" data-water-number="${field}" aria-label="${field==='goal'?'目标值':'已打卡数量'}" /><button type="button" data-water="plus" data-field="${field}" aria-label="增加${field==='goal'?'目标值':'已打卡数量'}" title="增加">${icon('plus')}</button>${field==='done'?`<button type="button" class="water-reset" data-water="reset" title="重置今日记录" aria-label="重置今日记录">${icon('rotate-ccw')}</button>`:'<span style="width:26px"></span>'}</div>`;
  function swatches(field,colors){const text=field==='textColor';return WidgetAppearance.swatches({mode:text?'text':'background',field,value:state[field],colors,image:state.backgroundImage,action:'data-water',custom:'data-water-color',uploadId:text?'':'waterBackground'});}
  function open(id=component,size){
    rendering=true;
    // Do not let a focused old input commit its value into the newly opened day/profile.
    if(page.contains(document.activeElement))document.activeElement.blur();
    component=id;state=read(profiles[component]||{});persist(state,{day:dayKey(),...(profiles[component]?.day&&profiles[component].day!==dayKey()?{done:0}:{})});loadIllustration();loadBackground();rollover();uploadToken++;uploading=false;setAppPage('water');
    if(size)persist({...state,size},{size});
    page.innerHTML=`<header class="reminder-head"><button type="button" class="reminder-icon-button" data-water="back" aria-label="返回首页" title="返回">${icon('chevron-left')}</button><h2>喝水打卡</h2><span></span></header><div class="water-stage"><div class="water-widget"><img src="./assets/water-panda.png" alt="喝水的熊猫插画" /><strong></strong><span class="water-widget-count"><b>0</b><small>/8</small></span><span class="water-widget-progress" role="progressbar" aria-label="今日喝水进度"><i></i></span><button type="button" class="water-widget-add" data-water="drink" aria-label="喝一杯水" title="喝一杯水">${icon('plus')}</button></div></div><div class="water-controls"><div class="water-number-row"><label for="waterGoal">目标值（杯）</label>${stepper('goal')}</div><div class="water-number-row"><label for="waterDone">已打卡数量（杯）</label>${stepper('done')}</div><p class="water-error" id="waterError" role="alert" hidden></p><label class="reminder-field"><span id="waterCopyLabel">文字文案</span><input id="waterCopy" maxlength="40" value="${esc(state.copy)}" /></label>${WidgetAppearance.field('字体颜色',swatches('textColor',['#4a705f','#493c50','#ffffff','#dc7fa5','#7a92ae']))}${WidgetAppearance.field('背景',swatches('background',['#ffffff','#eef6f4','#fce8f2','#fff1e0','#eeeaf8']))}${WidgetAppearance.toggle({id:'waterTransparent',checked:state.transparent})}</div><footer class="water-footer"><button type="button" data-water="save">保存到我的组件</button></footer>`;
    page.querySelector('.water-controls').insertAdjacentHTML('afterbegin',`<div class="widget-size-control" role="group" aria-label="组件尺寸">${[['2*2','小号 2×2'],['2*4','中号 2×4']].map(([value,label])=>`<button type="button" data-water="size" data-size="${value}" aria-pressed="${state.size===value}">${label}</button>`).join('')}</div>`);updatePreview();window.lucide?.createIcons();rendering=false;
  }
  function updatePreview(){
    if(!active())return;
    const widget=page.querySelector('.water-widget');if(!widget)return;
    widget.querySelector('img').src=imageSource();widget.dataset.waterState=currentPart();
    widget.classList.toggle('water-wide',state.size==='2*4');page.querySelectorAll('[data-water="size"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.size===state.size));
    widget.style.setProperty('--water-bg',state.background);widget.style.setProperty('--water-text',state.textColor);
    widget.style.backgroundImage=!state.transparent&&state.backgroundImage?`url("${state.backgroundImage}")`:'';
    widget.classList.toggle('is-transparent',state.transparent);widget.querySelector('strong').textContent=displayCopy();
    const copyInput=page.querySelector('#waterCopy');if(copyInput!==document.activeElement)copyInput.value=displayCopy();page.querySelector('#waterCopyLabel').textContent=currentPart()==='after'?'文字文案（已完成）':'文字文案（未完成）';
    widget.querySelector('b').textContent=state.done;widget.querySelector('small').textContent='/'+state.goal;
    widget.querySelector('b').style.fontSize=state.done>=10?'18px':'21px';widget.querySelector('small').style.fontSize=state.goal>=10?'10px':'11px';
    widget.querySelector('.water-widget-progress i').style.width=Math.min(100,state.done/state.goal*100)+'%';
    const progress=widget.querySelector('[role="progressbar"]');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',state.goal);progress.setAttribute('aria-valuenow',Math.min(state.done,state.goal));progress.setAttribute('aria-valuetext',`已喝 ${state.done} 杯，目标 ${state.goal} 杯`);
    widget.querySelector('[data-water="drink"]').disabled=state.done===99;
    for(const field of ['goal','done']){
      const input=page.querySelector(`[data-water-number="${field}"]`);if(input!==document.activeElement)input.value=state[field];
      page.querySelector(`[data-water="minus"][data-field="${field}"]`).disabled=state[field]===(field==='goal'?1:0);
      page.querySelector(`[data-water="plus"][data-field="${field}"]`).disabled=state[field]===99;
    }
    page.querySelector('#waterTransparent').checked=state.transparent;WidgetAppearance.sync(page,state,state.backgroundImage);
    page.querySelector('[data-water="save"]').disabled=saving||uploading||backgroundLoading||!picturesReady();
  }
  function snapshot(size=state.size){
    const wide=size==='2*4',c=document.createElement('canvas');c.width=wide?600:300;c.height=300;const x=c.getContext('2d');x.beginPath();x.roundRect(0,0,c.width,300,26);x.clip();
    if(!state.transparent){x.fillStyle=state.background;x.fillRect(0,0,c.width,300);if(background&&backgroundSource===state.backgroundImage){const scale=Math.max(c.width/background.width,300/background.height);x.drawImage(background,(c.width-background.width*scale)/2,(300-background.height*scale)/2,background.width*scale,background.height*scale);}}
    const picture=drawings[currentPart()];if(picturesReady())x.drawImage(picture,0,0,300,300);
    x.fillStyle=state.textColor;x.font='18px "Microsoft YaHei",sans-serif';x.textBaseline='top';
    const captionX=wide?326:22;let line='',row=0;for(const char of displayCopy()){if(x.measureText(line+char).width>250&&line){x.fillText(line,captionX,22+row*26);line=char;row++;if(row===2)break;}else line+=char;}if(row<2)x.fillText(line,captionX,22+row*26);
    const offset=wide?220:0;x.font='600 30px "Microsoft YaHei",sans-serif';x.textAlign='center';x.fillText(state.done+'/'+state.goal,242+offset,164,80);
    x.fillStyle='#dce9e2';x.fillRect(220+offset,210,68,5);x.fillStyle='#78b596';x.fillRect(220+offset,210,68*Math.min(1,state.done/state.goal),5);
    x.fillStyle='#d3e9dc';x.beginPath();x.roundRect(210+offset,236,48,48,10);x.fill();x.strokeStyle='#689d80';x.lineWidth=3;x.beginPath();x.moveTo(234+offset,248);x.lineTo(234+offset,272);x.moveTo(222+offset,260);x.lineTo(246+offset,260);x.stroke();return c.toDataURL('image/png');
  }
  function save(quiet=false,size=state.size){
    if(uploading||backgroundLoading||!picturesReady()){if(!quiet)showToast('图片处理中，请稍后保存');return false;}
    try{const image=snapshot(size);flow.save([{id:widgetId(size),name:desktop.get(component)?.name||'喝水打卡',type:'打卡组件',size,image,words:displayCopy()}]);const data=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}');if(data.extraCatalog?.find(i=>i.id===widgetId(size))?.image!==image)throw new Error();if(!quiet)showToast('已保存到我的组件');return true;}catch(_){showToast('保存失败，请清理存储空间后重试');return false;}
  }
  function syncSaved(){try{for(const size of ['2*2','2*4'])if(JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}').saved?.[widgetId(size)])save(true,size);}catch(_){}
  }
  function refreshHome(){
    const filter=document.querySelector('[data-widget-filter].active')?.dataset.widgetFilter,grid=document.querySelector('.current-widget-grid');if(!grid)return;
    grid.querySelectorAll('[data-water-open]').forEach(el=>el.remove());if(!['热门','喝水'].includes(filter))return;
    for(const item of desktop.resources('water').filter(c=>c.enabled))for(const size of ['2*2','2*4'])grid.insertAdjacentHTML('beforeend',`<button type="button" class="current-widget-card" data-water-open="${esc(item.id)}" data-water-size="${size}" data-widget-size="${size}"><img src="${item.id===component?snapshot(size):esc(item.image)}" alt="喝水打卡组件" /><span>${esc(item.name)} · ${size==='2*2'?'小号 2×2':'中号 2×4'}</span></button>`);
  }
  function applyNumber(input){
    const field=input.dataset.waterNumber,value=input.value===''?NaN:Number(input.value);
    if(!validNumber(value,field)){input.setAttribute('aria-invalid','true');setError(`${field==='goal'?'目标值':'已打卡数量'}须为 ${field==='goal'?1:0} 至 99 的整数`);return false;}
    input.removeAttribute('aria-invalid');setError();return change({[field]:value});
  }
  document.addEventListener('click',e=>{
    const entry=e.target.closest('[data-water-open]');if(entry){open(entry.dataset.waterOpen==='true'?desktop.waterDefaultId:entry.dataset.waterOpen,entry.dataset.waterSize);return;}if(e.target.closest('[data-widget-filter]'))refreshHome();
    const b=e.target.closest('[data-water]');if(!b)return;
    if(b.dataset.water==='size')change({size:b.dataset.size});
    if(b.dataset.water==='back'){uploadToken++;uploading=false;setAppPage('home');}
    if(b.dataset.water==='reset-color'){const field=b.dataset.field;change(field==='textColor'?{textColor:design().textColor||defaults.textColor}:{background:design().background||defaults.background,backgroundImage:design().backgroundImage||''});}
    if(b.dataset.water==='drink'){rollover();if(state.done<99&&change({done:state.done+1}))showToast(state.done===state.goal?'今日目标已完成':'已记录一杯水');}
    if(['plus','minus'].includes(b.dataset.water)){const field=b.dataset.field,value=state[field]+(b.dataset.water==='plus'?1:-1);if(validNumber(value,field)){page.querySelector(`[data-water-number="${field}"]`).removeAttribute('aria-invalid');setError();change({[field]:value});}}
    if(b.dataset.water==='reset'){change({done:0});page.querySelector('#waterDone').removeAttribute('aria-invalid');setError();}
    if(b.dataset.water==='color'){const values={[b.dataset.field]:b.dataset.color};if(b.dataset.field==='background')values.backgroundImage='';change(values);}
    if(b.dataset.water==='clear-image')change({backgroundImage:''});
    if(b.dataset.water==='save'){for(const input of page.querySelectorAll('[data-water-number]'))if(!applyNumber(input)){input.focus();return;}save();}
  });
  document.addEventListener('change',async e=>{
    if(rendering)return;
    const input=e.target;if(input.dataset.waterNumber)applyNumber(input);
    if(input.id==='waterCopy'){const copy=input.value.trim().slice(0,40);if(!copy){input.value=displayCopy();setError('请填写文字文案');}else{setError();change(currentPart()==='after'?{completedCopy:copy}:{copy});}}
    if(input.id==='waterTransparent')change({transparent:input.checked});
    if(input.dataset.waterColor&&/^#[0-9a-f]{6}$/i.test(input.value))change({[input.dataset.waterColor]:input.value,...(input.dataset.waterColor==='background'?{backgroundImage:''}:{})});
    if(input.id!=='waterBackground')return;
    const file=input.files[0];if(!file)return;const token=++uploadToken;uploading=true;updatePreview();
    try{
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('请选择 5MB 以内的 PNG、JPG 或 WebP 图片');
      const url=URL.createObjectURL(file),img=new Image();img.src=url;
      try{await img.decode();if(token!==uploadToken)return;const scale=Math.min(1,700/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/png'),picture=new Image();picture.src=data;await picture.decode();if(token!==uploadToken)return;background=picture;backgroundSource=data;change({backgroundImage:data,transparent:false});setError();}finally{URL.revokeObjectURL(url);}
    }catch(error){if(token===uploadToken)setError(error.message||'背景图读取失败');}
    finally{if(token===uploadToken){uploading=false;updatePreview();syncSaved();}}
  });
  const oldRefresh=flow.refreshMine;flow.refreshMine=function(){oldRefresh.call(this);for(const c of desktop.resources('water'))for(const size of ['2*2','2*4']){const id=(c.id===desktop.waterDefaultId?'board-water-checkin':'board-water-'+c.id)+(size==='2*4'?'--2x4':''),row=document.querySelector(`[data-fs="single-install"][data-id="${id}"]`)?.closest('.fs-component-row');if(row&&!row.querySelector('[data-water-open]'))row.querySelector('span').insertAdjacentHTML('beforeend',`<button type="button" class="fs-mini" data-water-open="${esc(c.id)}" data-water-size="${size}">编辑</button>`);}};flow.refreshMine();
  document.querySelector('.current-widget-cats').insertAdjacentHTML('beforeend','<button type="button" data-widget-filter="喝水">喝水</button>');
  function tick(){if(!document.hidden)rollover();}setInterval(tick,15000);document.addEventListener('visibilitychange',tick);
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const data=JSON.parse(e.newValue||'{}');profiles=data.profiles||{[desktop.waterDefaultId]:data};state=read(profiles[component]||{});loadBackground();if(active())open();refreshHome();}catch(_){}
    });
  function loadBackground(){const url=state.backgroundImage;if(!url){background=null;backgroundSource='';backgroundLoading=false;return;}backgroundLoading=true;const img=new Image();img.src=url;img.decode().then(()=>{if(state.backgroundImage===url){background=img;backgroundSource=url;backgroundLoading=false;updatePreview();refreshHome();syncSaved();}}).catch(()=>{backgroundLoading=false;showToast('背景图加载失败，请重新上传');updatePreview();});}
  function loadIllustration(){for(const part of ['before','after']){const src=imageSource(part),picture=drawings[part];if(picture.getAttribute('src')===src)continue;picture.src=src;picture.decode().then(()=>{if(imageSource(part)!==src)return;drawingSources[part]=src;updatePreview();refreshHome();syncSaved();}).catch(()=>showToast('喝水状态图片加载失败，请在中台重新上传'));}}
  window.addEventListener('desktop-components-changed',()=>{state=read(profiles[component]||{});loadIllustration();loadBackground();if(active())open();refreshHome();syncSaved();});
  loadIllustration();loadBackground();refreshHome();persist(state,{day:state.day,...(profiles[component]?.day&&profiles[component].day!==dayKey()?{done:0}:{})});
  window.__waterComponent={open,snapshot,dayKey,currentPart,picturesReady,drink(id=component,size=state.size){if(id!==component||size!==state.size){open(id,size);setAppPage('desktop-demo');}rollover();if(state.done<99&&change({done:state.done+1}))showToast(state.done===state.goal?'今日目标已完成':'已记录一杯水');}};
})();
