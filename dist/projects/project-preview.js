(() => {
  'use strict';
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  for (const gallery of document.querySelectorAll('[data-preview-gallery]')) {
    const track = gallery.querySelector('.preview-track');
    const slides = [...gallery.querySelectorAll('.preview-slide')];
    if (!track || !slides.length) continue;

    for (const slide of slides) {
      const image = slide.querySelector('.preview-image');
      const fallback = slide.querySelector('.preview-image-error');
      const failed = () => {
        image.hidden = true;
        if (fallback) fallback.hidden = false;
      };
      if (image) {
        image.addEventListener('error', failed);
        if (image.complete && !image.naturalWidth) failed();
      }
    }

    if (slides.length === 1) continue;
    const controls = gallery.querySelector('.preview-controls');
    const previous = gallery.querySelector('.preview-previous');
    const next = gallery.querySelector('.preview-next');
    const position = gallery.querySelector('.preview-position');
    if (!controls || !previous || !next || !position) continue;

    let current = 0;
    let scrollTimer = 0;
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
    track.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      // Announce the settled image, rather than each intermediate smooth-scroll position.
      scrollTimer = window.setTimeout(() => {
        if (track.clientWidth > 0) {
          const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
          announce(index);
        }
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
})();
