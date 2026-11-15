import React from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F } from "./theme";

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Eases by role (HyperFrames motion guide): arrivals land on a long tail, moves ease both ways, exits accelerate.
export const E = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  back: Easing.bezier(0.34, 1.4, 0.64, 1),
  linear: (x: number) => x,
};

/** 0→1 progress of a tween that starts at `start` seconds and lasts `dur`. */
export const prog = (t: number, start: number, dur: number, ease: (x: number) => number = E.out) =>
  ease(clamp((t - start) / Math.max(1e-6, dur)));

/** Progress that rises then falls: in over `din` at `a`, out over `dout` at `b`. */
export const window2 = (t: number, a: number, b: number, din = 0.3, dout = 0.25) =>
  prog(t, a, din) * (1 - prog(t, b, dout, E.in));

/** Seconds since the scene started. */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** Blur-in style (opacity + blur), the film's default arrival for text. */
export const blurIn = (t: number, start: number, dur = 0.28, blur = 10): React.CSSProperties => {
  const p = prog(t, start, dur);
  return { opacity: p, filter: p < 1 ? `blur(${(1 - p) * blur}px)` : undefined };
};

export const fadeOut = (t: number, start: number, dur = 0.25) => 1 - prog(t, start, dur, E.in);

/** Seeded PRNG (mulberry32) so particle fields are identical on every frame and every render. */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Scene header: kicker + title, top-left inside the title-safe box. */
export const Header: React.FC<{ kicker: string; title: string; color?: string; t: number; out?: number }> = ({
  kicker,
  title,
  color = C.coralSoft,
  t,
  out,
}) => {
  const o = out !== undefined ? fadeOut(t, out) : 1;
  return (
    <div style={{ position: "absolute", left: 192, top: 104, opacity: o }}>
      <div
        style={{
          fontFamily: F.body,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color,
          ...blurIn(t, 0.12, 0.3, 8),
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: F.disp,
          fontVariationSettings: '"opsz" 144, "SOFT" 30',
          fontSize: 66,
          fontWeight: 520,
          letterSpacing: "-0.02em",
          color: C.ink,
          marginTop: 6,
          ...blurIn(t, 0.22, 0.3, 10),
        }}
      >
        {title}
      </div>
    </div>
  );
};

/** SVG text label that blurs in at `t0`. */
export const SLabel: React.FC<{
  t: number;
  t0: number;
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
  font?: string;
  out?: number;
  italic?: boolean;
  ls?: string;
}> = ({ t, t0, x, y, children, size = 30, color = C.ink, weight = 500, anchor = "start", font = F.body, out, italic, ls }) => {
  const p = prog(t, t0, 0.3);
  const o = p * (out !== undefined ? fadeOut(t, out) : 1);
  if (o <= 0.001) return null;
  return (
    <text
      x={x}
      y={y}
      fontFamily={font}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      textAnchor={anchor}
      opacity={o}
      fontStyle={italic ? "italic" : undefined}
      letterSpacing={ls}
      style={{ filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined }}
    >
      {children}
    </text>
  );
};

/** A leader line that draws itself from (x1,y1) to (x2,y2). */
export const Leader: React.FC<{ t: number; t0: number; x1: number; y1: number; x2: number; y2: number; color?: string; out?: number; dot?: boolean }> = ({
  t,
  t0,
  x1,
  y1,
  x2,
  y2,
  color = C.ink2,
  out,
  dot = true,
}) => {
  const p = prog(t, t0, 0.4, E.inOut);
  const o = out !== undefined ? fadeOut(t, out) : 1;
  if (p <= 0 || o <= 0) return null;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke={color} strokeWidth={2} />
      {dot && <circle cx={x1} cy={y1} r={5} fill={color} />}
    </g>
  );
};

/** A rounded pill chip (HTML), e.g. hormones or stimuli. */
export const Chip: React.FC<{
  t: number;
  t0: number;
  x: number;
  y: number;
  label: React.ReactNode;
  color?: string;
  icon?: React.ReactNode;
  size?: number;
  out?: number;
  dim?: number;
  filled?: boolean;
}> = ({ t, t0, x, y, label, color = C.coral, icon, size = 30, out, dim = 1, filled }) => {
  const p = prog(t, t0, 0.35);
  const o = p * (out !== undefined ? fadeOut(t, out) : 1) * dim;
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: o,
        translate: `0 ${(1 - p) * 14}px`,
        filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 22px 10px 16px",
        borderRadius: 999,
        border: `2px solid ${color}`,
        background: filled ? color : "rgba(11,6,8,0.55)",
        color: filled ? C.bg : C.ink,
        fontFamily: F.body,
        fontSize: size,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </div>
  );
};

export const Arrow: React.FC<{ up?: boolean; color: string; size?: number }> = ({ up = true, color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
    <path d={up ? "M12 3 L20 13 H14.5 V21 H9.5 V13 H4 Z" : "M12 21 L20 11 H14.5 V3 H9.5 V11 H4 Z"} fill={color} />
  </svg>
);

/** Small HTML text block positioned absolutely. */
export const Text: React.FC<{
  t: number;
  t0: number;
  x: number;
  y: number;
  w?: number;
  size?: number;
  color?: string;
  weight?: number;
  font?: string;
  align?: "left" | "center" | "right";
  out?: number;
  children: React.ReactNode;
  lh?: number;
  style?: React.CSSProperties;
}> = ({ t, t0, x, y, w, size = 30, color = C.ink, weight = 500, font = F.body, align = "left", out, children, lh = 1.25, style }) => {
  const b = blurIn(t, t0);
  const o = (b.opacity as number) * (out !== undefined ? fadeOut(t, out) : 1);
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        textAlign: align,
        lineHeight: lh,
        ...b,
        opacity: o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
