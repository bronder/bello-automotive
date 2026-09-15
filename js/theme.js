/* Site chrome: light/dark theme toggle (initial theme is applied pre-paint by
   the inline snippet in each page's <head>) and the mobile menu drawer. */
(function () {
  "use strict";

  var root = document.documentElement;
  var toggles = Array.prototype.slice.call(document.querySelectorAll(".theme-toggle"));
  var meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme) {
    root.dataset.theme = theme;
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(theme === "light"));
      btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    });
    if (meta) meta.setAttribute("content", theme === "light" ? "#faf6ee" : "#0f0d0b");
  }

  // Sync the button labels/pressed state with the theme the page loaded in
  apply(root.dataset.theme === "light" ? "light" : "dark");
  toggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      apply(next);
      try { localStorage.setItem("bello-theme", next); } catch (e) { /* private mode */ }
    });
  });

  /* ---------- Mobile menu drawer ---------- */

  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("mobileMenu");

  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(!menu.classList.contains("open"));
    });
    // close after choosing a destination
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    // the drawer only exists visually on phones; reset if the viewport grows
    window.addEventListener("resize", function () {
      if (window.innerWidth > 640) setMenu(false);
    });
  }
})();
