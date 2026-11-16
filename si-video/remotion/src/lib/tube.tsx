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
 * Longitudinal section of the gut wall (literal histology, schematic thickness). From the lumen outward:
 * villi fringing the lumen, mucosa (with crypt hints), submucosa (collagen, vessel profiles), inner circular
 * muscle (fibres cut across: striations perpendicular to the axis; thickens where it contracts), myenteric
 * plexus, outer longitudinal muscle (spindle fibres along the axis) and serosa.
 * `circ(x)` 0..1 marks circular-muscle contraction (glows coral); `long(x)` 0..1 longitudinal contraction (gold).
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
  plexus?: boolean;
}> = ({ x0, x1, cy, r, wall = 34, layers = false, circ, long, lumen = "#2A1310", opacity = 1, plexus = false }) => {
  const step = wall < 20 ? 6 : 4;
  const xs: number[] = [];
  for (let x = x0; x <= x1 + 0.01; x += step) xs.push(Math.min(x, x1));
  const fine = wall >= 24;
  // layer thicknesses (fractions of the wall)
  const fM = fine ? 0.24 : 0.36, fS = fine ? 0.18 : 0.14, fC = fine ? 0.32 : 0.3, fL = fine ? 0.2 : 0.16;
  const R = xs.map((x) => r(x));
  const Cc = xs.map((x) => (circ ? circ(x) : 0));
  const off = (i: number, k: number) => {
    // cumulative offset from the lumen edge at layer boundary k (0 = lumen edge … 5 = outer surface)
    const w = wall;
    const c = fC * w * (1 + 0.45 * Cc[i]);
    const b = [0, fM * w, fM * w + fS * w, fM * w + fS * w + c, fM * w + fS * w + c + fL * w, fM * w + fS * w + c + fL * w + 0.04 * w];
    return R[i] + b[k];
  };
  const band = (k0: number, k1: number, side: 1 | -1) => {
    const a = xs.map((x, i) => `${x.toFixed(1)} ${(cy + side * off(i, k0)).toFixed(1)}`);
    const b = xs.map((x, i) => `${x.toFixed(1)} ${(cy + side * off(i, k1)).toFixed(1)}`);
    return `M${a.join(" L")} L${b.reverse().join(" L")} Z`;
  };
  const lumenPath = `M${xs.map((x, i) => `${x.toFixed(1)} ${(cy - R[i]).toFixed(1)}`).join(" L")} L${xs.map((x, i) => `${x.toFixed(1)} ${(cy + R[i]).toFixed(1)}`).reverse().join(" L")} Z`;
  // villi fringe projecting into the lumen
  const vh = Math.max(4, Math.min(14, wall * 0.34));
  const vgap = fine ? 9 : 8;
  let villi = "";
  for (const side of [-1, 1] as const) {
    let d = "";
    for (let x = x0 + vgap / 2; x < x1 - 2; x += vgap) {
      const e = r(x);
      const base = cy + side * e;
      const tip = cy + side * Math.max(2, e - vh);
      d += `M${(x - vgap * 0.42).toFixed(1)} ${base.toFixed(1)}L${(x - vgap * 0.3).toFixed(1)} ${(tip - side * 1.5).toFixed(1)}Q${x.toFixed(1)} ${(tip - side * 3.2).toFixed(1)} ${(x + vgap * 0.3).toFixed(1)} ${(tip - side * 1.5).toFixed(1)}L${(x + vgap * 0.42).toFixed(1)} ${base.toFixed(1)}Z`;
    }
    villi += d;
  }
  // textures
  let striae = "", hot = "", spindles = "", spHot = "", coll = "", vessels = "";
  xs.forEach((x, i) => {
    if (i % (fine ? 2 : 3) !== 0) return;
    for (const side of [-1, 1] as const) {
      const a = cy + side * (off(i, 2) + 1.5), b = cy + side * (off(i, 3) - 1.5);
      const seg = `M${x.toFixed(1)} ${a.toFixed(1)}L${x.toFixed(1)} ${b.toFixed(1)}`;
      if (Cc[i] > 0.08) hot += seg;
      else striae += seg;
    }
  });
  for (let x = x0 + 6; x < x1 - 16; x += fine ? 16 : 22) {
    const i = Math.min(xs.length - 1, Math.round((x - x0) / step));
    const l = long ? long(x + 8) : 0;
    const len = (fine ? 12 : 9) - l * 4;
    for (const side of [-1, 1] as const) {
      const y = cy + side * ((off(i, 3) + off(i, 4)) / 2);
      const sp = `M${(x + l * 3).toFixed(1)} ${y.toFixed(1)}l${len.toFixed(1)} 0`;
      if (l > 0.08) spHot += sp;
      else spindles += sp;
      if (fine) {
        const ys = cy + side * ((off(i, 1) + off(i, 2)) / 2);
        coll += `M${x.toFixed(1)} ${(ys - 1.5).toFixed(1)}q4 3 8 0t8 0`;
        if (((x - x0) / 16) % 7 < 1) vessels += `<circle cx="${(x + 4).toFixed(1)}" cy="${ys.toFixed(1)}" r="2.2" fill="${side < 0 ? C.blood : C.bloodBlue}" />`;
      }
    }
  }
  // crypt hints in the mucosa
  let crypts = "";
  if (fine)
    xs.forEach((x, i) => {
      if (i % 3 !== 1) return;
      for (const side of [-1, 1] as const) crypts += `M${x.toFixed(1)} ${(cy + side * (off(i, 0) + 2)).toFixed(1)}L${x.toFixed(1)} ${(cy + side * (off(i, 1) - 2)).toFixed(1)}`;
    });
  let ganglia = "";
  if (plexus || layers)
    for (let x = x0 + 30; x < x1 - 20; x += 90) {
      const i = Math.min(xs.length - 1, Math.round((x - x0) / step));
      for (const side of [-1, 1] as const) ganglia += `<ellipse cx="${x.toFixed(1)}" cy="${(cy + side * off(i, 3)).toFixed(1)}" rx="7" ry="2.6" fill="${C.nerve}" opacity="0.85" />`;
    }
  const sides = [-1, 1] as const;
  return (
    <g opacity={opacity}>
      <path d={lumenPath} fill={lumen} />
      {sides.map((sd) => (
        <g key={sd}>
          <path d={band(0, 1, sd)} fill="#D9887E" />
          <path d={band(1, 2, sd)} fill={fine ? "#B1625F" : "#A9565A"} />
          <path d={band(2, 3, sd)} fill="#C0473F" />
          <path d={band(3, 4, sd)} fill="#8E3036" />
          <path d={band(4, 5, sd)} fill="#D59A8E" />
        </g>
      ))}
      {crypts && <path d={crypts} stroke="#B9655E" strokeWidth={1.4} opacity={0.7} />}
      {coll && <path d={coll} fill="none" stroke="#CF8A86" strokeWidth={1} opacity={0.55} />}
      <g dangerouslySetInnerHTML={{ __html: vessels + ganglia }} />
      <path d={striae} stroke="#7E2A30" strokeWidth={fine ? 1.6 : 1.2} opacity={0.75} />
      {hot && <path d={hot} stroke={C.coral} strokeWidth={fine ? 3 : 2} />}
      <path d={spindles} stroke="#5E1F25" strokeWidth={fine ? 2.6 : 1.8} strokeLinecap="round" opacity={0.85} />
      {spHot && <path d={spHot} stroke={C.gold} strokeWidth={fine ? 3.6 : 2.4} strokeLinecap="round" />}
      <path d={villi} fill="#F0A090" stroke="#B9655E" strokeWidth={0.7} />
      {sides.map((sd) => (
        <path key={`e${sd}`} d={`M${xs.map((x, i) => `${x.toFixed(1)} ${(cy + sd * R[i]).toFixed(1)}`).join(" L")}`} fill="none" stroke="#FFD3C8" strokeWidth={1.1} opacity={0.6} />
      ))}
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
