import json, re, difflib
doc = open('/home/user/Ferber-App/docs/VIDEO_SCRIPTS.md').read()
norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower().replace("’", "'"))
NUM = {"2": "two", "3": "three", "40": "forty", "600": "sixhundred"}
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
for n, (vid, key) in enumerate((("a1", "1 —"), ("a2", "2 —"), ("a3", "3 —")), 1):
    i = doc.index("## Video " + key); j = doc.find("**Paste into", i)
    lines = [t for _, t in re.findall(r'^\| (\d\d) \| (.*?) \| \*\[', doc[i:j], re.M)]
    toks = [w for l in lines for w in l.split()]
    sw = [norm(w) for w in toks]
    asr = json.load(open(vid + ".words.json"))
    aw = [NUM.get(norm(x["w"]), norm(x["w"])) for x in asr]
    sm = difflib.SequenceMatcher(None, sw, aw, autojunk=False)
    t = [None] * len(sw); e = [None] * len(sw)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size): t[a + k] = asr[b + k]["s"]; e[a + k] = asr[b + k]["e"]
    # fill gaps by interpolation
    for k in range(len(t)):
        if t[k] is None:
            p = next((t[x] for x in range(k - 1, -1, -1) if t[x] is not None), 0.0)
            q = next((t[x] for x in range(k + 1, len(t)) if t[x] is not None), p + 0.4)
            t[k] = (p + q) / 2; e[k] = t[k] + 0.3
    # chunks: break at sentence ends, or at ~40 characters
    cues, cur = [], []
    for k, w in enumerate(toks):
        cur.append(k)
        text = " ".join(toks[x] for x in cur)
        if re.search(r"[.?!]$", w) or len(text) >= 38 or (re.search(r"[,:]$", w) and len(text) >= 24):
            cues.append(cur); cur = []
    if cur: cues.append(cur)
    out = []
    for c, ks in enumerate(cues, 1):
        start = t[ks[0]]; end = max(e[ks[-1]], start + 0.8)
        nxt = t[cues[c][0]] if c < len(cues) else end + 1
        end = min(end + 0.25, nxt - 0.02)
        out.append(f"{c}\n{ts(start)} --> {ts(end)}\n{' '.join(toks[x] for x in ks)}\n")
    open(f"video{n}.srt", "w").write("\n".join(out))
    print(vid, len(out), "cues")
