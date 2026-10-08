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
        python: `<div class="python-stage"><svg class="python-icon" viewBox="0 0 200 200" role="img" aria-label="Python technology illustration">
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
        'machine-learning': `<div class="ml-stage"><svg class="ml-icon" viewBox="0 0 200 200" role="img" aria-label="Machine Learning technology illustration">
          <g class="ml-float">
            <g class="px-brain">
              <g class="ml-breathe">
                <path class="ml-draw" style="--d:0s" pathLength="1" d="M100 44 C78 44 60 52 52 68 C46 80 48 92 54 100 C46 108 46 122 54 132 C62 144 78 150 94 148 C98 152 102 152 106 150 C102 146 96 140 100 128 C108 100 94 72 100 44 Z" fill="#0E8F78" stroke="#17211E" stroke-width="4" stroke-linejoin="round"/>
                <path class="ml-draw" style="--d:0.1s" pathLength="1" d="M100 44 C94 72 108 100 100 128 C96 140 102 146 106 150 C110 152 116 152 120 148 C136 150 148 142 154 128 C160 116 158 104 152 96 C158 84 154 68 144 58 C132 48 116 44 100 44 Z" fill="#E9F5EF" stroke="#17211E" stroke-width="4" stroke-linejoin="round"/>
                <g fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round" opacity="0.7">
                  <path class="ml-draw" style="--d:0.5s" pathLength="1" d="M70 70 C76 76 78 84 76 92"/>
                  <path class="ml-draw" style="--d:0.6s" pathLength="1" d="M62 104 C68 108 70 116 68 124"/>
                  <path class="ml-draw" style="--d:0.7s" pathLength="1" d="M84 118 C90 122 92 130 90 138"/>
                  <path class="ml-draw ml-fold-loop" style="--d:0.6s" pathLength="1" d="M88 62 C94 66 96 74 94 82"/>
                </g>
              </g>
            </g>
            <g class="px-network">
              <g class="ml-network" fill="none" stroke="#0E8F78" stroke-width="1.8" opacity="0.55" stroke-linecap="round">
                <path class="ml-draw" style="--d:0.7s" pathLength="1" d="M114 76 L134 66"/>
                <path class="ml-draw" style="--d:0.75s" pathLength="1" d="M114 76 L134 90"/>
                <path class="ml-draw" style="--d:0.8s" pathLength="1" d="M114 100 L134 90"/>
                <path class="ml-draw" style="--d:0.85s" pathLength="1" d="M114 100 L134 114"/>
                <path class="ml-draw" style="--d:0.9s" pathLength="1" d="M114 124 L134 114"/>
                <path class="ml-draw" style="--d:0.95s" pathLength="1" d="M114 124 L134 138"/>
                <path class="ml-draw" style="--d:1s" pathLength="1" d="M134 66 L154 78"/>
                <path class="ml-draw" style="--d:1.05s" pathLength="1" d="M134 90 L154 78"/>
                <path class="ml-draw" style="--d:1.1s" pathLength="1" d="M134 90 L154 102"/>
                <path class="ml-draw" style="--d:1.15s" pathLength="1" d="M134 114 L154 102"/>
                <path class="ml-draw" style="--d:1.2s" pathLength="1" d="M134 114 L154 126"/>
                <path class="ml-draw" style="--d:1.25s" pathLength="1" d="M134 138 L154 126"/>
              </g>
              <g stroke="#17211E" stroke-width="2">
                <g class="ml-pop" style="--d:0.9s"><g class="ml-node" style="--pd:0s"><circle cx="114" cy="76" r="6" fill="#0E8F78"/></g></g>
                <g class="ml-pop" style="--d:0.98s"><g class="ml-node" style="--pd:-0.7s"><circle cx="114" cy="100" r="6" fill="#0E8F78"/></g></g>
                <g class="ml-pop" style="--d:1.06s"><g class="ml-node" style="--pd:-1.4s"><circle cx="114" cy="124" r="6" fill="#0E8F78"/></g></g>
                <g class="ml-pop" style="--d:1.14s"><g class="ml-node" style="--pd:-2.1s"><circle cx="134" cy="66" r="6" fill="#0E8F78"/></g></g>
                <g class="ml-pop" style="--d:1.22s"><g class="ml-node" style="--pd:-0.4s"><circle cx="134" cy="90" r="6" fill="#E9F5EF"/></g></g>
                <g class="ml-pop" style="--d:1.3s"><g class="ml-node" style="--pd:-1.1s"><circle cx="134" cy="114" r="6" fill="#0E8F78"/></g></g>
                <g class="ml-pop" style="--d:1.38s"><g class="ml-node" style="--pd:-1.8s"><circle cx="134" cy="138" r="6" fill="#0E8F78"/></g></g>
                <g class="ml-pop" style="--d:1.46s"><g class="ml-node" style="--pd:-0.9s"><circle cx="154" cy="78" r="5.5" fill="#0E8F78"/></g></g>
                <g class="ml-pop" style="--d:1.54s"><g class="ml-node" style="--pd:-1.6s"><circle cx="154" cy="102" r="5.5" fill="#E9F5EF"/></g></g>
                <g class="ml-pop" style="--d:1.62s"><g class="ml-node" style="--pd:-2.4s"><circle cx="154" cy="126" r="5.5" fill="#0E8F78"/></g></g>
              </g>
              <g class="ml-fadein" style="--d:1.6s">
                <circle class="ml-signal" style="--sd:0s; offset-path: path('M114 76 L134 90 L154 102')" cx="114" cy="76" r="3.2" fill="#0E8F78"/>
                <circle class="ml-signal" style="--sd:-3s; offset-path: path('M114 124 L134 114 L154 102')" cx="114" cy="124" r="3.2" fill="#0E8F78"/>
              </g>
            </g>
            <g class="px-data">
              <g class="ml-fadein" style="--d:1.4s">
                <path d="M158 178 H192" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
                <rect class="ml-bar" style="--bd:0s" x="162" y="164" width="8" height="14" fill="#0E8F78" stroke="#17211E" stroke-width="2"/>
                <rect class="ml-bar" style="--bd:-1.2s" x="173" y="156" width="8" height="22" fill="#0E8F78" stroke="#17211E" stroke-width="2"/>
                <rect class="ml-bar" style="--bd:-2.4s" x="184" y="148" width="8" height="30" fill="#0E8F78" stroke="#17211E" stroke-width="2"/>
              </g>
            </g>
            <g class="px-decor">
              <g class="ml-fadein" style="--d:1.5s">
                <circle class="ml-dot d1" cx="28" cy="60" r="3" fill="#0E8F78"/>
                <circle class="ml-dot d2" cx="176" cy="44" r="2.5" fill="#17211E"/>
                <circle class="ml-dot d3" cx="36" cy="150" r="2" fill="#17211E"/>
                <circle class="ml-dot d4" cx="120" cy="180" r="2.5" fill="#0E8F78"/>
              </g>
              <path class="ml-accent a1" pathLength="1" d="M24 100 C18 116 20 134 30 146" fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
              <path class="ml-accent a2" pathLength="1" d="M140 26 l10 -8" fill="none" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round"/>
            </g>
          </g>
        </svg></div>`,
        'artificial-intelligence': `<div class="ai-stage"><svg class="ai-icon" viewBox="0 0 200 200" role="img" aria-label="Artificial Intelligence technology illustration">
          <g class="ai-float">
            <g class="ai-tilt">
              <g class="px-robot">
                <rect class="ai-draw" style="--d:0.1s" pathLength="1" x="84" y="120" width="32" height="30" rx="10" fill="#F2F8F5" stroke="#17211E" stroke-width="4"/>
                <g class="ai-fadein" style="--d:0.8s" fill="#0E8F78">
                  <circle cx="94" cy="136" r="2.5"/>
                  <circle cx="106" cy="136" r="2.5"/>
                </g>
                <rect class="ai-draw" style="--d:0s" pathLength="1" x="70" y="80" width="60" height="42" rx="16" fill="#F2F8F5" stroke="#17211E" stroke-width="4"/>
                <g class="ai-fadein" style="--d:0.4s">
                  <rect x="82" y="88" width="36" height="24" rx="10" fill="#17211E"/>
                </g>
                <g class="ai-fadein" style="--d:0.55s">
                  <g class="ai-eye"><rect x="90" y="96" width="7" height="12" rx="3.5" fill="#0E8F78"/></g>
                  <g class="ai-eye" style="animation-delay:0.12s"><rect x="103" y="96" width="7" height="12" rx="3.5" fill="#0E8F78"/></g>
                </g>
                <g class="ai-pop" style="--d:0.6s" fill="#0E8F78" stroke="#17211E" stroke-width="3">
                  <circle cx="66" cy="100" r="7"/>
                  <circle cx="134" cy="100" r="7"/>
                </g>
                <path class="ai-draw" style="--d:0.5s" pathLength="1" d="M100 80 L100 64" fill="none" stroke="#17211E" stroke-width="3" stroke-linecap="round"/>
                <g class="ai-pop" style="--d:0.7s">
                  <circle class="ai-corepulse" cx="100" cy="56" r="6" fill="#0E8F78" stroke="#17211E" stroke-width="3"/>
                </g>
              </g>
              <g class="px-core">
                <g class="ai-crown" fill="none" stroke="#0E8F78" stroke-width="1.8" opacity="0.6" stroke-linecap="round">
                  <path class="ai-draw" style="--d:0.8s" pathLength="1" d="M100 56 C90 50 78 44 66 40"/>
                  <path class="ai-draw" style="--d:0.85s" pathLength="1" d="M100 56 C100 48 100 38 100 30"/>
                  <path class="ai-draw" style="--d:0.9s" pathLength="1" d="M100 56 C110 50 122 44 134 40"/>
                  <path class="ai-draw" style="--d:0.95s" pathLength="1" d="M66 40 C78 32 122 32 134 40"/>
                </g>
                <g stroke="#17211E" stroke-width="2">
                  <g class="ai-pop" style="--d:0.9s"><g class="ai-node" style="--pd:0s"><circle cx="66" cy="40" r="4" fill="#0E8F78"/></g></g>
                  <g class="ai-pop" style="--d:1s"><g class="ai-node" style="--pd:-1s"><circle cx="100" cy="30" r="4.5" fill="#E9F5EF"/></g></g>
                  <g class="ai-pop" style="--d:1.1s"><g class="ai-node" style="--pd:-2s"><circle cx="134" cy="40" r="4" fill="#0E8F78"/></g></g>
                  <g class="ai-pop" style="--d:1.05s"><g class="ai-node" style="--pd:-0.5s"><circle cx="83" cy="35" r="2.5" fill="#0E8F78"/></g></g>
                  <g class="ai-pop" style="--d:1.05s"><g class="ai-node" style="--pd:-1.5s"><circle cx="117" cy="35" r="2.5" fill="#0E8F78"/></g></g>
                </g>
              </g>
              <g class="px-tools">
                <g>
                  <rect class="ai-draw" style="--d:0.9s" pathLength="1" x="22" y="58" width="30" height="30" rx="7" fill="#17211E" stroke="#17211E" stroke-width="3"/>
                  <g class="ai-fadein" style="--d:1.15s" fill="none" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M32 68 l-6 6 6 6"/>
                    <path d="M40 66 l-5 16"/>
                    <path d="M46 68 l6 6 -6 6"/>
                  </g>
                  <g class="ai-fadein" style="--d:1.3s"><rect class="ai-codecursor" x="28" y="81" width="10" height="3" rx="1.5" fill="#0E8F78"/></g>
                </g>
                <g class="ai-fadein" style="--d:1s">
                  <g class="ai-dbbob" fill="#F2F8F5" stroke="#17211E" stroke-width="2.5">
                    <ellipse cx="36" cy="124" rx="10" ry="4"/>
                    <path d="M26 124 L26 140 C26 143 30 145 36 145 C42 145 46 143 46 140 L46 124"/>
                    <path d="M26 132 C30 135 42 135 46 132" fill="none" stroke="#0E8F78" stroke-width="2"/>
                  </g>
                </g>
                <g class="ai-cloudbob">
                  <path class="ai-draw" style="--d:1.05s" pathLength="1" d="M146 72 C141 72 138 68 139 64 C140 61 143 60 146 60 C147 56 152 54 156 56 C158 53 162 53 164 55 C168 54 172 56 172 60 C175 61 176 64 175 67 C174 70 171 72 168 72 Z" fill="#E9F5EF" stroke="#17211E" stroke-width="2.5" stroke-linejoin="round"/>
                </g>
                <g class="ai-fadein" style="--d:1.1s">
                  <g class="ai-gearspin">
                    <circle cx="160" cy="128" r="9" fill="none" stroke="#0E8F78" stroke-width="7" stroke-dasharray="4.5 4.9"/>
                    <circle cx="160" cy="128" r="4.5" fill="#E9F5EF" stroke="#17211E" stroke-width="2.5"/>
                  </g>
                </g>
              </g>
              <g class="px-conn">
                <g class="ai-connlines" fill="none" stroke="#17211E" stroke-width="1.8" opacity="0.45" stroke-linecap="round">
                  <path class="ai-draw ai-connline" style="--d:1.2s" pathLength="1" d="M70 100 C60 96 55 92 52 88"/>
                  <path class="ai-draw ai-connline" style="--d:1.25s" pathLength="1" d="M80 132 C68 134 56 134 47 132"/>
                  <path class="ai-draw ai-connline" style="--d:1.3s" pathLength="1" d="M130 94 C140 88 147 82 151 76"/>
                  <path class="ai-draw ai-connline" style="--d:1.35s" pathLength="1" d="M126 130 C138 132 148 131 155 129"/>
                </g>
                <g class="ai-fadein" style="--d:1.6s">
                  <circle class="ai-signal" style="--sd:0s; offset-path: path('M70 100 C60 96 55 92 52 88')" cx="70" cy="100" r="3" fill="#0E8F78"/>
                  <circle class="ai-signal" style="--sd:-2.3s; offset-path: path('M130 94 C140 88 147 82 151 76')" cx="130" cy="94" r="3" fill="#0E8F78"/>
                  <circle class="ai-signal" style="--sd:-4.6s; offset-path: path('M126 130 C138 132 148 131 155 129')" cx="126" cy="130" r="3" fill="#0E8F78"/>
                </g>
              </g>
              <g class="px-decor">
                <g class="ai-fadein" style="--d:1.5s">
                  <circle class="ai-dot d1" cx="18" cy="104" r="2.5" fill="#0E8F78"/>
                  <circle class="ai-dot d2" cx="182" cy="104" r="2.5" fill="#17211E"/>
                  <circle class="ai-dot d3" cx="100" cy="172" r="2.5" fill="#0E8F78"/>
                  <circle class="ai-dot d4" cx="60" cy="164" r="2" fill="#17211E"/>
                </g>
                <path class="ai-accent a1" pathLength="1" d="M14 56 C10 70 12 82 18 92" fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
                <path class="ai-accent a2" pathLength="1" d="M118 20 l10 -8" fill="none" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round"/>
              </g>
            </g>
          </g>
        </svg></div>`,
        linux: `<div class="linux-stage"><svg class="linux-icon" viewBox="0 0 200 200" role="img" aria-label="Linux technology illustration">
          <g class="linux-float">
            <g class="linux-tilt">
              <g class="px-terminal">
                <g class="linux-terminal">
                  <rect class="linux-draw term-box" style="--d:1.5s" pathLength="1" x="16" y="64" width="46" height="38" rx="5" fill="#17211E" stroke="#0E8F78" stroke-width="2.5" stroke-opacity="0.55"/>
                  <g class="linux-fadein" style="--d:1.9s" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round" fill="none">
                    <path d="M24 84 l7 5 -7 5"/>
                  </g>
                  <g class="linux-fadein" style="--d:2s"><rect class="term-cursor" x="36" y="80" width="7" height="10" fill="#0E8F78"/></g>
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
                    <g class="linux-pop" style="--d:1.3s"><ellipse class="foot-l" cx="76" cy="164" rx="15" ry="9" fill="#F2A93B" stroke="#17211E" stroke-width="2.5"/></g>
                    <g class="linux-pop" style="--d:1.45s"><ellipse class="foot-r" cx="124" cy="164" rx="15" ry="9" fill="#F2A93B" stroke="#17211E" stroke-width="2.5"/></g>
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
        'web-development': `<div class="web-stage"><svg class="web-icon" viewBox="0 0 200 200" role="img" aria-label="Web development technology illustration">
          <g class="web-float">
            <g class="web-tilt">
              <g class="px-browser">
                <rect class="web-draw" style="--d:0s" pathLength="1" x="30" y="62" width="108" height="78" rx="8" fill="#F2F8F5" stroke="#17211E" stroke-width="4"/>
                <g class="web-fadein" style="--d:0.45s">
                  <path d="M30 70 C30 65 33 62 38 62 L130 62 C135 62 138 65 138 70 L138 76 L30 76 Z" fill="#0E8F78"/>
                  <path d="M30 76 H138" stroke="#17211E" stroke-width="2.5"/>
                  <circle cx="40" cy="69" r="3" fill="#17211E"/>
                  <circle cx="50" cy="69" r="3" fill="#E9F5EF"/>
                  <circle cx="60" cy="69" r="3" fill="#E9F5EF"/>
                  <rect x="72" y="65" width="54" height="8" rx="4" fill="#E9F5EF" opacity="0.8"/>
                </g>
              </g>
              <g class="px-page">
                <g class="web-pagesettle">
                  <g class="web-fadein" style="--d:0.6s">
                    <rect x="38" y="84" width="92" height="6" rx="3" fill="#0E8F78" opacity="0.75"/>
                  </g>
                  <g class="web-fadein" style="--d:0.7s" fill="#17211E" opacity="0.55">
                    <rect x="38" y="96" width="44" height="4" rx="2"/>
                    <rect x="38" y="103" width="32" height="4" rx="2"/>
                  </g>
                  <g class="web-fadein" style="--d:0.8s">
                    <rect x="88" y="94" width="42" height="26" fill="#DCEBE3" stroke="#17211E" stroke-width="2"/>
                    <path d="M88 94 L130 120 M130 94 L88 120" stroke="#17211E" stroke-width="1.5"/>
                  </g>
                  <g class="web-pop" style="--d:0.9s">
                    <rect x="38" y="112" width="24" height="9" rx="4.5" fill="#0E8F78"/>
                  </g>
                  <g fill="#FFFFFF" stroke="#17211E" stroke-width="2">
                    <g class="web-pop" style="--d:1s"><rect x="38" y="126" width="26" height="10" rx="2"/></g>
                    <g class="web-pop" style="--d:1.05s"><rect x="68" y="126" width="26" height="10" rx="2"/></g>
                    <g class="web-pop" style="--d:1.1s"><rect x="98" y="126" width="26" height="10" rx="2"/></g>
                  </g>
                </g>
              </g>
              <g class="px-code">
                <rect class="web-draw" style="--d:0.8s" pathLength="1" x="140" y="86" width="48" height="58" rx="6" fill="#17211E" stroke="#17211E" stroke-width="4"/>
                <g class="web-fadein" style="--d:1.1s" fill="#0E8F78">
                  <rect x="148" y="96" width="24" height="3" rx="1.5"/>
                  <rect x="148" y="102" width="16" height="3" rx="1.5" opacity="0.6"/>
                </g>
                <g class="web-fadein" style="--d:1.2s" fill="none" stroke="#0E8F78" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M156 116 l-9 9 9 9"/>
                  <path d="M164 114 l-7 22"/>
                  <path d="M172 116 l9 9 -9 9"/>
                </g>
                <g class="web-fadein" style="--d:1.3s">
                  <rect class="web-cursor" x="180" y="128" width="5" height="10" fill="#0E8F78"/>
                </g>
              </g>
              <g class="px-cloud">
                <g class="web-cloudbob">
                  <path class="web-draw" style="--d:1s" pathLength="1" d="M132 52 C126 52 122 47 124 42 C125 38 129 36 133 37 C135 31 142 28 148 31 C150 27 156 26 160 29 C165 27 171 30 172 35 C177 36 180 41 178 46 C177 50 173 52 169 52 Z" fill="#E9F5EF" stroke="#17211E" stroke-width="3" stroke-linejoin="round"/>
                </g>
                <path class="web-draw" style="--d:1.2s" pathLength="1" d="M165 86 C167 74 165 64 161 54" fill="none" stroke="#17211E" stroke-width="1.8" opacity="0.5"/>
                <path class="web-draw" style="--d:1.25s" pathLength="1" d="M143 54 C145 66 147 76 149 86" fill="none" stroke="#17211E" stroke-width="1.8" opacity="0.5"/>
                <g class="web-fadein" style="--d:1.6s">
                  <circle class="web-signal" style="--sd:0s; offset-path: path('M165 86 C167 74 165 64 161 54')" cx="165" cy="86" r="3" fill="#0E8F78"/>
                  <circle class="web-signal" style="--sd:-3.5s; offset-path: path('M143 54 C145 66 147 76 149 86')" cx="143" cy="54" r="3" fill="#0E8F78"/>
                </g>
              </g>
              <g class="px-decor">
                <g class="web-fadein" style="--d:1.5s">
                  <circle class="web-dot d1" cx="20" cy="52" r="3" fill="#0E8F78"/>
                  <circle class="web-dot d2" cx="184" cy="64" r="2.5" fill="#17211E"/>
                  <circle class="web-dot d3" cx="24" cy="150" r="2" fill="#17211E"/>
                  <circle class="web-dot d4" cx="120" cy="168" r="2.5" fill="#0E8F78"/>
                </g>
                <path class="web-accent a1" pathLength="1" d="M16 96 C10 112 12 130 22 142" fill="none" stroke="#17211E" stroke-width="2.5" stroke-linecap="round"/>
                <path class="web-accent a2" pathLength="1" d="M104 30 l10 -8" fill="none" stroke="#0E8F78" stroke-width="2.5" stroke-linecap="round"/>
              </g>
            </g>
          </g>
        </svg></div>`,
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
      // Animated Machine Learning icon: reveal on scroll into view + layered parallax.
      // Runs after the category icons are injected; each stage initializes once.
      const initMLIcons = () => {
        const stages = document.querySelectorAll('.ml-stage:not([data-ml-init])');
        if (!stages.length) return;
        stages.forEach(stage => stage.setAttribute('data-ml-init', '1'));
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
            [stage.querySelector('.px-brain'), 2],
            [stage.querySelector('.px-network'), 4],
            [stage.querySelector('.px-data'), 5],
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
      // Animated Web Development icon: reveal on scroll into view + layered parallax.
      // Runs after the category icons are injected; each stage initializes once.
      const initWebIcons = () => {
        const stages = document.querySelectorAll('.web-stage:not([data-web-init])');
        if (!stages.length) return;
        stages.forEach(stage => stage.setAttribute('data-web-init', '1'));
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
            [stage.querySelector('.px-browser'), 2],
            [stage.querySelector('.px-page'), 3],
            [stage.querySelector('.px-code'), 4],
            [stage.querySelector('.px-cloud'), 5],
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
      // Animated AI icon: reveal on scroll into view + layered parallax.
      // Runs after the category icons are injected; each stage initializes once.
      const initAIIcons = () => {
        const stages = document.querySelectorAll('.ai-stage:not([data-ai-init])');
        if (!stages.length) return;
        stages.forEach(stage => stage.setAttribute('data-ai-init', '1'));
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
            [stage.querySelector('.px-robot'), 2],
            [stage.querySelector('.px-core'), 3],
            [stage.querySelector('.px-tools'), 4],
            [stage.querySelector('.px-conn'), 5],
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
        initMLIcons();
        initWebIcons();
        initAIIcons();
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
          item.innerHTML = `<span class="timeline-dot" aria-hidden="true"></span><article class="timeline-card"><button class="timeline-media certificate-trigger" type="button" data-category="${cat.id}" aria-haspopup="dialog" aria-controls="certificate-dialog" aria-label="Open certificates: ${label}" tabindex="-1" disabled><span class="timeline-placeholder">Certificate<br>image</span></button><div class="timeline-content"><p class="timeline-year">${years.length ? Math.max(...years) : ''}</p><h3 class="timeline-title"></h3><p class="timeline-desc"></p><p class="timeline-issuer"></p><button class="timeline-link certificate-trigger" type="button" data-category="${cat.id}" aria-haspopup="dialog" aria-controls="certificate-dialog" disabled>View certificate${plural ? 's' : ''} <span aria-hidden="true">→</span></button></div></article>`;
          const card = item.querySelector('.timeline-card');
          card.querySelector('.timeline-title').textContent = label;
          card.querySelector('.timeline-issuer').textContent = `${certs.length} certificate${plural ? 's' : ''}`;
          card.querySelector('.timeline-desc').textContent = cat.description || '';
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
