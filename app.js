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
  if (!document.querySelector(`.screen[data-screen="${name}"]`)) return;
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

});
