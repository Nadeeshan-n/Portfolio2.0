(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  if (!header) return;

  let pending = false;
  const updateProgress = () => {
    pending = false;
    const root = document.scrollingElement || document.documentElement;
    const range = Math.max(0, root.scrollHeight - root.clientHeight);
    const progress = range > 0 ? Math.min(1, Math.max(0, root.scrollTop / range)) : 0;
    header.style.setProperty('--page-scroll-progress', String(progress));
  };
  const scheduleProgress = () => {
    if (pending) return;
    pending = true;
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(updateProgress);
    else updateProgress();
  };

  addEventListener('scroll', scheduleProgress, { passive: true });
  addEventListener('resize', scheduleProgress, { passive: true });
  addEventListener('pageshow', scheduleProgress);
  if (typeof ResizeObserver === 'function') new ResizeObserver(scheduleProgress).observe(document.documentElement);
  updateProgress();
})();
