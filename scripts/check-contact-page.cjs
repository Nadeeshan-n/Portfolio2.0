'use strict';

// All network, DOM and SVG APIs are mocked. No real contact message is sent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const code = fs.readFileSync(path.join(__dirname, '../dist/contact/contact-page.js'), 'utf8');
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function harness(options = {}) {
  const state = { frames: new Map(), timers: new Map(), posts: [], next: 0, time: 0, focus: null, resets: 0, resizes: [] };
  class Element {
    constructor(props = {}) {
      Object.assign(this, { attrs: {}, style: {}, dataset: {}, events: {}, children: [], hidden: false, disabled: false, textContent: '', value: '', tagName: 'DIV' }, props);
      const classes = new Set();
      this.classList = { add: key => classes.add(key), remove: key => classes.delete(key), contains: key => classes.has(key), toggle: (key, value) => value ? classes.add(key) : classes.delete(key) };
    }
    addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
    emit(type, event = {}) { return Promise.all((this.events[type] || []).map(fn => fn(event))); }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    getAttribute(name) { return this.attrs[name]; }
    removeAttribute(name) { delete this.attrs[name]; }
    setCustomValidity(value) { this.customValidity = value; }
    getBoundingClientRect() { return this.rect; }
    focus() { state.focus = this.id; }
    get firstChild() { return this.children[0]; }
    appendChild(child) { if (child.parent) child.parent.children.shift(); this.children.push(child); child.parent = this; }
    replaceWith(node) { const index = controls.indexOf(this); controls[index] = node; }
    get validity() { return { typeMismatch: this.type === 'email' && !!this.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value) }; }
  }
  const inputs = [
    new Element({ id: 'contact-first-name', name: 'firstName', type: 'text', required: true }),
    new Element({ id: 'contact-last-name', name: 'lastName', type: 'text', required: false }),
    new Element({ id: 'contact-email', name: 'email', type: 'email', required: true }),
    new Element({ id: 'contact-message', name: 'message', type: 'textarea', required: true })
  ];
  const form = new Element();
  form.querySelectorAll = () => inputs;
  form.reset = () => { inputs.forEach(input => { input.value = ''; }); state.resets++; };
  const controls = ['facebook', 'linkedin', 'whatsapp', 'x', 'github'].map(key => {
    const control = new Element({ tagName: key === 'github' ? 'A' : 'BUTTON', disabled: key !== 'github', className: 'social-icon', dataset: { socialPlatform: key, socialLabel: key }, style: { cssText: '--social-delay:1150ms' } });
    control.appendChild(new Element({ tagName: 'svg' }));
    return control;
  });
  const elements = {
    '.contact-form': form, '.contact-fields': new Element(), '.contact-send': new Element({ disabled: true }),
    '.contact-send-text': new Element({ textContent: 'Send Message' }), '.contact-form-status': new Element({ hidden: true }),
    '.contact-flight': new Element({ style: { visibility: 'hidden' } }),
    '.contact-flight-path': new Element(), '.contact-flight-dot': new Element(), '.contact-plane': new Element(),
    '.contact-form-panel': new Element({ rect: { top: 360, bottom: 790, left: 250, right: 870, width: 620 } })
  };
  inputs.forEach(input => { elements['#' + input.id + '-error'] = new Element({ hidden: true }); });
  const section = new Element({ rect: { left: 0, top: 100, width: 1120, height: 870 } });
  section.querySelector = selector => elements[selector] || null;
  section.querySelectorAll = selector => selector === '[data-social-platform]' ? controls : [];
  const svgPath = elements['.contact-flight-path'];
  svgPath.getTotalLength = () => { if (options.brokenGeometry) throw Error('Unsupported'); return 1000; };
  if (!options.noGeometry) svgPath.getPointAtLength = distance => ({ x: 80 + distance * .8, y: 20 + distance * .25 });
  const motion = new Element({ matches: !!options.reduced });
  const mobile = new Element({ matches: false });
  const document = new Element({ hidden: false, body: new Element(), documentElement: new Element() });
  const menu = new Element({ attrs: { 'aria-expanded': 'false' }, hidden: true });
  const navigation = new Element(); navigation.contains = element => element === navigation;
  const header = new Element();
  document.querySelector = selector => ({ '#contact-main': section, '.menu-toggle': menu, '.nav-links': navigation, '.site-header': header })[selector] || null;
  document.createElement = tag => new Element({ tagName: tag.toUpperCase() });
  const window = new Element({ scrollY: 0 });
  const location = { href: 'https://portfolio.test/contact/' };
  const context = { document, window, location, URL, AbortController, Math, Number, Object, Date,
    matchMedia: query => query.includes('reduced-motion') ? motion : mobile,
    requestAnimationFrame: fn => { const id = ++state.next; state.frames.set(id, fn); return id; },
    cancelAnimationFrame: id => state.frames.delete(id),
    setTimeout: (fn, delay) => { const id = ++state.next; state.timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => state.timers.delete(id),
    fetch: (url, init) => {
      if (url === '/contact.json') return options.configFailure ? Promise.reject(Error('Offline')) : Promise.resolve({ ok: true, json: async () => options.config || {} });
      if (url === '/contact/socials.json') return Promise.resolve({ ok: true, json: async () => options.socials || {} });
      state.posts.push({ url, init });
      return options.deliver ? options.deliver(url, init) : Promise.resolve({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) });
    },
    ResizeObserver: options.noResize ? undefined : class {
      constructor(callback) { this.callback = callback; state.resizes.push(this); }
      observe() {}
      disconnect() { this.disconnected = true; }
    }
  };
  if (options.noRaf) { delete context.requestAnimationFrame; delete context.cancelAnimationFrame; }
  vm.runInNewContext(code, context, { filename: 'contact-page.js' });
  return { state, elements, inputs, section, form, controls, motion, document, window, location, menu, navigation, mobile,
    advance(ms) { state.time += ms; const frames = [...state.frames.values()]; state.frames.clear(); frames.forEach(fn => fn(state.time)); },
    resize() { state.resizes.filter(item => !item.disconnected).forEach(item => item.callback()); },
    fill(values = { firstName: 'Ada', lastName: '', email: 'ada@visitor.test', message: 'A useful AI project.' }) { inputs.forEach(input => { input.value = values[input.name] || ''; }); },
    submit() { return form.emit('submit', { preventDefault() {} }); }
  };
}

(async () => {
  for (const options of [{}, { configFailure: true }, { config: { email: 'nadeeshan@example.com' } }, { config: { endpoint: 'http://service.test/send' } }, { config: { endpoint: 'https://user:secret@service.test/send' } }]) {
    const h = harness(options); await settle(); h.fill(); await h.submit();
    assert.equal(h.elements['.contact-send'].disabled, true); assert.equal(h.state.posts.length, 0);
  }
  const validation = harness({ config: { endpoint: 'https://messages.owner.test/contact' } }); await settle();
  await validation.submit(); assert.equal(validation.state.focus, 'contact-first-name'); assert.equal(validation.state.posts.length, 0);
  assert.equal(validation.inputs[0].attrs['aria-invalid'], 'true');
  await validation.inputs[0].emit('input'); assert.equal(validation.inputs[0].attrs['aria-invalid'], undefined);
  validation.fill({ firstName: 'Ada', email: 'broken', message: 'Hello' }); await validation.submit(); assert.equal(validation.state.focus, 'contact-email');
  const draft = harness({ config: { email: 'hello@owner.test' } }); await settle(); draft.fill({ firstName: 'Ada & Grace', lastName: 'Lee', email: 'ada@visitor.test', message: 'AI & automation\nNext idea?' }); await draft.submit();
  assert.match(draft.location.href, /^mailto:hello%40owner\.test\?subject=/); assert.match(draft.location.href, /%26/); assert.match(draft.location.href, /%0A/);
  assert.match(draft.elements['.contact-form-status'].textContent, /draft/); assert.equal(draft.state.posts.length, 0); assert.equal(draft.state.resets, 0);
  let finish;
  const success = harness({ config: { endpoint: 'https://messages.owner.test/contact' }, deliver: () => new Promise(resolve => { finish = resolve; }) }); await settle(); success.fill();
  const pending = success.submit(); await success.submit(); assert.equal(success.state.posts.length, 1); assert.equal(success.elements['.contact-fields'].disabled, true);
  assert.equal(success.state.posts[0].init.credentials, 'omit'); assert.equal(JSON.parse(success.state.posts[0].init.body).lastName, '');
  finish({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ success: true }) }); await pending;
  assert.equal(success.state.resets, 1); assert.equal(success.elements['.contact-send'].disabled, false); assert.equal(success.state.timers.size, 0);
  assert.match(success.elements['.contact-form-status'].textContent, /was sent/);
  for (const deliver of [() => Promise.reject(Error('Offline')), async () => ({ ok: false }), async () => ({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ success: false }) })]) {
    const h = harness({ config: { endpoint: 'https://messages.owner.test/contact' }, deliver }); await settle(); h.fill(); await h.submit();
    assert.equal(h.state.resets, 0); assert.equal(h.inputs[3].value, 'A useful AI project.'); assert.match(h.elements['.contact-form-status'].textContent, /could not/); assert.equal(h.elements['.contact-fields'].disabled, false);
  }
  const links = harness({ socials: { linkedin: 'https://www.linkedin.com/in/owner', facebook: 'javascript:alert(1)', x: 'https://attacker.test/profile', whatsapp: 'https://user:secret@wa.me/123' } }); await settle();
  assert.equal(links.controls[1].tagName, 'A'); assert.equal(links.controls[1].target, '_blank'); assert.equal(links.controls[1].rel, 'noopener noreferrer'); assert.match(links.controls[1].attrs['aria-label'], /new tab/);
  for (const index of [0, 2, 3]) assert.equal(links.controls[index].tagName, 'BUTTON');
  const flight = harness(); await settle(); flight.advance(0); flight.advance(1490); assert.equal(flight.elements['.contact-flight'].style.visibility, 'hidden');
  flight.advance(110); assert.equal(flight.section.dataset.contactFlight, 'appearing'); assert.ok(flight.elements['.contact-flight-dot'].style.opacity > 0);
  flight.advance(950); assert.equal(flight.section.dataset.contactFlight, 'traveling'); const drawn = flight.elements['.contact-flight-path'].style.strokeDashoffset;
  assert.ok(drawn > 0 && drawn < 1000); await flight.document.emit('visibilitychange');
  flight.document.hidden = true; await flight.document.emit('visibilitychange'); flight.advance(10000);
  assert.equal(flight.elements['.contact-flight-path'].style.strokeDashoffset, drawn);
  flight.document.hidden = false; await flight.document.emit('visibilitychange'); flight.advance(0); flight.advance(3000); assert.equal(flight.section.dataset.contactFlight, 'settling');
  flight.advance(500); assert.equal(flight.section.dataset.contactFlight, 'erasing'); assert.ok(flight.elements['.contact-flight-path'].style.strokeDashoffset > 0);
  flight.advance(600); assert.equal(flight.section.dataset.contactFlight, 'complete'); assert.equal(flight.state.frames.size, 0);
  await flight.window.emit('scroll'); await flight.document.emit('visibilitychange'); assert.equal(flight.state.frames.size, 0); assert.ok(flight.state.resizes.every(item => item.disconnected));
  const resize = harness(); resize.advance(0); resize.advance(2700); const offset = resize.elements['.contact-flight-path'].style.strokeDashoffset;
  resize.section.rect.width = 327; resize.elements['.contact-form-panel'].rect.right = 327; resize.resize();
  assert.match(resize.elements['.contact-flight-path'].attrs.d, /^M18 20/); assert.match(resize.elements['.contact-plane'].attrs.transform, /scale\(0\.62\)/); assert.equal(resize.elements['.contact-flight-path'].style.strokeDashoffset, offset);
  const reduced = harness({ reduced: true }); assert.equal(reduced.state.frames.size, 0); assert.equal(reduced.section.dataset.contactFlight, 'complete');
  reduced.motion.matches = false; await reduced.motion.emit('change'); assert.equal(reduced.state.frames.size, 0);
  for (const options of [{ noGeometry: true }, { brokenGeometry: true }, { noRaf: true }]) { const h = harness(options); assert.equal(h.section.dataset.contactFlight, 'complete'); assert.equal(h.state.frames.size, 0); }
  const menu = harness(); await menu.menu.emit('click'); assert.equal(menu.menu.attrs['aria-expanded'], 'true');
  await menu.document.emit('keydown', { key: 'Escape' }); assert.equal(menu.menu.attrs['aria-expanded'], 'false');
  await menu.menu.emit('click'); await menu.navigation.emit('click', { target: { closest: () => true } }); assert.equal(menu.menu.attrs['aria-expanded'], 'false');
  console.log('Contact page lifecycle checks passed: safe configuration, validation, encoded drafts, delivery success/failure, duplicate-submit protection, social destinations, one-time flight, hidden-page pause, resize, reduced motion, API fallbacks and mobile menu.');
})().catch(error => { console.error(error); process.exitCode = 1; });
