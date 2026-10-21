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
  let components=initial;
  try{const stored=JSON.parse(localStorage.getItem(key)||'null');if(Array.isArray(stored))components=stored;}catch(_){}
  components=components.map(c=>({...c,functionType:'能量组件'}));
  function resources(kind){return components.filter(c=>kind===undefined||c.kind===kind).map(c=>({id:c.id,name:c.name,kind:c.kind,image:c.cover||c.backgrounds[0]?.url||'',vip:c.audience==='会员用户',size:c.size,enabled:c.enabled,backgroundCount:c.backgrounds.length}));}
  function styles(kind,ids){
    const list=ids?ids.map(id=>components.find(c=>c.id===id&&c.kind===kind)).filter(Boolean):components.filter(c=>c.kind===kind);
    return list.filter(c=>c.enabled).flatMap(c=>c.backgrounds.filter(b=>b.url).map(b=>[b.id,b.name||b.code,'',b.url,c.audience==='会员用户'||b.vip,c.id]));
  }
  window.__desktopComponents={categories:()=>categories,resources,styles,get:id=>components.find(c=>c.id===id)};
  const menu=document.createElement('button');menu.type='button';menu.textContent='桌面组件';menu.dataset.desktopMenu='true';document.querySelector('.sidebar nav').append(menu);
  const screen=document.createElement('section');screen.className='screen fs-admin desktop-component-admin';screen.dataset.screen='desktop-components';document.querySelector('.workspace').append(screen);
  const dialog=document.createElement('dialog');dialog.className='energy-edit-dialog desktop-component-dialog';dialog.setAttribute('aria-labelledby','desktopComponentTitle');document.body.append(dialog);
  let query={name:'',code:'',enabled:''},draft=null,uploading=0,uploadSession=0;
  const uid=prefix=>prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  function open(){
    document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b===menu));
    document.querySelector('.topbar h1').textContent='桌面组件';document.querySelector('.topbar p').textContent='小组件中台 / 桌面组件';document.querySelector('.top-actions').hidden=true;setScreen('desktop-components');render();
  }
  function render(){
    const rows=components.filter(c=>c.name.includes(query.name)&&c.code.includes(query.code)&&(!query.enabled||String(c.enabled)===query.enabled));
    screen.innerHTML=`<form id="desktopComponentSearch" class="energy-search"><label>组件名称<input name="name" placeholder="请输入组件名称" value="${esc(query.name)}" /></label><label>与客户端约定的组件参数码<input name="code" placeholder="请输入组件参数码" value="${esc(query.code)}" /></label><label>有效状态<select name="enabled"><option value="">全部</option><option value="true" ${query.enabled==='true'?'selected':''}>有效</option><option value="false" ${query.enabled==='false'?'selected':''}>无效</option></select></label><button class="primary" type="submit"><i data-lucide="search"></i>查询</button><button class="ghost" type="button" data-dc="reset"><i data-lucide="rotate-ccw"></i>重置</button></form><div class="desktop-component-toolbar"><button class="primary" type="button" data-dc="new"><i data-lucide="plus"></i>新增</button></div><div class="fs-table-wrap"><table class="fs-table desktop-component-table"><thead><tr>${['序号','组件名称','资源标签','与客户端约定的组件参数码','功能类型','背景图数量','封面图片','角标图片','有效状态','可用人群','更新人','修改时间','操作'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${rows.map((c,i)=>`<tr data-component-id="${esc(c.id)}"><td>${i+1}</td><td><b>${esc(c.name)}</b></td><td>${esc(c.tags)||'—'}</td><td>${esc(c.code)||'—'}</td><td>${esc(c.functionType)}</td><td>${c.backgrounds.length} 张</td><td>${c.cover?`<img src="${esc(c.cover)}" alt="${esc(c.name)}封面" />`:'无图片'}</td><td>${c.badge?`<img src="${esc(c.badge)}" alt="角标" />`:'无图片'}</td><td><span class="${c.enabled?'fs-live':'energy-off'}">${c.enabled?'有效':'无效'}</span></td><td>${esc(c.audience)}</td><td>${esc(c.updatedBy)}</td><td>${esc(c.updated)}</td><td><button class="text-link" data-dc="edit" data-id="${esc(c.id)}">编辑</button><button class="fs-delete" data-dc="delete" data-id="${esc(c.id)}">删除</button></td></tr>`).join('')||'<tr><td colspan="13" class="fs-empty">暂无组件</td></tr>'}</tbody></table></div><p class="energy-count">共 ${rows.length} 条数据</p><p class="fs-annotation">批注：金、山、水等各作为一个能量组件创建，同一组件下可配置多张背景图。能量组件栏目直接关联桌面组件，不再增加分类栏目层级。</p>`;
    window.lucide?.createIcons();refreshAnnotations();
  }
  function edit(id){
    const existing=components.find(c=>c.id===id);
    draft=existing?structuredClone(existing):{id:uid('component'),name:'',kind:'',tags:'',code:'',functionType:'能量组件',backgrounds:[],cover:'',badge:'',enabled:true,audience:'所有用户',size:'2*2'};
    uploadSession++;uploading=0;
    dialog.classList.remove('is-maximized');
    dialog.innerHTML=`<form id="desktopComponentEdit" data-existing="${existing?'true':'false'}"><header><h2 id="desktopComponentTitle">${existing?'编辑':'新增'}</h2><div class="switch-window-tools"><button type="button" data-dc="maximize" aria-label="最大化"><i data-lucide="maximize-2"></i></button><button type="button" data-dc="close" aria-label="关闭"><i data-lucide="x"></i></button></div></header><div class="desktop-component-form"><div class="dc-form-row"><label for="dcName"><em>*</em>组件名称：</label><input id="dcName" name="name" required maxlength="40" placeholder="请输入组件名称" value="${esc(draft.name)}" /></div><div class="dc-form-row"><label for="dcTags">资源标签 ⓘ：</label><input id="dcTags" name="tags" placeholder="请选择资源标签" value="${esc(draft.tags)}" /></div><div class="dc-form-row"><label for="dcCode">与客户端约定的组件参数码：</label><input id="dcCode" name="code" placeholder="请输入组件参数码" value="${esc(draft.code)}" /></div><div class="dc-form-row"><label for="dcType"><em>*</em>功能类型：</label><select id="dcType" name="functionType" required><option>能量组件</option></select></div><div class="dc-form-row dc-material-row"><label>能量组件素材：</label><div class="dc-material-body" id="dcBackgroundImages"></div></div><div class="dc-form-row"><label>封面图片：</label><div id="dcCoverUpload"></div></div><div class="dc-form-row"><label>角标图片：</label><div id="dcBadgeUpload"></div></div><div class="dc-form-row"><label for="dcEnabled"><em>*</em>状态：</label><select id="dcEnabled" name="enabled" required><option value="true" ${draft.enabled?'selected':''}>有效</option><option value="false" ${!draft.enabled?'selected':''}>无效</option></select></div><div class="dc-form-row"><label for="dcAudience">可用人群：</label><select id="dcAudience" name="audience"><option ${draft.audience==='所有用户'?'selected':''}>所有用户</option><option ${draft.audience==='会员用户'?'selected':''}>会员用户</option></select></div><p class="fs-annotation dc-form-note">批注：支持多张图片上传、逐张删除。</p><p id="dcError" role="alert" hidden></p></div><footer><span id="dcUploadStatus"></span><button class="ghost" type="button" data-dc="close">取消</button><button class="primary" type="submit">确认</button></footer></form>`;
    drawBackgrounds();drawSingleUploads();dialog.showModal();
  }
  const uploadTile=(type,id,url,label)=>`<label class="dc-upload-tile" title="${label}">${url?`<img src="${esc(url)}" alt="${label}" />`:`<i data-lucide="plus"></i><span>${label}</span>`}<input type="file" data-dc-upload="${type}" data-background-id="${esc(id)}" accept="image/png,image/jpeg,image/webp,image/gif" ${type==='background'?'multiple':''} /></label>`;
  function drawSingleUploads(){
    dialog.querySelector('#dcCoverUpload').innerHTML=uploadTile('cover','',draft.cover,'点击上传文件')+(draft.cover?'<button type="button" class="text-link" data-dc="clear-cover">移除</button>':'');
    dialog.querySelector('#dcBadgeUpload').innerHTML=uploadTile('badge','',draft.badge,'点击上传文件')+(draft.badge?'<button type="button" class="text-link" data-dc="clear-badge">移除</button>':'');
    window.lucide?.createIcons();
  }
  function drawBackgrounds(){
    dialog.querySelector('#dcBackgroundImages').innerHTML=`<div class="dc-image-grid">${draft.backgrounds.map((b,i)=>`<div class="dc-background-image" data-background-id="${esc(b.id)}"><img src="${esc(b.url)}" alt="${esc(b.name||'背景图片 '+(i+1))}" /><button type="button" data-dc="remove-background" data-id="${esc(b.id)}" title="删除图片" aria-label="删除第${i+1}张图片"><i data-lucide="trash-2"></i></button></div>`).join('')}${uploadTile('background','','','上传图片')}</div><p class="dc-upload-note">支持 jpg、jpeg、png、gif、webp 图片，每张不超过 5MB，可多选上传</p>`;
    window.lucide?.createIcons();
  }
  function showError(message){const el=dialog.querySelector('#dcError');el.hidden=false;el.textContent=message;}
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
    uploading++;updateUploadStatus();
    try{
      const images=[];for(const file of files)images.push({url:await readImage(file),name:file.name.replace(/\.[^.]+$/,'')});
      if(session!==uploadSession||!dialog.open)return;
      if(type==='background'){
        images.forEach(image=>{const id=uid('background');draft.backgrounds.push({id,code:id,...image,vip:false});});
        drawBackgrounds();
      }else{draft[type]=images[0].url;drawSingleUploads();}
    }catch(error){if(session===uploadSession)showError(error.message);}
    finally{if(session===uploadSession){uploading--;updateUploadStatus();}}
  }
  function updateUploadStatus(){dialog.querySelector('#dcUploadStatus').textContent=uploading?'图片处理中…':'';dialog.querySelector('button[type="submit"]').disabled=uploading>0;dialog.querySelectorAll('[data-dc-upload]').forEach(input=>{input.disabled=uploading>0;});}
  function persist(next){
    try{localStorage.setItem(key,JSON.stringify(next));}catch(_){return false;}
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
    if(action==='remove-background'){draft.backgrounds=draft.backgrounds.filter(item=>item.id!==b.dataset.id);drawBackgrounds();}
    if(action==='clear-cover'||action==='clear-badge'){draft[action==='clear-cover'?'cover':'badge']='';drawSingleUploads();}
    if(action==='delete'&&confirm('删除此组件？关联栏目将不再展示它，不影响用户已保存的组件。')){
      if(!persist(components.filter(c=>c.id!==b.dataset.id))){showToast('存储失败，组件未删除');return;}render();showToast('组件已删除');
    }
  });
  document.addEventListener('change',e=>{
    if(e.target.dataset.dcUpload)upload(e.target);
  });
  document.addEventListener('submit',e=>{
    if(e.target.matches('#desktopComponentSearch')){e.preventDefault();query=Object.fromEntries(new FormData(e.target));render();}
    if(!e.target.matches('#desktopComponentEdit'))return;
    e.preventDefault();if(uploading)return;
    const d=new FormData(e.target),name=String(d.get('name')).trim();
    if(!name){showError('请填写组件名称');return;}
    if(!draft.backgrounds.length||draft.backgrounds.some(b=>!b.url)){showError('请至少上传一张背景图');return;}
    if(components.some(c=>c.id!==draft.id&&c.name===name)){showError('组件名称已存在，请编辑已有组件');return;}
    const code=String(d.get('code')).trim();
    const kind=categories.find(c=>code==='energy_'+c.id||code.startsWith('energy_'+c.id+'_'))?.id||draft.kind||categories.find(c=>c.name===name)?.id||draft.id;
    const item={...draft,name,tags:String(d.get('tags')).trim(),code,functionType:'能量组件',kind,enabled:d.get('enabled')==='true',audience:d.get('audience'),cover:draft.cover||draft.backgrounds[0].url,updated:stamp(),updatedBy:'运营',backgrounds:draft.backgrounds.map(b=>({...b,code:b.code||b.id,name:b.name||b.id}))};
    const next=components.some(c=>c.id===item.id)?components.map(c=>c.id===item.id?item:c):[...components,item];
    if(!persist(next)){showError('浏览器存储空间不足，请减少图片数量或压缩图片后重试，当前表单已保留');return;}
    dialog.close();render();showToast('组件已保存');
  });
  window.addEventListener('storage',e=>{if(e.key!==key)return;try{const data=JSON.parse(e.newValue||'null');if(Array.isArray(data)){components=data;window.dispatchEvent(new Event('desktop-components-changed'));if(screen.classList.contains('active'))render();}}catch(_){}});
})();
