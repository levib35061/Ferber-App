import json, re, difflib
doc = open('/home/user/Ferber-App/docs/VIDEO_SCRIPTS.md').read()
norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower().replace("’", "'"))
NUM = {"2": "two", "3": "three"}
out = {}
for vid, key in (("a1", "1 —"), ("a2", "2 —"), ("a3", "3 —")):
    i = doc.index("## Video " + key); j = doc.find("**Paste into", i)
    lines = re.findall(r'^\| (\d\d) \| (.*?) \| \*\[(.*?)\]\* \|', doc[i:j], re.M)
    sw, owner = [], []
    for k, (n, text, scr) in enumerate(lines):
        for w in text.split():
            w = norm(w)
            if w: sw.append(w); owner.append(k)
    asr = json.load(open(vid + ".words.json"))
    aw = [NUM.get(norm(x["w"]), norm(x["w"])) for x in asr]
    sm = difflib.SequenceMatcher(None, sw, aw, autojunk=False)
    m = {}
    for a, b, size in sm.get_matching_blocks():
        for t in range(size): m[a + t] = b + t
    starts = []
    for k in range(len(lines)):
        idxs = [x for x in range(len(sw)) if owner[x] == k and x in m]
        starts.append(asr[m[idxs[0]]]["s"] if idxs else None)
        ends = asr[m[idxs[-1]]]["e"] if idxs else None
        starts[-1] = (starts[-1], ends)
    out[vid] = [{"n": n, "text": t, "screen": s, "start": st[0], "end": st[1]} for (n, t, s), st in zip(lines, starts)]
    print(vid, round(sm.ratio(), 3), [(l["n"], l["start"], l["end"]) for l in out[vid]])
json.dump(out, open("timing.json", "w"), indent=1)
