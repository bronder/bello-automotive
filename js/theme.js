/* Light/dark theme toggle. Initial theme is applied pre-paint by the inline
   snippet in each page's <head>; this only handles the switch itself. */
(function () {
  "use strict";

  var root = document.documentElement;
  var btn = document.getElementById("themeToggle");
  var meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme) {
    root.dataset.theme = theme;
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "light"));
      btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    if (meta) meta.setAttribute("content", theme === "light" ? "#faf6ee" : "#0f0d0b");
  }

  if (btn) {
    // Sync the button label/pressed state with the theme the page loaded in
    apply(root.dataset.theme === "light" ? "light" : "dark");
    btn.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      apply(next);
      try { localStorage.setItem("bello-theme", next); } catch (e) { /* private mode */ }
    });
  }
})();
