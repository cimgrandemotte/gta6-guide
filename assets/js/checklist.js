// Checklists persistantes (localStorage), export et import JSON, réinitialisation.
// Clé : gta6-guide:checklist:<identifiant>. Aucune donnée n'est envoyée sur le réseau.
const APP = 'gta6-ultimate-guide';

function storageKey(id) {
  return `gta6-guide:checklist:${id}`;
}

function readState(id) {
  try {
    const raw = localStorage.getItem(storageKey(id));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed.checked === 'object' ? parsed.checked : {};
  } catch {
    return {};
  }
}

function writeState(id, checked) {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify({ checked, updated: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

function setup(section) {
  const id = section.dataset.checklist;
  const boxes = [...section.querySelectorAll('input[type="checkbox"][data-check-id]')];
  const total = boxes.length;
  let checked = readState(id);

  const tools = document.createElement('div');
  tools.className = 'check-tools';
  const progress = document.createElement('div');
  progress.className = 'check-progress';
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-label', 'Progression de la checklist');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', String(total));
  const fill = document.createElement('div');
  fill.className = 'check-progress-fill';
  progress.append(fill);
  const label = document.createElement('p');
  label.className = 'check-label';
  label.setAttribute('aria-live', 'polite');

  const exportBtn = button('Exporter', 'Exporter la checklist en JSON');
  const importBtn = button('Importer', 'Importer une checklist JSON');
  const resetBtn = button('Réinitialiser', 'Réinitialiser la checklist');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;
  tools.append(progress, label, exportBtn, importBtn, resetBtn, fileInput);
  section.querySelector('.container').insertBefore(tools, section.querySelector('.check-list'));

  function button(text, aria) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'check-btn';
    b.textContent = text;
    b.setAttribute('aria-label', aria);
    return b;
  }

  let message = '';

  function say(text) {
    message = text;
    refresh();
  }

  function refresh() {
    const done = boxes.filter((b) => checked[b.dataset.checkId]).length;
    boxes.forEach((b) => { b.checked = !!checked[b.dataset.checkId]; });
    progress.setAttribute('aria-valuenow', String(done));
    fill.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
    label.textContent = message || `${done} sur ${total} étape${total > 1 ? 's' : ''} terminée${done > 1 ? 's' : ''}. Progression enregistrée dans ce navigateur.`;
  }

  boxes.forEach((box) => {
    box.addEventListener('change', () => {
      checked = { ...checked, [box.dataset.checkId]: box.checked };
      message = writeState(id, checked) ? '' : 'Sauvegarde indisponible : cette progression ne sera pas conservée.';
      refresh();
    });
  });

  exportBtn.addEventListener('click', () => {
    const payload = { app: APP, checklist: id, exportedAt: new Date().toISOString(), checked };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gta6-checklist-${id}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    say('Checklist exportée.');
  });

  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== APP || data.checklist !== id || typeof data.checked !== 'object') throw new Error('format');
      const known = new Set(boxes.map((b) => b.dataset.checkId));
      const next = {};
      for (const [key, value] of Object.entries(data.checked)) {
        if (known.has(key) && typeof value === 'boolean') next[key] = value;
      }
      checked = next;
      writeState(id, checked);
      refresh();
        say('Checklist importée.');
    } catch {
        say('Fichier non reconnu : utilisez un export de cette checklist.');
    }
  });

  resetBtn.addEventListener('click', () => {
    if (!window.confirm('Réinitialiser toutes les étapes de cette checklist ?')) return;
    checked = {};
    writeState(id, checked);
    say('Checklist réinitialisée.');
  });

  refresh();
}

export function initChecklists() {
  document.querySelectorAll('[data-checklist]').forEach(setup);
}
