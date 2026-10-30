(function(){
  'use strict';
  const desktop=window.__desktopComponents,flow=window.__themeWidgetFlow,key='aiyong-desktop-pet-v1';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>`<i data-lucide="${name}"></i>`;
  const source=value=>window.petWidgetImages?.[value]||(/^data:image\/(png|jpeg|gif|webp);base64,/.test(value||'')?value:'');
  const widgetId=id=>'board-pet-'+id;
  let state={version:1,profiles:{}};try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.version===1&&saved.profiles)state=saved;}catch(_){}
  let current=desktop.petDefaultId;
  const images=new Map(),pending=new Map(),failures=new Set();
  const page=document.createElement('section');page.className='app-page pet-page';page.dataset.appPage='desktop-pet';document.querySelector('.app-phone').append(page);
  const active=()=>page.classList.contains('active');
  const design=id=>desktop.get(id)?.pet||state.profiles[id]?.design||{rooms:[],states:[]};
  function profile(id=current){
    const p=state.profiles[id]||{},d=design(id),rooms=d.rooms.filter(i=>i.image),states=d.states.filter(i=>i.image);
    return {room:rooms.find(i=>i.id===p.room)||rooms[0],mood:states.find(i=>i.id===p.mood)||states[0],rooms,states};
  }
  function persist(values,id=current){
    const next={...state,profiles:{...state.profiles,[id]:{...state.profiles[id],...values}}};
    try{localStorage.setItem(key,JSON.stringify(next));state=next;return true;}catch(_){showToast('存储空间不足，本次修改未保存');return false;}
  }
  function ready(id=current){const p=profile(id);return !!p.room&&!!p.mood&&[...p.rooms,...p.states].every(i=>images.has(source(i.image)));}
  function warm(id=current){
    const p=profile(id);
    for(const item of [...p.rooms,...p.states]){const src=source(item.image);if(!src||images.has(src)||pending.has(src))continue;
      const img=new Image();img.src=src;
      pending.set(src,img.decode().then(()=>{images.set(src,img);failures.delete(src);}).catch(()=>failures.add(src)).finally(()=>{pending.delete(src);renderPreview();refreshHome();syncSaved(id);}));
    }
  }
  function widget(id=current){
    const p=profile(id);
    if(!p.room||!p.mood)return '<div class="pet-unavailable">暂无可用的桌宠素材</div>';
    return `<div class="pet-widget" data-pet-room="${esc(p.room.id)}" data-pet-mood="${esc(p.mood.id)}"><img class="pet-room-image" src="${esc(source(p.room.image))}" alt="${esc(p.room.name)}" /><button type="button" class="pet-doll" data-pet="interact" title="和娃娃互动" aria-label="和娃娃互动，当前${esc(p.mood.name)}"><img src="${esc(source(p.mood.image))}" alt="${esc(p.mood.name)}状态的娃娃" /></button></div>`;
  }
  function snapshot(id=current){
    const p=profile(id),c=document.createElement('canvas');c.width=c.height=600;const x=c.getContext('2d');
    x.beginPath();x.roundRect(0,0,600,600,28);x.clip();x.fillStyle='#fff';x.fillRect(0,0,600,600);
    const room=images.get(source(p.room?.image)),doll=images.get(source(p.mood?.image));
    const fit=(img,left,top,width,height)=>{if(!img)return;const scale=Math.min(width/img.width,height/img.height);x.drawImage(img,left+(width-img.width*scale)/2,top+(height-img.height*scale)/2,img.width*scale,img.height*scale);};
    fit(room,0,0,600,600);fit(doll,162,270,276,276);return c.toDataURL('image/png');
  }
  function renderPreview(){
    if(!active())return;const p=profile();page.querySelector('.pet-stage').innerHTML=widget()+`<div class="pet-current-state" aria-live="polite">${esc(p.mood?.name||'暂无状态')}</div>`;
    page.querySelectorAll('[data-pet="room"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===p.room?.id));
    page.querySelectorAll('[data-pet="mood"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===p.mood?.id));
    page.querySelector('[data-pet="save"]').disabled=!ready();
    const error=page.querySelector('.pet-error');error.hidden=![...p.rooms,...p.states].some(i=>failures.has(source(i.image)));error.textContent='图片加载失败，请在中台重新上传对应素材。';
    window.lucide?.createIcons();
  }
  function open(id=desktop.petDefaultId){
    current=id;const p=profile();warm(id);
    page.innerHTML=`<header class="reminder-head"><button type="button" class="reminder-icon-button" data-pet="back" title="返回" aria-label="返回首页">${icon('chevron-left')}</button><h2>${esc(desktop.get(id)?.name||flow.get(widgetId(id))?.name||'桌宠小屋')}</h2><span></span></header><p class="pet-size-label">大号 4×4</p><div class="pet-stage"></div><div class="pet-controls"><section><h3>房间样式</h3><div class="pet-room-options" role="group" aria-label="房间样式">${p.rooms.map(r=>`<button type="button" data-pet="room" data-id="${esc(r.id)}" aria-pressed="${r.id===p.room?.id}"><img src="${esc(source(r.image))}" alt="" /><span>${esc(r.name)}</span></button>`).join('')}</div></section><section><h3>互动状态</h3><div class="pet-mood-options" role="group" aria-label="娃娃互动状态">${p.states.map(m=>`<button type="button" data-pet="mood" data-id="${esc(m.id)}" aria-pressed="${m.id===p.mood?.id}"><img src="${esc(source(m.image))}" alt="" /><span>${esc(m.name)}</span></button>`).join('')}</div></section><p class="pet-error" role="alert" hidden></p></div><footer class="pet-footer"><button type="button" data-pet="save">保存到我的组件</button></footer>`;
    setAppPage('desktop-pet');renderPreview();refreshAnnotations();
  }
  function syncSaved(id){if(!flow.getSaved().some(w=>w.id===widgetId(id))||!ready(id))return;flow.update(widgetId(id),{image:snapshot(id)});}
  function change(values,id=current){if(!persist(values,id))return false;renderPreview();refreshHome();syncSaved(id);return true;}
  function interact(id=current){
    const p=profile(id);if(p.states.length<2)return;const index=p.states.findIndex(i=>i.id===p.mood?.id),next=p.states[(index+1)%p.states.length];
    if(change({mood:next.id},id)&&id===current&&active()){
      const doll=page.querySelector('.pet-doll');doll?.animate([{transform:'translateY(0)'},{transform:'translateY(-7px)'},{transform:'translateY(0)'}],{duration:300});
    }
  }
  function save(){
    if(!ready()){showToast('素材加载中，请稍后保存');return;}
    const p=profile();if(!persist({room:p.room.id,mood:p.mood.id,design:structuredClone(design(current))}))return;
    try{const image=snapshot();flow.save([{id:widgetId(current),name:desktop.get(current)?.name||'桌宠小屋',type:'桌宠组件',size:'4*4',image,words:''}]);const saved=JSON.parse(localStorage.getItem('aiyong-theme-prototype-v1')||'{}');if(!saved.saved?.[widgetId(current)]||saved.extraCatalog?.find(w=>w.id===widgetId(current))?.image!==image)throw Error();showToast('已保存到我的组件');}catch(_){showToast('保存失败，请清理存储空间后重试');}
  }
  function refreshHome(){
    const grid=document.querySelector('.current-widget-grid'),filter=document.querySelector('[data-widget-filter].active')?.dataset.widgetFilter;if(!grid)return;
    grid.querySelectorAll('[data-pet-open]').forEach(el=>el.remove());if(!['热门','桌宠'].includes(filter))return;
    for(const c of desktop.resources('pet').filter(i=>i.enabled))grid.insertAdjacentHTML('beforeend',`<button type="button" class="current-widget-card" data-pet-open="${esc(c.id)}" data-widget-size="4*4"><img src="${ready(c.id)?snapshot(c.id):esc(source(c.image))}" alt="${esc(c.name)}" /><span>${esc(c.name)} · 大号 4×4</span></button>`);
  }
  document.addEventListener('click',e=>{
    const entry=e.target.closest('[data-pet-open]');if(entry){open(entry.dataset.petOpen);return;}if(e.target.closest('[data-widget-filter]'))refreshHome();
    const b=e.target.closest('[data-pet]');if(!b)return;
    if(b.dataset.pet==='back')setAppPage('home');
    if(b.dataset.pet==='room')change({room:b.dataset.id});
    if(b.dataset.pet==='mood')change({mood:b.dataset.id});
    if(b.dataset.pet==='interact')interact();
    if(b.dataset.pet==='save')save();
  });
  const previousRefresh=flow.refreshMine;flow.refreshMine=function(){previousRefresh.call(this);for(const w of flow.getSaved().filter(w=>w.id.startsWith('board-pet-'))){const row=document.querySelector(`[data-fs="single-install"][data-id="${w.id}"]`)?.closest('.fs-component-row');if(row&&!row.querySelector('[data-pet-open]'))row.querySelector('span').insertAdjacentHTML('beforeend',`<button type="button" class="fs-mini" data-pet-open="${esc(w.id.slice(10))}">编辑</button>`);}};
  function update(){for(const c of desktop.resources('pet'))warm(c.id);for(const id of Object.keys(state.profiles))if(flow.getSaved().some(w=>w.id===widgetId(id)))warm(id);refreshHome();if(active())open(current);}
  document.querySelector('.current-widget-cats').insertAdjacentHTML('beforeend','<button type="button" data-widget-filter="桌宠">桌宠</button>');
  window.addEventListener('desktop-components-changed',update);
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const value=JSON.parse(e.newValue||'null');if(value?.version===1&&value.profiles){state=value;update();}}catch(_){}});
  update();flow.refreshMine();window.__desktopPet={open,interact,snapshot,profile,ready};
})();
