// Generates the HyperFrames project (index.html + compositions/*.html) from the
// templates in hf-src/, injecting narration word timings so motion lands on the
// spoken word. Run after script/timeline.mjs.
import fs from "node:fs";
import path from "node:path";
import * as HI from "../art/histo.mjs";
import * as CA from "../art/cell.mjs";
import * as GM from "../art/gutmap.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const HF = path.join(ROOT, "hyperframes");
const SRC = path.join(ROOT, "hf-src");
const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, "remotion/src/data/timeline.json"), "utf8"));
const vo = JSON.parse(fs.readFileSync(path.join(ROOT, "remotion/src/data/vo.json"), "utf8"));
fs.mkdirSync(path.join(HF, "compositions"), { recursive: true });

const BASE_CSS = `
      @font-face { font-family: "Fraunces"; src: url("assets/fonts/fraunces-latin-full-normal.woff2") format("woff2"); font-weight: 100 900; font-style: normal; }
      @font-face { font-family: "Fraunces"; src: url("assets/fonts/fraunces-latin-full-italic.woff2") format("woff2"); font-weight: 100 900; font-style: italic; }
      @font-face { font-family: "InterVar"; src: url("assets/fonts/inter-latin-wght-normal.woff2") format("woff2"); font-weight: 100 900; font-style: normal; }
      @font-face { font-family: "JBMono"; src: url("assets/fonts/jetbrains-mono-latin-500-normal.woff2") format("woff2"); font-weight: 500; font-style: normal; }
      #root { position: absolute; inset: 0; overflow: hidden; color: #F7EFE9; font-family: "InterVar", sans-serif; }
      #root .disp { font-family: "Fraunces", serif; font-variation-settings: "opsz" 144, "SOFT" 30; letter-spacing: -0.02em; }
      #root .mono { font-family: "JBMono", monospace; }
      #root .kicker { font-size: 28px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: #FF9A86; }
      #root .muted { color: #CDBDB5; }
      #root .w { display: inline-block; }`;

const CUE_LIB = (words, parts) => `
      const __W = ${JSON.stringify(words)};
      const __P = ${JSON.stringify(parts)};
      const __norm = (x) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
      function cue(phrase, n = 1, fallback = 0) {
        const p = phrase.split(/\\s+/).map(__norm).filter(Boolean);
        let c = 0;
        for (let i = 0; i < __W.length; i++) {
          let ok = true;
          for (let j = 0; j < p.length; j++) {
            const w = __W[i + j];
            if (!w || !__norm(w.t).startsWith(p[j])) { ok = false; break; }
          }
          if (ok && ++c === n) return __W[i].s;
        }
        return fallback;
      }
      function part(key) { return __P.find((p) => p.key.endsWith(key)); }`;

function wordsFor(scene) {
  const out = [];
  for (const p of scene.parts) for (const w of vo[p.key].words) out.push({ t: w.t, s: +(p.start + w.s).toFixed(3), e: +(p.start + w.e).toFixed(3) });
  return out;
}

// Validate cue("...", n) calls against the words, so a typo never silently resolves to 0.
function validate(id, src, words) {
  const norm = (x) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
  const re = /cue\("([^"]+)"(?:,\s*(\d+))?/g;
  let m;
  const bad = [];
  while ((m = re.exec(src))) {
    const p = m[1].split(/\s+/).map(norm).filter(Boolean);
    const n = m[2] ? +m[2] : 1;
    let c = 0, found = false;
    for (let i = 0; i < words.length && !found; i++) {
      let ok = true;
      for (let j = 0; j < p.length; j++) if (!words[i + j] || !norm(words[i + j].t).startsWith(p[j])) { ok = false; break; }
      if (ok && ++c === n) found = true;
    }
    if (!found) bad.push(`${m[1]}#${n}`);
  }
  if (bad.length) throw new Error(`${id}: unresolved cues ${bad.join(", ")}`);
}

const CHAPTERS = {
  c0: { num: "00", kicker: "Before the physiology", title: "Location<br>anatomy", accent: "#F3D3C2", cue0: "first",
        sub: ["Position", "Peritoneum", "Duodenum", "Jejunum &amp; ileum", "Vessels", "Lymph &amp; nerves", "Wall"] },
  c1: { num: "01", kicker: "Part one", title: "Motility", accent: "#FF7A63",
        sub: ["Segmentation", "Peristalsis", "Migrating motor complex", "Antiperistalsis", "Peristaltic rush", "Control"] },
  c2: { num: "02", kicker: "Part two", title: "Secretion<br>&amp; Digestion", accent: "#FFC857",
        sub: ["Intestinal juice", "Brunner’s glands", "Brush-border enzymes", "Carbohydrates", "Proteins", "Fats"] },
  c3: { num: "03", kicker: "Part three", title: "Absorption", accent: "#3FD0BC",
        sub: ["Surface", "Sugars", "Amino acids", "Fats", "Vitamins", "Water &amp; ions", "Destinations"] },
};

const QUIZ = [
  { q: "How do lipid digestion products cross the brush border?", opts: ["Na⁺-dependent secondary active transport", "Primary active transport", "Simple diffusion", "Facilitated diffusion"], a: 2 },
  { q: "What does segmentation do?", opts: ["Mixes the chyme", "Moves it caudal → orad", "Holds it until defecation", "Moves it to the caudal region"], a: 0 },
  { q: "How does galactose cross the luminal membrane?", opts: ["Passive diffusion", "Facilitated diffusion", "Secondary active transport", "H⁺ cotransport"], a: 2 },
  { q: "Which structure adds the most absorptive surface (×600 in total)?", opts: ["Circular folds", "Villi", "Microvilli", "Valvulae conniventes"], a: 2 },
  { q: "Which hormone is released in response to acid?", opts: ["Secretin", "Gastrin", "CCK", "GIP"], a: 0 },
  { q: "Which of these does NOT stimulate intestinal motility?", opts: ["Gastrin", "CCK", "Serotonin", "Glucagon"], a: 3 },
  { q: "Bile salts are deficient or obstructed. What fails?", saq: "Absorption of fat and the fat-soluble vitamins A, D, E, K" },
  { q: "Loss of intrinsic factor after gastrectomy causes…", saq: "Pernicious anemia: vitamin B12 can’t be absorbed in the terminal ileum" },
];

function quizMarkup() {
  return QUIZ.map((item, i) => {
    const n = i + 1;
    const body = item.saq
      ? `<div id="q${n}-saq" class="saq"><span class="saq-label">Answer</span><span id="q${n}-saqtext" class="saq-text">${item.saq}</span></div>`
      : `<div class="opts">${item.opts.map((o, k) => `<div id="q${n}-o${k}" class="opt${k === item.a ? " correct" : ""}"><span class="badge">${"ABCD"[k]}</span><span class="otext">${o}</span><svg class="tick" viewBox="0 0 40 40"><path id="q${n}-tick${k}" d="M9 21 L17 29 L32 12" pathLength="1"/></svg></div>`).join("")}</div>`;
    return `
    <section id="q${n}" class="qcard __ID__-card" data-hold>
      <div class="kicker">Quick check · ${n} / ${QUIZ.length}${item.saq ? " · short answer" : ""}</div>
      <h2 id="q${n}-text" class="disp qtext">${item.q}</h2>
      <div class="timer"><div id="q${n}-bar" class="bar"></div></div>
      ${body}
    </section>`;
  }).join("\n");
}

function coilPath() {
  const r = 45, xL = 900, xR = 1660;
  const rows = [380, 470, 560, 650, 740, 830];
  let d = `M 1010 120 C 1010 220, 1150 210, 1150 290 C 1150 360, 1070 380, 1000 380 L ${xL} 380`;
  for (let i = 1; i < rows.length; i++) {
    const y1 = rows[i];
    d += i % 2 === 1 ? ` A ${r} ${r} 0 0 0 ${xL} ${y1} L ${xR} ${y1}` : ` A ${r} ${r} 0 0 1 ${xR} ${y1} L ${xL} ${y1}`;
  }
  return d + " C 1720 830, 1730 900, 1700 930";
}

const sceneMap = Object.fromEntries(timeline.scenes.map((s) => [s.id, s]));
const hfScenes = timeline.scenes.filter((s) => s.engine === "hf");

for (const s of hfScenes) {
  const isChapter = s.id in CHAPTERS;
  let src = fs.readFileSync(path.join(SRC, isChapter ? "chapter.html" : `${s.id}.html`), "utf8");
  const words = wordsFor(s);
  const dur = +(s.durationInFrames / timeline.fps).toFixed(3);
  if (isChapter) {
    const c = CHAPTERS[s.id];
    src = src
      .replaceAll("__ACCENT__", c.accent)
      .replaceAll("__NUM__", c.num)
      .replaceAll("__KICKER__", c.kicker)
      .replaceAll("__TITLE__", c.title)
      .replaceAll("__CUE0__", c.cue0 || "part")
      .replaceAll("__SUB__", c.sub.map((x, i) => `<span class="w __ID__-subw">${x}</span>${i < c.sub.length - 1 ? '<span class="w dot __ID__-subw">·</span>' : ""}`).join(" "));
  }
  if (s.id === "s20") {
    // surface-area zoom: literal villi (with lacteal, capillary basket, goblet cells) and enterocytes with a brush border
    const villi = Array.from({ length: 11 }, (_, i) => {
      const x = 68 + i * 78, h = 330 + ((i * 37) % 5) * 14;
      return `<g class="s20-vg">${HI.villusSvg({ cx: x, base: 560, h, w: 64, seed: 60 + i, id: `s20v${i}`, thick: 12, cellW: 7, detail: 0.7 })}</g>`;
    }).join("");
    const floor = HI.mucosaSvg({ x0: -10, x1: 918, base: 560, items: Array.from({ length: 10 }, (_, i) => ({ x: 107 + i * 78, kind: "c" })), vh: 0, cd: 90, vw: 0, cw: 26, bottom: 670, mmY: 650, id: "s20f", thick: 12, cellW: 7, lacteals: false }).svg;
    // three neighbouring enterocytes share lateral membranes (junctional complexes at the apex), resting on a basement membrane
    const cells = [0, 1, 2].map((c) => CA.enterocyteVertical({ x0: 146 + c * 205, x1: 351 + c * 205, top: 256, bottom: 640, id: `s20c${c}`, seed: 70 + c, detail: 0.9, noMv: true })).join("") +
      `<path d="M138 641.5 L768 641.5" stroke="#F3D3C2" stroke-width="2.6" opacity="0.85"/>`;
    const mv = CA.microvilliRow({ x0: 146, x1: 761, y: 256, mvLen: 84, seed: 9 });
    src = src.replace("__S20_FLOOR__", floor).replace("__S20_VILLI__", villi).replace("__S20_CELLS__", cells).replace("__S20_MV__", mv);
  }
  if (s.id === "s01") src = src.replace("__GUT_MAP__", GM.gutMapSvg({})).replaceAll("__SI_PATH__", GM.SI_PATH_D);
  if (s.id === "s32") src = src.replace("__QUIZ__", quizMarkup()).replace("__QUIZ_DATA__", JSON.stringify(QUIZ.map((q) => ({ a: q.a ?? -1, saq: !!q.saq }))));
  src = src
    .replaceAll("__COIL_D__", coilPath())
    .replaceAll("__ID__", s.id)
    .replaceAll("__DUR__", String(dur))
    .replace("__BASE_CSS__", BASE_CSS)
    .replace("__CUE_LIB__", CUE_LIB(words, s.parts));
  validate(s.id, src, words);
  fs.writeFileSync(path.join(HF, "compositions", `${s.id}.html`), src);
}

const hosts = hfScenes.map((s) => {
  const dur = +(s.durationInFrames / timeline.fps).toFixed(3);
  return `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.hfStart}" data-duration="${dur}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>`;
}).join("\n");

const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0B0608; }
      #main-ground { position: absolute; inset: 0; background: #0B0608 url("assets/ground.png") center / cover no-repeat; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${timeline.hfTotal}" data-width="1920" data-height="1080">
      <div id="main-ground"></div>
${hosts}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(HF, "index.html"), index);
fs.writeFileSync(path.join(HF, "hyperframes.json"), JSON.stringify({
  $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
  paths: { blocks: "compositions", components: "compositions/components", assets: "assets" },
  media: { autoProxy: true },
  authoringSkill: "hyperframes",
}, null, 2));
console.log("hf scenes:", hfScenes.map((s) => `${s.id}@${s.hfStart}`).join(" "), "total", timeline.hfTotal);
