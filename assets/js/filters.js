// Filtres par niveau de confiance : Officiel, Presse, Communauté, Rumeur.
// Un élément qui porte plusieurs étiquettes prend la plus prudente (rumeur < communauté < presse < officiel).
const TRUST = { rumor: 0, community: 1, press: 2, official: 3 };
const LABELS = { official: 'Officiel', press: 'Presse', community: 'Communauté', rumor: 'Rumeur' };
const CLASS_TO_STATUS = { 'tag-official': 'official', 'tag-press': 'press', 'tag-community': 'community', 'tag-rumor': 'rumor' };
const ITEM_SELECTOR = 'tr, .panel, .region-card, article, li';

function statusOf(tag) {
  return Object.keys(CLASS_TO_STATUS).find((cls) => tag.classList.contains(cls))
    ? CLASS_TO_STATUS[Object.keys(CLASS_TO_STATUS).find((cls) => tag.classList.contains(cls))]
    : null;
}

function itemFor(tag, container) {
  const item = tag.closest(ITEM_SELECTOR);
  return item && container.contains(item) && item !== container ? item : null;
}

export function initFilters() {
  document.querySelectorAll('section.page-section > .container').forEach((container) => {
    const tags = [...container.querySelectorAll('.tag')];
    const items = new Map();
    for (const tag of tags) {
      const status = statusOf(tag);
      const item = itemFor(tag, container);
      if (!status || !item) continue;
      const current = items.get(item);
      if (!current || TRUST[status] < TRUST[current]) items.set(item, status);
    }
    if (items.size < 3) return;

    const statuses = new Set(items.values());
    const first = [...items.keys()][0];
    let topLevel = first;
    while (topLevel.parentElement && topLevel.parentElement !== container) topLevel = topLevel.parentElement;

    items.forEach((status, item) => {
      item.dataset.filterItem = '';
      item.dataset.status = status;
    });

    const bar = document.createElement('div');
    bar.className = 'filter-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filtrer par niveau de confiance');
    const count = document.createElement('p');
    count.className = 'filter-count';
    count.setAttribute('aria-live', 'polite');

    const buttons = [['all', 'Tous']].concat(
      Object.keys(TRUST).filter((s) => statuses.has(s)).reverse().map((s) => [s, LABELS[s]]),
    ).map(([value, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-btn';
      button.dataset.filter = value;
      button.setAttribute('aria-pressed', value === 'all' ? 'true' : 'false');
      button.textContent = label;
      bar.append(button);
      return button;
    });

    function apply(value) {
      let shown = 0;
      items.forEach((status, item) => {
        const visible = value === 'all' || status === value;
        item.hidden = !visible;
        if (visible) shown++;
      });
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === value)));
      count.textContent = `${shown} élément${shown > 1 ? 's' : ''} sur ${items.size} affiché${shown > 1 ? 's' : ''}`;
    }

    bar.addEventListener('click', (event) => {
      const button = event.target.closest('.filter-btn');
      if (button) apply(button.dataset.filter);
    });

    container.insertBefore(bar, topLevel);
    container.insertBefore(count, topLevel);
    apply('all');
  });
}
