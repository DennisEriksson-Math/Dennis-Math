// Section tabs + publication filters.
//
// Both are progressive: without JavaScript every panel and every publication
// stays visible, so the page still reads (and prints) as one long list.
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {

    // ---- top-level section tabs ----
    var navButtons = document.querySelectorAll('.section-nav-item');
    var panels = document.querySelectorAll('.tab-panel');

    // Two folding panels: the details above the tab bar, About me below it.
    // Each has its own button; choosing any section closes both, and the
    // buttons are how you bring them back.
    var folds = [];
    document.querySelectorAll('.fold-toggle').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) folds.push({ btn: btn, panel: panel });
    });

    function reducedMotion() {
      return window.matchMedia &&
             window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function setFold(f, open) {
      f.btn.setAttribute('aria-expanded', String(open));

      if (reducedMotion()) {
        f.panel.classList.toggle('is-collapsed', !open);
        f.panel.style.height = open ? '' : '0px';
        return;
      }

      // Pin the current height, force that to be laid out, then move away from
      // it. A synchronous reflow is used rather than requestAnimationFrame,
      // which never fires in a background tab and would leave a panel stuck.
      if (open) {
        f.panel.classList.remove('is-collapsed');
        var target = f.panel.scrollHeight;
        f.panel.style.height = '0px';
        void f.panel.offsetHeight;
        f.panel.style.height = target + 'px';
        setTimeout(function () {
          if (!f.panel.classList.contains('is-collapsed')) f.panel.style.height = '';
        }, 450);
      } else {
        f.panel.style.height = f.panel.scrollHeight + 'px';
        void f.panel.offsetHeight;
        f.panel.classList.add('is-collapsed');
        f.panel.style.height = '0px';
        setTimeout(function () {
          if (f.panel.classList.contains('is-collapsed')) f.panel.style.height = '0px';
        }, 600);
      }
    }

    function closeAllFolds() {
      folds.forEach(function (f) {
        if (f.btn.getAttribute('aria-expanded') === 'true') setFold(f, false);
      });
    }

    folds.forEach(function (f) {
      f.btn.addEventListener('click', function () {
        setFold(f, f.btn.getAttribute('aria-expanded') !== 'true');
      });
    });

    function showPanel(name) {
      navButtons.forEach(function (b) {
        b.setAttribute('aria-selected', String(b.getAttribute('data-target') === name));
      });
      panels.forEach(function (p) {
        p.hidden = (p.getAttribute('data-panel') !== name);
      });
      closeAllFolds();
      if (history.replaceState) {
        history.replaceState(null, '', '#' + name);
      }
    }

    navButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        showPanel(b.getAttribute('data-target'));
      });
    });

    // ---- publication filters ----
    var filterButtons = document.querySelectorAll('.pub-filter');
    var pubs = document.querySelectorAll('.publication');
    var empty = document.querySelector('.pub-empty');

    function applyFilter(which) {
      var shown = 0;
      filterButtons.forEach(function (b) {
        b.setAttribute('aria-selected', String(b.getAttribute('data-filter') === which));
      });
      pubs.forEach(function (p) {
        var match = (which === 'all') || (p.getAttribute('data-status') === which);
        p.classList.toggle('is-filtered-out', !match);
        if (match) shown++;
      });
      if (empty) empty.hidden = (shown > 0);
    }

    filterButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        applyFilter(b.getAttribute('data-filter'));
      });
    });

    // ---- deep links ----
    // #students opens that tab; #some-paper-id opens Publications and jumps to it.
    // Runs on load AND on hashchange, because following a link to #students from
    // the same page changes only the fragment and never reloads the document.
    function openFromHash(scroll) {
      var hash = (location.hash || '').replace('#', '');
      if (!hash) return;
      var named = null;
      panels.forEach(function (p) {
        if (p.getAttribute('data-panel') === hash) named = p;
      });
      if (named) {
        showPanel(hash);
        // On a phone the tabs are hidden and every section is already on the
        // page, so switching panels shows nothing - scroll to it instead.
        var nav = document.querySelector('.section-nav');
        if (scroll && nav && getComputedStyle(nav).display === 'none') {
          named.scrollIntoView();
        }
        return;
      }
      var target = document.getElementById(hash);
      if (!target) return;
      var owner = target.closest('.tab-panel');
      if (owner) showPanel(owner.getAttribute('data-panel'));
      if (scroll) target.scrollIntoView();
    }

    openFromHash(true);
    window.addEventListener('hashchange', function () { openFromHash(true); });
  });
})();
