import React from "react";
import { C, F } from "./theme";

type P = { x: number; y: number; s?: number; o?: number; rot?: number };

const poly = (n: number, r: number, rot = -Math.PI / 2) =>
  Array.from({ length: n }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / n;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");

/** Glucose (and other hexoses): violet hexagon. */
export const Hex: React.FC<P & { fill?: string; r?: number }> = ({ x, y, s = 1, o = 1, rot = 0, fill = C.violet, r = 16 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <polygon points={poly(6, r, 0)} fill={fill} stroke="rgba(11,6,8,0.55)" strokeWidth={2.5} />
  </g>
);
/** Fructose: pink pentagon. */
export const Pent: React.FC<P & { fill?: string; r?: number }> = ({ x, y, s = 1, o = 1, rot = 0, fill = C.pink, r = 16 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <polygon points={poly(5, r)} fill={fill} stroke="rgba(11,6,8,0.55)" strokeWidth={2.5} />
  </g>
);
/** Amino acid: teal bead. */
export const Bead: React.FC<P & { fill?: string; r?: number }> = ({ x, y, s = 1, o = 1, fill = C.teal, r = 13 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={r} fill={fill} stroke="rgba(11,6,8,0.5)" strokeWidth={2.5} />
    <circle r={r * 0.35} cx={-r * 0.3} cy={-r * 0.3} fill="rgba(255,255,255,0.35)" />
  </g>
);
/** An ion as a labelled disc. */
export const Ion: React.FC<P & { label: string; fill: string; r?: number; text?: string }> = ({ x, y, s = 1, o = 1, label, fill, r = 17, text = C.bg }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={r} fill={fill} />
    <text y={r * 0.36} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={r * (label.length > 3 ? 0.62 : 0.85)} fill={text}>
      {label}
    </text>
  </g>
);
/** Water droplet. */
export const Drop: React.FC<P & { fill?: string }> = ({ x, y, s = 1, o = 1, fill = C.water }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M0 -14 C 6 -6, 10 0, 10 5 A 10 10 0 0 1 -10 5 C -10 0, -6 -6, 0 -14 Z" fill={fill} />
  </g>
);
/** Fatty acid: a gold zig-zag chain with a head. */
export const FattyAcid: React.FC<P & { len?: number; color?: string }> = ({ x, y, s = 1, o = 1, rot = 0, len = 6, color = C.gold }) => {
  let d = "M0 0";
  for (let i = 1; i <= len; i++) d += ` L${i * 9} ${i % 2 ? 6 : 0}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <circle r={5} fill={color} />
    </g>
  );
};
/** Triglyceride: glycerol backbone + three fatty-acid tails. tails = which tails remain attached. */
export const Triglyceride: React.FC<P & { tails?: [boolean, boolean, boolean]; color?: string }> = ({ x, y, s = 1, o = 1, rot = 0, tails = [true, true, true], color = C.gold }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-6} y={-22} width={12} height={44} rx={6} fill="#FFE3A0" />
    {[-16, 0, 16].map((yy, i) =>
      tails[i] ? <FattyAcid key={i} x={8} y={yy} len={6} color={color} /> : null,
    )}
  </g>
);
/** Bile salt: polar (water-soluble) head + sterol (fat-soluble) body. */
export const BileSalt: React.FC<P & { charge?: boolean }> = ({ x, y, s = 1, o = 1, rot = 0, charge }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <rect x={-4} y={0} width={8} height={26} rx={4} fill={C.gold} />
    <circle cx={0} cy={-2} r={8} fill={C.bile} />
    {charge && (
      <text x={0} y={2} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={13} fill={C.bg}>
        −
      </text>
    )}
  </g>
);
/** Enzyme: a "pac-man" whose mouth opens by `open` (0..1). */
export const Enzyme: React.FC<P & { color?: string; r?: number; open?: number }> = ({ x, y, s = 1, o = 1, rot = 0, color = C.ink, r = 22, open = 0.6 }) => {
  const a = (0.15 + open * 0.55) * Math.PI * 0.5;
  const x1 = Math.cos(a) * r, y1 = Math.sin(a) * r;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
      <path d={`M0 0 L${x1} ${-y1} A ${r} ${r} 0 1 0 ${x1} ${y1} Z`} fill={color} />
    </g>
  );
};
/** Membrane transporter: two lobes spanning a vertical membrane at x. */
export const Transporter: React.FC<P & { color: string; h?: number; w?: number; glow?: number }> = ({ x, y, s = 1, o = 1, color, h = 74, w = 26, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {glow > 0 && <ellipse rx={w * 2} ry={h * 0.7} fill={color} opacity={0.18 * glow} />}
    <rect x={-w - 3} y={-h / 2} width={w} height={h} rx={w / 2} fill={color} />
    <rect x={3} y={-h / 2} width={w} height={h} rx={w / 2} fill={color} />
    <rect x={-w - 3} y={-h / 2} width={w} height={h} rx={w / 2} fill="url(#lobeShade)" />
    <rect x={3} y={-h / 2} width={w} height={h} rx={w / 2} fill="url(#lobeShade)" />
  </g>
);
/** Gradient defs used by several shapes; render once inside each <svg>. */
export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="lobeShade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
      <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.25" />
    </linearGradient>
    <linearGradient id="mucosaV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.mucosaLight} />
      <stop offset="1" stopColor={C.mucosaDark} />
    </linearGradient>
    <linearGradient id="cellFill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F09A8E" />
      <stop offset="1" stopColor="#D2766C" />
    </linearGradient>
    <radialGradient id="softGlow">
      <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="goldGlow">
      <stop offset="0" stopColor="#FFE7B0" />
      <stop offset="0.5" stopColor={C.gold} stopOpacity="0.9" />
      <stop offset="1" stopColor={C.gold} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="coralGlow">
      <stop offset="0" stopColor="#FFD0C6" stopOpacity="1" />
      <stop offset="0.5" stopColor={C.coral} stopOpacity="0.7" />
      <stop offset="1" stopColor={C.coral} stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** A chain of shapes laid along x; used for starch and protein chains. */
export const chainXs = (n: number, x0: number, gap: number) => Array.from({ length: n }, (_, i) => x0 + i * gap);
