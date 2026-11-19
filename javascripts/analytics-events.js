/* Copy-button activation events. Cookieless; no-ops if analytics is absent or blocked. */
(function () {
  function classify(text) {
    if (text.indexOf("claude mcp add") !== -1) return "quickstart-copy";
    if (text.indexOf("faucet/request") !== -1) return "faucet-copy";
    return null;
  }
  document.addEventListener("click", function (e) {
    /* Material's copy button: identified by data-clipboard-target, which is
       stable across theme versions (class names are not). */
    var btn = e.target && e.target.closest ? e.target.closest("button[data-clipboard-target]") : null;
    if (!btn || btn.getAttribute("data-md-type") === "select" || typeof window.umami === "undefined") return;
    var sel = btn.getAttribute("data-clipboard-target");
    var code = sel ? document.querySelector(sel) : null;
    var name = code ? classify(code.innerText || "") : null;
    if (name) window.umami.track(name);
  });
})();
