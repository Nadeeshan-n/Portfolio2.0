/* Cookie consent + Google Analytics 4 (Consent Mode).
 *
 * 1. Create a GA4 property at https://analytics.google.com/
 * 2. Copy its Measurement ID (looks like G-XXXXXXXXXX)
 * 3. Paste it below as GA_MEASUREMENT_ID.
 * Until a real ID is set, the banner still works but nothing is sent to Google.
 */
(function () {
  'use strict';
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; /* <-- paste your GA4 Measurement ID here */
  var CONSENT_COOKIE = 'nn-cookie-consent';
  var MEMORY_COOKIE = 'nn-contact-memory';
  var GA_CONFIGURED = /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID);
  var COOKIE_SVG = "<svg class=\"cookie-svg\" viewBox=\"0 0 120 120\">\n  <g class=\"cookie-entrance\">\n    <g class=\"cookie-hover\">\n      <g class=\"cookie-float\">\n        <g class=\"cookie-rock\">\n          <g class=\"cookie-breathe\">\n            <g class=\"cookie-body\">\n              <path class=\"cookie-fade\" style=\"--ed:.35s\" d=\"M105.0,62.0C106.1,67.6 101.3,75.0 98.1,80.3C94.9,85.7 90.5,90.7 85.7,94.2C80.9,97.8 74.9,100.4 69.1,101.7C63.3,103.0 57.1,102.5 50.9,101.8C44.7,101.1 36.8,100.8 31.9,97.3C26.9,93.7 23.1,86.5 21.3,80.7C19.5,74.8 20.9,68.1 21.1,62.0C21.3,55.9 20.4,49.5 22.4,43.9C24.5,38.3 28.7,32.6 33.3,28.6C38.0,24.5 44.3,21.2 50.4,19.8C56.4,18.4 64.5,17.3 69.6,20.0C74.7,22.6 77.2,31.4 80.9,35.8C84.5,40.3 87.5,42.4 91.5,46.8C95.6,51.2 103.9,56.4 105.0,62.0Z\" fill=\"#d29a5b\"/>\n              <ellipse class=\"cookie-fade\" style=\"--ed:.5s;--fo:.5\" cx=\"50\" cy=\"54\" rx=\"19\" ry=\"13\" transform=\"rotate(-18 50 54)\" fill=\"#eec084\"/>\n              <path class=\"cookie-draw\" style=\"--len:266;--ed:.1s\" d=\"M105.0,62.0C106.1,67.6 101.3,75.0 98.1,80.3C94.9,85.7 90.5,90.7 85.7,94.2C80.9,97.8 74.9,100.4 69.1,101.7C63.3,103.0 57.1,102.5 50.9,101.8C44.7,101.1 36.8,100.8 31.9,97.3C26.9,93.7 23.1,86.5 21.3,80.7C19.5,74.8 20.9,68.1 21.1,62.0C21.3,55.9 20.4,49.5 22.4,43.9C24.5,38.3 28.7,32.6 33.3,28.6C38.0,24.5 44.3,21.2 50.4,19.8C56.4,18.4 64.5,17.3 69.6,20.0C74.7,22.6 77.2,31.4 80.9,35.8C84.5,40.3 87.5,42.4 91.5,46.8C95.6,51.2 103.9,56.4 105.0,62.0Z\" fill=\"none\" stroke=\"#17211E\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>\n              <g class=\"cookie-chips\" fill=\"#17211E\">\n                <path class=\"cookie-pop\" style=\"--ed:.72s\" d=\"M52.2,50.0C52.3,51.4 51.5,53.6 50.5,54.3C49.4,55.1 47.5,54.7 46.0,54.4C44.5,54.1 42.1,53.7 41.6,52.6C41.1,51.6 42.4,49.5 43.0,48.1C43.7,46.7 44.5,44.6 45.7,44.3C46.9,44.0 48.9,45.3 50.0,46.2C51.1,47.2 52.1,48.6 52.2,50.0Z\"/>\n                <path class=\"cookie-pop\" style=\"--ed:.80s\" d=\"M75.6,53.9C74.6,55.0 72.5,55.5 70.9,55.5C69.2,55.6 66.4,55.2 65.6,54.1C64.8,52.9 65.7,50.5 66.1,48.7C66.5,47.0 66.9,44.3 68.2,43.7C69.4,43.1 71.9,44.5 73.4,45.3C74.9,46.2 76.9,47.3 77.3,48.7C77.6,50.2 76.7,52.8 75.6,53.9Z\"/>\n                <path class=\"cookie-pop\" style=\"--ed:.88s\" d=\"M60.8,70.5C59.6,70.7 57.5,70.5 56.7,69.7C55.9,68.9 56.0,67.1 56.0,65.8C56.1,64.4 56.1,62.3 56.9,61.7C57.7,61.1 59.8,61.9 61.1,62.3C62.4,62.6 64.3,63.1 64.7,64.0C65.2,65.0 64.5,67.0 63.8,68.1C63.1,69.2 62.0,70.2 60.8,70.5Z\"/>\n                <path class=\"cookie-pop\" style=\"--ed:.96s\" d=\"M40.1,76.9C38.9,76.1 38.2,74.3 37.9,72.7C37.6,71.2 37.5,68.5 38.4,67.6C39.3,66.7 41.7,67.2 43.4,67.3C45.0,67.4 47.6,67.4 48.3,68.4C49.1,69.4 48.3,72.0 47.7,73.5C47.2,75.0 46.4,76.9 45.1,77.5C43.8,78.1 41.3,77.7 40.1,76.9Z\"/>\n                <path class=\"cookie-pop\" style=\"--ed:1.04s\" d=\"M71.1,73.4C70.7,72.3 70.5,70.4 71.1,69.6C71.7,68.8 73.4,68.6 74.6,68.4C75.8,68.2 77.8,67.9 78.4,68.5C79.1,69.2 78.7,71.2 78.6,72.4C78.4,73.6 78.3,75.4 77.5,75.9C76.7,76.5 74.8,76.2 73.7,75.8C72.6,75.4 71.6,74.4 71.1,73.4Z\"/>\n                <path class=\"cookie-pop\" style=\"--ed:1.12s\" d=\"M54.5,40.7C54.9,39.9 56.0,39.3 57.0,38.9C58.0,38.6 59.6,38.1 60.3,38.6C60.9,39.0 60.9,40.7 61.0,41.7C61.1,42.8 61.4,44.4 60.9,45.0C60.3,45.6 58.6,45.4 57.6,45.2C56.6,45.0 55.3,44.7 54.8,43.9C54.3,43.2 54.2,41.5 54.5,40.7Z\"/>\n                <path class=\"cookie-pop\" style=\"--ed:1.20s\" d=\"M63.6,79.8C64.8,79.1 67.0,78.4 68.1,78.9C69.1,79.4 69.6,81.4 70.1,82.8C70.5,84.2 71.4,86.4 70.8,87.3C70.1,88.2 67.7,88.2 66.3,88.3C64.8,88.3 62.8,88.5 61.9,87.7C61.1,86.8 60.9,84.5 61.2,83.2C61.5,81.9 62.5,80.5 63.6,79.8Z\"/>\n              </g>\n              <g class=\"cookie-texture\" fill=\"none\" stroke=\"#17211E\" stroke-width=\"1.6\" stroke-linecap=\"round\">\n                <path class=\"cookie-draw\" style=\"--len:18;--ed:.95s\" d=\"M40,62 q7,-5 14,-3\"/>\n                <path class=\"cookie-draw\" style=\"--len:18;--ed:1.02s\" d=\"M48,80 q6,-4 12,-2\"/>\n                <path class=\"cookie-draw\" style=\"--len:16;--ed:1.09s\" d=\"M62,36 q6,3 11,1\"/>\n              </g>\n              <g class=\"cookie-highlight\" fill=\"none\" stroke=\"#FFFDF6\" stroke-width=\"2.4\" stroke-linecap=\"round\">\n                <path class=\"cookie-draw\" style=\"--len:16;--ed:1.1s\" d=\"M38,44 q4,-6 10,-8\"/>\n                <circle class=\"cookie-pop\" style=\"--ed:1.22s\" cx=\"76\" cy=\"42\" r=\"2\" fill=\"#FFFDF6\" stroke=\"none\"/>\n              </g>\n            </g>\n          </g>\n        </g>\n      </g>\n      <g class=\"cookie-crumbs\">\n        <circle class=\"cookie-crumb cookie-pop\" style=\"--ed:1.25s;--cd:2.2s;--px:-6px;--py:-6px\" cx=\"20\" cy=\"34\" r=\"2.2\" fill=\"#c98d4e\"/>\n        <circle class=\"cookie-crumb cookie-pop\" style=\"--ed:1.32s;--cd:3.1s;--px:7px;--py:-4px\" cx=\"102\" cy=\"52\" r=\"1.8\" fill=\"#c98d4e\"/>\n        <circle class=\"cookie-crumb cookie-pop\" style=\"--ed:1.38s;--cd:2.6s;--px:-6px;--py:6px\" cx=\"26\" cy=\"94\" r=\"2\" fill=\"#c98d4e\"/>\n        <circle class=\"cookie-crumb cookie-pop\" style=\"--ed:1.44s;--cd:3.6s;--px:6px;--py:7px\" cx=\"97\" cy=\"93\" r=\"1.6\" fill=\"#c98d4e\"/>\n        <path class=\"cookie-crumb cookie-pop\" style=\"--ed:1.3s;--cd:2.9s;--px:5px;--py:-7px\" d=\"M92,22 q4,-3 8,-2\" fill=\"none\" stroke=\"#0E8F78\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>\n        <path class=\"cookie-crumb cookie-pop\" style=\"--ed:1.36s;--cd:3.3s;--px:7px;--py:-5px\" d=\"M100,32 q3,-4 6,-6\" fill=\"none\" stroke=\"#0E8F78\" stroke-width=\"1.5\" stroke-linecap=\"round\"/>\n      </g>\n    </g>\n  </g>\n</svg>";

  /* ---------- tiny cookie helpers ---------- */
  function readCookie(name) {
    var parts = ('; ' + document.cookie).split('; ' + name + '=');
    if (parts.length < 2) return null;
    try { return decodeURIComponent(parts.pop().split(';').shift()); }
    catch (e) { return null; }
  }
  function writeCookie(name, value, days) {
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; Max-Age=' + (days * 86400) + '; Path=/' + '; SameSite=Lax' + secure;
  }
  function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
  }

  function getConsent() {
    try { return JSON.parse(readCookie(CONSENT_COOKIE)); }
    catch (e) { return null; }
  }
  function saveConsent(state) {
    writeCookie(CONSENT_COOKIE, JSON.stringify(state), 365);
  }

  /* ---------- Google Consent Mode ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied'
  });

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded || !GA_CONFIGURED) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }

  function applyConsent(state) {
    gtag('consent', 'update', {
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied',
      analytics_storage: state.analytics ? 'granted' : 'denied',
      functionality_storage: state.preferences ? 'granted' : 'denied',
      personalization_storage: state.preferences ? 'granted' : 'denied'
    });
    if (state.analytics) loadGA();
    if (!state.preferences) eraseCookie(MEMORY_COOKIE);
    else fillContactMemory();
  }

  /* ---------- Preferences: remember contact-form name/email ---------- */
  var FIELD_IDS = ['contact-first-name', 'contact-last-name', 'contact-email'];
  function fillContactMemory() {
    var raw = readCookie(MEMORY_COOKIE);
    if (!raw) return;
    var mem;
    try { mem = JSON.parse(raw); } catch (e) { return; }
    FIELD_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && !el.value && mem[id]) el.value = mem[id];
    });
  }
  function wireContactMemory() {
    var form = document.querySelector('.contact-form');
    if (!form) return;
    form.addEventListener('submit', function () {
      var c = getConsent();
      if (!c || !c.preferences) return;
      var mem = {};
      FIELD_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.value) mem[id] = el.value;
      });
      if (Object.keys(mem).length) writeCookie(MEMORY_COOKIE, JSON.stringify(mem), 365);
    });
  }

  /* ---------- banner UI ---------- */
  var COOKIE_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9" stroke="#f5f5f5" stroke-width="1.8"/>' +
    '<circle cx="9" cy="10" r="1.3" fill="#f5f5f5"/><circle cx="14.5" cy="9" r="1.3" fill="#f5f5f5"/>' +
    '<circle cx="10.5" cy="14.5" r="1.3" fill="#f5f5f5"/><circle cx="15" cy="14" r="1.3" fill="#f5f5f5"/></svg>';

  var CATEGORIES = [
    { key: 'necessary', title: 'Strictly necessary', desc: 'Essential for site functionality and saving consent.', locked: true },
    { key: 'preferences', title: 'Preferences', desc: 'Remember optional contact form preferences.', locked: false },
    { key: 'analytics', title: 'Analytics', desc: 'Help improve the website through Google Analytics.', locked: false },
    { key: 'marketing', title: 'Marketing', desc: 'Used for advertising and related measurement.', locked: false }
  ];

  var banner = null, toggles = {};
  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'nn-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');

    var rows = '';
    CATEGORIES.forEach(function (cat) {
      rows += '<div class="nn-cookie-row"><div><h4>' + cat.title + '</h4><p>' + cat.desc + '</p></div>';
      rows += cat.locked
        ? '<span class="nn-cookie-always">Always on</span>'
        : '<label class="nn-switch"><input type="checkbox" data-cat="' + cat.key + '" aria-label="' + cat.title + ' cookies"><span class="nn-track"></span></label>';
      rows += '</div>';
    });

    banner.innerHTML =
      '<div class="nn-cookie-inner">' +
        '<div class="nn-cookie-head">' + COOKIE_ICON + '<h3 class="nn-cookie-title">Cookies on this site</h3></div>' +
        '<p class="nn-cookie-text">This portfolio uses essential storage to remember your choices and optional ' +
        'technologies to improve your experience. You can change your preferences anytime.</p>' +
        '<div class="nn-cookie-rows" hidden>' + rows + '</div>' +
        '<div class="nn-cookie-actions">' +
          '<button type="button" class="nn-btn primary-button" data-act="accept">Accept all</button>' +
          '<button type="button" class="nn-btn secondary-button" data-act="customize" aria-expanded="false">Customize</button>' +
          '<button type="button" class="nn-btn secondary-button" data-act="reject">Reject non-essential</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelectorAll('input[data-cat]').forEach(function (input) {
      toggles[input.getAttribute('data-cat')] = input;
    });
    banner.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-act');
      if (act === 'accept') choose({ necessary: true, preferences: true, analytics: true, marketing: true });
      else if (act === 'reject') choose({ necessary: true, preferences: false, analytics: false, marketing: false });
      else if (act === 'save') choose(readToggles());
      else if (act === 'customize') toggleCustomize();
    });
  }

  function readToggles() {
    return {
      necessary: true,
      preferences: !!(toggles.preferences && toggles.preferences.checked),
      analytics: !!(toggles.analytics && toggles.analytics.checked),
      marketing: !!(toggles.marketing && toggles.marketing.checked)
    };
  }

  function syncToggles() {
    var c = getConsent() || { necessary: true, preferences: true, analytics: false, marketing: false };
    Object.keys(toggles).forEach(function (k) { toggles[k].checked = !!c[k]; });
  }

  function toggleCustomize(force) {
    var panel = banner.querySelector('.nn-cookie-rows');
    var actions = banner.querySelector('.nn-cookie-actions');
    var willOpen = typeof force === 'boolean' ? force : panel.hasAttribute('hidden');
    if (willOpen) {
      panel.removeAttribute('hidden');
      syncToggles();
      actions.innerHTML =
        '<button type="button" class="nn-btn primary-button" data-act="save">Save choices</button>' +
        '<button type="button" class="nn-btn secondary-button" data-act="customize" aria-expanded="true">Customize</button>' +
        '<button type="button" class="nn-btn secondary-button" data-act="reject">Reject non-essential</button>';
    } else {
      panel.setAttribute('hidden', '');
      actions.innerHTML =
        '<button type="button" class="nn-btn primary-button" data-act="accept">Accept all</button>' +
        '<button type="button" class="nn-btn secondary-button" data-act="customize" aria-expanded="false">Customize</button>' +
        '<button type="button" class="nn-btn secondary-button" data-act="reject">Reject non-essential</button>';
    }
  }

  function openBanner(expand) {
    if (!banner) buildBanner();
    toggleCustomize(!!expand);
    banner.classList.add('nn-open');
    var h = banner.querySelector('.nn-cookie-title');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  function closeBanner() {
    if (banner) banner.classList.remove('nn-open');
  }
  function choose(state) {
    saveConsent(state);
    applyConsent(state);
    closeBanner();
  }

  /* floating cookie settings button (bottom-left, every page) */
  function buildFab() {
    if (document.querySelector('.nn-cookie-fab')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nn-cookie-fab';
    btn.setAttribute('aria-label', 'Cookie settings');
    btn.innerHTML = '<span class="cookie-wrap" aria-hidden="true">' + COOKIE_SVG + '</span>';
    btn.addEventListener('click', openBanner);
    document.body.appendChild(btn);
  }
  window.NNCookies = { openSettings: openBanner };

  /* ---------- init ---------- */
  function init() {
    buildBanner();
    buildFab();
    wireContactMemory();
    var stored = getConsent();
    if (stored) {
      applyConsent(stored);
    } else {
      setTimeout(openBanner, 700);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
