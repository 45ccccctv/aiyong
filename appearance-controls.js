(function(){
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>`<i data-lucide="${name}"></i>`;
  function swatches({mode='text',field,value,colors=[],image='',action,custom,uploadId='',resetAction='reset-color'}){
    const background=mode==='background',label=background?'背景':'字体颜色';
    const command=(name,extra='')=>`${action}="${name}" data-field="${field}" ${extra}`;
    const picker=custom?`<label class="appearance-color-picker ${background?'appearance-background-picker':''}" title="自定义${label}">${background?icon('pipette'):''}<input type="color" ${custom}="${field}" value="${esc(value)}" aria-label="自定义${label}" /></label>`:'';
    return `<div class="appearance-swatches ${background?'appearance-backgrounds':''}" data-appearance-field="${field}" data-appearance-mode="${mode}" role="group" aria-label="${label}"><button type="button" class="appearance-color-reset" ${command(resetAction)} aria-label="恢复默认${label}" title="恢复默认${label}">${icon('ban')}</button>${!background?picker:''}${background&&uploadId?`<label class="appearance-background-upload" title="从相册上传背景图">${icon('image')}<span>相册</span><input type="file" id="${uploadId}" accept="image/png,image/jpeg,image/webp" aria-label="上传背景图片" /></label>`:''}${colors.map(color=>`<button type="button" ${command('color',`data-color="${color}"`)} style="--swatch:${color}" aria-label="${color}" title="${color}" aria-pressed="${value===color&&(!background||!image)}"></button>`).join('')}${background?picker:''}</div>`;
  }
  const field=(title,body)=>`<section class="appearance-field"><h3>${title}</h3>${body}</section>`;
  const toggle=({id,checked,attributes=''})=>`<label class="appearance-toggle" for="${id}"><span>透明背景</span><span class="appearance-switch"><input id="${id}" type="checkbox" role="switch" ${attributes} ${checked?'checked':''} /><span></span></span></label>`;
  function sync(root,values,image=''){
    if(Object.hasOwn(values,'transparent'))root.querySelectorAll('.appearance-toggle input').forEach(input=>input.checked=!!values.transparent);
    root.querySelectorAll('.appearance-swatches').forEach(row=>{
      const value=values[row.dataset.appearanceField],background=row.dataset.appearanceMode==='background';
      row.querySelectorAll('[data-color]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.color===value&&(!background||!image)));
      const picker=row.querySelector('input[type="color"]');
      if(picker&&picker!==document.activeElement)picker.value=value;
    });
  }
  window.WidgetAppearance={swatches,field,toggle,sync};
})();
