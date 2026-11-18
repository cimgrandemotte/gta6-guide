// Carte interactive conceptuelle : repères des six régions, recherche, filtres région et niveau de confiance.
// Les positions sont indicatives sur l'image IA ; elles ne reproduisent pas la carte du jeu.
const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const STATUS = { official: 'Officiel', press: 'Presse', community: 'Communauté', rumor: 'Rumeur' };

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

function tagFor(status) {
  return el('span', { class: `tag tag-${status}`, text: STATUS[status] || status });
}

export async function initAtlas() {
  const root = document.querySelector('[data-atlas]');
  if (!root) return;

  let data;
  try {
    const response = await fetch(new URL('../data/atlas.json', import.meta.url));
    if (!response.ok) throw new Error(String(response.status));
    data = await response.json();
  } catch {
    root.append(el('p', { class: 'note', text: 'La carte interactive n’a pas pu être chargée. Les six régions restent décrites dans les cartes ci-dessous.' }));
    return;
  }

  const state = { q: '', region: 'all', status: 'all', selected: null };
  const regionName = Object.fromEntries(data.regions.map((r) => [r.id, r.name]));
  root.textContent = '';
  root.classList.add('is-ready');

  // Barre d'outils
  const search = el('input', { type: 'search', id: 'atlas-search', class: 'input', placeholder: 'Rechercher un lieu ou une région', autocomplete: 'off' });
  const regionGroup = el('div', { class: 'atlas-chips', role: 'group', 'aria-label': 'Filtrer par région' });
  const regionButtons = [['all', 'Toutes']].concat(data.regions.map((r) => [r.id, r.name])).map(([value, text]) =>
    el('button', { type: 'button', class: 'filter-btn', 'data-region': value, 'aria-pressed': value === 'all' ? 'true' : 'false', text }));
  regionGroup.append(...regionButtons);
  const statusGroup = el('div', { class: 'atlas-chips', role: 'group', 'aria-label': 'Filtrer par niveau de confiance' });
  const statusButtons = [['all', 'Tous niveaux'], ['official', 'Officiel'], ['press', 'Presse']].map(([value, text]) =>
    el('button', { type: 'button', class: 'filter-btn', 'data-status': value, 'aria-pressed': value === 'all' ? 'true' : 'false', text }));
  statusGroup.append(...statusButtons);
  const reset = el('button', { type: 'button', class: 'check-btn', text: 'Réinitialiser les filtres' });
  const count = el('p', { class: 'filter-count', 'aria-live': 'polite' });
  root.append(el('div', { class: 'atlas-toolbar' },
    el('label', { for: 'atlas-search', class: 'atlas-label', text: 'Recherche' }), search, regionGroup, statusGroup, reset, count));

  // Scène : image conceptuelle + repères
  const stage = el('div', { class: 'atlas-stage', role: 'group', 'aria-label': 'Image conceptuelle avec repères des régions' });
  const img = el('img', { src: '../../assets/images/map/map_leonida_aerial_01.jpg', alt: 'Vue aérienne conceptuelle générée par IA, non officielle : ce n’est pas la carte du jeu', width: '1672', height: '941', loading: 'lazy' });
  const canvas = el('div', { class: 'atlas-canvas' });
  canvas.append(img);
  stage.append(canvas);
  const pins = new Map();
  for (const region of data.regions) {
    const pin = el('button', {
      type: 'button', class: 'atlas-pin', 'data-id': region.id,
      'aria-label': `${region.name}, région officielle : afficher les détails`,
      style: `left:${region.x}%;top:${region.y}%`,
    }, el('span', { class: 'atlas-pin-dot', 'aria-hidden': 'true' }), el('span', { class: 'atlas-pin-label', 'aria-hidden': 'true', text: region.name }));
    pin.addEventListener('click', () => select(region.id));
    pins.set(region.id, pin);
    canvas.append(pin);
  }
  // Zoom et déplacement (molette, boutons, glisser). Les repères gardent une taille constante.
  let zoom = 1, tx = 0, ty = 0, drag = null;
  const zoomIn = el('button', { type: 'button', 'aria-label': 'Zoom avant', text: '+' });
  const zoomOut = el('button', { type: 'button', 'aria-label': 'Zoom arrière', text: '−' });
  const zoomReset = el('button', { type: 'button', 'aria-label': 'Réinitialiser la vue', text: '⟲' });
  stage.append(el('div', { class: 'atlas-zoom' }, zoomIn, zoomOut, zoomReset));
  const sw = () => stage.clientWidth, sh = () => stage.clientHeight;
  function applyView() {
    tx = Math.min(0, Math.max(tx, sw() - sw() * zoom));
    ty = Math.min(0, Math.max(ty, sh() - sh() * zoom));
    canvas.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
    canvas.style.setProperty('--zoom', String(zoom));
  }
  function zoomAt(factor, cx, cy) {
    const next = Math.min(4, Math.max(1, zoom * factor));
    const k = next / zoom;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    zoom = next;
    applyView();
  }
  zoomIn.addEventListener('click', () => zoomAt(1.5, sw() / 2, sh() / 2));
  zoomOut.addEventListener('click', () => zoomAt(1 / 1.5, sw() / 2, sh() / 2));
  zoomReset.addEventListener('click', () => { zoom = 1; tx = 0; ty = 0; applyView(); });
  stage.addEventListener('wheel', (event) => {
    event.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomAt(event.deltaY < 0 ? 1.2 : 1 / 1.2, event.clientX - r.left, event.clientY - r.top);
  }, { passive: false });
  stage.addEventListener('pointerdown', (event) => {
    if (zoom <= 1 || event.target.closest('.atlas-zoom, .atlas-pin')) return;
    drag = { x: event.clientX, y: event.clientY, tx, ty };
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', (event) => {
    if (!drag) return;
    tx = drag.tx + (event.clientX - drag.x);
    ty = drag.ty + (event.clientY - drag.y);
    applyView();
  });
  const endDrag = () => { drag = null; stage.classList.remove('is-dragging'); };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  const note = el('p', { class: 'atlas-note', text: data.note });

  // Détails
  const panel = el('aside', { class: 'atlas-panel', 'aria-live': 'polite', 'aria-labelledby': 'atlas-panel-title' });

  // Liste (alternative clavier et lecteur d'écran)
  const listItems = [
    ...data.regions.map((r) => ({ kind: 'region', id: r.id, name: r.name, status: r.status, region: r.id, desc: r.desc })),
    ...data.places.map((p) => ({ kind: 'place', id: p.id, name: p.name, status: p.status, region: p.region, desc: p.desc })),
  ];
  const listRows = new Map();
  const list = el('ul', { class: 'atlas-list', 'aria-label': 'Tous les lieux' });
  for (const item of listItems) {
    const button = el('button', { type: 'button', class: 'atlas-row', 'data-id': item.id, 'aria-pressed': 'false' },
      el('strong', { text: item.name }),
      el('span', { class: 'atlas-row-meta', text: item.kind === 'region' ? 'Région' : (item.region ? regionName[item.region] : 'Lieu, région non précisée') }),
      tagFor(item.status));
    button.addEventListener('click', () => select(item.id));
    listRows.set(item.id, { row: button, item });
    list.append(el('li', {}, button));
  }

  root.append(stage, note, el('div', { class: 'atlas-grid' }, panel, el('div', {}, el('h3', { class: 'atlas-list-title', text: 'Liste des lieux' }), list)));

  function select(id) {
    state.selected = id;
    const entry = listItems.find((i) => i.id === id);
    panel.textContent = '';
    if (!entry) {
      panel.append(el('p', { text: 'Sélectionnez une région ou un lieu sur la carte ou dans la liste.' }));
    } else {
      const source = entry.kind === 'region'
        ? data.regions.find((r) => r.id === id)
        : data.places.find((p) => p.id === id);
      const sourceNode = source.sourceUrl
        ? el('a', { href: source.sourceUrl, target: '_blank', rel: 'noopener', text: `${source.source} ↗` })
        : el('span', { text: source.source });
      panel.append(
        el('span', { class: 'eyebrow', text: entry.kind === 'region' ? 'Région' : 'Lieu' }),
        el('h3', { id: 'atlas-panel-title', text: entry.name }),
        tagFor(entry.status),
        el('p', { text: entry.desc }),
        source.details ? el('p', { class: 'muted', text: source.details }) : null,
        el('p', { class: 'atlas-source' }, el('strong', { text: 'Source : ' }), sourceNode),
        entry.kind === 'region' ? el('p', { class: 'note', text: 'Repère indicatif sur l’image IA. Ce n’est pas une coordonnée de jeu.' }) : null,
      );
    }
    listRows.forEach(({ row }, key) => row.setAttribute('aria-pressed', String(key === id)));
    pins.forEach((pin, key) => pin.setAttribute('aria-pressed', String(key === id)));
  }

  function matches(item) {
    if (state.status !== 'all' && item.status !== state.status) return false;
    if (state.region !== 'all') {
      if (item.kind === 'region' ? item.id !== state.region : item.region !== state.region) return false;
    }
    const haystack = norm(`${item.name} ${item.desc}`);
    return state.q.split(/\s+/).filter(Boolean).every((t) => haystack.includes(t));
  }

  function apply() {
    let shown = 0;
    for (const item of listItems) {
      const ok = matches(item);
      if (ok) shown++;
      listRows.get(item.id).row.parentElement.hidden = !ok;
      if (item.kind === 'region') pins.get(item.id).hidden = !ok;
    }
    regionButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.region === state.region)));
    statusButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.status === state.status)));
    count.textContent = `${shown} élément${shown > 1 ? 's' : ''} affiché${shown > 1 ? 's' : ''} sur ${listItems.length}`;
  }

  search.addEventListener('input', () => { state.q = norm(search.value.trim()); apply(); });
  regionGroup.addEventListener('click', (e) => { const b = e.target.closest('[data-region]'); if (b) { state.region = b.dataset.region; apply(); } });
  statusGroup.addEventListener('click', (e) => { const b = e.target.closest('[data-status]'); if (b) { state.status = b.dataset.status; apply(); } });
  reset.addEventListener('click', () => {
    Object.assign(state, { q: '', region: 'all', status: 'all' });
    search.value = '';
    apply();
  });

  apply();
  select(null);
}
