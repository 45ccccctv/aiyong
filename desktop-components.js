(function(){
  'use strict';
  const key='aiyong-desktop-components-v1';
  const legacy=window.__energyMaterials;
  const categories=legacy.categories();
  const stamp=()=>new Date().toLocaleString('sv-SE');
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initial=categories.map((c,i)=>{
    const backgrounds=legacy.resources(c.id).map(b=>({id:b.id,code:b.id,name:b.name,url:b.image,vip:b.vip}));
    return {id:'2131000000000000'+String(i+1).padStart(2,'0'),name:c.name,kind:c.id,tags:'',code:'energy_'+c.id,functionType:'能量组件',backgrounds,cover:backgrounds[0].url,badge:'',enabled:true,audience:'所有用户',size:'2*2',updated:stamp(),updatedBy:'运营'};
  });
  const salaryDefaultId='213100000000000099';
  const salaryDefault={id:salaryDefaultId,name:'薪资计算',kind:'salary',tags:'',code:'salary_calculator',functionType:'时间日历组件',backgrounds:[{id:'salary-default-background',code:'salary-default-background',name:'牛马背景',url:'./assets/salary-animals.png',vip:false}],cover:'./assets/salary-widget.png',badge:'',enabled:true,audience:'所有用户',size:'2*2',updated:stamp(),updatedBy:'运营'};
  const withSalary=list=>list.some(c=>c.kind==='salary'||c.code==='salary_calculator')?list:[...list,structuredClone(salaryDefault)];
  const checkinDefaultId='213100000000000100';
  const checkinDefault={id:checkinDefaultId,name:'自定义打卡',kind:'checkin',tags:'',code:'custom_checkin',functionType:'打卡组件',backgrounds:[],checkin:{title:'今天也要夸夸自己',textColor:'#493c50'},checkinStates:{before:{image:'./assets/checkin-cat.png'},after:{image:'./assets/checkin-cat-done.png'}},cover:'./assets/checkin-cat.png',badge:'',enabled:true,audience:'所有用户',size:'2*2',updated:stamp(),updatedBy:'运营'};
  const withCheckin=list=>list.some(c=>c.kind==='checkin'||c.code==='custom_checkin')?list:[...list,structuredClone(checkinDefault)];
  const monthlyDefaultId='213100000000000101';
  const monthlyDefault={id:monthlyDefaultId,name:'月历打卡',kind:'monthly',tags:'',code:'monthly_checkin',functionType:'打卡组件',backgrounds:[],monthly:{copy:'每天锻炼一小时',icon:'flag',iconColor:'#e88c52',iconImage:''},cover:'./assets/monthly-checkin.png',badge:'',enabled:true,audience:'所有用户',size:'2*2',updated:stamp(),updatedBy:'运营'};
  const withMonthly=list=>list.some(c=>c.kind==='monthly'||c.code==='monthly_checkin')?list:[...list,structuredClone(monthlyDefault)];
  const clockDefaultId='213100000000000102',todoDefaultId='213100000000000103';
  const utilities=[{id:clockDefaultId,name:'听歌时钟',kind:'clock',code:'fixed_corner_clock',functionType:'时间日历组件',size:'2*2',clock:{background:'./assets/clock-background.png'},cover:'./assets/clock-widget.png'},{id:todoDefaultId,name:'每日计划',kind:'todo',code:'decorated_todo',functionType:'todo清单',size:'2*4',todo:{name:'每日计划',items:['早睡早起身体棒','读书半小时','好心情','好运气'],decoration:'./assets/todo-decoration.png',background:''},cover:'./assets/todo-widget.png'}].map(c=>({tags:'',backgrounds:[],badge:'',enabled:true,audience:'所有用户',updated:stamp(),updatedBy:'运营',...c}));
  const withUtilities=list=>[...list,...utilities.filter(seed=>!list.some(c=>c.kind===seed.kind)).map(c=>structuredClone(c))];
  const waterDefaultId='213100000000000104';
  const waterDefault={id:waterDefaultId,name:'喝水打卡',kind:'water',code:'water_checkin',functionType:'打卡组件',size:'2*2',water:{copy:'今天也要好好喝水',goal:8,done:0,textColor:'#4a705f',background:'#ffffff',image:'./assets/water-panda.png'},backgrounds:[],cover:'./assets/water-panda.png',badge:'',tags:'',enabled:true,audience:'所有用户',updated:stamp(),updatedBy:'运营'};
  const withWater=list=>list.some(c=>c.functionType==='喝水打卡组件'||c.functionType!=='能量组件'&&c.kind==='water')?list:[...list,structuredClone(waterDefault)];
  const petDefaultId='213100000000000105';
  const petDefault={id:petDefaultId,name:'桌宠小屋',kind:'pet',code:'desktop_pet',functionType:'桌宠组件',size:'4*4',sizes:['4*4'],pet:{rooms:[{id:'pink',name:'奶油卧室',image:'./assets/pet-room-pink.png'},{id:'green',name:'阳光书房',image:'./assets/pet-room-green.png'},{id:'night',name:'晚安小屋',image:'./assets/pet-room-night.png'}],states:[{id:'idle',name:'陪伴',image:'./assets/pet-idle.png'},{id:'happy',name:'开心',image:'./assets/pet-happy.png'},{id:'sleepy',name:'困困',image:'./assets/pet-sleepy.png'}]},backgrounds:[],cover:'./assets/pet-widget.png',badge:'',tags:'',enabled:true,audience:'所有用户',updated:stamp(),updatedBy:'运营'};
  const withPet=list=>list.some(c=>c.code==='desktop_pet'||c.kind==='pet')?list:[...list,structuredClone(petDefault)];
  const checkin2DefaultId='213100000000000106';
  const checkin2Default={id:checkin2DefaultId,name:'自定义打卡组件2',kind:'checkin2',code:'custom_checkin_2',functionType:'打卡组件',size:'2*2',checkin2:{before:{image:'./assets/spark-before.png',text:'今天还没有续火花',textColor:'#77717f'},after:{image:'./assets/spark-after.png',text:'今天已成功续火花',textColor:'#a64c25'}},backgrounds:[],cover:'./assets/spark-before.png',badge:'',tags:'',enabled:true,audience:'所有用户',updated:stamp(),updatedBy:'运营'};
  const withCheckin2=list=>list.some(c=>c.code==='custom_checkin_2'||c.kind==='checkin2')?list:[...list,structuredClone(checkin2Default)];
  const parameterKinds={salary_calculator:'salary',custom_checkin:'checkin',monthly_checkin:'monthly',water_checkin:'water',fixed_corner_clock:'clock',decorated_todo:'todo',desktop_pet:'pet',custom_checkin_2:'checkin2'};
  const kindCodes=Object.fromEntries(Object.entries(parameterKinds).map(([code,kind])=>[kind,code]));
  const implementation=c=>/^energy_/.test(c?.code||'')||c?.functionType==='能量组件'?'energy':parameterKinds[c?.code]||c?.kind||({'薪资组件':'salary','时钟组件':'clock','月历打卡组件':'monthly','喝水打卡组件':'water','TODO清单组件':'todo','打卡组件':'checkin'}[c?.functionType]);
  const typeFor=kind=>['salary','clock'].includes(kind)?'时间日历组件':['checkin','checkin2','monthly','water'].includes(kind)?'打卡组件':kind==='todo'?'todo清单':kind==='pet'?'桌宠组件':'能量组件';
  function restore(stored){
    if(stored?.version>=6&&Array.isArray(stored.components))return stored.components;
    if(stored?.version===5&&Array.isArray(stored.components))return withUtilities(stored.components);
    if(stored?.version===4&&Array.isArray(stored.components))return withUtilities(withMonthly(stored.components));
    if(stored?.version===3&&Array.isArray(stored.components))return withUtilities(withMonthly(withCheckin(stored.components)));
    if(stored?.version===2&&Array.isArray(stored.components))return withUtilities(withMonthly(withCheckin(withSalary(stored.components))));
    if(!Array.isArray(stored))return withUtilities(withMonthly(withCheckin(withSalary(structuredClone(initial)))));
    const migrated=stored.map(component=>{
      const seed=initial.find(c=>c.id===component.id);
      if(!seed)return component;
      const first=seed.backgrounds[0],backgrounds=[...component.backgrounds];
      const index=backgrounds.findIndex(b=>b.id===first.id);
      if(index>=0&&backgrounds[index].url.startsWith('./assets/'))backgrounds[index]={...backgrounds[index],url:first.url};
      else if(index<0||backgrounds[index].url!==first.url)backgrounds.unshift({...first,id:first.id+'-reference',code:first.id+'-reference'});
      return {...component,backgrounds,cover:component.cover?.startsWith('./assets/')?seed.cover:component.cover};
    });
    initial.filter(c=>['ingot','gourd','abacus','seal','lotus'].includes(c.kind)).forEach(seed=>{
      if(!migrated.some(c=>c.id===seed.id))migrated.push(structuredClone(seed));
    });
    return withUtilities(withMonthly(withCheckin(withSalary(migrated))));
  }
  let stored=null;try{stored=JSON.parse(localStorage.getItem(key)||'null');}catch(_){}
  function normalize(list){return list.map(c=>{const impl=implementation(c),kind=impl==='energy'?c.kind:impl;return {...c,kind,...(kind==='pet'?{size:'4*4',pet:c.pet||{rooms:[],states:[]}}:{}),functionType:impl==='energy'?'能量组件':typeFor(kind),sizes:kind==='pet'?['4*4']:impl!=='energy'&&['todo','water'].includes(kind)?['2*2','2*4']:[c.size||'2*2'],...(impl==='checkin'?{checkin:{title:c.checkin?.title??c.checkinStates?.before?.text??'今天也要夸夸自己',textColor:c.checkin?.textColor||'#493c50'},checkinStates:Object.fromEntries(['before','after'].map(s=>[s,{image:c.checkinStates?.[s]?.image||'',background:c.checkinStates?.[s]?.background||''}]))}:{}),...(impl==='todo'?{todo:{...c.todo,items:Array.from({length:4},(_,i)=>c.todo?.items?.[i]??utilities[1].todo.items[i])}}:{}),...(impl==='monthly'?{monthly:{...c.monthly,icon:'custom',iconImage:c.monthly?.iconImage||defaultMonthIcon(c.monthly)}}:{})};});}
  function defaultMonthIcon(m={}){const name=['flag','check','heart','star','flame'].includes(m.icon)?m.icon:'flag',node=window.lucide.createElement(window.lucide.icons[name[0].toUpperCase()+name.slice(1)],{stroke:m.iconColor||'#e88c52',width:32,height:32});return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(node));}
  const restoreAll=data=>{const list=data?.version>=7?restore(data):withWater(restore(data)),petList=data?.version>=10?list:withPet(list);return normalize(data?.version>=11?petList:withCheckin2(petList));};
  let components=restoreAll(stored);
  try{localStorage.setItem(key,JSON.stringify({version:11,components}));}catch(_){}
  function resources(kind){return components.filter(c=>kindCodes[kind]?implementation(c)===kind:c.functionType==='能量组件'&&(kind===undefined||c.kind===kind)).map(c=>({id:c.id,name:c.name,kind:c.kind,code:c.code,functionType:c.functionType,image:c.cover||c.backgrounds[0]?.url||'',vip:c.audience==='会员用户',size:c.size,sizes:c.sizes,enabled:c.enabled,backgroundCount:implementation(c)==='checkin2'?Object.values(c.checkin2||{}).filter(s=>s.image).length:implementation(c)==='checkin'?Object.values(c.checkinStates||{}).filter(s=>s.image).length:c.backgrounds.length}));}
  function styles(kind,ids){
    const list=ids?ids.map(id=>components.find(c=>c.id===id&&c.kind===kind)).filter(Boolean):components.filter(c=>c.kind===kind);
    return list.filter(c=>c.enabled).flatMap(c=>c.backgrounds.filter(b=>b.url).map(b=>[b.id,b.name||b.code,'',b.url,c.audience==='会员用户'||b.vip,c.id]));
  }
  window.__desktopComponents={categories:()=>categories,resources,styles,get:id=>components.find(c=>c.id===id),implementation,salaryDefaultId,checkinDefaultId,monthlyDefaultId,clockDefaultId,todoDefaultId,waterDefaultId,petDefaultId,checkin2DefaultId};
  const menu=document.createElement('button');menu.type='button';menu.textContent='桌面组件';menu.dataset.desktopMenu='true';document.querySelector('.sidebar nav').append(menu);
  const screen=document.createElement('section');screen.className='screen fs-admin desktop-component-admin';screen.dataset.screen='desktop-components';document.querySelector('.workspace').append(screen);
  const dialog=document.createElement('dialog');dialog.className='energy-edit-dialog desktop-component-dialog';dialog.setAttribute('aria-labelledby','desktopComponentTitle');document.body.append(dialog);
  let query={name:'',code:'',enabled:''},draft=null,uploading=0,uploadSession=0,typeBackgrounds={},removedLayers=new Set(),layerSpecs=[];
  const uid=prefix=>prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  function open(){
    document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===menu));
    document.querySelector('.topbar h1').textContent='桌面组件';document.querySelector('.topbar p').textContent='小组件中台 / 桌面组件';document.querySelector('.top-actions').hidden=true;setScreen('desktop-components');render();
  }
  function render(){
    const rows=components.filter(c=>c.name.includes(query.name)&&c.code.includes(query.code)&&(!query.enabled||String(c.enabled)===query.enabled));
    screen.innerHTML=`<form id="desktopComponentSearch" class="energy-search"><label>组件名称<input name="name" placeholder="请输入组件名称" value="${esc(query.name)}" /></label><label>与客户端约定的组件参数码<input name="code" placeholder="请输入组件参数码" value="${esc(query.code)}" /></label><label>有效状态<select name="enabled"><option value="">全部</option><option value="true" ${query.enabled==='true'?'selected':''}>有效</option><option value="false" ${query.enabled==='false'?'selected':''}>无效</option></select></label><button class="primary" type="submit"><i data-lucide="search"></i>查询</button><button class="ghost" type="button" data-dc="reset"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="desktop-component-toolbar"><button class="primary" type="button" data-dc="new"><i data-lucide="plus"></i>新增</button></div><div class="fs-table-wrap"><table class="fs-table desktop-component-table"><thead><tr>${['序号','组件名称','资源标签','与客户端约定的组件参数码','功能类型','背景图数量','封面图片','角标图片','有效状态','可用人群','更新人','修改时间','操作'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((c,i)=>`<tr data-component-id="${esc(c.id)}"><td>${i+1}</td><td><b>${esc(c.name)}</b></td><td>${esc(c.tags)||'—'}</td><td>${esc(c.code)||'—'}</td><td>${esc(c.functionType)}</td><td>${c.backgrounds.length} 张</td><td>${c.cover?`<img src="${esc(c.cover)}" alt="${esc(c.name)}封面" />`:'无图片'}</td><td>${c.badge?`<img src="${esc(c.badge)}" alt="角标" />`:'无图片'}</td><td><span class="${c.enabled?'fs-live':'energy-off'}">${c.enabled?'有效':'无效'}</span></td><td>${esc(c.audience)}</td><td>${esc(c.updatedBy)}</td><td>${esc(c.updated)}</td><td><button class="text-link" data-dc="edit" data-id="${esc(c.id)}">编辑</button><button class="fs-delete" data-dc="delete" data-id="${esc(c.id)}">删除</button></td></tr>`).join('')||'<tr><td colspan="13" class="fs-empty">暂无组件</td></tr>'}</tbody></table></div><p class="energy-count">共 ${rows.length} 条数据</p><p class="fs-annotation">批注：金、山、水等各作为一个能量组件创建，同一组件下可配置多张背景图。能量组件栏目直接关联桌面组件，不再增加分类栏目层级。</p>`;
    for(const c of rows)if(c.functionType!=='能量组件'){const kind=implementation(c),urls=kind==='checkin2'?Object.values(c.checkin2||{}).map(s=>s.image):kind==='pet'?[...(c.pet?.rooms||[]),...(c.pet?.states||[])].map(i=>i.image):kind==='checkin'?Object.values(c.checkinStates||{}).flatMap(s=>[s.image,s.background]):kind==='monthly'?[c.monthly?.background,c.monthly?.decoration,c.monthly?.iconImage]:kind==='water'?[c.water?.backgroundImage,c.water?.image]:kind==='clock'?[c.clock?.background,c.clock?.decoration]:kind==='todo'?[c.todo?.background,c.todo?.decoration]:[c.salaryBackground,...c.backgrounds.map(b=>b.url)];screen.querySelector(`[data-component-id="${c.id}"] td:nth-child(6)`).textContent=urls.filter(Boolean).length+' 张';}
    window.lucide?.createIcons();refreshAnnotations();
  }
  function edit(id){
    const existing=components.find(c=>c.id===id);
    draft=existing?structuredClone(existing):{id:uid('component'),name:'',kind:'',tags:'',code:'',functionType:'能量组件',backgrounds:[],cover:'',badge:'',enabled:true,audience:'所有用户',size:'2*2'};
    uploadSession++;uploading=0;
    typeBackgrounds={};
    removedLayers=new Set();
    dialog.classList.remove('is-maximized');
    dialog.innerHTML=`<form id="desktopComponentEdit" data-existing="${existing?'true':'false'}"><header><h2 id="desktopComponentTitle">${existing?'编辑':'新增'}</h2><div class="switch-window-tools"><button type="button" data-dc="maximize" aria-label="最大化"><i data-lucide="maximize-2"></i></button><button type="button" data-dc="close" aria-label="关闭"><i data-lucide="x"></i></button></div></header><div class="desktop-component-form"><div class="dc-form-row"><label for="dcName"><em>*</em>组件名称：</label><input id="dcName" name="name" required maxlength="40" placeholder="请输入组件名称" value="${esc(draft.name)}" /></div><div class="dc-form-row"><label for="dcTags">资源标签 ⓘ：</label><input id="dcTags" name="tags" placeholder="请选择资源标签" value="${esc(draft.tags)}" /></div><div class="dc-form-row"><label for="dcCode">与客户端约定的组件参数码：</label><input id="dcCode" name="code" placeholder="请输入组件参数码" value="${esc(draft.code)}" /></div><div class="dc-form-row"><label for="dcType"><em>*</em>功能类型：</label><select id="dcType" name="functionType" required><option>能量组件</option></select></div><div class="dc-form-row dc-material-row"><label>能量组件素材：</label><div class="dc-material-body" id="dcBackgroundImages"></div></div><div class="dc-form-row"><label>封面图片：</label><div id="dcCoverUpload"></div></div><div class="dc-form-row"><label>角标图片：</label><div id="dcBadgeUpload"></div></div><div class="dc-form-row"><label for="dcEnabled"><em>*</em>状态：</label><select id="dcEnabled" name="enabled" required><option value="true" ${draft.enabled?'selected':''}>有效</option><option value="false" ${!draft.enabled?'selected':''}>无效</option></select></div><div class="dc-form-row"><label for="dcAudience">可用人群：</label><select id="dcAudience" name="audience"><option ${draft.audience==='所有用户'?'selected':''}>所有用户</option><option ${draft.audience==='会员用户'?'selected':''}>会员用户</option></select></div><p class="fs-annotation dc-form-note">批注：支持多张图片上传、逐张删除。</p><p id="dcError" role="alert" hidden></p></div><footer><span id="dcUploadStatus"></span><button class="ghost" type="button" data-dc="close">取消</button><button class="primary" type="submit">确认</button></footer></form>`;
    const type=dialog.querySelector('#dcType');type.insertAdjacentHTML('beforeend','<option>时间日历组件</option><option>打卡组件</option><option>todo清单</option><option>桌宠组件</option>');type.value=draft.functionType;
    dialog.querySelector('#dcCode').setAttribute('list','dcParameterCodes');dialog.querySelector('#dcCode').insertAdjacentHTML('afterend',`<datalist id="dcParameterCodes">${Object.entries(parameterKinds).map(([code,kind])=>`<option value="${code}">${{salary:'薪资计算',clock:'听歌时钟',checkin:'自定义打卡',monthly:'月历打卡',water:'喝水打卡',todo:'每日计划',pet:'桌宠小屋',checkin2:'自定义打卡组件2'}[kind]}</option>`).join('')}</datalist>`);
    drawBackgrounds();drawSingleUploads();dialog.showModal();
  }
  const uploadTile=(type,id,url,label)=>`<label class="dc-upload-tile" title="${label}">${url?`<img src="${esc(url)}" alt="${label}" />`:`<i data-lucide="plus"></i><span>${label}</span>`}<input type="file" data-dc-upload="${type}" data-background-id="${esc(id)}" accept="image/png,image/jpeg,image/webp,image/gif" ${type==='background'?'multiple':''} /></label>`;
  function materialGroup(type,url,code,label,required=false){
    layerSpecs.push({type,label});if(removedLayers.has(type))return '';
    return `<section class="dc-material-group" data-material-layer="${esc(type)}"><header><b>${code}</b><span>${label}</span><button type="button" class="fs-delete" data-dc="remove-layer" data-layer="${esc(type)}" aria-label="删除${label}素材组">删除</button></header><label class="dc-layer-label" for="dcLayerCode-${type}">位置码 code</label><input class="dc-layer-code" id="dcLayerCode-${type}" value="${code}" readonly aria-label="${label}位置码" /><span class="dc-layer-label">${required?'<em>*</em>':''}图片地址 imageUrl</span>${uploadTile(type,'',url,'上传'+label)}<p class="dc-upload-note">支持 JPG、PNG、GIF、WebP 图片，每张不超过 5MB。${code==='badge_front'?'装饰层建议使用透明背景 PNG。':''}</p></section>`;
  }
  function finishLayers(){const missing=layerSpecs.filter(s=>removedLayers.has(s.type));dialog.querySelector('#dcBackgroundImages').insertAdjacentHTML('beforeend',missing.length?`<details class="dc-add-material"><summary><i data-lucide="plus"></i>新增素材组</summary><div>${missing.map(s=>`<button type="button" data-dc="add-layer" data-layer="${esc(s.type)}">${esc(s.label)}</button>`).join('')}</div></details>`:'');}
  function setLayer(type,value){
    if(type==='salary-background')draft.salaryBackground=value;
    else if(type==='salary-decoration'){draft.backgrounds=value?[{id:'salary-decoration',code:'badge_front',name:'装饰层',url:value,vip:false}]:[];}
    else if(type==='monthly-icon'){draft.monthly.icon='custom';draft.monthly.iconImage=value;}
    else if(type.startsWith('checkin2-'))draft.checkin2[type.slice(9)].image=value;
    else if(type.startsWith('checkin-')){const [,state,field]=type.split('-');draft.checkinStates[state][field||'image']=value;}
    else{const [kind,field]=type.split('-');draft[kind][field]=value;}
  }
  function drawSingleUploads(){
    dialog.querySelector('#dcCoverUpload').innerHTML=uploadTile('cover','',draft.cover,'点击上传文件')+(draft.cover?'<button type="button" class="text-link" data-dc="clear-cover">移除</button>':'');
    dialog.querySelector('#dcBadgeUpload').innerHTML=uploadTile('badge','',draft.badge,'点击上传文件')+(draft.badge?'<button type="button" class="text-link" data-dc="clear-badge">移除</button>':'');
    window.lucide?.createIcons();
  }
  function petGroups(group,label){
    const list=draft.pet[group],room=group==='rooms';
    return `<div class="dc-pet-group"><header><b>${label}</b><button type="button" class="text-link" data-dc="pet-add" data-group="${group}"><i data-lucide="plus"></i>新增${room?'房间':'状态'}</button></header>${list.map((item,i)=>`<section class="dc-material-group dc-pet-item"><header><b>${room?'房间':'状态'} ${i+1}${i===0?' · 默认':''}</b><div><button type="button" class="text-link" data-dc="pet-move" data-group="${group}" data-id="${esc(item.id)}" data-direction="-1" ${i===0?'disabled':''} title="上移" aria-label="上移${esc(item.name)}"><i data-lucide="arrow-up"></i></button><button type="button" class="text-link" data-dc="pet-move" data-group="${group}" data-id="${esc(item.id)}" data-direction="1" ${i===list.length-1?'disabled':''} title="下移" aria-label="下移${esc(item.name)}"><i data-lucide="arrow-down"></i></button><button type="button" class="fs-delete" data-dc="pet-remove" data-group="${group}" data-id="${esc(item.id)}">删除</button></div></header><label class="dc-layer-label" for="pet-name-${esc(item.id)}"><em>*</em>${room?'房间名称':'状态名称'}</label><input id="pet-name-${esc(item.id)}" data-dc-pet-group="${group}" data-id="${esc(item.id)}" required maxlength="20" value="${esc(item.name)}" placeholder="请输入${room?'房间':'状态'}名称" /><span class="dc-layer-label"><em>*</em>${room?'房间背景图':'娃娃状态图片'}</span>${uploadTile('pet-'+group,item.id,item.image,'上传'+(room?'房间背景':'状态图片'))}<p class="dc-upload-note">支持 JPG、PNG、GIF、WebP，每张不超过 5MB。${room?'':'建议使用透明底 PNG，同一娃娃各状态的画布和位置保持一致。'}</p></section>`).join('')}</div>`;
  }
  function drawBackgrounds(){
    const kind=implementation(draft),salary=kind==='salary';
    layerSpecs=[];
    dialog.querySelector('.dc-size-row')?.remove();if(['water','todo'].includes(kind))dialog.querySelector('.dc-material-row').insertAdjacentHTML('beforebegin','<div class="dc-form-row dc-size-row"><label>支持尺寸：</label><div class="dc-size-options"><label><input type="checkbox" checked disabled />小号 2×2</label><label><input type="checkbox" checked disabled />中号 2×4</label></div></div>');
    dialog.querySelector('.dc-code-note')?.remove();dialog.querySelector('#dcCode').insertAdjacentHTML('afterend','<small class="dc-code-note">批注：功能类型仅作归类，研发根据此参数码区分并实现具体组件。</small>');
    if(kind==='pet'){
      draft.pet??={rooms:[],states:[]};draft.size='4*4';
      dialog.querySelector('.dc-material-row').insertAdjacentHTML('beforebegin','<div class="dc-form-row dc-size-row"><label>支持尺寸：</label><div class="dc-size-options"><label><input type="checkbox" checked disabled />大号 4×4</label></div></div>');
      dialog.querySelector('.dc-material-row>label').textContent='桌宠素材配置：';dialog.querySelector('#dcCode').required=true;dialog.querySelector('label[for="dcCode"]').innerHTML='<em>*</em>与客户端约定的组件参数码：';
      dialog.querySelector('#dcBackgroundImages').innerHTML=petGroups('rooms','房间配置')+petGroups('states','互动状态配置');
      dialog.querySelector('.dc-form-note').textContent='批注：仅一个娃娃，大号 4×4。房间与娃娃分层展示；首个房间、首个状态为默认，客户端可切换房间，点击娃娃按顺序切换状态。状态均为同一娃娃的不同形态，不增加角色选择。';
      window.lucide?.createIcons();return;
    }
    if(kind==='water'){
      draft.water??={copy:'今天也要好好喝水',goal:8,done:0,textColor:'#4a705f',background:'#ffffff',image:''};const w=draft.water;
      dialog.querySelector('.dc-material-row>label').textContent='喝水打卡配置：';dialog.querySelector('#dcCode').required=true;dialog.querySelector('label[for="dcCode"]').innerHTML='<em>*</em>与客户端约定的组件参数码：';
      dialog.querySelector('#dcBackgroundImages').innerHTML=`<div class="dc-checkin-copy dc-water-copy"><label for="dcWaterCopy"><span><em>*</em>默认文案</span><input id="dcWaterCopy" data-dc-water="copy" required maxlength="40" value="${esc(w.copy)}" /></label><label for="dcWaterTextColor"><span>文字颜色</span><input id="dcWaterTextColor" data-dc-water="textColor" type="color" value="${esc(w.textColor)}" /></label></div><div class="dc-monthly-fields"><label for="dcWaterGoal"><em>*</em>目标值（杯）</label><input id="dcWaterGoal" data-dc-water="goal" type="number" min="1" max="99" step="1" required value="${w.goal}" /><label for="dcWaterDone"><em>*</em>默认已打卡数量（杯）</label><input id="dcWaterDone" data-dc-water="done" type="number" min="0" max="99" step="1" required value="${w.done}" /></div>${materialGroup('water-backgroundImage',w.backgroundImage,'background','背景图')}${materialGroup('water-image',w.image,'badge_front','装饰层',true)}`;
      dialog.querySelector('.dc-form-note').textContent='批注：background 为底层背景，badge_front 为喝水装饰层；文案、数量和加号由客户端展示，每天重置已打卡数量。';finishLayers();window.lucide?.createIcons();return;
    }
    if(['clock','todo'].includes(kind)){
      const clock=kind==='clock';draft.clock??={background:''};draft.todo??={name:'',items:['','','',''],decoration:'',background:''};
      dialog.querySelector('.dc-material-row>label').textContent=clock?'时钟组件素材：':'清单组件素材：';dialog.querySelector('#dcCode').required=true;dialog.querySelector('label[for="dcCode"]').innerHTML='<em>*</em>与客户端约定的组件参数码：';
      dialog.querySelector('#dcBackgroundImages').innerHTML=clock?materialGroup('clock-background',draft.clock.background,'background','背景图',true)+materialGroup('clock-decoration',draft.clock.decoration,'badge_front','装饰层'):`<div class="dc-monthly-fields"><label for="dcTodoName"><em>*</em>默认计划名</label><input id="dcTodoName" data-dc-todo="name" required maxlength="40" value="${esc(draft.todo.name)}" />${Array.from({length:4},(_,i)=>`<label for="dcTodoItem${i}"><em>*</em>计划 ${i+1}</label><input id="dcTodoItem${i}" data-dc-todo-item="${i}" required maxlength="32" value="${esc(draft.todo.items[i])}" />`).join('')}</div>${materialGroup('todo-background',draft.todo.background,'background','背景图')}${materialGroup('todo-decoration',draft.todo.decoration,'badge_front','右侧装饰层')}`;
      dialog.querySelector('.dc-form-note').textContent=clock?'批注：背景图在底层，装饰层在前景，时间固定在右上角并显示在装饰层上方。':'批注：固定 4 条计划。让 UI 根据间距排版来看下具体可以放下几条。清单在左侧，装饰图在右侧。';finishLayers();window.lucide?.createIcons();return;
    }
    if(kind==='monthly'){
      draft.monthly??={copy:'',icon:'custom',iconImage:''};
      const m=draft.monthly;
      dialog.querySelector('.dc-material-row>label').textContent='月历打卡配置：';dialog.querySelector('#dcCode').required=true;
      dialog.querySelector('label[for="dcCode"]').innerHTML='<em>*</em>与客户端约定的组件参数码：';
      dialog.querySelector('#dcBackgroundImages').innerHTML=`<div class="dc-monthly-fields"><label for="dcMonthCopy"><em>*</em>文案</label><input id="dcMonthCopy" data-dc-monthly="copy" required maxlength="40" value="${esc(m.copy)}" placeholder="如：每天锻炼一小时" /></div>${materialGroup('monthly-background',m.background,'background','背景图')}${materialGroup('monthly-decoration',m.decoration,'badge_front','装饰层')}${materialGroup('monthly-icon',m.iconImage,'checkin_icon','打卡后图标',true)}`;
      dialog.querySelector('.dc-form-note').textContent='批注：背景与装饰层分别上传，装饰层不遮挡月历内容。打卡后图标单独配置，仅在已打卡日期格显示。仅保留本月记录。';
      finishLayers();window.lucide?.createIcons();return;
    }
    if(kind==='checkin2'){
      draft.checkin2??={before:{image:'',text:'',textColor:'#77717f'},after:{image:'',text:'',textColor:'#a64c25'}};draft.size='2*2';
      dialog.querySelector('.dc-material-row>label').textContent='打卡前后配置：';dialog.querySelector('#dcCode').required=true;
      dialog.querySelector('label[for="dcCode"]').innerHTML='<em>*</em>与客户端约定的组件参数码：';
      dialog.querySelector('#dcBackgroundImages').innerHTML=['before','after'].map(state=>{const item=draft.checkin2[state],label=state==='before'?'打卡前':'打卡后';return `<fieldset class="dc-checkin-state dc-checkin2-state"><legend>${label}</legend><div class="dc-checkin-copy"><label><span><em>*</em>文案</span><input data-dc-checkin2-state="${state}" data-field="text" required maxlength="40" value="${esc(item.text)}" aria-label="${label}文案" /></label><label><span>文字颜色</span><input type="color" data-dc-checkin2-state="${state}" data-field="textColor" value="${esc(item.textColor)}" aria-label="${label}文字颜色" /></label></div>${materialGroup('checkin2-'+state,item.image,'background',label+'背景图',true)}</fieldset>`;}).join('');
      dialog.querySelector('.dc-form-note').textContent='批注：自定义打卡组件2为小号 2×2，不展示天数。打卡前后各配置一张背景图、一套文案和文字颜色；点击组件完成当日打卡后切换整套样式，次日恢复未打卡状态。用户可在 App 内分别自定义两套背景、文案与文字颜色，个人设置优先。';
      finishLayers();window.lucide?.createIcons();return;
    }
    if(kind==='checkin'){
      draft.checkinStates??={before:{image:''},after:{image:''}};draft.checkin??={title:'',textColor:'#493c50'};
      dialog.querySelector('.dc-material-row>label').textContent='打卡状态素材：';
      dialog.querySelector('#dcCode').required=true;
      dialog.querySelector('label[for="dcCode"]').innerHTML='<em>*</em>与客户端约定的组件参数码：';
      dialog.querySelector('#dcBackgroundImages').innerHTML=`<div class="dc-checkin-copy"><label><span><em>*</em>文案标题</span><input id="dcCheckinTitle" data-dc-checkin="title" required maxlength="40" value="${esc(draft.checkin.title)}" placeholder="请输入文案标题" /></label><label><span>文字颜色</span><input id="dcCheckinColor" data-dc-checkin="textColor" type="color" value="${esc(draft.checkin.textColor)}" aria-label="文案标题文字颜色" /></label></div>`+['before','after'].map(state=>{const item=draft.checkinStates[state],label=state==='before'?'未打卡':'已打卡';return `<fieldset class="dc-checkin-state"><legend>${label}</legend>${materialGroup('checkin-'+state+'-background',item.background,'background',label+'背景图')}${materialGroup('checkin-'+state,item.image,'badge_front',label+'装饰层',true)}</fieldset>`;}).join('');
      dialog.querySelector('.dc-form-note').textContent='批注：文案标题和文字颜色只有一套，不随打卡状态变化。未打卡、已打卡仅切换图片。App 默认使用中台标题与颜色，用户可自行修改打卡标题、文字颜色等个人配置。';
      finishLayers();window.lucide?.createIcons();return;
    }
    if(salary){
      dialog.querySelector('.dc-material-row>label').textContent='薪资组件素材：';dialog.querySelector('#dcCode').required=true;dialog.querySelector('label[for="dcCode"]').innerHTML='<em>*</em>与客户端约定的组件参数码：';
      dialog.querySelector('#dcBackgroundImages').innerHTML=materialGroup('salary-background',draft.salaryBackground,'background','背景图')+materialGroup('salary-decoration',draft.backgrounds[0]?.url,'badge_front','装饰层',true);
      dialog.querySelector('.dc-form-note').textContent='批注：背景图在底层，牛马等图案上传至装饰层。客户端默认月薪 5000 元、09:00 上班、18:00 下班，薪资和上下班时间无需中台配置，用户可在 App 内修改。每次点击组件更新一次薪资，不实时刷新。';finishLayers();window.lucide?.createIcons();return;
    }
    dialog.querySelector('.dc-material-row>label').textContent='能量组件素材：';
    dialog.querySelector('#dcCode').required=false;
    dialog.querySelector('label[for="dcCode"]').textContent='与客户端约定的组件参数码：';
    dialog.querySelector('#dcBackgroundImages').innerHTML=`<div class="dc-image-grid">${draft.backgrounds.map((b,i)=>`<div class="dc-background-image" data-background-id="${esc(b.id)}"><img src="${esc(b.url)}" alt="${esc(b.name||'背景图片 '+(i+1))}" /><button type="button" data-dc="remove-background" data-id="${esc(b.id)}" title="删除图片" aria-label="删除第${i+1}张图片"><i data-lucide="trash-2"></i></button></div>`).join('')}${uploadTile('background','','','上传图片')}</div><p class="dc-upload-note">支持 jpg、jpeg、png、gif、webp 图片，每张不超过 5MB，可多选上传</p>`;
    dialog.querySelector('.dc-form-note').textContent='批注：支持多张图片上传、逐张删除。';
    window.lucide?.createIcons();
  }
  function showError(message){const el=dialog.querySelector('#dcError');el.hidden=!message;el.textContent=message;}
  async function readImage(file){
    if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>5*1024*1024)throw new Error('请选择 5MB 以内的 JPG、PNG、GIF 或 WebP 图片');
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('图片读取失败'));reader.readAsDataURL(file);});
    const picture=new Image();picture.src=data;try{await picture.decode();}catch(_){throw new Error('图片无法解析，请重新选择');}
    if(file.type==='image/gif')return data;
    const scale=Math.min(1,1000/Math.max(picture.naturalWidth,picture.naturalHeight));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(picture.naturalWidth*scale));canvas.height=Math.max(1,Math.round(picture.naturalHeight*scale));canvas.getContext('2d').drawImage(picture,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/webp',.88);
  }
  async function upload(input){
    const files=[...input.files];if(!files.length)return;
    const session=uploadSession,type=input.dataset.dcUpload;
    uploading++;showError('');updateUploadStatus();
    try{
      const images=[];for(const file of files)images.push({url:await readImage(file),name:file.name.replace(/\.[^.]+$/,'')});
      if(session!==uploadSession||!dialog.open)return;
      if(type==='pet-rooms'||type==='pet-states'){const item=draft.pet[type.slice(4)].find(i=>i.id===input.dataset.backgroundId);if(item)item.image=images[0].url;drawBackgrounds();}
      else if(layerSpecs.some(s=>s.type===type)){setLayer(type,images[0].url);drawBackgrounds();}
      else if(type==='background'){
        images.forEach(image=>{const id=uid('background');draft.backgrounds.push({id,code:id,...image,vip:false});});
        drawBackgrounds();
      }else{draft[type]=images[0].url;drawSingleUploads();}
    }catch(error){if(session===uploadSession)showError(error.message);}
    finally{if(session===uploadSession){uploading--;updateUploadStatus();}}
  }
  function updateUploadStatus(){dialog.querySelector('#dcUploadStatus').textContent=uploading?'图片处理中…':'';dialog.querySelector('button[type="submit"]').disabled=uploading>0;dialog.querySelector('#dcType').disabled=uploading>0;dialog.querySelectorAll('[data-dc-upload],[data-dc="remove-layer"],[data-dc="add-layer"]').forEach(input=>{input.disabled=uploading>0;});}
  function persist(next){
    try{localStorage.setItem(key,JSON.stringify({version:11,components:next}));}catch(_){return false;}
    components=next;window.dispatchEvent(new Event('desktop-components-changed'));return true;
  }
  menu.addEventListener('click',open);
  document.querySelector('.sidebar nav').addEventListener('click',e=>{if(e.target.closest('button')!==menu)menu.classList.remove('active');});
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-dc]');if(!b)return;
    const action=b.dataset.dc;
    if(action==='new')edit();
    if(action==='edit')edit(b.dataset.id);
    if(action==='reset'){query={name:'',code:'',enabled:''};render();}
    if(action==='close'){uploadSession++;dialog.close();}
    if(action==='maximize')dialog.classList.toggle('is-maximized');
    if(action==='pet-add'&&!uploading){const group=b.dataset.group;if(draft.pet[group].length>=12){showError('每组最多配置12项');return;}draft.pet[group].push({id:uid(group),name:'',image:''});drawBackgrounds();}
    if(action==='pet-remove'&&!uploading){const group=b.dataset.group;draft.pet[group]=draft.pet[group].filter(i=>i.id!==b.dataset.id);drawBackgrounds();}
    if(action==='pet-move'&&!uploading){const list=draft.pet[b.dataset.group],from=list.findIndex(i=>i.id===b.dataset.id),to=from+Number(b.dataset.direction);if(from>=0&&to>=0&&to<list.length){[list[from],list[to]]=[list[to],list[from]];drawBackgrounds();}}
    if(action==='remove-background'){draft.backgrounds=draft.backgrounds.filter(item=>item.id!==b.dataset.id);drawBackgrounds();}
    if(action==='clear-cover'||action==='clear-badge'){draft[action==='clear-cover'?'cover':'badge']='';drawSingleUploads();}
    if(action==='clear-state'){draft.checkinStates[b.dataset.state].image='';drawBackgrounds();}
    if(action==='clear-month-icon'){draft.monthly.iconImage='';drawBackgrounds();}
    if(action==='remove-layer'&&!uploading){setLayer(b.dataset.layer,'');removedLayers.add(b.dataset.layer);drawBackgrounds();}
    if(action==='add-layer'&&!uploading){removedLayers.delete(b.dataset.layer);drawBackgrounds();}
    if(action==='clear-utility-image'){const [kind,field]=b.dataset.asset.split('-');draft[kind][field]='';drawBackgrounds();}
    if(action==='delete'&&confirm('删除此组件？关联栏目将不再展示它，不影响用户已保存的组件。')){
      if(!persist(components.filter(c=>c.id!==b.dataset.id))){showToast('存储失败，组件未删除');return;}render();showToast('组件已删除');
    }
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='dcType'){
      typeBackgrounds[implementation(draft)]=draft.backgrounds;
      draft.functionType=e.target.value;
      const kind=implementation(draft);if(typeFor(kind)!==draft.functionType){draft.kind={'时间日历组件':'salary','打卡组件':'checkin','todo清单':'todo','桌宠组件':'pet','能量组件':''}[draft.functionType];draft.code=kindCodes[draft.kind]||'';dialog.querySelector('#dcCode').value=draft.code;}
      draft.backgrounds=typeBackgrounds[draft.kind]||[];
      drawBackgrounds();
    }
    if(e.target.dataset.dcUpload)upload(e.target);
  });
  document.addEventListener('input',e=>{if(e.target.dataset.dcStateText&&draft)draft.checkinStates[e.target.dataset.dcStateText].text=e.target.value;if(e.target.dataset.dcMonthly&&draft)draft.monthly[e.target.dataset.dcMonthly]=e.target.value;if(e.target.dataset.dcTodo&&draft)draft.todo[e.target.dataset.dcTodo]=e.target.dataset.dcTodo==='items'?e.target.value.split('\n'):e.target.value;});
  document.addEventListener('input',e=>{if(!draft)return;if(e.target.dataset.dcTodoItem!==undefined)draft.todo.items[Number(e.target.dataset.dcTodoItem)]=e.target.value;if(e.target.dataset.dcWater){const f=e.target.dataset.dcWater;draft.water[f]=['goal','done'].includes(f)?Number(e.target.value):e.target.value;}});
  document.addEventListener('input',e=>{const group=e.target.dataset.dcPetGroup;if(draft&&group){const item=draft.pet[group]?.find(i=>i.id===e.target.dataset.id);if(item)item.name=e.target.value;}});
  document.addEventListener('input',e=>{if(draft&&e.target.dataset.dcCheckin2State)draft.checkin2[e.target.dataset.dcCheckin2State][e.target.dataset.field]=e.target.value;});
  document.addEventListener('input',e=>{if(draft&&e.target.dataset.dcCheckin)draft.checkin[e.target.dataset.dcCheckin]=e.target.value;});
  document.addEventListener('change',e=>{if(e.target.id!=='dcCode'||!draft)return;draft.code=e.target.value.trim();const kind=parameterKinds[draft.code];if(kind){draft.kind=kind;draft.functionType=typeFor(kind);dialog.querySelector('#dcType').value=draft.functionType;drawBackgrounds();}});
  document.addEventListener('submit',e=>{
    if(e.target.matches('#desktopComponentSearch')){e.preventDefault();query=Object.fromEntries(new FormData(e.target));render();}
    if(!e.target.matches('#desktopComponentEdit'))return;
    e.preventDefault();if(uploading)return;
    const d=new FormData(e.target),name=String(d.get('name')).trim();
    if(!name){showError('请填写组件名称');return;}
    const selectedKind=implementation({...draft,code:String(d.get('code')).trim()}),checkin=selectedKind==='checkin',monthly=selectedKind==='monthly',salary=selectedKind==='salary';
    const clock=selectedKind==='clock',todo=selectedKind==='todo',water=selectedKind==='water',pet=selectedKind==='pet',checkin2=selectedKind==='checkin2';
    if(checkin2){for(const state of ['before','after']){const item=draft.checkin2?.[state];if(!item?.image||!item.text.trim()||item.text.trim().length>40||!/^#[0-9a-f]{6}$/i.test(item.textColor)){showError('请填写打卡前后文案、有效文字颜色并上传背景图');return;}item.text=item.text.trim();}}
    else if(pet){const p=draft.pet;if(!p?.rooms?.length||p.states?.length<2){showError('请至少配置一个房间和两种娃娃状态');return;}for(const group of ['rooms','states']){if(p[group].length>12||p[group].some(i=>!i.name.trim()||!i.image)){showError('请填写每项名称并上传图片，每组最多12项');return;}if(new Set(p[group].map(i=>i.name.trim())).size!==p[group].length){showError('同组名称不能重复');return;}p[group].forEach(i=>i.name=i.name.trim());}}
    else if(clock){if(!draft.clock?.background){showError('请上传时钟背景图');return;}}
    else if(todo){const items=draft.todo.items.map(s=>s.trim());if(!draft.todo.name.trim()||items.length!==4||items.some(s=>!s||s.length>32)){showError('请填写计划名和4条计划，每条最多32字');return;}draft.todo.items=items;draft.todo.name=draft.todo.name.trim();}
    else if(water){const w=draft.water;if(!w.copy.trim()||!w.image||!Number.isInteger(w.goal)||w.goal<1||w.goal>99||!Number.isInteger(w.done)||w.done<0||w.done>99){showError('请填写文案、1至99的目标值、0至99的已打卡数量并上传图片');return;}w.copy=w.copy.trim();}
    else if(monthly){
      if(!draft.monthly?.copy.trim()){showError('请填写月历打卡文案');return;}
      if(!draft.monthly.iconImage){showError('请上传打卡图标图片');return;}
    }else if(checkin){
      if(!draft.checkin?.title.trim()||!/^#[0-9a-f]{6}$/i.test(draft.checkin.textColor)){showError('请填写文案标题和有效文字颜色');return;}
      for(const state of ['before','after']){const item=draft.checkinStates?.[state],label=state==='before'?'未打卡':'已打卡';if(!item?.image){showError('请上传'+label+'图片');return;}}
    }else if(!draft.backgrounds.length||draft.backgrounds.some(b=>!b.url)){showError(salary?'请上传薪资装饰层图片':'请至少上传一张背景图');return;}
    if(components.some(c=>c.id!==draft.id&&c.name===name)){showError('组件名称已存在，请编辑已有组件');return;}
    const code=String(d.get('code')).trim();
    const functionType=d.get('functionType');if(typeFor(selectedKind)!==functionType){showError('功能类型与组件参数码不匹配');return;}
    if((salary||checkin||checkin2||monthly||clock||todo||water||pet)&&!code){showError('请填写与客户端约定的组件参数码');return;}
    if((salary||checkin||checkin2||monthly||clock||todo||water||pet)&&components.some(c=>c.id!==draft.id&&c.code===code)){showError('组件参数码已存在');return;}
    if(salary&&draft.backgrounds.length!==1){showError('薪资组件需要配置一张装饰层图片');return;}
    const kind=checkin2?'checkin2':pet?'pet':water?'water':clock?'clock':todo?'todo':monthly?'monthly':checkin?'checkin':salary?'salary':categories.find(c=>code==='energy_'+c.id||code.startsWith('energy_'+c.id+'_'))?.id||(!['salary','checkin','monthly','clock','todo','water','pet','checkin2'].includes(draft.kind)&&draft.kind)||categories.find(c=>c.name===name)?.id||draft.id;
    const item={...draft,name,tags:String(d.get('tags')).trim(),code,functionType,kind,enabled:d.get('enabled')==='true',audience:d.get('audience'),size:checkin2?'2*2':pet?'4*4':todo?'2*4':clock||water?'2*2':draft.size,sizes:checkin2?['2*2']:pet?['4*4']:todo||water?['2*2','2*4']:[draft.size||'2*2'],cover:draft.cover||(checkin2?draft.checkin2.before.image:pet?draft.pet.rooms[0].image:water?draft.water.image:clock?draft.clock.background:todo?'./assets/todo-widget.png':monthly?'./assets/monthly-checkin.png':checkin?draft.checkinStates.before.image:draft.backgrounds[0].url),updated:stamp(),updatedBy:'运营',backgrounds:checkin2||pet||checkin||monthly||clock||todo||water?[]:draft.backgrounds.map(b=>({...b,code:b.code||b.id,name:b.name||b.id}))};
    if(monthly)item.monthly.copy=item.monthly.copy.trim();
    if(checkin)item.checkin.title=item.checkin.title.trim();
    const next=components.some(c=>c.id===item.id)?components.map(c=>c.id===item.id?item:c):[...components,item];
    if(!persist(next)){showError('浏览器存储空间不足，请减少图片数量或压缩图片后重试，当前表单已保留');return;}
    dialog.close();render();showToast('组件已保存');
  });
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const data=JSON.parse(e.newValue||'null');if(Array.isArray(data)||Array.isArray(data?.components)){components=restoreAll(data);window.dispatchEvent(new Event('desktop-components-changed'));if(screen.classList.contains('active'))render();}}catch(_){}});
})();
