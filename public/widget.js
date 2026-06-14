(function () {
  // Find this script tag to read its config and origin.
  var script = document.currentScript;
  if (!script) {
    var all = document.getElementsByTagName("script");
    script = all[all.length - 1];
  }

  var key = script.getAttribute("data-widget-key");
  if (!key) {
    console.error("[BeeYappers] Missing data-widget-key on the embed script.");
    return;
  }

  var origin;
  try {
    origin = new URL(script.src).origin;
  } catch (e) {
    console.error("[BeeYappers] Could not determine widget origin.");
    return;
  }

  var Z = "2147483000"; // sit above almost everything

  // Launcher button
  var btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Open chat");
  btn.textContent = "\uD83D\uDCAC"; // speech balloon
  btn.style.cssText =
    "position:fixed;bottom:20px;right:20px;width:56px;height:56px;" +
    "border-radius:50%;background:#2563eb;color:#fff;border:none;" +
    "cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);font-size:24px;" +
    "line-height:56px;text-align:center;padding:0;z-index:" + Z + ";";

  // Chat panel iframe (hidden until opened)
  var frame = document.createElement("iframe");
  frame.title = "Chat";
  frame.src = origin + "/embed?key=" + encodeURIComponent(key);
  frame.style.cssText =
    "position:fixed;bottom:88px;right:20px;width:380px;height:560px;" +
    "max-width:calc(100vw - 40px);max-height:calc(100vh - 120px);" +
    "border:none;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.28);" +
    "background:#fff;display:none;z-index:" + Z + ";";

  var open = false;
  function toggle() {
    open = !open;
    frame.style.display = open ? "block" : "none";
    btn.textContent = open ? "\u2715" : "\uD83D\uDCAC"; // X or balloon
    btn.setAttribute("aria-label", open ? "Close chat" : "Open chat");
  }
  btn.addEventListener("click", toggle);

  function mount() {
    document.body.appendChild(frame);
    document.body.appendChild(btn);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
