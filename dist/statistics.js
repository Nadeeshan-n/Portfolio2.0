(() => {
  'use strict';
  const section = document.querySelector('#portfolio-statistics');
  if (!section) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const records = [...section.querySelectorAll('[data-stat]')].map(element => ({
    key: element.dataset.stat,
    target: Number(element.dataset.countTo),
    digits: element.querySelector('.stats-digits'),
    accessible: element.querySelector('.stats-sr-value'),
    exact: element.dataset.countExact === 'true',
    places: Number(element.dataset.digits) || 2
  }));
  let observer;
  let frame = 0;
  let started = false;
  const format = (value, record) => String(value).padStart(record.places, '0');
  const finish = () => {
    started = true;
    if (observer) observer.disconnect();
    cancelAnimationFrame(frame);
    frame = 0;
    records.forEach(record => {
      record.digits.textContent = format(record.target, record);
    });
    section.dataset.counterState = 'complete';
  };
  const start = () => {
    if (started) return;
    started = true;
    observer.disconnect();
    section.dataset.counterState = 'counting';
    const beginning = performance.now();
    const duration = 1450;
    const tick = now => {
      if (motion.matches) { finish(); return; }
      const progress = Math.min(1, Math.max(0, (now - beginning) / duration));
      const eased = 1 - Math.pow(1 - progress, 3);
      records.forEach(record => {
        record.digits.textContent = format(Math.floor(record.target * eased), record);
      });
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
  };
  const prepare = () => {
    records.forEach(record => {
      record.accessible.textContent = record.exact ? String(record.target) : `${record.target} or more`;
    });
    if (motion.matches || !('IntersectionObserver' in window) || started) {
      finish();
      return;
    }
    records.forEach(record => { record.digits.textContent = format(0, record); });
    section.dataset.counterState = 'ready';
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.25)) start();
    }, { threshold: 0.25 });
    observer.observe(section);
  };
  const onMotionChange = event => {
    if (event.matches) finish();
  };
  if (motion.addEventListener) motion.addEventListener('change', onMotionChange);
  else if (motion.addListener) motion.addListener(onMotionChange);

  // Generated markup is the accessible no-JS/network-failure fallback.
  // Count the same records used by Projects and Education, independently.
  // Each failed request keeps that counter's generated fallback.
  const sources = [
    { key: 'projects', url: 'projects/projects.json', count: data => Array.isArray(data.projects) ? data.projects.length : null },
    { key: 'certificates', url: 'education/education.json', count: data => Array.isArray(data.certificates) ? data.certificates.length : null },
    { key: 'experience', url: 'portfolio.json', count: data => data.statistics?.experience }
  ];
  Promise.allSettled(sources.map(async source => {
    const response = await fetch(source.url, { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Counter data unavailable');
    const value = source.count(await response.json());
    const record = records.find(record => record.key === source.key);
    if (record && Number.isSafeInteger(value) && value >= 0) record.target = value;
  }))
    .finally(prepare);
})();
