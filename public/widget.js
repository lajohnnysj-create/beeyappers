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
  var frame = document.createElement("iframe");
  frame.title = "Chat";
  frame.src = origin + "/embed?key=" + encodeURIComponent(key);

  function side() {
    return cfg.launcherPosition === "bottom-left" ? "left" : "right";
  }
  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v || lo));
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

  // ---- Panel (iframe) geometry + animated open/close ----
  function applyFrame() {
    var s = side();
    var opp = s === "left" ? "right" : "left";
    var w = clamp(cfg.panelWidth, 280, 480);
    var h = clamp(cfg.panelHeight, 360, 720);
    var openTransition =
      "opacity .2s ease, transform .28s cubic-bezier(.34,1.56,.64,1), visibility 0s";
    var closedTransition =
      "opacity .18s ease, transform .22s ease, visibility 0s linear .24s";
    frame.style.cssText =
      "position:fixed;bottom:88px;" + s + ":20px;" + opp + ":auto;" +
      "width:" + w + "px;height:" + h + "px;" +
      "max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);" +
      "border:none;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.28);" +
      "background:#fff;z-index:" + Z + ";transform-origin:bottom " + s + ";" +
      (open
        ? "visibility:visible;opacity:1;transform:translateY(0) scale(1);pointer-events:auto;transition:" + openTransition + ";"
        : "visibility:hidden;opacity:0;transform:translateY(14px) scale(.94);pointer-events:none;transition:" + closedTransition + ";");
  }

  function openChat() {
    if (!open) toggle();
  }
  function closeChat() {
    if (open) toggle();
  }
  function toggle() {
    open = !open;
    renderLauncher();
    applyFrame();
  }
  function ask(q) {
    openChat();
    q = (q || "").trim();
    if (q) {
      try {
        frame.contentWindow.postMessage(
          { type: "bleviq-ask", question: q.slice(0, 2000) },
          origin
        );
      } catch (e) { /* ignore */ }
    }
  }

  // ---- Launcher rendering ----
  function closeButton() {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Close chat");
    b.style.cssText =
      "width:56px;height:56px;border-radius:50%;background:" + cfg.bubbleColor +
      ";color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);" +
      "font-size:22px;line-height:56px;text-align:center;padding:0;";
    b.textContent = "\u2715";
    b.addEventListener("click", closeChat);
    return b;
  }

  function bubbleNode() {
    var row = document.createElement("div");
    var s = side();
    row.style.cssText = "display:flex;align-items:center;gap:10px;";
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Open chat");
    b.style.cssText =
      "width:56px;height:56px;border-radius:20px 20px 8px 20px;background:" + cfg.bubbleColor +
      ";color:#fff;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.22);" +
      "display:flex;align-items:center;justify-content:center;padding:0;font-size:24px;";
    if (cfg.avatarUrl) {
      var box = document.createElement("span");
      box.style.cssText = "width:38px;height:38px;border-radius:13px;overflow:hidden;display:flex;";
      box.appendChild(avatarEl(38));
      b.appendChild(box);
    }
    b.addEventListener("click", openChat);

    var lbl = null;
    if (cfg.launcherLabel) {
      lbl = document.createElement("span");
      lbl.textContent = cfg.launcherLabel;
      lbl.style.cssText =
        "background:#fff;color:#0f172a;padding:8px 12px;border-radius:18px;" +
        "box-shadow:0 4px 14px rgba(0,0,0,.18);font-size:14px;white-space:nowrap;font-family:" + FONT + ";";
    }
    if (lbl && s === "right") { row.appendChild(lbl); row.appendChild(b); }
    else if (lbl) { row.appendChild(b); row.appendChild(lbl); }
    else { row.appendChild(b); }
    return row;
  }

  function barNode() {
    var s = side();
    var col = document.createElement("div");
    col.style.cssText =
      "display:flex;flex-direction:column;gap:0;align-items:" +
      (s === "left" ? "flex-start" : "flex-end") + ";";

    var bar = document.createElement("div");
    bar.style.cssText =
      "display:flex;align-items:center;gap:8px;background:" + cfg.bubbleColor +
      ";border-radius:22px 22px " + (s === "left" ? "22px 8px" : "8px 22px") +
      ";padding:8px;box-shadow:0 6px 20px rgba(0,0,0,.22);max-width:calc(100vw - 40px);";

    var avBtn = null;
    if (cfg.avatarUrl) {
      avBtn = document.createElement("button");
      avBtn.type = "button";
      avBtn.setAttribute("aria-label", "Open chat");
      avBtn.style.cssText =
        "width:36px;height:36px;border:none;padding:0;cursor:pointer;border-radius:12px;" +
        "background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;" +
        "overflow:hidden;flex-shrink:0;";
      avBtn.appendChild(avatarEl(36));
      avBtn.addEventListener("click", openChat);
    }

    var pill = document.createElement("div");
    pill.style.cssText =
      "display:flex;align-items:center;gap:8px;background:#fff;border-radius:9999px;padding:6px 6px 6px 14px;";

    var input = document.createElement("input");
    input.type = "text";
    input.placeholder = cfg.launcherLabel || "Ask AI";
    input.setAttribute("aria-label", "Ask a question");
    input.style.cssText =
      "border:none;outline:none;background:transparent;font-size:14px;color:#0f172a;" +
      "font-family:" + FONT + ";width:74px;box-sizing:border-box;" +
      "transition:width .3s cubic-bezier(.34,1.4,.64,1);";

    var sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.setAttribute("aria-label", "Send");
    sendBtn.style.cssText =
      "width:30px;height:30px;border:none;padding:0;cursor:pointer;border-radius:50%;" +
      "background:#0f172a;display:flex;align-items:center;justify-content:center;flex-shrink:0;";
    sendBtn.appendChild(arrowEl());

    pill.appendChild(input);
    pill.appendChild(sendBtn);
    if (avBtn) bar.appendChild(avBtn);
    bar.appendChild(pill);

    var note = document.createElement("div");
    note.textContent = "This chat is recorded.";
    note.style.cssText =
      "font-family:" + FONT + ";font-size:11px;color:#64748b;background:#fff;" +
      "border-radius:9999px;box-shadow:0 2px 8px rgba(0,0,0,.12);" +
      "padding:0 12px;max-height:0;opacity:0;overflow:hidden;" +
      "transform:translateY(-4px);pointer-events:none;" +
      "transition:max-height .28s ease, opacity .2s ease, transform .28s ease, margin-top .28s ease;";

    function expand() {
      input.style.width = "210px";
      note.style.maxHeight = "28px";
      note.style.opacity = "1";
      note.style.transform = "translateY(0)";
      note.style.marginTop = "8px";
      note.style.padding = "5px 12px";
    }
    function collapse() {
      if (input.value.trim()) return;
      input.style.width = "74px";
      note.style.maxHeight = "0";
      note.style.opacity = "0";
      note.style.transform = "translateY(-4px)";
      note.style.marginTop = "0";
      note.style.padding = "0 12px";
    }
    input.addEventListener("focus", expand);
    input.addEventListener("blur", collapse);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); ask(input.value); input.value = ""; }
    });
    sendBtn.addEventListener("click", function () { ask(input.value); input.value = ""; });

    col.appendChild(bar);
    col.appendChild(note);
    return col;
  }

  function renderLauncher() {
    var s = side();
    container.style.cssText =
      "position:fixed;bottom:20px;" + s + ":20px;" +
      (s === "left" ? "right:auto;" : "left:auto;") +
      "display:flex;flex-direction:column;align-items:" +
      (s === "left" ? "flex-start" : "flex-end") + ";z-index:" + Z + ";";
    clear(container);
    if (open) container.appendChild(closeButton());
    else if (cfg.launcherStyle === "bar") container.appendChild(barNode());
    else container.appendChild(bubbleNode());
  }

  // The chatbox X (inside the iframe) asks the loader to close.
  window.addEventListener("message", function (e) {
    if (e.origin !== origin) return;
    if (e.data && e.data.type === "bleviq-close" && open) toggle();
  });

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(container);
    renderLauncher();
    applyFrame();
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
      renderLauncher();
      applyFrame();
    })
    .catch(function () {});
})();
