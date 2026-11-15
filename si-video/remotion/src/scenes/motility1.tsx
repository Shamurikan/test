import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../lib/theme";
import { E, Header, Leader, SLabel, Text, blurIn, clamp, fadeOut, lerp, prog, useT } from "../lib/anim";
import { makeCue } from "../lib/timing";
import { Defs } from "../lib/shapes";
import { Particles, Tube, g, makeParticles } from "../lib/tube";

const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0, ...style }}>
    <Defs />
    {children}
  </svg>
);
export { Svg };

/* ───────────────────────────── s02 · The tube ───────────────────────────── */
const c02 = makeCue("s02");
const S02T = {
  runs: c02("runs"),
  pyl: c02("pyloric"),
  ileo: c02("ileocecal"),
  duo: c02("duodenum"),
  jej: c02("jejunum"),
  ile: c02("ileum, three"),
  ninety: c02("ninety"),
  fat: c02("essentially"),
  first: c02("first two"),
};
const X0 = 360, X1 = 1640, PXM = (X1 - X0) / 6.5;
const xm = (m: number) => X0 + m * PXM;
const p02 = makeParticles(70, 2, X0, X1);

export const S02: React.FC = () => {
  const t = useT();
  const T = S02T;
  const reveal = prog(t, T.runs - 0.4, 1.8, E.inOut);
  const cy = 560;
  const R = 44;
  const dimIle = prog(t, T.first - 0.2, 0.6);
  const seg = (m0: number, m1: number, color: string, t0: number, name: string, len: string) => {
    const p = prog(t, t0 - 0.1, 0.5);
    return (
      <g opacity={p}>
        <rect x={xm(m0) + 3} y={668} width={(xm(m1) - xm(m0) - 6) * p} height={10} rx={5} fill={color} />
        <text x={(xm(m0) + xm(m1)) / 2} y={726} textAnchor="middle" fontFamily={F.disp} fontSize={42} fill={C.ink} style={{ fontVariationSettings: '"opsz" 144' }}>
          {name}
        </text>
        <text x={(xm(m0) + xm(m1)) / 2} y={768} textAnchor="middle" fontFamily={F.mono} fontSize={30} fill={color}>
          {len}
        </text>
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <Header kicker="The small intestine" title="One tube, three parts" t={t} />
      <Svg>
        <defs>
          <clipPath id="s02clip">
            <rect x={0} y={0} width={X0 + (X1 + 120 - X0) * reveal} height={1080} />
          </clipPath>
        </defs>
        {/* stomach antrum + pyloric sphincter */}
        <g opacity={prog(t, 0.3, 0.6)}>
          <path d={`M ${X0 - 4} ${cy - 46} C ${X0 - 70} ${cy - 60}, ${X0 - 150} ${cy - 150}, ${X0 - 210} ${cy - 120} C ${X0 - 260} ${cy - 90}, ${X0 - 250} ${cy + 40}, ${X0 - 170} ${cy + 80} C ${X0 - 110} ${cy + 110}, ${X0 - 50} ${cy + 70}, ${X0 - 4} ${cy + 46} Z`} fill="#7E2A2F" opacity={0.85} />
          <text x={X0 - 150} y={cy + 4} textAnchor="middle" fontFamily={F.body} fontSize={28} fill={C.ink2}>stomach</text>
        </g>
        <g clipPath="url(#s02clip)">
          <Tube id="s02" x0={X0} x1={X1} cy={cy} r={() => R} wall={26} />
          <Particles ps={p02} cy={cy} r={() => R} t={t} x0={X0} x1={X1} margin={6} dx={(bx) => ((bx - X0 + t * 26) % (X1 - X0)) - (bx - X0)} />
          {/* cecum */}
          <circle cx={X1 + 52} cy={cy + 12} r={60} fill="#6E2429" />
          <circle cx={X1 + 52} cy={cy + 12} r={40} fill="#2A1310" />
          <text x={X1 + 52} y={cy + 118} textAnchor="middle" fontFamily={F.body} fontSize={28} fill={C.ink2}>cecum</text>
        </g>
        {/* sphincter + valve rings */}
        <rect x={X0 - 8} y={cy - 78} width={16} height={156} rx={8} fill={C.coral} opacity={prog(t, T.pyl, 0.4)} />
        <rect x={X1 - 8} y={cy - 78} width={16} height={156} rx={8} fill={C.coral} opacity={prog(t, T.ileo, 0.4)} />
        <Leader t={t} t0={T.pyl} x1={X0} y1={cy - 80} x2={X0 + 40} y2={cy - 170} color={C.coralSoft} out={T.ninety - 0.5} />
        <SLabel t={t} t0={T.pyl + 0.1} x={X0 + 50} y={cy - 178} size={32} weight={600} color={C.coralSoft} out={T.ninety - 0.5}>Pyloric sphincter</SLabel>
        <Leader t={t} t0={T.ileo} x1={X1} y1={cy - 80} x2={X1 - 40} y2={cy - 170} color={C.coralSoft} out={T.ninety - 0.5} />
        <SLabel t={t} t0={T.ileo + 0.1} x={X1 - 50} y={cy - 178} size={32} weight={600} color={C.coralSoft} anchor="end" out={T.ninety - 0.5}>Ileocecal valve</SLabel>
        {/* segment dividers */}
        {[0.5, 3.0].map((m, i) => (
          <line key={i} x1={xm(m)} x2={xm(m)} y1={cy - 76} y2={cy + 76} stroke={C.ink} strokeWidth={2} strokeDasharray="6 7" opacity={0.7 * prog(t, i === 0 ? T.duo : T.jej, 0.4)} />
        ))}
        {seg(0, 0.5, C.coral, T.duo, "", "")}
        {seg(0.5, 3.0, C.gold, T.jej, "Jejunum", "2–3 m")}
        {seg(3.0, 6.5, C.teal, T.ile, "Ileum", "3–4 m")}
        {/* duodenum label sits to the left/below (narrow segment) */}
        <g opacity={prog(t, T.duo - 0.1, 0.5)}>
          <line x1={(xm(0) + xm(0.5)) / 2} y1={684} x2={(xm(0) + xm(0.5)) / 2} y2={812} stroke={C.coral} strokeWidth={2} />
          <text x={(xm(0) + xm(0.5)) / 2 - 14} y={846} fontFamily={F.disp} fontSize={42} fill={C.ink} style={{ fontVariationSettings: '"opsz" 144' }}>Duodenum</text>
          <text x={(xm(0) + xm(0.5)) / 2 + 216} y={846} fontFamily={F.mono} fontSize={30} fill={C.coral}>0.5 m</text>
        </g>
        {/* ileum dims when the voice says "first two parts" */}
        <rect x={xm(3.0) + 2} y={cy - 74} width={xm(6.5) - xm(3.0) - 4} height={148} fill="#0B0608" opacity={0.45 * dimIle} />
        {/* 90% bracket over duodenum + jejunum */}
        <g opacity={prog(t, T.ninety - 0.15, 0.4)}>
          <path
            d={`M ${xm(0) + 4} ${cy - 96} L ${xm(0) + 4} ${cy - 112} L ${xm(3) - 4} ${cy - 112} L ${xm(3) - 4} ${cy - 96}`}
            fill="none"
            stroke={C.gold}
            strokeWidth={3}
            strokeDasharray={1400}
            strokeDashoffset={1400 * (1 - prog(t, T.ninety - 0.1, 0.8, E.inOut))}
          />
        </g>
      </Svg>
      <Text t={t} t0={T.ninety} x={xm(0.6)} y={300} size={34} weight={600} color={C.ink}>
        <span style={{ fontFamily: F.disp, fontSize: 64, color: C.gold, marginRight: 14 }}>≈90%</span>of carbohydrate &amp; protein digestion
      </Text>
      <Text t={t} t0={T.fat} x={xm(0.6) + 4} y={384} size={32} weight={500} color={C.ink2}>
        + essentially <b style={{ color: C.gold }}>all</b> fat digestion, in the first two parts
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s03 · Five patterns ───────────────────────────── */
const c03 = makeCue("s03");
const S03T = [c03("mixing"), c03("propelling"), c03("cleaning"), c03("reverse"), c03("emergency")];
const LANES = [
  { name: "Segmentation", sub: "mixing", color: C.coral },
  { name: "Peristalsis", sub: "propulsion", color: C.gold },
  { name: "Migrating motor complex", sub: "cleaning wave between meals", color: C.teal },
  { name: "Antiperistalsis", sub: "reverse direction", color: C.violet },
  { name: "Peristaltic rush", sub: "emergency flush", color: C.blood },
];
const LX0 = 900, LX1 = 1700;
const laneParticles = LANES.map((_, i) => makeParticles(22, 30 + i, LX0, LX1));

const laneProfile = (i: number, t: number) => {
  const R = 22;
  if (i === 0) {
    const w = 0.5 + 0.5 * Math.cos(t * Math.PI * 0.8);
    return (x: number) => {
      let d = 0;
      for (let k = 0; k < 5; k++) {
        const a = LX0 + 80 + k * 160;
        d += w * g(x, a, 16) + (1 - w) * g(x, a + 80, 16);
      }
      return R - 16 * d;
    };
  }
  if (i === 1 || i === 3 || i === 4) {
    const period = i === 4 ? 0.9 : 3.2;
    const dir = i === 3 ? -1 : 1;
    const ph = (t % period) / period;
    const c = dir > 0 ? lerp(LX0 - 60, LX1 + 60, ph) : lerp(LX1 + 60, LX0 - 60, ph);
    const c2 = i === 4 ? (dir > 0 ? lerp(LX0 - 60, LX1 + 60, (ph + 0.5) % 1) : 0) : -999;
    return (x: number) => R - 17 * g(x, c, 20) - (i === 4 ? 17 * g(x, c2, 20) : 0) + 6 * g(x, c + dir * 46, 26);
  }
  // MMC: a long band sweeping slowly
  const ph = (t % 6) / 6;
  const c = lerp(LX0 - 100, LX1 + 100, ph);
  return (x: number) => R - 12 * Math.exp(-(((x - c) / 60) ** 4));
};

export const S03: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header kicker="Part one · motility" title="Five patterns of movement" t={t} />
      <Svg>
        {LANES.map((l, i) => {
          const cy = 340 + i * 118;
          const p = prog(t, S03T[i] - 0.15, 0.5);
          const tl = Math.max(0, t - S03T[i]);
          const prof = laneProfile(i, tl);
          const speed = i === 4 ? 520 : i === 1 ? 90 : i === 3 ? -80 : i === 2 ? 60 : 0;
          return (
            <g key={i} opacity={p}>
              <text x={192} y={cy + 2} fontFamily={F.disp} fontSize={40} fill={C.ink} style={{ fontVariationSettings: '"opsz" 144' }}>
                {l.name}
              </text>
              <text x={192} y={cy + 40} fontFamily={F.body} fontSize={28} fill={l.color} fontWeight={600}>
                {l.sub}
              </text>
              <Tube id={`s03l${i}`} x0={LX0} x1={LX1} cy={cy} r={prof} wall={13} />
              <Particles
                ps={laneParticles[i]}
                cy={cy}
                r={prof}
                t={t}
                x0={LX0}
                x1={LX1}
                margin={3}
                wobble={i === 0 ? 2 : 1.5}
                dx={(bx) => {
                  if (i === 0) return Math.sin(tl * Math.PI * 0.8 + bx * 0.04) * 10;
                  const span = LX1 - LX0;
                  return ((((bx - LX0 + tl * speed) % span) + span) % span) - (bx - LX0);
                }}
              />
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s04 · Segmentation ───────────────────────────── */
const c04 = makeCue("s04");
const S04T = {
  stretch: c04("stretches"),
  ens: c04("enteric"),
  rings: c04("rings"),
  saus: c04("sausages"),
  frac: c04("fraction"),
  relax: c04("relaxes"),
  barely: c04("barely"),
  churn: c04("churned"),
  blend: c04("blended"),
  press: c04("pressed"),
};
const SX0 = 192, SX1 = 1728, SCY = 560;
const A_SET = Array.from({ length: 6 }, (_, k) => SX0 + ((k + 0.5) * (SX1 - SX0)) / 6);
const B_SET = A_SET.slice(0, 5).map((a) => a + (SX1 - SX0) / 12);
const p04 = makeParticles(190, 4, SX0, SX1);
const smooth = (x: number) => x * x * (3 - 2 * x);

/** weights of set A and set B over time (A first, then alternating every 2.4 s) */
const segWeights = (t: number) => {
  const a0 = prog(t, S04T.rings, 0.7, E.inOut);
  if (t < S04T.relax) return { wA: a0, wB: 0 };
  const slot = (t - S04T.relax) / 2.4;
  const k = Math.floor(slot);
  const f = smooth(clamp((slot - k) / 0.36));
  const fromA = k % 2 === 0;
  const wA = fromA ? 1 - f : f;
  return { wA, wB: 1 - wA };
};

export const S04: React.FC = () => {
  const t = useT();
  const T = S04T;
  const R = 112 + 14 * prog(t, T.stretch, 0.8, E.inOut);
  const { wA, wB } = segWeights(t);
  const D = R - 20;
  const prof = (x: number) => {
    let d = 0;
    for (const a of A_SET) d += wA * g(x, a, 36);
    for (const b of B_SET) d += wB * g(x, b, 36);
    return R - D * Math.min(1, d);
  };
  const push = (u: number) => Math.sign(u) * 64 * Math.exp(-((u / 74) ** 2));
  const dx = (bx: number) => {
    let d = 0;
    for (const a of A_SET) d += wA * push(bx - a);
    for (const b of B_SET) d += wB * push(bx - b);
    return d;
  };
  const ensGlow = prog(t, T.ens, 0.5) * (0.6 + 0.4 * Math.sin(t * 6));
  const pressGlow = prog(t, T.press, 0.6);
  const juice = prog(t, T.blend - 0.2, 0.6);
  return (
    <AbsoluteFill>
      <Header kicker="Motility · mixing" title="Segmentation contractions" t={t} />
      <Svg>
        <Tube id="s04" x0={SX0} x1={SX1} cy={SCY} r={prof} wall={40} />
        {/* myenteric plexus (ENS) glows inside the wall */}
        {ensGlow > 0 && (
          <g opacity={ensGlow * fadeOut(t, T.rings + 2.5, 1)}>
            {[-1, 1].map((s) => {
              let d = "";
              for (let x = SX0; x <= SX1; x += 24) {
                const y = SCY + s * (prof(x) + 26) + ((x / 24) % 2 ? 5 : -5);
                d += (x === SX0 ? "M" : " L") + `${x} ${y.toFixed(1)}`;
              }
              return <path key={s} d={d} stroke={C.nerve} strokeWidth={3} fill="none" opacity={0.9} />;
            })}
          </g>
        )}
        {/* absorptive surface glow */}
        {pressGlow > 0 &&
          [-1, 1].map((s) => {
            let d = "";
            for (let x = SX0; x <= SX1; x += 6) d += (x === SX0 ? "M" : " L") + `${x} ${(SCY + s * (prof(x) + 4)).toFixed(1)}`;
            return <path key={s} d={d} stroke="#FFE1D8" strokeWidth={4} fill="none" opacity={0.75 * pressGlow * (0.7 + 0.3 * Math.sin(t * 5))} />;
          })}
        <Particles ps={p04} cy={SCY} r={prof} t={t} x0={SX0} x1={SX1} margin={8} dx={dx} wobble={5} dy={(x, p) => p.fy * 10 * (pressGlow * Math.sin(t * 3 + p.ph))} />
        {/* digestive juices entering */}
        {juice > 0 &&
          Array.from({ length: 16 }, (_, i) => {
            const x = SX0 + 60 + i * 96;
            const s = i % 2 ? 1 : -1;
            const k = ((t * 0.7 + i * 0.37) % 1);
            const y = SCY + s * (prof(x) - k * 50);
            return <circle key={i} cx={x} cy={y} r={6} fill={C.water} opacity={juice * (1 - k) * 0.9} />;
          })}
        <Leader t={t} t0={T.ens + 0.1} x1={420} y1={SCY - prof(420) - 26} x2={470} y2={318} color={C.nerve} out={T.rings + 3} />
        <SLabel t={t} t0={T.ens + 0.2} x={480} y={312} size={30} weight={600} color={C.nerve} out={T.rings + 3}>
          enteric nervous system triggers it
        </SLabel>
        <SLabel t={t} t0={T.stretch} x={1728} y={312} size={30} weight={600} color={C.ink2} anchor="end" out={T.rings + 3}>
          stimulus: distension
        </SLabel>
      </Svg>
      <Text t={t} t0={T.saus - 0.1} x={192} y={790} size={36} weight={600} color={C.coral} out={T.barely - 0.3}>
        “a chain of sausages”
      </Text>
      <Text t={t} t0={T.frac - 0.1} x={192} y={840} size={30} color={C.ink2} out={T.barely - 0.3}>
        each set lasts a fraction of a minute, then a new set forms in between
      </Text>
      <Text t={t} t0={T.barely - 0.1} x={1728 - 520} y={300} w={520} align="right" size={32} weight={600} color={C.ink}>
        net forward movement <span style={{ color: C.coral }}>≈ 0</span>
      </Text>
      <Text t={t} t0={T.blend - 0.1} x={192} y={790} size={32} weight={600} color={C.water}>
        ↳ blends chyme with digestive juices
      </Text>
      <Text t={t} t0={T.press - 0.1} x={192} y={840} size={32} weight={600} color="#FFD3C8">
        ↳ presses it against the absorptive surface
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s05 · Peristalsis ───────────────────────────── */
const c05 = makeCue("s05");
const S05T = {
  dist: c05("distension"),
  ring: c05("contraction ring"),
  here: c05("here"),
  circC: c05("circular muscle contracts"),
  longR: c05("longitudinal muscle relaxes"),
  prop: c05("propulsive"),
  ahead: c05("just ahead"),
  longC: c05("longitudinal muscle contracts"),
  circR: c05("circular muscle relaxes"),
  recv: c05("receiving"),
  move: c05("moves forward"),
};
const PX0 = 192, PX1 = 1728, PCY = 600;
const p05 = makeParticles(60, 5, -1, 1);

export const S05: React.FC = () => {
  const t = useT();
  const T = S05T;
  const D = c05.duration;
  const bx = lerp(900, 1560, prog(t, T.move - 0.1, D - T.move - 0.3, E.inOut));
  const ringX = bx - 200;
  const recvX = bx + 230;
  const bulge = prog(t, T.dist - 0.1, 0.8, E.inOut);
  const ring = prog(t, T.ring, 0.6, E.inOut);
  const recv = prog(t, T.ahead, 0.7, E.inOut);
  const R = 70;
  const prof = (x: number) => R + 46 * bulge * g(x, bx, 105) - (R - 12) * ring * g(x, ringX, 42) + 14 * recv * g(x, recvX, 120);
  const circ = (x: number) => ring * g(x, ringX, 60);
  const long = (x: number) => recv * g(x, recvX, 130);
  const lbl = fadeOut(t, T.move - 0.15, 0.3);
  return (
    <AbsoluteFill>
      <Header kicker="Motility · propulsion" title="Peristalsis" t={t} />
      <Svg>
        <Tube id="s05" x0={PX0} x1={PX1} cy={PCY} r={prof} wall={50} layers circ={circ} long={long} />
        {/* bolus */}
        <g opacity={prog(t, 0.2, 0.5)}>
          <ellipse cx={bx} cy={PCY} rx={118} ry={Math.max(20, prof(bx) - 10)} fill={C.chyme} opacity={0.85} />
          {p05.map((p, i) => {
            const a = p.ph;
            const rr = Math.sqrt((i + 0.5) / p05.length);
            const x = bx + Math.cos(a) * rr * 100 + Math.sin(t * 1.4 + a) * 3;
            const y = PCY + Math.sin(a) * rr * (prof(bx) - 22);
            const col = [C.violet, C.teal, C.gold, "#E9C98A"][p.kind];
            return <circle key={i} cx={x} cy={y} r={p.r * 0.8} fill={col} />;
          })}
        </g>
        {/* layer leaders (left side) */}
        <Leader t={t} t0={T.here - 0.2} x1={250} y1={PCY - R - 22} x2={250} y2={470} color={C.coral} out={T.move} />
        <SLabel t={t} t0={T.here - 0.1} x={226} y={458} size={28} color={C.coral} weight={600} anchor="start" out={T.move}>
          circular muscle (inner)
        </SLabel>
        <Leader t={t} t0={T.here} x1={300} y1={PCY + R + 44} x2={300} y2={800} color={C.gold} out={T.move} />
        <SLabel t={t} t0={T.here + 0.1} x={270} y={834} size={28} color={C.gold} weight={600} out={T.move}>
          longitudinal muscle (outer)
        </SLabel>
        {/* propulsive / receiving segment brackets */}
        <g opacity={prog(t, T.prop - 0.2, 0.4) * lbl}>
          <path d={`M ${ringX - 110} 448 L ${ringX - 110} 430 L ${ringX + 110} 430 L ${ringX + 110} 448`} stroke={C.coral} strokeWidth={3} fill="none" />
        </g>
        <g opacity={prog(t, T.recv - 0.2, 0.4) * lbl}>
          <path d={`M ${recvX - 120} 448 L ${recvX - 120} 430 L ${recvX + 120} 430 L ${recvX + 120} 448`} stroke={C.gold} strokeWidth={3} fill="none" />
        </g>
        {/* direction arrow once it moves */}
        <g opacity={prog(t, T.move, 0.4)}>
          <path d={`M ${bx - 40} 452 L ${bx + 60} 452`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <path d={`M ${bx + 60} 452 l -16 -10 l 0 20 Z`} fill={C.ink} />
        </g>
      </Svg>
      <Text t={t} t0={T.dist} x={1728 - 560} y={300} w={560} align="right" size={30} weight={600} color={C.ink2} out={T.ring + 1.5}>
        stimulus: distension
      </Text>
      <div style={{ opacity: lbl }}>
        <Text t={t} t0={T.prop - 0.1} x={ringX + 70 - 520} y={258} w={520} align="right" size={30} weight={700} color={C.coral} style={{ letterSpacing: "0.12em" }}>
          PROPULSIVE SEGMENT
        </Text>
        <Text t={t} t0={T.circC - 0.1} x={ringX + 70 - 520} y={300} w={520} align="right" size={28} color={C.ink}>
          circular muscle <b style={{ color: C.coral }}>contracts</b>
        </Text>
        <Text t={t} t0={T.longR - 0.1} x={ringX + 70 - 520} y={338} w={520} align="right" size={28} color={C.ink2}>
          longitudinal muscle relaxes
        </Text>
        <Text t={t} t0={T.recv - 0.1} x={recvX - 80} y={258} w={560} align="left" size={30} weight={700} color={C.gold} style={{ letterSpacing: "0.12em" }}>
          RECEIVING SEGMENT
        </Text>
        <Text t={t} t0={T.longC - 0.1} x={recvX - 80} y={300} w={560} align="left" size={28} color={C.ink}>
          longitudinal muscle <b style={{ color: C.gold }}>contracts</b>
        </Text>
        <Text t={t} t0={T.circR - 0.1} x={recvX - 80} y={338} w={560} align="left" size={28} color={C.ink2}>
          circular muscle relaxes
        </Text>
      </div>
      <Text t={t} t0={T.move + 0.25} x={192} y={300} size={32} weight={600} color={C.ink}>
        the ring travels forward, pushing the chyme
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s06 · Speed & atropine ───────────────────────────── */
const c06 = makeCue("s06");
const S06T = {
  half: c06("half"),
  faster: c06("faster"),
  slower: c06("slower"),
  fade: c06("fade"),
  net: c06("one centimeter"),
  hours: c06("three to five hours"),
  both: c06("both"),
  plexus: c06("myenteric"),
  atropine: c06("atropine"),
  weaken: c06("weaken"),
};
const RX0 = 360, CM = 210;
const cmx = (cm: number) => RX0 + cm * CM;
const p06 = makeParticles(120, 6, 192, 1728);

export const S06: React.FC = () => {
  const t = useT();
  const T = S06T;
  const phaseA = fadeOut(t, T.both - 0.2, 0.4);
  const phaseB = prog(t, T.both, 0.5);
  // waves on the ruler: each starts every 3 s, moves 2 cm/s (visual), fades between 3 and 5 cm
  const waves = [];
  for (let k = 0; k < 6; k++) {
    const t0 = T.half - 0.3 + k * 2.6;
    const dt = t - t0;
    if (dt < 0 || dt > 2.8) continue;
    const pos = dt * 2;
    const fade = pos < 3 ? 1 : clamp(1 - (pos - 3) / 1.6 - (k % 2) * 0.2);
    waves.push({ x: cmx(pos), a: fade });
  }
  const creep = prog(t, T.net, 6, E.linear);
  const trip = prog(t, T.hours + 0.2, 3.4, E.inOut);
  // phase B: plexus + atropine
  const atro = prog(t, T.atropine + 0.2, 0.8, E.inOut);
  const amp = 1 - 0.7 * atro;
  const wA = 0.5 + 0.5 * Math.cos(Math.max(0, t - T.both) * Math.PI * 0.75);
  const sets = [380, 640, 900, 1160, 1420, 1680];
  const R = 92;
  const prof = (x: number) => {
    let d = 0;
    sets.forEach((c, i) => (d += (i % 2 ? wA : 1 - wA) * g(x, c, 40)));
    return R - (R - 26) * amp * Math.min(1, d);
  };
  const plexCol = (c: string) => (atro > 0 ? mixHex(c, "#6B6460", atro) : c);
  return (
    <AbsoluteFill>
      <Header kicker="Peristalsis · speed" title={t < T.both ? "Fast waves, slow progress" : "The myenteric plexus"} t={t} />
      <div style={{ opacity: phaseA }}>
        <Svg>
          {/* ruler */}
          <g opacity={prog(t, 0.3, 0.5)}>
            <line x1={cmx(0)} y1={470} x2={cmx(6)} y2={470} stroke={C.ink2} strokeWidth={3} />
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <line x1={cmx(i)} y1={458} x2={cmx(i)} y2={482} stroke={C.ink2} strokeWidth={3} />
                <text x={cmx(i)} y={520} textAnchor="middle" fontFamily={F.mono} fontSize={28} fill={C.ink2}>
                  {i} cm
                </text>
              </g>
            ))}
          </g>
          {/* 3–5 cm fade zone */}
          <g opacity={prog(t, T.fade - 0.1, 0.4)}>
            <rect x={cmx(3)} y={396} width={CM * 2} height={50} rx={10} fill={C.coral} opacity={0.14} />
            <text x={cmx(4)} y={384} textAnchor="middle" fontFamily={F.body} fontWeight={600} fontSize={28} fill={C.coral}>
              most waves fade here
            </text>
          </g>
          {waves.map((w, i) => (
            <g key={i} opacity={w.a}>
              <circle cx={w.x} cy={470} r={34} fill="url(#coralGlow)" />
              <rect x={w.x - 7} y={430} width={14} height={80} rx={7} fill={C.coral} />
            </g>
          ))}
          {/* net creep: 1 cm/min */}
          <g opacity={prog(t, T.net - 0.1, 0.4)}>
            <circle cx={cmx(creep * 0.1)} cy={600} r={16} fill={C.chyme} />
            <line x1={cmx(0)} y1={600} x2={cmx(6)} y2={600} stroke={C.line} strokeWidth={2} strokeDasharray="6 8" />
          </g>
          {/* 3–5 h trip */}
          <g opacity={prog(t, T.hours - 0.1, 0.4)}>
            <rect x={cmx(0)} y={760} width={CM * 6} height={14} rx={7} fill="rgba(247,239,233,0.12)" />
            <rect x={cmx(0)} y={760} width={CM * 6 * trip} height={14} rx={7} fill={C.chyme} />
            <circle cx={cmx(0) + CM * 6 * trip} cy={767} r={14} fill={C.gold} />
            <text x={cmx(0)} y={740} fontFamily={F.body} fontSize={28} fill={C.ink2}>pylorus</text>
            <text x={cmx(6)} y={740} textAnchor="end" fontFamily={F.body} fontSize={28} fill={C.ink2}>ileocecal valve</text>
          </g>
        </Svg>
        <Text t={t} t0={T.half - 0.1} x={1728 - 600} y={268} w={600} align="right" size={34} weight={600} color={C.ink}>
          wave speed <span style={{ fontFamily: F.mono, color: C.coral }}>0.5–2 cm/s</span>
        </Text>
        <Text t={t} t0={T.faster - 0.1} x={1728 - 600} y={316} w={600} align="right" size={28} color={C.ink2}>
          faster in the upper intestine,
        </Text>
        <Text t={t} t0={T.slower - 0.1} x={1728 - 600} y={352} w={600} align="right" size={28} color={C.ink2}>
          slower near the end
        </Text>
        <Text t={t} t0={T.net - 0.1} x={192} y={584} size={30} weight={600} color={C.chyme}>
          net
        </Text>
        <Text t={t} t0={T.net} x={cmx(6) - 300} y={620} w={300} align="right" size={32} weight={600} color={C.ink}>
          <span style={{ fontFamily: F.mono, color: C.gold }}>≈1 cm/min</span>
        </Text>
        <Text t={t} t0={T.hours} x={cmx(3) - 200} y={800} w={400} align="center" size={44} font={F.disp} color={C.gold}>
          3–5 hours
        </Text>
      </div>
      <div style={{ opacity: phaseB }}>
        <Svg>
          <Tube id="s06" x0={192} x1={1728} cy={590} r={prof} wall={56} layers circ={(x) => amp * (1 - prof(x) / R)} />
          <Particles ps={p06} cy={590} r={prof} t={t} x0={192} x1={1728} margin={8} dx={(bx) => Math.sin(t * 2.3 + bx * 0.02) * 26 * amp} />
          {/* plexus network between the muscle layers */}
          {[-1, 1].map((s) => {
            const nodes = Array.from({ length: 20 }, (_, i) => {
              const x = 220 + i * 78;
              return { x, y: 590 + s * (prof(x) + 40) };
            });
            return (
              <g key={s}>
                <path d={nodes.map((n, i) => `${i ? "L" : "M"}${n.x} ${n.y}`).join(" ")} stroke={plexCol(C.nerve)} strokeWidth={3} fill="none" opacity={0.9} />
                {nodes.map((n, i) => (
                  <circle key={i} cx={n.x} cy={n.y} r={7} fill={plexCol(C.nerve)} opacity={0.6 + 0.4 * (1 - atro) * (0.5 + 0.5 * Math.sin(t * 5 + i))} />
                ))}
              </g>
            );
          })}
          <Leader t={t} t0={T.plexus} x1={922} y1={590 - prof(922) - 40} x2={980} y2={336} color={plexCol(C.nerve)} />
        </Svg>
        <Text t={t} t0={T.plexus + 0.1} x={990} y={292} size={32} weight={600} color={plexCol(C.nerve)}>
          myenteric plexus, between the muscle layers
        </Text>
        <Text t={t} t0={T.both + 0.2} x={192} y={290} size={30} color={C.ink2}>
          drives segmentation and peristalsis
        </Text>
        <div style={{ position: "absolute", left: 192, top: 820, ...blurIn(t, T.atropine - 0.1) }}>
          <span style={{ fontFamily: F.body, fontSize: 32, fontWeight: 700, padding: "10px 22px", borderRadius: 999, background: C.coral, color: C.bg }}>
            Atropine
          </span>
          <span style={{ fontFamily: F.body, fontSize: 32, fontWeight: 600, color: C.ink, marginLeft: 22, opacity: prog(t, T.weaken - 0.1, 0.3) }}>
            → contractions weaken
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const m = (s: number) => Math.round(((pa >> s) & 255) + ((((pb >> s) & 255) - ((pa >> s) & 255)) * t));
  return `#${((m(16) << 16) | (m(8) << 8) | m(0)).toString(16).padStart(6, "0")}`;
};
