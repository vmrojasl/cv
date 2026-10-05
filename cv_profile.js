const bootProfile = () => {
  const root = document.documentElement;
  const t = (key, vars) => (window.I18n ? window.I18n.t(key, vars) : '');
  const shell = document.querySelector('.story-shell');
  const screens = [...document.querySelectorAll('.screen')];
  const menuButton = document.querySelector('.menu-toggle');
  const menuLabel = document.querySelector('.menu-toggle-label');
  const nav = document.querySelector('.primary-nav');
  const current = document.querySelector('#screen-current');
  const total = document.querySelector('#screen-total');
  const screenTitle = document.querySelector('#screen-title');
  const progress = document.querySelector('#progress-fill');
  const navigator = document.querySelector('.section-navigator');
  const nextButton = document.querySelector('.next-section');
  const dialog = document.querySelector('#case-dialog');
  const signalCanvas = document.querySelector('.signal-canvas');
  const orbit = document.querySelector('.hero-orbit');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'cubic-bezier(.16,1,.3,1)';
  let activeIndex = 0;
  let isReady = false;
  let lastFocus = null;
  let scrollFrame = 0;
  let field = null;
  let fieldStopTimer = 0;

  if (!shell || !screens.length) {
    document.documentElement.classList.add('is-ready');
    return;
  }

  total.textContent = String(screens.length).padStart(2, '0');

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const focusableElements = (container) => [...container.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hidden && element.offsetParent !== null);

  /* ---------- Display lines rise word by word from a mask ---------- */
  const splitWords = (element) => {
    let index = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const parts = child.data.split(/(\s+)/);
          const fragment = document.createDocumentFragment();
          parts.forEach((part) => {
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

  if (!reducedMotion) document.querySelectorAll('[data-split]').forEach(splitWords);

  /* ---------- Figures count up to their real value ---------- */
  const countUp = (element) => {
    if (element.dataset.counted) return;
    element.dataset.counted = 'true';
    if (reducedMotion) return;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode()) && !/\d/.test(node.data));
    if (!node) return;
    const match = node.data.match(/\d[\d.,]*/);
    const raw = match[0].replace(/[.,]$/, '');
    const thousands = /^\d{1,3}([.,]\d{3})+$/.test(raw);
    const separator = thousands ? raw.match(/[.,]/)[0] : '';
    const decimalMark = !thousands && /[.,]/.test(raw) ? raw.match(/[.,]/)[0] : '';
    const decimals = decimalMark ? raw.split(decimalMark)[1].length : 0;
    const value = thousands ? Number(raw.replace(/[.,]/g, '')) : parseFloat(raw.replace(',', '.'));
    const prefix = node.data.slice(0, match.index);
    const suffix = node.data.slice(match.index + raw.length);
    const format = (amount) => (thousands
      ? Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      : amount.toFixed(decimals).replace('.', decimalMark || '.'));
    const textNode = node;
    const duration = 1700;
    const start = performance.now() + 250;
    const tick = (time) => {
      const t = clamp((time - start) / duration, 0, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      textNode.data = `${prefix}${format(value * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    textNode.data = `${prefix}${format(0)}${suffix}`;
    requestAnimationFrame(tick);
  };

  /* ---------- Menu ---------- */
  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!nav?.classList.contains('open')) return;
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuLabel) menuLabel.textContent = t('ui.menu');
    if (restoreFocus) lastFocus?.focus();
  };

  const openMenu = () => {
    if (!nav || !menuButton) return;
    lastFocus = document.activeElement;
    nav.classList.add('open');
    document.body.classList.add('menu-open');
    menuButton.setAttribute('aria-expanded', 'true');
    if (menuLabel) menuLabel.textContent = t('ui.close');
    window.setTimeout(() => focusableElements(nav)[0]?.focus(), reducedMotion ? 0 : 420);
  };

  menuButton?.addEventListener('click', () => {
    if (nav?.classList.contains('open')) closeMenu({ restoreFocus: true });
    else openMenu();
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));

  const baseUrl = document.querySelector('meta[name="case-study-base-url"]')?.content.trim().replace(/\/$/, '');
  if (baseUrl) {
    document.querySelectorAll('[data-case-study-link]').forEach((link) => {
      link.href = `${baseUrl}/stories/natural_science_case.html`;
    });
  }

  /* ---------- Screens ---------- */
  const revealScreen = (screen) => {
    screen.classList.add('is-active');
    screen.querySelectorAll('.reveal').forEach((item, index) => {
      item.style.transitionDelay = reducedMotion ? '0ms' : `${Math.min(index * 90, 360)}ms`;
      item.classList.add('is-visible');
    });
    screen.querySelectorAll('[data-split]').forEach((item) => item.classList.add('is-in'));
    screen.querySelectorAll('[data-count]').forEach(countUp);
    screen.querySelectorAll('.hero-metric').forEach((item) => item.classList.add('is-rolling'));
    if (screen.id === 'thesis') playThesis(screen);
  };

  /* ---------- Transfer models: ways the five languages connect, reordered with FLIP ----------
   * order: step sequence · lead: highlighted steps · goal: outlined end point.
   * Names, notes, captions and step labels live in locales/<lang>.json → models.
   * The model key doubles as data-mode for the few models with their own drawing
   * (coupled loop, open boundary, helix strands, design frame, nordic links). */
  const narrativeModels = {
    push: {
      order: ['research', 'market', 'ip', 'finance', 'execution'],
      lead: ['research']
    },
    pull: {
      order: ['market', 'research', 'ip', 'finance', 'execution'],
      lead: ['market']
    },
    coupled: {
      order: ['research', 'market', 'ip', 'finance', 'execution'],
      lead: ['research', 'market']
    },
    open: {
      order: ['ip', 'research', 'market', 'finance', 'execution'],
      lead: ['ip']
    },
    helix: {
      order: ['finance', 'research', 'market', 'ip', 'execution'],
      lead: ['finance', 'research', 'market']
    },
    dynamic: {
      order: ['research', 'market', 'ip', 'finance', 'execution'],
      lead: ['execution']
    },
    catchup: {
      order: ['execution', 'market', 'finance', 'ip', 'research'],
      lead: ['execution'],
      goal: 'research'
    },
    design: {
      order: ['research', 'market', 'ip', 'finance', 'execution'],
      lead: []
    },
    malik: {
      order: ['research', 'ip', 'market', 'finance', 'execution'],
      lead: ['research', 'ip', 'market']
    },
    mayer: {
      order: ['research', 'ip', 'finance', 'market', 'execution'],
      lead: ['ip'],
      goal: 'finance'
    },
    gorschek: {
      order: ['market', 'research', 'execution', 'ip', 'finance'],
      lead: ['market'],
      goal: 'execution'
    },
    bozeman: {
      order: ['research', 'ip', 'execution', 'finance', 'market'],
      lead: []
    },
    lean: {
      order: ['research', 'execution', 'market', 'ip', 'finance'],
      lead: ['execution', 'market']
    },
    tas: {
      order: ['research', 'market', 'finance', 'ip', 'execution'],
      lead: ['research', 'market', 'finance']
    },
    anglo: {
      order: ['ip', 'execution', 'finance', 'market', 'research'],
      lead: ['ip']
    },
    central: {
      order: ['research', 'finance', 'market', 'ip', 'execution'],
      lead: ['research', 'finance']
    },
    nordic: {
      order: ['finance', 'research', 'execution', 'market', 'ip'],
      lead: ['finance']
    }
  };
  const narrativeCycle = Object.keys(narrativeModels);
  const modelText = (mode, field) => t(`models.${mode}.${field}`);
  const modelTags = (mode) => (window.I18n ? window.I18n.get(`models.${mode}.tags`) : null) || {};
  const narrativeNote = document.querySelector('.narrative-note');
  const modeName = document.querySelector('.mode-name');
  const modeCount = document.querySelector('.mode-count');
  const modeTicks = document.querySelector('.mode-ticks');
  const pad2 = (value) => String(value).padStart(2, '0');
  if (modeTicks) narrativeCycle.forEach(() => modeTicks.appendChild(document.createElement('i')));
  const syncModeControl = (mode) => {
    const index = narrativeCycle.indexOf(mode);
    if (modeName) modeName.textContent = modelText(mode, 'name');
    if (modeCount) modeCount.textContent = `${pad2(index + 1)} / ${pad2(narrativeCycle.length)}`;
    [...(modeTicks?.children || [])].forEach((tick, tickIndex) => tick.classList.toggle('is-active', tickIndex === index));
  };
  const narrativeChain = document.querySelector('.narrative-chain');
  const modeSteps = [...document.querySelectorAll('.mode-step')];
  let narrativeMode = 'push';
  // Paint a model's highlights, labels and text without moving the steps.
  const renderModel = (mode) => {
    if (!narrativeChain) return;
    const model = narrativeModels[mode];
    const tags = modelTags(mode);
    const caption = modelText(mode, 'caption');
    narrativeChain.setAttribute('aria-label', modelText(mode, 'label'));
    narrativeChain.dataset.mode = mode;
    if (caption) narrativeChain.dataset.caption = caption;
    else delete narrativeChain.dataset.caption;
    [...narrativeChain.children].forEach((item) => {
      const key = item.dataset.key;
      item.classList.toggle('is-lead', model.lead.includes(key));
      item.classList.toggle('is-goal', model.goal === key);
      if (tags[key]) item.dataset.tag = tags[key];
      else delete item.dataset.tag;
    });
    if (narrativeNote) narrativeNote.textContent = modelText(mode, 'note');
    syncModeControl(mode);
  };
  renderModel('push');
  const setNarrativeMode = (mode) => {
    if (!narrativeChain || mode === narrativeMode || !narrativeModels[mode]) return;
    narrativeMode = mode;
    const items = [...narrativeChain.children];
    const before = new Map(items.map((item) => [item, item.getBoundingClientRect()]));
    narrativeModels[mode].order.forEach((key) => {
      const item = items.find((entry) => entry.dataset.key === key);
      if (item) narrativeChain.appendChild(item);
    });
    renderModel(mode);
    if (reducedMotion) return;
    items.forEach((item) => {
      const from = before.get(item);
      const to = item.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (!dx && !dy) return;
      item.animate([
        { transform: `translate(${dx}px, ${dy}px)` },
        // Steps swap along an arc: sideways in a vertical chain, over/under in a row.
        { transform: `translate(${dx * 0.5 + (dy ? 18 : 0)}px, ${dy * 0.5 + (dy ? 0 : dx > 0 ? -16 : 16)}px)`, offset: 0.5 },
        { transform: 'translate(0, 0)' }
      ], { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)' });
    });
  };
  const stepNarrativeMode = (step) => {
    const index = narrativeCycle.indexOf(narrativeMode);
    setNarrativeMode(narrativeCycle[(index + step + narrativeCycle.length) % narrativeCycle.length]);
  };
  // The models take turns every 5s; the arrows step through them and restart
  // the countdown, and hovering or keyboard focus holds the current model.
  const MODE_DELAY = 5000;
  const narrativeModes = document.querySelector('.narrative-modes');
  let modeTimer = 0;
  let modeDue = 0;
  let modeLeft = MODE_DELAY;
  let modeHeld = false;
  const scheduleMode = (delay) => {
    window.clearTimeout(modeTimer);
    modeDue = performance.now() + delay;
    modeTimer = window.setTimeout(() => {
      stepNarrativeMode(1);
      restartModeCycle();
    }, delay);
  };
  const restartModeCycle = () => {
    if (!narrativeModes) return;
    modeLeft = MODE_DELAY;
    narrativeModes.classList.remove('is-cycling');
    void narrativeModes.offsetWidth;
    narrativeModes.classList.add('is-cycling');
    if (!modeHeld) scheduleMode(MODE_DELAY);
  };
  const holdModeCycle = (held) => {
    if (!narrativeModes || held === modeHeld || !narrativeModes.classList.contains('is-cycling')) return;
    modeHeld = held;
    narrativeModes.classList.toggle('is-paused', held);
    if (held) {
      window.clearTimeout(modeTimer);
      modeLeft = Math.max(0, modeDue - performance.now());
    } else {
      scheduleMode(modeLeft);
    }
  };
  if (narrativeModes) {
    narrativeModes.style.setProperty('--mode-delay', `${MODE_DELAY}ms`);
    narrativeModes.addEventListener('pointerenter', () => holdModeCycle(true));
    const keyboardFocus = () => Boolean(narrativeModes.querySelector(':focus-visible'));
    narrativeModes.addEventListener('pointerleave', () => holdModeCycle(keyboardFocus()));
    narrativeModes.addEventListener('focusin', () => holdModeCycle(keyboardFocus() || narrativeModes.matches(':hover')));
    narrativeModes.addEventListener('focusout', (event) => holdModeCycle((narrativeModes.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible')) || narrativeModes.matches(':hover')));
  }
  modeSteps.forEach((button) => button.addEventListener('click', () => {
    stepNarrativeMode(Number(button.dataset.step));
    restartModeCycle();
  }));

  /* ---------- Thesis: the five languages leave the sentence and become one narrative ---------- */
  let thesisPlayed = false;
  const playThesis = (screen) => {
    if (thesisPlayed) return;
    thesisPlayed = true;
    const terms = [...screen.querySelectorAll('.term')];
    const box = screen.querySelector('.transformation');
    const chain = [...screen.querySelectorAll('.narrative-chain li')];
    const arrow = screen.querySelector('.transformation-arrow');
    const stage = screen.querySelector('.screen-inner');
    if (!box) return;
    if (reducedMotion || !arrow || !stage || !box.animate || terms.length !== chain.length) {
      terms.forEach((term) => term.classList.add('is-lit'));
      box.classList.add('is-translated', 'is-chained');
      restartModeCycle();
      return;
    }
    const lightAt = 500;
    terms.forEach((term, index) => window.setTimeout(() => term.classList.add('is-lit'), lightAt + index * 170));
    window.setTimeout(() => {
      const base = stage.getBoundingClientRect();
      const gate = arrow.getBoundingClientRect();
      const mid = { x: gate.left + gate.width / 2 - base.left, y: gate.top + gate.height / 2 - base.top };
      box.classList.add('is-translated');
      terms.forEach((term, index) => {
        const from = term.getBoundingClientRect();
        const to = chain[index].getBoundingClientRect();
        const fly = document.createElement('span');
        fly.className = 'term-flyer';
        fly.setAttribute('aria-hidden', 'true');
        fly.textContent = term.textContent;
        fly.style.font = getComputedStyle(term).font;
        const x0 = from.left - base.left;
        const y0 = from.top - base.top;
        fly.style.transform = `translate(${x0}px, ${y0}px)`;
        stage.appendChild(fly);
        const cx = (x) => x - from.width / 2;
        const cy = (y) => y - from.height / 2;
        const midX = cx(mid.x);
        const midY = cy(mid.y);
        const endX = cx(to.left - base.left + to.width / 2);
        const endY = cy(to.top - base.top + to.height / 2);
        fly.animate([
          { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
          { transform: `translate(${x0}px, ${y0 - 18}px) scale(1.08)`, opacity: 1, offset: 0.12 },
          { transform: `translate(${midX}px, ${midY}px) scale(.62)`, opacity: 0.95, offset: 0.55 },
          { transform: `translate(${endX}px, ${endY}px) scale(.82)`, opacity: 1, offset: 0.88 },
          { transform: `translate(${endX}px, ${endY}px) scale(.82)`, opacity: 0 }
        ], { duration: 1700, delay: index * 150, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' })
          .finished.finally(() => fly.remove());
      });
      window.setTimeout(() => {
        box.classList.add('is-chained');
        restartModeCycle();
      }, 1350 + terms.length * 150);
    }, lightAt + terms.length * 170 + 450);
  };

  const goToScreen = (index) => {
    const next = clamp(index, 0, screens.length - 1);
    screens[next].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  screens.forEach((screen, index) => {
    const button = document.createElement('button');
    const title = screen.dataset.title || t('ui.section', { n: index + 1 });
    button.type = 'button';
    button.setAttribute('aria-label', t('ui.goTo', { title }));
    const label = document.createElement('span');
    label.textContent = title;
    button.appendChild(label);
    button.addEventListener('click', () => goToScreen(index));
    navigator?.appendChild(button);
  });
  const navigatorButtons = [...(navigator?.querySelectorAll('button') || [])];
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];

  const updateActive = (screen, index) => {
    if (index < 0) return;
    activeIndex = index;
    current.textContent = String(index + 1).padStart(2, '0');
    if (screenTitle) screenTitle.textContent = screen.dataset.title || '';
    root.dataset.tone = screen.dataset.tone || 'light';
    root.dataset.screen = screen.id;
    if (isReady) revealScreen(screen);
    // aria-current needs a value; an empty attribute reads as "false".
    const markCurrent = (element, on) => (on ? element.setAttribute('aria-current', 'true') : element.removeAttribute('aria-current'));
    navigatorButtons.forEach((button, buttonIndex) => markCurrent(button, buttonIndex === index));
    navLinks.forEach((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      const active = target === screen || (target && target.id.split('-')[0] === screen.id.split('-')[0]);
      markCurrent(link, active);
    });
    nextButton?.classList.toggle('is-last', index === screens.length - 1);
    document.title = t('ui.docTitle', { title: screen.dataset.title });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) updateActive(visible.target, screens.indexOf(visible.target));
    }, { root: shell, threshold: [0.3, 0.55, 0.8] });
    screens.forEach((screen) => observer.observe(screen));
  } else {
    screens.forEach(revealScreen);
  }

  /* ---------- Cosmos: the hero's night sky runs only while the hero is on screen ---------- */
  const updateSignal = () => {
    if (!field) return;
    const rect = screens[0].getBoundingClientRect();
    const live = rect.bottom > 0 && rect.top < shell.clientHeight;
    if (live) {
      window.clearTimeout(fieldStopTimer);
      fieldStopTimer = 0;
      if (!field.running && !document.hidden) field.start();
    } else if (field.running && !fieldStopTimer) {
      fieldStopTimer = window.setTimeout(() => {
        fieldStopTimer = 0;
        field.stop();
      }, 300);
    }
  };

  const portraitMount = document.querySelector('.portrait-mount');
  const initSignal = () => {
    if (!window.Cosmos || !signalCanvas) return;
    field = window.Cosmos.create({
      canvas: signalCanvas,
      overlay: document.querySelector('.signal-overlay'),
      getOrbit: () => {
        if (!portraitMount || window.innerWidth < 761) return null;
        const base = signalCanvas.getBoundingClientRect();
        const box = portraitMount.getBoundingClientRect();
        return { x: box.left - base.left + box.width / 2, y: box.top - base.top + box.height / 2, r: box.width * 0.67 };
      },
      getAnchor: (w, h) => {
        // Bogota sits at the centre of the open sky between the copy and the profile.
        if (w < 761) return { x: w * 0.5, y: h - 120, rx: w * 0.42, ry: 80 };
        if (w <= 1100) return { x: w * 0.76, y: h * 0.24, rx: w * 0.18, ry: h * 0.15 };
        const base = signalCanvas.getBoundingClientRect();
        const textRight = (element) => {
          if (!element) return 0;
          const range = document.createRange();
          range.selectNodeContents(element);
          return Math.max(...[...range.getClientRects()].map((r) => r.right), 0);
        };
        const heading = document.querySelector('.hero-copy h1');
        const lead = document.querySelector('.hero-lead');
        const actions = document.querySelector('.hero-actions');
        const profile = document.querySelector('.executive-profile');
        const left = Math.max(textRight(heading), textRight(lead)) - base.left;
        const right = (profile ? profile.getBoundingClientRect().left : base.right) - base.left;
        const top = (heading ? heading.getBoundingClientRect().top : base.top) - base.top;
        const bottom = (actions ? actions.getBoundingClientRect().bottom : base.bottom) - base.top;
        const x = (left + right) / 2;
        const y = (top + bottom) / 2;
        return {
          x,
          y,
          rx: Math.max(70, (right - left) / 2 - 12),
          ry: Math.max(90, Math.min(y - h * 0.15, h - 70 - y))
        };
      }
    });
    if (!field) return;
    root.classList.add('has-signal');
    updateSignal();
  };

  /* ---------- Odometer: digits spin on reels up to the portfolio figure ---------- */
  const buildOdometer = (element) => {
    const text = element.textContent.trim();
    const label = document.createElement('span');
    label.className = 'visually-hidden';
    label.textContent = text;
    const reels = document.createElement('span');
    reels.setAttribute('aria-hidden', 'true');
    [...text].forEach((char, index) => {
      if (/\d/.test(char)) {
        const reel = document.createElement('span');
        const strip = document.createElement('span');
        reel.className = 'odo-reel';
        const spins = 2 + (index % 2);
        for (let n = 0; n <= spins * 10 + Number(char); n += 1) {
          const digit = document.createElement('span');
          digit.textContent = String(n % 10);
          strip.appendChild(digit);
        }
        strip.style.transform = `translateY(-${(spins * 10 + Number(char)) * 1.08}em)`;
        reel.style.setProperty('--r', index);
        reel.appendChild(strip);
        reels.appendChild(reel);
      } else {
        const glyph = document.createElement('span');
        glyph.className = 'odo-char';
        glyph.style.setProperty('--r', index);
        glyph.textContent = char === ' ' ? ' ' : char;
        reels.appendChild(glyph);
      }
    });
    element.replaceChildren(label, reels);
    element.classList.add('is-odometer');
  };
  if (!reducedMotion) document.querySelectorAll('[data-odometer]').forEach(buildOdometer);

  /* ---------- Scroll-linked state ---------- */
  const updateScrollEffects = () => {
    scrollFrame = 0;
    const range = Math.max(1, shell.scrollHeight - shell.clientHeight);
    progress.style.height = `${clamp(shell.scrollTop / range * 100, 0, 100)}%`;
    const viewport = Math.max(1, shell.clientHeight);
    screens.forEach((screen) => {
      const sectionProgress = clamp(-screen.getBoundingClientRect().top / viewport, -1, 1);
      screen.style.setProperty('--section-progress', sectionProgress.toFixed(3));
    });
    updateSignal();
  };

  shell.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
  }, { passive: true });

  if (!reducedMotion) {
    window.addEventListener('pointermove', (event) => {
      const x = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const y = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      root.style.setProperty('--pointer-x', x.toFixed(3));
      root.style.setProperty('--pointer-y', y.toFixed(3));
    }, { passive: true });
  }

  nextButton?.addEventListener('click', () => goToScreen(activeIndex + 1));

  /* ---------- Case dialog grows out of the card that opened it ---------- */
  const closeCaseDialog = () => {
    if (dialog?.open) dialog.close();
  };

  const morphFrom = (card) => {
    if (reducedMotion || !card || !dialog.animate) return;
    const from = card.getBoundingClientRect();
    const to = dialog.getBoundingClientRect();
    const inset = [
      Math.max(0, from.top - to.top),
      Math.max(0, to.right - from.right),
      Math.max(0, to.bottom - from.bottom),
      Math.max(0, from.left - to.left)
    ].map((value) => `${value.toFixed(1)}px`).join(' ');
    dialog.classList.add('is-morphing');
    dialog.animate(
      [{ clipPath: `inset(${inset})` }, { clipPath: 'inset(0px 0px 0px 0px)' }],
      { duration: 620, easing: 'cubic-bezier(.76,0,.24,1)' }
    ).finished.finally(() => dialog.classList.remove('is-morphing'));
    dialog.querySelector('.case-dialog-content').animate(
      [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
      { duration: 640, delay: 300, easing: ease, fill: 'backwards' }
    );
  };

  document.querySelectorAll('[data-case-open]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog) return;
      dialog.querySelector('.case-dialog-label').textContent = button.dataset.caseLabel || t('ui.selectedCase');
      dialog.querySelector('#case-dialog-title').textContent = button.dataset.caseTitle || '';
      dialog.querySelector('.case-dialog-body').textContent = button.dataset.caseBody || '';
      dialog.querySelector('.case-dialog-result').textContent = button.dataset.caseResult || '';
      lastFocus = button;
      dialog.showModal();
      morphFrom(button.closest('.editorial-case'));
      dialog.querySelector('.case-dialog-close')?.focus();
    });
  });

  dialog?.addEventListener('close', () => lastFocus?.focus());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeCaseDialog();
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (dialog?.open) closeCaseDialog();
      else closeMenu({ restoreFocus: true });
      return;
    }
    if (nav?.classList.contains('open') && event.key === 'Tab') {
      const items = focusableElements(nav);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (dialog?.open || event.target.closest('input,textarea,select,button,a')) return;
    const directions = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
    if (event.key in directions) {
      event.preventDefault();
      goToScreen(activeIndex + directions[event.key]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToScreen(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goToScreen(screens.length - 1);
    }
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    closeMenu();
    updateScrollEffects();
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => field?.refresh(), 200);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) field?.stop();
    else updateSignal();
  });

  /* ---------- Boot ---------- */
  const setReady = () => {
    if (isReady) return;
    isReady = true;
    document.documentElement.classList.add('is-ready');
    revealScreen(screens[activeIndex]);
  };

  // The strings may arrive after the load event, so check before waiting for it.
  if (document.readyState === 'complete') window.setTimeout(setReady, reducedMotion ? 0 : 450);
  else window.addEventListener('load', () => window.setTimeout(setReady, reducedMotion ? 0 : 450), { once: true });
  window.setTimeout(setReady, 2000);
  (document.fonts?.ready || Promise.resolve()).then(initSignal);
  // Open at the screen named in the hash (a shared link, or a language switch).
  const startIndex = Math.max(0, screens.findIndex((screen) => `#${screen.id}` === location.hash));
  if (startIndex) shell.scrollTo({ top: screens[startIndex].offsetTop, behavior: 'instant' });
  updateActive(screens[startIndex], startIndex);
  updateScrollEffects();
};

// Start once the page strings are in place (see i18n.js).
(window.I18n ? window.I18n.ready : Promise.resolve()).then(bootProfile);
