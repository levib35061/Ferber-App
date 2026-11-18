#!/usr/bin/env python3
"""
One switch for the website's "get the app" line on every page.

    python3 tools/site/app_links.py soon                 # "Coming soon to the App Store."
    python3 tools/site/app_links.py beta <TestFlight public link>
    python3 tools/site/app_links.py live                 # App Store button + Safari app banner

It rewrites the block between <!-- app-cta --> and <!-- /app-cta --> in every
site/*.html page (and, for "live", adds Apple's Smart App Banner and the App
Store link to the structured data on the home page). Run it again to switch.
Plain HTML: nothing on the site depends on JavaScript for this.
"""
import glob
import os
import re
import sys

APP_ID = '6836394392'
APP_STORE_URL = f'https://apps.apple.com/app/id{APP_ID}'
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'site')
BLOCK = re.compile(r'<!-- app-cta -->.*?<!-- /app-cta -->', re.S)
OLD = '<p class="small">Coming soon to the App Store.</p>'
BANNER = f'<meta name="apple-itunes-app" content="app-id={APP_ID}">'
BUTTON = ('display:inline-block;margin-top:6px;padding:14px 26px;border-radius:999px;'
          'background:var(--accent);color:var(--accent-text);font-weight:800;text-decoration:none')


def cta(mode, url=None):
    if mode == 'soon':
        body = '<p class="small">Coming soon to the App Store.</p>'
    elif mode == 'beta':
        body = (f'<p><a href="{url}" style="{BUTTON}">Try the free beta</a></p>\n'
                '    <p class="small">The App Store version is coming soon. The beta runs through Apple&rsquo;s '
                'TestFlight app, and unlocking is free while it lasts.</p>')
    else:
        body = (f'<p><a href="{APP_STORE_URL}" style="{BUTTON}">Get Check In on the App Store</a></p>\n'
                '    <p class="small">For iPhone. Free for 2 nights, then $4.99 once.</p>')
    return f'<!-- app-cta -->\n    {body}\n    <!-- /app-cta -->'


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ('soon', 'beta', 'live') or (sys.argv[1] == 'beta' and len(sys.argv) < 3):
        sys.exit(__doc__)
    mode = sys.argv[1]
    url = sys.argv[2] if mode == 'beta' else None
    if url and not url.startswith('https://testflight.apple.com/'):
        sys.exit('The beta link should start with https://testflight.apple.com/')
    changed = 0
    for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
        s = open(path, encoding='utf-8').read()
        before = s
        if OLD in s and '<!-- app-cta -->' not in s:
            s = s.replace(OLD, cta('soon'))
        if '<!-- app-cta -->' in s:
            s = BLOCK.sub(lambda _: cta(mode, url), s)
        # Safari's app banner only once the app is in the store.
        s = s.replace('\n' + BANNER, '')
        if mode == 'live' and '<!-- app-cta -->' in s:
            s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + BANNER, 1)
        if os.path.basename(path) == 'index.html':
            s = set_download_url(s, APP_STORE_URL if mode == 'live' else None)
        if s != before:
            open(path, 'w', encoding='utf-8').write(s)
            changed += 1
    print(f'{mode}: updated {changed} page(s)')


def set_download_url(s, url):
    """Add or remove the App Store link on the SoftwareApplication in the home page's structured data."""
    s = re.sub(r'\n\s*"downloadUrl": "[^"]*",', '', s)
    if url:
        s = s.replace('"operatingSystem": "iOS",', f'"operatingSystem": "iOS",\n      "downloadUrl": "{url}",', 1)
    return s

if __name__ == '__main__':
    main()
