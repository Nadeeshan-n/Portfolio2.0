(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('project');

  const titleEl = document.getElementById('project-detail-title');
  const descriptionEl = document.getElementById('project-detail-description');
  const stackEl = document.getElementById('project-detail-technologies');
  const overviewEl = document.getElementById('project-detail-overview');
  const previewEl = document.getElementById('project-detail-preview');
  const featuresEl = document.getElementById('project-detail-features');
  const techEl = document.getElementById('project-detail-technology-list');
  const learningEl = document.getElementById('project-detail-learning');
  const githubEl = document.getElementById('project-detail-github');
  const demoEl = document.getElementById('project-detail-demo');

  function setList(el, items) {
    if (!el) return;
    el.textContent = '';
    for (const item of items || []) {
      const li = document.createElement('li');
      li.textContent = item;
      el.appendChild(li);
    }
  }

  function notFound() {
    document.title = 'Project not found — Nadeeshan';
    if (titleEl) titleEl.textContent = 'Project not found';
    if (descriptionEl) {
      descriptionEl.textContent = 'The project you are looking for does not exist. Return to the projects page to browse all work.';
    }
    for (const section of document.querySelectorAll('.detail-sections')) {
      section.hidden = true;
    }
    const actions = document.getElementById('project-detail-actions');
    if (actions) actions.hidden = true;
  }

  function wireGallery(gallery) {
    const track = gallery.querySelector('.preview-track');
    const slides = [...gallery.querySelectorAll('.preview-slide')];
    if (!track || !slides.length) return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    for (const slide of slides) {
      const image = slide.querySelector('.preview-image');
      const fallback = slide.querySelector('.preview-image-error');
      const failed = () => {
        if (image) image.hidden = true;
        if (fallback) fallback.hidden = false;
      };
      if (image) {
        image.addEventListener('error', failed);
        if (image.complete && !image.naturalWidth) failed();
      }
    }

    if (slides.length === 1) return;
    const controls = gallery.querySelector('.preview-controls');
    const previous = gallery.querySelector('.preview-previous');
    const next = gallery.querySelector('.preview-next');
    const position = gallery.querySelector('.preview-position');
    if (!controls || !previous || !next || !position) return;

    let current = 0;
    const announce = index => {
      if (current === index) return;
      current = index;
      position.textContent = `${current + 1} of ${slides.length}`;
    };
    const navigate = index => {
      const target = (index + slides.length) % slides.length;
      announce(target);
      const left = target * track.clientWidth;
      if (typeof track.scrollTo === 'function') {
        track.scrollTo({ left, behavior: reducedMotion?.matches ? 'auto' : 'smooth' });
      } else {
        track.scrollLeft = left;
      }
    };

    previous.addEventListener('click', () => navigate(current - 1));
    next.addEventListener('click', () => navigate(current + 1));
    track.addEventListener('keydown', event => {
      const destination = {
        ArrowLeft: current - 1,
        ArrowRight: current + 1,
        Home: 0,
        End: slides.length - 1
      }[event.key];
      if (destination === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      navigate(destination);
    });

    let scrollTimer = 0;
    track.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        announce(Math.round(track.scrollLeft / track.clientWidth));
      }, 120);
    }, { passive: true });
    const preserveSlide = () => { track.scrollLeft = current * track.clientWidth; };
    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(preserveSlide);
      observer.observe(track);
    } else {
      window.addEventListener('resize', preserveSlide);
    }

    track.tabIndex = 0;
    gallery.classList.add('preview-slider');
    controls.hidden = false;
  }

  function renderPreview(project) {
    if (!previewEl) return;
    const images = project.previewImages || [];
    if (!images.length) return; // keep the built-in empty placeholder

    previewEl.textContent = '';
    const gallery = document.createElement('div');
    gallery.className = 'project-preview';
    gallery.setAttribute('data-preview-gallery', '');
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-label', `${project.title} preview`);

    const track = document.createElement('div');
    track.id = 'project-preview-images';
    track.className = 'preview-track';
    track.setAttribute('aria-label', 'Project preview images');

    images.forEach((preview, index) => {
      const figure = document.createElement('figure');
      figure.className = 'preview-slide';
      figure.setAttribute('role', 'group');
      figure.setAttribute('aria-label', `Image ${index + 1} of ${images.length}`);

      const img = document.createElement('img');
      img.className = 'preview-image';
      img.src = preview.src;
      img.alt = preview.alt || `${project.title} preview ${index + 1}`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';

      const error = document.createElement('p');
      error.className = 'preview-image-error';
      error.hidden = true;
      error.textContent = 'Preview image unavailable.';

      figure.appendChild(img);
      figure.appendChild(error);
      track.appendChild(figure);
    });

    gallery.appendChild(track);

    if (images.length > 1) {
      const controls = document.createElement('div');
      controls.className = 'preview-controls';
      controls.hidden = true;

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'secondary-button preview-previous';
      prevBtn.setAttribute('aria-label', 'Previous preview image');
      prevBtn.setAttribute('aria-controls', 'project-preview-images');
      prevBtn.textContent = 'Previous';

      const position = document.createElement('p');
      position.className = 'preview-position';
      position.setAttribute('role', 'status');
      position.setAttribute('aria-live', 'polite');
      position.setAttribute('aria-atomic', 'true');
      position.textContent = `1 of ${images.length}`;

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'secondary-button preview-next';
      nextBtn.setAttribute('aria-label', 'Next preview image');
      nextBtn.setAttribute('aria-controls', 'project-preview-images');
      nextBtn.textContent = 'Next';

      controls.appendChild(prevBtn);
      controls.appendChild(position);
      controls.appendChild(nextBtn);
      gallery.appendChild(controls);
    }

    previewEl.appendChild(gallery);
    wireGallery(gallery);
  }

  async function init() {
    if (!slug) {
      notFound();
      return;
    }
    let projects;
    try {
      const response = await fetch('projects.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      projects = data.projects || [];
    } catch (error) {
      notFound();
      return;
    }

    const project = projects.find(p => p.slug === slug);
    if (!project) {
      notFound();
      return;
    }

    document.title = `${project.title} — Nadeeshan`;
    if (titleEl) titleEl.textContent = project.title;
    if (descriptionEl) descriptionEl.textContent = project.description || '';
    setList(stackEl, project.cardStack);
    if (overviewEl) overviewEl.textContent = project.overview || '';
    setList(featuresEl, project.features);
    setList(techEl, project.technologies);
    if (learningEl) learningEl.textContent = project.learned || 'Learning notes to be added.';

    if (project.github && githubEl) {
      githubEl.href = project.github;
    } else if (githubEl) {
      githubEl.hidden = true;
    }
    // The portfolio no longer ships live demos; keep the button hidden.
    if (demoEl) demoEl.hidden = true;

    renderPreview(project);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
