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

  const grid = document.querySelector('.work-grid');
  if (!grid) return;
  grid.replaceChildren();
  fetch('projects.json')
    .then(response => {
      if (!response.ok) throw new Error(`Unable to load projects.json (${response.status})`);
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data.projects)) throw new Error('projects.json has no projects array');
      data.projects.forEach((project, index) => {
        const card = document.createElement('article');
        card.className = 'work-card';
        card.setAttribute('aria-labelledby', `work-${project.slug}`);

        const media = document.createElement('div');
        media.className = 'work-media';
        media.dataset.projectMedia = project.slug;
        media.dataset.projectTitle = project.title || '';
        media.innerHTML = '<div class="work-image-surface"><img class="work-image" alt="" hidden><p class="work-image-empty">Project image</p></div>';

        const copy = document.createElement('div');
        copy.className = 'work-copy';
        const number = document.createElement('p');
        number.className = 'work-number';
        number.innerHTML = `<span aria-hidden="true">// </span>${String(index + 1).padStart(2, '0')}`;
        const title = document.createElement('h2');
        title.id = `work-${project.slug}`;
        title.className = 'work-title';
        title.textContent = project.title || '';
        const description = document.createElement('p');
        description.className = 'work-description';
        description.textContent = project.description || '';
        copy.append(number, title, description);
        const stack = Array.isArray(project.cardStack) && project.cardStack.length
          ? project.cardStack
          : project.technologies;
        if (Array.isArray(stack) && stack.length) {
          const technologies = document.createElement('ul');
          technologies.className = 'technology-list';
          technologies.setAttribute('aria-label', 'Technology stack');
          stack.forEach(value => {
            const item = document.createElement('li');
            item.textContent = value;
            technologies.append(item);
          });
          copy.append(technologies);
        } else {
          const placeholder = document.createElement('p');
          placeholder.className = 'stack-placeholder';
          placeholder.textContent = 'Technologies to be added.';
          copy.append(placeholder);
        }
        const link = document.createElement('a');
        link.className = 'primary-button work-link';
        link.href = `${project.slug}/`;
        link.setAttribute('aria-label', `View project: ${project.title || ''}`);
        link.textContent = 'View Project';
        copy.append(link);
        card.append(media, copy);
        grid.append(card);
      });
    })
    .catch(() => {});
})();
