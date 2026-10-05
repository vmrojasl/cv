const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'cv_profile.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'cv_profile.js'), 'utf8');

test('provides an accessible immersive navigation layer', () => {
  assert.match(html, /id="primary-nav"/);
  assert.match(html, /aria-controls="primary-nav"/);
  assert.match(html, /class="section-navigator"/);
  assert.match(js, /focusableElements/);
  assert.match(js, /event\.key === 'Escape'/);
});

test('provides an accessible case detail dialog', () => {
  assert.match(html, /<dialog[^>]+id="case-dialog"/);
  assert.match(html, /data-case-open/);
  assert.match(js, /showModal/);
  assert.match(js, /closeCaseDialog/);
});

test('supports progressive enhancement and reduced motion', () => {
  assert.match(html, /class="site-loader"/);
  assert.match(js, /document\.documentElement\.classList\.add\('is-ready'\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /@media\(max-width:760px\)/);
});

test('mobile layout allows long content without horizontal clipping', () => {
  assert.match(css, /overflow-wrap:anywhere/);
  assert.match(css, /height:auto/);
  assert.match(css, /scroll-snap-type:y proximity/);
  assert.match(css, /max-width:100vw/);
  assert.match(css, /hero-actions\{flex-wrap:wrap/);
  assert.match(css, /executive-profile>div:last-child\{width:100%;max-width:100%/);
});
const story = fs.readFileSync('stories/natural_science_case.html', 'utf8');
test('story is standalone and returns to the portfolio', () => {
  assert.doesNotMatch(story, /\/static\/shell\/styles\.css/);
  assert.match(story, /\.\.\/index\.html#cases-a/);
});

test('every page string exists in both languages', () => {
  const load = (lang) => JSON.parse(fs.readFileSync(path.join(root, 'locales', `${lang}.json`), 'utf8'));
  const flatten = (node, prefix = '') => Object.entries(node).flatMap(([key, value]) => (
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  ));
  const en = load('en');
  const es = load('es');
  const enKeys = flatten(en).filter((key) => !key.startsWith('cosmos.places.'));
  const esKeys = flatten(es).filter((key) => !key.startsWith('cosmos.places.'));
  assert.deepEqual([...esKeys].sort(), [...enKeys].sort());

  const has = (dict, key) => typeof key.split('.').reduce((node, part) => node?.[part], dict) === 'string';
  const pages = ['index.html', 'portfolio.html', 'stories/natural_science_case.html'];
  pages.forEach((page) => {
    const source = fs.readFileSync(path.join(root, page), 'utf8');
    const keys = [
      ...[...source.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map((match) => match[1]),
      ...[...source.matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap((match) => match[1].split(';').map((pair) => pair.split(':')[1]))
    ];
    keys.forEach((key) => {
      assert.ok(has(en, key), `${page}: ${key} missing in en.json`);
      assert.ok(has(es, key), `${page}: ${key} missing in es.json`);
    });
  });
});
