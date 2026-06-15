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

  // Everything (launcher + chat panel + all network calls) lives inside this
  // iframe, served from the Bleviq origin. The host page only needs to allow
  // this frame (frame-src) and this script (script-src) in its CSP, no
  // connect-src or img-src for Bleviq.
  var frame = document.createElement("iframe");
  frame.title = "Chat";
  frame.setAttribute("allowtransparency", "true");
  frame.setAttribute("scrolling", "no");
  frame.src = origin + "/frame?key=" + encodeURIComponent(key);
  frame.style.cssText =
    "position:fixed;bottom:0;right:0;left:auto;width:0;height:0;border:0;" +
    "background:transparent;z-index:" + Z + ";opacity:0;" +
    "transition:opacity .25s ease;color-scheme:normal;";

  function place(side, w, h) {
    frame.style.width = w + "px";
    frame.style.height = h + "px";
    if (side === "left") {
      frame.style.left = "0";
      frame.style.right = "auto";
    } else {
      frame.style.right = "0";
      frame.style.left = "auto";
    }
    frame.style.opacity = "1";
  }

  window.addEventListener("message", function (e) {
    if (e.origin !== origin) return;
    var d = e.data;
    if (!d || d.type !== "bleviq:resize") return;
    place(d.side === "left" ? "left" : "right", Math.max(0, d.w | 0), Math.max(0, d.h | 0));
  });

  function mount() {
    document.body.appendChild(frame);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
