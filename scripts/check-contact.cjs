'use strict';

// Source-level lifecycle checks. These do not substitute for browser visual QA.
// Every request is mocked: this script never sends a real contact message.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const code = fs.readFileSync(path.join(__dirname, '../dist/contact.js'), 'utf8');

async function settle() { for (let i = 0; i < 12; i++) await Promise.resolve(); }

function harness(options = {}) {
  const state = { focus: null, resets: 0, posts: [], samples: [], frames: new Map(), timers: new Map(), time: 0, next: 0, observers: [], resize: [] };
  class Element {
    constructor(props = {}) { Object.assign(this, { attrs: {}, style: {}, dataset: {}, events: {}, hidden: false, textContent: '', disabled: false, value: '' }, props); }
    addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }
    emit(type, event = {}) { return Promise.all((this.events[type] || []).map(fn => fn(event))); }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    removeAttribute(name) { delete this.attrs[name]; }
    setCustomValidity(message) { this.customError = message; }
    focus() { state.focus = this.id; }
    getBoundingClientRect() { return this.rect; }
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
  const elements = {
    '.contact-form': form, '.contact-fields': new Element(), '.contact-send': new Element({ disabled: true }),
    '.contact-send-text': new Element({ textContent: 'Send Message' }), '.contact-links': new Element({ hidden: true }),
    '.contact-form-status': new Element({ hidden: true }), '.contact-email-link': new Element({ hidden: true }),
    '.contact-flight': new Element({ style: { visibility: 'hidden' } }), '.contact-flight-path': new Element(), '.contact-plane': new Element(),
    '.contact-intro': new Element({ rect: { top: 188, bottom: 465, left: 100, right: 510, width: 410 } }),
    '.contact-form-panel': new Element({ rect: { top: 188, bottom: 738, left: 570, right: 1134, width: 564 } })
  };
  const section = new Element({ dataset: { contactActive: 'false' }, rect: { top: 100, left: 100, width: 1034, height: 734 } });
  inputs.forEach(input => { elements['#' + input.id + '-error'] = new Element({ hidden: true }); });
  section.querySelector = selector => elements[selector] || null;
  const svgPath = elements['.contact-flight-path'];
  svgPath.getTotalLength = () => { if (options.brokenPath) throw Error('Unsupported SVG geometry'); return 1000; };
  if (!options.noGeometry) svgPath.getPointAtLength = distance => { state.samples.push(distance); return { x: distance * .9 + 24, y: 44 + distance * .06 }; };
  if (options.stacked) {
    section.rect = { top: 100, left: 24, width: 700, height: 1050 };
    elements['.contact-intro'].rect = { top: 156, bottom: 410, left: 24, right: 690, width: 666 };
    elements['.contact-form-panel'].rect = { top: 448, bottom: 1080, left: 24, right: 724, width: 700 };
  }
  const document = new Element({ hidden: false }); document.querySelector = selector => selector === '#contact' ? section : null;
  const motion = new Element({ matches: !!options.reduced });
  const location = { href: 'https://portfolio.test/' };
  const context = { document, location, URL, AbortController, Math, Number, Object,
    matchMedia: () => motion,
    requestAnimationFrame: fn => { const id = ++state.next; state.frames.set(id, fn); return id; },
    cancelAnimationFrame: id => state.frames.delete(id),
    setTimeout: (fn, delay) => { const id = ++state.next; state.timers.set(id, { fn, delay }); return id; },
    clearTimeout: id => state.timers.delete(id),
    fetch: (url, init) => {
      if (url === 'contact.json') return options.configFailure ? Promise.reject(Error('Offline')) : Promise.resolve({ ok: true, json: async () => options.config || { email: null, endpoint: null } });
      state.posts.push({ url, init });
      return options.deliver ? options.deliver(url, init) : Promise.resolve({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) });
    },
    IntersectionObserver: options.noObserver ? undefined : class {
      constructor(callback) { this.callback = callback; state.observers.push(this); }
      observe(target) { this.target = target; }
    },
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; state.resize.push(this); }
      observe(target) { this.target = target; }
      disconnect() { this.disconnected = true; }
    }
  };
  if (options.noRaf) { delete context.requestAnimationFrame; delete context.cancelAnimationFrame; }
  vm.runInNewContext(code, context, { filename: 'contact.js' });
  return {
    state, section, inputs, elements, form, motion, document, location,
    enter(ratio = .5) { state.observers[0].callback([{ target: section, isIntersecting: ratio > 0, intersectionRatio: ratio }]); },
    advance(ms) { state.time += ms; const callbacks = [...state.frames.values()]; state.frames.clear(); callbacks.forEach(fn => fn(state.time)); },
    resize() { state.resize.forEach(observer => { if (!observer.disconnected) observer.callback(); }); },
    fill(values = { firstName: 'Ada', lastName: '', email: 'ada@visitor.test', message: 'A practical AI project.' }) { inputs.forEach(input => { input.value = values[input.name] || ''; }); },
    submit() { return form.emit('submit', { preventDefault() {} }); }
  };
}

let checks = 0;
async function check(name, fn) { await fn(); checks++; process.stdout.write('PASS ' + name + '\n'); }

(async () => {
  await check('Unconfigured delivery cannot submit or invent a recipient', async () => {
    const h = harness(); await settle(); h.fill(); await h.submit();
    assert.equal(h.elements['.contact-send'].disabled, true);
    assert.equal(h.elements['.contact-email-link'].hidden, true);
    assert.equal(h.state.posts.length, 0); assert.equal(h.state.resets, 0);
    assert.equal(h.elements['.contact-links'].hidden, true);
  });
  await check('Missing config and unsafe/example targets stay pending', async () => {
    for (const options of [{ configFailure: true }, { config: { email: 'nadeeshan@example.com' } }, { config: { endpoint: 'http://service.test/send' } }, { config: { endpoint: 'https://user:secret@service.test/send' } }, { config: { endpoint: 'javascript:alert(1)' } }]) {
      const h = harness(options); await settle(); h.fill(); await h.submit();
      assert.equal(h.elements['.contact-send'].disabled, true); assert.equal(h.state.posts.length, 0);
    }
  });
  await check('Required field errors identify and focus the first field', async () => {
    const h = harness({ config: { email: 'developer@owner.test' } }); await settle(); await h.submit();
    assert.equal(h.state.focus, 'contact-first-name'); assert.equal(h.inputs[0].attrs['aria-invalid'], 'true');
    assert.equal(h.inputs[2].attrs['aria-invalid'], 'true'); assert.equal(h.inputs[3].attrs['aria-invalid'], 'true');
    assert.equal(h.inputs[1].attrs['aria-invalid'], undefined); assert.equal(h.state.posts.length, 0);
    h.inputs[0].value = 'Ada'; await h.inputs[0].emit('input');
    assert.equal(h.inputs[0].attrs['aria-invalid'], undefined); assert.equal(h.elements['#contact-first-name-error'].hidden, true);
  });
  await check('Malformed visitor email cannot leave the form', async () => {
    const h = harness({ config: { email: 'developer@owner.test' } }); await settle(); h.fill(); h.inputs[2].value = 'not-an-email'; await h.submit();
    assert.equal(h.state.focus, 'contact-email'); assert.match(h.elements['#contact-email-error'].textContent, /valid email/);
    assert.equal(h.location.href, 'https://portfolio.test/');
  });
  await check('Mail mode encodes a draft and never reports actual delivery', async () => {
    const h = harness({ config: { email: 'developer+portfolio@owner.test' } }); await settle();
    h.fill({ firstName: 'Ada & Grace', lastName: '', email: 'ada@visitor.test', message: 'AI? x=1 & y=2\n{ code } #message' }); await h.submit();
    const mail = new URL(h.location.href);
    assert.equal(decodeURIComponent(mail.pathname), 'developer+portfolio@owner.test');
    assert.equal(mail.searchParams.get('subject'), 'Portfolio message from Ada & Grace');
    assert.equal(mail.searchParams.get('body'), 'Name: Ada & Grace\nEmail: ada@visitor.test\n\nAI? x=1 & y=2\n{ code } #message');
    assert.match(h.elements['.contact-form-status'].textContent, /draft/); assert.doesNotMatch(h.elements['.contact-form-status'].textContent, /was sent/);
    assert.equal(h.state.posts.length, 0); assert.equal(h.state.resets, 0); assert.equal(h.elements['.contact-email-link'].hidden, false);
    assert.equal(h.elements['.contact-links'].hidden, false);
  });
  await check('Endpoint mode sends one JSON request and restores its controls', async () => {
    let finish;
    const h = harness({ config: { endpoint: 'https://messages.owner.test/contact' }, deliver: () => new Promise(resolve => { finish = resolve; }) }); await settle(); h.fill();
    const pending = h.submit(); await settle(); await h.submit();
    assert.equal(h.state.posts.length, 1); assert.equal(h.elements['.contact-send'].disabled, true); assert.equal(h.elements['.contact-fields'].disabled, true);
    assert.equal(h.form.attrs['aria-busy'], 'true');
    const req = h.state.posts[0]; assert.equal(req.init.credentials, 'omit'); assert.equal(req.init.method, 'POST');
    assert.deepEqual(JSON.parse(req.init.body), { firstName: 'Ada', lastName: '', email: 'ada@visitor.test', message: 'A practical AI project.' });
    finish({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: true }) }); await pending;
    assert.equal(h.state.resets, 1); assert.equal(h.elements['.contact-send'].disabled, false); assert.equal(h.elements['.contact-fields'].disabled, false);
    assert.equal(h.form.attrs['aria-busy'], undefined); assert.equal(h.state.timers.size, 0); assert.match(h.elements['.contact-form-status'].textContent, /was sent/);
  });
  await check('Transport and service failures retain the message for retry', async () => {
    const failures = [() => Promise.reject(Error('Offline')), () => Promise.resolve({ ok: false }), () => Promise.resolve({ ok: true, headers: { get: () => 'application/json' }, json: async () => ({ ok: false }) })];
    for (const deliver of failures) {
      const h = harness({ config: { endpoint: 'https://messages.owner.test/contact' }, deliver }); await settle(); h.fill(); await h.submit();
      assert.equal(h.state.resets, 0); assert.equal(h.inputs[3].value, 'A practical AI project.'); assert.equal(h.elements['.contact-send'].disabled, false);
      assert.equal(h.elements['.contact-fields'].disabled, false); assert.match(h.elements['.contact-form-status'].textContent, /could not be sent/);
    }
  });
  await check('Flight starts empty, waits, draws, settles and erases backwards once', async () => {
    const h = harness(); await settle(); const flight = h.elements['.contact-flight'], p = h.elements['.contact-flight-path'];
    assert.equal(flight.style.visibility, 'hidden'); h.enter(.1); assert.equal(h.state.frames.size, 0);
    h.enter(.5); h.advance(0); h.advance(399); assert.equal(flight.style.visibility, 'hidden');
    h.advance(1); assert.equal(flight.style.visibility, 'visible'); assert.equal(Number(p.style.strokeDashoffset), 1000);
    h.advance(1900); const midpoint = Number(p.style.strokeDashoffset); assert(Math.abs(midpoint - 500) < 1); assert(h.state.samples.some(distance => Math.abs(distance - 500) < 1));
    h.advance(1900); assert.equal(Number(p.style.strokeDashoffset), 0); h.advance(550); assert.equal(Number(p.style.strokeDashoffset), 0);
    h.advance(325); assert(Math.abs(Number(p.style.strokeDashoffset) - 500) < 1); h.advance(325);
    assert.equal(flight.style.visibility, 'hidden'); assert.equal(h.section.dataset.contactFlight, 'complete'); assert.equal(h.state.frames.size, 0);
    assert.equal(h.state.resize[0].disconnected, true); const calls = h.state.samples.length;
    h.enter(0); h.enter(.5); h.advance(10000); assert.equal(h.state.samples.length, calls); assert.equal(h.state.frames.size, 0);
  });
  await check('Offscreen and hidden-page pauses preserve the active flight time', async () => {
    const h = harness(); h.enter(); h.advance(0); h.advance(2300); const p = h.elements['.contact-flight-path'], offset = p.style.strokeDashoffset;
    h.enter(0); assert.equal(h.section.dataset.contactActive, 'false'); h.advance(10000); assert.equal(p.style.strokeDashoffset, offset);
    h.enter(); h.advance(0); assert.equal(p.style.strokeDashoffset, offset); h.advance(100); assert(Number(p.style.strokeDashoffset) < Number(offset));
    h.document.hidden = true; await h.document.emit('visibilitychange'); const paused = p.style.strokeDashoffset;
    h.advance(10000); assert.equal(p.style.strokeDashoffset, paused); assert.equal(h.state.frames.size, 0);
    h.document.hidden = false; await h.document.emit('visibilitychange'); h.advance(0); assert.equal(p.style.strokeDashoffset, paused);
  });
  await check('Reduced motion and unsupported APIs preserve the static Contact section', async () => {
    for (const options of [{ reduced: true }, { noGeometry: true }, { noObserver: true }, { noRaf: true }, { brokenPath: true }]) {
      const h = harness(options); if (!options.noObserver) h.enter(); await settle();
      assert.equal(h.elements['.contact-flight'].style.visibility, 'hidden'); assert.equal(h.section.dataset.contactFlight, 'complete'); assert.equal(h.state.frames.size, 0);
    }
    const h = harness(); h.enter(); h.advance(0); h.advance(1800); h.motion.matches = true; await h.motion.emit('change');
    assert.equal(h.section.dataset.contactActive, 'false'); assert.equal(h.section.dataset.contactFlight, 'complete');
    h.motion.matches = false; await h.motion.emit('change'); h.advance(10000); assert.equal(h.state.frames.size, 0);
  });
  await check('Stacked tablet routing and live resize use layout geometry', async () => {
    const h = harness({ stacked: true }); h.enter(); h.advance(0); h.advance(2300);
    const p = h.elements['.contact-flight-path']; assert.match(p.attrs.d, /^M18 30/); assert.match(h.elements['.contact-plane'].attrs.transform, /scale\(0\.7\)/);
    const offset = p.style.strokeDashoffset;
    h.section.rect.width = 327; h.elements['.contact-form-panel'].rect.right = 351; h.resize();
    assert.equal(p.style.strokeDashoffset, offset); assert.match(p.attrs.d, /^M18 30/); assert.equal(h.elements['.contact-flight'].attrs.viewBox, '0 0 327 1050');
    const desktop = harness(); desktop.enter(); desktop.advance(0); desktop.advance(800);
    assert.match(desktop.elements['.contact-flight-path'].attrs.d, /^M24 44/); assert.match(desktop.elements['.contact-plane'].attrs.transform, /scale\(1\)/);
  });
  process.stdout.write('\n' + checks + ' Contact lifecycle checks passed; browser visual QA remains separate.\n');
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
