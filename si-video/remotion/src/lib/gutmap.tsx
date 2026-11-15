import React from "react";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, F } from "./theme";

// A schematic abdomen: stomach (J), duodenal C-loop, jejuno-ileal coils, ileocecal valve, cecum + ascending colon.
export const STOMACH =
  "M 930 200 C 880 205, 850 260, 862 330 C 875 410, 935 470, 1020 468 C 1080 466, 1130 440, 1158 405 L 1172 388 C 1160 372, 1140 370, 1122 380 C 1090 400, 1050 412, 1012 400 C 970 386, 950 340, 960 290 C 966 255, 990 228, 1000 212 C 980 198, 955 196, 930 200 Z";
export const SI =
  "M 1172 388 C 1240 380, 1270 440, 1258 495 C 1246 548, 1190 566, 1130 552 C 1080 540, 1040 560, 1010 600 L 880 600 A 35 35 0 0 0 880 670 L 1420 670 A 35 35 0 0 1 1420 740 L 880 740 A 35 35 0 0 0 880 810 L 1440 810";
export const SI_LEN = getLength(SI);
export const siPoint = (frac: number): { x: number; y: number } => getPointAtLength(SI, Math.max(0, Math.min(1, frac)) * SI_LEN) as { x: number; y: number };
export const VALVE = { x: 1446, y: 810 };
export const CECUM = { x: 1492, y: 826 };

/** Highlight a stretch of the small intestine from frac a to frac b. */
export const SIBand: React.FC<{ a: number; b: number; color: string; width?: number; opacity?: number }> = ({ a, b, color, width = 30, opacity = 1 }) => {
  const s = Math.max(0, a), e = Math.min(1, b);
  if (e <= s) return null;
  return (
    <path
      d={SI}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`${(e - s) * SI_LEN} ${SI_LEN * 2}`}
      strokeDashoffset={-s * SI_LEN}
      opacity={opacity}
    />
  );
};

export const GutMap: React.FC<{ food?: number; labels?: number; opacity?: number; valveOpen?: number; stomachScale?: number }> = ({
  food = 0,
  labels = 1,
  opacity = 1,
  valveOpen = 0,
  stomachScale = 1,
}) => (
  <g opacity={opacity}>
    {/* ascending colon + cecum */}
    <path d="M 1492 826 L 1492 470" stroke="#5E2026" strokeWidth={70} strokeLinecap="round" />
    <path d="M 1492 826 L 1492 470" stroke="#3A1418" strokeWidth={46} strokeLinecap="round" />
    <circle cx={CECUM.x} cy={CECUM.y} r={44} fill="#5E2026" />
    <circle cx={CECUM.x} cy={CECUM.y} r={30} fill="#3A1418" />
    {/* esophagus */}
    <path d="M 985 120 L 978 210" stroke="#7E2A2F" strokeWidth={26} strokeLinecap="round" />
    {/* stomach */}
    <g transform={`translate(1010 330) scale(${stomachScale}) translate(-1010 -330)`}>
      <path d={STOMACH} fill="#7E2A2F" stroke="#A93B3A" strokeWidth={6} />
      <path d={STOMACH} fill={C.chyme} opacity={0.85 * food} transform="translate(1010 360) scale(0.86) translate(-1010 -360)" />
    </g>
    {/* small intestine */}
    <path d={SI} fill="none" stroke="#8E2F33" strokeWidth={38} strokeLinecap="round" strokeLinejoin="round" />
    <path d={SI} fill="none" stroke={C.mucosa} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
    <path d={SI} fill="none" stroke="#3A1418" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
    {/* ileocecal valve */}
    <g transform={`translate(${VALVE.x} ${VALVE.y})`}>
      <line x1={0} y1={-20} x2={10 * (1 - valveOpen) + 20 * valveOpen} y2={-4 - 14 * valveOpen} stroke={C.coral} strokeWidth={6} strokeLinecap="round" />
      <line x1={0} y1={20} x2={10 * (1 - valveOpen) + 20 * valveOpen} y2={4 + 14 * valveOpen} stroke={C.coral} strokeWidth={6} strokeLinecap="round" />
    </g>
    <g opacity={labels}>
      <text x={1010} y={346} textAnchor="middle" fontFamily={F.body} fontSize={28} fill={C.ink}>stomach</text>
      <text x={1290} y={470} fontFamily={F.body} fontSize={28} fill={C.ink2}>duodenum</text>
      <text x={1560} y={560} fontFamily={F.body} fontSize={28} fill={C.ink2}>colon</text>
      <text x={1150} y={884} textAnchor="middle" fontFamily={F.body} fontSize={28} fill={C.ink2}>jejunum → ileum</text>
    </g>
  </g>
);
