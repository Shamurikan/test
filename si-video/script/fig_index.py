"""Index textbook PDFs: per-page text, figure captions, embedded raster images and vector-drawing density.
usage: python3 -I fig_index.py <figlib_dir>"""
import sys, json, re, os
import pymupdf as fitz

root = sys.argv[1]
books = {
    "grays_abdomen": "Gray's Anatomy for Students, 4th ed. (2019), Ch. 4 Abdomen",
    "junq_01": "Junqueira's Basic Histology, 13th ed. (2013), front matter, Ch. 1-2",
    "junq_02": "Junqueira's Basic Histology, 13th ed. (2013), Ch. 3-5",
    "junq_06": "Junqueira's Basic Histology, 13th ed. (2013), Ch. 15-17",
    "guyton_01": "Guyton and Hall Textbook of Medical Physiology, 14th ed. (2021), Ch. 1-13",
    "guyton_05": "Guyton and Hall Textbook of Medical Physiology, 14th ed. (2021), Ch. 55-67",
}
cap_re = re.compile(r"^\s*(Fig(?:ure|\.)?\s*[0-9]+[\.\-–][0-9]+[A-Za-z]?)\b(.*)", re.I | re.M)
out = {}
for key, title in books.items():
    doc = fitz.open(os.path.join(root, "src", key + ".pdf"))
    pages = []
    for i, pg in enumerate(doc):
        txt = pg.get_text("text")
        caps = [(m.group(1).strip(), m.group(2).strip()[:220]) for m in cap_re.finditer(txt)]
        imgs = []
        for info in pg.get_image_info(xrefs=True):
            bb = info["bbox"]
            imgs.append({"xref": info["xref"], "w": info["width"], "h": info["height"], "bbox": [round(v, 1) for v in bb]})
        try:
            ndraw = len(pg.get_drawings())
        except Exception:
            ndraw = -1
        pages.append({"p": i + 1, "chars": len(txt), "caps": caps, "imgs": imgs, "ndraw": ndraw, "size": [round(pg.rect.width), round(pg.rect.height)]})
        with open(os.path.join(root, "index", f"{key}_p{i+1:03d}.txt"), "w") as f:
            f.write(txt)
    out[key] = {"title": title, "pages": pages, "n": len(doc)}
    print(key, len(doc), "pages,", sum(len(p["caps"]) for p in pages), "caption hits,", sum(len(p["imgs"]) for p in pages), "images")
json.dump(out, open(os.path.join(root, "index", "index.json"), "w"), indent=1)
