// Preview an art module on the film's ground plate.
// usage: node script/art-preview.mjs <module.mjs> <exportName> <out.png> [jsonArgs] [--crop x,y,w,h] [--scale 1]
import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || "playwright");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const [mod, name, out, argJson, ...rest] = process.argv.slice(2);
const opts = { crop: null, scale: 1 };
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === "--crop") opts.crop = rest[++i].split(",").map(Number);
  if (rest[i] === "--scale") opts.scale = Number(rest[++i]);
}
const m = await import(path.resolve(ROOT, mod));
const svg = m[name](argJson ? JSON.parse(argJson) : undefined);
const ground = fs.readFileSync(path.join(ROOT, "remotion/public/ground.png")).toString("base64");
const html = `<!doctype html><html><body style="margin:0;background:#0B0608">
<div style="position:relative;width:1920px;height:1080px;background:url(data:image/png;base64,${ground})">
<svg viewBox="0 0 1920 1080" width="1920" height="1080" style="position:absolute;inset:0">${svg}</svg></div></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: opts.scale });
await page.setContent(html);
await page.screenshot({ path: out, clip: opts.crop ? { x: opts.crop[0], y: opts.crop[1], width: opts.crop[2], height: opts.crop[3] } : undefined });
await browser.close();
console.log(out);
