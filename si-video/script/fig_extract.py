"""Extract textbook figures following the ORI/INMED "Imager Guide" (2012):
  #2 originals are kept untouched: embedded rasters are written byte-for-byte in their native encoding (raw/)
  #3/#6 no selective or local adjustment: crops are rendered from the PDF page as-is (no levels, filters, cloning)
  #4 cropping only to isolate the figure (art + its own labels); the crop box is recorded
  #10 lossless only: working copies are PNG, never JPEG
  #11/#12 a figure is resampled once: page renders use an integer multiple of the dominant raster's native
          resolution (or 300 dpi for vector art); the factor is recorded
  #1 every step is documented in the manifest (source sha256, page, bbox, dpi, output sha256)
usage: python3 -I fig_extract.py <figlib_dir> <pages.json>
pages.json: {"book": [page, page, ...], ...}   (1-based PDF page numbers of the excerpt PDFs)
"""
import sys, os, re, json, math, hashlib
import pymupdf as fitz

root, pages_file = sys.argv[1], sys.argv[2]
want = json.load(open(pages_file))
src_sha = dict(l.split()[::-1] for l in open(os.path.join(root, "index", "source_sha256.txt")))
CAP = re.compile(r"^\s*(?:Fig(?:ure|\.)|FIGURE)\s*(\d{1,2})\s*[\.\-–—­]+\s*(\d{1,3}[A-Za-z]?)")
sha = lambda b: hashlib.sha256(b).hexdigest()


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
                g = fitz.Rect(r.x0 - gap, r.y0 - gap, r.x1 + gap, r.y1 + gap)
                if g.intersects(rects[i]):
                    r |= rects.pop(i)
                    changed = True
                else:
                    i += 1
            out.append(r)
        rects = out
    return rects


def lines_of(page):
    res = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            t = "".join(s["text"] for s in l["spans"]).strip()
            if t:
                res.append((t.replace("­", ""), fitz.Rect(l["bbox"]), b["number"]))
    return res


manifest = []
for book, pages in want.items():
    doc = fitz.open(os.path.join(root, "src", book + ".pdf"))
    os.makedirs(os.path.join(root, "raw", book), exist_ok=True)
    os.makedirs(os.path.join(root, "work", book), exist_ok=True)
    for pno in pages:
        page = doc[pno - 1]
        W, H = page.rect.width, page.rect.height
        lines = lines_of(page)
        cap_blocks = {bn for (t, r, bn) in lines if CAP.match(t)}
        cap_lines = [(t, r, bn) for (t, r, bn) in lines if bn in cap_blocks]
        caps = []
        for t, r, bn in lines:
            m = CAP.match(t)
            if m:
                body = " ".join(tt for (tt, rr, b2) in lines if b2 == bn)
                caps.append({"fig": f"{m.group(1)}-{m.group(2)}", "bbox": [round(v, 1) for v in r], "text": body[:500]})
        imgs = [i for i in page.get_image_info(xrefs=True)]
        rects = []
        for i in imgs:
            r = fitz.Rect(i["bbox"]) & page.rect
            if r.width > 25 and r.height > 25 and r.width * r.height > 2000:
                rects.append(r)
        try:
            for r in page.cluster_drawings(x_tolerance=8, y_tolerance=8):
                r = r & page.rect
                if r.width > 40 and r.height > 40 and r.width * r.height > 5000 and not (r.width > 0.9 * W and r.height > 0.85 * H):
                    rects.append(r)
        except Exception:
            pass
        regions = [r for r in merge(rects, 14) if r.width * r.height > 9000]
        # grow each region by its own short labels (not body text, not captions, not running heads)
        for k, R in enumerate(regions):
            for _ in range(4):
                g = fitz.Rect(R.x0 - 22, R.y0 - 16, R.x1 + 22, R.y1 + 16)
                grew = False
                for t, r, bn in lines:
                    if bn in cap_blocks or len(t) > 48 or r.y1 < 38 or r.y0 > H - 34:
                        continue
                    if g.intersects(r) and not R.contains(r):
                        R |= r
                        grew = True
                if not grew:
                    break
            regions[k] = R
        regions = merge(regions, 4)
        regions.sort(key=lambda r: (round(r.y0 / 40), r.x0))
        for k, R in enumerate(regions):
            R = fitz.Rect(max(0, R.x0 - 4), max(0, R.y0 - 4), min(W, R.x1 + 4), min(H, R.y1 + 4))
            inside = [i for i in imgs if fitz.Rect(i["bbox"]).intersects(R) and i["width"] * i["height"] > 1600]
            natives = []
            dom = None
            for i in inside:
                bb = fitz.Rect(i["bbox"])
                nd = 72.0 * i["width"] / max(1.0, bb.width)
                ent = {"xref": i["xref"], "px": [i["width"], i["height"]], "placed_pt": [round(v, 1) for v in bb], "native_dpi": round(nd, 1)}
                try:
                    x = doc.extract_image(i["xref"])
                    fn = f"{book}_p{pno:03d}_x{i['xref']}.{x['ext']}"
                    fp = os.path.join(root, "raw", book, fn)
                    if not os.path.exists(fp):
                        open(fp, "wb").write(x["image"])
                    ent.update({"raw": f"raw/{book}/{fn}", "raw_sha256": sha(x["image"]), "encoding": x["ext"], "colorspace": x.get("cs-name"), "smask": x.get("smask", 0)})
                except Exception as e:
                    ent["raw_error"] = str(e)
                natives.append(ent)
                if dom is None or bb.width * bb.height > dom[1]:
                    dom = (nd, bb.width * bb.height)
            if dom and dom[1] > 0.35 * R.width * R.height:
                nd = dom[0]
                dpi = nd * max(1, math.ceil(300 / nd))
                dpi_rule = f"{max(1, math.ceil(300 / nd))}x native raster ({nd:.0f} dpi)"
            else:
                dpi = 300.0
                dpi_rule = "vector art rendered at 300 dpi"
            dpi = min(dpi, 600.0)
            pix = page.get_pixmap(clip=R, matrix=fitz.Matrix(dpi / 72.0, dpi / 72.0), alpha=False)
            pix.set_dpi(int(round(dpi)), int(round(dpi)))
            fid = f"{book}_p{pno:03d}_r{k + 1}"
            out = os.path.join(root, "work", book, fid + ".png")
            pix.save(out)
            # nearest caption: below or beside, then above
            best, bd = None, 1e9
            for c in caps:
                cb = fitz.Rect(c["bbox"])
                d = abs(cb.y0 - R.y1) if cb.y0 >= R.y1 - 10 else abs(R.y0 - cb.y1) + 60
                if cb.x0 > R.x1 + 30 or cb.x1 < R.x0 - 30:
                    d += 40 if (cb.y0 < R.y1 and cb.y1 > R.y0) else 200
                if d < bd:
                    best, bd = c, d
            manifest.append({
                "id": fid, "book": book, "pdf_page": pno, "page_label": page.get_label() or "",
                "source_pdf_sha256": src_sha.get(f"src/{book}.pdf"), "crop_pt": [round(v, 1) for v in R],
                "render_dpi": round(dpi, 2), "resample_rule": dpi_rule, "px": [pix.width, pix.height],
                "file": f"work/{book}/{fid}.png", "sha256": sha(open(out, "rb").read()),
                "natives": natives, "caption_guess": best, "page_captions": caps,
                "processing": "crop of PDF page region (figure art + its labels), single render at stated dpi, PNG lossless; no tonal/colour adjustment, no filtering, no retouching",
            })
        print(book, pno, len(regions), "regions", flush=True)
json.dump(manifest, open(os.path.join(root, "index", "manifest_" + os.path.basename(pages_file)), "w"), indent=1)
print("total", len(manifest))
