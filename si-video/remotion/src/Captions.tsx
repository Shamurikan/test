import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { timeline, vo } from "./lib/timing";
import { C, F } from "./lib/theme";

type CW = { t: string; s: number; e: number };
type Group = { words: CW[]; start: number; end: number };

// Scenes whose narration is already written on screen (chapter cards, quiz).
const SKIP = new Set(["c1", "c2", "c3", "s32"]);
const MAX_WORDS = 8;

const buildGroups = (): Group[] => {
  const groups: Group[] = [];
  for (const s of timeline.scenes) {
    if (SKIP.has(s.id)) continue;
    for (const p of s.parts) {
      const base = s.from / timeline.fps + p.start;
      const words = vo[p.key].words.map((w) => ({ t: w.t, s: base + w.s, e: base + w.e }));
      // 1) clauses: break after punctuation or a real pause
      const clauses: CW[][] = [];
      let cur: CW[] = [];
      words.forEach((w, i) => {
        cur.push(w);
        const next = words[i + 1];
        const hard = /[.:;?!]$/.test(w.t);
        const comma = /,$/.test(w.t) && cur.length >= 3;
        const pause = next ? next.s - w.e > 0.45 : true;
        if (!next || hard || comma || pause) {
          clauses.push(cur);
          cur = [];
        }
      });
      // 2) long clauses split into balanced chunks of at most MAX_WORDS
      for (const c of clauses) {
        const k = Math.ceil(c.length / MAX_WORDS);
        const size = Math.ceil(c.length / k);
        for (let i = 0; i < c.length; i += size) {
          const ws = c.slice(i, i + size);
          groups.push({ words: ws, start: ws[0].s - 0.08, end: ws[ws.length - 1].e + 0.4 });
        }
      }
    }
  }
  // merge a lone short group into its neighbour when it is only 1 word
  for (let i = 0; i < groups.length - 1; i++) groups[i].end = Math.min(groups[i].end, groups[i + 1].start - 0.02);
  return groups;
};

const GROUPS = buildGroups();

export const Captions: React.FC<{ offsetFrames?: number }> = ({ offsetFrames = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = (frame + offsetFrames) / fps;
  const g = GROUPS.find((x) => T >= x.start && T < x.end);
  if (!g) return null;
  const fadeIn = Math.min(1, (T - g.start) / 0.12);
  const fadeOut = Math.min(1, (g.end - T) / 0.12);
  const o = Math.max(0, Math.min(fadeIn, fadeOut));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", opacity: o, pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1480,
          padding: "10px 26px 12px",
          borderRadius: 14,
          background: "rgba(11,6,8,0.72)",
          fontFamily: F.body,
          fontSize: 38,
          fontWeight: 500,
          lineHeight: 1.25,
          textAlign: "center",
          color: C.ink,
          letterSpacing: "-0.005em",
        }}
      >
        {g.words.map((w, i) => (
          <span key={i} style={{ opacity: T >= w.s - 0.02 ? 1 : 0.5 }}>
            {w.t}
            {i < g.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
