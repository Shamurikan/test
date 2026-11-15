import React from "react";
import { AbsoluteFill } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, F } from "../lib/theme";
import { Arrow, Chip, E, Header, Leader, SLabel, Text, clamp, fadeOut, lerp, prog, rng, useT } from "../lib/anim";
import { makeCue } from "../lib/timing";
import { Particles, Tube, g, makeParticles } from "../lib/tube";
import { CECUM, GutMap, SIBand, VALVE, siPoint } from "../lib/gutmap";
import { Svg } from "./motility1";

/* ───────────────────────────── s07 · Migrating motor complex ───────────────────────────── */
const c07 = makeCue("s07");
const S07T = {
  mmc: c07("migrating"),
  empty: c07("empty stomach"),
  bursts: c07("bursts"),
  sweep: c07("sweep"),
  reach: c07("reaching"),
  hours: c07("one and a half"),
  newWave: c07("new wave"),
  house: c07("housekeeper"),
  residue: c07("residue"),
  dead: c07("dead"),
  bact: c07("bacteria"),
  colon: c07("colon"),
  auto: c07("autonomic"),
  motilin: c07("motilin"),
  stops: c07("stops"),
};
const r07 = rng(77);
const DEBRIS = Array.from({ length: 22 }, (_, i) => ({ f: 0.05 + (i / 22) * 0.9 + r07() * 0.02, kind: i % 3, off: (r07() - 0.5) * 12 }));
const BAND = 0.07;

export const S07: React.FC = () => {
  const t = useT();
  const T = S07T;
  const head1 = prog(t, T.sweep - 0.2, T.newWave - T.sweep - 0.2, E.linear) * (1 + BAND);
  const head2 = prog(t, T.newWave, T.stops - T.newWave + 4, E.linear) * (1 + BAND);
  const stop = prog(t, T.stops, 0.6);
  const bandO = (1 - stop) * prog(t, T.sweep - 0.3, 0.3);
  const hours = clamp(head1 / 1) * 2;
  const debrisO = prog(t, T.residue - 2.5, 0.6);
  const icon = (kind: number, x: number, y: number, key: React.Key, o = 1) =>
    kind === 0 ? (
      <rect key={key} x={x - 7} y={y - 7} width={14} height={14} rx={3} fill={C.chyme} opacity={o} />
    ) : kind === 1 ? (
      <circle key={key} cx={x} cy={y} r={8} fill="#F4B6C8" opacity={o} />
    ) : (
      <rect key={key} x={x - 10} y={y - 5} width={20} height={10} rx={5} fill={C.lymph} opacity={o} />
    );
  return (
    <AbsoluteFill>
      <Header kicker="Motility · between meals" title="Migrating motor complex" color={C.teal} t={t} />
      <Svg>
        <g transform="translate(80 34)">
        <GutMap food={stop} />
        {/* the MMC band(s) */}
        <g opacity={bandO}>
          <SIBand a={head1 - BAND} b={head1} color={C.teal} width={34} opacity={head1 <= 1 + BAND ? 0.95 : 0} />
          <SIBand a={head2 - BAND} b={head2} color={C.teal} width={34} opacity={t > T.newWave ? 0.95 : 0} />
        </g>
        {/* debris swept ahead of the first band, into the colon */}
        <g opacity={debrisO}>
          {DEBRIS.map((d, i) => {
            const front = head1 - 0.005;
            let f = d.f;
            let inColon = false;
            if (front > d.f) {
              f = front;
              if (front >= 1) inColon = true;
            }
            if (inColon) {
              const k = clamp((head1 - 1) / BAND);
              const y = lerp(CECUM.y, CECUM.y - 40 - (i % 7) * 40, k);
              return icon(d.kind, CECUM.x + ((i % 3) - 1) * 12, y, i);
            }
            const p = siPoint(f);
            return icon(d.kind, p.x + d.off * 0.6, p.y + d.off, i);
          })}
        </g>
        {/* electrical bursts in the empty stomach */}
        <g opacity={prog(t, T.bursts - 0.1, 0.3) * fadeOut(t, T.reach + 1, 0.5)}>
          <path
            d={Array.from({ length: 12 }, (_, i) => `${i ? "L" : "M"}${120 + i * 30} ${486 + (i % 3 === 1 ? -44 : 0)}`).join(" ")}
            stroke={C.teal}
            strokeWidth={4}
            fill="none"
            strokeDasharray={600}
            strokeDashoffset={600 * (1 - prog(t, T.bursts, 1.2, E.linear))}
          />
        </g>
        <SLabel t={t} t0={T.bursts} x={116} y={546} size={28} color={C.ink2} out={T.reach + 1}>
          bursts of depolarization
        </SLabel>
        {/* stop on eating */}
        <g opacity={stop}>
          <circle cx={1010} cy={330} r={110} fill="none" stroke={C.coral} strokeWidth={5} />
        </g>
        </g>
      </Svg>
      <Text t={t} t0={T.empty - 0.1} x={192} y={300} w={600} size={32} weight={600} color={C.ink} out={T.house - 0.3}>
        Starts in the <span style={{ color: C.teal }}>empty</span> stomach,
        <br />
        during the interdigestive period
      </Text>
      {/* clock */}
      <div style={{ position: "absolute", left: 192, top: 640, opacity: prog(t, T.sweep, 0.4) * fadeOut(t, T.house - 0.3) }}>
        <div style={{ fontFamily: F.mono, fontSize: 64, color: C.teal }}>{hours.toFixed(1)} h</div>
        <div style={{ fontFamily: F.body, fontSize: 28, color: C.ink2, marginTop: 6, opacity: prog(t, T.hours, 0.3) }}>
          reaches the ileocecal valve in 1.5–2 h,
          <br />
          then a new wave starts
        </div>
      </div>
      {/* housekeeper legend */}
      <Text t={t} t0={T.house - 0.1} x={192} y={300} size={44} font={F.disp} color={C.teal}>
        The housekeeper
      </Text>
      {[
        { t0: T.residue, label: "undigested residue", kind: 0 },
        { t0: T.dead, label: "dead mucosal cells", kind: 1 },
        { t0: T.bact, label: "bacteria", kind: 2 },
      ].map((it, i) => (
        <div key={i} style={{ position: "absolute", left: 192, top: 380 + i * 54, display: "flex", alignItems: "center", gap: 16, opacity: prog(t, it.t0 - 0.1, 0.3) }}>
          <svg width={30} height={30} viewBox="-15 -15 30 30">
            {icon(it.kind, 0, 0, 0)}
          </svg>
          <span style={{ fontFamily: F.body, fontSize: 30, color: C.ink }}>{it.label}</span>
        </div>
      ))}
      <Text t={t} t0={T.colon} x={192} y={548} size={30} color={C.ink2}>
        → swept into the colon
      </Text>
      <Chip t={t} t0={T.auto - 0.1} x={192} y={640} label="autonomic nerves" color={C.nerve} />
      <Chip t={t} t0={T.motilin - 0.1} x={192} y={712} label="motilin" color={C.teal} />
      <Text t={t} t0={T.stops - 0.1} x={192} y={800} size={32} weight={600} color={C.coral}>
        ✕ stops as soon as food is eaten
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s08 · Antiperistalsis & peristaltic rush ───────────────────────────── */
const c08 = makeCue("s08");
const S08T = {
  anti: c08("antiperistalsis"),
  st: c08("between stomach"),
  il: c08("between ileum"),
  rush: c08("peristaltic rush"),
  irrit: c08("irritation"),
  extr: c08("extrinsic"),
  brain: c08("brainstem"),
  sweeps: c08("sweeps"),
  diarrhea: c08("diarrhea", 2),
  gone: c08("gone"),
};
const p08a = makeParticles(18, 81, 360, 860);
const p08b = makeParticles(18, 82, 360, 860);
const p08r = makeParticles(70, 83, 1010, 1728);
const reflex = "M 1260 590 C 1260 470, 1380 445, 1500 445 C 1600 445, 1680 480, 1680 590";
const reflexLen = getLength(reflex);

export const S08: React.FC = () => {
  const t = useT();
  const T = S08T;
  const backWave = (t0: number, x0: number, x1: number) => {
    const ph = (((t - t0) % 2.4) + 2.4) % 2.4 / 2.4;
    const c = lerp(x1 + 40, x0 - 40, ph);
    return (x: number) => 26 - 20 * g(x, c, 22) + 6 * g(x, c - 46, 26);
  };
  const prof1 = backWave(T.st, 360, 860);
  const prof2 = backWave(T.il, 360, 860);
  const rushPh = (t * 1.6) % 1;
  const rc = lerp(980, 1780, rushPh);
  const rushOn = prog(t, T.rush, 0.4);
  const profR = (x: number) => 46 - 32 * rushOn * g(x, rc, 30) + 10 * rushOn * g(x, rc + 60, 40);
  const reflexP = prog(t, T.extr, 1.2, E.inOut);
  const pulse = getPointAtLength(reflex, ((t * 0.9) % 1) * reflexLen) as { x: number; y: number };
  return (
    <AbsoluteFill>
      <Header kicker="Motility · reverse & flush" title="Antiperistalsis and peristaltic rush" t={t} />
      <Svg>
        {/* left: antiperistalsis */}
        <g opacity={prog(t, T.anti - 0.2, 0.5)}>
          <text x={192} y={360} fontFamily={F.disp} fontSize={44} fill={C.violet} style={{ fontVariationSettings: '"opsz" 144' }}>
            Antiperistalsis
          </text>
          <text x={192} y={400} fontFamily={F.body} fontSize={28} fill={C.ink2}>waves run orad (toward the mouth)</text>
        </g>
        <g opacity={prog(t, T.st - 0.2, 0.5)}>
          <path d="M 360 470 C 330 440, 250 420, 220 470 C 200 520, 280 540, 360 500 Z" fill="#7E2A2F" />
          <Tube id="s08a" x0={360} x1={860} cy={490} r={prof1} wall={14} />
          <Particles ps={p08a} cy={490} r={prof1} t={t} x0={360} x1={860} margin={3} wobble={1.5} dx={(bx) => -(((bx - 360 + (t - T.st) * 60) % 500) - (bx - 360)) * 0} />
          <text x={240} y={560} fontFamily={F.body} fontSize={26} fill={C.ink2}>stomach</text>
          <text x={610} y={560} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink2}>duodenum</text>
          <path d="M 640 432 L 560 432" stroke={C.violet} strokeWidth={4} strokeLinecap="round" />
          <path d="M 556 432 l 14 -9 l 0 18 Z" fill={C.violet} />
          <text x={192} y={612} fontFamily={F.body} fontSize={30} fontWeight={600} fill={C.ink}>time to neutralize acid chyme</text>
        </g>
        <g opacity={prog(t, T.il - 0.2, 0.5)}>
          <Tube id="s08b" x0={360} x1={860} cy={720} r={prof2} wall={14} />
          <Particles ps={p08b} cy={720} r={prof2} t={t} x0={360} x1={860} margin={3} wobble={1.5} dx={() => 0} />
          <circle cx={892} cy={726} r={36} fill="#5E2026" />
          <circle cx={892} cy={726} r={24} fill="#3A1418" />
          <text x={610} y={790} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink2}>ileum</text>
          <text x={892} y={790} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink2}>cecum</text>
          <path d="M 640 662 L 560 662" stroke={C.violet} strokeWidth={4} strokeLinecap="round" />
          <path d="M 556 662 l 14 -9 l 0 18 Z" fill={C.violet} />
          <text x={192} y={842} fontFamily={F.body} fontSize={30} fontWeight={600} fill={C.ink}>time for absorption</text>
        </g>
        {/* divider */}
        <line x1={960} y1={320} x2={960} y2={860} stroke={C.line} strokeWidth={2} opacity={prog(t, T.rush - 0.3, 0.4)} />
        {/* right: peristaltic rush */}
        <g opacity={prog(t, T.rush - 0.2, 0.5)}>
          <text x={1010} y={360} fontFamily={F.disp} fontSize={44} fill={C.blood} style={{ fontVariationSettings: '"opsz" 144' }}>
            Peristaltic rush
          </text>
          <text x={1010} y={400} fontFamily={F.body} fontSize={28} fill={C.ink2}>powerful, rapid, far-travelling</text>
          <Tube id="s08r" x0={1010} x1={1728} cy={640} r={profR} wall={26} />
          <Particles
            ps={p08r}
            cy={640}
            r={profR}
            t={t}
            x0={1010}
            x1={1728}
            margin={6}
            dx={(bx) => {
              const span = 718;
              return ((((bx - 1010 + Math.max(0, t - T.rush) * 520) % span) + span) % span) - (bx - 1010);
            }}
          />
          {/* irritation sparks on the mucosa */}
          {Array.from({ length: 7 }, (_, i) => {
            const x = 1060 + i * 100;
            const o = prog(t, T.irrit - 0.1 + i * 0.05, 0.3) * (0.6 + 0.4 * Math.sin(t * 9 + i));
            return <path key={i} d={`M ${x} ${640 - 50} l 10 -16 l 8 12 l 10 -18`} stroke={C.blood} strokeWidth={4} fill="none" opacity={o} strokeLinejoin="round" />;
          })}
          {/* extrinsic reflex arc through the brainstem */}
          <path d={reflex} fill="none" stroke={C.nerve} strokeWidth={4} strokeDasharray={`${reflexLen * reflexP} ${reflexLen}`} />
          {reflexP >= 1 && <circle cx={pulse.x} cy={pulse.y} r={9} fill={C.nerve} />}
          <g opacity={prog(t, T.brain - 0.2, 0.4)}>
            <rect x={1430} y={417} width={140} height={56} rx={28} fill="rgba(11,6,8,0.9)" stroke={C.nerve} strokeWidth={3} />
            <text x={1500} y={455} textAnchor="middle" fontFamily={F.body} fontSize={28} fontWeight={600} fill={C.nerve}>brainstem</text>
          </g>
          <text x={1246} y={520} textAnchor="end" fontFamily={F.body} fontSize={26} fill={C.nerve} opacity={prog(t, T.extr, 0.4)}>extrinsic</text>
          <text x={1246} y={552} textAnchor="end" fontFamily={F.body} fontSize={26} fill={C.nerve} opacity={prog(t, T.extr, 0.4)}>reflex</text>
        </g>
      </Svg>
      <Text t={t} t0={T.irrit} x={1010} y={724} size={28} color={C.ink2}>
        trigger: intense irritation of the mucosa (infectious diarrhea)
      </Text>
      <Chip t={t} t0={T.sweeps} x={1010} y={784} label="→ into the colon, little absorbed" color={C.blood} size={28} />
      <Chip t={t} t0={T.diarrhea - 0.1} x={1010} y={846} label="diarrhea" color={C.blood} size={28} filled />
      <Chip t={t} t0={T.gone - 0.1} x={1200} y={846} label="irritant & distension relieved" color={C.lymph} size={28} />
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s09 · Movement of the villi ───────────────────────────── */
const c09 = makeCue("s09");
const S09T = {
  shorten: c09("shorten"),
  sway: c09("sway"),
  local: c09("local"),
  villikinin: c09("villikinin"),
  helps: c09("helps"),
  pumps: c09("pumps"),
  lacteal: c09("lacteal"),
};
const VILLI = [
  { x: 560, h: 470, w: 150, ph: 0.35 },
  { x: 900, h: 520, w: 170, ph: 0 },
  { x: 1240, h: 480, w: 150, ph: 0.6 },
];
const p09 = makeParticles(40, 9, 300, 1600);

const villusCycle = (t: number, t0: number, ph: number) => {
  if (t < t0) return 1;
  const P = 2.3;
  const u = (((t - t0 + ph * P) % P) + P) % P;
  // fast shortening (0.28 s) then slow lengthening
  return u < 0.28 ? 1 - 0.3 * E.out(u / 0.28) : 0.7 + 0.3 * E.inOut((u - 0.28) / (P - 0.28));
};

const Villus: React.FC<{ x: number; base: number; h: number; w: number; k: number; rot: number; lymphT: number; detail?: boolean }> = ({ x, base, h, w, k, rot, lymphT, detail }) => {
  const hh = h * k;
  const r = w / 2;
  const top = base - hh;
  const body = `M ${x - r} ${base} L ${x - r} ${top + r} A ${r} ${r} 0 0 1 ${x + r} ${top + r} L ${x + r} ${base} Z`;
  return (
    <g transform={`rotate(${rot} ${x} ${base})`}>
      <path d={body} fill="url(#mucosaV)" />
      <path d={body} fill="none" stroke="#FFD3C8" strokeOpacity={0.55} strokeWidth={8} />
      {/* capillary loop */}
      <path d={`M ${x - r * 0.55} ${base} L ${x - r * 0.55} ${top + r} A ${r * 0.55} ${r * 0.55} 0 0 1 ${x + r * 0.55} ${top + r} L ${x + r * 0.55} ${base}`} fill="none" stroke={C.blood} strokeWidth={6} opacity={0.85} />
      <path d={`M ${x + r * 0.55} ${base} L ${x + r * 0.55} ${top + r}`} stroke={C.bloodBlue} strokeWidth={6} opacity={0.85} />
      {detail &&
        Array.from({ length: 6 }, (_, i) => {
          const y = base - ((i + 1) * (hh - r)) / 7;
          return <path key={i} d={`M ${x - r * 0.55} ${y} C ${x - 10} ${y - 18}, ${x + 10} ${y + 10}, ${x + r * 0.55} ${y - 8}`} stroke={C.blood} strokeWidth={2.5} fill="none" opacity={0.6} />;
        })}
      {/* central lacteal */}
      <path d={`M ${x} ${base} L ${x} ${top + r * 0.9}`} stroke={C.lymph} strokeWidth={22} strokeLinecap="round" opacity={0.9} />
      {Array.from({ length: 5 }, (_, i) => {
        const f = (lymphT * 0.6 + i / 5) % 1;
        const y = lerp(top + r, base, f);
        return <circle key={i} cx={x} cy={y} r={6} fill="#D9FFE3" opacity={0.9} />;
      })}
    </g>
  );
};

export const S09: React.FC = () => {
  const t = useT();
  const T = S09T;
  const base = 900;
  const swayA = 1.5 + 2.5 * prog(t, T.sway, 0.6);
  // lymph "phase" advances faster when the villus shortens
  const lymphT = t + 0.8 * Array.from({ length: 30 }, (_, i) => Math.max(0, t - T.shorten - i * 2.3) > 0 ? 1 : 0).reduce((a: number, b: number) => a + b, 0);
  return (
    <AbsoluteFill>
      <Header kicker="Motility · villi" title="Even the villi move" t={t} />
      <Svg>
        <rect x={0} y={base - 6} width={1920} height={200} fill="#8E2F33" />
        {/* chyme in the lumen */}
        <Particles ps={p09} cy={330} r={() => 120} t={t} x0={300} x1={1600} margin={0} wobble={10} dx={(bx) => Math.sin(t * 0.4 + bx) * 40} opacity={0.8} />
        {VILLI.map((v, i) => (
          <Villus key={i} x={v.x} base={base} h={v.h} w={v.w} k={villusCycle(t, T.shorten - 0.1, v.ph)} rot={Math.sin(t * 1.3 + i * 1.7) * swayA} lymphT={lymphT + i} detail={i === 1} />
        ))}
        {/* villikinin molecules rising from the mucosa */}
        {prog(t, T.villikinin, 0.3) > 0 &&
          Array.from({ length: 12 }, (_, i) => {
            const k = ((t - T.villikinin) * 0.35 + i / 12) % 1;
            const x = 380 + i * 105;
            const y = lerp(base + 40, base - 260, k);
            return <polygon key={i} points="0,-9 8,-4 8,5 0,10 -8,5 -8,-4" transform={`translate(${x} ${y})`} fill={C.pink} opacity={(1 - k) * prog(t, T.villikinin, 0.4)} />;
          })}
        <Leader t={t} t0={T.lacteal - 0.3} x1={900} y1={640} x2={1080} y2={600} color={C.lymph} />
        <SLabel t={t} t0={T.lacteal - 0.2} x={1090} y={608} size={30} weight={600} color={C.lymph}>central lacteal: lymph pumped out</SLabel>
        {/* sawtooth trace: fast shortening, slow lengthening */}
        <g opacity={prog(t, T.shorten, 0.4)} transform="translate(1340 300)">
          <rect x={-20} y={-60} width={400} height={170} rx={16} fill="rgba(11,6,8,0.6)" stroke={C.line} />
          <text x={0} y={-24} fontFamily={F.body} fontSize={26} fill={C.ink2}>villus length</text>
          <path
            d={Array.from({ length: 3 }, (_, i) => `${i ? "L" : "M"}${i * 115} 10 L${i * 115 + 14} 80 L${i * 115 + 115} 10`).join(" ")}
            stroke={C.coral}
            strokeWidth={4}
            fill="none"
          />
          <text x={0} y={100} fontFamily={F.body} fontSize={22} fill={C.ink2} opacity={0}>.</text>
        </g>
      </Svg>
      <Text t={t} t0={T.shorten} x={1320} y={430} w={420} size={28} color={C.ink}>
        <b style={{ color: C.coral }}>fast</b> shortening, <b style={{ color: C.coral }}>slow</b> lengthening
      </Text>
      <Text t={t} t0={T.sway - 0.1} x={1320} y={470} w={420} size={28} color={C.ink2}>
        + side-to-side sway
      </Text>
      <Chip t={t} t0={T.local - 0.1} x={192} y={300} label="local reflexes: chyme touching villi" color={C.chyme} size={28} />
      <Chip t={t} t0={T.villikinin - 0.1} x={192} y={370} label="villikinin (hormone from the mucosa)" color={C.pink} size={28} />
      <Text t={t} t0={T.helps - 0.1} x={192} y={450} size={30} weight={600} color={C.ink}>
        ↳ helps absorption
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s10 · Control of motility ───────────────────────────── */
const c10 = makeCue("s10");
const UP = [
  { t0: c10("vagal"), label: "Vagus (parasympathetic)", nerve: true, d: 0.35 },
  { t0: c10("gastrin"), label: "Gastrin", d: 0.15 },
  { t0: c10("CCK"), label: "CCK", d: 0.15 },
  { t0: c10("insulin"), label: "Insulin", d: 0.12 },
  { t0: c10("serotonin"), label: "Serotonin", d: 0.12 },
  { t0: c10("motilin"), label: "Motilin → drives the MMC", d: 0.1 },
];
const DOWN = [
  { t0: c10("sympathetic"), label: "Sympathetic", nerve: true, d: -0.45 },
  { t0: c10("secretin"), label: "Secretin", d: -0.2 },
  { t0: c10("glucagon"), label: "Glucagon", d: -0.2 },
];
const freqAt = (t: number) => 0.45 + [...UP, ...DOWN].reduce((a, it) => a + it.d * prog(t, it.t0, 0.6, E.inOut), 0);
const NerveIcon = ({ color }: { color: string }) => (
  <svg width={26} height={26} viewBox="0 0 26 26">
    <path d="M2 13 L7 13 L10 5 L14 21 L17 13 L24 13" stroke={color} strokeWidth={2.6} fill="none" strokeLinejoin="round" />
  </svg>
);
const HormIcon = ({ color }: { color: string }) => (
  <svg width={22} height={22} viewBox="-11 -11 22 22">
    <polygon points="0,-9 8,-4 8,5 0,10 -8,5 -8,-4" fill={color} />
  </svg>
);

export const S10: React.FC = () => {
  const t = useT();
  // integrate wave phase deterministically
  let phase = 0;
  const dt = 1 / 30;
  for (let x = 0; x < t; x += dt) phase += freqAt(x) * dt;
  const f = freqAt(t);
  const TX0 = 760, TX1 = 1160;
  const c = TX0 - 60 + (((phase % 1) + 1) % 1) * (TX1 - TX0 + 120);
  const prof = (x: number) => 30 - 24 * g(x, c, 18) + 7 * g(x, c + 40, 22);
  const level = clamp((f - 0) / 1.4);
  return (
    <AbsoluteFill>
      <Header kicker="Motility · control" title="Who's in control?" t={t} />
      <Text t={t} t0={0.4} x={192} y={290} size={30} weight={700} color={C.lymph} style={{ letterSpacing: "0.14em" }}>
        ↑ STIMULATE
      </Text>
      <Text t={t} t0={0.4} x={1340} y={290} size={30} weight={700} color={C.blood} style={{ letterSpacing: "0.14em" }}>
        ↓ INHIBIT
      </Text>
      {UP.map((it, i) => (
        <Chip key={i} t={t} t0={it.t0 - 0.1} x={192} y={350 + i * 74} label={it.label} color={C.lymph} size={30} icon={it.nerve ? <NerveIcon color={C.nerve} /> : <HormIcon color={C.lymph} />} />
      ))}
      {DOWN.map((it, i) => (
        <Chip key={i} t={t} t0={it.t0 - 0.1} x={1340} y={350 + i * 74} label={it.label} color={C.blood} size={30} icon={it.nerve ? <NerveIcon color={C.nerve} /> : <HormIcon color={C.blood} />} />
      ))}
      <Svg>
        <g opacity={prog(t, 0.3, 0.5)}>
          <Tube id="s10" x0={TX0} x1={TX1} cy={520} r={prof} wall={18} />
          <text x={960} y={610} textAnchor="middle" fontFamily={F.body} fontSize={28} fill={C.ink2}>intestinal motility</text>
          {/* gauge */}
          <rect x={TX0} y={650} width={TX1 - TX0} height={14} rx={7} fill="rgba(247,239,233,0.12)" />
          <rect x={TX0} y={650} width={(TX1 - TX0) * level} height={14} rx={7} fill={level > 0.36 ? C.lymph : C.blood} />
          <text x={TX0} y={700} fontFamily={F.body} fontSize={24} fill={C.ink3}>slower</text>
          <text x={TX1} y={700} textAnchor="end" fontFamily={F.body} fontSize={24} fill={C.ink3}>faster</text>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s11 · Gastroileal reflex ───────────────────────────── */
const c11 = makeCue("s11");
const S11T = {
  title: c11("gastroileal"),
  food: c11("food stretches"),
  imp: c11("impulses"),
  vagus: c11("vagus"),
  wave: c11("fast peristaltic"),
  relax: c11("relaxes"),
  gastrin: c11("gastrin"),
  cecum: c11("cecum"),
  meal: c11("new meal"),
};
const vagusPath = "M 1010 250 C 1080 120, 1590 120, 1600 420 C 1605 620, 1540 780, 1446 790";
const vagusLen = getLength(vagusPath);
const r11 = rng(11);
const CHYME11 = Array.from({ length: 16 }, () => ({ f: 0.82 + r11() * 0.17, o: (r11() - 0.5) * 10, d: r11() }));

export const S11: React.FC = () => {
  const t = useT();
  const T = S11T;
  const food = prog(t, T.food - 0.1, 0.9, E.inOut);
  const vag = prog(t, T.imp, 1.6, E.inOut);
  const wave = prog(t, T.wave + 0.2, 1.6, E.inOut);
  const valve = prog(t, T.relax, 0.6, E.inOut);
  const pass = prog(t, T.cecum - 0.6, 2.2, E.inOut);
  const pulses = vag > 0 ? [0, 0.33, 0.66].map((o) => getPointAtLength(vagusPath, (((t - T.imp) * 0.5 + o) % 1) * vagusLen) as { x: number; y: number }) : [];
  return (
    <AbsoluteFill>
      <Header kicker="Motility · control" title="The gastroileal reflex" t={t} />
      <Svg>
        <g transform="translate(80 34)">
        <GutMap food={food} stomachScale={1 + 0.06 * food} valveOpen={valve} />
        {/* myenteric spread along the gut wall */}
        <SIBand a={0} b={vag} color={C.nerve} width={6} opacity={0.9} />
        {/* vagal arc */}
        <path d={vagusPath} fill="none" stroke={C.nerve} strokeWidth={4} strokeDasharray="10 9" opacity={prog(t, T.vagus - 0.4, 0.5)} />
        {prog(t, T.vagus - 0.4, 0.5) > 0 && pulses.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={9} fill={C.nerve} />)}
        <SLabel t={t} t0={T.vagus - 0.3} x={1540} y={196} size={30} weight={600} color={C.nerve} anchor="end">vagus</SLabel>
        {/* fast wave along the ileum */}
        <SIBand a={0.62 + wave * 0.36} b={0.68 + wave * 0.36} color={C.coral} width={36} opacity={wave > 0 && wave < 1 ? 1 : 0} />
        {/* chyme moving into the cecum */}
        {CHYME11.map((c, i) => {
          const k = clamp(pass * 1.3 - c.d * 0.3);
          if (k <= 0) {
            const p = siPoint(c.f);
            return <circle key={i} cx={p.x} cy={p.y + c.o} r={7} fill={C.chyme} opacity={prog(t, T.wave, 0.5)} />;
          }
          const p = siPoint(lerp(c.f, 1, k));
          const x = k < 1 ? p.x : lerp(VALVE.x, CECUM.x, 1) + c.o;
          const y = k < 1 ? p.y + c.o * (1 - k) : CECUM.y + c.o;
          return <circle key={i} cx={x} cy={y} r={7} fill={C.chyme} />;
        })}
        </g>
      </Svg>
      <Text t={t} t0={T.food - 0.1} x={192} y={300} w={600} size={32} weight={600} color={C.ink}>
        1 · food distends the stomach
      </Text>
      <Text t={t} t0={T.imp - 0.1} x={192} y={360} w={600} size={32} weight={600} color={C.nerve}>
        2 · impulses: myenteric plexus + vagus
      </Text>
      <Text t={t} t0={T.wave - 0.1} x={192} y={420} w={600} size={32} weight={600} color={C.coral}>
        3 · fast peristaltic wave to the ileum
      </Text>
      <Text t={t} t0={T.relax - 0.1} x={192} y={480} w={600} size={32} weight={600} color={C.ink}>
        4 · ileocecal valve relaxes
      </Text>
      <Chip t={t} t0={T.gastrin - 0.1} x={226} y={536} label="gastrin + CCK relax the sphincter" color={C.lymph} size={26} />
      <Text t={t} t0={T.cecum - 0.1} x={192} y={620} w={600} size={32} weight={600} color={C.chyme}>
        5 · chyme passes into the cecum
      </Text>
      <Text t={t} t0={T.meal - 0.1} x={192} y={740} w={640} size={44} font={F.disp} color={C.ink} style={{ fontStyle: "italic" }}>
        A new meal makes room for itself.
      </Text>
    </AbsoluteFill>
  );
};

// keep Arrow/Leader imports referenced for tree-shaking clarity
void Arrow;
void Leader;
