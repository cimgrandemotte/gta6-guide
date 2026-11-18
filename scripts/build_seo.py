#!/usr/bin/env python3
"""Ajoute la balise canonique aux pages, puis génère sitemap.xml et robots.txt.

Usage : python3 scripts/build_seo.py https://votre-domaine.fr/
Le domaine doit être celui de la mise en ligne (avec https et la barre finale).
Relancer le script à chaque changement de domaine. Idempotent.
"""
import pathlib
import re
import sys
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parents[1]
base = (sys.argv[1] if len(sys.argv) > 1 else 'https://example.com/').rstrip('/') + '/'
files = [ROOT / 'index.html'] + sorted(ROOT.glob('pages/*/index.html'))
urls = []
for f in files:
    rel = f.relative_to(ROOT).as_posix()
    url = base + ('' if rel == 'index.html' else rel.replace('index.html', ''))
    urls.append(url)
    html = f.read_text(encoding='utf-8')
    html = re.sub(r'<link rel="canonical"[^>]*>\n?', '', html)
    tag = f'<link rel="canonical" href="{url}">'
    html = html.replace('</head>', tag + '\n</head>', 1)
    f.write_text(html, encoding='utf-8')

today = date.today().isoformat()
sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sitemap += [f'  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>' for u in urls]
sitemap.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(sitemap) + '\n', encoding='utf-8')
(ROOT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {base}sitemap.xml\n', encoding='utf-8')
print(f'{len(urls)} canoniques, sitemap.xml et robots.txt générés pour {base}')
