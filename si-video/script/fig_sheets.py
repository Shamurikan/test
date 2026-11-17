"""Contact sheets of extracted crops for review (review copies only; JPEG is fine here, never used as figure source)."""
import sys, os, json
from PIL import Image, ImageDraw, ImageFont
root, man, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
M = json.load(open(man))
os.makedirs(outdir, exist_ok=True)
cols, rows, T = 4, 3, 440
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
except Exception:
    font = ImageFont.load_default()
for s in range(0, len(M), cols * rows):
    sheet = Image.new("RGB", (cols * T, rows * (T + 40)), "#222")
    d = ImageDraw.Draw(sheet)
    for k, m in enumerate(M[s:s + cols * rows]):
        im = Image.open(os.path.join(root, m["file"]))
        im.thumbnail((T - 8, T - 8))
        x, y = (k % cols) * T, (k // cols) * (T + 40)
        sheet.paste(im, (x + 4, y + 4))
        cg = (m.get("caption_guess") or {}).get("fig", "?")
        d.text((x + 4, y + T), f"{s + k}: {m['id']}  [{cg}]", fill="#ffd27a", font=font)
        d.text((x + 4, y + T + 18), f"{m['px'][0]}x{m['px'][1]} @{m['render_dpi']:.0f}dpi", fill="#bbb", font=font)
    sheet.save(os.path.join(outdir, f"sheet_{s // (cols * rows):02d}.jpg"), quality=82)
print(len(M), "items")
