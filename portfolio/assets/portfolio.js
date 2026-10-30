/* VR portfolio: facet filters, search and sorting over the project cards.
 * State lives in the URL hash (#type=transfer&sector=defense&q=…&sort=value) so a filtered
 * view can be shared. Without JavaScript every project is simply listed. */
(() => {
  'use strict';
  const form = document.querySelector('[data-filters]');
  const list = document.querySelector('[data-projects]');
  if (!form || !list) return;
  const cards = [...list.children];
  const groups = [...form.querySelectorAll('[data-facet]')];
  const query = form.querySelector('[data-q]');
  const sort = form.querySelector('[data-sort]');
  const shown = form.querySelector('[data-shown]');
  const reset = form.querySelector('[data-reset]');
  const none = document.querySelector('[data-none]');
  const fold = (value) => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  cards.forEach((card, index) => { card.dataset.index = index; card.dataset.fold = fold(card.dataset.text); });

  const read = () => {
    const state = { q: query.value.trim(), sort: sort.value };
    groups.forEach((group) => { state[group.dataset.facet] = [...group.querySelectorAll('input:checked')].map((input) => input.value); });
    return state;
  };

  const apply = (push = true) => {
    const state = read();
    const terms = fold(state.q).split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach((card) => {
      // Within a group any checked value matches (OR); across groups all must match (AND).
      const facetsOk = groups.every((group) => {
        const wanted = state[group.dataset.facet];
        if (!wanted.length) return true;
        const have = (card.dataset[group.dataset.facet] || '').split(' ');
        return wanted.some((value) => have.includes(value));
      });
      const textOk = terms.every((term) => card.dataset.fold.includes(term));
      card.hidden = !(facetsOk && textOk);
      if (!card.hidden) visible += 1;
    });
    const order = [...cards].sort((a, b) => {
      if (state.sort === 'value') return Number(b.dataset.usd) - Number(a.dataset.usd);
      if (state.sort === 'recent') return String(b.dataset.year || '0').localeCompare(String(a.dataset.year || '0'));
      return Number(a.dataset.index) - Number(b.dataset.index);
    });
    order.forEach((card) => list.appendChild(card));
    shown.textContent = shown.dataset.template.replace('{n}', visible).replace('{total}', cards.length);
    none.hidden = visible > 0;
    const active = state.q || state.sort !== 'featured' || groups.some((group) => state[group.dataset.facet].length);
    reset.hidden = !active;
    if (push) {
      const params = new URLSearchParams();
      groups.forEach((group) => { if (state[group.dataset.facet].length) params.set(group.dataset.facet, state[group.dataset.facet].join(',')); });
      if (state.q) params.set('q', state.q);
      if (state.sort !== 'featured') params.set('sort', state.sort);
      const hash = params.toString();
      history.replaceState(null, '', hash ? `#${hash}` : location.pathname + location.search);
    }
  };

  // restore a shared view
  const params = new URLSearchParams(location.hash.slice(1));
  groups.forEach((group) => {
    const values = (params.get(group.dataset.facet) || '').split(',');
    group.querySelectorAll('input').forEach((input) => { input.checked = values.includes(input.value); });
  });
  if (params.get('q')) query.value = params.get('q');
  if (params.get('sort')) sort.value = params.get('sort');

  form.addEventListener('change', () => apply());
  query.addEventListener('input', () => apply());
  reset.addEventListener('click', () => {
    form.querySelectorAll('input[type=checkbox]').forEach((input) => { input.checked = false; });
    query.value = '';
    sort.value = 'featured';
    apply();
    query.focus();
  });
  apply(false);
})();
