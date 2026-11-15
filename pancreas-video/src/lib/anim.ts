// ---------------------------------------------------------------------------
// Deterministic tween resolver (a React port of the original engine.js).
// Every value is a pure function of the global time t (seconds), so any frame
// can be rendered in any order (Remotion renders frames in parallel).
//
// Semantics match the original engine:
//  * an element has a base state {o,x,y,s,sx,sy,r}
//  * tweens run in start-time order; each tween animates from the value the
//    property had at the tween's start, to its target value
//  * helpers such as show/pop/slideIn also modify the base (they start hidden)
// ---------------------------------------------------------------------------

export type Ease = (p: number) => number;

export const E = {
  lin: (p: number) => p,
  io: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  out: (p: number) => 1 - Math.pow(1 - p, 3),
  in: (p: number) => p * p * p,
  back: (p: number) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  },
  sine: (p: number) => -(Math.cos(Math.PI * p) - 1) / 2,
};

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export type St = { o: number; x: number; y: number; s: number; sx: number; sy: number; r: number; [k: string]: number };
export type Tw = { t0: number; d: number; p: Record<string, number>; e: Ease; base?: Record<string, number> };

const DEF: St = { o: 1, x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0 };

/** state of an element at time t */
export function resolve(t: number, tws: Tw[] | undefined, base0?: Record<string, number>): St {
  const base: St = { ...DEF, ...(base0 || {}) };
  if (!tws || !tws.length) return base;
  for (const tw of tws) if (tw.base) Object.assign(base, tw.base);
  const list = tws.map((tw, i) => ({ tw, i })).sort((a, b) => a.tw.t0 - b.tw.t0 || a.i - b.i).map((x) => x.tw);
  const from: Record<string, number>[] = [];
  const evalAt = (time: number, upto: number, st: St) => {
    for (let j = 0; j < upto; j++) {
      const tj = list[j];
      if (tj.t0 > time) break;
      const p = tj.e(clamp((time - tj.t0) / Math.max(tj.d, 1e-4)));
      for (const k in tj.p) st[k] = lerp(from[j][k], tj.p[k], p);
    }
    return st;
  };
  for (let k = 0; k < list.length; k++) {
    const st = evalAt(list[k].t0, k, { ...base });
    from[k] = {};
    for (const key in list[k].p) from[k][key] = st[key] !== undefined ? st[key] : 0;
  }
  return evalAt(t, list.length, { ...base });
}

// ---- tween builders (mirror engine helpers) --------------------------------
export const to = (t0: number, d: number, p: Record<string, number>, e: Ease = E.io): Tw => ({ t0, d, p, e });
export const show = (t: number, d = 0.45): Tw[] => [{ t0: t, d, p: { o: 1 }, e: E.out, base: { o: 0 } }];
export const fade = (t: number, d = 0.45, o = 0): Tw[] => [to(t, d, { o })];
export const dim = (t: number, o = 0.35, d = 0.5): Tw[] => [to(t, d, { o })];
export const pop = (t: number, d = 0.55): Tw[] => [
  { t0: t, d: d * 0.6, p: { o: 1 }, e: E.out, base: { o: 0, s: 0.55 } },
  { t0: t, d, p: { s: 1 }, e: E.back },
];
export const slideIn = (t: number, dx = 0, dy = 40, d = 0.6): Tw[] => [
  { t0: t, d: d * 0.7, p: { o: 1 }, e: E.out, base: { o: 0, x: dx, y: dy } },
  { t0: t, d, p: { x: 0, y: 0 }, e: E.out },
];
export const move = (t: number, d: number, x: number, y: number, e: Ease = E.io): Tw[] => [to(t, d, { x, y }, e)];
export const scaleTo = (t: number, d: number, s: number, e: Ease = E.io): Tw[] => [to(t, d, { s }, e)];
export const pulse = (t: number, s = 1.14, d1 = 0.25, d2 = 0.4): Tw[] => [to(t, d1, { s }), to(t + d1 + 0.05, d2, { s: 1 })];
export const hidden: Tw[] = [{ t0: -1e9, d: 0, p: {}, e: E.lin, base: { o: 0 } }];
export const at = (x: number, y: number): Tw[] => [{ t0: -1e9, d: 0, p: {}, e: E.lin, base: { x, y } }];
/** flatten nested tween lists */
export const tw = (...a: (Tw | Tw[] | false | undefined | null)[]): Tw[] => {
  const out: Tw[] = [];
  for (const x of a) if (x) Array.isArray(x) ? out.push(...x) : out.push(x);
  return out;
};

// ---- scalar / colour tweens ------------------------------------------------
/** scalar keyed value: v(t, initial, [t0, d, target, ease?], ...) */
export function v(t: number, init: number, ...steps: [number, number, number, Ease?][]): number {
  const st = resolve(
    t,
    steps.map(([t0, d, val, e]) => to(t0, d, { v: val }, e || E.io)),
    { v: init },
  );
  return st.v;
}
/** 0→1 progress of a single tween */
export const prog = (t: number, t0: number, d: number, e: Ease = E.io) => e(clamp((t - t0) / Math.max(d, 1e-4)));

const hex = (c: string) => {
  c = c.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16));
};
export function mix(ca: string, cb: string, p: number): string {
  if (p <= 0) return ca;
  if (p >= 1) return cb;
  const a = hex(ca), b = hex(cb);
  return `rgb(${a.map((x, i) => Math.round(lerp(x, b[i], p))).join(',')})`;
}
/** colour keyed value: col(t, c0, [t0, d, c1], ...) */
export function col(t: number, c0: string, ...steps: [number, number, string][]): string {
  let prev = c0;
  for (const [t0, d, c] of steps) {
    if (t < t0) return prev;
    const p = E.io(clamp((t - t0) / Math.max(d, 1e-4)));
    if (p < 1) return mix(prev, c, p);
    prev = c;
  }
  return prev;
}

/** deterministic pseudo random in [0,1) */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** smooth window: 0 before a, rises over fadeIn, holds, falls to 0 at b */
export const win = (t: number, a: number, b: number, f = 0.3) =>
  clamp((t - a) / f) * clamp((b - t) / f);
