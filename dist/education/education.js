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
      // Thumbnails + popup triggers are wired once after the category cards render.
      const wireTriggers = () => {
        document.querySelectorAll('.timeline-media[data-category]:not([data-wired])').forEach(cell => {
          const certs = records.filter(record => record.category === cell.dataset.category);
          const first = certs.length && Array.isArray(certs[0].images) ? certs[0].images.find(safeImage) : null;
          cell.dataset.wired = '1';
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
