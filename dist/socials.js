(() => {
  'use strict';
  const controls = [...document.querySelectorAll('[data-social-platform]')];
  if (!controls.length) return;
  const platforms = {
    facebook: ['facebook.com', 'fb.com'], linkedin: ['linkedin.com'],
    whatsapp: ['whatsapp.com', 'wa.me'], x: ['x.com', 'twitter.com'], github: ['github.com']
  };
  const safeProfile = (platform, value) => {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, '');
      return url.protocol === 'https:' && !url.username && !url.password && platforms[platform]?.includes(host) ? url.href : null;
    } catch { return null; }
  };
  const configure = data => {
    if (!data || typeof data !== 'object') return;
    controls.forEach(control => {
      const platform = control.dataset.socialPlatform;
      const url = safeProfile(platform, data[platform]);
      if (!url || control.tagName === 'A') return;
      const link = document.createElement('a');
      link.className = control.className;
      link.dataset.socialPlatform = platform;
      link.dataset.socialLabel = control.dataset.socialLabel;
      while (control.firstChild) link.appendChild(control.firstChild);
      link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.title = link.dataset.socialLabel;
      link.setAttribute('aria-label', link.dataset.socialLabel + ' (opens in a new tab)');
      control.replaceWith(link);
    });
  };
  const scriptBase = new URL('.', document.currentScript.src);
  fetch(new URL('contact/socials.json', scriptBase), { credentials: 'same-origin' })
    .then(response => response.ok ? response.json() : null).then(configure).catch(() => {});
})();
