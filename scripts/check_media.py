#!/usr/bin/env python3
"""Contrôle des images : chaque image du site doit apparaître une seule fois.

Usage : python3 scripts/check_media.py
Sort en erreur (code 1) si une image est dupliquée, orpheline ou si un format interdit est présent.
"""
import collections
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets' / 'images'
SOURCES = [ROOT / 'index.html', ROOT / '404.html', *sorted((ROOT / 'pages').glob('*/index.html')),
           *sorted((ROOT / 'assets' / 'css').glob('*.css')), *sorted((ROOT / 'assets' / 'js').glob('*.js'))]

errors = []
forbidden = [p for p in ASSETS.rglob('*') if p.suffix.lower() in ('.png', '.svg', '.webp', '.gif')]
if forbidden:
    errors.append(f'formats interdits dans assets/images : {[p.name for p in forbidden]}')

images = sorted(p for p in ASSETS.rglob('*.jpg'))
refs = collections.defaultdict(list)
for src in SOURCES:
    text = src.read_text(encoding='utf-8')
    # Les aperçus réseaux sociaux (og:image, twitter:image) ne sont pas affichés sur la page : exclus du comptage.
    text = re.sub(r'<meta[^>]*(?:og:image|twitter:image)[^>]*>', '', text)
    for match in re.findall(r'images/([\w/.-]+\.jpg)', text):
        refs[match].append(src.relative_to(ROOT).as_posix())

for img in images:
    rel = img.relative_to(ASSETS).as_posix()
    count = len(refs.get(rel, []))
    if count == 0:
        errors.append(f'orpheline (aucune utilisation) : {rel}')
    elif count > 1:
        errors.append(f'dupliquée ({count} utilisations) : {rel} -> {", ".join(sorted(set(refs[rel])))}')
for rel in refs:
    if not (ASSETS / rel).exists():
        errors.append(f'référence vers un fichier absent : {rel}')

print(f'{len(images)} images, {sum(1 for r in refs.values() if len(r)==1)} utilisée(s) une fois')
if errors:
    print('\n'.join('ERREUR ' + e for e in errors))
    sys.exit(1)
print('OK : aucune image dupliquée, orpheline ou au format interdit.')
