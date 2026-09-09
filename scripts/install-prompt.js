// Suggests installing the site as an app, on whichever platforms support it.
//
// Chrome/Edge (Windows, macOS, Linux, Android) fire `beforeinstallprompt`;
// we hold onto that event and offer our own "Install app" button instead of
// whatever the browser would have shown. iOS/iPadOS Safari never fires that
// event -- there is no programmatic install there -- so it gets a banner
// with the manual "Share > Add to Home Screen" steps instead. Everywhere
// else (desktop Safari, Firefox) nothing is shown, since neither supports
// installing this kind of site.
(function () {
  'use strict';

  var DISMISS_KEY = 'pwaInstallDismissedAt';
  var DISMISS_DAYS = 14;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function recentlyDismissed() {
    try {
      var at = Number(localStorage.getItem(DISMISS_KEY));
      return at && (Date.now() - at) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  }

  function remember() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) { /* ignore */ }
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }

  function injectStyle() {
    var style = document.createElement('style');
    style.textContent =
      '.pwa-banner{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);' +
      'z-index:9999;max-width:min(92vw,440px);background:#2f2b26;color:#f7f3ea;' +
      'border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25);' +
      'font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
      'padding:14px 16px;display:flex;gap:12px;align-items:center;' +
      'opacity:0;translate:0 8px;transition:opacity .2s ease,translate .2s ease}' +
      '.pwa-banner.pwa-show{opacity:1;translate:0 0}' +
      '.pwa-banner p{margin:0;flex:1}' +
      '.pwa-banner button{border:0;border-radius:8px;padding:8px 12px;font:inherit;' +
      'font-weight:600;cursor:pointer;white-space:nowrap}' +
      '.pwa-banner .pwa-install{background:#3f7d5a;color:#fff}' +
      '.pwa-banner .pwa-dismiss{background:transparent;color:#c9c4bb}';
    document.head.appendChild(style);
  }

  function showBanner(message, actionLabel, onAction) {
    injectStyle();
    var el = document.createElement('div');
    el.className = 'pwa-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');

    var text = document.createElement('p');
    text.textContent = message;
    el.appendChild(text);

    if (actionLabel) {
      var action = document.createElement('button');
      action.className = 'pwa-install';
      action.type = 'button';
      action.textContent = actionLabel;
      action.addEventListener('click', function () {
        dismiss();
        onAction();
      });
      el.appendChild(action);
    }

    var dismissBtn = document.createElement('button');
    dismissBtn.className = 'pwa-dismiss';
    dismissBtn.type = 'button';
    dismissBtn.textContent = actionLabel ? 'Not now' : 'Got it';
    dismissBtn.addEventListener('click', dismiss);
    el.appendChild(dismissBtn);

    function dismiss() {
      remember();
      el.classList.remove('pwa-show');
      setTimeout(function () { el.remove(); }, 200);
    }

    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('pwa-show'); });
  }

  ready(function () {
    if (isStandalone() || recentlyDismissed()) return;

    var deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredPrompt = event;
      showBanner('Install this site as an app for quicker access.', 'Install', function () {
        deferredPrompt.prompt();
        deferredPrompt = null;
      });
    });

    if (isIos()) {
      // No install event on iOS -- Safari only supports the manual flow.
      showBanner('Add this to your Home Screen: tap Share, then "Add to Home Screen".', null, null);
    }
  });
})();
