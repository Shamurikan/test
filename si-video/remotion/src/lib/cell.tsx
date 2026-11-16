import React from "react";
import { C, F } from "./theme";
import { clamp, lerp, prog } from "./anim";
import * as CA from "../../../art/cell.mjs";

// Horizontal enterocyte stage: lumen (left) | apical membrane | cell | basolateral membrane | interstitium | capillary (right)
export const AP = 700; // apical membrane x
export const BL = 1220; // basolateral membrane x
export const CAP = 1520; // capillary centre x
export const CY0 = 300, CY1 = 860;

const STAGE: Record<string, string> = {};
const stageSvg = (cap: string) => (STAGE[cap] ??= CA.enterocyteStage({ AP, BL, CAP, CY0, CY1, cap: cap === C.blood ? "blood" : "lymph", id: `es${cap === C.blood ? "b" : "l"}` }));

export const CellStage: React.FC<{ t: number; t0?: number; capColor?: string; capLabel?: string }> = ({ t, t0 = 0.2, capColor = C.blood, capLabel = "BLOOD" }) => {
  const o = prog(t, t0, 0.5);
  return (
    <g opacity={o}>
      {/* detailed enterocyte, neighbours, basal lamina, lamina propria and a fenestrated capillary (art/cell.mjs) */}
      <g dangerouslySetInnerHTML={{ __html: stageSvg(capColor) }} />
      {/* red blood cells drifting through the capillary */}
      <g>
        {Array.from({ length: 6 }, (_, i) => {
          const span = CY1 - CY0 + 260;
          const y = CY0 - 130 + ((((t * 70 + i * 113) % span) + span) % span);
          return <g key={i} dangerouslySetInnerHTML={{ __html: CA.rbcSvg(CAP + ((i % 3) - 1) * 16, y, 90 + (i % 2 ? 12 : -10), 0.95) }} />;
        })}
      </g>
      <text x={420} y={CY0 - 30} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={26} fill={C.ink3} letterSpacing="0.16em">LUMEN</text>
      <text x={(AP + BL) / 2} y={CY0 - 30} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={26} fill={C.ink} letterSpacing="0.16em" stroke="#0B0608" strokeWidth={5} paintOrder="stroke">ENTEROCYTE</text>
      <text x={CAP} y={CY0 - 30} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={26} fill={C.ink} letterSpacing="0.16em" stroke="#0B0608" strokeWidth={5} paintOrder="stroke">{capLabel}</text>
    </g>
  );
};

type Pt = [number, number];
/** position along a polyline at progress u (0..1), by segment length */
export const along = (pts: Pt[], u: number): Pt => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = clamp(u) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const f = segs[i] ? d / segs[i] : 0;
      return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
};

/** A stream of `n` items cycling along a route; render(x, y, k, u, fade) draws each. */
export const Stream: React.FC<{
  t: number;
  t0: number;
  route: Pt[];
  n?: number;
  speed?: number;
  render: (x: number, y: number, k: number, u: number) => React.ReactNode;
  stopAt?: number;
}> = ({ t, t0, route, n = 4, speed = 0.28, render, stopAt }) => {
  if (t < t0) return null;
  const tt = stopAt !== undefined ? Math.min(t, stopAt) : t;
  const fadeIn = prog(t, t0, 0.4);
  return (
    <g opacity={fadeIn}>
      {Array.from({ length: n }, (_, k) => {
        const u = ((tt - t0) * speed + k / n) % 1;
        const [x, y] = along(route, u);
        const edge = Math.min(1, u / 0.08, (1 - u) / 0.08);
        return (
          <g key={k} opacity={edge}>
            {render(x, y, k, u)}
          </g>
        );
      })}
    </g>
  );
};

export const MemLabel: React.FC<{ t: number; t0: number; x: number; y: number; title: string; sub?: string; color: string; anchor?: "start" | "end" | "middle"; out?: number }> = ({
  t,
  t0,
  x,
  y,
  title,
  sub,
  color,
  anchor = "end",
  out,
}) => {
  const p = prog(t, t0, 0.35) * (out !== undefined ? 1 - prog(t, out, 0.3) : 1);
  if (p <= 0) return null;
  return (
    <g opacity={p} style={{ filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined }}>
      <text x={x} y={y} textAnchor={anchor} fontFamily={F.body} fontWeight={700} fontSize={30} fill={color} stroke="#0B0608" strokeWidth={7} strokeOpacity={0.85} paintOrder="stroke" strokeLinejoin="round">
        {title}
      </text>
      {sub && (
        <text x={x} y={y + 34} textAnchor={anchor} fontFamily={F.body} fontWeight={500} fontSize={28} fill={C.ink2} stroke="#0B0608" strokeWidth={7} strokeOpacity={0.85} paintOrder="stroke" strokeLinejoin="round">
          {sub}
        </text>
      )}
    </g>
  );
};
