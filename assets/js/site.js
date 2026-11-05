/* Shanshan (Shirley) Liu — site behaviour. No dependencies; everything here
   is progressive enhancement over working HTML. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $(".toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 1800);
  }

  /* ---------- Theme ---------- */
  function currentTheme() {
    var set = doc.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeButton(btn) {
    var next = currentTheme() === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", "Switch to " + next + " theme");
    btn.setAttribute("title", "Switch to " + next + " theme");
  }
  $$(".theme-toggle").forEach(function (btn) {
    syncThemeButton(btn);
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      doc.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      $$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", next === "dark" ? "#0f2539" : "#fbfbfa"); });
      syncThemeButton(btn);
    });
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $(".menu-toggle");
  var navList = $("#nav-list");
  if (menuBtn && navList) {
    var setMenu = function (open) {
      navList.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      var use = $("use", menuBtn);
      if (use) use.setAttribute("href", open ? "#i-close" : "#i-menu");
    };
    menuBtn.addEventListener("click", function () {
      setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navList.classList.contains("is-open")) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (navList.classList.contains("is-open") && !e.target.closest(".nav")) setMenu(false);
    });
    var nav = menuBtn.closest(".nav");
    nav.addEventListener("focusout", function (e) {
      if (navList.classList.contains("is-open") && e.relatedTarget && !nav.contains(e.relatedTarget)) setMenu(false);
    });
  }

  /* ---------- Header hairline on scroll ---------- */
  var header = $(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Tabs: "one vehicle, three roles" ---------- */
  $$("[data-roles]").forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    var sys = $(".sys", root);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (sys) sys.setAttribute("data-mode", tab.getAttribute("data-mode"));
      if (focus) tab.focus();
    }
    /* Panels are all visible without JavaScript; collapse to the selected one now. */
    var initial = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    if (initial) select(initial, false);
    root.classList.add("is-ready");
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowRight" || k === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        else if (k === "ArrowLeft" || k === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === "Home") n = tabs[0];
        else if (k === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });


    /* Pause / resume the flowing-energy animation (WCAG 2.2.2). */
    var pauseBtn = $(".anim-toggle", root);
    if (pauseBtn && sys) {
      if (reduceMotion) { pauseBtn.hidden = true; }
      pauseBtn.addEventListener("click", function () {
        var paused = pauseBtn.getAttribute("aria-pressed") !== "true";
        pauseBtn.setAttribute("aria-pressed", String(paused));
        doc.classList.toggle("anim-paused", paused);
      });
    }
  });

  /* ---------- Reveal on scroll ---------- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); rio.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el) { rio.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Clipboard helper ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  /* ---------- Publications: filters, search, BibTeX ---------- */
  var pubRoot = $("[data-pubs]");
  if (pubRoot) {
    var items = $$(".pub", pubRoot);
    var sections = $$(".pub-section", pubRoot);
    var filters = $$(".filter[data-filter]");
    var search = $("#pub-search");
    var status = $("#pub-status");
    var empty = $(".empty-state", pubRoot);
    var state = { filter: "all", q: "" };

    var apply = function () {
      var shown = 0;
      var q = state.q.trim().toLowerCase();
      items.forEach(function (el) {
        var okF = state.filter === "all" ||
          (state.filter === "first" ? el.getAttribute("data-first") === "true" :
            (" " + el.getAttribute("data-themes") + " ").indexOf(" " + state.filter + " ") > -1);
        var okQ = !q || el.getAttribute("data-search").indexOf(q) > -1;
        el.hidden = !(okF && okQ);
        if (!el.hidden) shown++;
      });
      sections.forEach(function (sec) {
        var any = $$(".pub", sec).some(function (el) { return !el.hidden; });
        sec.hidden = !any;
      });
      sections.forEach(function (sec) {
        var c = $(".count", sec);
        if (c) c.textContent = $$(".pub", sec).filter(function (el) { return !el.hidden; }).length;
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = shown + (shown === 1 ? " item" : " items") + " shown";
    };

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        state.filter = btn.getAttribute("data-filter");
        apply();
        if (window.history && history.replaceState) {
          history.replaceState(null, "", state.filter === "all" ? location.pathname + location.search : "#theme=" + state.filter);
        }
      });
    });
    if (search) {
      search.addEventListener("input", function () { state.q = search.value; apply(); });
    }
    /* Deep link: publications.html#theme=resilience */
    var fromHash = function () {
      var m = /theme=([\w-]+)/.exec(location.hash);
      if (!m) return;
      var b = filters.filter(function (x) { return x.getAttribute("data-filter") === m[1]; })[0];
      if (b && b.getAttribute("aria-pressed") !== "true") b.click();
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);

    $$(".pill-btn[data-bib]", pubRoot).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var box = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        box.hidden = open;
      });
    });
    $$(".copy[data-copy]", pubRoot).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var src = document.getElementById(btn.getAttribute("data-copy"));
        copyText(src.textContent.trim()).then(function () { toast("BibTeX copied"); }, function () { toast("Press Ctrl/Cmd+C to copy"); });
      });
    });
  }

  /* ---------- Copy email ---------- */
  $$("[data-copy-text]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy-text")).then(function () { toast("Copied"); });
    });
  });

  /* ---------- Print ---------- */
  $$("[data-print]").forEach(function (btn) {
    btn.addEventListener("click", function () { window.print(); });
  });

  doc.classList.add("js-ready");
})();
