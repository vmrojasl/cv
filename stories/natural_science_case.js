(() => {
  const root = document.documentElement;
  const page = document.getElementById('naturalScienceCasePage');
  if (!page) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Display lines rise word by word from a mask ---------- */
  const splitWords = (element) => {
    let index = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          child.data.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              fragment.appendChild(document.createTextNode(part));
              return;
            }
            const word = document.createElement('span');
            const inner = document.createElement('span');
            word.className = 'w';
            inner.className = 'wi';
            inner.style.setProperty('--i', index);
            index += 1;
            inner.textContent = part;
            word.appendChild(inner);
            fragment.appendChild(word);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(element);
    element.classList.add('is-split');
  };
  if (!reducedMotion) page.querySelectorAll('[data-split]').forEach(splitWords);

  /* ---------- Avatar falls back to initials if the remote photo is gone ---------- */
  page.querySelectorAll('.cv-recommendation-meta img').forEach((image) => {
    const fallback = () => {
      const badge = document.createElement('span');
      badge.className = 'cv-avatar-fallback';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = (image.alt || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('');
      image.replaceWith(badge);
    };
    if (image.complete && !image.naturalWidth) fallback();
    else image.addEventListener('error', fallback, { once: true });
  });

  /* ---------- Reveal on entry ---------- */
  const show = (element) => {
    if (element.classList.contains('reveal')) element.classList.add('is-visible');
    if (element.matches('.cv-portfolio-section')) element.classList.add('is-seen');
    element.querySelectorAll('[data-split]').forEach((item) => item.classList.add('is-in'));
  };
  const watched = [...page.querySelectorAll('.reveal, .cv-portfolio-section')];
  if ('IntersectionObserver' in window) {
    const groups = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        const parent = entry.target.parentElement;
        const order = groups.get(parent) || 0;
        groups.set(parent, order + 1);
        entry.target.style.transitionDelay = reducedMotion ? '0ms' : `${Math.min(order * 90, 270)}ms`;
        show(entry.target);
        observer.unobserve(entry.target);
        window.setTimeout(() => groups.set(parent, Math.max(0, (groups.get(parent) || 1) - 1)), 400);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    watched.forEach((element) => observer.observe(element));
  } else {
    watched.forEach(show);
  }

  /* ---------- Reading progress ---------- */
  const bar = document.querySelector('.story-progress span');
  let frame = 0;
  const updateProgress = () => {
    frame = 0;
    const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    bar?.style.setProperty('--read', Math.min(1, Math.max(0, window.scrollY / range)).toFixed(4));
  };
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  /* ---------- Signal field: the case's valuation forms out of the constellation ---------- */
  const canvas = page.querySelector('.story-signal');
  const anchor = document.getElementById('story-signal-anchor');
  const card = page.querySelector('.cv-case-study-card');
  if (reducedMotion || !window.SignalField || !canvas || !anchor || !card) return;

  const start = () => {
    const compact = window.innerWidth < 761;
    let stopTimer = 0;
    const field = window.SignalField.create({
      canvas,
      anchor,
      count: compact ? 240 : 460,
      density: compact ? 22 : 28,
      fieldColor: '#BFA995',
      formedColor: '#003B5C',
      linkColor: '#BFCDD9',
      accentColors: ['#BFCDD9'],
      getCenter: () => {
        const base = canvas.getBoundingClientRect();
        const box = card.getBoundingClientRect();
        return { x: box.left - base.left + box.width / 2, y: box.top - base.top + box.height / 2, r: box.width * 0.82 };
      },
      onFormedChange: (formed) => {
        anchor.classList.toggle('is-formed', formed);
        window.clearTimeout(stopTimer);
        if (formed) stopTimer = window.setTimeout(() => field.stop(), 1000);
      }
    });
    if (!field) return;
    root.classList.add('has-signal');
    field.start();

    const play = () => field.play(2600, 700);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          play();
          observer.disconnect();
        }
      }, { threshold: 0.45 });
      observer.observe(card);
    } else {
      play();
    }

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => field.refresh(), 200);
    });
  };

  (document.fonts?.ready || Promise.resolve()).then(start);
})();
