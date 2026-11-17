"""Check every cue phrase exists in its scene's narration and every referenced label exists on its plate."""
import json, re, sys
ROOT = sys.argv[1]
vo = json.load(open(f"{ROOT}/remotion/src/data/vo.json"))
tl = json.load(open(f"{ROOT}/remotion/src/data/timeline.json"))
labels = json.load(open(f"{ROOT}/remotion/src/data/figlabels.json"))
norm = lambda x: re.sub(r"[^a-z0-9]", "", x.lower())
words = {}
for s in tl["scenes"]:
    words[s["id"]] = [w["t"] for p in s["parts"] for w in vo[p["key"]]["words"]]
def has(sid, phrase, n=1):
    p = [norm(x) for x in phrase.split() if norm(x)]
    W = [norm(w) for w in words[sid]]
    c = 0
    for i in range(len(W)):
        if all(i + j < len(W) and W[i + j].startswith(p[j]) for j in range(len(p))):
            c += 1
            if c == n: return True
    return False
bad = 0
for f, mapping in [("anatomy.tsx", {"q1": "a01", "q2": "a02", "q3": "a03", "q4": "a04", "q5": "a05", "q6": "a06", "q7": "a07", "q8": "a08", "q9": "a09"}),
                   ("beats.tsx", {f"b{n}": f"s{n}" for n in ["04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","20","22","23","24","26","27"]})]:
    src = open(f"{ROOT}/remotion/src/scenes/{f}").read()
    for m in re.finditer(r"\b(q\d|b\d\d)\(\"([^\"]+)\"(?:,\s*(\d+))?\)", src):
        sid = mapping.get(m.group(1))
        if sid and not has(sid, m.group(2), int(m.group(3) or 1)):
            print("CUE MISSING", f, sid, repr(m.group(2))); bad += 1
    # plate/text pairs: walk shots
    consts = dict(re.findall(r'const (\w+) = "([a-z0-9-]+)";', src))
    cur = None
    for line in src.splitlines():
        m = re.search(r'plate: (?:"([a-z0-9-]+)"|(\w+))', line)
        if m:
            cur = m.group(1) or consts.get(m.group(2))
            if cur not in labels: print("NO PLATE", cur); bad += 1
        if "head:" in line:
            continue  # facts column entries, not plate labels
        for tm in re.finditer(r'(?:text: "([^"]+)"(?:, nth: (\d))?)|(?:tipOf\((\w+|"[^"]+"), "([^"]+)"\))', line):
            if tm.group(1):
                plate, text, nth = cur, tm.group(1), int(tm.group(2) or 1)
            else:
                ref = tm.group(3).strip('"'); plate = consts.get(ref, ref); text, nth = tm.group(4), 1
            want = text.lower()
            hits = [l for l in labels[plate]["labels"] if want in re.sub(r"\s+", " ", l["text"].lower())]
            if len(hits) < nth:
                print("LABEL MISSING", f, plate, repr(text)); bad += 1
print("problems:", bad)
