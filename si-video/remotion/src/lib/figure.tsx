/**
 * Textbook figures, handled live: a figure is a "plate" (an untouched crop of the source page, see figlib/)
 * shown inside a card and filmed by a camera (pan/zoom keyframes). Annotations are drawn on a separate layer:
 * the textbook's own labels are found by text (figlabels.json gives each label's box and where its leader line
 * lands on the art), so a highlight lands exactly on the structure the book points to.
 * Integrity: the plate's pixels are never filtered or recoloured; only position, scale and whole-image opacity
 * change, and every overlay is a separate graphic (ORI image-processing guidelines).
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import labelsJson from "../data/figlabels.json";
import { C, F } from "./theme";
import { E, clamp, lerp, prog, useT } from "./anim";

type Lab = { text: string; box: number[]; tip?: number[]; root?: number[] };
type PlateInfo = { px: [number, number]; book: string; fig: string; title: string; labels: Lab[] };
const LABELS = labelsJson as unknown as Record<string, PlateInfo>;

export type Rect = [number, number, number, number]; // x0,y0,x1,y1 in plate fractions
export type Pt = [number, number];
export type Region = { x: number; y: number; w: number; h: number }; // screen px

const BOOK: Record<string, string> = {
  grays_abdomen: "Gray’s Anatomy for Students, 4e",
  junq_06: "Junqueira’s Basic Histology, 13e",
  junq_02: "Junqueira’s Basic Histology, 13e",
  junq_01: "Junqueira’s Basic Histology, 13e",
  guyton_05: "Guyton & Hall Medical Physiology, 14e",
  guyton_01: "Guyton & Hall Medical Physiology, 14e",
};

export const plateInfo = (slug: string) => {
  const p = LABELS[slug];
  if (!p) throw new Error(`no plate ${slug}`);
  return p;
};

/** Find a textbook label on a plate (case-insensitive substring; nth match). Throws if absent. */
export const lab = (slug: string, text: string, nth = 1): Lab => {
  const want = text.toLowerCase();
  let c = 0;
  for (const l of plateInfo(slug).labels) {
    if (l.text.toLowerCase().replace(/\s+/g, " ").includes(want) && ++c === nth) return l;
  }
  throw new Error(`label "${text}" not on ${slug}`);
};
/** Where a label points (leader tip), or its box centre. */
export const tipOf = (slug: string, text: string, nth = 1): Pt => {
  const l = lab(slug, text, nth);
  return (l.tip ?? [(l.box[0] + l.box[2]) / 2, (l.box[1] + l.box[3]) / 2]) as Pt;
};
/** A focus rect around a set of points, padded, in plate fractions. */
export const around = (pts: Pt[], pad = 0.08): Rect => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [clamp(Math.min(...xs) - pad), clamp(Math.min(...ys) - pad), clamp(Math.max(...xs) + pad), clamp(Math.max(...ys) + pad)];
};

/* ───────── camera ───────── */
export type Key = { t: number; f: Rect; dur?: number };
const lerpRect = (a: Rect, b: Rect, p: number): Rect => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)];
const camAt = (keys: Key[], t: number): Rect => {
  let f = keys[0].f;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    const d = k.dur ?? 1.2;
    f = lerpRect(f, k.f, prog(t, k.t, d, E.inOut));
  }
  return f;
};
type Xf = { s: number; ox: number; oy: number; pw: number; ph: number };
/** Fit focus rect (plate fractions) into the region (contain); returns the plate→screen transform. */
const fit = (f: Rect, R: Region, pw: number, ph: number, breathe: number): Xf => {
  const fw = Math.max(1e-3, (f[2] - f[0]) * pw), fh = Math.max(1e-3, (f[3] - f[1]) * ph);
  const s = Math.min(R.w / fw, R.h / fh) * breathe;
  const cx = ((f[0] + f[2]) / 2) * pw, cy = ((f[1] + f[3]) / 2) * ph;
  return { s, ox: R.x + R.w / 2 - cx * s, oy: R.y + R.h / 2 - cy * s, pw, ph };
};
const toScr = (x: Xf, p: number[]) => [x.ox + p[0] * x.pw * x.s, x.oy + p[1] * x.ph * x.s];

/* ───────── annotations ───────── */
export type Ann =
  | { k: "label"; t: number; until?: number; text: string; nth?: number; color?: string; say?: string; side?: "l" | "r" | "u" | "d"; noTrace?: boolean }
  | { k: "pin"; t: number; until?: number; at: Pt; say: string; color?: string; side?: "l" | "r" | "u" | "d"; dist?: number }
  | { k: "ring"; t: number; until?: number; at: Pt; r: [number, number]; color?: string }
  | { k: "trace"; t: number; dur?: number; until?: number; pts: Pt[]; color?: string; w?: number; arrow?: boolean; dash?: boolean }
  | { k: "spot"; t: number; until?: number; rect: Rect; ellipse?: boolean }
  | { k: "plane"; t: number; until?: number; y: number; x0?: number; x1?: number; say: string; color?: string }
  | { k: "bracket"; t: number; until?: number; a: Pt; b: Pt; say: string; color?: string; side?: "l" | "r" }
  | { k: "loupe"; t: number; until?: number; at: Pt; zoom: number; r: number; pos: [number, number]; color?: string };

const vis = (t: number, a: number, b?: number, din = 0.35, dout = 0.3) => prog(t, a, din) * (b === undefined ? 1 : 1 - prog(t, b, dout, E.in));

const Chip: React.FC<{ x: number; y: number; text: string; color: string; o: number; anchor: "l" | "r" | "u" | "d" }> = ({ x: x0, y: y0, text, color, o, anchor: a0 }) => {
  // keep the chip on screen: flip sides when it would run off an edge, then clamp
  const wEst = text.length * 15.2 + 40;
  let anchor = a0, x = x0, y = y0;
  if (anchor === "r" && x + wEst > 1890) anchor = "l";
  else if (anchor === "l" && x - wEst < 30) anchor = "r";
  if (anchor === "u" || anchor === "d") x = Math.min(1890 - wEst / 2, Math.max(30 + wEst / 2, x));
  if (anchor === "u" && y - 50 < 20) anchor = "d";
  y = Math.min(1040, Math.max(40, y));
  if (!text) return null;
  const tx = anchor === "l" ? "translate(-100%,-50%)" : anchor === "r" ? "translate(0,-50%)" : anchor === "u" ? "translate(-50%,-100%)" : "translate(-50%,0)";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${tx} scale(${0.92 + 0.08 * o})`,
        opacity: o,
        padding: "8px 16px 9px",
        borderRadius: 12,
        background: "rgba(11,6,8,0.86)",
        border: `2px solid ${color}`,
        color: C.ink,
        fontFamily: F.body,
        fontWeight: 600,
        fontSize: 29,
        lineHeight: 1.15,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
      }}
    >
      {text}
    </div>
  );
};

/* ───────── a shot: one plate, its camera, its annotations ───────── */
export type Shot = {
  plate: string;
  t0: number;
  t1: number;
  keys: Key[];
  region?: Region;
  rkeys?: { t: number; r: Region; dur?: number }[];
  anns?: Ann[];
  enter?: "rise" | "left" | "right" | "zoom" | "fade";
  view?: Rect; // display crop (still cropping only), fractions of the plate
  paper?: string;
  credit?: boolean;
};

export const DEFAULT_REGION: Region = { x: 760, y: 110, w: 1040, h: 820 };
export const FULL_REGION: Region = { x: 150, y: 88, w: 1620, h: 844 };

const regionAt = (s: Shot, t: number): Region => {
  let r = s.region ?? DEFAULT_REGION;
  for (const k of s.rkeys ?? []) {
    const p = prog(t, k.t, k.dur ?? 1.0, E.inOut);
    r = { x: lerp(r.x, k.r.x, p), y: lerp(r.y, k.r.y, p), w: lerp(r.w, k.r.w, p), h: lerp(r.h, k.r.h, p) };
  }
  return r;
};

export const ShotView: React.FC<{ s: Shot; t: number }> = ({ s, t }) => {
  const info = plateInfo(s.plate);
  const [pw, ph] = info.px;
  const fin = prog(t, s.t0 + 0.12, 0.6, E.out);
  const fout = prog(t, s.t1 - 0.05, 0.32, E.in);
  if (t < s.t0 - 0.01 || t > s.t1 + 0.7) return null;
  const R0 = regionAt(s, t);
  // entrance / exit motion of the whole card (geometry only)
  const enter = s.enter ?? "rise";
  const dy = enter === "rise" ? (1 - fin) * 70 + fout * -40 : 0;
  const dx = enter === "left" ? (1 - fin) * -120 : enter === "right" ? (1 - fin) * 120 : 0;
  const sc = enter === "zoom" ? 0.9 + 0.1 * fin : 1 - fout * 0.03;
  const R: Region = { x: R0.x + dx, y: R0.y + dy, w: R0.w, h: R0.h };
  const opacity = fin * (1 - fout);
  const breathe = 1 + 0.018 * clamp((t - s.t0) / Math.max(1, s.t1 - s.t0)); // slow push-in keeps the plate alive
  const f = camAt(s.keys, t);
  const x = fit(f, R, pw, ph, breathe * sc);
  const view = s.view ?? [0, 0, 1, 1];
  const credit = s.credit !== false;
  const clipId = `clip-${s.plate}-${Math.round(s.t0 * 100)}`;
  return (
    <AbsoluteFill style={{ opacity }}>
      {/* card */}
      <div
        style={{
          position: "absolute",
          left: R.x,
          top: R.y,
          width: R.w,
          height: R.h,
          borderRadius: 22,
          overflow: "hidden",
          background: s.paper ?? "#FBF8F4",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(247,239,233,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: x.ox - R.x + view[0] * pw * x.s,
            top: x.oy - R.y + view[1] * ph * x.s,
            width: (view[2] - view[0]) * pw * x.s,
            height: (view[3] - view[1]) * ph * x.s,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile(`fig/${s.plate}.png`)}
            style={{ position: "absolute", left: -view[0] * pw * x.s, top: -view[1] * ph * x.s, width: pw * x.s, height: ph * x.s, maxWidth: "none" }}
          />
        </div>
      </div>
      {/* annotations */}
      <Overlay s={s} t={t} x={x} R={R} clipId={clipId} />
      {credit && (
        <div
          style={{
            position: "absolute",
            right: 1920 - (R.x + R.w) + 16,
            top: R.y + R.h - 44,
            padding: "5px 12px",
            borderRadius: 8,
            background: "rgba(11,6,8,0.72)",
            color: C.ink2,
            fontFamily: F.mono,
            fontSize: 19,
            letterSpacing: "0.02em",
            opacity: prog(t, s.t0 + 0.5, 0.5),
          }}
        >
          {BOOK[info.book] ?? info.book} · Fig. {info.fig.replace(/^T/, "Table ")}
        </div>
      )}
    </AbsoluteFill>
  );
};

const Overlay: React.FC<{ s: Shot; t: number; x: Xf; R: Region; clipId: string }> = ({ s, t, x, R, clipId }) => {
  const chips: React.ReactNode[] = [];
  const svg: React.ReactNode[] = [];
  const loupes: React.ReactNode[] = [];
  (s.anns ?? []).forEach((a, i) => {
    const color = ("color" in a && a.color) || C.gold;
    // highlights expire on their own so the plate never fills up with old callouts
    const until = a.until ?? (a.k === "label" || a.k === "pin" ? Math.min(s.t1, a.t + 5.2) : s.t1);
    const inCard = (p: number[], m = 10) => p[0] > R.x + m && p[0] < R.x + R.w - m && p[1] > R.y + m && p[1] < R.y + R.h - m;
    const o = vis(t, a.t, until);
    if (o <= 0.001) return;
    if (a.k === "label") {
      const L = lab(s.plate, a.text, a.nth ?? 1);
      const [bx0, by0] = toScr(x, [L.box[0], L.box[1]]);
      const [bx1, by1] = toScr(x, [L.box[2], L.box[3]]);
      const pad = 6;
      const pulse = 0.5 + 0.5 * Math.sin((t - a.t) * 5);
      const boxIn = inCard([(bx0 + bx1) / 2, (by0 + by1) / 2], 0);
      const tipIn = L.tip ? inCard(toScr(x, L.tip), 6) : false;
      if (!boxIn && !tipIn) return;
      if (boxIn) svg.push(
        <rect key={`lb${i}`} clipPath={`url(#${clipId})`} x={bx0 - pad} y={by0 - pad} width={bx1 - bx0 + 2 * pad} height={by1 - by0 + 2 * pad} rx={8} fill={color} fillOpacity={0.16 * o} stroke={color} strokeWidth={3} opacity={o} />,
      );
      if (L.tip && L.root && !a.noTrace && tipIn) {
        const [rx, ry] = toScr(x, L.root);
        const [tx, ty] = toScr(x, L.tip);
        const p = prog(t, a.t + 0.1, 0.6, E.inOut);
        svg.push(
          <g key={`lt${i}`} opacity={o} clipPath={`url(#${clipId})`}>
            <line x1={rx} y1={ry} x2={lerp(rx, tx, p)} y2={lerp(ry, ty, p)} stroke={color} strokeWidth={4} strokeLinecap="round" />
            <circle cx={tx} cy={ty} r={(10 + 8 * pulse) * p} fill="none" stroke={color} strokeWidth={3.5} opacity={p} />
            <circle cx={tx} cy={ty} r={5 * p} fill={color} />
          </g>,
        );
        if (a.say) {
          const side = a.side ?? (tx > R.x + R.w / 2 ? "l" : "r");
          const off = 30;
          const cx = side === "l" ? tx - off : side === "r" ? tx + off : tx;
          const cy = side === "u" ? ty - off : side === "d" ? ty + off : ty;
          chips.push(<Chip key={`lc${i}`} x={cx} y={cy} text={a.say} color={color} o={prog(t, a.t + 0.45, 0.35)} anchor={side} />);
        }
      } else if (a.say) {
        const cxk = Math.min(R.x + R.w - 40, Math.max(R.x + 40, (bx0 + bx1) / 2));
        const cyk = Math.min(R.y + R.h - 20, Math.max(R.y + 70, by0 - 14));
        chips.push(<Chip key={`lc${i}`} x={cxk} y={cyk} text={a.say} color={color} o={prog(t, a.t + 0.2, 0.35)} anchor="u" />);
      }
    } else if (a.k === "pin") {
      const [px, py] = toScr(x, a.at);
      if (!inCard([px, py], 6)) return;
      const side = a.side ?? (px > R.x + R.w / 2 ? "l" : "r");
      const d = a.dist ?? 90;
      const ex = side === "l" ? px - d : side === "r" ? px + d : px;
      const ey = side === "u" ? py - d : side === "d" ? py + d : py;
      const p = prog(t, a.t, 0.5, E.inOut);
      const pulse = 0.5 + 0.5 * Math.sin((t - a.t) * 5);
      svg.push(
        <g key={`p${i}`} opacity={o}>
          <line x1={px} y1={py} x2={lerp(px, ex, p)} y2={lerp(py, ey, p)} stroke={color} strokeWidth={3.5} />
          <circle cx={px} cy={py} r={9 + 6 * pulse} fill="none" stroke={color} strokeWidth={3} />
          <circle cx={px} cy={py} r={5} fill={color} />
        </g>,
      );
      chips.push(<Chip key={`pc${i}`} x={ex + (side === "l" ? -8 : side === "r" ? 8 : 0)} y={ey + (side === "u" ? -8 : side === "d" ? 8 : 0)} text={a.say} color={color} o={prog(t, a.t + 0.35, 0.35)} anchor={side} />);
    } else if (a.k === "ring") {
      const [cx, cy] = toScr(x, a.at);
      const rx = a.r[0] * x.pw * x.s, ry = a.r[1] * x.ph * x.s;
      const p = prog(t, a.t, 0.7, E.inOut);
      const c = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
      svg.push(<ellipse key={`r${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={4.5} strokeDasharray={`${c * p} ${c}`} opacity={o} transform={`rotate(-90 ${cx} ${cy})`} />);
    } else if (a.k === "trace") {
      const pts = a.pts.map((q) => toScr(x, q));
      const d = "M" + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L");
      let len = 0;
      for (let j = 1; j < pts.length; j++) len += Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
      const p = prog(t, a.t, a.dur ?? 1.6, E.inOut);
      const w = a.w ?? 7;
      // head position
      let acc = 0, hx = pts[0][0], hy = pts[0][1], ang = 0;
      const target = len * p;
      for (let j = 1; j < pts.length; j++) {
        const sl = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
        if (acc + sl >= target) {
          const u = (target - acc) / Math.max(1e-6, sl);
          hx = lerp(pts[j - 1][0], pts[j][0], u);
          hy = lerp(pts[j - 1][1], pts[j][1], u);
          ang = Math.atan2(pts[j][1] - pts[j - 1][1], pts[j][0] - pts[j - 1][0]);
          break;
        }
        acc += sl;
      }
      svg.push(
        <g key={`t${i}`} opacity={o} clipPath={`url(#${clipId})`}>
          <path d={d} fill="none" stroke="rgba(11,6,8,0.55)" strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${len * p} ${len + 10}`} />
          <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={a.dash ? "2 16" : `${len * p} ${len + 10}`} />
          {a.arrow !== false && p > 0.02 && (
            <polygon points="-2,-12 22,0 -2,12" fill={color} transform={`translate(${hx} ${hy}) rotate(${(ang * 180) / Math.PI})`} />
          )}
        </g>,
      );
    } else if (a.k === "spot") {
      const [x0, y0] = toScr(x, [a.rect[0], a.rect[1]]);
      const [x1, y1] = toScr(x, [a.rect[2], a.rect[3]]);
      const mid = `spot-${clipId}-${i}`;
      svg.push(
        <g key={`s${i}`} opacity={o * 0.62}>
          <defs>
            <filter id={`${mid}-f`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={18} />
            </filter>
            <mask id={mid} maskUnits="userSpaceOnUse" x={0} y={0} width={1920} height={1080}>
              <rect x={0} y={0} width={1920} height={1080} fill="#fff" />
              {a.ellipse ? (
                <ellipse cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} rx={(x1 - x0) / 2} ry={(y1 - y0) / 2} fill="#000" filter={`url(#${mid}-f)`} />
              ) : (
                <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={24} fill="#000" filter={`url(#${mid}-f)`} />
              )}
            </mask>
          </defs>
          <rect x={R.x} y={R.y} width={R.w} height={R.h} fill="#0B0608" mask={`url(#${mid})`} clipPath={`url(#${clipId})`} />
        </g>,
      );
    } else if (a.k === "plane") {
      const [lx, ly] = toScr(x, [a.x0 ?? 0, a.y]);
      const [rx2] = toScr(x, [a.x1 ?? 1, a.y]);
      const p = prog(t, a.t, 0.9, E.inOut);
      svg.push(
        <g key={`pl${i}`} opacity={o} clipPath={`url(#${clipId})`}>
          <line x1={lx} y1={ly} x2={lerp(lx, rx2, p)} y2={ly} stroke={color} strokeWidth={4} strokeDasharray="18 10" />
        </g>,
      );
      chips.push(<Chip key={`plc${i}`} x={Math.min(R.x + R.w - 20, lerp(lx, rx2, p))} y={ly - 14} text={a.say} color={color} o={prog(t, a.t + 0.5, 0.35)} anchor="l" />);
    } else if (a.k === "bracket") {
      const [ax, ay] = toScr(x, a.a);
      const [bx, by] = toScr(x, a.b);
      const side = a.side ?? "r";
      const off = side === "r" ? 26 : -26;
      const X = Math.max(ax, bx) * (side === "r" ? 1 : 0) + Math.min(ax, bx) * (side === "l" ? 1 : 0) + off;
      const p = prog(t, a.t, 0.6, E.inOut);
      const ym = (ay + by) / 2;
      svg.push(
        <g key={`b${i}`} opacity={o}>
          <path d={`M${X - off / 2} ${ay} L${X} ${ay} L${X} ${lerp(ym, ay, 1 - p)} M${X} ${lerp(ym, by, 1 - p)} L${X} ${by} L${X - off / 2} ${by}`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
        </g>,
      );
      chips.push(<Chip key={`bc${i}`} x={X + (side === "r" ? 14 : -14)} y={ym} text={a.say} color={color} o={prog(t, a.t + 0.4, 0.35)} anchor={side} />);
    } else if (a.k === "loupe") {
      const [sx, sy] = toScr(x, a.at);
      const [lx, ly] = a.pos;
      const z = a.zoom;
      const p = prog(t, a.t, 0.55, E.back);
      const r = a.r * p;
      svg.push(
        <g key={`ll${i}`} opacity={o}>
          <circle cx={sx} cy={sy} r={a.r / z} fill="none" stroke={color} strokeWidth={3} />
          <line x1={sx} y1={sy} x2={lx} y2={ly} stroke={color} strokeWidth={3} strokeDasharray="6 8" />
        </g>,
      );
      loupes.push(
        <div
          key={`lp${i}`}
          style={{
            position: "absolute",
            left: lx - r,
            top: ly - r,
            width: 2 * r,
            height: 2 * r,
            borderRadius: "50%",
            overflow: "hidden",
            opacity: o,
            border: `4px solid ${color}`,
            background: s.paper ?? "#FBF8F4",
            boxShadow: "0 18px 50px rgba(0,0,0,0.6)",
          }}
        >
          <Img
            src={staticFile(`fig/${s.plate}.png`)}
            style={{
              position: "absolute",
              left: r - a.at[0] * x.pw * x.s * z,
              top: r - a.at[1] * x.ph * x.s * z,
              width: x.pw * x.s * z,
              height: x.ph * x.s * z,
              maxWidth: "none",
            }}
          />
        </div>,
      );
    }
  });
  return (
    <>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={clipId}>
            <rect x={R.x} y={R.y} width={R.w} height={R.h} rx={22} />
          </clipPath>
        </defs>
        {svg}
      </svg>
      {loupes}
      {chips}
    </>
  );
};

/* ───────── facts column (the anatomist's checklist) ───────── */
export type Fact = { t: number; head: string; text: string; color?: string; until?: number };
export const Facts: React.FC<{ facts: Fact[]; t: number; x?: number; y?: number; w?: number; gap?: number }> = ({ facts, t, x = 192, y = 300, w = 520, gap = 22 }) => {
  // the most recent fact is lit, earlier ones settle back
  let cur = -1;
  facts.forEach((f, i) => {
    if (t >= f.t) cur = i;
  });
  let yy = y;
  return (
    <>
      {facts.map((f, i) => {
        const p = prog(t, f.t, 0.4);
        const out = f.until !== undefined ? prog(t, f.until, 0.3, E.in) : 0;
        const o = p * (1 - out);
        const lit = i === cur;
        const color = f.color ?? C.coralSoft;
        const el = (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + (1 - p) * -24,
              top: yy,
              width: w,
              opacity: o * (lit ? 1 : 0.62),
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
            }}
          >
            <div style={{ fontFamily: F.mono, fontSize: 21, letterSpacing: "0.14em", textTransform: "uppercase", color, marginBottom: 4 }}>{f.head}</div>
            <div style={{ fontFamily: F.body, fontSize: 30, lineHeight: 1.28, color: C.ink, fontWeight: lit ? 560 : 450 }}>{f.text}</div>
            <div style={{ height: 3, width: lit ? 64 : 0, background: color, marginTop: 10, borderRadius: 2, transition: "none" }} />
          </div>
        );
        // reserve height (approximate: 1 line head + text lines)
        const lines = Math.ceil((f.text.length * 15.5) / w);
        yy += 34 + lines * 39 + gap + 13;
        return el;
      })}
    </>
  );
};

/** Render a list of shots. */
export const Shots: React.FC<{ shots: Shot[] }> = ({ shots }) => {
  const t = useT();
  return (
    <>
      {shots.map((s, i) => (
        <ShotView key={i} s={s} t={t} />
      ))}
    </>
  );
};

/* ───────── figure beats: a plate takes over an existing scene for a few seconds ───────── */
/** A region fitted to the plate's (or focus rect's) aspect, centred in the safe area above the captions. */
export const fitRegion = (slug: string, f: Rect = [0, 0, 1, 1], maxW = 1560, maxH = 828): Region => {
  const [pw, ph] = plateInfo(slug).px;
  const a = ((f[2] - f[0]) * pw) / Math.max(1, (f[3] - f[1]) * ph);
  let w = maxW, h = w / a;
  if (h > maxH) {
    h = maxH;
    w = h * a;
  }
  w = Math.max(w, 760);
  return { x: 960 - w / 2, y: 92 + (maxH - h) / 2, w, h };
};

/** Wraps a scene: while a beat is on, the scene steps back (dims, recedes) and the plate plays on top. */
export const BeatsLayer: React.FC<{ beats: Shot[]; children: React.ReactNode }> = ({ beats, children }) => {
  const t = useT();
  let k = 0;
  for (const b of beats) k = Math.max(k, prog(t, b.t0 - 0.1, 0.45) * (1 - prog(t, b.t1 - 0.1, 0.45, E.in)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - 0.86 * k, transform: `scale(${1 - 0.025 * k})` }}>{children}</AbsoluteFill>
      {beats.map((b, i) => (
        <ShotView key={i} s={{ ...b, region: b.region ?? fitRegion(b.plate, b.keys[0].f) }} t={t} />
      ))}
    </AbsoluteFill>
  );
};
