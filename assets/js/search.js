// Recherche globale : bouton dans l'en-tête, boîte de dialogue native, index généré par scripts/build_search_index.py.
const INDEX_URL = new URL('../data/search-index.json', import.meta.url);
const ROOT_URL = new URL('../../', import.meta.url);
const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

let entries = null;
let dialog, input, list, status, opener;

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const kid of kids) if (kid) node.append(kid);
  return node;
}

async function loadIndex() {
  if (entries) return entries;
  try {
    const response = await fetch(INDEX_URL);
    if (!response.ok) throw new Error(String(response.status));
    entries = await response.json();
  } catch {
    entries = [];
    status.textContent = 'Index de recherche indisponible. Utilisez le menu de navigation.';
  }
  return entries;
}

function score(entry, tokens) {
  const title = norm(entry.title);
  const body = norm([entry.description, ...(entry.headings || [])].join(' '));
  let total = 0;
  for (const token of tokens) {
    if (title.includes(token)) total += 3;
    else if (body.includes(token)) total += 1;
    else return -1;
  }
  return total;
}

function render(query) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  let results;
  if (!tokens.length) {
    results = entries.map((entry) => ({ entry, s: 0 }));
  } else {
    results = entries
      .map((entry) => ({ entry, s: score(entry, tokens) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s);
  }
  list.textContent = '';
  for (const { entry } of results) {
    const href = new URL(entry.url, ROOT_URL).href;
    list.append(el('li', {},
      el('a', { href, class: 'search-result' },
        el('strong', { text: entry.title }),
        el('span', { text: entry.description || '' }))));
  }
  status.textContent = results.length
    ? `${results.length} page${results.length > 1 ? 's' : ''} trouvée${results.length > 1 ? 's' : ''}`
    : 'Aucune page ne correspond. Essayez un nom de personnage, d’arme ou de rubrique.';
}

async function open() {
  if (!dialog) return;
  opener = document.activeElement;
  await loadIndex();
  if (!dialog.open) dialog.showModal();
  input.value = '';
  render('');
  input.focus();
}

function close() {
  if (dialog?.open) dialog.close();
}

export function initSearch() {
  const actions = document.querySelector('.header-actions');
  if (!actions || document.querySelector('.search-toggle')) return;

  const toggle = el('button', {
    type: 'button', class: 'search-toggle', 'aria-haspopup': 'dialog',
    'aria-label': 'Rechercher dans le guide (raccourci : barre oblique)',
  }, el('span', { 'aria-hidden': 'true', text: '⌕' }), el('span', { class: 'search-toggle-label', text: 'RECHERCHER' }));
  actions.insertBefore(toggle, actions.querySelector('.menu-toggle'));

  dialog = el('dialog', { class: 'site-search', 'aria-labelledby': 'site-search-title' });
  const head = el('div', { class: 'site-search-head' },
    el('h2', { id: 'site-search-title', text: 'Rechercher dans le guide' }),
    el('button', { type: 'button', class: 'search-close', 'aria-label': 'Fermer la recherche', text: '×' }));
  input = el('input', { type: 'search', id: 'site-search-input', class: 'input', placeholder: 'Personnages, carte, armes, quiz…', autocomplete: 'off', 'aria-describedby': 'site-search-status' });
  const label = el('label', { for: 'site-search-input', class: 'sr-only', text: 'Rechercher une page' });
  status = el('p', { id: 'site-search-status', class: 'search-status', 'aria-live': 'polite' });
  list = el('ul', { class: 'search-results', 'aria-label': 'Résultats' });
  dialog.append(head, label, input, status, list);
  document.body.append(dialog);

  toggle.addEventListener('click', open);
  dialog.querySelector('.search-close').addEventListener('click', close);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => { if (opener) opener.focus(); });
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); list.querySelector('a')?.focus(); }
  });
  list.addEventListener('keydown', (event) => {
    const links = [...list.querySelectorAll('a')];
    const index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && index < links.length - 1) { event.preventDefault(); links[index + 1].focus(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); (index > 0 ? links[index - 1] : input).focus(); }
  });

  document.addEventListener('keydown', (event) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '') || document.activeElement?.isContentEditable;
    if ((event.key === '/' && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
      event.preventDefault();
      open();
    }
  });
}
