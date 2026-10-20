/* VR blog: search, reading progress, contents, copy, zoom, theme and language.
 * Everything here is an enhancement; the pages read fine without it. */
(() => {
  'use strict';
  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* private mode */ } }
  };

  /* ---------- language: keep the profile and the blog on the same choice ---------- */
  store.set('cv-lang', body.dataset.lang);
  document.querySelectorAll('.lang a[data-lang]').forEach((link) => {
    link.addEventListener('click', () => store.set('cv-lang', link.dataset.lang));
  });

  /* ---------- theme ---------- */
  const themeButton = document.querySelector('[data-theme-toggle]');
  themeButton?.addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    store.set('blog-theme', root.dataset.theme);
  });

  /* ---------- feedback on copy buttons ---------- */
  const flash = (button, label) => {
    const original = button.getAttribute('aria-label');
    const text = button.childNodes.length === 1 && button.firstChild.nodeType === 3 ? button.textContent : null;
    button.dataset.state = 'done';
    if (label) { if (text !== null) button.textContent = label; else button.setAttribute('aria-label', label); }
    setTimeout(() => {
      delete button.dataset.state;
      if (text !== null) button.textContent = text; else if (original) button.setAttribute('aria-label', original);
    }, 1600);
  };
  const copy = async (value, button, label) => {
    try { await navigator.clipboard.writeText(value); flash(button, label); } catch { window.prompt('', value); }
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    const done = document.querySelector('[data-copy-link]')?.dataset.done || '✓';
    button.addEventListener('click', () => copy(button.parentElement.querySelector('code').innerText, button, done));
  });
  document.querySelectorAll('[data-copy-link]').forEach((button) => {
    button.addEventListener('click', () => copy(button.dataset.copyLink, button, button.dataset.done));
  });

  /* native share on devices that have it */
  document.querySelectorAll('[data-native-share]').forEach((button) => {
    if (!navigator.share) return;
    button.hidden = false;
    button.addEventListener('click', () => navigator.share({ title: button.dataset.title, url: button.dataset.url }).catch(() => {}));
  });
  document.querySelectorAll('[data-print]').forEach((button) => button.addEventListener('click', () => window.print()));

  /* ---------- citation tabs ---------- */
  const tabs = [...document.querySelectorAll('[data-cite-tab]')];
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((other) => other.setAttribute('aria-selected', String(other === tab)));
    document.querySelectorAll('[data-cite]').forEach((block) => { block.hidden = block.dataset.cite !== tab.dataset.citeTab; });
  }));
  document.querySelector('[data-copy-cite]')?.addEventListener('click', (event) => {
    const visible = [...document.querySelectorAll('[data-cite]')].find((block) => !block.hidden);
    if (visible) copy(visible.textContent, event.currentTarget, event.currentTarget.dataset.done);
  });

  /* ---------- reading progress and contents ---------- */
  const article = document.querySelector('[data-post] .prose');
  const bar = document.querySelector('.progress span');
  if (article && bar) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const box = article.getBoundingClientRect();
      const total = box.height - window.innerHeight * 0.6;
      const done = Math.min(1, Math.max(0, -box.top / Math.max(1, total)));
      bar.style.transform = `scaleX(${done})`;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)));
      const headings = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
      const current = headings.find((heading) => visible.has(heading.id))
        || [...headings].reverse().find((heading) => heading.getBoundingClientRect().top < 120);
      tocLinks.forEach((link) => link.removeAttribute('aria-current'));
      if (current) byId.get(current.id)?.setAttribute('aria-current', 'true');
    }, { rootMargin: '-80px 0px -65% 0px' });
    byId.forEach((link, id) => { const heading = document.getElementById(id); if (heading) observer.observe(heading); });
  }

  /* ---------- image zoom ---------- */
  const zoom = document.querySelector('[data-zoom-dialog]');
  if (zoom?.showModal) {
    const big = zoom.querySelector('img');
    document.querySelectorAll('img[data-zoom]').forEach((img) => {
      img.tabIndex = 0;
      const open = () => { big.src = img.currentSrc || img.src; big.alt = img.alt; zoom.showModal(); };
      img.addEventListener('click', open);
      img.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(); });
    });
    big.addEventListener('click', () => zoom.close());
    zoom.addEventListener('click', (event) => { if (event.target === zoom) zoom.close(); });
  }

  /* ---------- search ---------- */
  const dialog = document.querySelector('[data-search]');
  const input = document.querySelector('[data-search-input]');
  const list = document.querySelector('[data-search-results]');
  let index = null;
  const fold = (value) => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const escape = (value) => String(value).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const highlight = (text, terms) => {
    let out = escape(text);
    terms.forEach((term) => {
      if (term.length < 2) return;
      out = out.replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
    });
    return out;
  };
  const load = async () => {
    if (index) return index;
    const response = await fetch(body.dataset.searchIndex);
    const data = await response.json();
    index = data.map((item) => ({ ...item, title: fold(item.t), summary: fold(item.s), tags: fold(item.g.join(' ')), text: fold(item.b) }));
    return index;
  };
  const base = `${body.dataset.root}${body.dataset.lang}/`;
  const search = async () => {
    const query = fold(input.value.trim());
    if (!query) { list.innerHTML = ''; return; }
    const items = await load();
    const terms = query.split(/\s+/).filter(Boolean);
    const results = items.map((item) => {
      let score = 0;
      for (const term of terms) {
        const hit = (field, weight) => (item[field].includes(term) ? weight : 0);
        const termScore = hit('title', 10) + hit('tags', 6) + hit('summary', 4) + hit('text', 1);
        if (!termScore) return null;
        score += termScore;
      }
      return { item, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || b.item.d.localeCompare(a.item.d)).slice(0, 12);
    list.innerHTML = results.length
      ? results.map(({ item }, i) => `<li><a href="${base}${item.u}index.html"${i === 0 ? ' aria-selected="true"' : ''}><strong>${highlight(item.t, terms)}</strong><span>${highlight(item.s, terms)}</span></a></li>`).join('')
      : `<li class="none">${escape(list.dataset.empty)} “${escape(input.value)}”</li>`;
  };
  const openSearch = () => {
    if (!dialog?.showModal) return;
    dialog.showModal();
    input.focus();
    load().catch(() => {});
  };
  document.querySelectorAll('[data-search-open]').forEach((button) => button.addEventListener('click', openSearch));
  input?.addEventListener('input', search);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('keydown', (event) => {
    const links = [...list.querySelectorAll('a')];
    if (!links.length) return;
    const at = links.findIndex((link) => link.getAttribute('aria-selected') === 'true');
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = links[(at + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length];
      links.forEach((link) => link.removeAttribute('aria-selected'));
      next.setAttribute('aria-selected', 'true');
      next.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter' && at >= 0 && document.activeElement === input) {
      event.preventDefault();
      location.href = links[at].href;
    }
  });
  document.addEventListener('keydown', (event) => {
    const typing = /input|textarea|select/i.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
    if (event.key === '/' && !typing && !dialog?.open) { event.preventDefault(); openSearch(); }
  });

  void reduced;
})();
