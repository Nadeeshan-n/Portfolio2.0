(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');
  const closeMenu = (focus = false) => {
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation menu');
    menu.textContent = 'Menu';
    if (focus) menu.focus();
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menu.textContent = open ? 'Close' : 'Menu';
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
  });
  const smallScreen = matchMedia('(max-width: 760px)');
  smallScreen.addEventListener?.('change', () => closeMenu());
  let scrollPending = false;
  addEventListener('scroll', () => {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', scrollY > 8);
      scrollPending = false;
    });
  }, { passive: true });
  header.classList.toggle('scrolled', scrollY > 8);
  document.querySelector('.education-year').textContent = String(new Date().getFullYear());

  // Timeline: one smooth S-curve is generated from the real positions of the dots,
  // so wrapping text, resizing or late-loading images never detach it.
  const wrap = document.querySelector('.timeline-wrap');
  const curve = wrap.querySelector('.timeline-curve');
  const curvePath = curve.querySelector('path');
  let timelinePending = false;
  const drawTimeline = () => {
    timelinePending = false;
    const bounds = wrap.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const dots = [...wrap.querySelectorAll('.timeline-dot')].map(dot => {
      const box = dot.getBoundingClientRect();
      return { x: box.left + box.width / 2 - bounds.left, y: box.top + box.height / 2 - bounds.top };
    });
    if (!dots.length) return;
    curve.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const first = dots[0], last = dots[dots.length - 1];
    let path = `M${first.x} ${Math.max(0, first.y - 24)} L${first.x} ${first.y}`;
    for (let index = 1; index < dots.length; index++) {
      const a = dots[index - 1], b = dots[index], middle = (a.y + b.y) / 2;
      // Vertical tangents at every dot keep the curve smooth, with no kinks.
      path += ` C${a.x} ${middle} ${b.x} ${middle} ${b.x} ${b.y}`;
    }
    path += ` L${last.x} ${Math.min(bounds.height, last.y + 28)}`;
    curvePath.setAttribute('d', path);
  };
  const requestTimeline = () => {
    if (timelinePending) return;
    timelinePending = true;
    requestAnimationFrame(drawTimeline);
  };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(requestTimeline);
    observer.observe(wrap);
    wrap.querySelectorAll('.timeline-item').forEach(item => observer.observe(item));
  }
  addEventListener('resize', requestTimeline, { passive: true });
  addEventListener('load', requestTimeline);
  document.fonts?.ready.then(requestTimeline);
  requestTimeline();

  // University emblem: show a clean "USJ" if the image cannot load.
  const mark = wrap.querySelector('.university-mark');
  if (mark) {
    const showFallback = () => {
      if (!mark.isConnected) return;
      const fallback = document.createElement('span');
      fallback.className = 'university-fallback';
      fallback.textContent = 'USJ';
      mark.replaceWith(fallback);
      requestTimeline();
    };
    if (mark.complete && mark.naturalWidth === 0) showFallback();
    else {
      mark.addEventListener('error', showFallback, { once: true });
      mark.addEventListener('load', requestTimeline, { once: true });
    }
  }

  // Decorative motion never reacts to a pointer. Pause it when this page is hidden.
  const setMotion = () => document.body.classList.toggle('motion-paused', document.hidden);
  document.addEventListener('visibilitychange', setMotion);
  setMotion();

  const dialog = document.querySelector('#certificate-dialog');
  if (typeof dialog.showModal !== 'function') return;
  let records;
  try { records = JSON.parse(document.querySelector('#education-data').textContent).certificates; }
  catch { return; }
  const certificates = new Map(records.map(item => [item.id, item]));
  const close = dialog.querySelector('.certificate-close');
  const title = dialog.querySelector('#certificate-modal-title');
  const institution = dialog.querySelector('.certificate-modal-institution');
  const meta = dialog.querySelector('.certificate-modal-meta');
  const skills = dialog.querySelector('.certificate-modal-skills');
  const noImage = dialog.querySelector('.certificate-no-image');
  const gallery = dialog.querySelector('.certificate-gallery');
  const image = dialog.querySelector('.certificate-image');
  const error = dialog.querySelector('.certificate-image-error');
  const controls = dialog.querySelector('.certificate-gallery-controls');
  const previous = dialog.querySelector('.certificate-previous');
  const next = dialog.querySelector('.certificate-next');
  const position = dialog.querySelector('.certificate-image-position');
  let opener = null, current = null, images = [], imageIndex = 0, pointerBeganOutside = false;
  const safeImage = item => {
    if (!item || typeof item.src !== 'string') return false;
    try {
      const url = new URL(item.src, location.href);
      return url.protocol === 'https:' || (url.origin === location.origin && url.protocol === 'http:');
    } catch { return false; }
  };
  const showImage = () => {
    const record = images[imageIndex];
    if (!record) return;
    image.hidden = false;
    error.hidden = true;
    image.alt = record.alt || `${current.title} certificate${images.length > 1 ? `, image ${imageIndex + 1} of ${images.length}` : ''}`;
    image.src = new URL(record.src, location.href).href;
    position.textContent = `${imageIndex + 1} / ${images.length}`;
    previous.disabled = imageIndex === 0;
    next.disabled = imageIndex === images.length - 1;
    controls.hidden = images.length < 2;
  };
  const dismiss = () => { if (dialog.open) dialog.close(); };
  const restore = () => {
    document.body.classList.remove('certificate-open');
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  };
  const openCertificate = trigger => {
    const record = certificates.get(trigger.dataset.certificate);
    if (!record || dialog.open) return;
    opener = trigger;
    current = record;
    images = Array.isArray(record.images) ? record.images.filter(safeImage) : [];
    imageIndex = 0;
    title.textContent = record.title;
    institution.textContent = record.institution;
    meta.textContent = `Certificate · ${record.year}`;
    skills.textContent = record.skills.join(' · ');
    gallery.hidden = images.length === 0;
    noImage.hidden = images.length !== 0;
    if (images.length) showImage();
    else { image.removeAttribute('src'); image.alt = ''; }
    document.body.classList.add('certificate-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    close.focus({ preventScroll: true });
  };
  // Certificate thumbnails come from the same records as the preview dialog.
  document.querySelectorAll('.timeline-media[data-certificate]').forEach(cell => {
    const record = certificates.get(cell.dataset.certificate);
    const first = record && Array.isArray(record.images) ? record.images.find(safeImage) : null;
    if (!first) return;
    const thumb = document.createElement('img');
    thumb.alt = '';
    thumb.decoding = 'async';
    thumb.loading = 'lazy';
    thumb.addEventListener('load', () => { cell.classList.add('has-image'); requestTimeline(); });
    thumb.addEventListener('error', () => { thumb.remove(); cell.classList.remove('has-image'); });
    thumb.src = new URL(first.src, location.href).href;
    cell.append(thumb);
  });
  document.querySelectorAll('.certificate-trigger').forEach(trigger => {
    if (!certificates.has(trigger.dataset.certificate)) return;
    trigger.disabled = false;
    trigger.addEventListener('click', () => openCertificate(trigger));
  });
  close.addEventListener('click', dismiss);
  dialog.addEventListener('close', restore);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  const outside = event => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', event => { pointerBeganOutside = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (pointerBeganOutside && event.target === dialog && outside(event)) dismiss();
    pointerBeganOutside = false;
  });
  previous.addEventListener('click', () => { if (imageIndex > 0) { imageIndex--; showImage(); } });
  next.addEventListener('click', () => { if (imageIndex < images.length - 1) { imageIndex++; showImage(); } });
  image.addEventListener('error', () => { if (dialog.open && images.length) { image.hidden = true; error.hidden = false; } });
})();
