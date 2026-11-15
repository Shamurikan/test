import React from "react";
import { C } from "./theme";
import { rng } from "./anim";

export type Profile = (x: number) => number; // lumen radius at x

/** Gaussian bump helper for constrictions/bulges. */
export const g = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));

const edge = (x0: number, x1: number, f: (x: number) => number, step = 5) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1 + 0.01; x += step) pts.push(`${x.toFixed(1)} ${f(Math.min(x, x1)).toFixed(1)}`);
  return pts;
};

/**
 * Longitudinal section of the gut: muscular wall (outer), mucosa lining (inner), dark lumen.
 * `circ(x)` 0..1 marks circular-muscle contraction (glows coral, band thickens);
 * `long(x)` 0..1 marks longitudinal-muscle contraction (outer stripes brighten).
 */
export const Tube: React.FC<{
  x0: number;
  x1: number;
  cy: number;
  r: Profile;
  wall?: number;
  layers?: boolean;
  circ?: (x: number) => number;
  long?: (x: number) => number;
  lumen?: string;
  opacity?: number;
  id: string;
  capRound?: boolean;
}> = ({ x0, x1, cy, r, wall = 34, layers = false, circ, long, lumen = "#2A1310", opacity = 1, id }) => {
  const step = 5;
  const lumTop = edge(x0, x1, (x) => cy - r(x), step);
  const lumBot = edge(x0, x1, (x) => cy + r(x), step);
  const outTop = edge(x0, x1, (x) => cy - r(x) - wall, step);
  const outBot = edge(x0, x1, (x) => cy + r(x) + wall, step);
  const lumenPath = `M${lumTop.join(" L")} L${[...lumBot].reverse().join(" L")} Z`;
  const wallTop = `M${outTop.join(" L")} L${[...lumTop].reverse().join(" L")} Z`;
  const wallBot = `M${lumBot.join(" L")} L${[...outBot].reverse().join(" L")} Z`;
  const mucT = edge(x0, x1, (x) => cy - r(x) - 9, step);
  const mucB = edge(x0, x1, (x) => cy + r(x) + 9, step);
  const mucTop = `M${mucT.join(" L")} L${[...lumTop].reverse().join(" L")} Z`;
  const mucBot = `M${lumBot.join(" L")} L${[...mucB].reverse().join(" L")} Z`;

  const hatch: React.ReactNode[] = [];
  if (layers) {
    // circular muscle: short strokes across the inner part of the wall
    for (let x = x0 + 6; x < x1 - 4; x += 12) {
      const c = circ ? circ(x) : 0;
      const rr = r(x);
      const col = c > 0.05 ? mix(C.muscle, C.coral, c) : C.muscle;
      const w = 2.5 + c * 2.5;
      hatch.push(
        <line key={`ct${x}`} x1={x} y1={cy - rr - 11} x2={x} y2={cy - rr - wall * 0.62} stroke={col} strokeWidth={w} strokeLinecap="round" opacity={0.9} />,
        <line key={`cb${x}`} x1={x} y1={cy + rr + 11} x2={x} y2={cy + rr + wall * 0.62} stroke={col} strokeWidth={w} strokeLinecap="round" opacity={0.9} />,
      );
    }
    // longitudinal muscle: dashes along the outer edge
    for (let x = x0; x < x1 - 20; x += 26) {
      const l = long ? long(x + 10) : 0;
      const rr = r(x + 10);
      const len = 20 - l * 8;
      const col = mix("#7A2A30", C.gold, l);
      hatch.push(
        <line key={`lt${x}`} x1={x + 3 + l * 4} y1={cy - rr - wall + 6} x2={x + 3 + l * 4 + len} y2={cy - rr - wall + 6} stroke={col} strokeWidth={4 + l * 2} strokeLinecap="round" />,
        <line key={`lb${x}`} x1={x + 3 + l * 4} y1={cy + rr + wall - 6} x2={x + 3 + l * 4 + len} y2={cy + rr + wall - 6} stroke={col} strokeWidth={4 + l * 2} strokeLinecap="round" />,
      );
    }
  }
  return (
    <g opacity={opacity}>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7E2A2F" />
          <stop offset="1" stopColor="#A63A3B" />
        </linearGradient>
        <linearGradient id={`${id}-wallB`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A63A3B" />
          <stop offset="1" stopColor="#6E2429" />
        </linearGradient>
      </defs>
      <path d={lumenPath} fill={lumen} />
      <path d={wallTop} fill={`url(#${id}-wall)`} />
      <path d={wallBot} fill={`url(#${id}-wallB)`} />
      {hatch}
      <path d={mucTop} fill={C.mucosa} />
      <path d={mucBot} fill={C.mucosa} />
    </g>
  );
};

export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const m = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * Math.max(0, Math.min(1, t)));
  return `#${((m(16) << 16) | (m(8) << 8) | m(0)).toString(16).padStart(6, "0")}`;
};

export type Particle = { bx: number; fy: number; kind: number; r: number; ph: number };

/** A deterministic field of chyme particles; `kind` picks a nutrient colour. */
export const makeParticles = (n: number, seed: number, x0: number, x1: number): Particle[] => {
  const rand = rng(seed);
  return Array.from({ length: n }, () => ({
    bx: x0 + rand() * (x1 - x0),
    fy: rand() * 2 - 1,
    kind: Math.floor(rand() * 4),
    r: 5 + rand() * 6,
    ph: rand() * Math.PI * 2,
  }));
};

export const KIND_COLORS = [C.violet, C.teal, C.gold, C.chyme];

export const Particles: React.FC<{
  ps: Particle[];
  cy: number;
  r: Profile;
  dx: (x: number, p: Particle) => number;
  t: number;
  x0: number;
  x1: number;
  margin?: number;
  opacity?: number;
  wobble?: number;
  dy?: (x: number, p: Particle) => number;
}> = ({ ps, cy, r, dx, t, x0, x1, margin = 10, opacity = 1, wobble = 4, dy }) => (
  <g opacity={opacity}>
    {ps.map((p, i) => {
      let x = p.bx + dx(p.bx, p);
      if (x < x0 + 6 || x > x1 - 6) return null;
      const rr = Math.max(4, r(x) - margin - p.r);
      const yy = cy + p.fy * rr + Math.sin(t * 1.3 + p.ph) * wobble + (dy ? dy(x, p) : 0);
      x += Math.cos(t * 1.1 + p.ph) * wobble * 0.6;
      const col = KIND_COLORS[p.kind];
      return p.kind === 0 ? (
        <polygon key={i} points={hexPts(p.r)} transform={`translate(${x.toFixed(1)} ${yy.toFixed(1)})`} fill={col} />
      ) : (
        <circle key={i} cx={x} cy={yy} r={p.r * (p.kind === 3 ? 1.1 : 0.85)} fill={col} opacity={p.kind === 3 ? 0.75 : 1} />
      );
    })}
  </g>
);

const hexCache: Record<string, string> = {};
const hexPts = (r: number) => {
  const k = r.toFixed(1);
  if (!hexCache[k])
    hexCache[k] = Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    }).join(" ");
  return hexCache[k];
};
