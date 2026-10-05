(() => {
  'use strict';
  const WRITE = 2600;
  const HOLD = 5000;
  const ERASE = 450;
  const RESET = 100;
  const CYCLE = WRITE + HOLD + ERASE + RESET;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.footer-signature').forEach(signature => {
    // A second script evaluation cannot create another controller or loop.
    if (signature.dataset.signatureInitialized) return;
    signature.dataset.signatureInitialized = 'true';
    const footer = signature.closest('.site-footer');
    const strokes = [...signature.querySelectorAll('.signature-reveal')];
    if (!footer || !strokes.length || typeof IntersectionObserver !== 'function' ||
        strokes.some(stroke => typeof stroke.animate !== 'function')) return;
    let inView = false;
    let pageActive = true;
    let animations = [];

    const clear = () => {
      animations.forEach(animation => animation.cancel());
      animations = [];
      signature.removeAttribute('data-signature-motion');
    };
    const prepare = () => {
      if (animations.length) return;
      animations = strokes.map(stroke => {
        const start = Number(stroke.dataset.start);
        const end = Number(stroke.dataset.end);
        const dash = stroke.dataset.length;
        const frames = [{ strokeDashoffset: dash, offset: 0 }];
        if (start > 0) frames.push({ strokeDashoffset: dash, offset: start / CYCLE, easing: 'cubic-bezier(.35,0,.6,1)' });
        else frames[0].easing = 'cubic-bezier(.35,0,.6,1)';
        frames.push({ strokeDashoffset: '0', offset: end / CYCLE },
                    { strokeDashoffset: '0', offset: (WRITE + HOLD) / CYCLE, easing: 'ease-in-out' },
                    { strokeDashoffset: dash, offset: (WRITE + HOLD + ERASE) / CYCLE },
                    { strokeDashoffset: dash, offset: 1 });
        const animation = stroke.animate(frames, { duration: CYCLE, iterations: Infinity, fill: 'both', easing: 'linear' });
        animation.pause();
        animation.currentTime = 0;
        return animation;
      });
    };
    const update = () => {
      if (reduced?.matches) {
        clear(); // Static complete signature, including when the preference changes mid-stroke.
        return;
      }
      signature.setAttribute('data-signature-motion', 'ready');
      if (inView && pageActive && !document.hidden) {
        prepare();
        const phase = animations[0]?.currentTime ?? 0;
        animations.forEach(animation => {
          if (animation.playState !== 'running') {
            animation.currentTime = phase;
            animation.play();
          }
        });
      } else {
        const phase = animations[0]?.currentTime ?? 0;
        animations.forEach(animation => {
          animation.pause();
          animation.currentTime = phase;
        });
      }
    };
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(item => item.target === footer);
      if (!entry) return;
      inView = entry.isIntersecting && entry.intersectionRect.width > 0 && entry.intersectionRect.height > 0;
      update();
    }, { threshold: 0 });
    document.addEventListener('visibilitychange', update);
    reduced?.addEventListener?.('change', update);
    window.addEventListener('pagehide', () => { pageActive = false; update(); });
    window.addEventListener('pageshow', () => { pageActive = true; update(); });
    observer.observe(footer);
    update();
  });
})();
