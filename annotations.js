(function () {
  const now = Date.now();
  const annotationRed = "#DC2626";
  const redAnnotationStyle = `
    .axhub-annotation-directory-node,
    .axhub-annotation-directory-node *,
    .axhub-annotation-directory-reader__surface,
    .axhub-annotation-directory-reader__surface *,
    [class*="axhub-annotation"] h1,
    [class*="axhub-annotation"] h2,
    [class*="axhub-annotation"] h3,
    [class*="axhub-annotation"] p,
    [class*="axhub-annotation"] li,
    [class*="axhub-annotation"] span {
      color: #DC2626 !important;
    }
  `;

  const node = (id, index, title, text) => ({
    id,
    index,
    title,
    pageId: "prototype",
    locator: {
      selectors: [`[data-annotation-id="${id}"]`],
      fingerprint: id,
      path: []
    },
    aiPrompt: title,
    annotationText: text,
    hasMarkdown: false,
    color: annotationRed,
    images: [],
    createdAt: now,
    updatedAt: now
  });

  const annotationSource = {
    documentVersion: 1,
    format: "axhub-annotation-source",
    presentation: {
      layerSelectors: ["#rulesModal.open", "#previewModal.open"]
    },
    data: {
      version: 1,
      prototypeName: "widget-template-platform",
      pageId: "prototype",
      updatedAt: now,
      nodes: [
        node("prototype-switch", 1, "双端原型切换", "顶部提供“移动端 Demo”和“内容运营中台”两个展示入口，方便评审时在 App 前台效果和运营配置后台之间快速切换。"),
        node("app-demo-view", 2, "App 端演示", "移动端 Demo 展示首页、组件详情、图片替换、我的组件、教程和添加到桌面的关键链路。组件详情页去掉“添加贴纸”，点击“替换图片”后先选择要替换的槽位，再进入导入图片页，导入后可放大、缩小和旋转调整图片。"),
        node("nav-menu", 3, "新增运营菜单", "新增“小组件模板配置”菜单，使用人是内容运营。栏目管理仍走现有栏目菜单，本菜单只负责创建可被前端使用的小组件模板。"),
        node("scope-summary", 4, "一期范围", "一期组件类型收敛为字典项：照片墙组件、电量。保存默认上线；客户端只开放被图层声明为可编辑的默认图片。"),
        node("template-list", 5, "小组件列表", "列表字段为小组件名称、组件类型、有效状态、可用人群、组件尺寸、更新人、更新时间、预览。预览字段点击后查看根据配置生成的结果图；操作保留编辑和删除。"),
        node("list-search", 6, "列表查询条件", "列表页提供“小组件名称”和“组件类型”两个查询条件，去掉右上角快捷筛选按钮。小组件名称支持模糊搜索，组件类型通过下拉选择。"),
        node("create-flow", 7, "创建流程", "运营先填写模板基础信息，再按组件模板展示的图层字段配置素材；本期右侧不做配置效果展示。保存时图片槽位和文字图层为非必填，其余字段均为必填。"),
        node("base-info", 8, "模板基础信息", "模板基础信息包含小组件名称、可见人群、组件尺寸、上传封面图、组件类型、组件模板，均为必填。封面图用于客户端列表、栏目或详情入口展示。"),
        node("audience-select", 9, "可见人群", "新增组件时必须选择可见人群，下拉项为会员用户、所有用户。该字段决定客户端哪些用户可看到该小组件。"),
        node("size-select", 10, "组件尺寸", "新增组件时必须选择组件尺寸，下拉项包含 2*2、2*4、4*4，用于匹配 Android 桌面小组件规格。"),
        node("category-select", 11, "组件类型", "组件类型为字典字段，一期只有照片墙组件和电量。切换类型会切换组件模板和图层配置。"),
        node("base-template-select", 12, "组件模板", "组件模板由研发预置。选择照片墙组件时默认使用“基础模板”，并禁止运营修改。"),
        node("layer-config", 13, "按图层配置", "固定层级顺序：背景图层默认为底层；图片槽位图层位于背景图层上方；模板装饰层位于图片槽位图层上方；文字图层位于最顶层。背景图层字段为上传默认背景图，必填；模板装饰层字段为上传模板装饰图，必填，并提示请上传透明底图片；图片槽位和文字图层为非必填。"),
        node("user-edit-policy", 14, "用户编辑权限", "背景图层、槽位图片和文字内容可被客户端用户替换；模板装饰层、位置、动效、层级、动态字段绑定不可被用户修改。"),
        node("save-default-online", 15, "保存默认上线", "创建/编辑页只有“保存”主按钮。保存时校验必填字段：图片槽位、文字图层可为空，其余字段必填。点击保存后 publish_status 默认写入 online，可被现有栏目菜单关联。"),
        node("rules-modal", 16, "规则说明", "这里聚合一期硬约束，帮助研发和运营确认本菜单边界。"),
        node("preview-modal", 17, "结果图预览", "列表预览字段点击后打开弹窗，展示根据字段配置生成的结果图，用于运营检查前台展示效果。")
      ]
    },
    markdownMap: {},
    assetMap: {},
    directory: {
      nodes: [
        {
          type: "folder",
          id: "root",
          title: "小组件模板配置中台批注",
          defaultExpanded: true,
          children: [
            {
              type: "markdown",
              id: "prd-summary",
              title: "方案摘要",
              markdown: "# 方案摘要\n\n原型顶部支持在“移动端 Demo”和“内容运营中台”之间切换，便于同时评审客户端展示和后台配置。\n\n新增“小组件模板配置”菜单，运营基于组件模板创建前台可用小组件。\n\n链路：模板基础信息 → 图层配置 → 保存默认上线 → 现有栏目关联 → App 展示 → 用户有限编辑。\n\n列表页提供小组件名称和组件类型查询，不保留右上角快捷筛选。\n\n客户端详情页不提供添加贴纸；用户点击替换图片后，先选择槽位，再导入图片，导入后可放大、缩小、旋转调整。\n\n中台保存校验：图片槽位和文字图层非必填，其余字段均为必填。\n\n模板基础信息包含小组件名称、可见人群、组件尺寸、上传封面图、组件类型、组件模板；一期组件类型为字典字段，仅支持照片墙组件、电量。选择照片墙组件时，组件模板默认基础模板并禁止修改。列表预览字段可查看配置结果图。"
            },
            {
              type: "markdown",
              id: "status-rule",
              title: "保存和状态",
              markdown: "# 保存和状态\n\n一期创建/编辑页只提供“保存”按钮，保存后默认上线。\n\n列表操作只保留编辑、删除。\n\n数据层保留 draft / online / offline，后续可扩展草稿、上下线、审核。"
            },
            {
              type: "markdown",
              id: "layer-rule",
              title: "图层和用户编辑",
              markdown: "# 图层和用户编辑\n\n组件模板定义图层结构、动态字段绑定、百分比定位和动效。\n\n固定层级顺序：背景图层默认为底层；图片槽位图层位于背景图层上方；模板装饰层位于图片槽位图层上方；文字图层位于最顶层。\n\n运营按图层上传默认素材：背景图层上传默认背景图，必填；模板装饰层上传模板装饰图，必填，并提示请上传透明底图片；图片槽位默认至少一个，支持添加多个槽位，新增槽位可删除，每个槽位配置槽位形状、X 位置、Y 位置、宽度、高度、默认图片，整体非必填；文字图层可配置文字内容、文字颜色、字体、字号、文字位置，整体非必填。\n\nX/Y/宽/高均按百分比填写。用户可替换背景图层、槽位图片和文字内容，不可修改模板装饰层、动效、组件结构和动态字段绑定。"
            },
            {
              type: "route",
              id: "prototype-route",
              title: "查看原型",
              route: "prototype"
            }
          ]
        }
      ]
    }
  };

  function startAnnotation() {
    const axhubAnnotation = window.AxhubAnnotation;
    if (!axhubAnnotation) {
      console.warn("Missing AxhubAnnotation runtime.");
      return;
    }

    const viewer = axhubAnnotation.createAnnotationViewer({
      source: annotationSource,
      options: {
        getCurrentPageId: () => "prototype",
        showToolbar: true,
        showThemeToggle: true,
        showColorFilter: true,
        onDirectoryRoute: () => viewer.refresh()
      }
    });

    window.__AXHUB_VIEWER__ = viewer;
    void viewer.start().then(() => {
      applyRedAnnotationText();
      viewer.refresh();
    });
  }

  function applyRedAnnotationText() {
    document.querySelectorAll("*").forEach(element => {
      const root = element.shadowRoot;
      if (!root || root.querySelector("#red-annotation-text")) return;
      const style = document.createElement("style");
      style.id = "red-annotation-text";
      style.textContent = redAnnotationStyle;
      root.appendChild(style);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAnnotation);
  } else {
    startAnnotation();
  }
})();
