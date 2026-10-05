(() => {
  'use strict';
  const section = document.querySelector('#contact');
  if (!section) return;

  // No recipient or delivery service is guessed. A pending form sends no data.
  const form = section.querySelector('.contact-form');
  const fields = section.querySelector('.contact-fields');
  const send = section.querySelector('.contact-send');
  const sendText = section.querySelector('.contact-send-text');
  const links = section.querySelector('.contact-links');
  const status = section.querySelector('.contact-form-status');
  const emailLink = section.querySelector('.contact-email-link');
  const inputs = [...form.querySelectorAll('.contact-input')];
  let recipient = null, endpoint = null, busy = false;
  const tell = message => { status.textContent = message; status.hidden = !message; };
  const fieldError = input => section.querySelector('#' + input.id + '-error');
  const clearError = input => {
    input.removeAttribute('aria-invalid');
    input.setCustomValidity('');
    const error = fieldError(input);
    error.textContent = ''; error.hidden = true;
  };
  inputs.forEach(input => input.addEventListener('input', () => clearError(input)));
  form.noValidate = true;
  const validate = () => {
    let first = null;
    inputs.forEach(input => {
      clearError(input);
      let message = '';
      if (input.required && !input.value.trim()) message = input.name === 'message' ? 'Please write a short message.' : input.name === 'email' ? 'Please enter your email address.' : 'Please enter your first name.';
      else if (input.type === 'email' && input.value && input.validity.typeMismatch) message = 'Please enter a valid email address.';
      if (message) {
        input.setCustomValidity(message); input.setAttribute('aria-invalid', 'true');
        const error = fieldError(input); error.textContent = message; error.hidden = false;
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
  const configure = data => {
    recipient = safeEmail(data && data.email); endpoint = safeEndpoint(data && data.endpoint);
    if (recipient) { emailLink.href = 'mailto:' + encodeURIComponent(recipient); emailLink.hidden = false; links.hidden = false; }
    send.disabled = !(recipient || endpoint);
  };
  if (typeof fetch === 'function') fetch('contact.json', { credentials: 'same-origin' }).then(response => response.ok ? response.json() : null).then(configure).catch(() => configure(null));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !(recipient || endpoint)) return;
    if (!validate()) return;
    const payload = Object.fromEntries(inputs.map(input => [input.name, input.value.trim()]));
    if (!endpoint) {
      const name = [payload.firstName, payload.lastName].filter(Boolean).join(' ');
      const subject = 'Portfolio message from ' + name;
      const body = 'Name: ' + name + '\nEmail: ' + payload.email + '\n\n' + payload.message;
      location.href = 'mailto:' + encodeURIComponent(recipient) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      tell('Your email draft is ready. Review it and send it from your email app.');
      return;
    }
    busy = true; send.disabled = true; fields.disabled = true; sendText.textContent = 'Sending…'; form.setAttribute('aria-busy', 'true'); tell('');
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 15000) : null;
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload), credentials: 'omit', ...(controller ? { signal: controller.signal } : {}) });
      if (!response.ok) throw new Error('Delivery was not accepted');
      const contentType = response.headers && response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (result && (result.ok === false || result.success === false || result.error)) throw new Error('Delivery was not accepted');
      }
      form.reset(); inputs.forEach(clearError); tell('Your message was sent. Thanks for reaching out.');
    } catch {
      tell('Your message could not be sent. Please try again, or connect on GitHub.');
    } finally {
      if (timeout !== null) clearTimeout(timeout);
      busy = false; send.disabled = false; fields.disabled = false; sendText.textContent = 'Send Message'; form.removeAttribute('aria-busy');
    }
  });

  // One flight follows the very same SVG path that is progressively drawn.
  const svg = section.querySelector('.contact-flight');
  const path = section.querySelector('.contact-flight-path');
  const plane = section.querySelector('.contact-plane');
  const intro = section.querySelector('.contact-intro');
  const panel = section.querySelector('.contact-form-panel');
  const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: true };
  let visible = false, started = false, finished = false, elapsed = 0, lastTime = null, frame = null;
  let length = 0, planeScale = 1, lastPosition = { x: 0, y: 0, angle: 0 };
  let resize = null;
  const ease = t => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, t)))) / 2;
  const complete = () => {
    finished = true; svg.style.visibility = 'hidden'; section.dataset.contactFlight = 'complete';
    if (frame !== null) cancelAnimationFrame(frame); frame = null; lastTime = null;
    if (resize) resize.disconnect();
  };
  const measure = () => {
    const box = section.getBoundingClientRect(), card = panel.getBoundingClientRect(), copy = intro.getBoundingClientRect();
    const width = box.width, height = box.height;
    const mobile = card.top > copy.top + 24;
    planeScale = mobile ? .7 : 1;
    const endX = card.right - box.left - (mobile ? 24 : 36), endY = card.top - box.top + 20;
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    if (mobile) {
      const lane = width - 17, turn = copy.bottom - box.top + 18;
      path.setAttribute('d', `M18 30 C${width * .35} 10 ${lane - 15} 12 ${lane} 72 C${lane + 2} ${turn * .6} ${lane - 3} ${turn - 25} ${lane - 1} ${turn} C${lane - 1} ${turn + 25} ${endX} ${endY - 28} ${endX} ${endY}`);
    } else {
      path.setAttribute('d', `M24 44 C${width * .16} 12 ${width * .30} 14 ${width * .43} 31 S${width * .60} 61 ${width * .71} 39 C${width * .80} 13 ${endX - 62} ${endY - 32} ${endX} ${endY}`);
    }
    try { length = path.getTotalLength(); } catch { complete(); return; }
    if (!Number.isFinite(length) || length <= 0) { complete(); return; }
    path.style.strokeDasharray = length + ' ' + length;
  };
  const place = (distance, settle = 0) => {
    const point = path.getPointAtLength(distance), ahead = path.getPointAtLength(Math.min(length, distance + 1));
    const behind = distance >= length - 1 ? path.getPointAtLength(Math.max(0, distance - 1)) : point;
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI + 32.3;
    lastPosition = { x: point.x + settle * .5, y: point.y + settle * 1.5, angle: angle + settle };
    plane.setAttribute('transform', `translate(${lastPosition.x} ${lastPosition.y}) rotate(${lastPosition.angle}) scale(${planeScale})`);
  };
  const paint = () => {
    if (elapsed < 400) { svg.style.visibility = 'hidden'; return; }
    svg.style.visibility = 'visible';
    if (elapsed < 4200) {
      const t = (elapsed - 400) / 3800, progress = ease(t);
      path.style.strokeDashoffset = length * (1 - progress); path.style.opacity = '.3';
      plane.style.opacity = Math.min(1, t / .08); place(length * progress);
    } else if (elapsed < 4750) {
      path.style.strokeDashoffset = 0; path.style.opacity = '.3'; plane.style.opacity = 1;
      place(length, ease((elapsed - 4200) / 550));
    } else if (elapsed < 5400) {
      const t = (elapsed - 4750) / 650, progress = ease(t);
      path.style.strokeDashoffset = length * progress; path.style.opacity = .3 * (1 - progress * .6);
      plane.style.opacity = 1 - progress; place(length, 1);
    } else complete();
  };
  const tick = time => {
    frame = null;
    if (finished || !visible || document.hidden || motion.matches) { lastTime = null; return; }
    if (lastTime !== null) elapsed += Math.max(0, time - lastTime);
    lastTime = time; paint();
    if (!finished) frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    const active = visible && !document.hidden && !motion.matches;
    section.dataset.contactActive = String(active);
    if (motion.matches && started) complete();
    if (!active) { if (frame !== null) cancelAnimationFrame(frame); frame = null; lastTime = null; }
    else if (started && !finished && frame === null) frame = requestAnimationFrame(tick);
  };
  const start = () => {
    if (started) return;
    started = true; section.dataset.contactFlight = 'waiting';
    if (motion.matches || typeof path.getPointAtLength !== 'function' || typeof requestAnimationFrame !== 'function' || typeof cancelAnimationFrame !== 'function') { complete(); return; }
    measure();
    if (typeof ResizeObserver === 'function' && !finished) {
      resize = new ResizeObserver(() => { measure(); if (started && !finished) paint(); }); resize.observe(section);
    }
    sync();
  };
  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === section); if (!entry) return;
      visible = entry.isIntersecting && entry.intersectionRatio > 0;
      if (visible && entry.intersectionRatio >= .18) start();
      sync();
    }, { threshold: [0, .18] });
    observer.observe(section);
  } else { complete(); sync(); }
  document.addEventListener('visibilitychange', sync);
  if (typeof motion.addEventListener === 'function') motion.addEventListener('change', sync);
  else if (typeof motion.addListener === 'function') motion.addListener(sync);
})();
