/* ============================================================
   Nadeeshan portfolio — theme manager
   - Default follows the OS colour scheme
   - Toggle button overrides; choice persists in localStorage
   - An inline head script sets data-theme before first paint
     (this file re-applies + wires the button + follows changes)
   ============================================================ */
(function () {
  var KEY = "nn-theme";
  var mq = null;
  try { mq = window.matchMedia("(prefers-color-scheme: dark)"); } catch (e) { mq = null; }

  function systemTheme() { return (mq && mq.matches) ? "dark" : "light"; }
  function storedTheme() {
    try {
      var s = window.localStorage.getItem(KEY);
      return (s === "dark" || s === "light") ? s : null;
    } catch (e) { return null; }
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.querySelector(".theme-toggle");
    if (btn) {
      var dark = (t === "dark");
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  window.__nnSetTheme = function (t) {
    try { window.localStorage.setItem(KEY, t); } catch (e) {}
    applyTheme(t);
  };

  /* honour the pre-paint choice, fall back to system */
  applyTheme(storedTheme() || systemTheme());

  /* wire the header toggle */
  function wire() {
    var btn = document.querySelector(".theme-toggle");
    if (btn && !btn.__nnWired) {
      btn.__nnWired = true;
      btn.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        window.__nnSetTheme(next);
      });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }

  /* follow OS changes only while the user has no saved choice */
  if (mq && typeof mq.addEventListener === "function") {
    mq.addEventListener("change", function () {
      if (!storedTheme()) applyTheme(systemTheme());
    });
  }
})();
