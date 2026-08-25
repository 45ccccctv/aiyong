const baseTemplates = {
  single_image: [
    {
      id: "single_image_default",
      name: "基础模板",
      dynamic: "static_photo",
      positions: ["中间", "左上角", "右上角", "底部居中"],
      previewClass: "single"
    }
  ],
  battery: [
    { id: "battery_swing_heart", name: "摇摆爱心电量", dynamic: "battery_percent", positions: ["左上角", "右上角", "中间", "底部居中"], previewClass: "" },
    { id: "battery_ring", name: "圆环电量", dynamic: "battery_percent", positions: ["中间", "左上角", "右上角", "底部居中"], previewClass: "" },
    { id: "battery_bar", name: "横向进度条电量", dynamic: "battery_percent", positions: ["左侧居中", "右侧居中", "顶部居中"], previewClass: "" }
  ]
};

const commonPositions = ["中间", "左上角", "右上角", "左下角", "右下角", "顶部居中", "底部居中"];
const slotShapes = ["方形", "圆形"];

const layerSchemas = {
  single_image: [
    {
      name: "背景图层",
      desc: "上传默认背景图",
      type: "background",
      operator: "运营可上传",
      user: "用户可改",
      required: true,
      note: "",
      defaultPosition: "中间",
      positions: commonPositions
    },
    {
      name: "模板装饰层",
      desc: "上传模板装饰图",
      type: "decoration",
      operator: "运营可上传",
      user: "用户不可改",
      required: true,
      note: "请上传透明底图片。系统默认顶层展示。"
    },
    {
      name: "图片槽位",
      desc: "配置多个可替换图片槽位，每个槽位按百分比填写位置和宽高",
      type: "slot",
      operator: "运营可配置",
      user: "用户可改",
      required: false,
      note: "系统默认中间层展示。"
    },
    {
      name: "文字图层",
      desc: "配置客户端展示的默认文字内容",
      type: "text",
      operator: "运营可配置",
      user: "用户可改",
      required: false,
      note: "系统默认最顶层展示。"
    }
  ],
  battery: [
    {
      name: "背景图层",
      desc: "上传默认背景图",
      type: "background",
      operator: "运营可上传",
      user: "用户可改",
      required: true,
      note: "",
      defaultPosition: "中间",
      positions: commonPositions
    },
    {
      name: "模板装饰层",
      desc: "上传模板装饰图",
      type: "decoration",
      operator: "运营可上传",
      user: "用户不可改",
      required: true,
      note: "请上传透明底图片。系统默认顶层展示。"
    },
    {
      name: "图片槽位",
      desc: "配置多个可替换图片槽位，每个槽位按百分比填写位置和宽高",
      type: "slot",
      operator: "运营可配置",
      user: "用户可改",
      required: false,
      note: "系统默认中间层展示。"
    },
    {
      name: "文字图层",
      desc: "配置客户端展示的默认文字内容",
      type: "text",
      operator: "运营可配置",
      user: "用户可改",
      required: false,
      note: "系统默认最顶层展示。"
    },
    {
      name: "动态电量文字层",
      desc: "绑定 battery_percent，可选择在圆环、角标或画面中间展示。",
      type: "dynamic_text",
      operator: "运营可配置",
      user: "用户不可改",
      required: true,
      note: "具体可选位置由每个组件模板单独限制。",
      defaultPosition: "右上角",
      positions: ["左上角", "右上角", "中间", "底部居中"]
    }
  ]
};

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function refreshAnnotations() {
  setTimeout(() => window.__AXHUB_VIEWER__?.refresh?.(), 80);
}

function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1700);
}

function setScreen(name) {
  $all(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });
  refreshAnnotations();
}

function setDemoView(name) {
  $all("[data-demo-panel]").forEach(panel => {
    panel.classList.toggle("active", panel.dataset.demoPanel === name);
  });
  $all("[data-demo-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.demoView === name);
  });
  refreshAnnotations();
}

function setAppPage(name) {
  $all(".app-page").forEach(page => {
    page.classList.toggle("active", page.dataset.appPage === name);
  });
  $all(".app-tabbar button").forEach(button => {
    const action = button.dataset.appAction;
    button.classList.toggle("active", (name === "home" && action === "home") || (name === "mine" && action === "my-widgets"));
  });
}

function renderBaseTemplates(category) {
  const select = $("#baseTemplateSelect");
  select.innerHTML = "";
  baseTemplates[category].forEach(template => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name;
    select.appendChild(option);
  });
  select.disabled = category === "single_image";
}

function renderLayers(category) {
  const list = $("#layerList");
  list.innerHTML = "";
  layerSchemas[category].forEach((layer, index) => {
    const card = document.createElement("article");
    card.className = "layer-card";
    card.innerHTML = `
      <div class="layer-icon">${index + 1}</div>
      <div>
        <h4>${layer.name} <em class="${layer.required === false ? "optional-mark" : "required-mark"}">${layer.required === false ? "非必填" : "*"}</em></h4>
        <p>${layer.desc}</p>
        ${layer.note ? `<small>${layer.note}</small>` : ""}
        <div class="layer-fields">${renderLayerFields(layer)}</div>
      </div>
      <div class="layer-tags">
        <span class="yes">${layer.operator}</span>
        <span>${layer.user}</span>
      </div>
    `;
    list.appendChild(card);
  });
}

function renderLayerFields(layer) {
  if (layer.type === "background") {
    return `<button class="upload inline-upload" data-action="mock-upload">上传默认背景图</button><span class="field-hint required-text">必填</span>`;
  }
  if (layer.type === "decoration") {
    return `
      <button class="upload inline-upload" data-action="mock-upload">上传模板装饰图</button>
      <span class="field-hint required-text">必填</span>
    `;
  }
  if (layer.type === "slot") {
    return `
      <div class="slot-list">
        ${renderSlotFields(1)}
      </div>
      <button class="ghost inline-action" data-action="add-slot" type="button">添加槽位</button>
    `;
  }
  if (layer.type === "text") {
    return `
      <label class="wide-field">
        <span>文字内容 <em class="optional-mark">非必填</em></span>
        <textarea rows="3" placeholder="请输入默认文字内容">Better days are coming</textarea>
      </label>
      <label>
        <span>文字颜色 <em class="optional-mark">非必填</em></span>
        <input type="color" value="#8D7F75" />
      </label>
      <label>
        <span>字体 <em class="optional-mark">非必填</em></span>
        <select>
          <option>系统默认字体</option>
          <option>手写体</option>
          <option>圆体</option>
          <option>黑体</option>
        </select>
      </label>
      <label>
        <span>字号（px） <em class="optional-mark">非必填</em></span>
        <input type="number" min="8" max="80" value="18" />
      </label>
      <label>
        <span>X 位置（%） <em class="optional-mark">非必填</em></span>
        <input type="number" min="0" max="100" value="22" />
      </label>
      <label>
        <span>Y 位置（%） <em class="optional-mark">非必填</em></span>
        <input type="number" min="0" max="100" value="72" />
      </label>
    `;
  }
  return `
    <label>
      <span>${layer.name}位置 <em class="required-mark">*</em></span>
      <select>${layer.positions.map(item => `<option ${item === layer.defaultPosition ? "selected" : ""}>${item}</option>`).join("")}</select>
    </label>
  `;
}

function renderSlotFields(index) {
  const presets = [
    { x: 40, y: 30, width: 24, height: 32 },
    { x: 18, y: 48, width: 22, height: 22 },
    { x: 62, y: 52, width: 20, height: 24 }
  ];
  const preset = presets[index - 1] || { x: 50, y: 50, width: 20, height: 20 };
  return `
    <section class="slot-card">
      <div class="slot-title">
        <strong>槽位${toChineseNumber(index)}</strong>
        <span>系统默认中间层</span>
        ${index > 1 ? `<button class="delete-slot" data-action="delete-slot" type="button">删除</button>` : ""}
      </div>
      <div class="slot-fields">
        <label>
          <span>槽位形状 <em class="optional-mark">非必填</em></span>
          <select>${slotShapes.map(item => `<option>${item}</option>`).join("")}</select>
        </label>
        <label>
          <span>X 位置（%） <em class="optional-mark">非必填</em></span>
          <input type="number" min="0" max="100" value="${preset.x}" />
        </label>
        <label>
          <span>Y 位置（%） <em class="optional-mark">非必填</em></span>
          <input type="number" min="0" max="100" value="${preset.y}" />
        </label>
        <label>
          <span>宽度（%） <em class="optional-mark">非必填</em></span>
          <input type="number" min="1" max="100" value="${preset.width}" />
        </label>
        <label>
          <span>高度（%） <em class="optional-mark">非必填</em></span>
          <input type="number" min="1" max="100" value="${preset.height}" />
        </label>
        <label>
          <span>默认图片 <em class="optional-mark">非必填</em></span>
          <button class="upload" data-action="mock-upload" type="button">上传默认槽位图</button>
        </label>
      </div>
    </section>
  `;
}

function toChineseNumber(number) {
  return ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"][number] || number;
}

function renumberSlots(list) {
  list.querySelectorAll(".slot-card").forEach((card, index) => {
    const title = card.querySelector(".slot-title strong");
    if (title) title.textContent = `槽位${toChineseNumber(index + 1)}`;
  });
}

function getSelectedTemplate() {
  const category = $("#categorySelect").value;
  const selectedId = $("#baseTemplateSelect").value;
  return baseTemplates[category].find(template => template.id === selectedId) || baseTemplates[category][0];
}

function renderPositions() {
  const category = $("#categorySelect").value;
  const layers = layerSchemas[category].filter(layer => layer.type === "slot");
  const grid = $("#positionGrid");
  if (!grid) return;
  grid.innerHTML = "";
  layers.forEach(layer => {
    const label = document.createElement("label");
    label.innerHTML = `
      <span>${layer.name}位置</span>
      <select>
        ${layer.positions.map(item => `<option ${item === layer.defaultPosition ? "selected" : ""}>${item}</option>`).join("")}
      </select>
    `;
    grid.appendChild(label);
  });
}

function updatePreview() {
  return null;
}

function applyListSearch() {
  const nameValue = ($("#templateNameSearch")?.value || "").trim().toLowerCase();
  const typeValue = $("#templateTypeSearch")?.value || "all";
  $all(".template-row").forEach(row => {
    const nameText = row.querySelector("b")?.textContent.trim().toLowerCase() || "";
    const typeMatched = typeValue === "all" || row.dataset.category === typeValue;
    const nameMatched = !nameValue || nameText.includes(nameValue);
    row.style.display = typeMatched && nameMatched ? "grid" : "none";
  });
  refreshAnnotations();
}

function syncEditorByCategory() {
  const category = $("#categorySelect").value;
  renderBaseTemplates(category);
  renderLayers(category);
  renderPositions();
  updatePreview();
}

document.addEventListener("change", event => {
  if (event.target.id === "categorySelect") {
    syncEditorByCategory();
    showToast("已切换组件类型，图层配置已更新");
  }
  if (event.target.id === "baseTemplateSelect") {
    renderPositions();
    updatePreview();
    showToast("已切换组件模板");
  }
  if (event.target.id === "templateTypeSearch") {
    applyListSearch();
  }
});

document.addEventListener("input", event => {
  if (event.target.id === "templateNameSearch") {
    applyListSearch();
  }
});

document.addEventListener("click", event => {
  const demoView = event.target.closest("[data-demo-view]");
  if (demoView) {
    setDemoView(demoView.dataset.demoView);
    return;
  }

  const demoAction = event.target.closest("[data-demo-action]");
  if (demoAction?.dataset.demoAction === "open-window") {
    window.open(window.location.href, "_blank", "noopener");
    return;
  }

  const appAction = event.target.closest("[data-app-action]");
  if (appAction) {
    switch (appAction.dataset.appAction) {
      case "home":
        setAppPage("home");
        break;
      case "detail":
        setAppPage("detail");
        break;
      case "slot-select":
        setAppPage("slot-select");
        break;
      case "album":
        setAppPage("album");
        break;
      case "image-edit":
        setAppPage("image-edit");
        break;
      case "my-widgets":
        setAppPage("mine");
        break;
      case "tutorial":
        setAppPage("tutorial");
        break;
      case "save-widget":
      case "install":
        $("#desktopModal").classList.add("open");
        $("#desktopModal").setAttribute("aria-hidden", "false");
        break;
      case "close-desktop":
      case "confirm-desktop":
        $("#desktopModal").classList.remove("open");
        $("#desktopModal").setAttribute("aria-hidden", "true");
        showToast(appAction.dataset.appAction === "confirm-desktop" ? "已模拟添加到桌面" : "已取消添加");
        break;
    }
    refreshAnnotations();
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) return;

  switch (action.dataset.action) {
    case "new-template":
    case "edit-template":
      setScreen("editor");
      break;
    case "back-list":
      setScreen("list");
      break;
    case "open-rules":
      $("#rulesModal").classList.add("open");
      $("#rulesModal").setAttribute("aria-hidden", "false");
      refreshAnnotations();
      break;
    case "close-rules":
      $("#rulesModal").classList.remove("open");
      $("#rulesModal").setAttribute("aria-hidden", "true");
      refreshAnnotations();
      break;
    case "open-preview":
      $("#previewModal").classList.add("open");
      $("#previewModal").setAttribute("aria-hidden", "false");
      refreshAnnotations();
      break;
    case "close-preview":
      $("#previewModal").classList.remove("open");
      $("#previewModal").setAttribute("aria-hidden", "true");
      refreshAnnotations();
      break;
    case "mock-upload":
      showToast("已模拟上传素材");
      break;
    case "add-slot": {
      const list = action.closest(".layer-fields")?.querySelector(".slot-list");
      const count = (list?.querySelectorAll(".slot-card").length || 0) + 1;
      if (count > 10) {
        showToast("一期最多配置 10 个槽位");
        break;
      }
      list?.insertAdjacentHTML("beforeend", renderSlotFields(count));
      showToast(`已添加槽位${toChineseNumber(count)}`);
      refreshAnnotations();
      break;
    }
    case "delete-slot": {
      const list = action.closest(".slot-list");
      const card = action.closest(".slot-card");
      card?.remove();
      if (list) renumberSlots(list);
      showToast("已删除该槽位");
      refreshAnnotations();
      break;
    }
    case "save-template":
      setScreen("list");
      showToast("已按必填规则校验并保存，图片槽位和文字图层允许为空");
      break;
    case "delete-template": {
      const row = action.closest(".template-row");
      if (row?.dataset.bound === "true") {
        showToast("该模板已被栏目关联，请先解除关联");
      } else {
        row?.remove();
        showToast("模板已删除");
      }
      refreshAnnotations();
      break;
    }
  }
});

syncEditorByCategory();
applyListSearch();
