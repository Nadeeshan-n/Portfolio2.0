(() => {
  'use strict';
  const page = document.body;
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const mobile = window.matchMedia ? window.matchMedia('(max-width: 760px)') : null;

  if (menu && navigation && mobile) {
    const setMenu = open => {
      navigation.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };
    page.classList.add('projects-js');
    menu.hidden = false;
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    navigation.addEventListener('click', event => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menu.focus();
      }
    });
    const onBreakpoint = () => {
      if (mobile.matches && navigation.contains(document.activeElement)) menu.focus();
      setMenu(false);
    };
    if (mobile.addEventListener) mobile.addEventListener('change', onBreakpoint);
    else if (mobile.addListener) mobile.addListener(onBreakpoint);
  }

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  const updateVisibility = () => page.classList.toggle('motion-paused', document.hidden);
  updateVisibility();
  document.addEventListener('visibilitychange', updateVisibility);
  const year = document.querySelector('.projects-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
