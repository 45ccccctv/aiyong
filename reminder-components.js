(function(){
  'use strict';
  const key='aiyong-reminder-components-v1',flow=window.__themeWidgetFlow;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const icons={flame:['火花','🔥'],droplets:['喝水','💧'],'book-open':['阅读','📖'],footprints:['运动','👟'],heart:['关心','❤']};
  const icon=name=>`<i data-lucide="${icons[name]||['list-todo','plus','check','chevron-left','chevron-right','settings-2','x','pencil','trash-2','sparkles','image-plus','calendar-check','rotate-ccw','volume-2'].includes(name)?name:'flame'}"></i>`;
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const appearance=()=>({textColor:'#493c50',background:'#ffffff',transparent:false});
  const initial={version:1,list:{title:'今天的小目标',...appearance()},habit:{...appearance()},selected:'spark',items:[{id:'task-spark',name:'记得续火花',icon:'flame',daily:true,time:'21:00',remind:true,date:dateKey(new Date()),done:[]},{id:'task-water',name:'喝一杯水',icon:'droplets',daily:true,time:'10:00',remind:false,date:dateKey(new Date()),done:[]}],habits:[{id:'spark',name:'续火花',icon:'flame',time:'21:00',remind:true,records:[]}],notified:[]};
  let state=structuredClone(initial);try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1&&Array.isArray(saved.items)&&Array.isArray(saved.habits))state=saved;}catch(_){}
  state.habit={sound:true,checkMode:'once',counter:'total',backgroundImage:'',...state.habit};
  state.habit.titleOverride??=!!state.habits.find(h=>h.id===state.selected&&h.name!=='续火花');
  state.habit.textColorOverride??=state.habit.textColor!=='#493c50';
  if(state.habit.backgroundImage!==null&&!/^data:image\/(png|jpeg|webp);base64,/.test(state.habit.backgroundImage))state.habit.backgroundImage='';
  state.habits.forEach(h=>{h.counts={...Object.fromEntries(h.records.map(d=>[d,1])),...h.counts};h.image=/^data:image\/(png|jpeg|webp);base64,/.test(h.image||'')?h.image:'';});
  const pictures=new Map();let photoLoading=false,audio=null,calendarMonth=new Date(),annual=false;
  const catPicture=new Image();catPicture.src=window.checkinCatImage;
  const desktop=window.__desktopComponents;
  let checkinId=state.checkinComponentId||desktop.checkinDefaultId;
  const fallbackStates={before:{image:window.checkinCatImage},after:{image:window.checkinCatDoneImage}};
  const imageData=url=>url==='./assets/checkin-cat.png'?window.checkinCatImage:url==='./assets/checkin-cat-done.png'?window.checkinCatDoneImage:/^data:image\/(png|jpeg|webp|gif);base64,/.test(url||'')?url:'';
  function variant(id=checkinId){const status=count(habit())?'after':'before',item=desktop.get(id)?.checkinStates?.[status]||fallbackStates[status];return {image:imageData(item.image)||fallbackStates[status].image,background:imageData(item.background)};}
  const checkinTitle=(id=checkinId)=>state.habit.titleOverride?habit()?.name||'每日打卡':desktop.get(id)?.checkin?.title||'今天也要夸夸自己';
  const appearanceFor=(id=checkinId)=>({...state[mode],textColor:mode==='habit'&&!state.habit.textColorOverride?desktop.get(id)?.checkin?.textColor||'#493c50':state[mode].textColor});
  const habitBackground=(id=checkinId)=>state.habit.backgroundImage===null?'':state.habit.backgroundImage||variant(id).background;
  const loadingPictures=new Map();
  function warmCheckinPictures(){
    for(const c of desktop.resources('checkin'))for(const item of Object.values(desktop.get(c.id)?.checkinStates||{})){
      for(const source of [item.image,item.background]){const url=imageData(source);if(!url||pictures.has(url)||loadingPictures.has(url))continue;
      const img=new Image();img.src=url;loadingPictures.set(url,img.decode().then(()=>{pictures.set(url,img);render();refreshHome();syncSaved();}).catch(()=>showToast('打卡状态图片加载失败，请在中台重新上传')));}
    }
  }
  let mode='habit',editIcon='flame',editId=null,sheetMode='',focusBefore=null,saving=false,lastDay=dateKey(new Date());
  const phone=document.querySelector('.phone-shell'),page=document.createElement('section');page.className='app-page reminder-page';page.dataset.appPage='reminder';document.querySelector('.app-phone').append(page);
  const overlay=document.createElement('div');overlay.className='reminder-overlay';overlay.hidden=true;phone.append(overlay);
  const detail=document.createElement('section');detail.className='app-page reminder-detail-page';detail.dataset.appPage='reminder-detail';document.querySelector('.app-phone').append(detail);
  const active=()=>page.classList.contains('active'),habit=()=>state.habits.find(h=>h.id===state.selected)||state.habits[0];
  const completed=(item,day=dateKey(new Date()))=>item.daily?item.done.includes(day):item.done.length>0;
  function streak(records,now=new Date()){
    const days=new Set(records),d=new Date(now);d.setHours(12,0,0,0);
    if(!days.has(dateKey(d)))d.setDate(d.getDate()-1);
    let count=0;while(days.has(dateKey(d))){count++;d.setDate(d.getDate()-1);}return count;
  }
  function commit(next){
    try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch(_){showToast('存储空间不足，修改未保存');return false;}
  }
  function mutate(fn){const next=structuredClone(state);fn(next);if(!commit(next))return false;render();renderDetail();refreshHome();return true;}
  const count=(h,day=dateKey(new Date()))=>h?.records.includes(day)?Number(h.counts?.[day]||1):0;
  const total=h=>h.records.reduce((sum,day)=>sum+count(h,day),0);
  const displayed=h=>h.records.length;
  function sound(){
    if(!state.habit.sound)return;
    try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(640,audio.currentTime);o.frequency.exponentialRampToValueAtTime(960,audio.currentTime+.12);g.gain.setValueAtTime(.06,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.2);}catch(_){}
  }
  function performCheckin(undo=false){
    const h=habit(),day=dateKey(new Date());if(!h)return;
    if(!undo&&count(h)){showToast('今天已经打卡啦');return;}
    if(undo&&!count(h))return;
    if(mutate(s=>{const r=s.habits.find(i=>i.id===h.id);r.counts??=Object.fromEntries(r.records.map(d=>[d,1]));const next=Math.max(0,count(r)+(undo?-1:1));if(next){r.counts[day]=next;if(!r.records.includes(day))r.records.push(day);}else{delete r.counts[day];r.records=r.records.filter(d=>d!==day);}})){
      showToast(undo?'已撤销本次打卡':'今日打卡成功');syncSaved();
    }
  }
  function calendar(h,now){
    const m=monthCells(now),today=dateKey(new Date());
    return `<div class="reminder-week">${['一','二','三','四','五','六','日'].map(d=>`<span>${d}</span>`).join('')}</div><div class="reminder-days">${Array.from({length:m.offset},()=>'<span class="blank"></span>').join('')}${Array.from({length:m.days},(_,i)=>{const key=m.prefix+String(i+1).padStart(2,'0'),tag=key===today?'button':'span';return `<${tag} ${tag==='button'?'type="button" data-reminder="checkin" title="今日打卡"':''} class="${h.records.includes(key)?'checked ':''}${key===today?'today':''}" aria-label="${key}${count(h,key)?' 已打卡 '+count(h,key)+' 次':''}">${i+1}</${tag}>`;}).join('')}</div>`;
  }
  function monthCells(now=new Date()){
    const start=new Date(now.getFullYear(),now.getMonth(),1),days=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
    return {offset:(start.getDay()+6)%7,days,prefix:dateKey(start).slice(0,8)};
  }
  function widget(){
    const a=appearanceFor(),h=habit(),today=dateKey(new Date());
    if(mode==='list'){
      const sorted=[...state.items].sort((a,b)=>Number(completed(a))-Number(completed(b))),done=state.items.filter(i=>completed(i)).length;
      return `<div class="reminder-widget ${a.transparent?'is-transparent':''}" style="--reminder-bg:${esc(a.background)};--reminder-text:${esc(a.textColor)}"><header>${icon('list-todo')}<strong>${esc(a.title)}</strong><button type="button" class="reminder-icon-button" data-reminder="new" title="添加事项" aria-label="添加事项">${icon('plus')}</button></header>${sorted.slice(0,3).map(i=>`<div class="reminder-task ${completed(i)?'is-done':''}"><label><input type="checkbox" data-reminder-check="${esc(i.id)}" ${completed(i)?'checked':''} aria-label="完成${esc(i.name)}" />${icon(i.icon)}<span class="task-text">${esc(i.name)}</span></label></div>`).join('')||'<div class="reminder-empty">今天，从一件小事开始</div>'}<footer><span>已完成 ${done}/${state.items.length}</span><button type="button" data-reminder="manage">${state.items.length>3?'查看全部':'管理清单'}</button></footer></div>`;
    }
    if(!h)return '<div class="reminder-widget"><div class="reminder-empty">新的坚持，从今天开始</div><button type="button" class="reminder-primary" data-reminder="new">添加打卡项</button></div>';
    const checked=h.records.includes(today),current=variant();
    return `<button type="button" data-reminder="checkin" aria-label="${checked?'今日已打卡':'今日打卡'}" class="reminder-widget reminder-habit reminder-picture-widget simple-checkin-widget ${a.transparent?'is-transparent':''}" data-checkin-state="${checked?'after':'before'}" style="--reminder-bg:${esc(a.background)};--reminder-text:${esc(a.textColor)};${!a.transparent&&habitBackground()?'background-image:url(&quot;'+esc(habitBackground())+'&quot;);':''}"><img class="simple-checkin-art" src="${esc(current.image)}" alt="" /><strong>${esc(checkinTitle())}</strong><div class="habit-streak"><b>${displayed(h)}</b><span>天</span></div></button><button type="button" class="simple-checkin-trigger" data-reminder="checkin" ${checked?'disabled':''}>${checked?'今日已打卡':'今日打卡'}</button>`;
  }
  function colors(field,palette){const a=appearanceFor(),text=field==='textColor';return WidgetAppearance.swatches({mode:text?'text':'background',field,value:a[field],colors:palette,image:habitBackground(),action:'data-reminder',custom:'data-reminder-color',uploadId:text?'':'habitBackground'});}
  function render(){
    if(!active())return;
    const h=habit(),scroll=page.querySelector('.reminder-controls')?.scrollTop||0;
    const manageButton=mode==='list'?`<button type="button" class="reminder-icon-button" data-reminder="manage" title="管理事项" aria-label="管理事项">${icon('settings-2')}</button>`:'<span></span>';
    const listFields=mode==='list'?`<label class="reminder-field"><span>小组件标题</span><input maxlength="20" id="reminderTitle" value="${esc(state.list.title)}" /></label><button type="button" class="reminder-settings-row" data-reminder="manage"><span>清单管理</span>${icon('chevron-right')}</button>`:'';
    page.innerHTML=`<header class="reminder-head"><button type="button" class="reminder-icon-button" data-reminder="back" title="返回" aria-label="返回首页">${icon('chevron-left')}</button><h2>${mode==='list'?'趣味清单':'每日打卡'}</h2>${manageButton}</header><div class="reminder-stage">${widget()}</div><div class="reminder-controls">${listFields}<div class="reminder-appearance">${WidgetAppearance.field('字体颜色',colors('textColor',['#493c50','#ffffff','#dc7fa5','#7b9b8d','#8d7ca6']))}${WidgetAppearance.field('背景',colors('background',['#ffffff','#fff1e0','#fce8f2','#e9f2f0','#eeeaf8']))}${WidgetAppearance.toggle({id:'reminderTransparent',checked:state[mode].transparent})}</div></div><footer class="reminder-footer"><button type="button" class="reminder-save" data-reminder="save" ${saving?'disabled':''}>保存到我的组件</button></footer>`;
    if(mode==='habit'&&h){
      page.querySelector('h2').textContent='自定义打卡';
      const controls=page.querySelector('.reminder-controls');
      controls.insertAdjacentHTML('afterbegin',`<label class="reminder-field habit-title-field"><span>打卡标题</span><input id="habitTitle" maxlength="40" value="${esc(checkinTitle())}" /></label>`);
      controls.scrollTop=scroll;
    }
    window.lucide?.createIcons();
  }
  function renderDetail(){
    if(!detail.classList.contains('active'))return;
    const h=habit();if(!h){setAppPage('reminder');render();return;}
    const now=new Date(),m=monthCells(calendarMonth),records=h.records.filter(d=>d.startsWith(m.prefix)),monthTotal=records.reduce((sum,d)=>sum+count(h,d),0),currentPrefix=dateKey(now).slice(0,8),elapsed=m.prefix===currentPrefix?now.getDate():m.prefix<currentPrefix?m.days:0,monthStreak=elapsed?streak(records,new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),elapsed,12)):0;
    detail.innerHTML=`<header class="reminder-head"><button type="button" class="reminder-icon-button" data-reminder="detail-back" aria-label="返回打卡配置" title="返回">${icon('chevron-left')}</button><h2>${esc(h.name)}</h2><span></span></header><div class="habit-detail-scroll"><div class="habit-statistics">${[[total(h),'总打卡'],[monthTotal,'本月打卡'],[monthStreak,'本月连续'],[Math.max(0,elapsed-records.length),'本月未打卡']].map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div><section class="habit-calendar"><header><button type="button" class="reminder-icon-button" data-reminder="month-prev" title="上个月" aria-label="上个月">${icon('chevron-left')}</button><strong>${calendarMonth.getFullYear()}年${calendarMonth.getMonth()+1}月</strong><button type="button" class="reminder-icon-button" data-reminder="month-next" title="下个月" aria-label="下个月">${icon('chevron-right')}</button></header>${calendar(h,calendarMonth)}</section><div class="habit-detail-today"><span>今日打卡</span><button type="button" data-reminder="checkin">${icon('check')}${count(h)?'今日 '+count(h)+' 次':'点击打卡'}</button>${count(h)?'<button type="button" data-reminder="undo" class="reminder-icon-button" aria-label="撤销本次打卡" title="撤销本次打卡">'+icon('rotate-ccw')+'</button>':''}</div><button type="button" class="reminder-settings-row habit-year-entry" data-reminder="annual"><span>年度统计</span><small>${calendarMonth.getFullYear()}年</small>${icon('chevron-right')}</button>${annual?`<section class="habit-year"><h3>${calendarMonth.getFullYear()}年打卡记录</h3>${Array.from({length:12},(_,i)=>{const prefix=calendarMonth.getFullYear()+'-'+String(i+1).padStart(2,'0')+'-',days=h.records.filter(d=>d.startsWith(prefix));return `<div><span>${i+1}月</span><progress max="31" value="${days.length}" aria-label="${i+1}月打卡${days.length}天"></progress><small>${days.length}天 / ${days.reduce((sum,d)=>sum+count(h,d),0)}次</small></div>`;}).join('')}</section>`:''}</div>`;
    window.lucide?.createIcons();
  }
  function showDetails(){closeSheet();calendarMonth=new Date();calendarMonth.setDate(1);annual=false;setAppPage('reminder-detail');renderDetail();}
  function open(type,id){if(type!=='habit')return;mode='habit';if(id){checkinId=id;const next=structuredClone(state);next.checkinComponentId=id;commit(next);}closeSheet();setAppPage('reminder');render();}
  function closeSheet(){overlay.hidden=true;overlay.innerHTML='';page.removeAttribute('inert');if(focusBefore?.isConnected)focusBefore.focus();focusBefore=null;}
  function showSheet(body,title,footer){
    if(overlay.hidden)focusBefore=document.activeElement;
    page.inert=true;overlay.hidden=false;overlay.innerHTML=`<section class="reminder-sheet" role="dialog" aria-modal="true" aria-labelledby="reminderSheetTitle"><header><h3 id="reminderSheetTitle">${title}</h3><button type="button" class="reminder-icon-button" data-reminder="close" aria-label="关闭" title="关闭">${icon('x')}</button></header><div class="reminder-sheet-body">${body}</div><footer>${footer}</footer></section>`;window.lucide?.createIcons();overlay.querySelector('input,button')?.focus();
  }
  function manage(){
    sheetMode='manage';const items=mode==='list'?state.items:state.habits;
    showSheet(items.map(i=>`<div class="reminder-manage-row">${icon(i.icon)}<span>${esc(i.name)}<small>${mode==='list'?(i.daily?'每日重复':'单次事项')+' · ':''}${i.remind?i.time+' 提醒':'不提醒'}</small></span><button type="button" class="reminder-icon-button" data-reminder="edit" data-id="${esc(i.id)}" title="编辑" aria-label="编辑${esc(i.name)}">${icon('pencil')}</button><button type="button" class="reminder-icon-button" data-reminder="delete" data-id="${esc(i.id)}" title="删除" aria-label="删除${esc(i.name)}">${icon('trash-2')}</button></div>`).join('')||'<p class="reminder-empty">还没有事项</p>',mode==='list'?'清单管理':'打卡项管理','<button type="button" class="reminder-primary" data-reminder="new">添加事项</button>');
  }
  function edit(id){
    sheetMode='edit';editId=id||null;const item=(mode==='list'?state.items:state.habits).find(i=>i.id===id)||{name:'',icon:'flame',time:'21:00',remind:true,daily:true,date:dateKey(new Date())};editIcon=item.icon;
    showSheet(`<form id="reminderItemForm"><label class="reminder-field"><span>事项名称</span><input name="name" maxlength="40" required value="${esc(item.name)}" placeholder="如：记得续火花" /></label><div class="reminder-field"><span>事项图标</span><div class="reminder-icon-picker">${Object.entries(icons).map(([k,[label]])=>`<button type="button" data-reminder="icon" data-icon="${k}" aria-label="${label}" title="${label}" aria-pressed="${k===editIcon}">${icon(k)}</button>`).join('')}</div></div>${mode==='list'?`<label class="reminder-toggle"><span>每日重复</span><input name="daily" id="reminderDaily" type="checkbox" ${item.daily?'checked':''} /></label><label class="reminder-field" id="reminderDateRow" ${item.daily?'hidden':''}><span>日期</span><input type="date" name="date" value="${esc(item.date)}" /></label>`:''}<label class="reminder-toggle"><span>开启提醒</span><input type="checkbox" name="remind" id="reminderEnabled" ${item.remind?'checked':''} /></label><label class="reminder-field"><span>提醒时间</span><input type="time" name="time" value="${esc(item.time)}" ${item.remind?'':'disabled'} required /></label><p class="reminder-sheet-error" role="alert" hidden></p></form>`,id?'编辑事项':'添加事项','<button type="button" class="reminder-cancel" data-reminder="close">取消</button><button type="submit" form="reminderItemForm" class="reminder-primary">完成</button>');
  }
  function snapshot(type,designId=checkinId){
    if(type!=='habit')return '';
    const c=document.createElement('canvas');c.width=type==='list'?600:300;c.height=300;const ctx=c.getContext('2d'),a={...state[type],textColor:state.habit.textColorOverride?state[type].textColor:desktop.get(designId)?.checkin?.textColor||'#493c50'},h=habit();
    ctx.beginPath();ctx.roundRect(0,0,c.width,300,24);ctx.clip();if(!a.transparent){ctx.fillStyle=a.background;ctx.fillRect(0,0,c.width,300);const bg=type==='habit'?habitBackground(designId):'';if(bg&&pictures.has(bg)){const img=pictures.get(bg),scale=Math.max(c.width/img.width,300/img.height);ctx.drawImage(img,(c.width-img.width*scale)/2,(300-img.height*scale)/2,img.width*scale,img.height*scale);}}
    const text=(s,x,y,size=22,color=a.textColor,max=c.width-56)=>{ctx.fillStyle=color;ctx.font=`${size}px "Microsoft YaHei","Segoe UI Emoji",sans-serif`;ctx.fillText(s,x,y,max);};
    if(type==='list'){
      text(state.list.title,24,43,26);text('+',c.width-42,43,30);ctx.strokeStyle='#ebdfec';ctx.beginPath();ctx.moveTo(24,60);ctx.lineTo(576,60);ctx.stroke();
      [...state.items].sort((a,b)=>Number(completed(a))-Number(completed(b))).slice(0,3).forEach((i,n)=>{const y=98+n*57,done=completed(i);ctx.strokeStyle=done?'#ed7eac':a.textColor;ctx.lineWidth=2;ctx.strokeRect(26,y-19,20,20);if(done)text('✓',27,y,20,'#ed7eac');text(icons[i.icon]?.[1]||'🔥',60,y,24);text(i.name,98,y,22,done?'#b8a8bc':a.textColor,470);if(done){ctx.beginPath();ctx.moveTo(98,y-7);ctx.lineTo(Math.min(564,98+ctx.measureText(i.name).width),y-7);ctx.stroke();}});
      text(`已完成 ${state.items.filter(i=>completed(i)).length}/${state.items.length}`,24,277,17,'#a18aa7');
    }else if(h){
      const current=variant(designId),image=pictures.get(current.image);if(image)ctx.drawImage(image,0,0,300,300);else if(current.image===window.checkinCatImage&&catPicture.naturalWidth)ctx.drawImage(catPicture,0,0,300,300);
      text(checkinTitle(designId),24,36,21);text(String(displayed(h)),24,99,52);text('天',84,99,17,'#a18aa7');
    }else text('开始新的坚持',30,150,24);
    return c.toDataURL('image/png');
  }
  function save(type=mode,quiet=false){
    if(type!=='habit')return false;
    if(type==='habit'&&(photoLoading||!pictures.has(variant().image)||(habitBackground()&&!pictures.has(habitBackground())))){if(!quiet)showToast('图片加载中，请稍后保存');return false;}
    const item={id:'board-reminder-'+type,name:checkinTitle(),type:'打卡组件',size:'2*2',image:snapshot(type),words:checkinTitle()};
    try{flow.save([item]);const saved=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}');if(saved.extraCatalog?.find(i=>i.id===item.id)?.image!==item.image)throw new Error();if(!quiet)showToast('已保存到我的组件');return true;}catch(_){showToast('保存失败，请清理存储空间后重试');return false;}
  }
  function syncSaved(){try{const stored=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}');if(stored.saved?.['board-reminder-habit'])save('habit',true);}catch(_){}
  }
  function refreshHome(){
    const grid=document.querySelector('.current-widget-grid'),filter=document.querySelector('[data-widget-filter].active')?.dataset.widgetFilter;if(!grid)return;
    grid.querySelectorAll('[data-reminder-open]').forEach(el=>el.remove());
    for(const [type,label] of [['habit','打卡']])if(filter==='热门'||filter===label){
      const designs=desktop.resources('checkin').filter(c=>c.enabled);
      for(const c of designs)grid.insertAdjacentHTML('beforeend',`<button type="button" class="current-widget-card" data-reminder-open="${type}" data-checkin-id="${esc(c.id)}"><img src="${snapshot(type,c.id)}" alt="${label}组件" /><span>${esc(c.name)}</span></button>`);
    }
  }
  function checkDue(now=new Date()){
    const day=dateKey(now),time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),due=[];
    for(const [type,items] of [['habit',state.habits]])for(const item of items){const token=day+':'+type+':'+item.id+':'+item.time;
      if(item.remind&&item.time===time&&!state.notified.includes(token)&&(type==='habit'?!item.records.includes(day):!completed(item,day)&&(item.daily||item.date===day)))due.push({item,token});
    }
    if(!due.length)return [];
    const next=structuredClone(state);next.notified=next.notified.filter(k=>k.startsWith(day)).concat(due.map(d=>d.token));if(!commit(next))return [];
    document.querySelector('.reminder-notice')?.remove();const notice=document.createElement('div');notice.className='reminder-notice';notice.setAttribute('role','alert');notice.innerHTML=icon(due[0].item.icon)+`<span>${due.map(d=>esc(d.item.name)).join(' · ')}</span><button type="button" class="reminder-icon-button" data-reminder="dismiss" title="关闭提醒" aria-label="关闭提醒">${icon('x')}</button>`;
    phone.append(notice);window.lucide?.createIcons();return due.map(d=>d.item.id);
  }
  document.addEventListener('click',e=>{
    const entry=e.target.closest('[data-reminder-open]');if(entry){open(entry.dataset.reminderOpen,entry.dataset.checkinId);return;}
    if(e.target.closest('[data-widget-filter]'))refreshHome();
    const b=e.target.closest('[data-reminder]');if(!b)return;
    switch(b.dataset.reminder){
      case 'back':closeSheet();setAppPage('home');break;
      case 'manage':manage();break;
      case 'new':edit();break;
      case 'edit':edit(b.dataset.id);break;
      case 'close':closeSheet();break;
      case 'icon':editIcon=b.dataset.icon;overlay.querySelectorAll('[data-reminder="icon"]').forEach(el=>el.setAttribute('aria-pressed',el===b));break;
      case 'delete':if(confirm('删除这条事项及其记录？')){if(mutate(s=>{const field=mode==='list'?'items':'habits';s[field]=s[field].filter(i=>i.id!==b.dataset.id);if(mode==='habit'&&s.selected===b.dataset.id)s.selected=s.habits[0]?.id||'';})){manage();syncSaved();}}break;
      case 'checkin':performCheckin();break;
      case 'undo':performCheckin(true);break;
      case 'details':showDetails();break;
      case 'detail-back':setAppPage('reminder');render();break;
      case 'month-prev':calendarMonth.setMonth(calendarMonth.getMonth()-1);renderDetail();break;
      case 'month-next':calendarMonth.setMonth(calendarMonth.getMonth()+1);renderDetail();break;
      case 'annual':annual=!annual;renderDetail();break;
      case 'option':if(['checkMode','counter'].includes(b.dataset.field)){mutate(s=>{s.habit[b.dataset.field]=b.dataset.value;});}break;
      case 'reset-image':if(mutate(s=>{s.habits.find(i=>i.id===habit().id).image='';}))syncSaved();break;
      case 'reset-color':mutate(s=>{if(b.dataset.field==='textColor'){s.habit.textColorOverride=false;s.habit.textColor=desktop.get(checkinId)?.checkin?.textColor||'#493c50';}else{s.habit.background='#ffffff';s.habit.backgroundImage='';}});break;
      case 'color':mutate(s=>{s[mode][b.dataset.field]=b.dataset.color;if(mode==='habit'&&b.dataset.field==='textColor')s.habit.textColorOverride=true;if(mode==='habit'&&b.dataset.field==='background')s.habit.backgroundImage=null;});break;
      case 'clear-background':mutate(s=>{s.habit.backgroundImage=null;});break;
      case 'save':save();break;
      case 'dismiss':b.closest('.reminder-notice').remove();break;
    }
  });
  document.addEventListener('change',async e=>{
    const el=e.target;
    if(el.dataset.reminderCheck){if(mutate(s=>{const i=s.items.find(i=>i.id===el.dataset.reminderCheck),day=dateKey(new Date());i.done=completed(i)?(i.daily?i.done.filter(d=>d!==day):[]):[...i.done,day];}))syncSaved();}
    if(el.id==='reminderTitle'){const next=structuredClone(state);next.list.title=el.value.trim().slice(0,20)||'今天的小目标';if(commit(next)){page.querySelector('.reminder-stage').innerHTML=widget();window.lucide?.createIcons();refreshHome();}}
    if(el.id==='habitTitle'){
      const name=el.value.trim().slice(0,40),h=habit();if(!name||state.habits.some(i=>i.id!==h.id&&i.name===name)){el.value=checkinTitle();showToast(name?'已存在同名事项':'请填写打卡标题');return;}
      const next=structuredClone(state);next.habits.find(i=>i.id===h.id).name=name;next.habit.titleOverride=true;if(commit(next)){page.querySelector('.reminder-stage').innerHTML=widget();window.lucide?.createIcons();refreshHome();}
    }
    if(el.id==='habitSound')mutate(s=>{s.habit.sound=el.checked;});
    if(el.id==='habitPicture'){
      const file=el.files[0],id=habit()?.id;if(!file||!id)return;
      photoLoading=true;render();
      try{
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('请选择 5MB 以内的 PNG、JPG 或 WebP 图片');
        const url=URL.createObjectURL(file),img=new Image();img.src=url;
        try{await img.decode();const scale=Math.min(1,600/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/png'),picture=new Image();picture.src=data;await picture.decode();pictures.set(data,picture);if(state.habits.some(i=>i.id===id))mutate(s=>{s.habits.find(i=>i.id===id).image=data;});}finally{URL.revokeObjectURL(url);}
      }catch(error){showToast(error.message||'图片读取失败');}
      finally{photoLoading=false;render();refreshHome();syncSaved();}
    }
    if(el.id==='reminderTransparent')mutate(s=>{s[mode].transparent=el.checked;});
    if(el.dataset.reminderColor&&/^#[0-9a-f]{6}$/i.test(el.value))mutate(s=>{s[mode][el.dataset.reminderColor]=el.value;if(mode==='habit'&&el.dataset.reminderColor==='textColor')s.habit.textColorOverride=true;if(mode==='habit'&&el.dataset.reminderColor==='background')s.habit.backgroundImage=null;});
    if(el.id==='habitBackground'){
      const file=el.files[0];if(!file)return;photoLoading=true;render();
      try{
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('请选择 5MB 以内的 PNG、JPG 或 WebP 图片');
        const url=URL.createObjectURL(file),img=new Image();img.src=url;
        try{await img.decode();const scale=Math.min(1,700/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL('image/png'),picture=new Image();picture.src=data;await picture.decode();pictures.set(data,picture);mutate(s=>{s.habit.backgroundImage=data;s.habit.transparent=false;});}finally{URL.revokeObjectURL(url);}
      }catch(error){showToast(error.message||'背景图读取失败');}
      finally{photoLoading=false;render();refreshHome();}
    }
    if(el.id==='reminderDaily')overlay.querySelector('#reminderDateRow').hidden=el.checked;
    if(el.id==='reminderEnabled')overlay.querySelector('[name="time"]').disabled=!el.checked;
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='reminderItemForm')return;e.preventDefault();const d=new FormData(e.target),name=String(d.get('name')||'').trim(),remind=d.has('remind'),time=String(d.get('time')||'21:00'),daily=d.has('daily'),date=String(d.get('date')||'');
    let error=!name?'请填写事项名称':remind&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)?'请选择提醒时间':mode==='list'&&!daily&&!/^\d{4}-\d{2}-\d{2}$/.test(date)?'请选择提醒日期':'';
    const items=mode==='list'?state.items:state.habits;if(items.some(i=>i.id!==editId&&i.name===name))error='已存在同名事项';if(!editId&&items.length>=30)error='最多添加 30 条事项';
    if(error){const el=overlay.querySelector('.reminder-sheet-error');el.hidden=false;el.textContent=error;return;}
    if(mutate(s=>{const list=mode==='list'?s.items:s.habits,index=list.findIndex(i=>i.id===editId),item={...(index>=0?list[index]:{id:uid(),done:[],records:[]}),name,icon:editIcon,remind,time,daily,date};if(index>=0)list[index]=item;else list.push(item);if(mode==='habit')s.selected=item.id;})){closeSheet();syncSaved();}
  });
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeSheet();});
  document.addEventListener('keydown',e=>{
    if(overlay.hidden)return;if(e.key==='Escape'){e.preventDefault();closeSheet();}
    if(e.key==='Tab'){const all=[...overlay.querySelectorAll('button,input,select')].filter(el=>!el.disabled&&el.getClientRects().length);const index=all.indexOf(document.activeElement);if(e.shiftKey&&index<=0){e.preventDefault();all.at(-1)?.focus();}else if(!e.shiftKey&&index===all.length-1){e.preventDefault();all[0]?.focus();}}
  });
  const setPage=window.setAppPage;window.setAppPage=function(name){if(name!=='reminder')closeSheet();setPage(name);};
  document.addEventListener('click',e=>{if(e.target.closest('[data-demo-view]'))closeSheet();});
  const refreshMine=flow.refreshMine;flow.refreshMine=function(){refreshMine.call(this);const row=document.querySelector('[data-fs="single-install"][data-id="board-reminder-habit"]')?.closest('.fs-component-row');if(row&&!row.querySelector('[data-reminder-open]'))row.querySelector('span').insertAdjacentHTML('beforeend','<button type="button" class="fs-mini" data-reminder-open="habit">编辑</button>');};flow.refreshMine();
  const cats=document.querySelector('.current-widget-cats');for(const label of ['清单','打卡'])cats.insertAdjacentHTML('beforeend',`<button type="button" data-widget-filter="${label}">${label}</button>`);
  function tick(){if(document.hidden)return;const day=dateKey(new Date());if(day!==lastDay){lastDay=day;render();renderDetail();refreshHome();syncSaved();}checkDue();}
  setInterval(tick,15000);document.addEventListener('visibilitychange',tick);refreshHome();
  catPicture.decode().then(()=>{render();refreshHome();}).catch(()=>showToast('打卡插画加载失败，请刷新页面'));
  warmCheckinPictures();
  window.addEventListener('desktop-components-changed',()=>{warmCheckinPictures();render();refreshHome();});
  if(state.habit.backgroundImage){const url=state.habit.backgroundImage,img=new Image();img.src=url;img.decode().then(()=>{pictures.set(url,img);render();refreshHome();}).catch(()=>showToast('背景图加载失败，请重新上传'));}
  window.__reminderComponents={open,snapshot,streak,dateKey,checkDue,checkin(){performCheckin();}};
})();
