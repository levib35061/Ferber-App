#!/usr/bin/env python3
"""
Plain-Markdown copies of the site's pages, for people and AI tools alike.

    python3 tools/site/markdown.py          # regenerate every copy
    python3 tools/site/markdown.py --check  # exit 1 if any copy is out of date

Each page `site/<name>.html` gets `site/<name>.md`: the same words as the page's
main content (no navigation, styles or scripts), with the page's title and address
at the top. Nothing here is hidden or different from what visitors see: every page
links to its copy in the footer ("Plain-text version"), and llms.txt lists them.
Run it after editing a page (AGENTS.md). Needs: pip install markdownify
"""
import os
import re
import sys

from bs4 import BeautifulSoup
from markdownify import markdownify

SITE = os.path.join(os.path.dirname(__file__), '..', '..', 'site')
BASE = 'https://ferbertimer.com/'
# Interactive tools (the web timer) and the verification file have no reading content.
SKIP = {'timer.html', 'googlea444e485a0dafb68.html'}


def pages():
    return sorted(f for f in os.listdir(SITE) if f.endswith('.html') and f not in SKIP)


def to_markdown(html: str, name: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    title = soup.title.get_text(strip=True) if soup.title else name
    main = soup.find('main') or soup.body
    for tag in main.find_all(['script', 'style', 'svg', 'button', 'form', 'input', 'select', 'iframe']):
        tag.decompose()
    # Decorative marks (e.g. ✓) duplicate a screen-reader word next to them: keep the word.
    for tag in main.find_all(attrs={'aria-hidden': 'true'}):
        tag.decompose()
    # The "Plain-text version" link points at this very file.
    for a in main.find_all('a', class_='md-link'):
        a.decompose()
    # Make links absolute so the copy works on its own.
    for a in main.find_all('a', href=True):
        href = a['href']
        if href.startswith('#') or re.match(r'^[a-z]+:', href):
            continue
        a['href'] = BASE + (href[2:] if href.startswith('./') else href).replace(BASE, '')
        if a['href'] == BASE + '':
            a['href'] = BASE
    body = markdownify(str(main), heading_style='ATX', bullets='-', strip=['main', 'article', 'section', 'div', 'nav', 'span', 'figure', 'figcaption'])
    body = re.sub(r'\n{3,}', '\n\n', body).strip()
    url = BASE if name == 'index.html' else BASE + name
    return f'# {title}\n\nSource: {url}\n\n{body}\n'


def main():
    check = '--check' in sys.argv
    stale = []
    for name in pages():
        with open(os.path.join(SITE, name), encoding='utf-8') as f:
            md = to_markdown(f.read(), name)
        out = os.path.join(SITE, name[:-5] + '.md')
        old = open(out, encoding='utf-8').read() if os.path.exists(out) else None
        if old != md:
            stale.append(name[:-5] + '.md')
            if not check:
                with open(out, 'w', encoding='utf-8') as f:
                    f.write(md)
    if check and stale:
        print('Out of date:', ', '.join(stale), '\nRun: python3 tools/site/markdown.py')
        sys.exit(1)
    print(('Up to date' if check else 'Wrote') + f': {len(pages())} pages' + (f' ({len(stale)} changed)' if stale else ''))


if __name__ == '__main__':
    main()
