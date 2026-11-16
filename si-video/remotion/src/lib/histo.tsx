import React from "react";
// Procedural histology (art/histo.mjs): literal longitudinal sections, memoised as static SVG strings.
import * as HI from "../../../art/histo.mjs";

const cache = new Map<string, string>();
const memo = (key: string, fn: () => string) => {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key)!;
};

export const Raw: React.FC<{ svg: string; transform?: string; opacity?: number }> = ({ svg, transform, opacity }) => (
  <g transform={transform} opacity={opacity} dangerouslySetInnerHTML={{ __html: svg }} />
);

export const villusArt = (o: { cx: number; base: number; h: number; w: number; seed: number; id: string; detail?: number }) =>
  memo(`v:${JSON.stringify(o)}`, () => HI.villusSvg(o));

export const mucosaArt = (o: Record<string, unknown> & { id: string }) => memo(`m:${JSON.stringify(o)}`, () => HI.mucosaSvg(o).svg);

export const brunnerArt = (o: Record<string, unknown> & { id: string }) => memo(`b:${JSON.stringify(o)}`, () => HI.brunnerWallSvg(o));

/** Inter-villous floor: a strip of columnar epithelium over lamina propria with crypt openings, down to `bottom`. */
export const floorArt = (o: { x0: number; x1: number; base: number; bottom: number; crypts: number[]; id: string }) =>
  memo(`f:${JSON.stringify(o)}`, () =>
    HI.mucosaSvg({
      x0: o.x0,
      x1: o.x1,
      base: o.base,
      items: o.crypts.map((x) => ({ x, kind: "c" })),
      vh: 0,
      cd: 150,
      vw: 0,
      cw: 54,
      bottom: o.bottom,
      mmY: o.bottom - 14,
      id: o.id,
      thick: 22,
      cellW: 10,
      lacteals: false,
    }).svg,
  );

// Cells (art/cell.mjs)
import * as CA from "../../../art/cell.mjs";
export const cellVerticalArt = (o: { x0: number; x1: number; top: number; bottom: number; id: string; fat?: boolean; seed?: number; detail?: number; mvLen?: number }) =>
  memo(`cv:${JSON.stringify(o)}`, () => CA.enterocyteVertical(o));
export const brushArt = (o: { x0: number; x1: number; y: number; depth?: number; cellW?: number; id: string; mvLen?: number }) =>
  memo(`bs:${JSON.stringify(o)}`, () => CA.brushStrip(o));
