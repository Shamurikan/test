// Timeline data (final edited soundtrack time) + phrase anchors.
// timeline.json is produced by pipeline/build_timeline.py from the narration audio.
import TL from '../data/timeline.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

type Word = { w: string; s: number; e: number };
type Block = { block: number; chapter: number; header: boolean; s: number; e: number; text: string; words: Word[] };
export const TL_DATA = TL as unknown as {
  duration: number;
  chapters: { chapter: number; t0: number; t1: number }[];
  edl: { kind: string; tag: string; t0: number; t1: number }[];
  blocks: Block[];
};

export const DURATION_FRAMES = Math.round(TL_DATA.duration * FPS);
export const chapterSpan = (ch: number): [number, number] => [TL_DATA.chapters[ch].t0, TL_DATA.chapters[ch].t1];
export const chapterFrames = (ch: number) => {
  const a = Math.round(TL_DATA.chapters[ch].t0 * FPS);
  const b = Math.round(TL_DATA.chapters[ch].t1 * FPS);
  return { from: a, durationInFrames: b - a };
};
export const silence = (tag: string) => {
  const s = TL_DATA.edl.find((m) => m.tag === tag);
  if (!s) throw new Error('no silence ' + tag);
  return [s.t0, s.t1] as [number, number];
};

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9' -]/g, '').replace(/-/g, ' ').trim();

type W2 = { w: string; s: number; e: number; block: number };
const cache = new Map<number, W2[]>();
const words = (ch: number) => {
  if (!cache.has(ch)) {
    const out: W2[] = [];
    for (const b of TL_DATA.blocks)
      if (b.chapter === ch)
        for (const w of b.words)
          for (const piece of norm(w.w).split(/\s+/)) if (piece) out.push({ w: piece, s: w.s, e: w.e, block: b.block });
    cache.set(ch, out);
  }
  return cache.get(ch)!;
};

/** anchors for a chapter: A(phrase, n, after) = start time of n-th occurrence; AE = end time */
export function anchors(ch: number) {
  const WS = words(ch);
  const find = (phrase: string, n = 1, after = -1) => {
    const p = norm(phrase).split(/\s+/);
    let found = 0;
    for (let i = 0; i <= WS.length - p.length; i++) {
      if (WS[i].s < after) continue;
      let ok = true;
      for (let j = 0; j < p.length; j++)
        if (WS[i + j].w !== p[j]) {
          ok = false;
          break;
        }
      if (ok && ++found === n) return i;
    }
    throw new Error(`anchor not found: "${phrase}" #${n} ch${ch}`);
  };
  const A = (phrase: string, n = 1, after = -1) => WS[find(phrase, n, after)].s;
  const AE = (phrase: string, n = 1, after = -1) => {
    const i = find(phrase, n, after);
    return WS[i + norm(phrase).split(/\s+/).length - 1].e;
  };
  const blocks = TL_DATA.blocks.filter((b) => b.chapter === ch);
  /** first word of the first non-header block */
  const firstContent = blocks.find((b) => !b.header)!.s;
  const blockSpan = (b: number) => {
    const x = TL_DATA.blocks.find((k) => k.block === b)!;
    return [x.s, x.e] as [number, number];
  };
  return { A, AE, firstContent, blocks, blockSpan, span: chapterSpan(ch) };
}
