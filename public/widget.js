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
  var FONT = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
  var cfg = {
    bubbleColor: "#2563eb",
    launcherPosition: "bottom-right",
    launcherStyle: "bubble",
    launcherLabel: "",
    avatarUrl: null,
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

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function avatarEl(size) {
    if (cfg.avatarUrl) {
      var img = document.createElement("img");
      img.src = cfg.avatarUrl;
      img.alt = "";
      img.style.cssText =
        "width:" + size + "px;height:" + size + "px;border-radius:" +
        Math.round(size * 0.32) + "px;object-fit:cover;display:block;";
      return img;
    }
    var s = document.createElement("span");
    s.textContent = "\uD83D\uDCAC";
    s.style.cssText = "font-size:" + Math.round(size * 0.68) + "px;line-height:1;";
    return s;
  }

  function arrowEl() {
    var s = document.createElement("span");
    s.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    return s.firstChild;
  }

  function render() {
    var side = cfg.launcherPosition === "bottom-left" ? "left" : "right";
    var opp = side === "left" ? "right" : "left";

    container.style.cssText =
      "position:fixed;bottom:20px;" + side + ":20px;" + opp + ":auto;" +
      "display:flex;align-items:center;gap:10px;z-index:" + Z + ";" +
      "flex-direction:" + (side === "left" ? "row-reverse" : "row") + ";";

    clear(btn);
    label.style.display = "none";

    if (open) {
      btn.style.cssText =
        "width:56px;height:56px;border-radius:50%;background:" + cfg.bubbleColor +
        ";color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);" +
        "font-size:22px;line-height:56px;text-align:center;padding:0;";
      btn.textContent = "\u2715";
    } else if (cfg.launcherStyle === "bar") {
      btn.style.cssText =
        "display:flex;align-items:center;gap:8px;background:" + cfg.bubbleColor +
        ";border:none;cursor:pointer;border-radius:22px 22px 8px 22px;padding:8px;" +
        "box-shadow:0 6px 20px rgba(0,0,0,.22);";
      var av = document.createElement("span");
      av.style.cssText =
        "width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,.2);" +
        "display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;";
      av.appendChild(avatarEl(36));
      btn.appendChild(av);
      var pill = document.createElement("span");
      pill.style.cssText =
        "display:flex;align-items:center;gap:8px;background:#fff;border-radius:9999px;padding:7px 7px 7px 14px;";
      var ph = document.createElement("span");
      ph.textContent = cfg.launcherLabel || "Ask AI";
      ph.style.cssText =
        "color:#64748b;font-size:14px;white-space:nowrap;font-family:" + FONT + ";";
      pill.appendChild(ph);
      var snd = document.createElement("span");
      snd.style.cssText =
        "width:28px;height:28px;border-radius:50%;background:#0f172a;display:flex;" +
        "align-items:center;justify-content:center;flex-shrink:0;";
      snd.appendChild(arrowEl());
      pill.appendChild(snd);
      btn.appendChild(pill);
    } else {
      btn.style.cssText =
        "width:56px;height:56px;border-radius:20px 20px 8px 20px;background:" + cfg.bubbleColor +
        ";color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.22);" +
        "display:flex;align-items:center;justify-content:center;padding:0;font-size:24px;";
      if (cfg.avatarUrl) {
        var box = document.createElement("span");
        box.style.cssText = "width:38px;height:38px;border-radius:13px;overflow:hidden;display:flex;";
        box.appendChild(avatarEl(38));
        btn.appendChild(box);
      } else {
        btn.textContent = "\uD83D\uDCAC";
      }
      if (cfg.launcherLabel) {
        label.textContent = cfg.launcherLabel;
        label.style.cssText =
          "background:#fff;color:#0f172a;padding:8px 12px;border-radius:18px;" +
          "box-shadow:0 4px 14px rgba(0,0,0,.18);font-size:14px;white-space:nowrap;font-family:" + FONT + ";";
        label.style.display = "block";
      }
    }

    var w = Math.max(280, Math.min(480, cfg.panelWidth || 380));
    var h = Math.max(360, Math.min(720, cfg.panelHeight || 560));
    frame.style.cssText =
      "position:fixed;bottom:88px;" + side + ":20px;" + opp + ":auto;" +
      "width:" + w + "px;height:" + h + "px;" +
      "max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);" +
      "border:none;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.28);" +
      "background:#fff;display:" + (open ? "block" : "none") + ";z-index:" + Z + ";";
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

  fetch(origin + "/api/widget-config?key=" + encodeURIComponent(key))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || !d.config) return;
      var c = d.config;
      if (c.bubbleColor) cfg.bubbleColor = c.bubbleColor;
      if (c.launcherPosition) cfg.launcherPosition = c.launcherPosition;
      if (c.launcherStyle) cfg.launcherStyle = c.launcherStyle;
      if (typeof c.launcherLabel === "string") cfg.launcherLabel = c.launcherLabel;
      if (c.avatarUrl) cfg.avatarUrl = c.avatarUrl;
      if (c.panelWidth) cfg.panelWidth = c.panelWidth;
      if (c.panelHeight) cfg.panelHeight = c.panelHeight;
      render();
    })
    .catch(function () {});
})();
