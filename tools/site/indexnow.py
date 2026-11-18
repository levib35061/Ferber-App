#!/usr/bin/env python3
"""
Tell Bing (and other IndexNow search engines) that pages changed.

    python3 tools/site/indexnow.py                 # every page in site/sitemap.xml
    python3 tools/site/indexnow.py help.html       # just these pages

The key is the file site/<key>.txt (public on purpose; it only proves we own
the site). Run it after the site is published, never before.
"""
import glob
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'site')
HOST = 'ferbertimer.com'
keys = [os.path.basename(p)[:-4] for p in glob.glob(os.path.join(ROOT, '*.txt')) if re.fullmatch(r'[0-9a-f]{32}\.txt', os.path.basename(p))]
if len(keys) != 1:
    sys.exit('Expected exactly one IndexNow key file (32 hex characters + .txt) in site/')
key = keys[0]
if len(sys.argv) > 1:
    urls = [f'https://{HOST}/{p.lstrip("/")}' for p in sys.argv[1:]]
else:
    urls = re.findall(r'<loc>([^<]+)</loc>', open(os.path.join(ROOT, 'sitemap.xml')).read())
body = json.dumps({'host': HOST, 'key': key, 'keyLocation': f'https://{HOST}/{key}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
with urllib.request.urlopen(req, timeout=30) as r:
    print(r.status, f'{len(urls)} URL(s) submitted')
