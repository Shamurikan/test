import React from "react";
import { AbsoluteFill } from "remotion";
import { C, F } from "../lib/theme";
import { Chip, E, Header, SLabel, Text, clamp, fadeOut, lerp, prog, rng, useT } from "../lib/anim";
import { makeCue } from "../lib/timing";
import { Bead, BileSalt, Enzyme, FattyAcid, Triglyceride } from "../lib/shapes";
import { Svg } from "./motility1";

/* ───────────────────────────── s16 · Protein digestion: activation ───────────────────────────── */
const c16 = makeCue("s16");
const S16T = {
  pepsin: c16("pepsin"),
  ph: c16("two to three"),
  collagen: c16("collagen"),
  ten: c16("ten"),
  duo: c16("duodenum"),
  ek: c16("enterokinase"),
  tryp: c16("trypsin"),
  more: c16("more trypsin"),
  chymo: c16("chymotrypsin"),
  elast: c16("elastase"),
  carb: c16("carboxypeptidases"),
};

const Zymogen: React.FC<{ x: number; y: number; name: string; active: string; p: number; color: string; o?: number }> = ({ x, y, name, active, p, color, o = 1 }) => (
  <g opacity={o}>
    <rect x={x} y={y - 26} width={300} height={52} rx={26} fill={p > 0.5 ? color : "rgba(247,239,233,0.08)"} stroke={color} strokeWidth={3} />
    {/* the pro-segment cap falls away when activated */}
    <rect x={x + 300 - 8 + p * 30} y={y - 18 + p * 40} width={34} height={36} rx={10} fill="#8E7C76" opacity={1 - p} transform={`rotate(${p * 30} ${x + 310} ${y})`} />
    <text x={x + 150} y={y + 10} textAnchor="middle" fontFamily={F.body} fontWeight={600} fontSize={28} fill={p > 0.5 ? C.bg : C.ink}>
      {p > 0.5 ? active : name}
    </text>
  </g>
);

export const S16: React.FC = () => {
  const t = useT();
  const T = S16T;
  const dimA = 1 - 0.55 * prog(t, T.duo, 0.5);
  const phMark = prog(t, T.ph - 0.2, 0.8, E.inOut);
  const cut = prog(t, T.collagen + 0.2, 1.4, E.inOut);
  const trypP = prog(t, T.ek + 0.6, 0.5);
  const cascade = [
    { name: "trypsinogen", active: "trypsin", t0: T.more, color: C.teal },
    { name: "chymotrypsinogen", active: "chymotrypsin", t0: T.chymo, color: C.teal },
    { name: "proelastase", active: "elastase", t0: T.elast, color: C.teal },
    { name: "procarboxypeptidases", active: "carboxypeptidases", t0: T.carb, color: C.teal },
  ];
  return (
    <AbsoluteFill>
      <Header kicker="Digestion · proteins" title="Pepsin, then the trypsin cascade" color={C.teal} t={t} />
      <div style={{ opacity: dimA }}>
        <Svg>
          {/* pH scale */}
          <g opacity={prog(t, T.pepsin - 0.1, 0.4)}>
            <text x={192} y={296} fontFamily={F.body} fontWeight={700} fontSize={28} fill={C.ink2} letterSpacing="0.12em">STOMACH</text>
            <defs>
              <linearGradient id="phg" x1="0" x2="1">
                <stop offset="0" stopColor="#FF5E5E" />
                <stop offset="0.5" stopColor="#FFC857" />
                <stop offset="1" stopColor="#5CC8FF" />
              </linearGradient>
            </defs>
            <rect x={192} y={360} width={560} height={18} rx={9} fill="url(#phg)" />
            {[0, 2, 4, 6, 8].map((v) => (
              <text key={v} x={192 + (v / 8) * 560} y={410} textAnchor="middle" fontFamily={F.mono} fontSize={24} fill={C.ink2}>{v}</text>
            ))}
            <g opacity={phMark}>
              <rect x={192 + (2 / 8) * 560} y={346} width={(1 / 8) * 560} height={46} rx={8} fill="none" stroke={C.ink} strokeWidth={3} />
              <text x={192 + (2.5 / 8) * 560} y={340} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={26} fill={C.ink}>active</text>
              <rect x={192 + (5 / 8) * 560} y={346} width={(3 / 8) * 560} height={46} rx={8} fill="rgba(11,6,8,0.55)" />
              <text x={192 + (6.5 / 8) * 560} y={340} textAnchor="middle" fontFamily={F.body} fontSize={26} fill={C.ink3}>inactive &gt; 5</text>
            </g>
          </g>
          {/* collagen fibre being cut by pepsin */}
          <g opacity={prog(t, T.collagen - 0.2, 0.4)}>
            {[0, 1, 2].map((k) => {
              let d = "";
              for (let x = 0; x <= 520; x += 8) d += `${x ? "L" : "M"}${232 + x + (x > 260 ? cut * 40 : 0)} ${520 + Math.sin(x / 26 + k * 2.1) * 14}`;
              return <path key={k} d={d} stroke={["#F7E6C9", "#E9C98A", "#D9B070"][k]} strokeWidth={6} fill="none" strokeLinecap="round" />;
            })}
            <Enzyme x={lerp(200, 492, prog(t, T.collagen, 1.2, E.inOut))} y={584} color={C.teal} r={26} open={0.4 + 0.4 * Math.abs(Math.sin(t * 5))} />
            <text x={232} y={474} fontFamily={F.body} fontSize={28} fill={C.ink2}>collagen</text>
          </g>
          <g opacity={prog(t, T.ten - 0.1, 0.4)}>
            <rect x={192} y={680} width={560} height={16} rx={8} fill="rgba(247,239,233,0.12)" />
            <rect x={192} y={680} width={560 * 0.15 * prog(t, T.ten, 0.8)} height={16} rx={8} fill={C.teal} />
            <text x={192} y={740} fontFamily={F.body} fontSize={30} fill={C.ink}>
              pepsin: only <tspan fill={C.teal} fontFamily={F.mono}>10–20%</tspan> of protein digestion
            </text>
          </g>
        </Svg>
        <Text t={t} t0={T.collagen + 0.2} x={192} y={604} w={660} size={28} color={C.ink2}>
          digests collagen, opening meat to other enzymes
        </Text>
      </div>
      {/* cascade */}
      <Svg>
        <g opacity={prog(t, T.duo - 0.1, 0.4)}>
          <text x={900} y={320} fontFamily={F.body} fontWeight={700} fontSize={28} fill={C.ink2} letterSpacing="0.12em">DUODENUM &amp; JEJUNUM</text>
          {/* brush border + enterokinase */}
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={900 + i * 22} y={380} width={12} height={60} rx={6} fill="#F6B8AA" opacity={prog(t, T.ek - 0.3, 0.4)} />
          ))}
          <g opacity={prog(t, T.ek - 0.2, 0.4)}>
            <Enzyme x={1000} y={366} rot={90} color={C.gold} r={20} open={0.5} />
            <text x={1110} y={418} fontFamily={F.body} fontWeight={600} fontSize={28} fill={C.gold}>enterokinase (brush border)</text>
          </g>
        </g>
        <g opacity={prog(t, T.ek - 0.1, 0.4)}>
          <Zymogen x={900} y={500} name="trypsinogen" active="trypsin" p={trypP} color={C.teal} />
          <path d="M 1000 440 L 1000 470" stroke={C.gold} strokeWidth={4} />
        </g>
        {/* trypsin activates the others */}
        {cascade.map((z, i) => {
          const y = 600 + i * 76;
          const p = prog(t, z.t0 + 0.2, 0.5);
          const arrow = prog(t, z.t0 - 0.1, 0.4, E.inOut);
          return (
            <g key={i} opacity={prog(t, z.t0 - 0.3, 0.4)}>
              <path d={`M 1210 526 C 1260 526, 1300 ${y}, ${1300 + 40 * arrow} ${y}`} stroke={C.teal} strokeWidth={3} fill="none" opacity={arrow} />
              <Zymogen x={1360} y={y} name={z.name} active={z.active} p={p} color={z.color} />
            </g>
          );
        })}
      </Svg>
      <Text t={t} t0={T.more} x={900} y={544} w={300} size={26} color={C.ink2}>
        trypsin activates more trypsin…
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s17 · Protein digestion: cutting ───────────────────────────── */
const c17 = makeCue("s17");
const S17T = {
  cut: c17("trypsin and chymotrypsin"),
  poly: c17("polypeptides"),
  carb: c17("carboxypeptidase"),
  end: c17("carboxyl end"),
  elast: c17("elastase"),
  small: c17("only a small"),
  di: c17("dipeptides"),
  pep: c17("peptidases on"),
};
const N17 = 22;
const GROUPS17 = [0, 6, 12, 17]; // cut positions (start index of each polypeptide)
const gIdx = (i: number) => GROUPS17.filter((g) => i >= g).length - 1;
const gEnd = (gi: number) => (gi < GROUPS17.length - 1 ? GROUPS17[gi + 1] - 1 : N17 - 1);
// after carboxypeptidase: last bead of each group is freed; then split remainder into 2s/3s
const SUB = (i: number) => {
  const gi = gIdx(i);
  const local = i - GROUPS17[gi];
  return gi * 10 + Math.floor(local / (gi % 2 ? 3 : 2));
};

export const S17: React.FC = () => {
  const t = useT();
  const T = S17T;
  const cut = prog(t, T.cut + 0.4, 0.9, E.inOut);
  const clip = prog(t, T.end - 0.2, 0.9, E.out);
  const di = prog(t, T.di, 0.9, E.inOut);
  const toBB = prog(t, T.pep + 0.1, 1.4, E.inOut);
  const into = prog(t, T.pep + 1.4, 1.0, E.in);
  const bbO = prog(t, T.pep - 0.3, 0.5);
  return (
    <AbsoluteFill>
      <Header kicker="Digestion · proteins" title="Cutting the chain" color={C.teal} t={t} />
      <Svg>
        {Array.from({ length: N17 }, (_, i) => {
          const gi = gIdx(i);
          const freed = i === gEnd(gi);
          const sub = SUB(i);
          let x = 340 + i * 56 + (gi - 1.5) * 70 * cut;
          let y = 570 + (gi % 2 ? -26 : 26) * cut;
          if (freed) {
            x += 50 * clip;
            y -= 90 * clip + Math.sin(t * 1.5 + i) * 6 * clip;
          } else {
            x += (sub % 10) * 26 * di;
            y += ((sub % 10) % 2 ? 22 : -22) * di;
            // move to brush border and enter the cell
            y = lerp(y, 770, toBB);
            y += 120 * into;
          }
          const nextSame = i < N17 - 1 && gIdx(i + 1) === gi && !(i + 1 === gEnd(gi) && clip > 0.3) && !(SUB(i + 1) !== sub && di > 0.3) && !freed;
          const nx = 340 + (i + 1) * 56 + (gi - 1.5) * 70 * cut + (SUB(i + 1) % 10) * 26 * di;
          const breakAll = into > 0.4;
          const o = freed ? 1 : 1 - into;
          return (
            <g key={i} opacity={o * prog(t, 0.2 + i * 0.025, 0.3)}>
              {(nextSame || cut < 0.05) && i < N17 - 1 && !breakAll && <line x1={x} y1={y} x2={nx + (freed ? 0 : 0)} y2={y + (gIdx(i + 1) === gi ? ((SUB(i + 1) % 10) % 2 ? 22 : -22) * di - ((sub % 10) % 2 ? 22 : -22) * di : 0)} stroke={C.teal} strokeWidth={5} />}
              <Bead x={x} y={y} r={15} />
            </g>
          );
        })}
        <SLabel t={t} t0={0.4} x={310} y={580} size={28} color={C.ink3} anchor="end" out={T.cut + 0.3}>N</SLabel>
        <SLabel t={t} t0={0.4} x={1546} y={580} size={28} color={C.ink2} out={T.cut + 0.3}>COOH</SLabel>
        {/* the two endopeptidases */}
        {[0, 1].map((k) => {
          const x = 340 + (GROUPS17[k + 1] - 0.5) * 56 + (k - 0.5) * 70 * cut;
          return (
            <g key={k} opacity={prog(t, T.cut - 0.2, 0.3) * fadeOut(t, T.carb - 0.3, 0.4)}>
              <Enzyme x={x} y={lerp(430, 500, prog(t, T.cut, 0.5))} rot={90} color={k ? C.gold : C.teal} r={28} open={0.3 + 0.5 * cut} />
            </g>
          );
        })}
        {/* carboxypeptidase at each COOH end */}
        {GROUPS17.map((gs, gi) => {
          const e = gEnd(gi);
          const x = 340 + e * 56 + (gi - 1.5) * 70 + 40;
          return (
            <g key={gi} opacity={prog(t, T.carb - 0.1, 0.3) * fadeOut(t, T.di - 0.3, 0.4)}>
              <Enzyme x={x} y={570 + (gi % 2 ? -26 : 26) - 46} rot={120} color={C.coralSoft} r={20} open={0.3 + 0.4 * clip} />
            </g>
          );
        })}
        {/* brush border */}
        <g opacity={bbO}>
          {Array.from({ length: 60 }, (_, i) => (
            <rect key={i} x={200 + i * 26} y={790} width={14} height={70} rx={7} fill="#F6B8AA" />
          ))}
          <rect x={180} y={850} width={1560} height={60} fill="url(#cellFill)" />
        </g>
        {/* elastin vignette */}
        <g opacity={prog(t, T.elast - 0.2, 0.4) * fadeOut(t, T.di - 0.3, 0.4)} transform="translate(1340 780)">
          {(() => {
            const p = prog(t, T.elast + 0.3, 0.8);
            let d = "";
            for (let a = 0; a <= 360 * 4; a += 12) d += `${a ? "L" : "M"}${a / 6 + (a > 720 ? p * 30 : 0)} ${Math.sin((a * Math.PI) / 180) * 18}`;
            return <path d={d} stroke="#F7E6C9" strokeWidth={4} fill="none" />;
          })()}
          <text x={0} y={60} fontFamily={F.body} fontSize={28} fill={C.ink2}>elastase digests elastin fibers</text>
        </g>
      </Svg>
      <Text t={t} t0={T.cut - 0.1} x={192} y={300} w={760} size={32} weight={600} color={C.ink}>
        <span style={{ color: C.teal }}>Trypsin</span> &amp; <span style={{ color: C.gold }}>chymotrypsin</span> cut it into polypeptides
      </Text>
      <Text t={t} t0={T.carb - 0.1} x={192} y={350} w={900} size={30} color={C.ink}>
        <span style={{ color: C.coralSoft }}>Carboxypeptidase</span> clips amino acids off the COOH end
      </Text>
      <Text t={t} t0={T.small - 0.1} x={1220} y={300} w={500} align="right" size={30} color={C.ink2} out={T.pep - 0.3}>
        only a few become free amino acids
      </Text>
      <Text t={t} t0={T.di - 0.1} x={192} y={400} w={900} size={30} color={C.ink}>
        most end as <b style={{ color: C.teal }}>dipeptides &amp; tripeptides</b>
      </Text>
      <Text t={t} t0={T.pep} x={192} y={700} w={1000} size={30} color={C.ink2}>
        … finished by peptidases on and inside the enterocytes
      </Text>
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s18 · Fat digestion ───────────────────────────── */
const c18 = makeCue("s18");
const S18T = {
  water: c18("doesn't mix"),
  surface: c18("lipase only"),
  less: c18("less than"),
  bile: c18("bile salts"),
  amph: c18("amphipathic"),
  churn: c18("churning"),
  emul: c18("emulsification"),
  panc: c18("pancreatic lipase"),
  split: c18("splits"),
  without: c18("without"),
};
const r18 = rng(18);
const DROPS = Array.from({ length: 9 }, (_, i) => ({
  x: 520 + (i % 3) * 190 + (r18() - 0.5) * 40,
  y: 430 + Math.floor(i / 3) * 150 + (r18() - 0.5) * 30,
}));

export const S18: React.FC = () => {
  const t = useT();
  const T = S18T;
  const coat = prog(t, T.bile + 0.2, 1.4, E.inOut);
  const brk = prog(t, T.churn + 0.3, 1.4, E.inOut);
  const lip = prog(t, T.panc, 0.6);
  const tgSplit = prog(t, T.split + 0.3, 0.9, E.inOut);
  const cx = 710, cy = 580, R = 170;
  const wob = (k: number) => 1 + 0.03 * Math.sin(t * 2 + k);
  return (
    <AbsoluteFill>
      <Header kicker="Digestion · fats" title="Emulsify first, then digest" color={C.gold} t={t} />
      <Svg>
        {/* water tint */}
        <rect x={380} y={300} width={700} height={560} rx={40} fill="rgba(167,227,255,0.06)" stroke="rgba(167,227,255,0.18)" strokeWidth={2} />
        <text x={400} y={340} fontFamily={F.body} fontSize={26} fill={C.water} opacity={0.8}>water (lumen)</text>
        {/* one big globule → many droplets */}
        {brk < 1 && (
          <g opacity={1 - brk}>
            <ellipse cx={cx} cy={cy} rx={R * wob(0)} ry={R * wob(1.3)} fill="url(#goldGlow)" />
            <ellipse cx={cx} cy={cy} rx={R * 0.82 * wob(0)} ry={R * 0.82 * wob(1.3)} fill={C.gold} opacity={0.85} />
            {Array.from({ length: 40 }, (_, i) => {
              const a = (i / 40) * Math.PI * 2;
              const p = clamp(coat * 1.6 - (i % 8) * 0.08);
              const rr = lerp(R + 160, R * 0.86, p);
              return p > 0 ? <BileSalt key={i} x={cx + Math.cos(a) * rr} y={cy + Math.sin(a) * rr} rot={(a * 180) / Math.PI - 90} o={p} s={1.1} /> : null;
            })}
          </g>
        )}
        {brk > 0 &&
          DROPS.map((d, i) => {
            const x = lerp(cx, d.x, brk), y = lerp(cy, d.y, brk);
            const r = lerp(R * 0.6, 48, brk);
            return (
              <g key={i} opacity={brk}>
                <circle cx={x} cy={y} r={r} fill={C.gold} opacity={0.85} />
                {Array.from({ length: 12 }, (_, k) => {
                  const a = (k / 12) * Math.PI * 2;
                  return <BileSalt key={k} x={x + Math.cos(a) * (r + 2)} y={y + Math.sin(a) * (r + 2)} rot={(a * 180) / Math.PI - 90} s={0.7} />;
                })}
                {lip > 0 && <Enzyme x={x + r + 14} y={y - r * 0.4} rot={200} color={C.ink} r={14} open={0.3 + 0.4 * Math.abs(Math.sin(t * 6 + i))} o={lip} />}
              </g>
            );
          })}
        {/* lipase only at the surface (before emulsification) */}
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + 0.3;
          const o = prog(t, T.surface, 0.4) * fadeOut(t, T.bile - 0.2, 0.4);
          return o > 0 ? <Enzyme key={i} x={cx + Math.cos(a) * (R + 24)} y={cy + Math.sin(a) * (R + 24)} rot={(a * 180) / Math.PI + 180} color={C.ink} r={16} open={0.5} o={o} /> : null;
        })}
        {/* amphipathic callout */}
        <g opacity={prog(t, T.amph - 0.2, 0.4) * fadeOut(t, T.panc - 0.3, 0.4)} transform="translate(1340 590)">
          <BileSalt x={0} y={0} s={5} />
          <line x1={40} y1={-10} x2={110} y2={-60} stroke={C.bile} strokeWidth={3} />
          <text x={118} y={-60} fontFamily={F.body} fontWeight={600} fontSize={28} fill={C.bile}>water-soluble (polar)</text>
          <line x1={22} y1={90} x2={110} y2={120} stroke={C.gold} strokeWidth={3} />
          <text x={118} y={128} fontFamily={F.body} fontWeight={600} fontSize={28} fill={C.gold}>fat-soluble (sterol)</text>
          <text x={-40} y={-120} fontFamily={F.body} fontWeight={700} fontSize={28} fill={C.ink} letterSpacing="0.1em">AMPHIPATHIC</text>
        </g>
        {/* triglyceride split callout */}
        <g opacity={prog(t, T.panc - 0.1, 0.4)} transform="translate(1240 480)">
          <Triglyceride x={60} y={60} tails={[tgSplit < 0.5, true, tgSplit < 0.5]} s={1.6} />
          {tgSplit >= 0.5 && (
            <>
              <FattyAcid x={250} y={0} s={1.6} o={tgSplit} />
              <FattyAcid x={250} y={120} s={1.6} o={tgSplit} />
            </>
          )}
          <text x={0} y={-60} fontFamily={F.body} fontWeight={700} fontSize={28} fill={C.ink}>triglyceride</text>
          <text x={0} y={210} fontFamily={F.body} fontSize={28} fill={C.ink2} opacity={tgSplit}>2-monoglyceride</text>
          <text x={240} y={210} fontFamily={F.body} fontSize={28} fill={C.gold} opacity={tgSplit}>+ 2 free fatty acids</text>
        </g>
      </Svg>
      <Text t={t} t0={T.water - 0.1} x={192} y={880} w={1000} size={28} color={C.ink2} out={T.bile}>
        fat doesn&apos;t mix with water, and lipase works only at the droplet&apos;s surface
      </Text>
      <Chip t={t} t0={T.less - 0.1} x={1140} y={300} label="stomach: < 10% (lingual & gastric lipase)" color={C.ink3} size={26} out={T.amph - 0.3} />
      <Text t={t} t0={T.bile - 0.1} x={1140} y={370} w={580} size={30} weight={600} color={C.bile} out={T.panc - 0.3}>
        bile salts + lecithin coat the fat
      </Text>
      <Text t={t} t0={T.emul - 0.1} x={192} y={880} w={1100} size={32} weight={600} color={C.gold} out={T.panc + 1}>
        emulsification: tiny droplets, huge surface for lipase
      </Text>
      <Text t={t} t0={T.panc - 0.1} x={1140} y={300} w={580} size={32} weight={600} color={C.ink}>
        <span style={{ color: C.gold }}>pancreatic lipase</span>, the key enzyme
      </Text>
      <Chip t={t} t0={T.without - 0.1} x={192} y={872} label="not enough pancreatic lipase → steatorrhea (fat in stool)" color={C.blood} size={28} />
    </AbsoluteFill>
  );
};

/* ───────────────────────────── s19 · Micelles ───────────────────────────── */
const c19 = makeCue("s19");
const S19T = {
  form: c19("form micelles"),
  three: c19("three to six"),
  twenty: c19("twenty"),
  neg: c19("negatively"),
  diss: c19("dissolved"),
  fa: c19("fatty acids"),
  mg: c19("monoglycerides"),
  chol: c19("cholesterol"),
  vit: c19("fat-soluble"),
  ferry: c19("ferry"),
  remember: c19("remember"),
  emul: c19("emulsify"),
  transport: c19("transport"),
};
const r19 = rng(19);
const NB = 26;
const FREE = Array.from({ length: NB }, () => ({ x: 300 + r19() * 1300, y: 330 + r19() * 480, a: r19() * 360 }));

export const S19: React.FC = () => {
  const t = useT();
  const T = S19T;
  const asm = prog(t, T.form - 0.2, 1.6, E.inOut);
  const ferry = prog(t, T.ferry, 2.4, E.inOut);
  const release = prog(t, T.ferry + 2.0, 1.4, E.inOut);
  const card = prog(t, T.remember - 0.2, 0.5);
  const mx = lerp(960, 1300, ferry) - 280 * card;
  const my = lerp(560, 660, ferry);
  const R = 120;
  const cargo = [
    { t0: T.fa, kind: "fa", dx: -40, dy: -30 },
    { t0: T.fa, kind: "fa", dx: 20, dy: 30 },
    { t0: T.mg, kind: "mg", dx: 30, dy: -40 },
    { t0: T.chol, kind: "chol", dx: -30, dy: 40 },
    { t0: T.vit, kind: "vit", dx: 0, dy: 0 },
  ];
  return (
    <AbsoluteFill>
      <Header kicker="Digestion · fats" title="Micelles: the ferry" color={C.gold} t={t} />
      <Svg>
        {/* brush border (destination) */}
        <g opacity={prog(t, T.ferry - 0.4, 0.5)}>
          {Array.from({ length: 28 }, (_, i) => (
            <rect key={i} x={1060 + i * 24} y={790} width={13} height={64} rx={6} fill="#F6B8AA" />
          ))}
          <rect x={1040} y={846} width={700} height={70} fill="url(#cellFill)" />
          <text x={1740} y={776} textAnchor="end" fontFamily={F.body} fontSize={28} fill={C.ink2}>brush border</text>
        </g>
        {/* bile salts gathering into a micelle */}
        {FREE.map((b, i) => {
          const a = (i / NB) * Math.PI * 2;
          const x = lerp(b.x, mx + Math.cos(a) * R, asm);
          const y = lerp(b.y, my + Math.sin(a) * R, asm);
          const rot = lerp(b.a, (a * 180) / Math.PI + 90, asm);
          return <BileSalt key={i} x={x} y={y} rot={rot} s={1.5} charge={t > T.neg} />;
        })}
        {/* cargo inside */}
        {cargo.map((c, i) => {
          const p = prog(t, c.t0 - 0.2, 0.7, E.out);
          if (p <= 0) return null;
          const inX = mx + c.dx, inY = my + c.dy;
          const fromX = mx - 500 + i * 60, fromY = my + 260;
          let x = lerp(fromX, inX, p), y = lerp(fromY, inY, p);
          // release into the cell
          x = lerp(x, 1200 + i * 90, release);
          y = lerp(y, 900, release);
          const o = 1 - prog(t, T.ferry + 3.0, 0.5);
          if (c.kind === "fa") return <FattyAcid key={i} x={x - 25} y={y} s={1.1} o={o} />;
          if (c.kind === "mg") return <g key={i} opacity={o}><rect x={x - 6} y={y - 16} width={12} height={32} rx={6} fill="#FFE3A0" /><FattyAcid x={x + 6} y={y} s={1} /></g>;
          if (c.kind === "chol")
            return (
              <g key={i} opacity={o} transform={`translate(${x} ${y})`}>
                {[0, 1, 2, 3].map((k) => (
                  <polygon key={k} points="0,-10 9,-5 9,5 0,10 -9,5 -9,-5" transform={`translate(${k * 15 - 22} ${k % 2 ? 6 : -2})`} fill="none" stroke="#FFE3A0" strokeWidth={3} />
                ))}
              </g>
            );
          return (
            <text key={i} x={x} y={y + 10} textAnchor="middle" fontFamily={F.mono} fontSize={26} fill={C.gold} opacity={o}>
              A D E K
            </text>
          );
        })}
        {/* size marker */}
        <g opacity={prog(t, T.three - 0.1, 0.4) * fadeOut(t, T.ferry - 0.2, 0.3)}>
          <line x1={mx - R - 14} y1={my + R + 50} x2={mx + R + 14} y2={my + R + 50} stroke={C.ink2} strokeWidth={2} />
          <line x1={mx - R - 14} y1={my + R + 38} x2={mx - R - 14} y2={my + R + 62} stroke={C.ink2} strokeWidth={2} />
          <line x1={mx + R + 14} y1={my + R + 38} x2={mx + R + 14} y2={my + R + 62} stroke={C.ink2} strokeWidth={2} />
          <text x={mx} y={my + R + 96} textAnchor="middle" fontFamily={F.mono} fontSize={30} fill={C.ink}>3–6 nm</text>
        </g>
      </Svg>
      <Text t={t} t0={T.twenty - 0.1} x={192} y={300} w={560} size={30} color={C.ink} out={T.remember - 0.3}>
        <span style={{ fontFamily: F.mono, color: C.gold }}>20–40</span> bile salt molecules
      </Text>
      <Text t={t} t0={T.neg - 0.1} x={192} y={350} w={560} size={30} color={C.ink} out={T.remember - 0.3}>
        <span style={{ color: C.bile }}>negative polar heads</span> face out
      </Text>
      <Text t={t} t0={T.diss - 0.1} x={192} y={396} w={560} size={28} color={C.ink2} out={T.remember - 0.3}>
        → the micelle stays dissolved in water
      </Text>
      <Text t={t} t0={T.fa - 0.1} x={192} y={470} w={560} size={30} weight={600} color={C.gold} out={T.remember - 0.3}>
        inside: fatty acids, monoglycerides, cholesterol, fat-soluble vitamins
      </Text>
      <Text t={t} t0={T.ferry - 0.1} x={192} y={600} w={560} size={30} color={C.ink} out={T.remember - 0.3}>
        ferried to the brush border
      </Text>
      <div style={{ position: "absolute", left: 192, top: 330, opacity: card, filter: card < 1 ? `blur(${(1 - card) * 8}px)` : undefined }}>
        <div style={{ fontFamily: F.disp, fontSize: 52, color: C.ink, marginBottom: 22 }}>Bile salts…</div>
        {[
          { l: "emulsify", ok: true, t0: T.emul },
          { l: "transport (micelles)", ok: true, t0: T.transport },
          { l: "digest", ok: false, t0: T.remember },
        ].map((r, i) => (
          <div key={i} style={{ fontFamily: F.body, fontSize: 38, fontWeight: 600, color: r.ok ? C.lymph : C.blood, marginBottom: 12, opacity: prog(t, r.t0 - 0.1, 0.3) }}>
            {r.ok ? "✓" : "✗"} <span style={{ textDecoration: r.ok ? undefined : "line-through", color: r.ok ? C.ink : C.ink2 }}>{r.l}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
