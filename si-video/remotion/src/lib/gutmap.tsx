import React from "react";
// Anatomical GI map built with the Anima kit (see art/gutmap.mjs): anterior view, patient's right on screen left.
import * as GM from "../../../art/gutmap.mjs";
import { C } from "./theme";

export const siPoint: (frac: number) => { x: number; y: number; z: number } = GM.siPoint;
export const VALVE = { x: GM.ANCHOR.valve[0] as number, y: GM.ANCHOR.valve[1] as number };
export const CECUM = { x: GM.ANCHOR.cecum[0] as number, y: GM.ANCHOR.cecum[1] as number };
export const STOMACH = { x: GM.ANCHOR.stomach[0] as number, y: GM.ANCHOR.stomach[1] as number };
export const ANCHOR = GM.ANCHOR as Record<string, [number, number]>;

type Item = { depth: number; svg: string };
const BACK: string = GM.staticBack();
const ITEMS: Item[] = GM.gutItems();

const BAND_PAL: Record<string, object> = {
  teal: { body: "#3FD0BC", shade: "#1E8C80", light1: "#6FE3D2", light2: "#A8F1E6", spec: "#E6FFFB", edge: "#0E5A52", edgeW: 1.6 },
  coral: { body: "#FF7A63", shade: "#C2453D", light1: "#FF9E8B", light2: "#FFC3B6", spec: "#FFF0EC", edge: "#7E2429", edgeW: 1.6 },
};

export type Band = { a: number; b: number; color: "teal" | "coral"; opacity?: number };

/** The full map with optional bands riding on the small intestine, depth-merged with the static tubes. */
export const GutScene: React.FC<{ food?: number; bands?: Band[]; nerve?: number; valveOpen?: number }> = ({ food = 0, bands = [], nerve = 0, valveOpen = 0 }) => {
  const dyn: Item[] = [];
  for (const b of bands) {
    if ((b.opacity ?? 1) <= 0.01) continue;
    const items: Item[] = GM.bandItems(b.a, b.b, BAND_PAL[b.color], 2);
    for (const it of items) dyn.push({ depth: it.depth, svg: b.opacity !== undefined && b.opacity < 1 ? `<g opacity="${b.opacity.toFixed(2)}">${it.svg}</g>` : it.svg });
  }
  const stomach: Item = { depth: 25, svg: GM.stomachSvg({ id: "gm-st", food }) };
  const all = [...ITEMS, ...dyn, stomach].sort((x, y) => x.depth - y.depth);
  const html = GM.wrapMask(BACK + all.map((i) => i.svg).join(""));
  // myenteric spread: a thin nerve line along the gut, drawn on top as a signal overlay
  let nervePath = "";
  if (nerve > 0.01) {
    const pts = GM.siSub(0, nerve) as number[][] | null;
    if (pts) nervePath = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  }
  return (
    <g>
      <g dangerouslySetInnerHTML={{ __html: html }} />
      {nervePath && <path d={nervePath} fill="none" stroke={C.nerve} strokeWidth={4} strokeDasharray="8 7" strokeLinecap="round" opacity={0.95} />}
      {/* ileocecal valve lips */}
      <g transform={`translate(${VALVE.x} ${VALVE.y})`} opacity={valveOpen > 0 ? 1 : 0}>
        <path d={`M ${-4 - 6 * valveOpen} -14 Q -12 -2 ${-4 - 6 * valveOpen} -2`} stroke={C.coral} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M ${-4 - 6 * valveOpen} 14 Q -12 2 ${-4 - 6 * valveOpen} 2`} stroke={C.coral} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

/** Mirrored anatomical stomach whose pylorus lands on (px, py), for the unrolled-tube diagrams. */
export const StomachAt: React.FC<{ id: string; px: number; py: number; scale?: number; food?: number; opacity?: number }> = ({ id, px, py, scale = 0.62, food = 0, opacity = 1 }) => (
  <g opacity={opacity} dangerouslySetInnerHTML={{ __html: GM.stomachAt({ id, px, py, scale, food }) }} />
);
