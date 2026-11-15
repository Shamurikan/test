import timelineJson from "../data/timeline.json";
import voJson from "../data/vo.json";

export type Word = { t: string; s: number; e: number };
export type Part = { key: string; start: number; duration: number };
export type SceneEntry = {
  id: string;
  engine: "hf" | "rm";
  title: string;
  durationInFrames: number;
  from: number;
  parts: Part[];
  hfStart?: number;
};

export const timeline = timelineJson as {
  fps: number;
  transition: number;
  totalFrames: number;
  hfTotal: number;
  scenes: SceneEntry[];
};
export const vo = voJson as Record<string, { duration: number; words: Word[] }>;
export const FPS = timeline.fps;

export const scene = (id: string) => {
  const s = timeline.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`no scene ${id}`);
  return s;
};

/** Scene-local words with times in seconds from the scene's start. */
export const sceneWords = (id: string): Word[] => {
  const s = scene(id);
  const out: Word[] = [];
  for (const p of s.parts) for (const w of vo[p.key].words) out.push({ t: w.t, s: p.start + w.s, e: p.start + w.e });
  return out;
};

const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * cue("contraction ring") -> seconds (scene-local) when that phrase starts being spoken.
 * Matching is by word prefix, so "fold" matches "folds,". Throws if the phrase is never said,
 * so a typo can't silently move an animation to 0.
 */
export const makeCue = (id: string) => {
  const words = sceneWords(id);
  const fn = (phrase: string, n = 1): number => {
    const p = phrase.split(/\s+/).map(norm).filter(Boolean);
    let c = 0;
    for (let i = 0; i < words.length; i++) {
      let ok = true;
      for (let j = 0; j < p.length; j++) {
        const w = words[i + j];
        if (!w || !norm(w.t).startsWith(p[j])) {
          ok = false;
          break;
        }
      }
      if (ok && ++c === n) return words[i].s;
    }
    throw new Error(`[${id}] cue not found: "${phrase}" #${n}`);
  };
  /** end time of a phrase's last word */
  fn.end = (phrase: string, n = 1): number => {
    const start = fn(phrase, n);
    const p = phrase.split(/\s+/).filter(Boolean).length;
    const i = words.findIndex((w) => w.s === start);
    return words[Math.min(words.length - 1, i + p - 1)].e;
  };
  fn.duration = scene(id).durationInFrames / FPS;
  return fn;
};
