(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');
  const links = [...navigation.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('[data-section]')];
  const setActive = name => {
    for (const link of links) {
      if (link.getAttribute('href') === '#' + name) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
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
  links.forEach(link => link.addEventListener('click', () => {
    setActive(link.hash.slice(1));
    closeMenu();
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  const breakpoint = matchMedia('(max-width: 760px)');
  breakpoint.addEventListener('change', () => closeMenu());
  let scrollPending = false;
  const updatePosition = () => {
    scrollPending = false;
    header.classList.toggle('scrolled', scrollY > 8);
    const candidates = sections.filter(s => s.getBoundingClientRect().top <= 170);
    const current = candidates[candidates.length - 1] || sections[0];
    setActive(current.dataset.section);
  };
  const schedulePosition = () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updatePosition); }
  };
  addEventListener('scroll', schedulePosition, { passive: true });
  addEventListener('hashchange', () => setActive(location.hash.slice(1) || 'home'));
  updatePosition();

  // About alone gets one quiet entrance; all content stays visible without JS.
  const about = document.querySelector('.about');
  const aboutMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (about && typeof IntersectionObserver === 'function' && !aboutMotion.matches) {
    const finishAboutEntrance = () => {
      about.classList.add('about-in-view');
      aboutObserver.disconnect();
      aboutMotion.removeEventListener('change', onAboutMotionChange);
    };
    const onAboutMotionChange = event => {
      if (event.matches) finishAboutEntrance();
    };
    const aboutObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) finishAboutEntrance();
    }, { threshold: .12, rootMargin: '0px 0px -24px 0px' });
    about.classList.add('about-motion-ready');
    aboutMotion.addEventListener('change', onAboutMotionChange);
    aboutObserver.observe(about);
  }

  document.querySelector('.site-footer>p').textContent = `© ${new Date().getFullYear()} Nadeeshan`;
})();
