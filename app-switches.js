(function(){
  'use strict';
  const key='aiyong-app-switches-v1';
  const client={app:'aiyong',platform:'安卓',channel:'默认',version:'1.0.0'};
  const seed=[{id:'211100000000000001',app:'aiyong',platform:'安卓',channel:'默认',subchannel:'',version:'',showEnergy:true,updated:new Date().toLocaleString('sv-SE')}];
  let configs=seed;
  try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(saved))configs=saved;}catch(_){}
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const values=value=>String(value||'').split(',').filter(Boolean);
  const apps=[['aiyong','爱用小组件'],['baibao','百宝小组件'],['star-camera','星光相机'],['keyboard','爱用键盘'],['toolbox','安全手游工具箱'],['fanghua','芳华壁纸'],['chenwall','辰光壁纸'],['game','爱玩手游神器'],['xingmang','星芒壁纸']];
  const defaults={phonePayment:'启用',newMemberPlan:'趣图壁纸会员-合规-QTBZ_VIP_compliance-多应用 A...',ads:'启用',homePopup:'启用',loginType:'首页--一键登录-半弹窗',payment:'支付宝',packagePriority:'三方支付-默认版本',memberPackage:'月会员',showWithheld:'不展示',guestPurchase:'停用',thirdPartyHalf:'关闭',customerService:'自建 H5 客服',paymentTriggers:'用户完成前置登录,每天首次启动APP进入首页-登录用户',adPlatform:'',launchAd:'',firstPage:'百宝小组件-静态壁纸',firstCategory:''};
  const appName=id=>apps.find(a=>a[0]===id)?.[1]||id;
  function match(){return configs.filter(c=>c.app===client.app&&c.platform===client.platform&&values(c.channel).includes(client.channel)&&!c.subchannel&&(!c.version||values(c.version).includes(client.version))).sort((a,b)=>Number(Boolean(b.version))-Number(Boolean(a.version)))[0];}
  window.__appSwitches={showEnergy:()=>match()?.showEnergy===true};
  const screen=document.createElement('section');screen.className='screen fs-admin app-switch-admin';screen.dataset.screen='app-switches';document.querySelector('.workspace').append(screen);
  const menu=document.createElement('button');menu.type='button';menu.textContent='App总开关配置';document.querySelector('.sidebar nav').append(menu);
  const dialog=document.createElement('dialog');dialog.className='energy-edit-dialog app-switch-dialog';dialog.setAttribute('aria-labelledby','appSwitchTitle');document.body.append(dialog);
  const emptyQuery=()=>({channel:'',subchannel:'',app:'',platform:'',payment:'',thirdPartyHalf:''});
  let query=emptyQuery();
  function apply(){window.dispatchEvent(new Event('app-switches-changed'));}
  function persist(){try{localStorage.setItem(key,JSON.stringify(configs));}catch(_){showToast('浏览器存储已满，本次配置仅在当前页面保留');}apply();}
  function render(){
    const rows=configs.filter(c=>{const s={...defaults,...c.settings};return (!query.channel||c.channel.includes(query.channel))&&(!query.subchannel||c.subchannel.includes(query.subchannel))&&(!query.app||c.app===query.app)&&(!query.platform||c.platform===query.platform)&&(!query.payment||s.payment===query.payment)&&(!query.thirdPartyHalf||s.thirdPartyHalf===query.thirdPartyHalf);});
    const filter=(name,label,options,placeholder)=>`<label>${label}：<select name="${name}"><option value="">${placeholder}</option>${options.map(o=>{const [v,t]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${query[name]===v?'selected':''}>${esc(t)}</option>`;}).join('')}</select></label>`;
    const headers=['#','配置ID','应用编码','平台','渠道','子渠道','版本','话费支付开关','话费订购渠道','新会员话费方案','广告开关','首页弹窗开关','前置登录类型','默认支付方式','是否展示能量组件','操作'];
    screen.innerHTML=`<form id="appSwitchSearch" class="switch-original-search">${filter('channel','渠道',['默认','巨量','小米','华为','荣耀'],'请选择渠道')}<label>子渠道：<input name="subchannel" placeholder="请输入子渠道" value="${esc(query.subchannel)}" /></label>${filter('app','应用编码',apps,'请选择应用编码')}${filter('platform','平台',['安卓','iOS'],'请选择平台')}${filter('payment','默认支付方式',['支付宝','微信'],'请选择默认支付方式')}${filter('thirdPartyHalf','三方付费半屏开关',['开启','关闭'],'请选择三方付费半屏开关')}<div class="switch-search-buttons"><button class="primary" type="submit"><i data-lucide="search"></i>查询</button><button class="ghost" type="button" data-as="reset"><i data-lucide="rotate-ccw"></i>重置</button></div></form><div class="switch-original-toolbar"><button class="primary" type="button" data-as="new"><i data-lucide="plus"></i>新增</button><button class="text-link" type="button" data-as="refresh" title="刷新列表" aria-label="刷新列表"><i data-lucide="refresh-cw"></i></button></div><div class="fs-table-wrap"><table class="fs-table app-switch-table"><thead><tr>${headers.map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((c,i)=>{const s={...defaults,...c.settings};return `<tr><td>${i+1}</td><td>${esc(c.id)}</td><td>${esc(appName(c.app))}</td><td>${esc(c.platform)}</td><td>${esc(c.channel)}</td><td>${esc(c.subchannel)||'—'}</td><td>${esc(c.version)||'全部版本'}</td><td>${esc(s.phonePayment)}</td><td><span class="switch-blue-tag">-</span></td><td><span class="switch-blue-tag switch-plan-tag" title="${esc(s.newMemberPlan)}">${esc(s.newMemberPlan)}</span></td><td>${esc(s.ads)}</td><td>${esc(s.homePopup)}</td><td>${esc(s.loginType)}</td><td>${esc(s.payment)}</td><td>${c.showEnergy?'展示':'不展示'}</td><td><button class="text-link" data-as="edit" data-id="${esc(c.id)}">编辑</button><button class="text-link" data-as="delete" data-id="${esc(c.id)}">删除</button></td></tr>`;}).join('')||`<tr><td colspan="${headers.length}" class="fs-empty">暂无匹配配置</td></tr>`}</tbody></table></div><p class="energy-count">共 ${rows.length} 条数据</p>`;
    window.lucide?.createIcons();refreshAnnotations();
  }
  function open(){document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===menu));document.querySelector('.topbar h1').textContent='App总开关配置';document.querySelector('.topbar p').textContent='小组件中台 / App总开关配置';document.querySelector('.top-actions').hidden=true;setScreen('app-switches');render();}
  function edit(id){
    const c=configs.find(item=>item.id===id)||{app:'aiyong',platform:'安卓',channel:'默认',subchannel:'',version:'',showEnergy:true};
    const s={...defaults,...c.settings};
    const field=(name,label,control,required=false)=>`<div class="switch-field${name==='showEnergy'?' app-switch-energy':''}"><label for="switch-${name}">${required?'<em>*</em> ':''}${label}：</label><div class="switch-field-control">${control}</div></div>`;
    const select=(name,label,value,options,required=false,placeholder='')=>field(name,label,`<select id="switch-${name}" name="${name}" ${required?'required':''}>${placeholder?`<option value="">${placeholder}</option>`:''}${options.map(o=>{const [v,text]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${String(value)===String(v)?'selected':''}>${esc(text)}</option>`;}).join('')}</select><i class="switch-select-chevron" data-lucide="chevron-down"></i>`,required);
    const multi=(name,label,value,options,required=false,placeholder='请选择')=>{
      const selected=values(value),all=[...new Set([...options,...selected])];
      return field(name,label,`<details class="switch-multi" data-field="${name}"><summary id="switch-${name}" aria-label="${label}"><span class="switch-tags">${selected.length?selected.map(v=>`<span class="switch-tag">${esc(v)}<button type="button" data-as="remove-tag" data-field="${name}" data-value="${esc(v)}" aria-label="移除${esc(v)}">×</button></span>`).join(''):`<span class="switch-placeholder">${placeholder}</span>`}</span><i data-lucide="chevron-down"></i></summary><div class="switch-multi-options">${all.map(v=>`<label><input type="checkbox" name="${name}" value="${esc(v)}" ${selected.includes(v)?'checked':''} />${esc(v)}</label>`).join('')}</div></details>`,required);
    };
    const enabled=['启用','停用'];
    const fields=[
      select('app','应用编码',c.app,apps,true),multi('channel','渠道',c.channel,['默认','巨量','小米','华为','荣耀'],true,'请选择渠道'),
      select('platform','平台',c.platform,['安卓','iOS'],true),field('subchannel','子渠道',`<input id="switch-subchannel" name="subchannel" value="${esc(c.subchannel)}" placeholder="请选择子渠道" maxlength="30" />`),
      multi('version','版本',c.version,['1.0.0','1.0.1','1.0.2','9.0.0'],false,'请选择版本'),select('phonePayment','话费支付开关',s.phonePayment,enabled,true),
      select('newMemberPlan','新会员话费方案',s.newMemberPlan,[s.newMemberPlan,'百宝小组件会员-合规','星光相机会员-合规'],true),select('ads','广告开关',s.ads,enabled,true),
      select('homePopup','首页弹窗开关',s.homePopup,enabled,true),select('loginType','前置登录类型',s.loginType,['首页--一键登录-半弹窗','启动--一键登录-半弹窗','关闭'],true),
      select('payment','默认支付方式',s.payment,['支付宝','微信'],true),select('packagePriority','会员套餐优先类型',s.packagePriority,['三方支付-默认版本','话费支付-默认版本'],true),
      select('memberPackage','会员套餐',s.memberPackage,['月会员','季会员','年会员'],true),select('showWithheld','是否展示代扣会员套餐',s.showWithheld,['展示','不展示'],true),
      select('guestPurchase','游客购买会员',s.guestPurchase,enabled,true),select('thirdPartyHalf','三方付费半屏开关',s.thirdPartyHalf,['开启','关闭'],true),
      select('customerService','客服渠道',s.customerService,['自建 H5 客服','在线客服'],true),multi('paymentTriggers','付费触发时机 ⓘ',s.paymentTriggers,['用户完成前置登录','每天首次启动APP进入首页-登录用户','点击会员素材']),
      select('adPlatform','广告平台',s.adPlatform,['穿山甲','优量汇'],false,'请选择广告平台'),select('launchAd','启动页-自有广告',s.launchAd,['默认自有广告','不展示'],false,'请选择启动页-自有广告'),
      select('firstPage','默认首访页面',s.firstPage,['百宝小组件-静态壁纸','爱用小组件-小组件','爱用小组件-能量']),select('firstCategory','默认首访分类页',s.firstCategory,['热门','电量','时间日历'],false,' '),
      select('showEnergy','是否展示能量组件',String(c.showEnergy),[['true','展示'],['false','不展示']],true)
    ];
    dialog.classList.remove('is-maximized');
    dialog.innerHTML=`<form id="appSwitchEdit" data-edit-id="${esc(id||'')}"><header><h2 id="appSwitchTitle">${id?'编辑':'新增'}App总开关配置</h2><div class="switch-window-tools"><button type="button" data-as="maximize" aria-label="最大化"><i data-lucide="maximize-2"></i></button><button type="button" data-as="close" aria-label="关闭"><i data-lucide="x"></i></button></div></header><div class="app-switch-form">${fields.join('')}</div><p id="appSwitchError" role="alert" hidden></p><footer><button class="ghost" type="button" data-as="close">取消</button><button class="primary" type="submit">确认</button></footer></form>`;
    window.lucide?.createIcons();dialog.showModal();
  }
  menu.addEventListener('click',open);
  document.querySelector('.sidebar nav').addEventListener('click',e=>{const button=e.target.closest('button');if(button&&button!==menu)menu.classList.remove('active');});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-as]');if(!b)return;
    if(b.dataset.as==='new')edit();
    if(b.dataset.as==='edit')edit(b.dataset.id);
    if(b.dataset.as==='close')dialog.close();
    if(b.dataset.as==='maximize')dialog.classList.toggle('is-maximized');
    if(b.dataset.as==='remove-tag'){
      const group=dialog.querySelector(`.switch-multi[data-field="${b.dataset.field}"]`);
      const checkbox=[...group.querySelectorAll('input')].find(input=>input.value===b.dataset.value);if(checkbox)checkbox.checked=false;
      refreshTags(group);e.preventDefault();
    }
    if(b.dataset.as==='reset'){query=emptyQuery();render();}
    if(b.dataset.as==='refresh')render();
    if(b.dataset.as==='delete'&&confirm('删除这条 App 总开关配置？')){configs=configs.filter(c=>c.id!==b.dataset.id);persist();render();showToast('配置已删除');}
  });
  document.addEventListener('submit',e=>{
    if(e.target.matches('#appSwitchSearch')){e.preventDefault();query=Object.fromEntries(new FormData(e.target));query.subchannel=query.subchannel.trim();render();}
    if(!e.target.matches('#appSwitchEdit'))return;
    e.preventDefault();const d=new FormData(e.target),id=e.target.dataset.editId;
    const settings=Object.fromEntries(Object.keys(defaults).map(name=>[name,name==='paymentTriggers'?d.getAll(name).join(','):String(d.get(name)||'')]));
    const item={id:id||'2111'+Date.now(),app:d.get('app'),platform:d.get('platform'),channel:d.getAll('channel').join(','),subchannel:String(d.get('subchannel')).trim(),version:d.getAll('version').join(','),showEnergy:d.get('showEnergy')==='true',settings,updated:new Date().toLocaleString('sv-SE')};
    const error=message=>{const el=document.querySelector('#appSwitchError');el.hidden=false;el.textContent=message;};
    if(!item.channel){error('请选择渠道');return;}
    if(configs.some(c=>c.id!==id&&c.app===item.app&&c.platform===item.platform&&values(c.channel).sort().join(',')===values(item.channel).sort().join(',')&&c.subchannel===item.subchannel&&values(c.version).sort().join(',')===values(item.version).sort().join(','))){error('该应用、平台、渠道、子渠道及版本已有配置，请编辑已有记录');return;}
    const index=configs.findIndex(c=>c.id===id);if(index>=0)configs[index]=item;else configs.push(item);
    persist();dialog.close();render();showToast('App 总开关配置已保存');
  });
  function refreshTags(group){
    const selected=[...group.querySelectorAll('input:checked')].map(el=>el.value),field=group.dataset.field;
    group.querySelector('.switch-tags').innerHTML=selected.length?selected.map(v=>`<span class="switch-tag">${esc(v)}<button type="button" data-as="remove-tag" data-field="${field}" data-value="${esc(v)}" aria-label="移除${esc(v)}">×</button></span>`).join(''):'<span class="switch-placeholder">请选择</span>';
  }
  document.addEventListener('change',e=>{const group=e.target.closest('.switch-multi');if(group)refreshTags(group);});
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const saved=JSON.parse(e.newValue||'null');if(Array.isArray(saved)){configs=saved;apply();if(screen.classList.contains('active'))render();}}catch(_){}});
  apply();
})();
