import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../lib/theme";
import { Chip, E, Header, SLabel, Text, clamp, fadeOut, lerp, prog, useT } from "../lib/anim";
import { makeCue } from "../lib/timing";
import { Bead, Drop, Enzyme, FattyAcid, Hex, Ion, Pent, Transporter, Triglyceride } from "../lib/shapes";
import { AP, BL, CAP, CY0, CY1, CellStage, MemLabel, Stream } from "../lib/cell";
import { Svg } from "./motility1";

/* ───────────────────────────── s21 · End products ───────────────────────────── */
const c21 = makeCue("s21");
const ROWS21 = [
  { w: "carbohydrates", from: "Carbohydrates", to: "monosaccharides", color: C.violet },
  { w: "proteins", from: "Proteins", to: "amino acids + small peptides", color: C.teal },
  { w: "fats", from: "Fats", to: "fatty acids + monoglycerides", color: C.gold },
  { w: "vitamins", from: "Vitamins, minerals, water", to: "absorbed as they are: no digestion", color: C.water },
].map((r) => ({ ...r, t0: c21(r.w) }));

export const S21: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · what arrives" title="The end products of digestion" color={C.teal} t={t} />
      <Svg>
        {ROWS21.map((r, i) => {
          const y = 360 + i * 140;
          const p = prog(t, r.t0 - 0.2, 0.4);
          const m = prog(t, r.t0 + 0.3, 0.9, E.inOut);
          return (
            <g key={i} opacity={p}>
              <text x={192} y={y + 10} fontFamily={F.disp} fontSize={40} fill={C.ink} style={{ fontVariationSettings: '"opsz" 144' }}>{r.from}</text>
              <line x1={840} y1={y} x2={840 + 220 * m} y2={y} stroke={C.ink3} strokeWidth={3} />
              <path d={`M ${840 + 220 * m} ${y} l -14 -9 l 0 18 Z`} fill={C.ink3} opacity={m} />
              {i === 0 &&
                [0, 1, 2, 3].map((k) => {
                  const x = lerp(640 + k * 40, 1110 + k * 56, m);
                  return k === 3 ? <Pent key={k} x={x} y={y} /> : <Hex key={k} x={x} y={y} fill={k === 2 ? C.galac : C.violet} />;
                })}
              {i === 0 && m < 0.3 && <line x1={640} y1={y} x2={760} y2={y} stroke={C.violet} strokeWidth={5} opacity={1 - m * 3} />}
              {i === 1 &&
                [0, 1, 2, 3, 4].map((k) => {
                  const x = lerp(620 + k * 34, 1100 + k * 46 + (k > 2 ? 26 : 0), m);
                  return <Bead key={k} x={x} y={y} />;
                })}
              {i === 1 && <line x1={lerp(620, 1100 + 3 * 46 + 26, m)} y1={y} x2={lerp(620 + 4 * 34, 1100 + 4 * 46 + 26, m)} y2={y} stroke={C.teal} strokeWidth={5} />}
              {i === 2 && (
                <>
                  <Triglyceride x={lerp(660, 1120, m)} y={y} tails={[m < 0.5, true, m < 0.5]} s={0.9} />
                  {m >= 0.5 && <FattyAcid x={1240} y={y - 16} s={0.9} />}
                  {m >= 0.5 && <FattyAcid x={1240} y={y + 16} s={0.9} />}
                </>
              )}
              {i === 3 && (
                <>
                  <Drop x={lerp(660, 1120, m)} y={y} />
                  <Ion x={lerp(700, 1170, m)} y={y} label="Ca" fill={C.ca} r={15} />
                  <text x={lerp(740, 1210, m)} y={y + 10} fontFamily={F.mono} fontSize={28} fill={C.gold}>B12</text>
                </>
              )}
              <text x={1440} y={y + 10} fontFamily={F.body} fontWeight={600} fontSize={30} fill={r.color} opacity={m}>{r.to}</text>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s22 · Carbohydrate absorption ───────────────────────────── */
const c22 = makeCue("s22");
const S22T = {
  mono: c22("monosaccharides"),
  sglt: c22("SGLT1"),
  sec: c22("secondary"),
  pump: c22("sodium-potassium"),
  fruct: c22("fructose"),
  glut5: c22("GLUT5"),
  glut2: c22("GLUT2"),
  pent: c22("pentoses"),
  lact: c22("lactase"),
  osm: c22("osmotic"),
  intol: c22("lactose intolerance"),
};
const Y_SG = 410, Y_G5 = 600, Y_PE = 780, Y_PU = 420, Y_G2 = 620;

export const S22: React.FC = () => {
  const t = useT();
  const T = S22T;
  const end = fadeOut(t, T.lact - 0.3, 0.4);
  const lac = prog(t, T.lact - 0.1, 0.5);
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · carbohydrates" title="Sugars cross the enterocyte" color={C.violet} t={t} />
      <Svg>
        <CellStage t={t} />
        <g opacity={end}>
          {/* SGLT1: Na+ with glucose/galactose */}
          <Transporter x={AP} y={Y_SG} color={C.violet} o={prog(t, T.sglt - 0.2, 0.4)} glow={prog(t, T.sec, 0.4)} />
          <Stream t={t} t0={T.sglt} route={[[300, Y_SG - 18], [AP, Y_SG - 18], [960, Y_SG + 40], [BL, Y_G2 - 10], [CAP, Y_G2 + 30]]} n={4} render={(x, y, k) => <Hex x={x} y={y} fill={k % 2 ? C.galac : C.violet} />} stopAt={undefined} />
          <Stream t={t} t0={T.sglt} route={[[300, Y_SG + 18], [AP, Y_SG + 18], [900, Y_SG + 60], [BL, Y_PU]]} n={4} render={(x, y) => <Ion x={x} y={y} label="Na⁺" fill={C.na} r={14} />} />
          {/* Na/K pump */}
          <g opacity={prog(t, T.pump - 0.2, 0.4)}>
            <Transporter x={BL} y={Y_PU} color="#8FA3B8" />
            <text x={BL} y={Y_PU + 8} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={18} fill={C.bg}>ATP</text>
          </g>
          <Stream t={t} t0={T.pump} route={[[BL - 10, Y_PU - 14], [BL + 140, Y_PU - 40]]} n={3} speed={0.6} render={(x, y) => <Ion x={x} y={y} label="Na⁺" fill={C.na} r={12} />} />
          <Stream t={t} t0={T.pump} route={[[BL + 140, Y_PU + 40], [BL - 60, Y_PU + 20]]} n={2} speed={0.6} render={(x, y) => <Ion x={x} y={y} label="K⁺" fill={C.k} r={12} />} />
          {/* GLUT5: fructose */}
          <Transporter x={AP} y={Y_G5} color={C.pink} o={prog(t, T.glut5 - 0.3, 0.4)} />
          <Stream t={t} t0={T.glut5} route={[[300, Y_G5], [AP, Y_G5], [960, Y_G5 + 10], [BL, Y_G2 + 10], [CAP, Y_G2 + 60]]} n={3} render={(x, y) => <Pent x={x} y={y} />} />
          {/* GLUT2 exit */}
          <Transporter x={BL} y={Y_G2} color={C.galac} o={prog(t, T.glut2 - 0.3, 0.4)} />
          {/* pentose: simple diffusion */}
          <g opacity={prog(t, T.pent - 0.2, 0.4)}>
            <line x1={AP - 70} y1={Y_PE} x2={AP + 90} y2={Y_PE} stroke={C.ink2} strokeWidth={3} strokeDasharray="8 8" />
          </g>
          <Stream t={t} t0={T.pent} route={[[400, Y_PE], [AP + 160, Y_PE]]} n={3} speed={0.4} render={(x, y) => <Pent x={x} y={y} fill="#C9B6FF" r={13} />} />
          <MemLabel t={t} t0={T.sglt} x={AP - 80} y={Y_SG - 70} title="SGLT1" sub="Na⁺ + glucose / galactose" color={C.violet} />
          <MemLabel t={t} t0={T.sec} x={AP - 80} y={Y_SG + 80} title="secondary active" sub="powered by the Na⁺ gradient" color={C.ink} />
          <MemLabel t={t} t0={T.glut5} x={AP - 80} y={Y_G5 + 70} title="GLUT5" sub="fructose · facilitated diffusion" color={C.pink} />
          <MemLabel t={t} t0={T.pent} x={AP - 80} y={Y_PE + 60} title="pentoses" sub="passive diffusion" color="#C9B6FF" />
          <MemLabel t={t} t0={T.pump} x={BL - 50} y={Y_PU - 60} title="Na⁺/K⁺-ATPase" sub="keeps cell Na⁺ low" color="#B9C7D6" />
          <MemLabel t={t} t0={T.glut2} x={BL - 50} y={Y_G2 + 80} title="GLUT2" sub="all three exit to blood" color={C.galac} />
        </g>
        {/* lactose intolerance inset */}
        <g opacity={lac}>
          {Array.from({ length: 6 }, (_, k) => {
            const x = 260 + (k % 3) * 120, y = 440 + Math.floor(k / 3) * 160 + Math.sin(t * 1.3 + k) * 8;
            return (
              <g key={k}>
                <Hex x={x} y={y} r={18} />
                <Hex x={x + 38} y={y} r={18} fill={C.galac} />
              </g>
            );
          })}
          <Stream t={t} t0={T.lact + 0.4} route={[[AP + 120, 700], [AP - 10, 700], [420, 760]]} n={5} speed={0.45} render={(x, y) => <Drop x={x} y={y} s={1.3} />} />
          <path d={`M ${AP - 22} 380 l 44 44 M ${AP + 22} 380 l -44 44`} stroke={C.blood} strokeWidth={6} />
        </g>
      </Svg>
      <div style={{ position: "absolute", left: 736, top: 356, width: 470, height: 300, borderRadius: 24, background: "rgba(11,6,8,0.82)", opacity: lac }} />
      <Text t={t} t0={T.lact - 0.1} x={760} y={380} w={440} size={30} weight={600} color={C.ink}>
        no lactase → lactose stays in the lumen and holds water
      </Text>
      <Chip t={t} t0={T.osm - 0.1} x={760} y={500} label="osmotic diarrhea" color={C.blood} size={30} filled />
      <Text t={t} t0={T.intol - 0.1} x={760} y={572} w={440} size={36} font={F.disp} color={C.ink}>
        = lactose intolerance
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s23 · Protein absorption ───────────────────────────── */
const c23 = makeCue("s23");
const S23T = {
  forms: c23("dipeptides"),
  laa: c23("L-amino"),
  daa: c23("D-amino"),
  h: c23("hydrogen"),
  cyto: c23("cytoplasmic"),
  fac: c23("facilitated"),
  cyst: c23("cystinuria"),
};
const Y_NA = 400, Y_D = 540, Y_H = 690, Y_BA = 560;

export const S23: React.FC = () => {
  const t = useT();
  const T = S23T;
  const cyst = prog(t, T.cyst - 0.1, 0.4);
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · proteins" title="Amino acids and small peptides" color={C.teal} t={t} />
      <Svg>
        <CellStage t={t} />
        {/* Na+-amino acid cotransporter */}
        <Transporter x={AP} y={Y_NA} color={C.teal} o={prog(t, T.laa - 0.2, 0.4)} />
        <Stream t={t} t0={T.laa} route={[[300, Y_NA - 18], [AP, Y_NA - 18], [960, Y_NA + 60], [BL, Y_BA - 10], [CAP, Y_BA + 30]]} n={4} render={(x, y) => <Bead x={x} y={y} />} stopAt={T.cyst} />
        <Stream t={t} t0={T.laa} route={[[300, Y_NA + 18], [AP, Y_NA + 18], [900, Y_NA + 40]]} n={4} render={(x, y) => <Ion x={x} y={y} label="Na⁺" fill={C.na} r={14} />} stopAt={T.cyst} />
        {/* D-amino acids: passive */}
        <g opacity={prog(t, T.daa - 0.2, 0.4)}>
          <line x1={AP - 70} y1={Y_D} x2={AP + 90} y2={Y_D} stroke={C.ink2} strokeWidth={3} strokeDasharray="8 8" />
        </g>
        <Stream t={t} t0={T.daa} route={[[380, Y_D], [AP + 200, Y_D]]} n={3} speed={0.35} render={(x, y) => <Bead x={x} y={y} fill="#9FE8DD" r={11} />} />
        {/* H+-coupled di/tripeptide carrier */}
        <Transporter x={AP} y={Y_H} color={C.ink} o={prog(t, T.h - 0.3, 0.4)} />
        <Stream
          t={t}
          t0={T.h}
          route={[[300, Y_H - 16], [AP, Y_H - 16], [930, Y_H - 10]]}
          n={3}
          render={(x, y, k) => (
            <g>
              <line x1={x - 14} y1={y} x2={x + 14 + (k % 2) * 28} y2={y} stroke={C.teal} strokeWidth={5} />
              <Bead x={x - 14} y={y} r={11} />
              <Bead x={x + 14} y={y} r={11} />
              {k % 2 === 1 && <Bead x={x + 42} y={y} r={11} />}
            </g>
          )}
        />
        <Stream t={t} t0={T.h} route={[[300, Y_H + 22], [AP, Y_H + 22], [880, Y_H + 40]]} n={3} render={(x, y) => <Ion x={x} y={y} label="H⁺" fill={C.h} r={12} />} />
        {/* cytoplasmic peptidase */}
        <g opacity={prog(t, T.cyto - 0.2, 0.4)}>
          <Enzyme x={980} y={Y_H - 10} rot={180} color={C.gold} r={24} open={0.4 + 0.4 * Math.abs(Math.sin(t * 5))} />
        </g>
        <Stream t={t} t0={T.cyto + 0.3} route={[[1010, Y_H - 10], [BL, Y_BA + 20], [CAP, Y_BA + 70]]} n={4} render={(x, y) => <Bead x={x} y={y} r={11} />} />
        {/* basolateral facilitated exit */}
        <Transporter x={BL} y={Y_BA} color="#9FE8DD" o={prog(t, T.fac - 0.3, 0.4)} />
        <MemLabel t={t} t0={T.laa} x={AP - 80} y={Y_NA - 70} title="Na⁺–amino acid" sub="L-amino acids · secondary active" color={C.teal} />
        <MemLabel t={t} t0={T.daa} x={AP - 80} y={Y_D + 60} title="D-amino acids" sub="passive diffusion" color="#9FE8DD" />
        <MemLabel t={t} t0={T.h} x={AP - 80} y={Y_H + 70} title="H⁺–peptide carrier" sub="di- & tripeptides" color={C.ink} />
        <MemLabel t={t} t0={T.cyto} x={1000} y={Y_H + 60} title="peptidases" sub="→ amino acids" color={C.gold} anchor="middle" />
        <MemLabel t={t} t0={T.fac} x={BL - 50} y={Y_BA - 80} title="facilitated" sub="amino acids exit" color="#9FE8DD" />
        {/* cystinuria */}
        <g opacity={cyst}>
          <path d={`M ${AP - 30} ${Y_NA - 30} l 60 60 M ${AP + 30} ${Y_NA - 30} l -60 60`} stroke={C.blood} strokeWidth={8} strokeLinecap="round" />
        </g>
      </Svg>
      <Text t={t} t0={T.forms - 0.2} x={192} y={232} w={1000} size={28} color={C.ink2} out={T.laa + 1}>
        absorbed as dipeptides, tripeptides and a few free amino acids
      </Text>
      <div style={{ position: "absolute", left: 760, top: 900 - 60, opacity: cyst, filter: cyst < 1 ? `blur(${(1 - cyst) * 6}px)` : undefined }}>
        <span style={{ fontFamily: F.body, fontSize: 30, fontWeight: 700, color: C.bg, background: C.blood, padding: "8px 20px", borderRadius: 999 }}>Cystinuria</span>
        <span style={{ fontFamily: F.body, fontSize: 28, color: C.ink, marginLeft: 16 }}>Na⁺–AA transporter missing in intestine + kidney</span>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s24 · Fat absorption ───────────────────────────── */
const c24 = makeCue("s24");
const S24T = {
  s1: c24("one"),
  s2: c24("two"),
  s3: c24("three"),
  s4: c24("four"),
  s5: c24("five"),
  plenty: c24("plenty"),
  without: c24("without"),
  apo: c24("Apo"),
  abeta: c24("abetalipoproteinemia"),
  defect: c24("defect"),
};
const STEPS24 = [
  { t: "FA + MG leave the micelle, diffuse in", c: C.gold },
  { t: "smooth ER rebuilds triglycerides", c: C.gold },
  { t: "Golgi adds proteins → chylomicrons", c: C.teal },
  { t: "exocytosis into the lacteal", c: C.lymph },
  { t: "lymph carries them away", c: C.lymph },
];
// vertical cell: lumen top, lacteal bottom
const VX0 = 940, VX1 = 1660, VT = 420, VB = 790;

export const S24: React.FC = () => {
  const t = useT();
  const T = S24T;
  const st = [T.s1, T.s2, T.s3, T.s4, T.s5];
  const p1 = prog(t, T.s1 + 0.2, 1.4, E.inOut);
  const p2 = prog(t, T.s2 + 0.1, 0.8, E.inOut);
  const p3 = prog(t, T.s3 + 0.1, 1.2, E.inOut);
  const p4 = prog(t, T.s4 + 0.1, 1.2, E.inOut);
  const p5 = prog(t, T.s5, 4, E.linear);
  const items = [0, 1, 2, 3];
  return (
    <AbsoluteFill>
      <Header kicker="Absorption · fats" title="Fat absorption in five steps" color={C.gold} t={t} />
      <Svg>
        {/* lumen + micelles */}
        <rect x={VX0 - 120} y={250} width={VX1 - VX0 + 240} height={120} rx={20} fill="rgba(167,227,255,0.05)" />
        {[1000, 1250, 1500].map((x, i) => (
          <g key={i} opacity={1 - 0.6 * p1}>
            {Array.from({ length: 14 }, (_, k) => {
              const a = (k / 14) * Math.PI * 2;
              return <circle key={k} cx={x + Math.cos(a) * 34} cy={310 + Math.sin(a) * 34} r={6} fill={C.bile} />;
            })}
          </g>
        ))}
        {/* brush border + cell */}
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={VX0 + 6 + i * 24} y={VT - 50} width={12} height={56} rx={6} fill="#F6B8AA" />
        ))}
        <rect x={VX0} y={VT} width={VX1 - VX0} height={VB - VT} rx={30} fill="url(#cellFill)" />
        {/* smooth ER */}
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${VX0 + 90} ${505 + k * 18} C ${VX0 + 200} ${485 + k * 18}, ${VX0 + 300} ${525 + k * 18}, ${VX0 + 420} ${505 + k * 18} S ${VX0 + 600} ${485 + k * 18}, ${VX0 + 640} ${505 + k * 18}`} stroke="#7B5BD6" strokeWidth={7} fill="none" opacity={0.75} />
        ))}
        {/* Golgi */}
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M ${VX0 + 220 - k * 8} ${650 + k * 16} Q ${VX0 + 360} ${600 + k * 16}, ${VX0 + 500 + k * 8} ${650 + k * 16}`} stroke="#4BAF7A" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
        ))}
        <text x={VX1 - 20} y={470} textAnchor="end" fontFamily={F.body} fontSize={26} fill="#E9E0FF" opacity={prog(t, T.s2, 0.4)}>smooth ER</text>
        <text x={VX1 - 20} y={700} textAnchor="end" fontFamily={F.body} fontSize={26} fill="#CFF5DD" opacity={prog(t, T.s3, 0.4)}>Golgi</text>
        {/* lacteal */}
        <rect x={820} y={830} width={908} height={70} rx={35} fill={C.lymph} opacity={0.25} />
        <rect x={820} y={830} width={908} height={70} rx={35} fill="none" stroke={C.lymph} strokeWidth={4} />
        <text x={1060} y={815} fontFamily={F.body} fontWeight={600} fontSize={26} fill={C.lymph}>lacteal (lymph capillary)</text>
        {/* moving cargo through the steps */}
        {items.map((k) => {
          const x0 = 1000 + k * 170;
          // step 1: FA/MG from micelle into the cell
          let x = x0, y = lerp(320, 470, p1);
          let shape: "fa" | "tg" | "chylo" = "fa";
          if (p2 > 0) {
            y = lerp(470, 505, p2);
            shape = p2 > 0.5 ? "tg" : "fa";
          }
          if (p3 > 0) {
            x = lerp(x0, VX0 + 280 + k * 50, p3);
            y = lerp(505, 640, p3);
            if (p3 > 0.6) shape = "chylo";
          }
          if (p4 > 0) {
            x = lerp(VX0 + 280 + k * 50, 1000 + k * 120, p4);
            y = lerp(640, 865, p4);
          }
          if (p5 > 0) {
            x = x + ((p5 * 900 + k * 30) % 900) * (p5 > 0 ? 1 : 0);
          }
          const o = prog(t, T.s1, 0.3) * (x > 1720 ? 0 : 1);
          if (shape === "fa") return <FattyAcid key={k} x={x - 25} y={y} o={o} s={1.1} />;
          if (shape === "tg") return <Triglyceride key={k} x={x} y={y} o={o} s={0.7} />;
          return (
            <g key={k} opacity={o}>
              <circle cx={x} cy={y} r={20} fill={C.gold} />
              {[0, 1, 2, 3].map((j) => (
                <circle key={j} cx={x + Math.cos(j * 1.6) * 12} cy={y + Math.sin(j * 1.6) * 12} r={4} fill={C.teal} />
              ))}
            </g>
          );
        })}
        {/* step badges on the diagram */}
        {[
          [VX0 - 40, 440],
          [VX0 - 40, 510],
          [VX0 - 40, 650],
          [VX0 - 40, 790],
          [1700, 865],
        ].map(([x, y], i) => (
          <g key={i} opacity={prog(t, st[i] - 0.1, 0.3)}>
            <circle cx={x} cy={y} r={22} fill={STEPS24[i].c} />
            <text x={x} y={y + 9} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={26} fill={C.bg}>{i + 1}</text>
          </g>
        ))}
      </Svg>
      {STEPS24.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: 192, top: 288 + i * 64, width: 600, display: "flex", gap: 18, alignItems: "baseline", opacity: prog(t, st[i] - 0.1, 0.3) * (1 - 0.45 * prog(t, (st[i + 1] ?? 99) - 0.1, 0.3)) }}>
          <span style={{ fontFamily: F.disp, fontSize: 40, color: s.c, width: 30 }}>{i + 1}</span>
          <span style={{ fontFamily: F.body, fontSize: 28, fontWeight: 500, color: C.ink, lineHeight: 1.2 }}>{s.t}</span>
        </div>
      ))}
      {/* 97% vs 40-50% */}
      <div style={{ position: "absolute", left: 192, top: 650, width: 560, opacity: prog(t, T.plenty - 0.1, 0.3) }}>
        {[
          { l: "with micelles", v: 0.97, txt: "97%", c: C.gold, t0: T.plenty },
          { l: "without", v: 0.45, txt: "40–50%", c: C.ink3, t0: T.without },
        ].map((b, i) => (
          <div key={i} style={{ marginBottom: 14, opacity: prog(t, b.t0 - 0.1, 0.3) }}>
            <div style={{ fontFamily: F.body, fontSize: 28, color: C.ink2, marginBottom: 6 }}>
              {b.l} <span style={{ fontFamily: F.mono, color: b.c, marginLeft: 8 }}>{b.txt}</span>
            </div>
            <div style={{ height: 14, borderRadius: 7, background: "rgba(247,239,233,0.1)" }}>
              <div style={{ width: `${b.v * 100 * prog(t, b.t0, 0.9)}%`, height: 14, borderRadius: 7, background: b.c }} />
            </div>
          </div>
        ))}
      </div>
      <Chip t={t} t0={T.apo - 0.1} x={192} y={834} label="no Apo B → abetalipoproteinemia" color={C.blood} size={28} out={T.defect - 0.2} />
      <Chip t={t} t0={T.defect - 0.1} x={192} y={834} label="a defect at any step → steatorrhea" color={C.blood} size={28} filled />
    </AbsoluteFill>
  );
};

void SLabel;
void clamp;
