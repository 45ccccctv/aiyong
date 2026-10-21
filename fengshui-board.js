(function(){
  'use strict';
  const materials={
    water:{name:'水',meaning:'财源 · 汇聚 · 生机',styles:[['sea','水','reference-water'],['water','水韵','water']]},
    mountain:{name:'山',meaning:'稳固 · 守护 · 登峰',styles:[['mountain','预设','reference-mountain'],['peak','峻岭','peak'],['ink','水墨字','ink']]},
    gold:{name:'金',meaning:'行动 · 专注 · 丰盈',styles:[['gold','金','reference-gold'],['fortune','金如意','fs-fortune']]},
    wind:{name:'风',meaning:'人缘 · 机会 · 突破',styles:[['wind','预设','reference-wind'],['wind-red','国风线描','fs-wind-red'],['wind-cloud','云间','fs-wind-cloud'],['wind-grass','清风','fs-wind-grass'],['wind-wave','国韵','fs-wind-wave'],['wind-ink','水墨字','fs-wind-ink']]},
    jade:{name:'玉',meaning:'温润 · 平安 · 相伴',styles:[['jade','预设','reference-jade'],['jade-green','翠色','fs-jade-green'],['jade-landscape','国韵','fs-jade-landscape'],['jade-marble','山纹','fs-jade-marble'],['jade-ink','水墨字','fs-jade-ink']]},
    bamboo:{name:'竹',meaning:'启智 · 成长 · 生机',styles:[['bamboo','青竹','reference-bamboo']]},
    fortune:{name:'如意',meaning:'顺心 · 所愿 · 如意',styles:[['fortune','如意','reference-fortune']]},
    ingot:{name:'金元宝',meaning:'聚财 · 纳福 · 丰盈',styles:[['ingot','金元宝','reference-ingot']]},
    gourd:{name:'玉葫芦',meaning:'养身 · 静心 · 安康',styles:[['gourd','玉葫芦','reference-gourd']]},
    abacus:{name:'金算盘',meaning:'经营 · 积财 · 有道',styles:[['abacus','金算盘','reference-abacus']]},
    seal:{name:'印章',meaning:'进阶 · 腾达 · 主局',styles:[['seal','朱砂印','reference-seal']]},
    lotus:{name:'白莲',meaning:'清心 · 守念 · 澄明',styles:[['lotus','白莲花','reference-lotus']]}
  };
  const themes=[
    {id:'wealth',name:'招财位',en:'Wealth',line:'引财入局，聚财有库。',slots:[['water',0,0,'聚财位 巽'],['mountain',0,4,'人缘位 艮']],descriptions:['财源流入，汇聚财富。','聚人守财，稳固根基。']},
    {id:'career',name:'事业位',en:'Career',line:'行动、突破、登峰。',slots:[['gold',1,2,'中宫位 极'],['wind',2,4,'开运位 乾'],['mountain',2,0,'生长位 坤']],descriptions:['激发行动，提升执行力。','带来机会与突破。','事业稳步向上。']},
    {id:'study',name:'学业位',en:'Study',line:'启智成长，学有所成。',slots:[['bamboo',2,0,'生长位 坤'],['gold',1,2,'中宫位 极']],descriptions:['知识累积，持续成长。','保持专注，提高效率。']},
    {id:'wellness',name:'健康位',en:'Wellness',line:'水养万物，生生不息。',slots:[['water',1,2,'中宫位 极'],['bamboo',2,0,'生长位 坤']],descriptions:['滋养身心。','生机常在。']},
    {id:'smooth',name:'顺遂位',en:'Smooth Sailing',line:'诸事顺遂，心想事成。',slots:[['wind',2,4,'开运位 乾'],['mountain',2,0,'生长位 坤']],descriptions:['顺势而行。','步步稳进。']},
    {id:'peace',name:'平安位',en:'Peace',line:'山守福地，玉佑平安。',slots:[['mountain',0,0,'聚财位 巽'],['jade',0,4,'人缘位 艮']],descriptions:['稳固守护。','平安祥和。']},
    {id:'love',name:'桃花位',en:'Love',line:'缘起于风，情定于月。',slots:[['wind',0,4,'人缘位 艮'],['jade',2,4,'开运位 乾']],descriptions:['引动缘分，拓展人缘。','温柔相伴，滋养关系。']},
    {id:'wish',name:'如意位',en:'Good Fortune',line:'心有所愿，诸事如意。',slots:[['fortune',2,4,'开运位 乾']],descriptions:['职场奔波、创业经营、顺心所愿，诸事如意。']},
    {id:'treasure',name:'聚财元宝',en:'Gold Ingot',line:'聚财纳福，财库丰盈。',slots:[['ingot',0,0,'聚财位 巽']],descriptions:['经商理财、财富累积、聚财纳福，财库丰盈。']},
    {id:'jade-gift',name:'安康葫芦',en:'Jade Gourd',line:'纳福护身，安康常伴。',slots:[['gourd',0,4,'人缘位 艮']],descriptions:['养身静心、家庭相伴、纳福护身，安康常伴。']},
    {id:'abacus',name:'积财算盘',en:'Gold Abacus',line:'善于经营，积财有道。',slots:[['abacus',0,0,'聚财位 巽']],descriptions:['经商创业、投资经营、善于经营，积财有道。']},
    {id:'seal',name:'权成印章',en:'Vermilion Seal',line:'定志立身，掌握主局。',slots:[['seal',1,2,'中宫位 极']],descriptions:['职场进阶、创业发展、事业腾达、定志立身，掌握主局。']},
    {id:'lotus',name:'白莲清心',en:'White Lotus',line:'清心守念，澄明自持。',slots:[['lotus',1,2,'中宫位 极']],descriptions:['读书备考、创作工作、清心守念，澄明自持。']}
  ];
  const storageKey='aiyong-fengshui-board-v1';
  let state={theme:'wealth',choices:{},summaryStyles:{},customStyles:{}};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&themes.some(t=>t.id===saved.theme))state={theme:saved.theme,choices:saved.choices||{},summaryStyles:saved.summaryStyles||{},customStyles:saved.customStyles||{}};}catch(_){}
  Object.entries(state.customStyles).forEach(([kind,style])=>{if(materials[kind]&&Array.isArray(style)&&String(style[3]).startsWith('data:image/'))materials[kind].styles.push(style);});
  const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state))}catch(_){showToast('浏览器存储已满，本次选择在当前页面保留')}};
  const selectedTheme=()=>themes.find(t=>t.id===state.theme);
  const availableStyles=kind=>{
    const list=materials[kind].styles,ids=window.__energyColumns?.resourceIds(kind);
    if(window.__desktopComponents)return window.__desktopComponents.styles(kind,ids).concat(list.filter(s=>s[0].startsWith('custom-')));
    return ids?ids.map(id=>list.find(s=>s[0]===id)).filter(Boolean).concat(list.filter(s=>s[0].startsWith('custom-'))):list;
  };
  const defaultStyle=kind=>availableStyles(kind)[0]||materials[kind].styles[0];
  const styleFor=(theme,index)=>{const kind=theme.slots[index][0],list=availableStyles(kind);return list.find(s=>s[0]===(state.summaryStyles[kind]||state.choices[theme.id+':'+index]))||defaultStyle(kind);};
  const image=style=>style[3]||`./assets/${style[2]}.png`;
  const asWidget=(style,kind)=>{const componentId=style[5]||availableStyles(kind).find(s=>s[5])?.[5]||kind;return {id:'board-'+componentId,name:window.__desktopComponents?.get(componentId)?.name||materials[kind].name,size:'2*2',type:'照片墙组件',image:image(style),words:''};};
  window.__themeWidgetFlow.register(Object.entries(materials).map(([kind,m])=>asWidget(m.styles[0],kind)));
  window.__energyMaterials={categories:()=>Object.entries(materials).map(([id,m])=>({id,name:m.name})),resources:kind=>materials[kind].styles.filter(s=>!s[0].startsWith('custom-')).map((s,i)=>({id:s[0],name:s[1],image:image(s),vip:i>0}))};
  const visibleKind=kind=>!window.__energyColumns||window.__energyColumns.visible(kind);
  const phone=document.querySelector('.app-phone');
  const floatingHelp=document.createElement('button');
  floatingHelp.type='button';floatingHelp.className='fs-floating-help';floatingHelp.dataset.board='guide';floatingHelp.dataset.annotationId='energy-video-help';
  floatingHelp.innerHTML='<span class="fs-floating-help-label"><span>如何添加到桌面</span><i data-lucide="circle-help"></i></span>';
  document.querySelector('.phone-shell').append(floatingHelp);
  const zones=[
    {id:'center',name:'中宫位',location:'屏幕中间',col:1,row:2,meaning:'行动 · 专注',text:'金居中宫，取坚定与丰盈之意，寄托凝神聚力、行有所成的心愿。',suggestion:'可搭配金色组件，呼应事业位的行动突破与学业位的专注有成。',theme:'career'},
    {id:'growth',name:'生长位',location:'屏幕右上',col:2,row:0,meaning:'启智 · 成长',text:'山稳而上，竹节常青。以山与竹的意象，寄托事业稳进、学有所成的心愿。',suggestion:'事业主题可搭配山，寓意稳步登峰；学业主题可搭配竹，寓意启智成长。',theme:'study'},
    {id:'prosperity',name:'聚财位',location:'屏幕左上',col:0,row:0,meaning:'聚财 · 纳福',text:'水寓财源汇聚，山寓根基稳固，金寓财库丰盈。寄愿引财入局，聚财有库。',suggestion:'可按主题搭配水、山或金色组件，呼应汇聚、守护与丰盈的寓意。',theme:'wealth'},
    {id:'relationship',name:'人缘位',location:'屏幕左下',col:0,row:4,meaning:'良缘 · 相伴',text:'风取良缘来往之意，玉取温柔相伴之意，寄托人缘和合、平安相守的美好愿望。',suggestion:'可搭配风或玉，呼应引动缘分、拓展人缘与温柔相伴的寓意。',theme:'love'},
    {id:'opportunity',name:'开运位',location:'屏幕右下',col:2,row:4,meaning:'机遇 · 如意',text:'风寓顺势而行，玉寄温柔良缘，如意寄心有所愿。愿前路有机，诸事如意。',suggestion:'可搭配风、玉或如意，呼应机遇突破、情缘相伴与顺心所愿。',theme:'wish'}
  ];
  let activeZone='overview';
  function directions(){
    const zone=zones.find(z=>z.id===activeZone);
    renderPage('fs-directions',`<header class="fs-direction-header"><button type="button" data-board="back" aria-label="返回能量桌面"><i data-lucide="chevron-left"></i></button><h2>方位解读</h2><span></span></header><div class="fs-direction-scene" data-annotation-id="energy-directions"><div class="fs-direction-phone"><div class="fs-direction-map"><div class="fs-direction-placeholders">${'<i></i>'.repeat(24)}</div>${zones.map(z=>`<button type="button" data-board="zone" data-zone="${z.id}" class="fs-direction-zone ${!zone||zone.id===z.id?'highlight':''}" style="--col:${z.col};--row:${z.row}" aria-pressed="${!zone||zone.id===z.id}">${z.name}</button>`).join('')}</div><div class="fs-direction-dock"><button data-board="zone" data-zone="overview" aria-label="查看总览" class="${!zone?'active':''}">总</button>${'<i></i>'.repeat(3)}</div></div><nav class="fs-direction-nav" aria-label="方位解读分类">${[{id:'overview',name:'总览'},...zones].map(z=>`<button type="button" data-board="zone" data-zone="${z.id}" class="${activeZone===z.id?'active':''}" aria-pressed="${activeZone===z.id}"><span></span>${z.name}</button>`).join('')}</nav></div><section class="fs-direction-copy">${zone?`<span>${zone.location}</span><h3>${zone.name} · ${zone.meaning}</h3><p>${zone.text}</p><h4>搭配建议</h4><p>${zone.suggestion}</p><small>以上为本模板的文化寓意解读；位置以手机屏幕为参照，不对应实际地理方位。</small>`:'<p>一个受风水哲学启发的桌面布局 App，透过风水原则平衡你的能量，为你的日常带来平衡、和谐与宁静。</p>'}</section><button type="button" class="fs-direction-cta" data-board="zone-use">${zone?'查看推荐搭配':'进入能量位推荐'}</button>`);
  }
  let pending=null;
  const membershipKey='aiyong-prototype-vip';
  let member=false;
  try{member=localStorage.getItem(membershipKey)==='true';}catch(_){}
  let requestedStyle=null;
  const isPaidStyle=(kind,id)=>!id.startsWith('custom-')&&(window.__desktopComponents?Boolean(availableStyles(kind).find(s=>s[0]===id)?.[4]):materials[kind].styles.findIndex(s=>s[0]===id)>0);
  function membership(){
    renderPage('fs-membership',`<header class="fs-picker-head"><div><h2>开通会员</h2></div><button type="button" data-board="membership-back" aria-label="返回素材选择"><i data-lucide="x"></i></button></header><section class="fs-membership"><i data-lucide="crown"></i><h3>解锁 VIP 专属素材</h3><p>开通会员，随心搭配喜欢的能量组件。</p><ul><li><i data-lucide="lock-keyhole-open"></i>解锁 VIP 素材</li><li><i data-lucide="palette"></i>多种样式自由搭配</li></ul><button type="button" class="fs-material-confirm" data-board="membership-activate">模拟开通会员</button><small>原型演示，不产生实际扣费</small></section>`);
  }
  function chooseStyle(id){
    pending.style=id;
    phone.querySelectorAll('.fs-material-option').forEach(el=>{const selected=el.dataset.style===id;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected));});
    phone.querySelector('[data-app-page="fs-materials"] .fs-material-confirm').disabled=false;
  }
  let returnTo='board';
  let summaryScroll=0;
  let guideReturn='board';
  const summaryStyle=kind=>{const list=availableStyles(kind);const index=selectedTheme().slots.findIndex(slot=>slot[0]===kind);return list.find(s=>s[0]===state.summaryStyles[kind])||(index>=0?styleFor(selectedTheme(),index):defaultStyle(kind));};
  function renderPage(name,html){phone.querySelectorAll('video').forEach(video=>video.pause());let el=phone.querySelector(`[data-app-page="${name}"]`);if(!el){el=document.createElement('section');el.className='app-page fs-page fs-dark-page';el.dataset.appPage=name;phone.append(el)}el.innerHTML=html;setAppPage(name);el.scrollTop=0;window.__energyColumns?.refreshGallery();window.lucide?.createIcons();refreshAnnotations();}
  function drawBoard(){
    if(window.__energyColumns&&!window.__energyColumns.enabled()){setAppPage('home');return;}
    const t=selectedTheme();
    renderPage('fs-board',`<header class="fs-board-header"><button type="button" class="fs-board-exit" data-board="home" title="返回小组件" aria-label="返回小组件"><i data-lucide="chevron-left"></i></button><button type="button" class="fs-position-entry" data-board="directions">方位解读</button><h2>能量桌面</h2><button type="button" data-board="gallery" title="组件汇总" aria-label="组件汇总"><i data-lucide="layout-grid"></i></button></header><div class="fs-board-scene" data-annotation-id="fs-board-scene"><div class="fs-board-phone"><div class="fs-board-layout"><div class="fs-board-placeholders">${'<i></i>'.repeat(24)}</div>${t.slots.map(([kind,c,r,position],i)=>`<button class="fs-board-piece" style="--col:${c};--row:${r}" data-board="pick" data-index="${i}" type="button" aria-label="替换${position}的${materials[kind].name}"><img src="${image(styleFor(t,i))}" alt="${materials[kind].name} · ${styleFor(t,i)[1]}" /><span>${materials[kind].name}</span></button>`).join('')}</div><div class="fs-board-dock">${'<i></i>'.repeat(4)}</div></div><nav class="fs-board-rail" aria-label="能量主题">${themes.map(item=>`<button type="button" data-board="theme" data-id="${item.id}" class="${item.id===t.id?'active':''}"><b>${item.name}</b><small>${item.en}</small></button>`).join('')}</nav></div><div class="fs-board-description"><h3>${t.line}</h3><div class="fs-board-explanations">${t.slots.map(([kind,,,position],i)=>`<button type="button" data-board="pick" data-index="${i}"><b>${position} - ${materials[kind].name}</b><span>${t.descriptions[i]}</span></button>`).join('')}</div></div>`);
    const rail=phone.querySelector('.fs-board-rail'),active=rail.querySelector('.active');
    rail.scrollTo({top:active.getBoundingClientRect().top-rail.getBoundingClientRect().top+rail.scrollTop-rail.clientHeight/2+active.offsetHeight/2,behavior:'instant'});
    phone.querySelectorAll('[data-app-page="fs-board"] [data-index]').forEach(el=>{el.hidden=!visibleKind(t.slots[Number(el.dataset.index)][0]);});
  }
  function picker(index,kindOverride){
    const t=selectedTheme(),kind=kindOverride||t.slots[index][0];
    const current=index===null?summaryStyle(kind)[0]:styleFor(t,index)[0];
    pending={kind,index,style:current};
    const m={...materials[kind],styles:availableStyles(kind)};
    renderPage('fs-materials',`<header class="fs-picker-head"><div><h2>${m.name}</h2><p>${m.meaning}</p></div><button type="button" data-board="close-picker" title="关闭" aria-label="关闭样式选择"><i data-lucide="x"></i></button></header><div class="fs-materials-grid" data-annotation-id="fs-materials">${m.styles.map(s=>`<button type="button" class="fs-material-option ${current===s[0]?'selected':''}" data-board="choose" data-style="${s[0]}" aria-pressed="${current===s[0]}"><img src="${image(s)}" alt="${m.name} · ${s[1]}"/>${isPaidStyle(kind,s[0])?'<span class="fs-material-vip" title="VIP 专属素材" aria-label="VIP 专属素材"><i data-lucide="lock-keyhole"></i></span>':''}<span>${s[1]}</span><i class="fs-material-check" data-lucide="check"></i></button>`).join('')}<button type="button" class="fs-material-option fs-custom-material" data-board="custom-image"><div><i data-lucide="image-plus"></i></div><span>自定义图片</span></button></div><input type="file" id="fsCustomImage" accept="image/png,image/jpeg,image/webp" hidden /><button class="fs-material-confirm" type="button" data-board="apply" ${index===null||!current?'disabled':''}>保存到我的小组件</button>`);
  }
  function syncComponentKinds(){window.__desktopComponents?.resources().forEach(c=>{if(!materials[c.kind])materials[c.kind]={name:c.name,meaning:'',styles:window.__desktopComponents.styles(c.kind)};});}
  function gallery(){syncComponentKinds();const kinds=[...new Set(['wind','mountain','water','bamboo','gold','jade','fortune',...(window.__energyColumns?.kinds()||[])])];returnTo='gallery';renderPage('fs-gallery',`<header class="fs-summary-header"><h2>组件汇总</h2><button type="button" class="fs-summary-help" data-board="guide">如何添加到桌面<i data-lucide="circle-help"></i></button><button type="button" class="fs-summary-close" data-board="back" title="返回能量搭配" aria-label="关闭组件汇总"><i data-lucide="x"></i></button></header><div class="fs-summary-grid" data-annotation-id="energy-summary">${kinds.map(kind=>`<button type="button" data-board="element" data-kind="${kind}"><img src="${image(summaryStyle(kind))}" alt="${materials[kind].name} · ${summaryStyle(kind)[1]}" /><span>${materials[kind].name}</span></button>`).join('')}</div>`);phone.querySelector('[data-app-page="fs-gallery"]').scrollTop=summaryScroll;}
  function startInstall(items){const t=selectedTheme();const plan={name:t.name+'桌面搭配',ids:items.map(w=>w.id),category:t.name,intro:t.line,layout:''};window.__themeWidgetFlow.install(items,plan,drawBoard);}
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-current-tab="fengshui"]')){e.preventDefault();e.stopImmediatePropagation();drawBoard();}
  },true);
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-board]');if(!b)return;
    const action=b.dataset.board,t=selectedTheme();
    if(action==='home')setAppPage('home');
    if(action==='directions'){activeZone='overview';directions();}
    if(action==='zone'){activeZone=b.dataset.zone;directions();}
    if(action==='zone-use'){const zone=zones.find(z=>z.id===activeZone);if(zone){state.theme=zone.theme;save();}drawBoard();}
    if(action==='theme'){state.theme=b.dataset.id;save();drawBoard();}
    if(action==='pick'){returnTo='board';picker(Number(b.dataset.index));}
    if(action==='choose'){
      if(!member&&isPaidStyle(pending.kind,b.dataset.style)){requestedStyle=b.dataset.style;membership();return;}
      chooseStyle(b.dataset.style);
    }
    if(action==='membership-back'){const previous={...pending};picker(previous.index,previous.kind);chooseStyle(previous.style);requestedStyle=null;}
    if(action==='membership-activate'){
      member=true;try{localStorage.setItem(membershipKey,'true');}catch(_){}
      const previous={...pending},id=requestedStyle;picker(previous.index,previous.kind);chooseStyle(id||previous.style);requestedStyle=null;
      showToast('会员已开通（原型演示）');
    }
    if(action==='apply'){
      const style=availableStyles(pending.kind).find(s=>s[0]===pending.style);
      if(!style)return;
      if(!member&&isPaidStyle(pending.kind,pending.style)){requestedStyle=pending.style;membership();return;}
      state.summaryStyles[pending.kind]=pending.style;
      themes.forEach(theme=>theme.slots.forEach(([kind],i)=>{if(kind===pending.kind)state.choices[theme.id+':'+i]=pending.style;}));
      if(style[3])state.customStyles[pending.kind]=style;
      save();window.__themeWidgetFlow.save([asWidget(style,pending.kind)]);
      if(pending.index===null)gallery();else drawBoard();
      showToast('已保存到我的组件');
    }
    if(action==='close-picker'){if(returnTo==='gallery')gallery();else drawBoard();}
    if(action==='custom-image')phone.querySelector('#fsCustomImage').click();
    if(action==='back'){if(phone.querySelector('.app-page.active')?.dataset.appPage==='fs-board-guide'&&guideReturn==='gallery')gallery();else drawBoard();}
    if(action==='gallery'){summaryScroll=0;gallery();}
    if(action==='element'){summaryScroll=phone.querySelector('[data-app-page="fs-gallery"]').scrollTop;picker(null,b.dataset.kind);}
    if(action==='plans')window.__themeWidgetFlow.browse();
    if(action==='install')startInstall(t.slots.map(([kind],i)=>asWidget(styleFor(t,i),kind)));
    if(action==='guide'){
      guideReturn=phone.querySelector('.app-page.active')?.dataset.appPage==='fs-gallery'?'gallery':'board';
      renderPage('fs-board-guide',`<header class="fs-picker-head"><div><h2>如何添加到桌面</h2></div><button type="button" data-board="back" aria-label="${guideReturn==='gallery'?'返回组件汇总':'返回搭配'}" title="返回"><i data-lucide="x"></i></button></header><video class="fs-tutorial-video" controls playsinline preload="metadata" aria-label="添加到桌面操作演示视频" src="./assets/add-to-desktop.webm"></video><p class="fs-tutorial-caption">不同手机的桌面入口可能略有差异。</p>`);
      phone.querySelector('.fs-tutorial-video').play().catch(()=>{});
    }
  });
  document.addEventListener('change',async e=>{
    if(e.target.id!=='fsCustomImage')return;
    const file=e.target.files[0];if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>1024*1024){showToast('请选择 1MB 以内的 PNG、JPG 或 WebP 图片');e.target.value='';return;}
    const previous={...pending};
    try{
      const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
      const picture=new Image();picture.src=data;await picture.decode();
      if(!phone.querySelector('[data-app-page="fs-materials"].active')||pending.kind!==previous.kind)return;
      const componentId=availableStyles(previous.kind).find(s=>s[0]===previous.style)?.[5]||defaultStyle(previous.kind)[5];
      const style=['custom-'+previous.kind+'-'+Date.now(),'自定义图片','',data,false,componentId];
      materials[previous.kind].styles.push(style);
      picker(previous.index,previous.kind);chooseStyle(style[0]);
    }catch(_){showToast('图片读取失败，请重新选择');}
  });
  window.addEventListener('energy-columns-changed',()=>{
    syncComponentKinds();
    const active=phone.querySelector('.app-page.active')?.dataset.appPage;
    if(active==='fs-gallery')gallery();
    else if(active==='fs-board')drawBoard();
    else if(active==='fs-materials'&&pending){if(!visibleKind(pending.kind))drawBoard();else picker(pending.index,pending.kind);}
  });
  if(location.hash==='#fengshui'||location.hash==='#energy')drawBoard();
})();
