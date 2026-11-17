// Builds the master timeline from narration durations.
// Output: remotion/src/data/timeline.json (used by Remotion and by the HyperFrames generator).
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FPS = 30;
const TRANSITION = 12; // frames of overlap between consecutive scenes
const scenes = JSON.parse(fs.readFileSync(path.join(ROOT, "script/scenes.json"), "utf8"));
const vo = JSON.parse(fs.readFileSync(path.join(ROOT, "remotion/src/data/vo.json"), "utf8"));

const LEAD = { default: 0.45, s01: 1.1, c0: 0.5, c1: 0.5, c2: 0.5, c3: 0.5, s32: 0.6 };
const TAIL = { default: 0.75, c0: 2.1, c1: 2.1, c2: 2.1, c3: 2.1, s33: 3.2, s20: 1.0, s32: 2.2 };
const GAP = 0.3;

let absFrame = 0;
let hfOffset = 0; // seconds into the single HyperFrames render
const out = [];
scenes.forEach((s, si) => {
  let t = LEAD[s.id] ?? LEAD.default;
  const parts = s.parts.map((p, i) => {
    const key = p.id ? `${s.id}_${p.id}` : s.parts.length > 1 ? `${s.id}_${i}` : s.id;
    const d = vo[key].duration;
    const part = { key, start: +t.toFixed(3), duration: d };
    t += d + (i < s.parts.length - 1 ? (p.pause ?? GAP) : 0);
    return part;
  });
  t += TAIL[s.id] ?? TAIL.default;
  const durationInFrames = Math.ceil(t * FPS);
  const entry = {
    id: s.id,
    engine: s.engine,
    title: s.title,
    durationInFrames,
    from: absFrame,
    parts,
  };
  if (s.engine === "hf") {
    entry.hfStart = +hfOffset.toFixed(4);
    hfOffset += durationInFrames / FPS;
  }
  out.push(entry);
  absFrame += durationInFrames - (si < scenes.length - 1 ? TRANSITION : 0);
});

const timeline = { fps: FPS, transition: TRANSITION, totalFrames: absFrame, hfTotal: +hfOffset.toFixed(4), scenes: out };
fs.writeFileSync(path.join(ROOT, "remotion/src/data/timeline.json"), JSON.stringify(timeline, null, 1));
console.log(`total ${(absFrame / FPS).toFixed(1)} s (${absFrame} frames), hf ${hfOffset.toFixed(1)} s`);
