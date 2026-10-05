(() => {
  'use strict';
  const page = document.body;
  const section = document.querySelector('#contact-main');
  if (!section) return;
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: true };

  // Reuse the existing navigation behavior on this route only.
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const mobile = typeof matchMedia === 'function' ? matchMedia('(max-width: 760px)') : null;
  if (menu && navigation && mobile) {
    const setMenu = open => {
      navigation.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };
    page.classList.add('contact-js'); menu.hidden = false;
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
    });
    const onBreakpoint = () => {
      if (mobile.matches && navigation.contains(document.activeElement)) menu.focus();
      setMenu(false);
    };
    if (mobile.addEventListener) mobile.addEventListener('change', onBreakpoint);
    else if (mobile.addListener) mobile.addListener(onBreakpoint);
  }
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive: true });
  const year = document.querySelector('.contact-year');
  if (year) year.textContent = String(new Date().getFullYear());


  // Share the existing delivery configuration; never claim a message was sent without acceptance.
  const form = section.querySelector('.contact-form');
  const fields = section.querySelector('.contact-fields');
  const send = section.querySelector('.contact-send');
  const sendText = section.querySelector('.contact-send-text');
  const status = section.querySelector('.contact-form-status');
  const inputs = [...form.querySelectorAll('.contact-input')];
  let recipient = null, endpoint = null, busy = false;
  const tell = message => { status.textContent = message; status.hidden = !message; };
  const errorFor = input => section.querySelector('#' + input.id + '-error');
  const clearError = input => {
    input.removeAttribute('aria-invalid'); input.setCustomValidity('');
    const error = errorFor(input); error.textContent = ''; error.hidden = true;
  };
  inputs.forEach(input => input.addEventListener('input', () => clearError(input)));
  form.noValidate = true;
  const validate = () => {
    let first = null;
    inputs.forEach(input => {
      clearError(input);
      let message = '';
      if (input.required && !input.value.trim()) {
        message = input.name === 'message' ? 'Please write a short message.' : input.name === 'email' ? 'Please enter your email address.' : 'Please enter your first name.';
      } else if (input.type === 'email' && input.value && input.validity.typeMismatch) message = 'Please enter a valid email address.';
      if (message) {
        input.setCustomValidity(message); input.setAttribute('aria-invalid', 'true');
        const error = errorFor(input); error.textContent = message; error.hidden = false;
        if (!first) first = input;
      }
    });
    if (first) { tell('Please check the marked fields.'); first.focus(); return false; }
    return true;
  };
  const safeEmail = value => typeof value === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim()) && !/@example\.(com|org|net)$/i.test(value.trim()) ? value.trim() : null;
  const safeEndpoint = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'https:' && !url.username && !url.password && !url.hash ? url.href : null;
    } catch { return null; }
  };
  const configureDelivery = data => {
    recipient = safeEmail(data?.email); endpoint = safeEndpoint(data?.endpoint);
    send.disabled = !(recipient || endpoint);
  };
  if (typeof fetch === 'function') fetch(new URL('../contact.json', new URL('.', document.currentScript.src)), { credentials: 'same-origin' })
    .then(response => response.ok ? response.json() : null).then(configureDelivery).catch(() => configureDelivery(null));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !(recipient || endpoint) || !validate()) return;
    const payload = Object.fromEntries(inputs.map(input => [input.name, input.value.trim()]));
    if (!endpoint) {
      const name = [payload.firstName, payload.lastName].filter(Boolean).join(' ');
      const subject = 'Portfolio message from ' + name;
      const body = 'Name: ' + name + '\nEmail: ' + payload.email + '\n\n' + payload.message;
      location.href = 'mailto:' + encodeURIComponent(recipient) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      tell('Your email draft is ready. Review it and send it from your email app.');
      return;
    }
    busy = true; send.disabled = true; fields.disabled = true; sendText.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true'); tell('');
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 15000) : null;
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), credentials: 'omit', ...(controller ? { signal: controller.signal } : {}) });
      if (!response.ok) throw new Error('Delivery was not accepted');
      if (response.headers?.get('content-type')?.includes('application/json')) {
        const result = await response.json();
        if (result && (result.ok === false || result.success === false || result.error)) throw new Error('Delivery was not accepted');
      }
      form.reset(); inputs.forEach(clearError); tell('Your message was sent. Thanks for reaching out.');
    } catch { tell('Your message could not be sent. Please try again.'); }
    finally {
      if (timer !== null) clearTimeout(timer);
      busy = false; send.disabled = false; fields.disabled = false; sendText.textContent = 'Send Message'; form.removeAttribute('aria-busy');
    }
  });

  // One on-load flight after a short pause. The route skirts the text and fields.
  const svg = section.querySelector('.contact-flight');
  const path = section.querySelector('.contact-flight-path');
  const dot = section.querySelector('.contact-flight-dot');
  const plane = section.querySelector('.contact-plane');
  const panel = section.querySelector('.contact-form-panel');
  let elapsed = 0, lastTime = null, frame = null, finished = false, length = 0, planeScale = 1, ready = false;
  let resize = null;
  const ease = t => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
  const complete = () => {
    finished = true; svg.style.visibility = 'hidden'; section.dataset.contactFlight = 'complete';
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; lastTime = null; resize?.disconnect();
  };
  const measure = () => {
    const box = section.getBoundingClientRect(), card = panel.getBoundingClientRect();
    const width = box.width, height = box.height;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const compact = width < 760;
    planeScale = compact ? .62 : .9;
    const endX = card.right - box.left - 14;
    const endY = card.top - box.top + 14;
    if (compact) {
      const lane = width - 4;
      path.setAttribute('d', `M18 20 C${width * .3} 5 ${width * .7} 7 ${width - 20} 20 C${lane + 1} 34 ${lane} ${endY - 47} ${lane} ${endY - 27} C${lane - 1} ${endY - 12} ${endX + 6} ${endY - 7} ${endX} ${endY}`);
    } else {
      const lane = width - 52;
      path.setAttribute('d', `M80 144 C57 85 123 12 ${width * .26} 11 C${width * .46} 9 ${width * .64} 14 ${width * .78} 24 C${lane - 7} 41 ${lane + 7} 119 ${lane} 157 C${lane - 5} ${endY - 37} ${endX + 25} ${endY - 13} ${endX} ${endY}`);
    }
    try { length = path.getTotalLength(); } catch { complete(); return; }
    if (!Number.isFinite(length) || length <= 0) { complete(); return; }
    path.style.strokeDasharray = length + ' ' + length;
  };
  const place = (distance, settle = 0) => {
    const point = path.getPointAtLength(distance);
    const ahead = path.getPointAtLength(Math.min(length, distance + 1));
    const behind = distance >= length - 1 ? path.getPointAtLength(Math.max(0, distance - 1)) : point;
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
    plane.setAttribute('transform', `translate(${point.x + settle * .5} ${point.y + settle * 1.5}) rotate(${angle + settle}) scale(${planeScale})`);
  };
  const paint = () => {
    if (elapsed < 1500) { svg.style.visibility = 'hidden'; return; }
    if (!ready) { measure(); if (finished) return; ready = true; }
    svg.style.visibility = 'visible';
    const start = path.getPointAtLength(0);
    dot.setAttribute('cx', start.x); dot.setAttribute('cy', start.y);
    if (elapsed < 1950) {
      const t = (elapsed - 1500) / 450;
      dot.style.opacity = t < .45 ? ease(t / .45) : 1 - ease((t - .45) / .55);
      plane.style.opacity = t < .45 ? 0 : ease((t - .45) / .55);
      path.style.strokeDashoffset = length; path.style.opacity = '.32'; place(0);
      section.dataset.contactFlight = 'appearing';
    } else if (elapsed < 5450) {
      const progress = ease((elapsed - 1950) / 3500);
      dot.style.opacity = 0; plane.style.opacity = 1;
      path.style.strokeDashoffset = length * (1 - progress); path.style.opacity = '.32'; place(length * progress);
      section.dataset.contactFlight = 'traveling';
    } else if (elapsed < 5900) {
      path.style.strokeDashoffset = 0; plane.style.opacity = 1; place(length, ease((elapsed - 5450) / 450));
      section.dataset.contactFlight = 'settling';
    } else if (elapsed < 6550) {
      const progress = ease((elapsed - 5900) / 650);
      path.style.strokeDashoffset = length * progress;
      path.style.opacity = .32 * (1 - progress * .7); plane.style.opacity = 1 - progress;
      place(length, 1); section.dataset.contactFlight = 'erasing';
    } else complete();
  };
  const tick = time => {
    frame = null;
    if (finished || document.hidden || motion.matches) { lastTime = null; return; }
    if (lastTime !== null) elapsed += Math.max(0, time - lastTime);
    lastTime = time; paint();
    if (!finished) frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    page.classList.toggle('motion-paused', document.hidden || motion.matches);
    if (motion.matches) {
      complete(); return;
    }
    if (document.hidden) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; lastTime = null;
    } else if (!finished && frame === null) frame = requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', sync);
  if (motion.addEventListener) motion.addEventListener('change', sync);
  else if (motion.addListener) motion.addListener(sync);
  if (motion.matches || typeof requestAnimationFrame !== 'function' || typeof cancelAnimationFrame !== 'function' || typeof path.getPointAtLength !== 'function') {
    complete(); page.classList.toggle('motion-paused', document.hidden || motion.matches); return;
  }
  measure();
  if (!finished && typeof ResizeObserver === 'function') {
    resize = new ResizeObserver(() => { measure(); if (!finished) paint(); }); resize.observe(section); resize.observe(panel);
  } else if (!finished) {
    window.addEventListener('resize', () => { if (!finished) { measure(); paint(); } }, { passive: true });
  }
  sync();
})();
