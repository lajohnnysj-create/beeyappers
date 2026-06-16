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
  var lang = "";
  try {
    lang =
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      "";
  } catch (e) {}
  frame.src =
    origin +
    "/frame?key=" +
    encodeURIComponent(key) +
    (lang ? "&lang=" + encodeURIComponent(lang) : "");
  frame.style.cssText =
    "position:fixed;bottom:0;right:0;left:auto;width:0;height:0;border:0;" +
    "background:transparent;z-index:" + Z + ";opacity:0;" +
    "transition:opacity .25s ease;color-scheme:normal;";

  // Lock the host page behind the chat on mobile so focusing the input scrolls
  // inside the chat, not the page. Body is pinned and scroll restored on close.
  var savedScrollY = 0;
  var locked = false;
  function lockScroll() {
    if (locked) return;
    locked = true;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    var b = document.body, h = document.documentElement;
    b.style.top = "-" + savedScrollY + "px";
    b.style.position = "fixed";
    b.style.left = "0";
    b.style.right = "0";
    b.style.width = "100%";
    b.style.overflow = "hidden";
    h.style.overflow = "hidden";
  }
  function unlockScroll() {
    if (!locked) return;
    locked = false;
    var b = document.body, h = document.documentElement;
    b.style.position = "";
    b.style.top = "";
    b.style.left = "";
    b.style.right = "";
    b.style.width = "";
    b.style.overflow = "";
    h.style.overflow = "";
    window.scrollTo(0, savedScrollY);
  }

  function place(side, w, h) {
    unlockScroll();
    frame.style.top = "auto";
    frame.style.bottom = "0";
    frame.style.height = h + "px";
    frame.style.width = w + "px";
    if (side === "left") {
      frame.style.left = "0";
      frame.style.right = "auto";
    } else {
      frame.style.right = "0";
      frame.style.left = "auto";
    }
    frame.style.opacity = "1";
  }

  function goFullscreen() {
    frame.style.top = "0";
    frame.style.left = "0";
    frame.style.right = "auto";
    frame.style.bottom = "auto";
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.opacity = "1";
    lockScroll();
  }

  function sendViewport() {
    try {
      frame.contentWindow.postMessage(
        { type: "bleviq:viewport", w: window.innerWidth, h: window.innerHeight },
        origin
      );
    } catch (e) { /* ignore */ }
  }
  frame.addEventListener("load", sendViewport);
  window.addEventListener("resize", sendViewport);

  window.addEventListener("message", function (e) {
    if (e.origin !== origin) return;
    var d = e.data;
    if (!d) return;
    if (d.type === "bleviq:ready") {
      sendViewport();
      return;
    }
    if (d.type !== "bleviq:resize") return;
    if (d.full) {
      goFullscreen();
    } else {
      place(d.side === "left" ? "left" : "right", Math.max(0, d.w | 0), Math.max(0, d.h | 0));
    }
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
