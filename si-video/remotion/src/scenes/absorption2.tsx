import React from "react";
import { AbsoluteFill } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { C, F } from "../lib/theme";
import { Chip, E, Header, SLabel, Text, clamp, fadeOut, lerp, prog, useT } from "../lib/anim";
import { makeCue } from "../lib/timing";
import { Bead, Drop, Enzyme, Hex, Ion, Transporter } from "../lib/shapes";
import { Tube } from "../lib/tube";
import { Stream } from "../lib/cell";
import { StomachAt } from "../lib/gutmap";
import { Raw, cellVerticalArt, villusArt } from "../lib/histo";
import { Svg } from "./motility1";

/* shared straight gut (to scale): duodenum 0.5 m, jejunum 2.5 m, ileum 3.5 m */
const GX0 = 400, GX1 = 1640, GPXM = (GX1 - GX0) / 6.5;
const gm = (m: number) => GX0 + m * GPXM;
const StraightGut: React.FC<{ t: number; cy: number; t0?: number; cut?: number }> = ({ t, cy, t0 = 0.2, cut = 0 }) => (
  <g opacity={prog(t, t0, 0.5)}>
    <StomachAt id={`sgst${cy}`} px={GX0 - 2} py={cy} scale={0.6} />
    <text x={GX0 - 96} y={cy - 38} textAnchor="middle" fontFamily={F.body} fontSize={26} fontWeight={600} fill={C.ink} stroke="#0B0608" strokeWidth={6} paintOrder="stroke">stomach</text>
    <Tube id={`sg${cy}`} x0={GX0} x1={GX1} cy={cy} r={() => 30} wall={20} />
    <circle cx={GX1 + 44} cy={cy + 10} r={48} fill="#5E2026" />
    <text x={GX1 + 44} y={cy + 100} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink2}>colon</text>
    {[0.5, 3].map((m) => (
      <line key={m} x1={gm(m)} x2={gm(m)} y1={cy - 54} y2={cy + 54} stroke={C.ink} strokeDasharray="5 6" strokeWidth={2} opacity={0.6} />
    ))}
    {[
      ["duodenum", 0.25],
      ["jejunum", 1.75],
      ["ileum", 4.75],
    ].map(([n, m]) => (
      <text key={n as string} x={gm(m as number)} y={cy + 92} textAnchor="middle" fontFamily={F.body} fontSize={28} fill={C.ink2}>
        {n}
      </text>
    ))}
    {cut > 0 && (
      <g opacity={cut}>
        <rect x={gm(5.9)} y={cy - 56} width={gm(6.5) - gm(5.9)} height={112} fill="#0B0608" opacity={0.7} />
        <path d={`M ${gm(5.9)} ${cy - 70} L ${gm(5.9)} ${cy + 70}`} stroke={C.blood} strokeWidth={5} strokeDasharray="10 8" />
      </g>
    )}
  </g>
);

const Band: React.FC<{ t: number; t0: number; m0: number; m1: number; y: number; color: string; label: string; anchor?: "start" | "end"; out?: number; dim?: number }> = ({ t, t0, m0, m1, y, color, label, anchor = "start", out, dim = 1 }) => {
  const p = prog(t, t0 - 0.1, 0.6, E.inOut);
  const o = prog(t, t0 - 0.1, 0.3) * (out !== undefined ? fadeOut(t, out) : 1) * dim;
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={gm(m0)} y={y} width={(gm(m1) - gm(m0)) * p} height={16} rx={8} fill={color} />
      <text x={anchor === "start" ? gm(m0) : gm(m1)} y={y - 14} textAnchor={anchor} fontFamily={F.body} fontWeight={600} fontSize={30} fill={color}>
        {label}
      </text>
    </g>
  );
};

/* ───────────────────────────── s25 · Vitamins ───────────────────────────── */
const c25 = makeCue("s25");
const S25T = {
  adek: c25("A, D"),
  micelles: c25("micelles"),
  ws: c25("water-soluble"),
  b12: c25("B12"),
  if: c25("intrinsic"),
  term: c25("terminal ileum"),
  lose: c25("lose"),
  pari: c25("parietal"),
  pern: c25("pernicious"),
};

export const S25: React.FC = () => {
  const t = useT();
  const T = S25T;
  const cy = 700;
  const ifTravel = prog(t, T.if + 0.2, 2.6, E.inOut);
  const cut = prog(t, T.lose, 0.6);
  const stomachX = prog(t, T.pari - 0.1, 0.4);
  const ifPos = ifTravel < 0.15 ? { x: GX0 - 150, y: cy } : { x: lerp(GX0 - 60, gm(6.2), (ifTravel - 0.15) / 0.85), y: cy };
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · vitamins" title="Vitamins: where and how" color={C.gold} t={t} />
      <Svg>
        <StraightGut t={t} cy={cy} cut={cut} />
        <Band t={t} t0={S25T.adek} m0={0.5} m1={3} y={560} color={C.gold} label="A, D, E, K: fat-soluble, in micelles (need bile salts)" />
        <Band t={t} t0={S25T.ws} m0={0.5} m1={4.6} y={460} color={C.teal} label="C & B group: water-soluble, Na⁺-dependent cotransport" />
        <Band t={t} t0={S25T.b12} m0={5.9} m1={6.5} y={560} color={C.blood} label="B12 + intrinsic factor" anchor="end" />
        {/* intrinsic factor carrying B12 */}
        <g opacity={prog(t, T.if - 0.1, 0.3) * (1 - cut)}>
          <circle cx={ifPos.x} cy={ifPos.y} r={14} fill={C.blood} />
          <Enzyme x={ifPos.x - 18} y={ifPos.y} rot={0} color={C.pink} r={18} open={0.55} />
        </g>
        {/* stomach cross-out (gastrectomy / atrophy) */}
        <g opacity={stomachX}>
          <path d={`M ${GX0 - 180} ${cy - 120} L ${GX0 - 20} ${cy + 50} M ${GX0 - 20} ${cy - 120} L ${GX0 - 180} ${cy + 50}`} stroke={C.blood} strokeWidth={7} strokeLinecap="round" />
        </g>
        <SLabel t={t} t0={T.if} x={GX0 - 150} y={cy - 150} size={28} color={C.pink} anchor="middle" weight={600}>intrinsic factor (parietal cells)</SLabel>
      </Svg>
      <Text t={t} t0={0.4} x={192} y={290} w={1200} size={30} color={C.ink2} out={T.adek - 0.2}>
        mainly absorbed in the jejunum and ileum
      </Text>
      <Text t={t} t0={T.lose - 0.1} x={192} y={290} w={760} size={30} color={C.ink}>
        ileal resection, or gastrectomy / gastric atrophy (no parietal cells → no intrinsic factor)
      </Text>
      <Chip t={t} t0={T.pern - 0.1} x={1100} y={300} label="→ pernicious anemia" color={C.blood} size={34} filled />
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s26 · Fluid budget & routes ───────────────────────────── */
const c26 = makeCue("s26");
const S26T = {
  nine: c26("nine"),
  two: c26("two liters"),
  seven: c26("seven"),
  si: c26("eight and a half"),
  colon: c26("four hundred"),
  routes: c26("water and electrolytes"),
  trans: c26("transcellular"),
  para: c26("paracellular"),
  leaky: c26("leaky"),
  tight: c26("tight", 2),
};
const PXL = 150, BX = 240;
const INPUTS = [
  { l: "drunk", v: 2, c: C.water },
  { l: "saliva", v: 1.5, c: "#F6B8AA" },
  { l: "gastric", v: 2, c: "#FF9A86" },
  { l: "bile", v: 0.5, c: C.lymph },
  { l: "pancreatic", v: 1.5, c: C.gold },
  { l: "intestinal", v: 1.5, c: C.violet },
];

export const S26: React.FC = () => {
  const t = useT();
  const T = S26T;
  const phA = fadeOut(t, T.routes - 0.3, 0.4);
  const phB = prog(t, T.routes, 0.5);
  const leak = 1 - prog(t, T.tight - 0.1, 0.5);
  let acc = 0;
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · water" title={t < T.routes ? "Nine liters a day" : "Two routes across"} color={C.water} t={t} />
      <div style={{ opacity: phA }}>
        <Svg>
          {INPUTS.map((s, i) => {
            const x = BX + acc * PXL;
            acc += s.v;
            const t0 = i === 0 ? T.two : T.seven + (i - 1) * 0.12;
            const p = prog(t, t0 - 0.1, 0.4);
            return (
              <g key={i} opacity={p}>
                <rect x={x + 2} y={420} width={s.v * PXL - 4} height={60} rx={10} fill={s.c} />
                <text x={x + (s.v * PXL) / 2} y={402} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink2}>{s.l}</text>
                <text x={x + (s.v * PXL) / 2} y={461} textAnchor="middle" fontFamily={F.mono} fontSize={26} fill={C.bg}>{s.v}</text>
              </g>
            );
          })}
          <g opacity={prog(t, T.seven - 0.1, 0.4)}>
            <path d={`M ${BX + 2 * PXL} 500 L ${BX + 2 * PXL} 516 L ${BX + 9 * PXL} 516 L ${BX + 9 * PXL} 500`} stroke={C.ink2} strokeWidth={2} fill="none" />
            <text x={BX + 5.5 * PXL} y={552} textAnchor="middle" fontFamily={F.body} fontSize={28} fill={C.ink}>7 L of secretions</text>
          </g>
          {/* where it goes */}
          <g opacity={prog(t, T.si - 0.2, 0.4)}>
            <rect x={BX + 2} y={640} width={(8.5 * PXL - 4) * prog(t, T.si, 1.0, E.inOut)} height={70} rx={10} fill={C.teal} />
            <text x={BX + 24} y={688} fontFamily={F.body} fontWeight={700} fontSize={30} fill={C.bg} opacity={prog(t, T.si + 0.5, 0.3)}>small intestine absorbs ≈ 8.5 L</text>
          </g>
          <g opacity={prog(t, T.colon - 0.1, 0.4)}>
            <rect x={BX + 8.5 * PXL + 2} y={640} width={0.4 * PXL - 4} height={70} rx={8} fill={C.na} />
            <text x={BX + 8.7 * PXL} y={760} textAnchor="end" fontFamily={F.body} fontSize={28} fill={C.na}>colon ≈ 0.4 L</text>
            <rect x={BX + 8.9 * PXL + 2} y={640} width={0.1 * PXL} height={70} rx={4} fill={C.chyme} />
            <text x={BX + 9 * PXL} y={800} textAnchor="end" fontFamily={F.body} fontSize={26} fill={C.ink3}>≈ 0.1 L in stool</text>
          </g>
        </Svg>
        <div style={{ position: "absolute", left: 192, top: 268, opacity: prog(t, T.nine - 0.1, 0.4), fontFamily: F.body, fontSize: 30, color: C.ink }}>
          enter the gut every day: <span style={{ fontFamily: F.disp, fontSize: 52, color: C.water }}>≈ 9 L</span>
        </div>
      </div>
      <div style={{ opacity: phB }}>
        <Svg>
          {[0, 1, 2].map((k) => {
            const x = 560 + k * 240;
            return (
              <g key={k}>
                <Raw svg={cellVerticalArt({ x0: x, x1: x + 224, top: 430, bottom: 770, id: `s26c${k}`, seed: 11 + k, detail: 0.8, mvLen: 36 })} />
              </g>
            );
          })}
          {/* tight junctions: a slit opens when leaky */}
          {[792, 1032].map((x, k) => (
            <g key={k}>
              <rect x={x - 12} y={424} width={24} height={34} rx={4} fill="#3A1418" />
              <rect x={x - 3 * leak} y={424} width={6 * leak} height={34} fill="#F7EFE9" opacity={0.8 * leak} />
            </g>
          ))}
          {/* transcellular */}
          <g opacity={prog(t, T.trans - 0.1, 0.4)}>
            <path d="M 672 300 L 672 860" stroke={C.water} strokeWidth={5} strokeDasharray="12 10" />
          </g>
          <Stream t={t} t0={T.trans} route={[[672, 300], [672, 870]]} n={3} speed={0.35} render={(x, y) => <Drop x={x} y={y} s={1.3} />} />
          {/* paracellular */}
          <g opacity={prog(t, T.para - 0.1, 0.4)}>
            <path d="M 792 300 L 792 860" stroke={C.na} strokeWidth={5} strokeDasharray="12 10" opacity={0.4 + 0.6 * leak} />
          </g>
          <Stream t={t} t0={T.para} route={[[792, 300], [792, 870]]} n={3} speed={0.35 * leak + 0.0001} render={(x, y) => <Drop x={x} y={y} s={1.3} fill={C.na} />} stopAt={T.tight + 0.3} />
          <text x={640} y={280} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={28} fill={C.water} opacity={prog(t, T.trans, 0.3)}>transcellular</text>
          <text x={830} y={280} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={28} fill={C.na} opacity={prog(t, T.para, 0.3)}>paracellular</text>
          <text x={1110} y={384} fontFamily={F.body} fontSize={26} fill={C.ink3} opacity={prog(t, T.para, 0.3)}>tight junction</text>
          <line x1={1104} y1={378} x2={1044} y2={426} stroke={C.ink3} strokeWidth={2} opacity={prog(t, T.para, 0.3)} />
        </Svg>
        <Chip t={t} t0={T.leaky - 0.1} x={1330} y={540} label="small intestine: leaky" color={C.na} size={30} filled={leak > 0.5} />
        <Chip t={t} t0={T.tight - 0.2} x={1330} y={620} label="colon: tight" color={C.ink2} size={30} filled={leak <= 0.5} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s27 · Sodium & water ───────────────────────────── */
const c27 = makeCue("s27");
const S27T = {
  drives: c27("drives"),
  passive: c27("passive"),
  glucose: c27("glucose"),
  chloride: c27("chloride"),
  hydrogen: c27("hydrogen"),
  pump: c27("basolateral pump"),
  pile: c27("pile"),
  osm: c27("osmotic"),
  water: c27("water follows"),
  jej: c27("jejunum"),
  ile: c27("ileum"),
  aldo: c27("aldosterone"),
};
const LC0 = 560, LC1 = 920, RC0 = 1000, RC1 = 1360, CT = 420, CB = 800;
const ENTRY = [
  { x: 610, label: "1 passive diffusion", t: "passive", col: C.na },
  { x: 700, label: "2 Na⁺–glucose / AA", t: "glucose", col: C.violet },
  { x: 790, label: "3 Na⁺ + Cl⁻", t: "chloride", col: C.cl },
  { x: 880, label: "4 Na⁺ ⇄ H⁺ exchange", t: "hydrogen", col: C.h },
];

export const S27: React.FC = () => {
  const t = useT();
  const T = S27T;
  const pile = prog(t, T.pile - 0.2, 2.0, E.out);
  const tt = (k: string) => (S27T as Record<string, number>)[k];
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · electrolytes" title="Sodium pulls water with it" color={C.na} t={t} />
      <Svg>
        {/* two cells with the lateral space between them */}
        {[LC0, RC0].map((x0, i) => (
          <g key={i}>
            <Raw svg={cellVerticalArt({ x0, x1: x0 + 360, top: CT, bottom: CB, id: `s27c${i}`, seed: 21 + i, detail: 0.9, mvLen: 40 })} />
          </g>
        ))}
        <rect x={LC1 - 2} y={CT - 6} width={84} height={20} rx={6} fill="#3A1418" />
        {/* lateral intercellular space fills with Na+ */}
        <rect x={LC1 + 6} y={CT + 20} width={68} height={CB - CT - 20} fill={C.na} opacity={0.08 + 0.22 * pile} />
        {Array.from({ length: 16 }, (_, k) => {
          const show = prog(t, T.pump + k * 0.18, 0.3);
          return <Ion key={k} x={LC1 + 22 + (k % 2) * 34} y={CT + 60 + Math.floor(k / 2) * 44 + Math.sin(t * 2 + k) * 4} label="Na⁺" fill={C.na} r={13} o={show} />;
        })}
        {/* capillary */}
        <rect x={420} y={850} width={1080} height={56} rx={28} fill={C.blood} opacity={0.22} stroke={C.blood} strokeWidth={4} />
        <text x={1520} y={888} fontFamily={F.body} fontSize={26} fill={C.ink2}>capillary</text>
        {/* apical entry transporters */}
        {ENTRY.map((e, i) => (
          <g key={i} opacity={prog(t, tt(e.t) - 0.2, 0.4)}>
            <g transform={`rotate(90 ${e.x} ${CT})`}>
              <Transporter x={e.x} y={CT} color={e.col} h={60} w={20} />
            </g>
          </g>
        ))}
        {ENTRY.map((e, i) => (
          <Stream key={i} t={t} t0={tt(e.t)} route={[[e.x, 300], [e.x, CT], [e.x + 20, 600], [LC1 - 4, 560 + i * 40]]} n={2} speed={0.35} render={(x, y) => <Ion x={x} y={y} label="Na⁺" fill={C.na} r={12} />} />
        ))}
        {/* basolateral pumps on the lateral membrane */}
        {[520, 640, 740].map((y, i) => (
          <g key={i} opacity={prog(t, T.pump - 0.2, 0.4)}>
            <Transporter x={LC1} y={y} color="#8FA3B8" h={56} w={18} />
          </g>
        ))}
        {/* water follows: through junction / cells into the space, then to blood */}
        <Stream t={t} t0={T.water} route={[[960, 300], [960, CT - 6], [960, 820], [960, 880]]} n={4} speed={0.4} render={(x, y) => <Drop x={x} y={y} s={1.2} />} />
        <Stream t={t} t0={T.water + 0.4} route={[[780, 300], [800, CT], [900, 600], [945, 700], [945, 880]]} n={3} speed={0.35} render={(x, y) => <Drop x={x} y={y} s={1.2} />} />
        <SLabel t={t} t0={T.osm} x={1400} y={590} size={30} weight={600} color={C.na}>↑ osmolarity in the</SLabel>
        <SLabel t={t} t0={T.osm} x={1400} y={626} size={30} weight={600} color={C.na}>lateral space</SLabel>
        <SLabel t={t} t0={T.water} x={1400} y={700} size={30} weight={600} color={C.water}>water follows</SLabel>
        <SLabel t={t} t0={T.pump} x={1400} y={500} size={28} color="#B9C7D6">Na⁺/K⁺ pumps</SLabel>
      </Svg>
      {ENTRY.map((e, i) => (
        <Text key={i} t={t} t0={tt(e.t) - 0.1} x={192} y={430 + i * 50} w={360} size={28} weight={600} color={e.col === C.h ? C.ink : e.col}>
          {e.label}
        </Text>
      ))}
      <Text t={t} t0={T.drives - 0.1} x={192} y={370} w={360} size={28} weight={700} color={C.ink2} style={{ letterSpacing: "0.1em" }}>
        Na⁺ ENTRY
      </Text>
      <Chip t={t} t0={T.jej - 0.1} x={1390} y={300} label="jejunum: net NaHCO₃" color={C.hco3} size={26} />
      <Chip t={t} t0={T.ile - 0.1} x={1390} y={364} label="ileum: net NaCl" color={C.cl} size={26} />
      <Chip t={t} t0={T.aldo - 0.1} x={1040} y={236} label="aldosterone ↑ Na⁺ absorption (esp. colon)" color={C.gold} size={26} />
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s28 · Cl⁻, K⁺, HCO₃⁻, Ca²⁺ ───────────────────────────── */
const c28 = makeCue("s28");
const S28T = {
  cl: c28("chloride"),
  k: c28("potassium"),
  colon: c28("secreted"),
  hypo: c28("hypokalemia"),
  hco3: c28("ileum and large"),
  neut: c28("neutralizing"),
  ca: c28("calcium"),
  vitd: c28("1,25"),
  pth: c28("parathyroid"),
};
const Panel: React.FC<{ t: number; t0: number; x: number; y: number; ion: React.ReactNode; title: string; color: string; lines: { t0: number; text: React.ReactNode }[]; dimAt?: number }> = ({ t, t0, x, y, ion, title, color, lines, dimAt }) => {
  const p = prog(t, t0 - 0.2, 0.4);
  const dim = dimAt !== undefined ? 1 - 0.45 * prog(t, dimAt, 0.4) : 1;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 744, height: 300, borderRadius: 24, background: "rgba(247,239,233,0.045)", border: `2px solid ${color}55`, padding: "26px 30px", opacity: p * dim, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
        {ion}
        <span style={{ fontFamily: F.disp, fontSize: 42, color: C.ink }}>{title}</span>
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: F.body, fontSize: 28, color: C.ink, lineHeight: 1.35, marginTop: 6, opacity: prog(t, l.t0 - 0.1, 0.3) }}>
          {l.text}
        </div>
      ))}
    </div>
  );
};
const IonBadge: React.FC<{ label: string; fill: string }> = ({ label, fill }) => (
  <svg width={60} height={60} viewBox="-30 -30 60 60">
    <Ion x={0} y={0} label={label} fill={fill} r={28} />
  </svg>
);

export const S28: React.FC = () => {
  const t = useT();
  const T = S28T;
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · electrolytes" title="Chloride, potassium, bicarbonate, calcium" color={C.na} t={t} />
      <Panel t={t} t0={T.cl} x={192} y={270} ion={<IonBadge label="Cl⁻" fill={C.cl} />} title="Chloride follows sodium" color={C.cl} dimAt={T.k} lines={[
        { t0: T.cl + 0.6, text: "• passive diffusion" },
        { t0: T.cl + 1.2, text: "• Na⁺–Cl⁻ cotransport" },
        { t0: T.cl + 1.8, text: "• Cl⁻ / HCO₃⁻ exchange" },
      ]} />
      <Panel t={t} t0={T.k} x={984} y={270} ion={<IonBadge label="K⁺" fill={C.k} />} title="Potassium" color={C.k} dimAt={T.hco3} lines={[
        { t0: T.k + 0.5, text: <>small intestine: <b style={{ color: C.k }}>absorbed</b> (passive diffusion)</> },
        { t0: T.colon, text: <>colon: <b style={{ color: C.k }}>secreted</b>, stimulated by aldosterone</> },
        { t0: T.hypo - 0.2, text: <>diarrhea → <b style={{ color: C.blood }}>hypokalemia</b></> },
      ]} />
      <Panel t={t} t0={T.hco3} x={192} y={600} ion={<IonBadge label="HCO₃⁻" fill={C.hco3} />} title="Bicarbonate secretion" color={C.hco3} dimAt={T.ca} lines={[
        { t0: T.hco3 + 0.4, text: "ileum + large intestine secrete HCO₃⁻ in exchange for Cl⁻" },
        { t0: T.neut, text: "→ neutralizes acids made by bacteria in the large intestine" },
      ]} />
      <Panel t={t} t0={T.ca} x={984} y={600} ion={<IonBadge label="Ca²⁺" fill={C.ca} />} title="Calcium" color="#B9A8FF" lines={[
        { t0: T.vitd, text: <>1,25-(OH)₂-vitamin D₃ → Ca²⁺-binding protein + Ca²⁺-ATPase</> },
        { t0: T.pth, text: <span style={{ color: C.ink2 }}>↓ plasma Ca²⁺ → PTH → 25-OH-D₃ → <b style={{ color: C.ink }}>1,25-(OH)₂-D₃</b></span> },
      ]} />
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s29 · Hormonal control of absorption ───────────────────────────── */
const c29 = makeCue("s29");
const HORM = [
  { w: "glucocorticoids", name: "Glucocorticoids", eff: "↑ H₂O & ion absorption", sites: [1, 1, 1, 1] },
  { w: "somatostatin", name: "Somatostatin", eff: "↑ H₂O & ion absorption", sites: [0, 0, 1, 1] },
  { w: "epinephrine", name: "Epinephrine", eff: "↑ NaCl absorption", sites: [0, 0, 1, 0] },
  { w: "aldosterone", name: "Aldosterone", eff: "↑ Na⁺ channel synthesis", sites: [0, 0, 0, 1] },
].map((h) => ({ ...h, t0: c29(h.w) }));
const SEG = ["duodenum", "jejunum", "ileum", "colon"];

export const S29: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · control" title="Hormones fine-tune absorption" color={C.na} t={t} />
      <Svg>
        {SEG.map((s, i) => (
          <text key={s} x={1160 + i * 140 + 62} y={300} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink3} opacity={prog(t, 0.4, 0.4)}>{s}</text>
        ))}
        {HORM.map((h, r) => {
          const y = 360 + r * 130;
          const p = prog(t, h.t0 - 0.2, 0.4);
          return (
            <g key={r} opacity={p}>
              <text x={192} y={y + 30} fontFamily={F.disp} fontSize={44} fill={C.ink} style={{ fontVariationSettings: '"opsz" 144' }}>{h.name}</text>
              <text x={620} y={y + 30} fontFamily={F.body} fontWeight={600} fontSize={30} fill={C.na}>{h.eff}</text>
              {SEG.map((_, i) => {
                const on = h.sites[i] ? prog(t, h.t0 + 0.3 + i * 0.06, 0.4) : 0;
                return (
                  <g key={i}>
                    <rect x={1160 + i * 140} y={y} width={124} height={44} rx={22} fill={i === 3 ? "#5E2026" : "#8E2F33"} />
                    <rect x={1160 + i * 140} y={y} width={124} height={44} rx={22} fill={C.na} opacity={0.9 * on} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s30 · Where nutrients go ───────────────────────────── */
const c30 = makeCue("s30");
const S30T = {
  aa: c30("amino acids"),
  cap: c30("capillaries"),
  portal: c30("hepatic portal"),
  liver: c30("liver"),
  long: c30("long-chain"),
  lymph: c30("lymphatic route"),
  lacteal: c30("lacteal"),
  vessels: c30("lymphatic vessels"),
  duct: c30("thoracic"),
  subclavian: c30("subclavian"),
};
// Routes follow the lecture's figure and standard anatomy (anterior view: patient's right on screen left).
// Blood: villus venules → mesenteric veins → hepatic portal vein → liver (porta hepatis).
// Lymph: lacteal → lymphatic vessels → cisterna chyli → thoracic duct → left venous angle (left subclavian vein).
const VB30 = 860; // villus base
const ROAD_A = "M 506 860 C 600 930, 760 880, 880 800 C 980 744, 1096 748, 1166 716 C 1166 660, 1146 596, 1120 548";
const ROAD_B = "M 450 860 C 520 940, 760 930, 900 856 C 1040 790, 1176 750, 1250 676 C 1246 600, 1262 520, 1256 440 C 1250 360, 1262 300, 1290 268 C 1310 248, 1330 244, 1346 252";
const LA = getLength(ROAD_A), LB = getLength(ROAD_B);
const pa = (u: number) => getPointAtLength(ROAD_A, clamp(u) * LA) as { x: number; y: number };
const pb = (u: number) => getPointAtLength(ROAD_B, clamp(u) * LB) as { x: number; y: number };
const TORSO =
  "M1220 112 L1218 162 C1150 172 1062 188 1012 218 C982 238 976 300 990 380 C1000 480 1012 640 1030 910 L1478 910 C1496 640 1508 480 1518 380 C1532 300 1528 240 1498 218 C1450 188 1360 172 1302 162 L1300 112 Z";
const LIVER =
  "M992 430C1004 398 1066 386 1134 390C1204 394 1262 402 1322 418C1352 426 1358 444 1332 452C1282 468 1222 488 1172 512C1122 536 1062 560 1020 552C990 544 978 500 984 466C986 452 986 440 992 430Z";
const HEART = "M1262 304C1240 300 1226 322 1236 346C1248 374 1290 392 1312 380C1338 366 1346 330 1330 312C1316 296 1290 302 1278 314C1274 306 1270 304 1262 304Z";
const LOOPS =
  "M1090 700C1120 660 1180 664 1200 700C1220 736 1280 740 1300 700C1320 660 1380 664 1396 704C1410 744 1380 780 1340 776C1300 772 1270 800 1290 836C1300 860 1250 880 1210 860C1170 840 1130 868 1100 840C1070 812 1076 760 1110 750C1140 742 1150 720 1120 712";

export const S30: React.FC = () => {
  const t = useT();
  const T = S30T;
  const drawA = prog(t, T.portal - 0.4, 1.0, E.inOut);
  const drawB = prog(t, T.lacteal - 0.2, 2.6, E.inOut);
  const torso = prog(t, 0.4, 0.8);
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · destinations" title="Where does it all go?" color={C.teal} t={t} />
      <Svg>
        {/* body context: torso, small-intestine loops, heart and great veins (anterior view) */}
        <g opacity={torso}>
          <path d={TORSO} fill="#3A1A20" opacity={0.6} stroke="#6E3A40" strokeWidth={2} />
          <path d={LOOPS} fill="none" stroke="#E48C7E" strokeWidth={22} strokeLinecap="round" opacity={0.28} />
          <path d={LOOPS} fill="none" stroke="#F8C3B6" strokeWidth={6} strokeLinecap="round" opacity={0.18} transform="translate(-3 -5)" />
          <path d={HEART} fill="#B4474B" stroke="#6E2429" strokeWidth={2} opacity={0.85} />
          {/* SVC / brachiocephalic vein / internal jugular (blue) */}
          <path d="M1346 252 C1320 272 1300 288 1288 306" stroke="#26386E" strokeWidth={13} fill="none" strokeLinecap="round" />
          <path d="M1346 252 C1320 272 1300 288 1288 306" stroke={C.bloodBlue} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M1346 252 C1344 220 1340 190 1336 160" stroke="#26386E" strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d="M1346 252 C1344 220 1340 190 1336 160" stroke={C.bloodBlue} strokeWidth={7} fill="none" strokeLinecap="round" />
          <text x={1276} y={420} textAnchor="middle" fontFamily={F.body} fontSize={24} fill={C.ink2} opacity={0.9}>heart</text>
        </g>
        {/* detailed villus (art/histo.mjs) */}
        <g opacity={prog(t, 0.3, 0.5)}>
          <Raw svg={villusArt({ cx: 450, base: VB30, h: 600, w: 230, seed: 13, id: "s30v" })} />
          <text x={250} y={590} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink2}>villus</text>
          <text x={250} y={622} textAnchor="middle" fontFamily={F.body} fontSize={24} fill={C.ink3}>(enlarged)</text>
        </g>
        {/* road A: blood → hepatic portal vein → liver */}
        <path d={ROAD_A} stroke="#26386E" strokeWidth={17} fill="none" strokeLinecap="round" strokeDasharray={`${LA * drawA} ${LA}`} />
        <path d={ROAD_A} stroke={C.bloodBlue} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${LA * drawA} ${LA}`} />
        {drawA > 0.9 &&
          Array.from({ length: 6 }, (_, k) => {
            const u = ((t - T.portal) * 0.3 + k / 6) % 1;
            const p = pa(u);
            return k % 3 === 0 ? <Hex key={k} x={p.x} y={p.y} r={11} /> : k % 3 === 1 ? <Bead key={k} x={p.x} y={p.y} r={10} /> : <circle key={k} cx={p.x} cy={p.y} r={7} fill={C.gold} />;
          })}
        {/* road B: lacteal → lymphatics → cisterna chyli → thoracic duct → left subclavian vein */}
        <path d={ROAD_B} stroke="#2E7A45" strokeWidth={18} fill="none" strokeLinecap="round" strokeDasharray={`${LB * drawB} ${LB}`} />
        <path d={ROAD_B} stroke={C.lymph} strokeWidth={12} fill="none" strokeLinecap="round" strokeDasharray={`${LB * drawB} ${LB}`} />
        <ellipse cx={1250} cy={684} rx={16} ry={26} fill={C.lymph} stroke="#2E7A45" strokeWidth={3} opacity={prog(t, T.duct - 0.6, 0.4)} />
        <g opacity={prog(t, T.subclavian - 0.3, 0.5)}>
          <path d="M1346 252 C1400 246 1460 238 1530 236" stroke="#26386E" strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d="M1346 252 C1400 246 1460 238 1530 236" stroke={C.bloodBlue} strokeWidth={16} fill="none" strokeLinecap="round" />
          <text x={1540} y={212} textAnchor="end" fontFamily={F.body} fontWeight={600} fontSize={28} fill={C.bloodBlue} stroke="#0B0608" strokeWidth={5} paintOrder="stroke">left subclavian vein</text>
        </g>
        {drawB > 0.95 &&
          Array.from({ length: 5 }, (_, k) => {
            const u = ((t - T.lacteal - 2.6) * 0.2 + k / 5) % 1;
            const p = pb(u);
            return (
              <g key={k}>
                <circle cx={p.x} cy={p.y} r={12} fill={C.gold} stroke="#9C7448" strokeWidth={1} />
                <circle cx={p.x + 3.5} cy={p.y - 2.5} r={3} fill={C.teal} />
              </g>
            );
          })}
        {/* liver with portal vein entering the porta hepatis */}
        <g opacity={prog(t, T.liver - 0.6, 0.5)}>
          <defs>
            <radialGradient id="s30-liver" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#C46A5A" />
              <stop offset="0.6" stopColor="#8A3A2E" />
              <stop offset="1" stopColor="#5E2420" />
            </radialGradient>
          </defs>
          <path d={LIVER} fill="url(#s30-liver)" stroke="#3E1614" strokeWidth={2.5} />
          <path d="M1182 394 C1172 440 1160 486 1150 522" stroke="#E6B8A8" strokeWidth={2} fill="none" opacity={0.6} />
          <path d="M1066 548 C1060 566 1074 580 1090 574 C1102 568 1100 552 1090 544" fill="#6E9A4A" stroke="#3E5A2A" strokeWidth={1.6} />
          <path d="M1120 548 C1100 520 1070 500 1040 492 M1120 548 C1140 516 1180 494 1230 480 M1120 548 C1110 510 1112 470 1120 440" stroke="#5B7BE0" strokeWidth={3} fill="none" opacity={0.55} />
          <text x={1060} y={474} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={30} fill={C.ink} stroke="#0B0608" strokeWidth={5} paintOrder="stroke">liver</text>
        </g>
        {/* entering the villus: monosaccharides and amino acids into capillaries, chylomicrons into the lacteal */}
        {Array.from({ length: 4 }, (_, k) => {
          const f = ((t - T.aa) * 0.4 + k / 4) % 1;
          const o = prog(t, T.aa, 0.4);
          return k % 2 === 0 ? <Hex key={k} x={392} y={lerp(300, 620, f)} r={10} o={o * (1 - f)} /> : <Bead key={k} x={508} y={lerp(300, 620, f)} r={9} o={o * (1 - f)} />;
        })}
        {Array.from({ length: 3 }, (_, k) => {
          const f = ((t - T.long) * 0.35 + k / 3) % 1;
          return <circle key={`c${k}`} cx={450} cy={lerp(400, 820, f)} r={11} fill={C.gold} stroke="#9C7448" strokeWidth={1} opacity={prog(t, T.long, 0.4) * (1 - f)} />;
        })}
        <SLabel t={t} t0={T.portal} x={1150} y={606} size={28} weight={600} color="#9DB2F2" anchor="end">hepatic portal vein</SLabel>
        <SLabel t={t} t0={T.vessels} x={640} y={830} size={28} weight={600} color={C.lymph}>lymphatic vessels</SLabel>
        <SLabel t={t} t0={T.duct} x={1276} y={540} size={28} weight={600} color={C.lymph} anchor="start">thoracic duct</SLabel>
      </Svg>
      <Text t={t} t0={T.aa - 0.1} x={620} y={300} w={330} size={29} color={C.ink}>
        <b style={{ color: "#9DB2F2" }}>to blood:</b> amino acids, monosaccharides, short-chain fatty acids
      </Text>
      <Text t={t} t0={T.long - 0.1} x={620} y={500} w={330} size={29} color={C.ink}>
        <b style={{ color: C.lymph }}>to lymph:</b> long-chain fatty acids, as chylomicrons
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s31 · Absorption sites ───────────────────────────── */
const c31 = makeCue("s31");
const S31T = { min: c31("minerals"), carb: c31("carbohydrates"), lip: c31("lipids"), b12: c31("B12") };

export const S31: React.FC = () => {
  const t = useT();
  const T = S31T;
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · summary" title="Absorption sites along the tube" color={C.teal} t={t} />
      <Svg>
        <StraightGut t={t} cy={770} />
        <Band t={t} t0={T.min} m0={0} m1={1.4} y={370} color={C.coral} label="most minerals: iron, calcium, magnesium" />
        <Band t={t} t0={T.carb} m0={0.5} m1={4.6} y={480} color={C.violet} label="carbohydrates, amino acids, water-soluble vitamins" />
        <Band t={t} t0={T.lip} m0={0.5} m1={3} y={590} color={C.gold} label="lipids, fat-soluble vitamins" />
        <Band t={t} t0={T.b12} m0={5.9} m1={6.5} y={590} color={C.blood} label="vitamin B12 (terminal ileum)" anchor="end" />
      </Svg>
    </AbsoluteFill>
  );
};

void Enzyme;
