(function () {
  var script = document.currentScript;
  if (!script) {
    var all = document.getElementsByTagName("script");
    script = all[all.length - 1];
  }
  var key = script.getAttribute("data-widget-key");
  if (!key) {
    console.error("[Bleviq] Missing data-widget-key on the embed script.");
    return;
  }
  var origin;
  try {
    origin = new URL(script.src).origin;
  } catch (e) {
    console.error("[Bleviq] Could not determine widget origin.");
    return;
  }

  var Z = "2147483000";
  var open = false;
  var cfg = {
    bubbleColor: "#2563eb",
    launcherPosition: "bottom-right",
    launcherIcon: "default",
    launcherEmoji: "\uD83D\uDCAC",
    launcherLabel: "",
    faviconUrl: null,
    panelWidth: 380,
    panelHeight: 560
  };

  var container = document.createElement("div");
  var label = document.createElement("span");
  var btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Open chat");

  var frame = document.createElement("iframe");
  frame.title = "Chat";
  frame.src = origin + "/embed?key=" + encodeURIComponent(key);

  function setIcon() {
    while (btn.firstChild) btn.removeChild(btn.firstChild);
    if (open) {
      btn.textContent = "\u2715";
      return;
    }
    if (cfg.launcherIcon === "emoji") {
      btn.textContent = cfg.launcherEmoji || "\uD83D\uDCAC";
    } else if (cfg.launcherIcon === "favicon" && cfg.faviconUrl) {
      var img = document.createElement("img");
      img.src = cfg.faviconUrl;
      img.alt = "";
      img.style.cssText =
        "width:30px;height:30px;border-radius:50%;object-fit:cover;";
      btn.appendChild(img);
    } else {
      btn.textContent = "\uD83D\uDCAC";
    }
  }

  function render() {
    var side = cfg.launcherPosition === "bottom-left" ? "left" : "right";
    var opp = side === "left" ? "right" : "left";

    container.style.cssText =
      "position:fixed;bottom:20px;" + side + ":20px;" + opp + ":auto;" +
      "display:flex;align-items:center;gap:10px;z-index:" + Z + ";" +
      "flex-direction:" + (side === "left" ? "row-reverse" : "row") + ";";

    btn.style.cssText =
      "width:56px;height:56px;border-radius:50%;background:" + cfg.bubbleColor +
      ";color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);" +
      "font-size:24px;line-height:56px;text-align:center;padding:0;";

    if (cfg.launcherLabel && !open) {
      label.textContent = cfg.launcherLabel;
      label.style.cssText =
        "background:#fff;color:#0f172a;padding:8px 12px;border-radius:18px;" +
        "box-shadow:0 4px 14px rgba(0,0,0,.18);font-size:14px;white-space:nowrap;" +
        "font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;";
      label.style.display = "block";
    } else {
      label.style.display = "none";
    }

    var w = Math.max(280, Math.min(480, cfg.panelWidth || 380));
    var h = Math.max(360, Math.min(720, cfg.panelHeight || 560));
    frame.style.cssText =
      "position:fixed;bottom:88px;" + side + ":20px;" + opp + ":auto;" +
      "width:" + w + "px;height:" + h + "px;" +
      "max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);" +
      "border:none;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.28);" +
      "background:#fff;display:" + (open ? "block" : "none") + ";z-index:" + Z + ";";

    setIcon();
  }

  function toggle() {
    open = !open;
    btn.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    render();
  }
  btn.addEventListener("click", toggle);

  // The chatbox X (inside the iframe) asks the loader to close.
  window.addEventListener("message", function (e) {
    if (e.origin !== origin) return;
    if (e.data && e.data.type === "bleviq-close" && open) toggle();
  });

  function mount() {
    container.appendChild(label);
    container.appendChild(btn);
    document.body.appendChild(frame);
    document.body.appendChild(container);
    render();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  // Pull branding (best effort) and re-render.
  fetch(origin + "/api/widget-config?key=" + encodeURIComponent(key))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !d.config) return;
      var c = d.config;
      if (c.bubbleColor) cfg.bubbleColor = c.bubbleColor;
      if (c.launcherPosition) cfg.launcherPosition = c.launcherPosition;
      if (c.launcherIcon) cfg.launcherIcon = c.launcherIcon;
      if (c.launcherEmoji) cfg.launcherEmoji = c.launcherEmoji;
      if (typeof c.launcherLabel === "string") cfg.launcherLabel = c.launcherLabel;
      if (c.faviconUrl) cfg.faviconUrl = c.faviconUrl;
      if (c.panelWidth) cfg.panelWidth = c.panelWidth;
      if (c.panelHeight) cfg.panelHeight = c.panelHeight;
      render();
    })
    .catch(function () {});
})();
