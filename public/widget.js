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

  // If a single-page-app host unmounted the widget while this script was still
  // loading, skip mounting. And never mount the widget twice on one page.
  if (window.__bleviqCancelled) { window.__bleviqCancelled = false; return; }
  if (window.__bleviqWidget) return;

  var Z = "2147483000";

  // Launcher offset state. The bubble lifts above a bottom-anchored cookie
  // banner or the footer, and drops back when clear. It is never hidden: if
  // detection is uncertain the offset is 0 (the normal corner position).
  var GAP = 12;
  var currentSide = "right";
  var isFullscreen = false;
  var lastOffset = -1;
  var rafPending = false;
  var offsetObserver = null;
  var offsetTimers = [];
  var offsetInterval = null;

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
    (lang ? "&lang=" + encodeURIComponent(lang) : "") +
    "&host=" +
    encodeURIComponent(location.hostname);
  frame.style.cssText =
    "position:fixed;bottom:0;right:0;left:auto;width:0;height:0;border:0;" +
    "background:transparent;z-index:" + Z + ";opacity:0;" +
    "transition:opacity .25s ease, bottom .2s ease;color-scheme:normal;";

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
    isFullscreen = false;
    currentSide = side === "left" ? "left" : "right";
    frame.style.top = "auto";
    frame.style.height = h + "px";
    frame.style.width = w + "px";
    if (currentSide === "left") {
      frame.style.left = "0";
      frame.style.right = "auto";
    } else {
      frame.style.right = "0";
      frame.style.left = "auto";
    }
    frame.style.opacity = "1";
    lastOffset = -1; // force a fresh write after any state change
    applyOffset();
  }

  function goFullscreen() {
    isFullscreen = true;
    frame.style.top = "0";
    frame.style.left = "0";
    frame.style.right = "auto";
    frame.style.bottom = "auto";
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.opacity = "1";
    lockScroll();
  }

  // Is this element a visible, pinned overlay (a candidate banner), not an
  // ordinary in-flow page section that merely has a cookie-ish class?
  function isPinnedVisible(el) {
    var s;
    try { s = getComputedStyle(el); } catch (e) { return false; }
    if (!s) return false;
    if (s.display === "none" || s.visibility === "hidden") return false;
    if (parseFloat(s.opacity || "1") < 0.05) return false;
    return s.position === "fixed" || s.position === "sticky";
  }

  // How far up the bubble must sit to clear a bottom cookie banner that
  // overlaps the launcher's corner. 0 when no such banner is on screen.
  function bannerClearance() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var zoneH = 140, zoneW = 160;
    var zTop = vh - zoneH, zBottom = vh, zLeft, zRight;
    if (currentSide === "left") { zLeft = 0; zRight = zoneW; }
    else { zRight = vw; zLeft = vw - zoneW; }
    var sel =
      '[id*="cookie" i],[class*="cookie" i],[id*="consent" i],' +
      '[class*="consent" i],[id*="gdpr" i],[class*="gdpr" i],' +
      '[aria-label*="cookie" i],#onetrust-banner-sdk,#CybotCookiebotDialog,' +
      '.cc-window,#cookie-law-info-bar,.cky-consent-container,.cky-consent-bar,' +
      '#osano-cm-window,.osano-cm-window,.iubenda-cs-container,#truste-consent-track';
    var nodes;
    try {
      nodes = document.querySelectorAll(sel);
    } catch (e) {
      // Older browsers reject the case-insensitive attribute flag; use a
      // smaller selector of well-known consent containers instead.
      try {
        nodes = document.querySelectorAll(
          "#onetrust-banner-sdk,#CybotCookiebotDialog,.cc-window," +
            "#cookie-law-info-bar,.cky-consent-bar,.osano-cm-window"
        );
      } catch (e2) {
        return 0;
      }
    }
    var best = 0;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!isPinnedVisible(el)) continue;
      var r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.left < zRight && r.right > zLeft && r.top < zBottom && r.bottom > zTop) {
        var clear = vh - r.top; // lift above the banner's top edge
        if (clear > best) best = clear;
      }
    }
    return best > 0 ? best + GAP : 0;
  }

  // How far up to sit so the bubble does not cover the footer once it scrolls
  // into view at the bottom. 0 when the footer is not on screen.
  function footerClearance() {
    var f;
    try {
      f = document.querySelector('footer,[role="contentinfo"]');
    } catch (e) {
      f = null;
    }
    if (!f) return 0;
    var vh = window.innerHeight;
    var r = f.getBoundingClientRect();
    if (r.height < 1 || r.top >= vh) return 0;
    var clear = vh - r.top;
    return clear > 0 ? clear + GAP : 0;
  }

  function computeOffset() {
    try {
      var off = Math.max(bannerClearance(), footerClearance(), 0);
      var cap = Math.round(window.innerHeight * 0.6); // never fling it too high
      return Math.round(off > cap ? cap : off);
    } catch (e) {
      return 0; // any trouble: fall back to the normal corner position
    }
  }

  function applyOffset() {
    if (isFullscreen || !frame) return;
    var off = computeOffset();
    if (off === lastOffset) return; // no change, and avoids a write/observe loop
    lastOffset = off;
    frame.style.bottom = off + "px";
  }

  function scheduleUpdate() {
    if (rafPending) return;
    rafPending = true;
    var raf =
      window.requestAnimationFrame ||
      function (cb) {
        return setTimeout(cb, 16);
      };
    raf(function () {
      rafPending = false;
      applyOffset();
    });
  }

  function startOffsetWatch() {
    // Banners are usually injected (or removed) as nodes, so a childList
    // observer catches appear/dismiss. Scroll/resize handle the footer. A few
    // delayed checks and a short poll cover banners that load late or hide
    // themselves without being removed.
    try {
      offsetObserver = new MutationObserver(scheduleUpdate);
      offsetObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    } catch (e) {
      offsetObserver = null;
    }
    var delays = [0, 400, 1000, 2000, 3500];
    for (var i = 0; i < delays.length; i++) {
      offsetTimers.push(setTimeout(applyOffset, delays[i]));
    }
    var ticks = 0;
    offsetInterval = setInterval(function () {
      ticks++;
      applyOffset();
      if (ticks > 15 && offsetInterval) {
        clearInterval(offsetInterval);
        offsetInterval = null;
      }
    }, 800);
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
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);

  function onMessage(e) {
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
  }
  window.addEventListener("message", onMessage);

  function mount() {
    document.body.appendChild(frame);
    startOffsetWatch();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }

  // Teardown hook so a single-page-app host can remove the widget on route
  // change, instead of letting the iframe persist onto pages that don't embed
  // it. Plain HTML embeds never call this; behavior there is unchanged.
  function destroy() {
    try { window.removeEventListener("resize", sendViewport); } catch (e) {}
    try { window.removeEventListener("message", onMessage); } catch (e) {}
    try { window.removeEventListener("scroll", scheduleUpdate); } catch (e) {}
    try { window.removeEventListener("resize", scheduleUpdate); } catch (e) {}
    try { frame.removeEventListener("load", sendViewport); } catch (e) {}
    try { document.removeEventListener("DOMContentLoaded", mount); } catch (e) {}
    try { if (offsetObserver) offsetObserver.disconnect(); } catch (e) {}
    offsetObserver = null;
    for (var i = 0; i < offsetTimers.length; i++) {
      try { clearTimeout(offsetTimers[i]); } catch (e) {}
    }
    offsetTimers = [];
    if (offsetInterval) {
      try { clearInterval(offsetInterval); } catch (e) {}
      offsetInterval = null;
    }
    unlockScroll();
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    window.__bleviqWidget = null;
  }
  window.__bleviqWidget = { destroy: destroy };
})();
