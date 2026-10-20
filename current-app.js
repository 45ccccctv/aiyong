(function () {
  'use strict';
  const home=document.querySelector('[data-app-page="home"]');
  const phone=document.querySelector('.app-phone');
  const icons=()=>window.lucide?.createIcons();
  const widgetItems=[
    ['app-battery','皮卡丘情绪电量','电量'],['app-album','轮播相册','热门'],['app-badge','圆形吧唧','谷美'],
    ['app-star','星星人轮播','热门'],['app-night','胡桃轮播','热门'],['app-cute','Chiikawa轮播','热门']
  ];
  const cover=(asset,alt)=>`<img src="./assets/${asset}.png" alt="${alt}" loading="lazy" />`;
  const homeCards=filter=>widgetItems.filter(item=>filter==='热门'||item[2]===filter).map(([asset,name])=>`<button type="button" data-current-widget="${name}" class="current-widget-card">${cover(asset,name)}<span>${name}</span></button>`).join('');
  home.classList.add('current-home');
  home.innerHTML=`<header class="current-home-head"><h2>爱用小组件<span>✦</span></h2><button data-app-action="my-widgets" type="button"><i data-lucide="blocks"></i>我的组件</button></header><button class="current-banner" data-current-tool="充电动画" type="button">${cover('app-banner','DIY充电动画')}</button><div class="current-tools">${[['app-charge','充电动画'],['app-qq','QQ皮肤'],['app-keyboard','键盘皮肤']].map(([asset,name])=>`<button type="button" data-current-tool="${name}">${cover(asset,name)}<span>${name}</span></button>`).join('')}<button data-app-action="tutorial" type="button"><i data-lucide="circle-play"></i><span>添加教程</span></button></div><nav class="current-widget-cats" aria-label="组件分类">${['热门','电量','时间日历','谷美'].map((t,i)=>`<button type="button" data-widget-filter="${t}" class="${i===0?'active':''}">${t}</button>`).join('')}</nav><div class="current-section-head"><h3 id="currentCategoryTitle">热门</h3></div><div class="current-widget-grid">${homeCards('热门')}</div>`;
  function addPage(name,body){const el=document.createElement('section');el.className='app-page current-page';el.dataset.appPage=name;el.innerHTML=body;phone.append(el);}
  const wallpapers=['wall-1','wall-2','wall-3','wall-4','wall-5','wall-6'];
  addPage('wallpapers',`<div class="current-wall-modes"><button class="active" data-wall-mode="静态壁纸">静态壁纸</button><button data-wall-mode="动态壁纸">动态壁纸</button></div><nav class="current-wall-cats">${['热门','光栅','重力','亮灯','互动'].map((t,i)=>`<button data-wall-filter="${t}" class="${i===0?'active':''}">${t}</button>`).join('')}</nav><div class="current-wall-grid">${wallpapers.map((a,i)=>`<button data-wall-image="${a}" type="button" aria-label="查看壁纸${i+1}">${cover(a,'精选壁纸 '+(i+1))}</button>`).join('')}</div>`);
  addPage('app-themes',`<header class="current-page-heading"><h2>精美主题</h2></header><div class="current-theme-grid">${[['theme-1','川上富江'],['theme-2','钟离'],['theme-3','心动收藏'],['theme-4','深夜来信']].map(([asset,name])=>`<button data-current-theme="${name}" data-theme-asset="${asset}" type="button">${cover(asset,name)}<b>${name}</b><small>壁纸 × 2 · 图标 × 28</small></button>`).join('')}</div>`);
  addPage('profile',`<div class="current-profile-head"><span class="current-avatar"><i data-lucide="user-round"></i></span><div><b>爱用体验用户</b><small>188****4185</small></div></div><div class="current-vip"><strong>VIP 会员</strong><span>组件随心搭配</span></div><section class="current-profile-section"><h3>常用功能</h3><div class="current-profile-tools"><button data-app-action="my-widgets"><i data-lucide="layout-grid"></i>我的组件</button><button data-current-profile="我的收藏"><i data-lucide="heart"></i>我的收藏</button><button data-current-profile="我的皮肤"><i data-lucide="shirt"></i>我的皮肤</button></div></section><section class="current-profile-section"><h3>其他功能</h3><button class="current-setting" data-app-action="tutorial"><i data-lucide="circle-help"></i>添加组件教程<span>›</span></button><button class="current-setting" data-current-profile="防烧设置"><i data-lucide="shield-check"></i>防烧设置<span>›</span></button><button class="current-setting" data-current-profile="设置"><i data-lucide="settings"></i>设置<span>›</span></button><button class="current-setting" data-current-profile="常见问题"><i data-lucide="message-circle-question-mark"></i>常见问题<span>›</span></button></section>`);
  addPage('current-content','');

  const originalSetAppPage=window.setAppPage;
  let contentParent='home';
  const tabForPage=name=>name.startsWith('fs-')||name==='themes'?'fengshui':name==='current-content'?contentParent:['wallpapers','app-themes','profile'].includes(name)?name:'home';
  window.setAppPage=function(name){
    originalSetAppPage(name);
    const active=tabForPage(name);
    document.querySelectorAll('[data-current-tab]').forEach(button=>{const selected=button.dataset.currentTab===active;button.classList.toggle('active',selected);button.setAttribute('aria-current',selected?'page':'false');});
    icons();
  };
  function content(title,body,back){
    contentParent=back;
    const el=document.querySelector('[data-app-page="current-content"]');
    el.innerHTML=`<header class="fs-head"><button type="button" data-current-back="${back}" aria-label="返回">‹</button><h2>${title}</h2><span></span></header>${body}`;
    setAppPage('current-content');
  }
  function originalWidget(title){
    const [asset]=widgetItems.find(item=>item[1]===title)||widgetItems[0];
    const el=document.querySelector('[data-app-page="detail"]');
    el.querySelector('h2').textContent=title;
    const preview=el.querySelector('.detail-preview');preview.innerHTML=`<img class="current-detail-cover" src="./assets/${asset}.png" alt="${title}" /><p>点击组件预览样式</p>`;
    setAppPage('detail');
  }
  document.addEventListener('click',event=>{
    const tab=event.target.closest('[data-current-tab]');
    if(tab&&tab.dataset.currentTab!=='fengshui')setAppPage(tab.dataset.currentTab);
    const back=event.target.closest('[data-current-back]');if(back)setAppPage(back.dataset.currentBack);
    const filter=event.target.closest('[data-widget-filter]');if(filter){document.querySelectorAll('[data-widget-filter]').forEach(b=>b.classList.toggle('active',b===filter));const value=filter.dataset.widgetFilter;document.querySelector('#currentCategoryTitle').textContent=value;document.querySelector('.current-widget-grid').innerHTML=value==='时间日历'?'<button class="current-widget-card" data-current-widget="纪念日样式"><div class="mini-widget calendar"></div><span>纪念日样式</span></button>':homeCards(value);}
    const selected=event.target.closest('[data-current-widget]');if(selected)originalWidget(selected.dataset.currentWidget);
    const tool=event.target.closest('[data-current-tool]');if(tool)content(tool.dataset.currentTool,`<div class="current-tool-preview">${cover('app-banner',tool.dataset.currentTool)}</div><p class="fs-annotation">批注：保留现有 ${tool.dataset.currentTool} 入口，本次评审聚焦底部新增能量入口。</p>`,'home');
    const wallMode=event.target.closest('[data-wall-mode]');if(wallMode){document.querySelectorAll('[data-wall-mode]').forEach(b=>b.classList.toggle('active',b===wallMode));showToast('已切换'+wallMode.dataset.wallMode);}
    const wallFilter=event.target.closest('[data-wall-filter]');if(wallFilter){document.querySelectorAll('[data-wall-filter]').forEach(b=>b.classList.toggle('active',b===wallFilter));const grid=document.querySelector('.current-wall-grid');grid.append(grid.firstElementChild);}
    const wall=event.target.closest('[data-wall-image]');if(wall)content('壁纸预览',`<div class="current-wall-preview">${cover(wall.dataset.wallImage,'壁纸预览')}</div>`,'wallpapers');
    const theme=event.target.closest('[data-current-theme]');if(theme)content(theme.dataset.currentTheme,`<div class="current-wall-preview">${cover(theme.dataset.themeAsset,theme.dataset.currentTheme)}</div>`,'app-themes');
    const item=event.target.closest('[data-current-profile]');if(item)content(item.dataset.currentProfile,`<p class="fs-annotation">批注：此处保留现有 App 的${item.dataset.currentProfile}页面入口，具体逻辑沿用线上版本。</p>`,'profile');
  });
  const observer=new MutationObserver(()=>{
    const active=phone.querySelector('.app-page.active');
    if(!active)return;
    const name=active.dataset.appPage;
    const tab=tabForPage(name);
    document.querySelectorAll('[data-current-tab]').forEach(b=>{const selected=b.dataset.currentTab===tab;b.classList.toggle('active',selected);b.setAttribute('aria-current',selected?'page':'false')});
  });
  observer.observe(phone,{subtree:true,attributes:true,attributeFilter:['class']});
  document.querySelectorAll('.fs-delete').forEach(b=>{if(b.querySelector('svg'))b.innerHTML='<i data-lucide="trash-2"></i>';});
  icons();
  const activePage=phone.querySelector('.app-page.active');if(activePage)setAppPage(activePage.dataset.appPage);
})();
