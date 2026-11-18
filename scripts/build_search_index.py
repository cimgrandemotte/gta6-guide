#!/usr/bin/env python3
"""Génère assets/data/search-index.json à partir des pages HTML du site.

Usage : python3 scripts/build_search_index.py
Aucune dépendance externe. Relancer après toute modification de titre ou de titre de section.
"""
import json
import pathlib
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
SUFFIX = ' | GTA VI — Le guide ultime'


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ''
        self.desc = ''
        self.h1 = ''
        self.heads = []
        self._cur = None
        self._buf = ''

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'meta' and d.get('name') == 'description':
            self.desc = d.get('content', '')
        if tag in ('title', 'h1', 'h2', 'h3'):
            self._cur = tag
            self._buf = ''

    def handle_endtag(self, tag):
        if tag == self._cur:
            text = ' '.join(self._buf.split())
            if tag == 'title':
                self.title = text.replace(SUFFIX, '')
            elif tag == 'h1':
                self.h1 = text
            elif text:
                self.heads.append(text)
            self._cur = None

    def handle_data(self, data):
        if self._cur:
            self._buf += data


def main():
    files = [ROOT / 'index.html'] + sorted(ROOT.glob('pages/*/index.html'))
    entries = []
    for path in files:
        p = PageParser()
        p.feed(path.read_text(encoding='utf-8'))
        url = path.relative_to(ROOT).as_posix()
        entries.append({
            'title': p.title or p.h1,
            'description': p.desc,
            'url': url,
            'headings': p.heads[:24],
        })
    out = ROOT / 'assets' / 'data' / 'search-index.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(entries)} pages indexées -> {out.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
