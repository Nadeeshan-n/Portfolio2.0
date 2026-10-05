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

  // Route geometry follows the actual layout; wrapping text never detaches its nodes.
  const map = document.querySelector('.journey-map');
  const svg = map.querySelector('.journey-route');
  const ink = svg.querySelector('.route-ink');
  const branchInk = svg.querySelector('.route-branches');
  let routePending = false;
  const drawRoute = () => {
    routePending = false;
    const bounds = map.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const nodes = [...map.querySelectorAll('.route-node')].map(node => {
      const box = node.getBoundingClientRect();
      const stop = node.closest('.journey-stop').getBoundingClientRect();
      return { x: box.left + box.width / 2 - bounds.left, y: box.top + box.height / 2 - bounds.top, bottom: stop.bottom - bounds.top };
    });
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    let path = `M${nodes[0].x} ${Math.max(0, nodes[0].y - 18)} L${nodes[0].x} ${nodes[0].y}`;
    for (let index = 1; index < nodes.length; index++) {
      const a = nodes[index - 1], b = nodes[index];
      // Elbows live in the whitespace between modules, never across their text.
      const middle = a.bottom + (b.y - a.bottom) * .5;
      if (Math.abs(a.x - b.x) < 1) path += ` L${b.x} ${b.y}`;
      else {
        const direction = b.x > a.x ? 1 : -1;
        const radius = Math.min(7, Math.abs(b.x - a.x) / 3, (b.y - a.y) / 5);
        path += ` L${a.x} ${middle - radius} Q${a.x} ${middle} ${a.x + radius * direction} ${middle}`;
        path += ` L${b.x - radius * direction} ${middle} Q${b.x} ${middle} ${b.x} ${middle + radius} L${b.x} ${b.y}`;
      }
    }
    ink.setAttribute('d', path);
    let branches = '';
    map.querySelectorAll('.learning-stage').forEach(stage => {
      const hub = stage.querySelector('.route-node').getBoundingClientRect();
      const hubX = hub.left + hub.width / 2 - bounds.left;
      const hubY = hub.top + hub.height / 2 - bounds.top;
      stage.querySelectorAll('.learning-node').forEach(learning => {
        const box = learning.getBoundingClientRect();
        const dot = learning.querySelector('.mini-node').getBoundingClientRect();
        const x = dot.left + dot.width / 2 - bounds.left;
        const y = dot.top + dot.height / 2 - bounds.top;
        const railY = box.top + 4 - bounds.top;
        branches += `M${hubX} ${hubY} V${railY} H${x} V${y} `;
      });
    });
    branchInk.setAttribute('d', branches);
  };
  const requestRoute = () => {
    if (routePending) return;
    routePending = true;
    requestAnimationFrame(drawRoute);
  };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(requestRoute);
    observer.observe(map);
    map.querySelectorAll('.journey-stop').forEach(stop => observer.observe(stop));
  }
  addEventListener('resize', requestRoute, { passive: true });
  document.fonts?.ready.then(requestRoute);
  requestRoute();

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
