/*
 * i18n: every visible string lives in locales/<lang>.json.
 *   data-i18n="key"          replaces the element's text (icons inside are kept)
 *   data-i18n-html="key"     replaces its inner HTML (for inline emphasis)
 *   data-i18n-attr="aria-label:key;alt:key"   replaces attributes
 * Scripts read strings with I18n.t('key', { name: value }) after I18n.ready.
 * The language comes from ?lang=, then the visitor's saved choice; English otherwise.
 * Load this file in <head> without defer so it can hold the page until the
 * strings are in place. The JSON is fetched, so serve the site over HTTP.
 */
(function (global) {
  'use strict';

  const SUPPORTED = ['es', 'en'];
  const FALLBACK = 'en';
  const STORAGE_KEY = 'cv-lang';
  const script = document.currentScript;
  const localesUrl = new URL('locales/', script ? script.src : location.href);
  const root = document.documentElement;

  const readStored = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch (error) { return null; }
  };
  const store = (value) => {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (error) { /* private mode: keep it for this page only */ }
  };
  const pickLanguage = () => {
    const param = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.includes(param)) {
      store(param);
      return param;
    }
    const stored = readStored();
    return SUPPORTED.includes(stored) ? stored : FALLBACK;
  };

  const lang = pickLanguage();
  root.lang = lang;

  // Hold the page (not the loader) until the strings are swapped in, so the
  // other language never flashes. A timeout releases it whatever happens.
  const hold = document.createElement('style');
  hold.textContent = 'html.i18n-pending body{visibility:hidden}';
  document.head.appendChild(hold);
  root.classList.add('i18n-pending');
  const release = () => root.classList.remove('i18n-pending');
  const releaseTimer = setTimeout(release, 1500);

  let dict = {};
  const get = (key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dict);
  const t = (key, vars) => {
    let value = get(key);
    if (typeof value !== 'string') return '';
    if (vars) value = value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
    return value;
  };

  // Replace the element's own text but keep child icons (svg, i) in place.
  const setText = (element, value) => {
    const textNodes = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.data.trim());
    if (!element.children.length) {
      element.textContent = value;
    } else if (textNodes.length) {
      const node = textNodes[0];
      const lead = node.data.match(/^\s*/)[0];
      const trail = node.data.match(/\s*$/)[0];
      node.data = `${lead}${value}${trail}`;
    } else {
      element.insertBefore(document.createTextNode(`${value} `), element.firstChild);
    }
  };

  const apply = (scope = document) => {
    scope.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = get(element.dataset.i18n);
      if (typeof value === 'string') setText(element, value);
    });
    scope.querySelectorAll('[data-i18n-html]').forEach((element) => {
      const value = get(element.dataset.i18nHtml);
      if (typeof value === 'string') element.innerHTML = value;
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach((element) => {
      element.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attribute, key] = pair.split(':').map((part) => part.trim());
        const value = get(key);
        if (attribute && typeof value === 'string') element.setAttribute(attribute, value);
      });
    });
  };

  const wireSwitches = () => {
    document.querySelectorAll('[data-lang-switch] [data-lang]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
      button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });
  };

  // Switching reloads the page at the screen the visitor was reading, so every
  // script starts again with the new strings.
  const setLanguage = (next) => {
    if (!SUPPORTED.includes(next) || next === lang) return;
    store(next);
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    // cv_profile.js publishes the screen being read; the case page has none.
    if (root.dataset.screen) url.hash = root.dataset.screen;
    history.replaceState(null, '', url);
    location.reload();
  };

  const load = (code) => fetch(new URL(`${code}.json`, localesUrl)).then((response) => {
    if (!response.ok) throw new Error(`${code}.json: ${response.status}`);
    return response.json();
  });
  const domReady = new Promise((resolve) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve, { once: true });
    else resolve();
  });

  const ready = load(lang)
    .catch((error) => (lang === FALLBACK ? Promise.reject(error) : load(FALLBACK)))
    .then((data) => { dict = data; })
    .catch((error) => console.warn('i18n: strings unavailable, showing the page as written.', error))
    .then(() => domReady)
    .then(() => {
      apply();
      wireSwitches();
      clearTimeout(releaseTimer);
      release();
    });

  global.I18n = { lang, ready, t, get, apply, setLanguage, get locale() { return t('meta.locale') || lang; } };
})(window);
