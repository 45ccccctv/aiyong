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
      layerSelectors: ["#desktopModal.open"]
    },
    data: {
      version: 1,
      prototypeName: "widget-template-platform",
      pageId: "prototype",
      updatedAt: now,
      nodes: [
        node("salary-settings", 39, "薪资计算设置", "客户端默认提供月薪 5000 元、09:00 上班、18:00 下班、午休 2 小时、每月 22 个工作日，用户可在 App 内编辑。薪资、上下班时间等计算参数无需在中台配置，中台只配置图片素材等内容。日薪=月薪/每月工作日，时薪=日薪/每日净工作小时，分薪和秒薪继续折算。支持跨日班次，午休按班次中段扣除；同一时刻的上下班时间及午休不小于班次时长时禁止保存。其他组件的默认配置不变。"),
        node("salary-preview", 40, "薪资组件预览", "组件上方以灰色显示“每10分钟自动刷新，点击组件也可更新”，提示不写入组件图片。组件内部仅显示今日到手、金额与装饰图片，不展示更新按钮、工作状态或进度条。薪资每10分钟自动刷新，也可手动点击更新；不是逐秒实时递增。用户可启用保密展示，App、保存图片和模拟桌面均不显示具体金额。App 预览与模拟桌面均可点击刷新，刷新后同步保存图片及刷新时间。默认月薪 5000 元、09:00 上班、18:00 下班由客户端提供，无需中台配置，用户可修改。"),
        node("salary-analysis", 41, "薪资分析", "点击薪资分析打开独立弹窗，展示月薪、年薪、净工作小时，以及日薪、时薪、分薪和秒薪。不增加商品价值对比等内容。每月工作日由用户填写，不替用户推断出勤安排。"),
        node("salary-appearance", 42, "沿用现有默认配置", "通用外观项保留字体颜色、背景和透明背景，薪资另有“保密展示”开关。字体颜色使用色板与自定义颜色；背景可选色块或从相册上传。开启透明背景只隐藏背景层，保留内容，并在保存结果中保留透明通道；关闭后恢复原背景。移除字号、字体类型、模糊、透明度滑杆、形状、对齐及内边距编辑。薪资参数通过独立薪资设置弹窗填写，不改变其他组件的默认配置。"),
        node("ringtone-entry", 32, "首页铃声入口", "首页金刚区保留原有入口，新增“铃声”。点击进入独立铃声页，保留返回首页操作。"),
        node("ringtone-list", 33, "铃声列表与试听", "列表顶部展示由下级栏目配置的 Tab，切换后展示该栏目关联且启用的铃声，按栏目资源排序。列表展示名称、作者、描述、可选播放量，右侧仅保留“设置铃声”按钮，点击名称试听。播放量完全使用运营配置值，试听不自动累加，支持当前栏目内名称/作者搜索。"),
        node("ringtone-set-sheet", 34, "设置铃声", "点击设置铃声，弹窗提供来电铃声、信息铃声、闹钟铃声、日历通知提醒、日历响铃提醒、通知铃声、联系人铃声七项。原型仅模拟系统设置，取消或点击遮罩关闭弹窗，不修改真实设备。"),
        node("ringtone-admin", 35, "铃声提示音配置", "铃声资源菜单支持新增、编辑、试听、启停及删除，字段包括名称、作者、描述、可选播放量、上传音频及状态，资源本身不设置分类。栏目管理层级为铃声提示音 → Tab 栏目 → 关联铃声。播放量为运营填写的非负整数，非必填且试听不自动更新。音频及配置保存在当前浏览器中。"),
        node("ringtone-column", 36, "铃声栏目关联", "在各 Tab 栏目下批量关联铃声，可配置资源排序、关联状态或解除关联。同一铃声可关联多个栏目，解除当前关联不影响其他栏目或源资源。根栏目、Tab 栏目、资源和关联均启用时展示；根栏目停用隐藏首页入口，Tab 栏目停用仅隐藏对应 Tab。"),
        node("ringtone-tab-columns", 37, "铃声 Tab 栏目配置", "在栏目管理的铃声提示音下新增、编辑或删除 Tab 栏目，名称直接作为 App 顶部 Tab 文案，按排序值升序展示启用栏目。每个栏目下独立关联铃声。旧版直接关联的资源迁移到“为你推荐”栏目，保留关联顺序与状态。"),
        node("ringtone-tabs", 38, "栏目驱动的铃声 Tab", "App 顶部 Tab 完全来自栏目管理，不在铃声资源中填写分类。名称、顺序及启停随栏目配置同步，切换 Tab 仅展示当前栏目关联铃声；推荐栏目使用运营固定排序，不进行个性化推荐。"),
        node("energy-video-help", 31, "悬浮视频教程", "能量搭配页底部悬浮展示“如何添加到桌面”，点击进入独立视频教程页，支持播放、暂停、进度拖动及全屏。当前使用内置的添加桌面操作演示视频，可替换为正式录屏。教程关闭返回进入前的搭配页或组件汇总页，退出时暂停视频；不恢复已移除的添加组件操作条。"),
        node("energy-summary", 30, "组件汇总页", "能量搭配页右上角进入独立组件汇总页，按双列展示风、山、水、竹、金、玉、如意。卡片显示已确认样式。点击卡片选择样式，确认后回到汇总页并刷新图片，同步包含此元素的主题搭配；关闭不应用。顶部提供 Android 添加教程，返回时保留列表滚动位置。底部 Tab 继续隐藏。"),
        node("energy-directions", 29, "方位解读", "能量页左上角使用“方位解读”文字按钮，进入独立介绍页，默认总览。可通过右侧分类或图上区域切换中宫位、生长位、聚财位、人缘位、开运位；展示屏幕位置、文化寓意与素材搭配建议，可前往推荐搭配。区域按本模板定义，不对应真实地理方位。能量及其子页面均隐藏底部 Tab。"),
        node("fs-entry", 21, "底部中央能量入口", "保留现有四项导航，正中间新增圆形能量入口。点击直接进入参考视频风格的浅色金色桌面搭配页，右侧切换主题，点击预览素材更换样式；右上角进入组件汇总，按双列查看元素和已确认样式。搭配页隐藏方位解读旁的返回箭头及能量桌面标题，统一使用浅色底、金色强调与 App 粉色点缀。"),
        node("fs-board-scene", 27, "能量桌面搭配", "左侧模拟屏幕网格及当前主题的组件位置，右侧纵向切换招财位、事业位、学业位等主题。点击预览中的组件或下方说明进入该元素的样式选择。网格是屏幕示意，不对应实际方位；文案仅表达文化寓意。"),
        node("fs-materials", 28, "元素样式选择", "展示当前山、水、风、玉等元素的可用样式。选择后点击确定才应用到当前搭配，关闭放弃本次选择；已确认样式按主题分别保留。从组件汇总进入时，确认返回汇总并更新封面与对应主题搭配，不触发安装。参考素材仅用于原型演示，不新增支付或个性化计算。"),
        node("fs-install", 24, "逐个安装与异常状态", "原型模拟系统添加流程，不实际安装。所有待安装组件先保存到我的组件。取消与空间不足均保留已保存内容；空间不足进入 Android 教程。可跳过单款并继续下一款。"),
        node("prototype-switch", 1, "双端原型切换", "顶部提供“移动端 Demo”和“内容运营中台”两个展示入口，方便评审时在 App 前台效果和运营配置后台之间快速切换。"),
        node("app-demo-view", 2, "App 端演示", "移动端 Demo 展示首页、组件详情、图片替换、我的组件、教程和添加到桌面的关键链路。组件详情页去掉“添加贴纸”，点击“替换图片”后先选择要替换的槽位，再进入导入图片页，导入后可放大、缩小和旋转调整图片。"),
        node("nav-menu", 3, "中台菜单范围", "仅保留栏目管理、桌面组件、App总开关配置、铃声提示音四个菜单。旧模板编辑器、旧主题方案及三个占位菜单已删除。桌面组件按与客户端约定的参数码区分实现，现有能量搭配、我的组件和桌面安装演示保留。"),
      ]
    },
    markdownMap: {},
    assetMap: {},
    directory: {
      nodes: [
        {
          type: "folder",
          id: "root",
          title: "爱用小组件原型批注",
          defaultExpanded: true,
          children: [
            {
              type: "markdown",
              id: "prd-summary",
              title: "方案摘要",
              markdown: "# 方案摘要\n\n中台保留栏目管理、桌面组件、App总开关配置、铃声提示音。\n\n组件配置以客户端约定的参数码区分具体功能，背景与装饰层分别上传。\n\nApp保留当前能量搭配、我的组件、双尺寸组件、保存和模拟桌面安装。旧模板编辑器及旧主题方案不再提供。"
            },
            {
              type: "markdown",
              id: "status-rule",
              title: "保存和状态",
              markdown: "# 保存和状态\n\n中台桌面组件维护素材、状态与可用人群；栏目管理负责关联和排序。\n\nApp个人配置保存到当前浏览器，安装到模拟桌面不代表真实系统安装。移除桌面组件不删除我的组件。"
            },
            {
              type: "markdown",
              id: "layer-rule",
              title: "素材与个人编辑",
              markdown: "# 素材与个人编辑\n\nbackground为背景图，badge_front为装饰层，按组件参数码由客户端确定布局。\n\n用户在App修改该组件开放的标题、文字颜色、背景等个人配置；打卡标题不随状态变化，前后状态仅切换图片。\n\n喝水打卡和每日计划支持2×2、2×4。"
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
