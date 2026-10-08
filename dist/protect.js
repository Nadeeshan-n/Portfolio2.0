/* ============================================================
   Nadeeshan portfolio — copy protection
   Deters casual copying: disables text selection, right-click,
   copy/cut shortcuts and image dragging. Form fields stay
   selectable so the contact form remains usable.
   (Not a lock: DevTools / screenshots can still capture content.)
   ============================================================ */
(function () {
  /* disable selection + dragging via injected stylesheet */
  var st = document.createElement("style");
  st.textContent =
    "html{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}" +
    "input,textarea{-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}" +
    "img{-webkit-user-drag:none;user-drag:none}";
  document.head.appendChild(st);

  /* block right-click menu */
  document.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  /* block copy / cut events */
  document.addEventListener("copy", function (e) { e.preventDefault(); });
  document.addEventListener("cut", function (e) { e.preventDefault(); });

  /* block image dragging */
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") e.preventDefault();
  });

  /* block common copy-related shortcuts (Ctrl/Cmd+C, X, U, S, P) */
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey) {
      var k = (e.key || "").toLowerCase();
      if (k === "c" || k === "x" || k === "u" || k === "s" || k === "p") e.preventDefault();
    }
  });
})();
