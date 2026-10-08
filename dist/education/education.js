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
  const timelineList = wrap.querySelector('.timeline-list');
  fetch('education.json')
    .then(response => {
      if (!response.ok) throw new Error(`Unable to load education.json (${response.status})`);
      return response.json();
    })
    .then(data => {
      const records = data.certificates;
      if (!Array.isArray(records)) throw new Error('education.json has no certificates array');
      const degree = data.degree || {};
      const degreeCard = wrap.querySelector('.timeline-card-degree');
      if (degreeCard) {
        degreeCard.querySelector('.timeline-year').textContent = degree.period || '';
        degreeCard.querySelector('.timeline-title').textContent = degree.title || '';
        degreeCard.querySelector('.timeline-issuer').textContent = [degree.institution, degree.location].filter(Boolean).join(' · ');
        degreeCard.querySelector('.timeline-focus').textContent = Array.isArray(degree.focus) ? degree.focus.join(' · ') : '';
      }
      const safeImage = item => {
        if (!item || typeof item.src !== 'string') return false;
        try {
          const url = new URL(item.src, location.href);
          return url.protocol === 'https:' || (url.origin === location.origin && url.protocol === 'http:');
        } catch { return false; }
      };
      // Hand-drawn sketch icons for each category card (charcoal strokes, jade accents).
      const CATEGORY_ICONS = {
        python: `<div class="python-stage" style="width:84px"><svg class="python-icon" viewBox="0 0 200 200" role="img" aria-label="Python technology illustration">
          <g class="python-float">
            <g class="python-tilt">
              <g class="python-breathe">
                <g class="python-upper">
                  <path class="python-outline python-draw" pathLength="1" d="M72 44 C90 30 112 30 122 42 C130 52 128 64 127 78 L124 104 C123 114 115 118 107 116" fill="none" stroke="#17211E" stroke-width="46" stroke-linecap="round"/>
                  <path class="python-outline python-draw" pathLength="1" d="M72 44 C90 30 112 30 122 42 C130 52 128 64 127 78 L124 104 C123 114 115 118 107 116" fill="none" stroke="#0E8F78" stroke-width="36" stroke-linecap="round"/>
                  <circle class="python-head" cx="72" cy="44" r="24" fill="#17211E"/>
                  <circle class="python-head" cx="72" cy="44" r="19" fill="#0E8F78"/>
                  <circle class="python-eye" cx="65" cy="37" r="4.5" fill="#17211E"/>
                </g>
                <g class="python-lower">
                  <path class="python-outline python-draw" pathLength="1" d="M128 156 C110 170 88 170 78 156 C70 146 72 134 73 122 L76 96 C77 86 85 82 93 84" fill="none" stroke="#17211E" stroke-width="46" stroke-linecap="round"/>
                  <path class="python-outline python-draw" pathLength="1" d="M128 156 C110 170 88 170 78 156 C70 146 72 134 73 122 L76 96 C77 86 85 82 93 84" fill="none" stroke="#E9F5EF" stroke-width="36" stroke-linecap="round"/>
                  <g class="python-hatch" stroke="#17211E" stroke-width="2" stroke-linecap="round" opacity="0.45">
                    <path d="M68 98 l12 -6"/><path d="M68 108 l12 -6"/><path d="M68 118 l12 -6"/>
                  </g>
                  <circle class="python-head" cx="128" cy="156" r="24" fill="#17211E"/>
                  <circle class="python-head" cx="128" cy="156" r="19" fill="#E9F5EF"/>
                  <circle class="python-eye" cx="135" cy="163" r="4.5" fill="#17211E"/>
                </g>
              </g>
            </g>
            <g class="python-decor">
              <circle class="python-dot d1" cx="28" cy="78" r="3.2" fill="#0E8F78"/>
              <circle class="python-dot d2" cx="172" cy="62" r="2.6" fill="#17211E"/>
              <circle class="python-dot d3" cx="164" cy="148" r="3.2" fill="#0E8F78"/>
              <circle class="python-dot d4" cx="34" cy="132" r="2.2" fill="#17211E"/>
              <path class="python-accent a1" pathLength="1" d="M22 92 C16 110 18 130 28 142" fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
              <path class="python-accent a2" pathLength="1" d="M178 96 C184 114 182 134 172 146" fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
              <path class="python-accent a3" pathLength="1" d="M148 26 l10 -8" fill="none" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round"/>
              <path class="python-accent a4" pathLength="1" d="M40 106 v12 M34 112 h12" fill="none" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round"/>
            </g>
          </g>
        </svg></div>`,
        'machine-learning': `<svg class="category-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 19l9-6M18 22l9 8M18 42l9-8M18 45l9 5M37 13l9 6M37 30l9-8M37 34l9 8M37 51l9-6"/><circle cx="13" cy="20" r="4.5"/><circle cx="13" cy="44" r="4.5"/><circle cx="32" cy="12" r="4.5"/><circle cx="32" cy="32" r="4.5" stroke="#0E8F78"/><circle cx="32" cy="52" r="4.5"/><circle cx="51" cy="20" r="4.5"/><circle cx="51" cy="44" r="4.5" stroke="#0E8F78"/></svg>`,
        'artificial-intelligence': `<svg class="category-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M32 18V11"/><circle cx="32" cy="8" r="3"/><rect x="15" y="18" width="34" height="26" rx="9"/><circle cx="25" cy="30" r="2.6" fill="#0E8F78" stroke="none"/><circle cx="39" cy="30" r="2.6" fill="#0E8F78" stroke="none"/><path d="M25 38h14"/><path d="M15 26v10M49 26v10"/></svg>`,
        linux: `<div class="linux-stage" style="width:84px"><svg class="linux-icon" viewBox="0 0 200 200" role="img" aria-label="Linux technology illustration">
          <g class="linux-float">
            <g class="linux-tilt">
              <g class="px-terminal">
                <g class="linux-terminal">
                  <rect class="linux-draw term-box" style="--d:1.5s" pathLength="1" x="16" y="64" width="46" height="38" rx="5" fill="#17211E" stroke="#0E8F78" stroke-width="2.5" stroke-opacity="0.55"/>
                  <g class="linux-fadein" style="--d:1.9s" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round" fill="none">
                    <path d="M24 84 l7 5 -7 5"/>
                  </g>
                  <rect class="term-cursor linux-fadein" style="--d:2s" x="36" y="80" width="7" height="10" fill="#0E8F78"/>
                </g>
              </g>
              <g class="px-gear">
                <g class="linux-fadein" style="--d:1.7s">
                  <g class="linux-gearspin">
                    <circle cx="163" cy="118" r="13" fill="none" stroke="#0E8F78" stroke-width="9" stroke-dasharray="5 5.21"/>
                    <circle cx="163" cy="118" r="6.5" fill="#E9F5EF" stroke="#0E8F78" stroke-width="2.5"/>
                  </g>
                </g>
              </g>
              <g class="px-penguin">
                <g class="linux-breathe">
                  <path class="linux-draw" style="--d:0s" pathLength="1" d="M100 42 C70 42 56 66 56 100 C56 140 72 168 100 168 C128 168 144 140 144 100 C144 66 130 42 100 42 Z" fill="#17211E" stroke="#17211E" stroke-width="6" stroke-linejoin="round"/>
                  <path class="linux-draw" style="--d:0.2s" pathLength="1" d="M60 102 C50 110 48 126 54 138" fill="none" stroke="#17211E" stroke-width="11" stroke-linecap="round"/>
                  <path class="linux-draw" style="--d:0.25s" pathLength="1" d="M140 102 C150 110 152 126 146 138" fill="none" stroke="#17211E" stroke-width="11" stroke-linecap="round"/>
                  <ellipse class="linux-pop" style="--d:0.95s" cx="100" cy="128" rx="29" ry="33" fill="#E9F5EF"/>
                  <path class="linux-pop" style="--d:0.8s" d="M78 68 C78 59 87 55 100 55 C113 55 122 59 122 68 C122 79 111 87 100 87 C89 87 78 79 78 68 Z" fill="#E9F5EF"/>
                  <g class="linux-fadein" style="--d:1.1s">
                    <g class="linux-eye">
                      <circle cx="89" cy="69" r="7.5" fill="#FFFFFF"/>
                      <circle cx="89" cy="70" r="3.2" fill="#17211E"/>
                    </g>
                    <g class="linux-eye" style="animation-delay:0.12s">
                      <circle cx="111" cy="69" r="7.5" fill="#FFFFFF"/>
                      <circle cx="111" cy="70" r="3.2" fill="#17211E"/>
                    </g>
                  </g>
                  <path class="linux-pop" style="--d:1.2s" d="M100 84 L109 90 L100 97 L91 90 Z" fill="#F2A93B" stroke="#17211E" stroke-width="2" stroke-linejoin="round"/>
                  <g class="linux-feet">
                    <ellipse class="linux-pop foot-l" style="--d:1.3s" cx="76" cy="164" rx="15" ry="9" fill="#F2A93B" stroke="#17211E" stroke-width="2.5"/>
                    <ellipse class="linux-pop foot-r" style="--d:1.45s" cx="124" cy="164" rx="15" ry="9" fill="#F2A93B" stroke="#17211E" stroke-width="2.5"/>
                  </g>
                </g>
              </g>
              <g class="px-decor">
                <g class="linux-fadein" style="--d:1.8s">
                  <circle class="linux-dot d1" cx="30" cy="40" r="3" fill="#0E8F78"/>
                  <circle class="linux-dot d2" cx="178" cy="80" r="2.5" fill="#17211E"/>
                  <circle class="linux-dot d3" cx="170" cy="160" r="3" fill="#0E8F78"/>
                  <circle class="linux-dot d4" cx="36" cy="150" r="2" fill="#17211E"/>
                </g>
                <path class="linux-accent a1" pathLength="1" d="M18 108 C12 124 14 142 24 154" fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
                <path class="linux-accent a2" pathLength="1" d="M184 104 C190 120 188 138 178 150" fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
                <path class="linux-accent a3" pathLength="1" d="M132 22 l10 -8" fill="none" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round"/>
              </g>
            </g>
          </g>
        </svg></div>`,
        'web-development': `<svg class="category-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 20L9 32l14 12"/><path d="M41 20l14 12-14 12"/><path d="M36 14l-8 36" stroke="#0E8F78"/></svg>`,
      };
      // Thumbnails + popup triggers are wired once after the category cards render.
      // Animated Python icon: reveal on scroll into view + subtle pointer parallax.
      // Runs after the category icons are injected; each stage initializes once.
      const initPythonIcons = () => {
        const stages = document.querySelectorAll('.python-stage:not([data-py-init])');
        if (!stages.length) return;
        stages.forEach(stage => stage.setAttribute('data-py-init', '1'));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) { entry.target.classList.add('is-inview'); io.unobserve(entry.target); }
            });
          }, { threshold: 0.3 });
          stages.forEach(stage => io.observe(stage));
        } else {
          stages.forEach(stage => stage.classList.add('is-inview'));
        }
        if (reduceMotion) return;
        stages.forEach(stage => {
          const layer = stage.querySelector('.python-float');
          if (!layer) return;
          let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
          const tick = () => {
            cx += (tx - cx) * 0.12;
            cy += (ty - cy) * 0.12;
            layer.style.translate = cx.toFixed(2) + 'px ' + cy.toFixed(2) + 'px';
            if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(tick);
            else raf = 0;
          };
          const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
          stage.addEventListener('pointermove', e => {
            const r = stage.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width - 0.5) * 10;
            ty = ((e.clientY - r.top) / r.height - 0.5) * 10;
            kick();
          });
          stage.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
        });
      };
      // Animated Linux icon: reveal on scroll into view + layered pointer parallax.
      // Runs after the category icons are injected; each stage initializes once.
      const initLinuxIcons = () => {
        const stages = document.querySelectorAll('.linux-stage:not([data-lx-init])');
        if (!stages.length) return;
        stages.forEach(stage => stage.setAttribute('data-lx-init', '1'));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) { entry.target.classList.add('is-inview'); io.unobserve(entry.target); }
            });
          }, { threshold: 0.3 });
          stages.forEach(stage => io.observe(stage));
        } else {
          stages.forEach(stage => stage.classList.add('is-inview'));
        }
        if (reduceMotion) return;
        stages.forEach(stage => {
          const layers = [
            [stage.querySelector('.px-penguin'), 2],
            [stage.querySelector('.px-terminal'), 4],
            [stage.querySelector('.px-gear'), 5],
            [stage.querySelector('.px-decor'), 6]
          ].filter(pair => pair[0]);
          if (!layers.length) return;
          let raf = 0, nx = 0, ny = 0;
          const cur = layers.map(() => ({ x: 0, y: 0 }));
          const tick = () => {
            let moving = false;
            layers.forEach((pair, i) => {
              const el = pair[0], max = pair[1], c = cur[i];
              const tx = nx * max, ty = ny * max;
              c.x += (tx - c.x) * 0.12;
              c.y += (ty - c.y) * 0.12;
              el.style.translate = c.x.toFixed(2) + 'px ' + c.y.toFixed(2) + 'px';
              if (Math.abs(tx - c.x) > 0.05 || Math.abs(ty - c.y) > 0.05) moving = true;
            });
            raf = moving ? requestAnimationFrame(tick) : 0;
          };
          const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
          stage.addEventListener('pointermove', e => {
            const r = stage.getBoundingClientRect();
            nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
            kick();
          });
          stage.addEventListener('pointerleave', () => { nx = 0; ny = 0; kick(); });
        });
      };
      const wireTriggers = () => {
        document.querySelectorAll('.timeline-media[data-category]:not([data-wired])').forEach(cell => {
          cell.dataset.wired = '1';
          const icon = CATEGORY_ICONS[cell.dataset.category];
          if (icon) {
            cell.innerHTML = icon;
            cell.classList.add('has-icon');
            return;
          }
          const certs = records.filter(record => record.category === cell.dataset.category);
          const first = certs.length && Array.isArray(certs[0].images) ? certs[0].images.find(safeImage) : null;
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
        document.querySelectorAll('.certificate-trigger[data-category]:not([data-wired])').forEach(trigger => {
          trigger.disabled = false;
          trigger.dataset.wired = '1';
          trigger.addEventListener('click', () => openCategory(trigger));
        });
        initPythonIcons();
        initLinuxIcons();
      };
      // One card per category: the card opens the popup slider at that category's certificates.
      const categories = Array.isArray(data.categories) && data.categories.length
        ? data.categories
        : [...new Set(records.map(record => record.category).filter(Boolean))].map(id => ({ id, label: id }));
      const renderCategoryCards = () => {
        timelineList.querySelectorAll('.timeline-item:not(.timeline-item-degree)').forEach(item => item.remove());
        categories.forEach(cat => {
          const certs = records.filter(record => record.category === cat.id);
          if (!certs.length) return;
          const years = certs.map(record => parseInt(record.year, 10)).filter(Number.isFinite);
          const plural = certs.length > 1;
          const label = cat.label || cat.id;
          const item = document.createElement('li');
          item.className = 'timeline-item';
          item.innerHTML = `<span class="timeline-dot" aria-hidden="true"></span><article class="timeline-card"><button class="timeline-media certificate-trigger" type="button" data-category="${cat.id}" aria-haspopup="dialog" aria-controls="certificate-dialog" aria-label="Open certificates: ${label}" tabindex="-1" disabled><span class="timeline-placeholder">Certificate<br>image</span></button><div class="timeline-content"><p class="timeline-year">${years.length ? Math.max(...years) : ''}</p><h3 class="timeline-title"></h3><p class="timeline-issuer"></p><button class="timeline-link certificate-trigger" type="button" data-category="${cat.id}" aria-haspopup="dialog" aria-controls="certificate-dialog" disabled>View certificate${plural ? 's' : ''} <span aria-hidden="true">→</span></button></div></article>`;
          const card = item.querySelector('.timeline-card');
          card.querySelector('.timeline-title').textContent = label;
          card.querySelector('.timeline-issuer').textContent = `${certs.length} certificate${plural ? 's' : ''}`;
          timelineList.append(item);
        });
        wireTriggers();
        requestTimeline();
      };
      renderCategoryCards();
  const close = dialog.querySelector('.certificate-close');
  const title = dialog.querySelector('#certificate-modal-title');
  const institution = dialog.querySelector('.certificate-modal-institution');
  const meta = dialog.querySelector('.certificate-modal-meta');
  const skills = dialog.querySelector('.certificate-modal-skills');
  const verify = dialog.querySelector('#certificate-verify');
  const noImage = dialog.querySelector('.certificate-no-image');
  const gallery = dialog.querySelector('.certificate-gallery');
  const image = dialog.querySelector('.certificate-image');
  const error = dialog.querySelector('.certificate-image-error');
  const previous = dialog.querySelector('.certificate-previous');
  const next = dialog.querySelector('.certificate-next');
  const position = dialog.querySelector('.certificate-image-position');
  let opener = null, slideRecords = [], slideIndex = 0, pointerBeganOutside = false;
  const renderSlide = () => {
    const record = slideRecords[slideIndex];
    if (!record) return;
    const first = Array.isArray(record.images) ? record.images.find(safeImage) : null;
    title.textContent = record.title || '';
    institution.textContent = record.institution || '';
    meta.textContent = `Certificate · ${record.year || ''}`;
    skills.textContent = Array.isArray(record.skills) ? record.skills.join(' · ') : '';
    if (verify) {
      if (record.credentialUrl) { verify.href = record.credentialUrl; verify.hidden = false; }
      else { verify.removeAttribute('href'); verify.hidden = true; }
    }
    gallery.hidden = !first;
    noImage.hidden = !!first;
    if (first) {
      image.hidden = false;
      error.hidden = true;
      image.alt = first.alt || `${record.title} certificate`;
      image.src = new URL(first.src, location.href).href;
    } else {
      image.removeAttribute('src');
      image.alt = '';
    }
    const multi = slideRecords.length > 1;
    previous.hidden = !multi;
    next.hidden = !multi;
    position.hidden = !multi;
    if (multi) {
      position.textContent = `${slideIndex + 1} / ${slideRecords.length}`;
      previous.disabled = slideIndex === 0;
      next.disabled = slideIndex === slideRecords.length - 1;
    }
  };
  const stepSlide = direction => {
    const nextIndex = slideIndex + direction;
    if (!dialog.open || nextIndex < 0 || nextIndex >= slideRecords.length) return;
    slideIndex = nextIndex;
    renderSlide();
    dialog.scrollTop = 0;
  };
  const dismiss = () => { if (dialog.open) dialog.close(); };
  const restore = () => {
    document.body.classList.remove('certificate-open');
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  };
  const openCategory = trigger => {
    const categoryId = trigger.dataset.category;
    if (!categoryId || dialog.open) return;
    slideRecords = records.filter(item => item.category === categoryId);
    if (!slideRecords.length) return;
    opener = trigger;
    slideIndex = 0;
    renderSlide();
    document.body.classList.add('certificate-open');
    dialog.showModal();
    dialog.scrollTop = 0;
    close.focus({ preventScroll: true });
  };
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
  previous.addEventListener('click', () => stepSlide(-1));
  next.addEventListener('click', () => stepSlide(1));
  dialog.addEventListener('keydown', event => {
    if (slideRecords.length < 2) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepSlide(-1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); stepSlide(1); }
  });
  image.addEventListener('error', () => {
    const record = slideRecords[slideIndex];
    const hasImage = record && Array.isArray(record.images) && record.images.some(safeImage);
    if (dialog.open && hasImage) { image.hidden = true; error.hidden = false; }
  });
    })
    .catch(() => {});
})();
