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
  var CATEGORIES = [
    { key: 'necessary', title: 'Strictly necessary', desc: 'Required for the site to work and to remember this choice. Always on.', locked: true },
    { key: 'preferences', title: 'Preferences', desc: 'Remembers conveniences like your name and email in the contact form.', locked: false },
    { key: 'analytics', title: 'Analytics', desc: 'Helps Nadeeshan understand which pages and projects visitors enjoy (Google Analytics).', locked: false },
    { key: 'marketing', title: 'Marketing', desc: 'Used for advertising and retargeting. This site currently sets none.', locked: false }
  ];

  var banner = null, toggles = {};
  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'nn-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.setAttribute('aria-live', 'polite');

    var html = '<h3 class="nn-cookie-title">Cookies on this site</h3>' +
      '<p class="nn-cookie-text">This portfolio uses cookies to remember your choices and, with your permission, ' +
      'to understand how visitors use the site. Choose what you are comfortable with.</p>' +
      '<div class="nn-cookie-customize" hidden>';
    CATEGORIES.forEach(function (cat) {
      html += '<div class="nn-cookie-row"><div><h4>' + cat.title + '</h4><p>' + cat.desc + '</p></div>';
      if (cat.locked) {
        html += '<span class="nn-cookie-lock">Always on</span>';
      } else {
        html += '<label class="nn-switch"><input type="checkbox" data-cat="' + cat.key + '" aria-label="' + cat.title + ' cookies">' +
          '<span class="nn-track"></span></label>';
      }
      html += '</div>';
    });
    html += '</div><div class="nn-cookie-actions">' +
      '<button type="button" class="nn-btn nn-btn-primary" data-act="accept">Accept all</button>' +
      '<button type="button" class="nn-btn nn-btn-ghost" data-act="reject">Reject non-essential</button>' +
      '<button type="button" class="nn-btn nn-btn-ghost" data-act="customize">Customize</button>' +
      '</div>';
    banner.innerHTML = html;
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
      else if (act === 'customize') toggleCustomize();
      else if (act === 'save') choose(readToggles());
    });
  }

  function toggleCustomize() {
    var panel = banner.querySelector('.nn-cookie-customize');
    var actions = banner.querySelector('.nn-cookie-actions');
    var open = panel.hasAttribute('hidden');
    if (open) {
      panel.removeAttribute('hidden');
      var c = getConsent() || { necessary: true, preferences: false, analytics: false, marketing: false };
      Object.keys(toggles).forEach(function (k) { toggles[k].checked = !!c[k]; });
      actions.innerHTML = '<button type="button" class="nn-btn nn-btn-primary" data-act="save">Save choices</button>' +
        '<button type="button" class="nn-btn nn-btn-ghost" data-act="reject">Reject non-essential</button>';
    } else {
      panel.setAttribute('hidden', '');
      actions.innerHTML = '<button type="button" class="nn-btn nn-btn-primary" data-act="accept">Accept all</button>' +
        '<button type="button" class="nn-btn nn-btn-ghost" data-act="reject">Reject non-essential</button>' +
        '<button type="button" class="nn-btn nn-btn-ghost" data-act="customize">Customize</button>';
    }
  }

  function readToggles() {
    return {
      necessary: true,
      preferences: !!(toggles.preferences && toggles.preferences.checked),
      analytics: !!(toggles.analytics && toggles.analytics.checked),
      marketing: !!(toggles.marketing && toggles.marketing.checked)
    };
  }

  function openBanner() {
    if (!banner) buildBanner();
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

  /* footer "Cookie settings" link */
  function injectFooterLink() {
    var footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.nn-cookie-footer-link')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nn-cookie-footer-link';
    btn.textContent = 'Cookie settings';
    btn.setAttribute('aria-label', 'Open cookie settings');
    btn.addEventListener('click', openBanner);
    var sep = document.createElement('span');
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = ' · ';
    sep.style.opacity = '.5';
    footer.appendChild(sep);
    footer.appendChild(btn);
  }
  window.NNCookies = { openSettings: openBanner };

  /* ---------- init ---------- */
  function init() {
    buildBanner();
    injectFooterLink();
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
