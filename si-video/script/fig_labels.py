"""For each curated plate: the textbook's own labels (text + box) and where each label's leader line ends on the art.
Coordinates are fractions of the plate (0..1, origin top-left), so they survive any display scale.
usage: python3 -I fig_labels.py <figlib_dir> <out.json>
"""
import sys, os, json, math
import pymupdf as fitz

root, out_path = sys.argv[1], sys.argv[2]
man = json.load(open(os.path.join(root, "index", "manifest_curated.json")))
docs = {}
res = {}


def segs_of(page, clip):
    """Straight segments (leader lines) inside the clip, as point pairs."""
    S = []
    for d in page.get_drawings():
        if d.get("fill") is not None and d.get("color") is None:
            continue
        w = d.get("width") or 0
        if w > 2.2:
            continue
        for it in d["items"]:
            if it[0] == "l":
                a, b = fitz.Point(it[1]), fitz.Point(it[2])
                if clip.contains(a) or clip.contains(b):
                    S.append((a, b))
            elif it[0] == "re" and False:
                pass
    return S


def chase(start, S, used):
    """Follow connected segments from a point; return the far end."""
    cur = start
    for _ in range(12):
        best = None
        for i, (a, b) in enumerate(S):
            if i in used:
                continue
            if abs(a.x - cur.x) < 1.2 and abs(a.y - cur.y) < 1.2:
                best = (i, b)
                break
            if abs(b.x - cur.x) < 1.2 and abs(b.y - cur.y) < 1.2:
                best = (i, a)
                break
        if not best:
            break
        used.add(best[0])
        cur = best[1]
    return cur


for m in man:
    book, pno = m["book"], m["pdf_page"] if "pdf_page" in m else m["page"]
    doc = docs.setdefault(book, fitz.open(os.path.join(root, "src", book + ".pdf")))
    page = doc[pno - 1]
    R = fitz.Rect(m["crop_pt"])
    fx = lambda x: round((x - R.x0) / R.width, 4)
    fy = lambda y: round((y - R.y0) / R.height, 4)
    S = segs_of(page, R)
    labels = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            t = "".join(s["text"] for s in l["spans"]).replace("­", "").strip()
            r = fitz.Rect(l["bbox"])
            if not t or not R.contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)):
                continue
            sz = max(s["size"] for s in l["spans"])
            labels.append({"text": t, "r": r, "sz": sz, "blk": b["number"]})
    # merge multi-line labels of one block when lines are stacked tightly (e.g. "Superior mesenteric / artery")
    merged = []
    for L in labels:
        if merged and merged[-1]["blk"] == L["blk"] and abs(L["r"].y0 - merged[-1]["r"].y1) < 3 and abs(L["r"].x0 - merged[-1]["r"].x0) < 40:
            merged[-1]["text"] += " " + L["text"]
            merged[-1]["r"] |= L["r"]
        else:
            merged.append(dict(L))
    out = []
    for L in merged:
        r = L["r"]
        g = fitz.Rect(r.x0 - 4, r.y0 - 3, r.x1 + 4, r.y1 + 3)
        tip = None
        best_len = 0
        for i, (a, b) in enumerate(S):
            for p, q in ((a, b), (b, a)):
                if g.contains(p) and not g.contains(q):
                    used = {i}
                    far = chase(q, S, used)
                    ln = math.hypot(far.x - p.x, far.y - p.y)
                    if ln > best_len:
                        best_len, tip = ln, (far, p)
        e = {"text": L["text"], "box": [fx(r.x0), fy(r.y0), fx(r.x1), fy(r.y1)]}
        if tip and best_len > 6:
            e["tip"] = [fx(tip[0].x), fy(tip[0].y)]
            e["root"] = [fx(tip[1].x), fy(tip[1].y)]
        out.append(e)
    res[m["slug"]] = {"px": m["px"], "book": book, "fig": m["fig"], "title": m["title"], "labels": out}
json.dump(res, open(out_path, "w"), indent=0)
print(len(res), "plates;", sum(len(v["labels"]) for v in res.values()), "labels;", sum(1 for v in res.values() for l in v["labels"] if "tip" in l), "with leader tips")
