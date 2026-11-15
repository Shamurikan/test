// Render review stills from Remotion compositions with a single bundle, then a contact sheet.
// usage: node script/stills.mjs s04:3,8,12 s05:5,10   (times in seconds, scene-local)
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = path.join(ROOT, "out/stills");
fs.mkdirSync(outDir, { recursive: true });
const BROWSER = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";

const reqs = process.argv.slice(2).map((a) => {
  const [id, ts] = a.split(":");
  return { id, times: ts.split(",").map(Number) };
});

const serveUrl = await bundle({
  entryPoint: path.join(ROOT, "remotion/src/index.ts"),
  publicDir: path.join(ROOT, "remotion/public"),
});
const browser = await openBrowser("chrome", { browserExecutable: BROWSER, chromiumOptions: { gl: "swangle" } });
const files = [];
for (const r of reqs) {
  const compId = r.id === "main" ? "Main" : `Scene-${r.id}`;
  const composition = await selectComposition({ serveUrl, id: compId, puppeteerInstance: browser });
  for (const t of r.times) {
    const frame = Math.min(composition.durationInFrames - 1, Math.round(t * 30));
    const output = path.join(outDir, `${r.id}_${t.toFixed(1)}.jpg`);
    await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 85, puppeteerInstance: browser, scale: 0.5 });
    files.push({ output, label: `${r.id} @${t}s` });
  }
}
await browser.close({ silent: true });
// contact sheet: 3 columns
const sheet = path.join(outDir, `sheet_${Date.now()}.jpg`);
const py = `
import sys
from PIL import Image, ImageDraw
files = sys.argv[2:]
labels = [f.split('|')[1] for f in files]; paths = [f.split('|')[0] for f in files]
ims = [Image.open(p) for p in paths]
w, h = ims[0].size
cols = 3; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w + (cols + 1) * 8, rows * (h + 30) + 8), (30, 30, 30))
d = ImageDraw.Draw(S)
for i, (im, lb) in enumerate(zip(ims, labels)):
    x = 8 + (i % cols) * (w + 8); y = 8 + (i // cols) * (h + 30)
    d.text((x, y), lb, fill=(255, 255, 255))
    S.paste(im, (x, y + 22))
S.save(sys.argv[1], quality=85)
`;
execFileSync("python3", ["-I", "-c", py, sheet, ...files.map((f) => `${f.output}|${f.label}`)]);
console.log(sheet);
