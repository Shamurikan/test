"""Second pass: art-only crops for the curated figures (same integrity rules as fig_extract.py).
A figure = its graphics (embedded rasters + vector paths) + its own labels. Excluded: text boxes (filled panels that hold
running text: legends, "In the clinic" boxes, caption bars), captions, body text, page furniture (headers, side tabs).
No pixel is altered: the crop is a single render of the PDF page region; PNG (lossless).
usage: python3 -I fig_art.py <figlib_dir> <curated.json>
"""
import sys, os, re, json, math, hashlib, shutil, collections
import pymupdf as fitz

root, cur_file = sys.argv[1], sys.argv[2]
cur = json.load(open(cur_file))
src_sha = dict(l.split()[::-1] for l in open(os.path.join(root, "index", "source_sha256.txt")))
v1 = {m["id"]: m for m in json.load(open(os.path.join(root, "index", "manifest_pages_v1.json")))}
CAP = re.compile(r"^\s*(?:Fig(?:ure|\.)|FIGURE|TABLE|Table)\s*(\d{1,2})\s*[\.\-–—­]+\s*(\d{1,3}[A-Za-z]?)")
sha = lambda b: hashlib.sha256(b).hexdigest()
os.makedirs(os.path.join(root, "plates"), exist_ok=True)


def merge(rects, gap):
    rects = [fitz.Rect(r) for r in rects]
    changed = True
    while changed:
        changed = False
        out = []
        while rects:
            r = rects.pop()
            i = 0
            while i < len(rects):
                if fitz.Rect(r.x0 - gap, r.y0 - gap, r.x1 + gap, r.y1 + gap).intersects(rects[i]):
                    r |= rects.pop(i)
                    changed = True
                else:
                    i += 1
            out.append(r)
        rects = out
    return rects


out = []
docs = {}
for c in cur:
    book, pno = c["book"], c["page"]
    doc = docs.setdefault(book, fitz.open(os.path.join(root, "src", book + ".pdf")))
    page = doc[pno - 1]
    W, H = page.rect.width, page.rect.height
    rec = dict(c)
    rec.update({"source_pdf": f"src/{book}.pdf", "source_pdf_sha256": src_sha.get(f"src/{book}.pdf"), "page_label": page.get_label() or ""})
    dst = os.path.join(root, "plates", c["slug"] + ".png")
    if c["mode"] == "box":
        R = fitz.Rect(c["seed"])
        pix = page.get_pixmap(clip=R, matrix=fitz.Matrix(300 / 72.0, 300 / 72.0), alpha=False)
        pix.set_dpi(300, 300)
        pix.save(dst)
        rec.update({"crop_pt": [round(v, 1) for v in R], "render_dpi": 300.0, "resample_rule": "text/vector diagram rendered at 300 dpi", "px": [pix.width, pix.height], "natives": []})
    elif c["mode"].startswith("v1:"):
        m = v1[c["mode"][3:]]
        shutil.copyfile(os.path.join(root, m["file"]), dst)
        rec.update({"crop_pt": m["crop_pt"], "render_dpi": m["render_dpi"], "resample_rule": m["resample_rule"], "px": m["px"], "natives": m["natives"]})
    else:
        # text lines with sizes
        lines = []
        sizes = collections.Counter()
        for b in page.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                t = "".join(s["text"] for s in l["spans"]).replace("­", "").strip()
                if not t:
                    continue
                sz = max(s["size"] for s in l["spans"])
                for s in l["spans"]:
                    sizes[round(s["size"], 1)] += len(s["text"])
                lines.append({"t": t, "r": fitz.Rect(l["bbox"]), "sz": sz, "blk": b["number"]})
        body = sizes.most_common(1)[0][0] if sizes else 10
        cap_blocks = {L["blk"] for L in lines if CAP.match(L["t"])}
        # body-text blocks: any block holding a long line set at (about) body size is running text, never a label
        body_blocks = {L["blk"] for L in lines if len(L["t"]) > 40 and L["sz"] >= body - 0.4}
        cap_blocks |= body_blocks
        blk_rect = {}
        for L in lines:
            blk_rect[L["blk"]] = blk_rect.get(L["blk"], fitz.Rect(L["r"])) | L["r"]
        long_lines = [L["r"] for L in lines if len(L["t"]) > 48 or L["blk"] in cap_blocks]
        drawings = page.get_drawings()
        # text boxes: filled rectangles that contain running text or a caption
        boxes = []
        for d in drawings:
            r = d["rect"]
            if d.get("fill") is not None and r.width * r.height > 2500:
                if any(r.contains(lr) or (r & lr).get_area() > 0.6 * lr.get_area() for lr in long_lines):
                    boxes.append(r)
        in_box = lambda rr: any(b.contains(rr) or (b & rr).get_area() > 0.6 * max(1, rr.get_area()) for b in boxes)
        edge = lambda r: r.x0 < 8 or r.x1 > W - 8 or r.y1 < 40 or r.y0 > H - 30
        gfx = []
        for i in page.get_image_info(xrefs=True):
            r = fitz.Rect(i["bbox"]) & page.rect
            if r.width > 6 and r.height > 6 and not edge(r):
                gfx.append(r)
        for d in drawings:
            r = d["rect"]
            if r.width < 0.5 and r.height < 0.5:
                continue
            if any(abs(r.x0 - b.x0) < 1 and abs(r.y0 - b.y0) < 1 and abs(r.x1 - b.x1) < 1 and abs(r.y1 - b.y1) < 1 for b in boxes):
                continue
            if edge(r) or (r.width > 0.95 * W):
                continue
            if any(blk_rect[b].intersects(r) and (blk_rect[b] & r).get_area() > 0.5 * blk_rect[b].get_area() and r.height < 40 for b in cap_blocks if b in blk_rect):
                continue  # caption bars / panels behind text
            gfx.append(r)
        seed = None
        if c.get("seed"):
            s = c["seed"]
            seed = fitz.Rect(s[0] * W, s[1] * H, s[2] * W, s[3] * H)
            gfx = [r for r in gfx if seed.contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2))]
        figno0 = c["fig"].replace(".", "-").split("/")[0].lstrip("T")
        if c["mode"] == "col":
            capr0 = None
            cands = []
            for L in lines:
                m = CAP.match(L["t"])
                if m and f"{m.group(1)}-{m.group(2)}" == figno0:
                    cands.append((0 if "\u2002" in L["t"][:18] else 1, blk_rect[L["blk"]].height, blk_rect[L["blk"]]))
            if cands:
                capr0 = sorted(cands, key=lambda x: (x[0], x[1]))[0][2]
            if capr0 is not None:
                full = capr0.width > 0.55 * W or c.get("wide")
                if full:
                    bx0, bx1 = 20, W - 20
                elif (capr0.x0 + capr0.x1) / 2 < W / 2:
                    bx0, bx1 = 20, W / 2 + 4
                else:
                    bx0, bx1 = W / 2 - 4, W - 20
                top = 38
                for b, r in blk_rect.items():
                    if b in cap_blocks and r.y1 <= capr0.y0 - 2 and min(r.x1, bx1) - max(r.x0, bx0) > 0.5 * min(r.width, bx1 - bx0):
                        top = max(top, r.y1)
                seed = fitz.Rect(bx0, top, bx1, capr0.y0 + 1)
                gfx = [r for r in gfx if seed.contains(fitz.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2))]
        clusters = [r for r in merge(gfx, 12) if r.width * r.height > 1500]
        # choose the cluster that belongs to this figure's caption (nearest; caption usually below or beside)
        figno = c["fig"].replace(".", "-").split("/")[0].lstrip("T")
        capr = None
        for L in lines:
            m = CAP.match(L["t"])
            if m and f"{m.group(1)}-{m.group(2)}" == figno:
                capr = L["r"]
                break
        if not clusters:
            print("NO GRAPHICS", c["slug"]); continue
        if seed is not None and len(clusters) > 1:
            R = clusters[0]
            for r in clusters[1:]:
                R |= r
        elif capr is not None:
            def dist(r):
                dy = capr.y0 - r.y1 if capr.y0 >= r.y1 - 6 else (r.y0 - capr.y1 if r.y0 >= capr.y1 - 6 else 0)
                dx = max(0, capr.x0 - r.x1, r.x0 - capr.x1)
                penalty = 0 if capr.y0 >= r.y1 - 6 else 25  # captions sit below or beside their art
                return math.hypot(max(0, dy), dx) + penalty - 0.002 * r.get_area()
            R = min(clusters, key=dist)
        else:
            R = max(clusters, key=lambda r: r.get_area())
        # grow by the figure's own labels
        for _ in range(5):
            g = fitz.Rect(R.x0 - 26, R.y0 - 18, R.x1 + 26, R.y1 + 18)
            grew = False
            for L in lines:
                r = L["r"]
                if L["blk"] in cap_blocks or len(L["t"]) > 48 or L["sz"] > body + 0.01 and len(L["t"]) > 24 or in_box(r) and not R.intersects(r):
                    continue
                if L["sz"] >= body - 0.05 and len(L["t"]) > 34:
                    continue
                if edge(r) or (seed is not None and not fitz.Rect(seed.x0 - 20, seed.y0 - 20, seed.x1 + 20, seed.y1 + 20).contains(r)):
                    continue
                if g.intersects(r) and not R.contains(r):
                    R |= r
                    grew = True
            if not grew:
                break
        R = fitz.Rect(max(0, R.x0 - 5), max(0, R.y0 - 5), min(W, R.x1 + 5), min(H, R.y1 + 5))
        inside = [i for i in page.get_image_info(xrefs=True) if fitz.Rect(i["bbox"]).intersects(R) and i["width"] * i["height"] > 1600]
        natives, dom = [], None
        for i in inside:
            bb = fitz.Rect(i["bbox"])
            nd = 72.0 * i["width"] / max(1.0, bb.width)
            natives.append({"xref": i["xref"], "px": [i["width"], i["height"]], "placed_pt": [round(v, 1) for v in bb], "native_dpi": round(nd, 1),
                            "raw": f"raw/{book}/{book}_p{pno:03d}_x{i['xref']}"})
            if dom is None or (bb & R).get_area() > dom[1]:
                dom = (nd, (bb & R).get_area())
        if dom and dom[1] > 0.35 * R.get_area():
            k = max(1, math.ceil(300 / dom[0]))
            dpi, rule = min(600.0, dom[0] * k), f"{k}x native raster ({dom[0]:.0f} dpi)"
        else:
            dpi, rule = 300.0, "vector art rendered at 300 dpi"
        pix = page.get_pixmap(clip=R, matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), alpha=False)
        pix.set_dpi(int(round(dpi)), int(round(dpi)))
        pix.save(dst)
        rec.update({"crop_pt": [round(v, 1) for v in R], "render_dpi": round(dpi, 2), "resample_rule": rule, "px": [pix.width, pix.height], "natives": natives})
    rec["file"] = f"plates/{c['slug']}.png"
    rec["sha256"] = sha(open(dst, "rb").read())
    rec["processing"] = "crop of the PDF page to the figure (art + its own labels), single render at the stated dpi, saved as PNG (lossless); no tonal, colour, filter or retouching operations"
    out.append(rec)
json.dump(out, open(os.path.join(root, "index", "manifest_curated.json"), "w"), indent=1)
print("plates", len(out))
