import React from 'react';
import { useCurrentFrame } from 'remotion';
import { resolve, Tw } from './anim';
import { C } from './colors';
import { Defs } from './prims';
import { chapterFrames, FPS, H, W } from './timeline';

/** global (final-soundtrack) time in seconds for a chapter component */
export const useChapterT = (ch: number) => {
  const f = useCurrentFrame();
  return (f + chapterFrames(ch).from) / FPS;
};

/** full-frame SVG stage */
export const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.paper }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, fontFamily: 'Inter' }}>
    <Defs />
    <rect x={0} y={0} width={W} height={H} fill={bg} />
    {children}
  </svg>
);

/** camera-transformed world layer: centres world point (cx, cy) at zoom cs */
export const World: React.FC<{ t: number; cam?: Tw[]; base: { cx: number; cy: number; cs: number }; children: React.ReactNode; op?: number }> = ({
  t, cam, base, children, op,
}) => {
  const s = resolve(t, cam, base);
  return (
    <g transform={`translate(${W / 2},${H / 2}) scale(${s.cs}) translate(${-s.cx},${-s.cy})`} opacity={op}>
      {children}
    </g>
  );
};
/** camera tween */
export const cam = (t0: number, d: number, cx: number, cy: number, cs: number, e?: (p: number) => number): Tw => ({
  t0, d, p: { cx, cy, cs }, e: e || ((p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)),
});
/** world -> screen for a given camera state */
export const toScreen = (x: number, y: number, c: Record<string, number>) =>
  [W / 2 + (x - c.cx) * c.cs, H / 2 + (y - c.cy) * c.cs] as [number, number];
