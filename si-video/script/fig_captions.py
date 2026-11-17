"""Collect figure captions (number + full caption text) per book/page from the page text index."""
import sys, os, re, json, glob
root = sys.argv[1]
idx = json.load(open(os.path.join(root, "index", "index.json")))
# caption starts: 'Figure 63-1.', 'FIGURE 15-12', 'Fig. 4.97', with optional soft hyphens / odd dashes
cap_start = re.compile(r"^(?:Figure|FIGURE|Fig\.)\s*(\d{1,2})\s*[\.\-–—­]+\s*(\d{1,3}[A-Za-z]?)\b\.?(.*)$")
res = []
for key, b in idx.items():
    for p in b["pages"]:
        lines = open(os.path.join(root, "index", f"{key}_p{p['p']:03d}.txt")).read().replace("­", "").splitlines()
        i = 0
        while i < len(lines):
            m = cap_start.match(lines[i].strip())
            if m:
                rest = m.group(3).strip(" .�")
                # inline references ("Figure 63-1 shows ...") rarely start a line followed by a capital title; accept and keep 6 lines
                body = [rest] + [l.strip() for l in lines[i + 1:i + 7]]
                text = " ".join(x for x in body if x)
                res.append({"book": key, "page": p["p"], "fig": f"{m.group(1)}-{m.group(2)}", "text": text[:600]})
            i += 1
# dedupe: keep first occurrence per book/fig whose text looks like a caption (longest)
best = {}
for r in res:
    k = (r["book"], r["fig"])
    if k not in best or (len(r["text"]) > len(best[k]["text"]) and best[k]["text"][:1].islower()):
        best.setdefault(k, r)
json.dump(res, open(os.path.join(root, "index", "captions_all.json"), "w"), indent=1)
print({b: sum(1 for k in best if k[0] == b) for b in idx})
