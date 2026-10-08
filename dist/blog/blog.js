(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  if (menu && nav) {
    menu.hidden = false;
    const setMenu = open => {
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  }
  const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 8);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });

  const hero = document.querySelector('.article-hero');
  if (hero) {
    const originalImage = hero.querySelector('img');
    if (originalImage) {
      const buildSlider = related => {
        const section = document.createElement('section');
        section.className = 'article-slider-section';
        section.setAttribute('aria-label', 'Article images');
        const slider = document.createElement('div');
        slider.className = 'article-slider';
        const track = document.createElement('div');
        track.className = 'article-slider-track';
        const slidesData = [{ src: originalImage.getAttribute('src'), alt: originalImage.alt || 'Article image' }]
          .concat(related);
        slidesData.forEach((data, index) => {
          const slide = document.createElement('figure');
          slide.className = 'article-slide' + (index === 0 ? ' is-active' : '');
          slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
          const image = document.createElement('img');
          image.src = data.src;
          image.alt = data.alt;
          image.loading = index === 0 ? 'eager' : 'lazy';
          slide.append(image);
          track.append(slide);
        });
        slider.append(track);
        if (slidesData.length > 1) {
          const controls = document.createElement('div');
          controls.className = 'article-slider-controls';
          controls.innerHTML = '<button type="button" class="article-slider-prev" aria-label="Previous image">←</button><span class="article-slider-position" aria-live="polite">1 / ' + slidesData.length + '</span><button type="button" class="article-slider-next" aria-label="Next image">→</button>';
          slider.append(controls);
          const slides = [...track.children];
          let current = 0;
          const show = next => {
            slides[current].classList.remove('is-active');
            slides[current].setAttribute('aria-hidden', 'true');
            current = (next + slides.length) % slides.length;
            slides[current].classList.add('is-active');
            slides[current].setAttribute('aria-hidden', 'false');
            controls.querySelector('.article-slider-position').textContent = (current + 1) + ' / ' + slides.length;
          };
          controls.querySelector('.article-slider-prev').addEventListener('click', () => show(current - 1));
          controls.querySelector('.article-slider-next').addEventListener('click', () => show(current + 1));
        }
        section.append(slider);
        hero.replaceWith(section);
      };
      const slug = location.pathname.split('/').filter(Boolean).pop();
      fetch('../../blog.json')
        .then(response => { if (!response.ok) throw new Error('blog.json unavailable'); return response.json(); })
        .then(posts => {
          const related = posts
            .filter(post => post.slug !== slug)
            .slice(0, 2)
            .map(post => {
              const src = post.hero || post.image;
              return {
                src: src.charAt(0) === '/' ? '../../../' + src.slice(1) : src,
                alt: post.heroAlt || ((post.title || 'Related article') + ' article visual')
              };
            });
          if (related.length) buildSlider(related);
        })
        .catch(() => {});
    }
  }

  const grid = document.querySelector('.blog-grid');
  if (!grid) return;
  fetch('blog.json').then(response => response.json()).then(posts => {
    posts.forEach((post, index) => {
      const card = document.createElement('article');
      card.className = 'blog-card';
      card.innerHTML = '<a class="blog-media" href="posts/' + post.slug + '/" aria-label="Read article: ' + post.title + '"><img src="' + post.image + '" alt="" loading="' + (index ? 'lazy' : 'eager') + '" onerror="this.style.display=\'none\'"></a><div class="blog-copy"><p class="blog-category">' + post.category + '</p><h2 class="blog-title"><a href="posts/' + post.slug + '/">' + post.title + '</a></h2><p class="blog-excerpt">' + post.excerpt + '</p><p class="blog-meta"><time datetime="' + post.date + '">' + new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + '</time> · ' + post.readTime + '</p><a class="primary-button blog-read" href="posts/' + post.slug + '/">Read</a></div>';
      grid.append(card);
    });
    const cards = [...grid.children];
    if (!('IntersectionObserver' in window)) { cards.forEach(card => card.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    cards.forEach(card => observer.observe(card));
  }).catch(() => { grid.innerHTML = '<p class="blog-excerpt">Articles are unavailable right now.</p>'; });
})();
