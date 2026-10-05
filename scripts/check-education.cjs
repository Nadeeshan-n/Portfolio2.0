'use strict';
// Behavioral checks with a mocked DOM; no browser rendering or certificate requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const code = fs.readFileSync(path.join(__dirname, '../dist/education/education.js'), 'utf8');
const sourceData = JSON.parse(fs.readFileSync(path.join(__dirname, '../dist/education/education.json'), 'utf8'));

function harness(options = {}) {
  const state = { focus: null, frames: [], resizeObservers: [], globalEvents: {} };
  class Element {
    constructor(props = {}) {
      Object.assign(this, { attrs: {}, events: {}, dataset: {}, selectors: {}, lists: {}, textContent: '', hidden: false, disabled: false }, props);
      const classes = new Set();
      this.classList = {
        add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name),
        toggle: (name, value) => { const enabled = value === undefined ? !classes.has(name) : value; if (enabled) classes.add(name); else classes.delete(name); return enabled; }
      };
    }
    querySelector(selector) { return this.selectors[selector] || null; }
    querySelectorAll(selector) { return this.lists[selector] || []; }
    addEventListener(name, callback) { (this.events[name] ||= []).push(callback); }
    emit(name, event = {}) { for (const callback of this.events[name] || []) callback(event); }
    setAttribute(name, value) { this.attrs[name] = String(value); }
    getAttribute(name) { return this.attrs[name]; }
    removeAttribute(name) { delete this.attrs[name]; if (name === 'src') this.src = ''; }
    focus() { state.focus = this; }
    contains(node) { return node === this; }
    getBoundingClientRect() { return this.rect; }
    closest() { return this.parent; }
  }
  const header = new Element(), menu = new Element(), navigation = new Element();
  menu.setAttribute('aria-expanded', 'false');
  const mainLink = new Element(); navigation.lists.a = [mainLink];
  const map = new Element({ rect: { left: 100, top: 250, width: 1034, height: 1330 } });
  const ink = new Element(), branchInk = new Element(), svg = new Element();
  svg.selectors = { '.route-ink': ink, '.route-branches': branchInk }; map.selectors['.journey-route'] = svg;
  const coordinates = options.stacked ? [[14,20,345],[14,420,620],[14,690,980],[14,1050,1330]] : [[132,20,345],[270,420,620],[80,690,980],[210,1050,1330]];
  const stops = coordinates.map(([x,y,bottom]) => {
    const stop = new Element({ rect: { left: 100+x+44, top: 250+y, right: 1000, bottom: 250+bottom } });
    const node = new Element({ parent: stop, rect: { left: 100+x-5, top: 250+y-5, width: 10, height: 10 } });
    stop.selectors['.route-node'] = node;
    return stop;
  });
  const stages = stops.slice(1,4);
  stages.forEach((stage,index) => {
    const count = [1,3,2][index];
    const learning = Array.from({ length: count }, (_,item) => {
      const top = stage.rect.top + 70 + (options.stacked ? item * 85 : 0);
      const left = stage.rect.left + (options.stacked ? 0 : item * 210);
      const leaf = new Element({ rect: { top, left } });
      leaf.selectors['.mini-node'] = new Element({ rect: { left: left+2, top: top+28, width: 5, height: 5 } });
      return leaf;
    });
    stage.lists['.learning-node'] = learning;
  });
  map.lists = { '.route-node': stops.map(stop => stop.selectors['.route-node']), '.journey-stop': stops, '.learning-stage': stages };
  const data = JSON.parse(JSON.stringify(sourceData));
  if (options.images) data.certificates[0].images = options.images;
  if (options.title) data.certificates[0].title = options.title;
  const triggers = data.certificates.map(record => new Element({ dataset: { certificate: record.id }, disabled: true }));
  const dialog = new Element({ open: false, rect: { left: 200, right: 800, top: 100, bottom: 650 } });
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.emit('close'); };
  if (options.noDialog) dialog.showModal = undefined;
  const modal = {};
  for (const selector of ['.certificate-close','#certificate-modal-title','.certificate-modal-institution','.certificate-modal-meta','.certificate-modal-skills','.certificate-no-image','.certificate-gallery','.certificate-image','.certificate-image-error','.certificate-gallery-controls','.certificate-previous','.certificate-next','.certificate-image-position']) {
    modal[selector] = new Element();
  }
  dialog.selectors = modal;
  const document = new Element({ hidden: false, body: new Element() });
  document.selectors = {
    '.site-header': header, '.menu-toggle': menu, '.nav-links': navigation, '.education-year': new Element(), '.journey-map': map,
    '#certificate-dialog': dialog, '#education-data': new Element({ textContent: options.badData ? '{' : JSON.stringify(data) })
  };
  document.lists['.certificate-trigger'] = triggers;
  const breakpoint = new Element({ matches: false });
  const context = {
    document, URL, location: { href: 'https://portfolio.test/education/', origin: 'https://portfolio.test' }, scrollY: 0,
    matchMedia: () => breakpoint,
    addEventListener: (name, callback) => { (state.globalEvents[name] ||= []).push(callback); },
    requestAnimationFrame: callback => { state.frames.push(callback); return state.frames.length; },
    ResizeObserver: class { constructor(callback) { this.callback = callback; state.resizeObservers.push(this); } observe() {} }
  };
  context.window = context;
  vm.runInNewContext(code, context, { filename: 'education.js' });
  const flush = () => { const frames = state.frames.splice(0); frames.forEach(callback => callback()); };
  flush();
  return { state, document, menu, navigation, map, svg, ink, branchInk, stops, stages, triggers, dialog, modal, data, breakpoint, flush };
}

let count = 0;
function check(name, fn) { fn(); count++; console.log('PASS ' + name); }
check('All six records open their own metadata without invented certificate images', () => {
  const h = harness();
  assert.equal(h.triggers.length, 6);
  h.triggers.forEach((trigger,index) => {
    assert.equal(trigger.disabled, false); trigger.emit('click');
    assert.equal(h.dialog.open, true);
    assert.equal(h.modal['#certificate-modal-title'].textContent, h.data.certificates[index].title);
    assert.equal(h.modal['.certificate-modal-institution'].textContent, h.data.certificates[index].institution);
    assert.equal(h.modal['.certificate-modal-meta'].textContent, `Certificate · ${h.data.certificates[index].year}`);
    assert.equal(h.modal['.certificate-gallery'].hidden, true);
    assert.equal(h.modal['.certificate-no-image'].hidden, false);
    assert.equal(h.modal['.certificate-image'].src, '');
    h.modal['.certificate-close'].emit('click');
    assert.equal(h.state.focus, trigger);
  });
});
check('Native dialog cancellation closes, unlocks scrolling and restores the opener', () => {
  const h = harness(); h.triggers[2].emit('click');
  assert.equal(h.state.focus, h.modal['.certificate-close']);
  assert.equal(h.document.body.classList.contains('certificate-open'), true);
  let prevented = false; h.dialog.emit('cancel', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(h.dialog.open, false);
  assert.equal(h.document.body.classList.contains('certificate-open'), false);
  assert.equal(h.state.focus, h.triggers[2]);
});
check('Backdrop clicks close; clicks in the dialog padding and outward drags do not', () => {
  const h = harness(); h.triggers[0].emit('click');
  const inside = { target: h.dialog, clientX: 250, clientY: 150 };
  const outside = { target: h.dialog, clientX: 150, clientY: 150 };
  h.dialog.emit('pointerdown', inside); h.dialog.emit('click', inside); assert.equal(h.dialog.open, true);
  h.dialog.emit('pointerdown', inside); h.dialog.emit('click', outside); assert.equal(h.dialog.open, true);
  h.dialog.emit('pointerdown', outside); h.dialog.emit('click', outside); assert.equal(h.dialog.open, false);
});
check('Multi-image galleries respect endpoints and reset on a different certificate', () => {
  const h = harness({ images: [{src:'/education/certificates/one.png'},{src:'/education/certificates/two.png'}] });
  h.triggers[0].emit('click');
  assert.equal(h.modal['.certificate-image'].src, 'https://portfolio.test/education/certificates/one.png');
  assert.equal(h.modal['.certificate-previous'].disabled, true);
  h.modal['.certificate-next'].emit('click'); h.modal['.certificate-next'].emit('click');
  assert.equal(h.modal['.certificate-image-position'].textContent, '2 / 2');
  assert.equal(h.modal['.certificate-next'].disabled, true);
  h.modal['.certificate-previous'].emit('click'); assert.equal(h.modal['.certificate-image-position'].textContent, '1 / 2');
  h.modal['.certificate-close'].emit('click'); h.triggers[1].emit('click');
  assert.equal(h.modal['.certificate-gallery'].hidden, true); assert.equal(h.modal['.certificate-image'].src, '');
});
check('Unsafe image schemes are excluded and text remains text', () => {
  const h = harness({ images: [{src:'javascript:alert(1)'},{src:'data:text/html,unsafe'}], title:'<img src=x onerror=alert(1)>' });
  h.triggers[0].emit('click');
  assert.equal(h.modal['.certificate-no-image'].hidden, false);
  assert.equal(h.modal['#certificate-modal-title'].textContent, '<img src=x onerror=alert(1)>');
});
check('Failed certificate images show a message and leave gallery navigation usable', () => {
  const h = harness({ images: [{src:'/one.png'},{src:'/two.png'}] }); h.triggers[0].emit('click');
  h.modal['.certificate-image'].emit('error');
  assert.equal(h.modal['.certificate-image'].hidden, true); assert.equal(h.modal['.certificate-image-error'].hidden, false);
  h.modal['.certificate-next'].emit('click');
  assert.equal(h.modal['.certificate-image'].hidden, false); assert.equal(h.modal['.certificate-image-error'].hidden, true);
});
check('Desktop circuit elbows use inter-module whitespace and reach every learning node', () => {
  const h = harness();
  const elbows = [...h.ink.attrs.d.matchAll(/Q[-.\d]+ ([-.\d]+) [-.\d]+ [-.\d]+/g)];
  assert.equal(elbows.length, 6);
  elbows.forEach((elbow,index) => {
    const preceding = h.stops[Math.floor(index / 2)].rect.bottom - h.map.rect.top;
    const nextNode = h.stops[Math.floor(index / 2) + 1].selectors['.route-node'].rect;
    const arrival = nextNode.top + nextNode.height / 2 - h.map.rect.top;
    assert.ok(Number(elbow[1]) > preceding && Number(elbow[1]) < arrival, 'Each elbow belongs in the gap, away from academic text');
  });
  assert.equal((h.branchInk.attrs.d.match(/M/g)||[]).length, 6);
  assert.match(h.svg.attrs.viewBox, /^0 0 1034 1330$/);
});
check('Stacked circuit geometry remains a single route and updates after reflow', () => {
  const h = harness({ stacked: true });
  assert.equal(h.ink.attrs.d.includes('Q'), false);
  assert.match(h.ink.attrs.d, /L14 1050$/);
  h.map.rect.width = 360; h.state.resizeObservers[0].callback(); h.flush();
  assert.equal(h.svg.attrs.viewBox, '0 0 360 1330');
});
check('Page visibility pauses decorative motion; mobile menu closes on breakpoint changes', () => {
  const h = harness(); h.document.hidden = true; h.document.emit('visibilitychange');
  assert.equal(h.document.body.classList.contains('motion-paused'), true);
  h.document.hidden = false; h.document.emit('visibilitychange'); assert.equal(h.document.body.classList.contains('motion-paused'), false);
  h.menu.emit('click'); assert.equal(h.navigation.classList.contains('open'), true);
  h.breakpoint.emit('change'); assert.equal(h.navigation.classList.contains('open'), false);
});
check('Unsupported dialogs and malformed data retain readable, disabled certificate controls', () => {
  for (const options of [{noDialog:true},{badData:true}]) {
    const h = harness(options); assert.equal(h.triggers.every(trigger => trigger.disabled), true);
    assert.notEqual(h.ink.attrs.d, undefined);
  }
});
console.log(`${count} Education behavior checks passed. Browser rendering remains unverified.`);
