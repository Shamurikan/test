import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../lib/theme";
import { Chip, E, Header, Leader, SLabel, Text, clamp, fadeOut, lerp, prog, rng, useT } from "../lib/anim";
import { makeCue } from "../lib/timing";
import { Bead, Drop, Enzyme, FattyAcid, Hex, Ion, Pent, Triglyceride } from "../lib/shapes";
import { Svg } from "./motility1";

/* ───────────────────────── shared: a mucosal surface with villi and crypts ───────────────────────── */
type VC = { x: number; kind: "v" | "c" };
const surfacePath = (x0: number, x1: number, base: number, items: VC[], vh: number, cd: number, vw = 110, cw = 64) => {
  let d = `M ${x0} ${base}`;
  for (const it of items) {
    if (it.kind === "v") {
      const r = vw / 2;
      d += ` L ${it.x - r} ${base} L ${it.x - r} ${base - vh + r} A ${r} ${r} 0 0 1 ${it.x + r} ${base - vh + r} L ${it.x + r} ${base}`;
    } else {
      const r = cw / 2;
      d += ` L ${it.x - r} ${base} L ${it.x - r} ${base + cd - r} A ${r} ${r} 0 0 0 ${it.x + r} ${base + cd - r} L ${it.x + r} ${base}`;
    }
  }
  return d + ` L ${x1} ${base}`;
};

/* ───────────────────────────── s12 · Crypts of Lieberkühn ───────────────────────────── */
const c12 = makeCue("s12");
const S12T = {
  crypts: c12("crypts"),
  two: c12("two cell"),
  goblet: c12("goblet"),
  entero: c12("enterocytes secrete"),
  ml: c12("eighteen hundred"),
  ph: c12("pH"),
  neut: c12("neutralize"),
  up: c12("up on"),
  reabs: c12("reabsorbing"),
  products: c12("end products"),
};
const ITEMS12: VC[] = [
  { x: 840, kind: "v" },
  { x: 965, kind: "c" },
  { x: 1090, kind: "v" },
  { x: 1215, kind: "c" },
  { x: 1340, kind: "v" },
  { x: 1465, kind: "c" },
  { x: 1590, kind: "v" },
];
const B12 = 600, VH12 = 300, CD12 = 230;
const SURF12 = surfacePath(740, 1728, B12, ITEMS12, VH12, CD12);
const CRYPTS = ITEMS12.filter((i) => i.kind === "c").map((i) => i.x);
const VILLI12 = ITEMS12.filter((i) => i.kind === "v").map((i) => i.x);
const r12 = rng(12);
const ACID = Array.from({ length: 22 }, () => ({ x: 780 + r12() * 900, y: 200 + r12() * 80, d: r12() }));

export const S12: React.FC = () => {
  const t = useT();
  const T = S12T;
  const sec = prog(t, T.entero, 0.6);
  const mucus = prog(t, T.goblet, 0.6);
  const abs = prog(t, T.up - 0.2, 0.6);
  const ml = Math.round(1800 * prog(t, T.ml - 0.1, 1.2, E.out));
  return (
    <AbsoluteFill>
      <Header kicker="Secretion · intestinal juice" title="Crypts of Lieberkühn" color={C.gold} t={t} />
      <Svg>
        {/* lamina propria under the surface */}
        <path d={`${SURF12} L 1728 900 L 740 900 Z`} fill="#6E2429" />
        <path d={SURF12} fill="none" stroke="#F0A296" strokeWidth={26} strokeLinejoin="round" strokeDasharray="20 3" />
        <path d={SURF12} fill="none" stroke="#FFD3C8" strokeWidth={3} strokeOpacity={0.6} transform="translate(0 -13)" />
        {/* goblet cells in crypt walls */}
        {CRYPTS.flatMap((x, k) =>
          [0, 1].map((side) => (
            <ellipse key={`${k}${side}`} cx={x + (side ? 32 : -32)} cy={B12 + 90 + side * 60} rx={11} ry={20} fill="#FFF3EC" opacity={0.55 + 0.45 * prog(t, T.goblet - 0.2, 0.4)} />
          )),
        )}
        {/* mucus rising */}
        {mucus > 0 &&
          CRYPTS.flatMap((x, k) =>
            Array.from({ length: 4 }, (_, i) => {
              const f = ((t - T.goblet) * 0.25 + i / 4 + k * 0.13) % 1;
              return <circle key={`m${k}${i}`} cx={x - 14 + (i % 2) * 28} cy={lerp(B12 + 150, B12 - 40, f)} r={7} fill="#FFF3EC" opacity={mucus * (1 - f) * 0.8} />;
            }),
          )}
        {/* water + electrolytes secreted from crypts */}
        {sec > 0 &&
          CRYPTS.flatMap((x, k) =>
            Array.from({ length: 6 }, (_, i) => {
              const f = ((t - T.entero) * 0.32 + i / 6 + k * 0.21) % 1;
              const y = lerp(B12 + CD12 - 30, B12 - 140, f);
              const xx = x + Math.sin(f * 6 + i) * 10;
              return i % 3 === 0 ? (
                <Ion key={`s${k}${i}`} x={xx} y={y} label="Na⁺" fill={C.na} r={13} o={sec * (1 - f)} />
              ) : i % 3 === 1 ? (
                <Ion key={`s${k}${i}`} x={xx} y={y} label="Cl⁻" fill={C.cl} r={13} o={sec * (1 - f)} />
              ) : (
                <Drop key={`s${k}${i}`} x={xx} y={y} o={sec * (1 - f)} />
              );
            }),
          )}
        {/* secretion arrows out of crypts */}
        {CRYPTS.map((x, k) => (
          <g key={k} opacity={sec}>
            <path d={`M ${x} ${B12 + 40} L ${x} ${B12 - 70}`} stroke={C.water} strokeWidth={5} strokeLinecap="round" />
            <path d={`M ${x} ${B12 - 84} l -11 16 l 22 0 Z`} fill={C.water} />
          </g>
        ))}
        {/* acid from the stomach being neutralised */}
        {ACID.map((a, i) => {
          const o = prog(t, T.ph - 0.5, 0.5) * (1 - prog(t, T.neut + a.d * 1.2, 0.6));
          return <Ion key={i} x={a.x} y={a.y + Math.sin(t + i) * 6} label="H⁺" fill="#FF5E5E" r={13} o={o} />;
        })}
        {/* absorption arrows into villus tips */}
        {VILLI12.map((x, k) => (
          <g key={k} opacity={abs}>
            <path d={`M ${x} ${B12 - VH12 - 60} L ${x} ${B12 - VH12 - 6}`} stroke={C.teal} strokeWidth={5} strokeLinecap="round" />
            <path d={`M ${x} ${B12 - VH12 + 8} l -11 -16 l 22 0 Z`} fill={C.teal} />
          </g>
        ))}
        {prog(t, T.products - 0.3, 0.4) > 0 &&
          VILLI12.flatMap((x, k) =>
            [0, 1, 2].map((i) => {
              const f = ((t - T.products) * 0.45 + i / 3 + k * 0.2) % 1;
              const y = lerp(B12 - VH12 - 130, B12 - VH12 + 30, f);
              const o = prog(t, T.products - 0.3, 0.4) * (1 - f);
              return i === 0 ? <Hex key={`p${k}${i}`} x={x + 26} y={y} r={10} o={o} /> : i === 1 ? <Bead key={`p${k}${i}`} x={x - 24} y={y} r={9} o={o} /> : <circle key={`p${k}${i}`} cx={x} cy={y - 20} r={8} fill={C.gold} opacity={o} />;
            }),
          )}
        <circle cx={1215} cy={B12 + CD12 - 40} r={46} fill="none" stroke={C.gold} strokeWidth={4} opacity={prog(t, T.crypts, 0.4) * fadeOut(t, T.goblet, 0.4)} />
      </Svg>
      <Text t={t} t0={T.crypts} x={192} y={300} w={520} size={30} weight={600} color={C.gold} out={T.goblet - 0.3}>
        crypts: small pits between the villi
      </Text>
      <Text t={t} t0={T.goblet - 0.1} x={192} y={300} w={520} size={32} weight={600} color="#FFF3EC">
        Goblet cells → mucus
      </Text>
      <Text t={t} t0={T.entero - 0.1} x={192} y={350} w={520} size={32} weight={600} color={C.water}>
        Enterocytes → water + electrolytes
      </Text>
      <div style={{ position: "absolute", left: 192, top: 430, opacity: prog(t, T.ml - 0.1, 0.3) }}>
        <div style={{ fontFamily: F.disp, fontSize: 92, color: C.ink, lineHeight: 1 }}>
          {ml.toLocaleString("en-US")}
          <span style={{ fontSize: 40, color: C.water, marginLeft: 10 }}>mL / day</span>
        </div>
      </div>
      <Chip t={t} t0={T.ph - 0.1} x={192} y={560} label="pH 7.5 – 8" color={C.water} size={32} />
      <Text t={t} t0={T.neut} x={192} y={630} w={520} size={30} color={C.ink2}>
        neutralizes acid chyme from the stomach
      </Text>
      <Text t={t} t0={T.up - 0.1} x={192} y={720} w={540} size={32} weight={600} color={C.teal}>
        Villi do the reverse: they reabsorb water, electrolytes &amp; end products
      </Text>
      <Text t={t} t0={T.entero} x={1100} y={190} w={600} size={28} color={C.ink2} out={T.up - 0.3}>
        crypts <b style={{ color: C.water }}>secrete</b> ↑
      </Text>
      <Text t={t} t0={T.up} x={1100} y={190} w={600} size={28} color={C.ink2}>
        crypts <b style={{ color: C.water }}>secrete</b> ↑ · villi <b style={{ color: C.teal }}>absorb</b> ↓
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s13 · Control of secretion & Brunner's glands ───────────────────────────── */
const c13 = makeCue("s13");
const UP13 = [
  { w: "distension", l: "Distension" },
  { w: "touch", l: "Touch" },
  { w: "vagal", l: "Vagus" },
  { w: "gastrin", l: "Gastrin" },
  { w: "secretin", l: "Secretin" },
  { w: "CCK", l: "CCK" },
  { w: "glucagon", l: "Glucagon" },
  { w: "enterocrinin", l: "Enterocrinin" },
].map((x) => ({ ...x, t0: c13(x.w) }));
const S13T = {
  symp: c13("sympathetic"),
  brunner0: c13("in the first"),
  brunner: c13("brunner's"),
  alk: c13("alkaline"),
  bicarb: c13("bicarbonate"),
  protects: c13("protects"),
  irrit: c13("irritation"),
  vagal2: c13("vagal", 2),
  secretin2: c13("secretin", 2),
  inhib: c13("inhibited"),
};
const r13 = rng(13);
const H13 = Array.from({ length: 18 }, () => ({ x: 900 + r13() * 760, y: 330 + r13() * 70, d: r13() }));
const GLANDS = [960, 1150, 1340, 1530];

export const S13: React.FC = () => {
  const t = useT();
  const T = S13T;
  const phA = fadeOut(t, T.brunner0 - 0.2, 0.4);
  const phB = prog(t, T.brunner0, 0.5);
  const flow = prog(t, T.alk - 0.2, 0.8);
  return (
    <AbsoluteFill>
      <Header kicker="Secretion · control" title={t < T.brunner0 ? "What turns secretion up" : "Brunner's glands"} color={C.gold} t={t} />
      <div style={{ opacity: phA }}>
        <Text t={t} t0={0.3} x={192} y={290} size={30} weight={700} color={C.lymph} style={{ letterSpacing: "0.14em" }}>
          ↑ INTESTINAL JUICE
        </Text>
        {UP13.map((u, i) => (
          <Chip key={i} t={t} t0={u.t0 - 0.1} x={192 + (i % 2) * 330} y={350 + Math.floor(i / 2) * 76} label={u.l} color={i < 3 ? C.nerve : C.lymph} size={30} />
        ))}
        <Text t={t} t0={0.3} x={1100} y={290} size={30} weight={700} color={C.blood} style={{ letterSpacing: "0.14em" }}>
          ↓ INHIBITS
        </Text>
        <Chip t={t} t0={T.symp - 0.1} x={1100} y={350} label="Sympathetic stimulation" color={C.blood} size={30} />
        <Text t={t} t0={0.5} x={192} y={680} w={820} size={26} color={C.ink3}>
          yellow = neural / mechanical · green = hormonal
        </Text>
      </div>
      <div style={{ opacity: phB }}>
        <Svg>
          {/* lumen with acid */}
          <rect x={860} y={300} width={868} height={130} rx={0} fill="rgba(255,94,94,0.06)" />
          {H13.map((h, i) => (
            <Ion key={i} x={h.x} y={h.y + Math.sin(t * 1.2 + i) * 6} label="H⁺" fill="#FF5E5E" r={14} o={phB * (1 - prog(t, T.protects + h.d * 1.5, 0.6))} />
          ))}
          {/* mucus blanket */}
          <rect x={860} y={420 - 34 * flow} width={868} height={34 * flow + 4} fill="#CFEFFF" opacity={0.35} />
          {/* mucosa with short villi */}
          <path
            d={surfacePath(860, 1728, 470, [920, 1040, 1160, 1280, 1400, 1520, 1640].map((x) => ({ x, kind: "v" as const })), 40, 0, 70)}
            fill="none"
            stroke="#F0A296"
            strokeWidth={18}
          />
          <rect x={860} y={478} width={868} height={110} fill="#8E2F33" />
          <text x={872} y={540} fontFamily={F.body} fontSize={24} fill={C.ink2}>mucosa</text>
          {/* submucosa with Brunner's glands */}
          <rect x={860} y={588} width={868} height={230} fill="#5A2128" />
          <text x={872} y={806} fontFamily={F.body} fontSize={24} fill={C.ink2}>submucosa</text>
          {GLANDS.map((x, k) => (
            <g key={k} opacity={prog(t, T.brunner - 0.2 + k * 0.1, 0.5)}>
              <path d={`M ${x} 700 C ${x - 30} 640, ${x + 30} 560, ${x} 470`} stroke="#CFEFFF" strokeWidth={8} fill="none" opacity={0.8} />
              {[0, 1, 2, 3, 4].map((j) => (
                <circle key={j} cx={x - 44 + j * 22} cy={720 + (j % 2) * 26} r={20} fill="#BFE6FA" stroke="#7FC7EA" strokeWidth={3} />
              ))}
            </g>
          ))}
          {/* bicarbonate rising */}
          {flow > 0 &&
            GLANDS.flatMap((x, k) =>
              Array.from({ length: 4 }, (_, i) => {
                const f = ((t - T.alk) * 0.4 + i / 4 + k * 0.17) % 1;
                return <Ion key={`b${k}${i}`} x={x + Math.sin(f * 5) * 14} y={lerp(700, 380, f)} label="HCO₃⁻" fill={C.hco3} r={18} o={prog(t, T.bicarb - 0.2, 0.5) * (1 - f * 0.7)} />;
              }),
            )}
          <SLabel t={t} t0={T.brunner} x={1728} y={872} size={28} weight={600} color="#BFE6FA" anchor="end">
            Brunner&apos;s glands · first few cm of the duodenum
          </SLabel>
        </Svg>
        <Text t={t} t0={T.alk - 0.1} x={192} y={300} w={600} size={32} weight={600} color="#CFEFFF">
          alkaline mucus, rich in <span style={{ color: C.hco3 }}>bicarbonate</span>
        </Text>
        <Text t={t} t0={T.protects - 0.1} x={192} y={350} w={600} size={30} color={C.ink2}>
          protects the duodenal wall from acid
        </Text>
        <Text t={t} t0={T.irrit - 0.3} x={192} y={440} size={28} weight={700} color={C.lymph} style={{ letterSpacing: "0.12em" }}>
          STIMULATED BY
        </Text>
        <Chip t={t} t0={T.irrit - 0.1} x={192} y={490} label="irritating stimuli on the mucosa" color={C.lymph} size={28} />
        <Chip t={t} t0={T.vagal2 - 0.1} x={192} y={556} label="vagal stimulation" color={C.nerve} size={28} />
        <Chip t={t} t0={T.secretin2 - 0.1} x={192} y={622} label="secretin" color={C.lymph} size={28} />
        <Text t={t} t0={T.inhib - 0.3} x={192} y={712} size={28} weight={700} color={C.blood} style={{ letterSpacing: "0.12em" }}>
          INHIBITED BY
        </Text>
        <Chip t={t} t0={T.inhib - 0.1} x={192} y={762} label="sympathetic stimulation" color={C.blood} size={28} />
      </div>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s14 · Brush-border enzymes ───────────────────────────── */
const c14 = makeCue("s14");
const S14T = {
  lumen: c14("released"),
  ep: c14("enteropeptidase"),
  amy: c14("amylase"),
  stay: c14("most stay"),
  pep: c14("peptidases"),
  sug: c14("sucrase"),
  lip: c14("lipase"),
  nuc: c14("nucleotidases"),
};
const BB = 690; // microvilli tips
const STATIONS = [400, 780, 1160, 1540];

const Microvilli: React.FC<{ y: number; x0?: number; x1?: number; h?: number; gap?: number; o?: number }> = ({ y, x0 = 192, x1 = 1728, h = 70, gap = 26, o = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: Math.floor((x1 - x0) / gap) + 1 }, (_, i) => (
      <rect key={i} x={x0 + i * gap - 7} y={y} width={14} height={h + 10} rx={7} fill="#F6B8AA" />
    ))}
    <rect x={x0 - 20} y={y + h} width={x1 - x0 + 40} height={130} fill="url(#cellFill)" />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={i} x1={x0 + 20 + i * ((x1 - x0) / 6.3)} y1={y + h} x2={x0 + 20 + i * ((x1 - x0) / 6.3)} y2={y + h + 130} stroke="#A9524C" strokeWidth={4} />
    ))}
  </g>
);

export const S14: React.FC = () => {
  const t = useT();
  const T = S14T;
  const down = (t0: number) => prog(t, t0 + 0.2, 0.9, E.inOut);
  const split = (t0: number) => prog(t, t0 + 1.2, 0.6, E.out);
  const stationLabel = (i: number, t0: number, title: string, sub: string, color: string) => (
    <Text t={t} t0={t0 - 0.1} x={STATIONS[i] - 180} y={300} w={360} align="center" size={30} weight={700} color={color}>
      {title}
      <div style={{ fontSize: 28, fontWeight: 500, color: C.ink2, marginTop: 6 }}>{sub}</div>
    </Text>
  );
  return (
    <AbsoluteFill>
      <Header kicker="Secretion · enzymes" title="Digestion finishes on the brush border" color={C.gold} t={t} />
      <Svg>
        <Microvilli y={BB} />
        {/* released enzymes */}
        {[
          { t0: T.ep, x: 700, label: "enteropeptidase" },
          { t0: T.amy, x: 1220, label: "amylase" },
        ].map((e, i) => {
          const p = prog(t, e.t0 - 0.3, 1.2, E.out);
          const o = p * fadeOut(t, T.pep - 0.4, 0.4);
          return (
            <g key={i} opacity={o}>
              <Enzyme x={e.x} y={lerp(BB + 60, 470, p)} color={C.gold} r={26} open={0.5 + 0.3 * Math.sin(t * 4)} />
              <text x={e.x} y={lerp(BB + 60, 470, p) - 44} textAnchor="middle" fontFamily={F.body} fontWeight={600} fontSize={30} fill={C.gold}>
                {e.label}
              </text>
            </g>
          );
        })}
        {/* anchored enzymes on the microvilli */}
        {STATIONS.map((x, i) => {
          const t0 = [T.pep, T.sug, T.lip, T.nuc][i];
          const col = [C.teal, C.violet, C.gold, C.ink][i];
          return (
            <g key={i} opacity={prog(t, t0 - 0.3, 0.4)}>
              <line x1={x} y1={BB} x2={x} y2={BB - 26} stroke="#F6B8AA" strokeWidth={4} />
              <Enzyme x={x} y={BB - 40} rot={-90} color={col} r={22} open={0.35 + 0.35 * split(t0)} />
            </g>
          );
        })}
        {/* station 1: dipeptide -> 2 amino acids */}
        {(() => {
          const x = STATIONS[0], d = down(T.pep), s = split(T.pep), y = lerp(440, 610, d);
          return (
            <g opacity={prog(t, T.pep - 0.1, 0.3)}>
              <line x1={x - 16 - s * 40} y1={y} x2={x + 16 + s * 40} y2={y} stroke={C.teal} strokeWidth={5} opacity={1 - s} />
              <Bead x={x - 16 - s * 40} y={y - s * 20} />
              <Bead x={x + 16 + s * 40} y={y - s * 20} />
            </g>
          );
        })()}
        {/* station 2: sucrose -> glucose + fructose */}
        {(() => {
          const x = STATIONS[1], d = down(T.sug), s = split(T.sug), y = lerp(440, 610, d);
          return (
            <g opacity={prog(t, T.sug - 0.1, 0.3)}>
              <Hex x={x - 17 - s * 40} y={y - s * 20} />
              <Pent x={x + 17 + s * 40} y={y - s * 20} />
            </g>
          );
        })()}
        {/* station 3: triglyceride -> glycerol + fatty acids */}
        {(() => {
          const x = STATIONS[2], d = down(T.lip), s = split(T.lip), y = lerp(430, 600, d);
          return (
            <g opacity={prog(t, T.lip - 0.1, 0.3)}>
              <Triglyceride x={x - 30} y={y} tails={[s < 0.5, s < 0.5, s < 0.5]} s={0.9} />
              {s >= 0.5 && [0, 1, 2].map((k) => <FattyAcid key={k} x={x + 10 + s * 30} y={y - 30 + k * 26 - s * 10} s={0.9} />)}
            </g>
          );
        })()}
        {/* station 4: nucleotide -> base + phosphate + pentose */}
        {(() => {
          const x = STATIONS[3], d = down(T.nuc), s = split(T.nuc), y = lerp(440, 610, d);
          return (
            <g opacity={prog(t, T.nuc - 0.1, 0.3)}>
              <rect x={x - 46 - s * 30} y={y - 13 - s * 18} width={26} height={26} rx={4} fill={C.lymph} />
              <Pent x={x} y={y - s * 26} fill={C.galac} r={15} />
              <circle cx={x + 34 + s * 30} cy={y - s * 18} r={12} fill={C.hco3} />
            </g>
          );
        })()}
      </Svg>
      {stationLabel(0, T.pep, "Peptidases", "amino-, oligo-, di/tripeptidases → amino acids", C.teal)}
      {stationLabel(1, T.sug, "Disaccharidases", "sucrase, maltase, isomaltase, lactase → monosaccharides", C.violet)}
      {stationLabel(2, T.lip, "Intestinal lipase", "small amounts → glycerol + fatty acids", C.gold)}
      {stationLabel(3, T.nuc, "Nucleotidases", "→ bases, phosphoric acid, pentose", C.ink)}
      <Text t={t} t0={T.ep - 0.4} x={192} y={290} w={1400} size={32} weight={600} color={C.ink} out={T.pep - 0.4}>
        Secreted into the lumen: only <span style={{ color: C.gold }}>enteropeptidase</span> and <span style={{ color: C.gold }}>amylase</span>
      </Text>
      <Text t={t} t0={T.stay} x={192} y={600} w={700} size={30} color={C.ink2} out={T.pep - 0.4}>
        the rest stay on the brush border or inside the enterocytes
      </Text>
      <Text t={t} t0={T.pep - 0.2} x={192} y={900} size={28} color={C.ink3}>
        brush border of the enterocytes
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s15 · Carbohydrate digestion ───────────────────────────── */
const c15 = makeCue("s15");
const S15T = {
  mouth: c15("mouth"),
  ptyalin: c15("ptyalin"),
  twenty: c15("twenty"),
  stomach: c15("stomach"),
  panc: c15("pancreatic"),
  several: c15("several"),
  fifteen: c15("fifteen"),
  maltose: c15("maltose"),
  brush: c15("brush border"),
  maltase: c15("maltase"),
  alpha: c15("alpha"),
  sucrase: c15("sucrase"),
  lactase: c15("lactase"),
};
const N15 = 16;
// cut points: ptyalin cuts after 3 & 6 (part of the starch), pancreatic cuts the rest into 2s and 3s
const CUT_P = [3, 7];
const CUT_A = [2, 5, 9, 11, 13];
const groupOf = (i: number, cuts: number[]) => cuts.filter((c) => i >= c).length;

export const S15: React.FC = () => {
  const t = useT();
  const T = S15T;
  const phA = fadeOut(t, T.brush - 0.4, 0.4);
  const phB = prog(t, T.brush - 0.1, 0.5);
  const cutP = prog(t, T.ptyalin + 0.3, 0.6, E.inOut);
  const cutA = prog(t, T.panc + 0.8, 0.8, E.inOut);
  const lane = (k: number, t0: number, enzyme: string, left: React.ReactNode[], right: React.ReactNode[], lname: string, rname: string) => {
    const p = prog(t, t0 - 0.15, 0.4);
    const s = prog(t, t0 + 0.4, 0.6);
    const y = 380 + k * 130;
    return (
      <g key={k} opacity={p}>
        <g>{left}</g>
        <text x={560} y={y + 52} fontFamily={F.body} fontSize={26} fill={C.ink2} textAnchor="middle">{lname}</text>
        <line x1={680} y1={y} x2={680 + 400 * s} y2={y} stroke={C.ink2} strokeWidth={3} />
        <path d={`M ${680 + 400 * s} ${y} l -14 -9 l 0 18 Z`} fill={C.ink2} opacity={s} />
        <text x={880} y={y - 18} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={30} fill={C.violet}>{enzyme}</text>
        <g opacity={s}>{right}</g>
        <text x={1280} y={y + 52} fontFamily={F.body} fontSize={26} fill={C.ink2} textAnchor="middle" opacity={s}>{rname}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <Header kicker="Digestion · carbohydrates" title="From starch to monosaccharides" color={C.violet} t={t} />
      <div style={{ opacity: phA }}>
        <Svg>
          {/* starch chain */}
          {Array.from({ length: N15 }, (_, i) => {
            const gp = groupOf(i, CUT_P), ga = groupOf(i, CUT_A);
            const x = 360 + i * 66 + gp * 50 * cutP + ga * 36 * cutA - 40 * cutA;
            const y = 560 + (ga % 2 ? -24 : 18) * cutA + (gp % 2 ? 14 : -6) * cutP * (1 - cutA);
            const next = i < N15 - 1 && groupOf(i + 1, CUT_P) === gp && groupOf(i + 1, CUT_A) === ga;
            const nx = 360 + (i + 1) * 66 + gp * 50 * cutP + ga * 36 * cutA - 40 * cutA;
            return (
              <g key={i} opacity={prog(t, 0.3 + i * 0.03, 0.3)}>
                {(next || (i < N15 - 1 && cutP + cutA < 0.01)) && <line x1={x} y1={y} x2={nx} y2={y} stroke={C.violet} strokeWidth={5} />}
                <Hex x={x} y={y} r={22} />
                {(i === 4 || i === 11) && <Hex x={x} y={y - 56} r={18} o={0.85} />}
                {(i === 4 || i === 11) && <line x1={x} y1={y - 22} x2={x} y2={y - 40} stroke={C.violet} strokeWidth={5} />}
              </g>
            );
          })}
          {/* enzymes */}
          <g opacity={prog(t, T.ptyalin - 0.2, 0.4) * fadeOut(t, T.panc - 0.2, 0.4)}>
            <Enzyme x={lerp(300, 620, prog(t, T.ptyalin, 1.2))} y={640} color={C.coralSoft} r={26} open={0.4 + 0.4 * Math.abs(Math.sin(t * 5))} />
          </g>
          <g opacity={prog(t, T.panc - 0.2, 0.4)}>
            <Enzyme x={lerp(300, 1500, prog(t, T.panc + 0.2, 1.8, E.inOut))} y={660} color={C.gold} r={34} open={0.4 + 0.4 * Math.abs(Math.sin(t * 6))} />
          </g>
        </Svg>
        <Chip t={t} t0={T.mouth - 0.1} x={192} y={300} label="Mouth" color={C.coralSoft} size={30} />
        <Text t={t} t0={T.ptyalin - 0.1} x={360} y={306} size={30} color={C.ink}>
          ptyalin (salivary α-amylase) <span style={{ fontFamily: F.mono, color: C.coralSoft }}>20–40%</span> of starch
        </Text>
        <Text t={t} t0={T.stomach - 0.1} x={360} y={352} size={28} color={C.ink2}>
          keeps working in the stomach for up to 1 hour
        </Text>
        <Chip t={t} t0={T.panc - 0.1} x={192} y={740} label="Pancreatic amylase" color={C.gold} size={30} />
        <Text t={t} t0={T.several - 0.1} x={560} y={748} size={30} color={C.ink}>
          several times more powerful · <span style={{ fontFamily: F.mono, color: C.gold }}>50–80%</span>
        </Text>
        <Text t={t} t0={T.fifteen - 0.1} x={560} y={796} size={28} color={C.ink2}>
          within <b style={{ color: C.gold }}>15–30 min</b> → maltose &amp; small glucose polymers (before the jejunum)
        </Text>
      </div>
      <div style={{ opacity: phB }}>
        <Svg>
          {lane(0, T.maltase, "maltase", [<Hex key="a" x={530} y={380} />, <Hex key="b" x={570} y={380} />], [<Hex key="a" x={1250} y={380} />, <Hex key="b" x={1310} y={380} />], "maltose", "2 glucose")}
          {lane(1, T.alpha, "α-dextrinase", [<Hex key="a" x={510} y={510} />, <Hex key="b" x={548} y={510} />, <Hex key="c" x={586} y={510} />, <Hex key="d" x={548} y={474} />], [<Hex key="a" x={1220} y={510} />, <Hex key="b" x={1280} y={510} />, <Hex key="c" x={1340} y={510} />], "small glucose polymers", "glucose")}
          {lane(2, T.sucrase, "sucrase", [<Hex key="a" x={530} y={640} />, <Pent key="b" x={570} y={640} />], [<Hex key="a" x={1250} y={640} />, <Pent key="b" x={1310} y={640} />], "sucrose", "glucose + fructose")}
          {lane(3, T.lactase, "lactase", [<Hex key="a" x={530} y={770} />, <Hex key="b" x={570} y={770} fill={C.galac} />], [<Hex key="a" x={1250} y={770} />, <Hex key="b" x={1310} y={770} fill={C.galac} />], "lactose", "glucose + galactose")}
        </Svg>
        <Text t={t} t0={T.brush - 0.1} x={192} y={290} size={32} weight={600} color={C.ink}>
          On the brush border:
        </Text>
        <div style={{ position: "absolute", left: 1450, top: 360, opacity: phB, fontFamily: F.body, fontSize: 28, color: C.ink2, lineHeight: 1.9 }}>
          <div><svg width={26} height={26} viewBox="-13 -13 26 26"><polygon points="16,0 8,13.9 -8,13.9 -16,0 -8,-13.9 8,-13.9" transform="scale(0.75)" fill={C.violet} /></svg> glucose</div>
          <div><svg width={26} height={26} viewBox="-13 -13 26 26"><polygon points="16,0 8,13.9 -8,13.9 -16,0 -8,-13.9 8,-13.9" transform="scale(0.75)" fill={C.galac} /></svg> galactose</div>
          <div><svg width={26} height={26} viewBox="-13 -13 26 26"><polygon points="0,-12 11.4,-3.7 7,9.7 -7,9.7 -11.4,-3.7" fill={C.pink} /></svg> fructose</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

void clamp;
