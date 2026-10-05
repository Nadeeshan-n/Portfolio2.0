(() => {
  'use strict';
  const hero = document.querySelector('#viewport-1-winner-hero-art');
  const image = hero?.querySelector('img');
  const svg = hero?.querySelector('.hero-motion');
  const staticArtwork = () => { if (hero) hero.dataset.reveal = 'static'; };
  if (!image || !svg || !window.matchMedia || !window.IntersectionObserver) {
    staticArtwork();
    return;
  }

  try {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const construction = svg.querySelector('.hero-construction');
    const strokes = [...svg.querySelectorAll('.hero-build-stroke')];
    const fills = [...svg.querySelectorAll('.hero-build-fill')];
    const blink = svg.querySelector('.hero-eye-blink');
    const eyes = [...svg.querySelectorAll('.hero-eye-ink')];
    const database = svg.querySelector('.hero-database-activity');
    const cursor = svg.querySelector('.hero-code-cursor');
    const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
    const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
    const translate = (x, y) => 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')';
    const BUILD_END = 9.9;
    const FLOW_START = BUILD_END + .8;
    const draws = [...strokes, ...fills].map(node => {
      const width = node.dataset.width ? Number(node.dataset.width) : 0;
      const length = width ? 0 : node.getTotalLength();
      if (length) {
        node.setAttribute('stroke-dasharray', length + ' ' + (length + 1));
        node.setAttribute('stroke-dashoffset', length);
      }
      return { node, start: Number(node.dataset.start), end: Number(node.dataset.end),
        width, length, progress: -1 };
    });

    // Existing small patches support fine-pointer attraction only after the build.
    const layers = [...svg.querySelectorAll('.hero-live-layer')].map(node => {
      const name = node.dataset.layer;
      const path = node.dataset.guide && svg.querySelector('#' + node.dataset.guide);
      const mask = svg.querySelector('#hero-reveal-' + name + ' .hero-draw-mask');
      const layer = {
        name, node, path, ink: node.querySelector('.hero-live-ink'),
        maxPull: Number(node.dataset.pull), x: 0, y: 0, samples: [],
        center: { x: Number(node.dataset.centerX), y: Number(node.dataset.centerY) }
      };
      if (path) {
        if (typeof path.getTotalLength !== 'function' || typeof path.getPointAtLength !== 'function') return null;
        layer.length = path.getTotalLength();
        if (mask) mask.setAttribute('stroke-dashoffset', '0');
        if (layer.maxPull) {
          for (let i = 0; i <= 24; i++) layer.samples.push(path.getPointAtLength(layer.length * i / 24));
        }
      }
      return layer;
    });
    if (!construction || !draws.length || layers.some(layer => !layer)) { staticArtwork(); return; }
    const byName = Object.fromEntries(layers.map(layer => [layer.name, layer]));
    const stage = (name, duration) => ({ name, path: svg.querySelector('#hero-flow-' + name), duration });
    // Original arrows feed cloud/network into the console, then branch to AI/DB.
    const flows = [
      { dot: svg.querySelector('[data-flow="cloud"]'), delay: 0,
        stages: [stage('cloud', 4.6), { duration: 1.2 }, stage('database', 4.6), { duration: .8 }] },
      { dot: svg.querySelector('[data-flow="network"]'), delay: 2,
        stages: [stage('network', 4.1), { duration: 1.2 }, stage('agent', 4.3), { duration: .8 }] }
    ];
    flows.forEach(flow => {
      flow.duration = flow.stages.reduce((total, s) => total + s.duration, 0);
      flow.stages.forEach(s => { if (s.path) s.length = s.path.getTotalLength(); });
    });

    let ready = image.complete && image.naturalWidth > 0;
    let inView = false;
    let activePage = true;
    let frameId = 0;
    let previousTime = null;
    let elapsed = 0;
    let complete = false;
    let blinking = false;
    let bounds, scale = 1;
    const pointer = { active: false, x: 0, y: 0 };
    const response = { code: -20, agent: -20, database: -20 };
    const canRun = () => ready && inView && activePage && !document.hidden && !reducedMotion.matches;
    const clearPointer = () => { pointer.active = false; };
    const measure = () => {
      bounds = image.getBoundingClientRect();
      scale = Math.max(.01, bounds.width / 1400);
      clearPointer();
    };
    const nearest = layer => {
      const points = layer.samples.length ? layer.samples : [layer.center];
      let best, distance = Infinity;
      for (const point of points) {
        const dx = pointer.x - point.x, dy = pointer.y - point.y;
        const d = Math.hypot(dx, dy) * scale;
        if (d < distance) { distance = d; best = { dx, dy, d }; }
      }
      return best;
    };
    const arrive = name => {
      response[name === 'cloud' || name === 'network' ? 'code' : name] = elapsed;
    };
    const nudge = (name, duration, pixels) => {
      const phase = (elapsed - response[name]) / duration;
      return phase > 0 && phase < 1 ? -pixels * Math.sin(Math.PI * phase) ** 2 : 0;
    };
    const resetLive = () => {
      flows.forEach(flow => { flow.dot.setAttribute('opacity', '0'); flow.arrival = null; });
      blink.setAttribute('opacity', '0');
      eyes.forEach(eye => eye.removeAttribute('transform'));
      database.setAttribute('opacity', '0');
      database.removeAttribute('transform');
      cursor.removeAttribute('transform');
      layers.forEach(layer => {
        layer.x = layer.y = 0;
        layer.node.setAttribute('opacity', '0');
        layer.ink.removeAttribute('transform');
      });
      response.code = response.agent = response.database = -20;
      blinking = false;
      clearPointer();
    };

    const paintBuild = () => {
      draws.forEach(draw => {
        const progress = smooth((elapsed - draw.start) / (draw.end - draw.start));
        if (progress === draw.progress) return;
        draw.progress = progress;
        if (draw.width) draw.node.setAttribute('width', (draw.width * progress).toFixed(3));
        else {
          // Opacity suppresses a zero-length cap only; dash offsets draw the ink.
          draw.node.setAttribute('opacity', progress > 0 ? '1' : '0');
          draw.node.setAttribute('stroke-dashoffset', (draw.length * (1 - progress)).toFixed(5));
        }
      });
      if (elapsed >= BUILD_END) {
        complete = true;
        construction.setAttribute('opacity', '0');
        hero.dataset.reveal = 'complete';
      }
    };
    const paintLayers = dt => {
      const easing = 1 - Math.exp(-dt / .19);
      layers.forEach(layer => {
        let targetX = 0, targetY = 0;
        if (pointer.active && finePointer.matches && layer.maxPull) {
          const near = nearest(layer);
          if (near.d > .01 && near.d < 52) {
            const amount = layer.maxPull * (1 - near.d / 52) ** 2;
            const length = Math.hypot(near.dx, near.dy);
            targetX = amount * near.dx / length;
            targetY = amount * near.dy / length;
          }
        }
        layer.x += (targetX - layer.x) * easing;
        layer.y += (targetY - layer.y) * easing;
        let x = layer.x, y = layer.y;
        if (layer.name === 'agent-antenna') y += nudge('agent', .7, .7);
        if (layer.name === 'database-light') y += nudge('database', .9, .55);
        if (layer.name === 'code-node') y += nudge('code', .7, .45);
        layer.node.setAttribute('opacity', Math.hypot(x, y) > .015 ? '1' : '0');
        layer.ink.setAttribute('transform', translate(x / scale, y / scale));
      });
    };
    const paintFlow = flow => {
      flow.dot.setAttribute('opacity', '0');
      const time = elapsed - FLOW_START - flow.delay;
      if (time < 0) return;
      const loop = Math.floor(time / flow.duration);
      let phase = time % flow.duration;
      for (let i = 0; i < flow.stages.length; i++) {
        const s = flow.stages[i];
        if (phase >= s.duration) { phase -= s.duration; continue; }
        if (s.path) {
          const progress = phase / s.duration;
          const point = s.path.getPointAtLength(s.length * smooth(progress));
          const layer = byName[s.name];
          flow.dot.setAttribute('transform', translate(point.x + layer.x / scale, point.y + layer.y / scale));
          flow.dot.setAttribute('opacity', (.82 * Math.min(1, progress / .09, (1 - progress) / .09)).toFixed(3));
          const arrival = loop + ':' + i;
          if (progress >= .985 && flow.arrival !== arrival) { arrive(s.name); flow.arrival = arrival; }
        }
        break;
      }
    };
    const paint = dt => {
      if (!complete) { paintBuild(); return; }
      paintLayers(dt);
      if (elapsed < FLOW_START) return;
      hero.dataset.flow = 'ready';
      flows.forEach(paintFlow);
      const liveTime = elapsed - FLOW_START;
      const eyePhase = liveTime % 7.6;
      if (eyePhase >= 7.25 && eyePhase <= 7.48) {
        const openness = 1 - .86 * Math.sin((eyePhase - 7.25) / .23 * Math.PI);
        blink.setAttribute('opacity', '1');
        eyes.forEach(eye => {
          const x = eye.dataset.eyeX;
          eye.setAttribute('transform', 'translate(' + x + ' 314) scale(1 ' + openness.toFixed(3) + ') translate(-' + x + ' -314)');
        });
        blinking = true;
      } else if (blinking) { blink.setAttribute('opacity', '0'); blinking = false; }
      const databasePhase = liveTime % 9.2;
      const ambient = databasePhase > 8.2 ? -3 * Math.sin((databasePhase - 8.2) * Math.PI) ** 2 : 0;
      const light = byName['database-light'];
      database.setAttribute('opacity', '.28');
      database.setAttribute('transform', translate(light.x / scale, light.y / scale + ambient + nudge('database', .9, .55) / scale));
      cursor.setAttribute('transform', translate(0, nudge('code', .8, .35) / scale));
    };
    const frame = timestamp => {
      frameId = 0;
      if (!canRun()) { sync(); return; }
      if (previousTime === null) previousTime = timestamp;
      if (timestamp - previousTime >= 1000 / 30) {
        const dt = Math.min(timestamp - previousTime, 100) / 1000;
        elapsed += dt;
        previousTime = timestamp;
        paint(dt);
      }
      frameId = requestAnimationFrame(frame);
    };
    const sync = () => {
      if (reducedMotion.matches) {
        // A changed preference shows static art, without restarting construction.
        complete = true;
        elapsed = Math.max(elapsed, FLOW_START);
        construction.setAttribute('opacity', '0');
        staticArtwork();
        delete hero.dataset.flow;
        resetLive();
      } else hero.dataset.reveal = complete ? 'complete' : 'building';
      if (canRun()) {
        hero.dataset.motion = 'running';
        if (!frameId) frameId = requestAnimationFrame(frame);
      } else {
        delete hero.dataset.motion;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = 0;
        previousTime = null;
        clearPointer();
      }
    };
    const observer = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      sync();
    }, { threshold: 0 });
    observer.observe(hero);
    hero.addEventListener('pointermove', event => {
      if (!complete || !canRun() || !finePointer.matches || event.pointerType === 'touch') return;
      pointer.active = true;
      pointer.x = (event.clientX - bounds.left) / scale;
      pointer.y = (event.clientY - bounds.top) / scale;
    }, { passive: true });
    hero.addEventListener('pointerleave', clearPointer, { passive: true });
    hero.addEventListener('pointercancel', clearPointer, { passive: true });
    image.addEventListener('load', () => { ready = image.naturalWidth > 0; measure(); sync(); });
    image.addEventListener('error', () => { ready = false; sync(); staticArtwork(); });
    reducedMotion.addEventListener('change', sync);
    finePointer.addEventListener('change', clearPointer);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('blur', clearPointer);
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('pagehide', () => { activePage = false; sync(); });
    window.addEventListener('pageshow', () => { activePage = true; measure(); sync(); });
    if (window.ResizeObserver) new ResizeObserver(measure).observe(image);
    resetLive();
    measure();
    sync();
  } catch (_) {
    staticArtwork();
  }
})();
