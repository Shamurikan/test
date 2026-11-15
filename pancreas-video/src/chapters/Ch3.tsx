// Chapter 3 — The bicarbonate factory
import React from 'react';
import { An, Arrow, Card, Draw, ptAt, Tag, Tx } from '../lib/prims';
import { Acinus, Board, boardIn, Caption, ClinicalFrame, DC, DuctCell, Hex, ION, Ion, StepBadge, TitleCard } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, move, pop, prog, pulse, resolve, show, slideIn, to, tw, v } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { cam, Stage, useChapterT, World } from '../lib/scene';

const K = anchors(3);
const { A } = K;
const [c0] = K.span;
const STEP_IN = A('step inside');
const B32 = A('step one');
const B33 = A('step three');
const B34 = A('step four');
const B35 = A('electrically negative');
const B36 = A('now notice where');
const MIRROR_T = A('compare the stomach');
const B37 = A('that chloride channel');
const B38 = A('this design has');
const BOARD_T = A('on the board');

const CAMB = { cx: 960, cy: 560, cs: 0.92 };
const CAMS = [cam(STEP_IN - 0.3, 2.2, 960, 560, 0.92, E.io), cam(B37 - 0.6, 0.01, 1000, 600, 0.62)];

type K_ = keyof typeof ION;
const Tok: React.FC<{ k: K_; p: [number, number] | null; op?: number; s?: number }> = ({ k, p, op = 1, s = 1 }) =>
  p && op > 0.01 ? <g transform={`translate(${p[0]},${p[1]}) scale(${s})`}>{ION[k]({ op })}</g> : null;
/** point along d between t0..t0+dur */
const alongP = (t: number, d: string, t0: number, dur: number, r0 = 0, r1 = 1, e = E.io) => (t < t0 ? null : ptAt(d, r0 + (r1 - r0) * prog(t, t0, dur, e)));
/** repeating cycle: phase 0..1 between a and b */
const cyc = (t: number, a: number, b: number, period: number, off = 0) => (t < a || t >= b ? null : (((t - a) / period + off) % 1 + 1) % 1);
const lerp2 = (a: [number, number], b: [number, number], p: number) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p] as [number, number];

/** semicircle pH gauge: dev -1 (acid) .. +1 (alkaline) */
const Gauge: React.FC<{ x: number; y: number; dev: number; label?: string; r?: number; lc?: string }> = ({ x, y, dev, label, r = 70, lc = C.ink2 }) => {
  const a = (-90 + dev * 55) * (Math.PI / 180);
  return (
    <g>
      <path d={`M${x - r},${y} A${r},${r} 0 0 1 ${x},${y - r}`} fill="none" stroke={C.red} strokeWidth={14} />
      <path d={`M${x},${y - r} A${r},${r} 0 0 1 ${x + r},${y}`} fill="none" stroke="#3A5FA8" strokeWidth={14} />
      <line x1={x} y1={y} x2={x + (r - 8) * Math.cos(a)} y2={y + (r - 8) * Math.sin(a)} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
      <circle cx={x} cy={y} r={9} fill={C.ink} />
      <Tx x={x - r} y={y + 24} size={18} w={700} fill={C.red}>
        acid
      </Tx>
      <Tx x={x + r} y={y + 24} size={18} w={700} fill="#3A5FA8">
        alkaline
      </Tx>
      {label && (
        <Tx x={x} y={y + 58} size={24} w={700} fill={lc}>
          {label}
        </Tx>
      )}
    </g>
  );
};

export const Ch3: React.FC = () => {
  const t = useChapterT(3);
  const camS = resolve(t, CAMS, { ...CAMB, cs: 0.36, cx: 1150 });
  const worldOp = v(t, 0, [STEP_IN + 0.1, 0.8, 1], [MIRROR_T - 0.3, 0.5, 0], [B37 - 0.6, 0.6, 1], [B38 - 0.4, 0.5, 0]);
  const cf = t > B37 - 0.6;

  // ---------- steps ----------
  const steps: [string, number][] = [
    ['make HCO_3_^−^', B32],
    ['split', A('step two')],
    ['H^+^ → blood', B33],
    ['HCO_3_^−^ → lumen', B34],
  ];

  // ---------- 3.2 tokens ----------
  const tCO2 = A('carbon dioxide'), tW = A('combines with water'), tH2 = A('carbonic acid'), tCA = A('carbonic anhydrase');
  const tDis = A('dissociates'), tOpp = A('opposite directions');
  const co2 = t < tH2 + 1.2 ? (t < tH2 ? alongP(t, DC.co2In, tCO2, 2.4, 0, 0.72) : lerp2(ptAt(DC.co2In, 0.72), [878, 520], prog(t, tH2, 1.2))) : null;
  const h2o = t > tW && t < tH2 + 1.2 ? lerp2([905, 700], t < tH2 ? [905, 600] : [922, 522], t < tH2 ? prog(t, tW, 1.2) : prog(t, tH2, 1.2)) : null;
  const fuseOp = t > tH2 + 0.9 && t < tDis + 0.1 ? 1 : 0;
  const hPos: [number, number] | null = t > tDis ? (t < B33 + 0.5 ? lerp2([900, 520], [790, 492], prog(t, tDis, 1.4)) : null) : null;
  const bPos: [number, number] | null = t > tDis ? (t < B34 + 0.4 ? lerp2([900, 520], [1010, 548], prog(t, tDis, 1.4)) : null) : null;
  // first H+ leaves along hOut at "hydrogen ion leaves"
  const tHL = A('hydrogen ion leaves');
  const hOut1 = t > B33 + 0.5 && t < tHL + 2.6 ? lerp2([790, 492], ptAt(DC.hOut, 1), prog(t, tHL, 2.4)) : null;
  // NHE cycles
  const tNHE = A('sodium hydrogen exchanger');
  const tGrad = A('sodium gradient');
  const nheEnd = B35 - 0.2;
  const nheP = (k: number) => {
    if (t < tNHE + 1.2 || t >= nheEnd) return null;
    const per = t > tGrad + 1 ? 1.6 : 2.4;
    return cyc(t, tNHE + 1.2, nheEnd, per, k * 0.5);
  };
  // ATPase cycles
  const tATP = A('sodium potassium atpase');
  const atpP = (k: number) => cyc(t, tATP + 0.8, nheEnd, 2.2, k / 3);
  const spark = t > tATP + 0.8 && t < nheEnd ? Math.max(0, Math.sin((((t - tATP - 0.8) / 2.2) % 1) * Math.PI * 2)) : 0;
  const tSpend = A('the pump spends');
  // NBC
  const tNBC = A('alongside sodium');
  const nbcP = (k: number) => cyc(t, tNBC, nheEnd, 2.6, k * 0.5);
  // ---------- 3.4 ----------
  const tAE = A('chloride bicarbonate exchanger');
  const hcoOut1 = t > B34 + 0.4 && t < tAE + 2.8 ? lerp2([1010, 548], ptAt(DC.hco3Out, 1), prog(t, tAE, 2.6)) : null;
  const tCFTR = A('a chloride channel');
  const tLoop = A('chloride leaks out');
  const tTurn = A('every turn');
  // loop schedule: slow loops from tLoop, then 3 accelerating from tTurn, continue until CF
  const loopEnd = MIRROR_T;
  const loopPhase = (() => {
    if (t < tLoop || t >= loopEnd) return null;
    if (t < tTurn) return ((t - tLoop) / 3.0) % 1;
    const sched = [2.0, 1.5, 1.1];
    let s = tTurn;
    for (const per of sched) {
      if (t < s + per) return (t - s) / per;
      s += per;
    }
    return ((t - s) / 1.1) % 1;
  })();
  const loopTok = loopPhase === null ? null : loopPhase < 0.5 ? ptAt(DC.clOut, loopPhase * 2) : ptAt(DC.clIn, 1 - (loopPhase - 0.5) * 2);
  const aeP = (k: number) => cyc(t, tAE + 2.6, loopEnd, 2.4, k * 0.5);
  // ---------- 3.5 ----------
  const tLeak = A('leaky junctions'), tWater = A('water follows');
  const lumenFill = prog(t, tWater, 3.5);
  // ---------- 3.6 ----------
  const bloodH = t > A('went into the blood') && t < MIRROR_T;
  const tAcid = A('acid tide');
  // ---------- 3.7 CF ----------
  const tDef = A('cftr is defective');
  const cftrGrey = prog(t, tDef, 0.8);
  const trickle = (k: number) => cyc(t, A('less bicarbonate'), B38, 4.5, k * 0.5);
  const clump = prog(t, A('scant thick'), 6);
  const plug = prog(t, A('plugs the small ducts'), 1.2);

  return (
    <Stage>
      {/* ================= 3.1 HCO3 bars ================= */}
      {t < STEP_IN + 1.5 && (
        <An t={t} tw={tw(show(K.firstContent - 0.2, 0.5), fade(STEP_IN - 0.2, 0.6))}>
          <line x1={520} x2={1400} y1={860} y2={860} stroke={C.ink2} strokeWidth={4} />
          <An t={t} tw={show(K.firstContent + 0.8)}>
            <rect x={640} y={860 - 25 * 4} width={200} height={25 * 4} rx={10} fill={C.tealL} stroke={C.teal} strokeWidth={3} />
            <Tx x={740} y={725} size={34} w={800} fill={C.tealD}>
              ~25
            </Tx>
            <Tx x={740} y={905} size={30} w={700} fill={C.ink2}>
              plasma
            </Tx>
          </An>
          <An t={t} tw={show(A('one hundred forty five') - 0.3)}>
            <rect x={1060} y={860 - 145 * 4 * prog(t, A('one hundred forty five') - 0.3, 1.2, E.out)} width={200} height={145 * 4 * prog(t, A('one hundred forty five') - 0.3, 1.2, E.out)} rx={10} fill={C.teal} />
            <Tx x={1160} y={250} size={40} w={800} fill={C.tealD}>
              {String(Math.round(145 * prog(t, A('one hundred forty five') - 0.3, 1.2, E.out)))}
            </Tx>
            <Tx x={1160} y={905} size={30} w={700} fill={C.ink2}>
              pancreatic juice (max)
            </Tx>
          </An>
          <Tx x={960} y={150} size={34} w={700} fill={C.ink}>
            HCO_3_^−^ (mEq/L)
          </Tx>
          <An t={t} tw={pop(A('five times'), 0.6)}>
            <path d="M880,760 L940,760 L940,280 L1030,280" fill="none" stroke={C.ink2} strokeWidth={4} strokeDasharray="10 8" />
            <Tag x={940} y={520} size={40} w={800} fill={C.ink} color="#fff">
              ×5
            </Tag>
          </An>
        </An>
      )}

      {/* ================= duct cell world ================= */}
      {worldOp > 0.001 && (
        <World t={t} base={{ ...CAMB, cs: 0.36, cx: 1150 }} cam={CAMS} op={worldOp}>
          <DuctCell
            t={t}
            cftrGrey={cftrGrey}
            cftrOpen={0}
            a={{
              nbc: pop(tNBC - 0.3),
              nhe: pop(tNHE - 0.1),
              atpase: pop(tATP - 0.1),
              cftr: pop(tCFTR + 0.2),
              ae: pop(tAE - 0.1),
              ca: tw(pop(tCA - 0.15), pulse(tCA + 0.5, 1.35, 0.25, 0.4), pulse(A('enormously'), 1.25, 0.2, 0.3)),
            }}
            sl={{
              under: (
                <>
                  {/* membrane highlights */}
                  <An t={t} tw={tw(show(A('basolateral membrane') - 0.1, 0.4), fade(A('apical membrane') + 1.6, 0.6))}>
                    <rect x={482} y={190} width={36} height={700} rx={18} fill={C.gold} opacity={0.45} filter="url(#glowS)" />
                  </An>
                  <An t={t} tw={tw(show(A('apical membrane') - 0.1, 0.4), fade(A('four steps') + 1.0, 0.6))}>
                    <rect x={1302} y={190} width={36} height={700} rx={18} fill={C.teal} opacity={0.45} filter="url(#glowS)" />
                  </An>
                </>
              ),
              top: (
                <>
                  {/* Na gradient wedge */}
                  <An t={t} tw={tw(show(tGrad, 0.6), fade(B34, 0.6))}>
                    <path d="M340,770 L490,820 L490,900 L340,900 Z" fill={C.gold} opacity={0.35} />
                    <path d="M510,866 L660,894 L660,900 L510,900 Z" fill={C.gold} opacity={0.35} />
                    <Tx x={415} y={750} size={22} w={700} fill="#9B7A1C">
                      Na^+^ high
                    </Tx>
                    <Tx x={585} y={845} size={22} w={700} fill="#9B7A1C">
                      Na^+^ low
                    </Tx>
                  </An>
                  {/* energy line pump -> exchanger */}
                  <An t={t} tw={tw(show(tSpend, 0.4), fade(B34, 0.6))}>
                    <Draw d="M548,628 C600,580 600,520 548,470" p={prog(t, tSpend, 0.9)} stroke={C.gold} strokeWidth={6} strokeDasharray="10 8" />
                    {t > tSpend + 0.9 && (
                      <circle cx={ptAt('M548,628 C600,580 600,520 548,470', ((t - tSpend) * 0.8) % 1)[0]} cy={ptAt('M548,628 C600,580 600,520 548,470', ((t - tSpend) * 0.8) % 1)[1]} r={8} fill={C.gold} />
                    )}
                  </An>
                  {spark > 0 && <circle cx={500} cy={640} r={48 + 18 * spark} fill="none" stroke={C.gold} strokeWidth={5} opacity={spark} />}
                  {/* equation */}
                  <An t={t} tw={tw(fade(B33 - 0.2, 0.6))}>
                    <An t={t} tw={show(tCO2 + 0.3)}>
                      <Tx x={560} y={250} size={34} w={700} anchor="start">
                        CO_2_ + H_2_O
                      </Tx>
                    </An>
                    <An t={t} tw={show(tH2)}>
                      <Arrow d="M770,250 L900,250" color="ink" sw={4} />
                      <Tx x={930} y={250} size={34} w={700} anchor="start">
                        H_2_CO_3_
                      </Tx>
                    </An>
                    <An t={t} tw={show(tCA + 0.3)}>
                      <Tx x={835} y={215} size={18} w={700} fill={C.violet}>
                        carbonic anhydrase
                      </Tx>
                    </An>
                    <An t={t} tw={show(tDis)}>
                      <Arrow d="M1070,250 L1130,250" color="ink" sw={4} />
                      <Tx x={1150} y={250} size={34} w={700} anchor="start">
                        H^+^ + HCO_3_^−^
                      </Tx>
                    </An>
                  </An>
                  <An t={t} tw={tw(slideIn(A('is slow'), 0, 10), fade(tCA, 0.3))}>
                    <Tag x={900} y={430} size={22} fill={C.greyL} color={C.ink2}>
                      slow
                    </Tag>
                  </An>
                  {/* 3.2 tokens */}
                  <Tok k="CO2" p={co2} op={t < tH2 + 1 ? 1 : 1 - prog(t, tH2 + 1, 0.2)} />
                  <Tok k="H2O" p={h2o} op={t < tH2 + 1 ? 1 : 1 - prog(t, tH2 + 1, 0.2)} />
                  {fuseOp > 0 && t < tDis + 0.1 && (
                    <g transform="translate(900,520)">
                      <Ion label="H_2_CO_3_" color="#fff" tc={C.ink} r={24} size={22} />
                    </g>
                  )}
                  {/* fast CA reactions */}
                  {t > tCA + 0.4 &&
                    t < tDis &&
                    [0, 1, 2, 3].map((k) => {
                      const p = cyc(t, tCA + 0.4, tDis, 1.1, k / 4);
                      if (p === null) return null;
                      const pt = ptAt(DC.co2In, 0.4 + 0.6 * p);
                      return <circle key={k} cx={pt[0]} cy={pt[1]} r={9} fill={C.grey} opacity={Math.sin(p * Math.PI)} />;
                    })}
                  <Tok k="H" p={hPos} />
                  <Tok k="HCO3" p={bPos} />
                  <An t={t} tw={tw(show(tOpp, 0.3), fade(B33, 0.4))}>
                    <Arrow d="M760,470 L660,450" color="red" sw={6} />
                    <Arrow d="M1050,560 L1160,575" color="teal" sw={6} />
                  </An>
                  {/* 3.3 */}
                  <Tok k="H" p={hOut1} op={hOut1 ? Math.min(1, (tHL + 2.6 - t) / 0.3) : 0} />
                  {[0, 1].map((k) => {
                    const p = nheP(k);
                    if (p === null) return null;
                    return (
                      <g key={'nhe' + k}>
                        <Tok k="H" p={ptAt(DC.hOut, 0.45 + 0.55 * p)} op={Math.sin(p * Math.PI)} s={0.8} />
                        <Tok k="Na" p={ptAt(DC.naIn, p)} op={Math.sin(p * Math.PI)} s={0.8} />
                      </g>
                    );
                  })}
                  {[0, 1, 2].map((k) => {
                    const p = atpP(k);
                    if (p === null) return null;
                    return (
                      <g key={'atp' + k}>
                        <Tok k="Na" p={ptAt(DC.naOut, p)} op={Math.sin(p * Math.PI)} s={0.75} />
                        {k < 2 && <Tok k="K" p={ptAt(DC.kIn, p)} op={Math.sin(p * Math.PI)} s={0.75} />}
                      </g>
                    );
                  })}
                  {[0, 1].map((k) => {
                    const p = nbcP(k);
                    if (p === null) return null;
                    return (
                      <g key={'nbc' + k}>
                        <Tok k="Na" p={ptAt(DC.nbcIn, p)} op={Math.sin(p * Math.PI)} s={0.7} />
                        <Tok k="HCO3" p={ptAt(DC.nbcIn, Math.max(0, p - 0.12))} op={Math.sin(p * Math.PI)} s={0.7} />
                      </g>
                    );
                  })}
                  {/* 3.4 */}
                  <Tok k="HCO3" p={hcoOut1} op={hcoOut1 ? Math.min(1, (tAE + 2.8 - t) / 0.3) : 0} />
                  {[0, 1].map((k) => {
                    const p = aeP(k);
                    if (p === null || cf) return null;
                    return (
                      <g key={'ae' + k}>
                        <Tok k="HCO3" p={ptAt(DC.hco3Out, 0.2 + 0.8 * p)} op={Math.sin(p * Math.PI)} s={0.8} />
                        <Tok k="Cl" p={ptAt(DC.clIn, p * 0.6)} op={Math.sin(p * Math.PI)} s={0.8} />
                      </g>
                    );
                  })}
                  {t > A('chloride in the lumen') && t < MIRROR_T && (
                    <An t={t} tw={show(A('chloride in the lumen'), 0.5)}>
                      {[
                        [1450, 430],
                        [1560, 470],
                        [1500, 300],
                      ].map(([x, y], i) => (
                        <Tok key={i} k="Cl" p={[x, y + Math.sin(t * 1.5 + i) * 8]} s={0.75} />
                      ))}
                    </An>
                  )}
                  <Tok k="Cl" p={loopTok} />
                  {loopPhase !== null && loopPhase > 0.5 && <Tok k="HCO3" p={ptAt(DC.hco3Out, 0.25 + (loopPhase - 0.5) * 1.5)} op={Math.sin((loopPhase - 0.5) * 2 * Math.PI)} />}
                  <An t={t} tw={tw(show(tTurn, 0.5), fade(B35 + 0.5, 0.5))}>
                    <path d="M1160,500 A62,62 0 1 1 1218,388" fill="none" stroke={C.green} strokeWidth={6} markerEnd="url(#ar-green)" />
                    <Tag x={1010} y={445} size={24} fill={C.greenL} color="#2E7048">
                      Cl^−^ recycling
                    </Tag>
                  </An>
                  {/* 3.5 lumen negativity, paracellular Na, water */}
                  <An t={t} tw={tw(show(B35, 0.5), fade(B36, 0.6))}>
                    {[
                      [1440, 220],
                      [1700, 260],
                      [1580, 420],
                      [1460, 720],
                      [1720, 660],
                      [1600, 880],
                    ].map(([x, y], i) => (
                      <Tx key={i} x={x} y={y} size={54} w={800} fill={C.tealD} op={0.35 + 0.25 * Math.sin(t * 3 + i)}>
                        −
                      </Tx>
                    ))}
                    <Tag x={1600} y={140} size={26} fill={C.tealL} color={C.tealD}>
                      lumen −
                    </Tag>
                  </An>
                  {t > tLeak &&
                    t < B36 + 1 &&
                    [0, 1, 2].map((k) => {
                      const p = cyc(t, tLeak, B36 + 1, 2.4, k / 3);
                      return p === null ? null : <Tok key={'pn' + k} k="Na" p={ptAt(DC.para, p)} op={Math.sin(p * Math.PI)} s={0.8} />;
                    })}
                  <An t={t} tw={tw(show(tLeak, 0.4), fade(B36, 0.5))}>
                    <circle cx={1290} cy={918} r={40} fill="none" stroke={C.gold} strokeWidth={5} />
                    <Tag x={1150} y={1000} size={22} fill={C.goldL} color="#7A5E14">
                      paracellular Na^+^
                    </Tag>
                  </An>
                  {t > tWater &&
                    t < B36 + 1 &&
                    [0, 1, 2, 3, 4].map((k) => {
                      const p = cyc(t, tWater, B36 + 1, 2.0, k / 5);
                      if (p === null) return null;
                      const d = k % 2 ? DC.para : 'M300,800 C700,790 1000,800 1480,760';
                      const pt = ptAt(d, p);
                      return <path key={'w' + k} d={`M${pt[0]},${pt[1] - 14} c-9,11 -10,18 0,22 c10,-4 9,-11 0,-22 z`} fill="#5FA9CF" opacity={Math.sin(p * Math.PI)} />;
                    })}
                  {lumenFill > 0 && t < B36 + 0.5 && (
                    <g opacity={1 - prog(t, B36, 0.5)}>
                      <rect x={1345} y={65} width={510} height={950} rx={58} fill={C.teal} opacity={0.18 * lumenFill} />
                      {[0, 1, 2, 3].map((k) => {
                        const y = 150 + ((((t - tWater) * 90 + k * 220) % 880) + 880) % 880;
                        return <path key={k} d={`M1820,${y} l-18,-18 M1820,${y} l18,-18`} stroke={C.teal} strokeWidth={5} strokeLinecap="round" opacity={0.6 * lumenFill} transform="translate(-20,0)" />;
                      })}
                    </g>
                  )}
                  {/* 3.6 H+ in blood */}
                  {bloodH &&
                    [0, 1, 2, 3, 4].map((k) => {
                      const y = 200 + ((((t - B36) * 60 + k * 160) % 760) + 760) % 760;
                      return <Tok key={'bh' + k} k="H" p={[150 + (k % 2) * 90, y]} op={prog(t, A('went into the blood'), 0.5)} s={0.85} />;
                    })}
                  {/* 3.7 CF */}
                  {cf && (
                    <>
                      <An t={t} tw={pop(tDef + 0.2, 0.5)}>
                        <path d="M1290,330 L1350,390 M1350,330 L1290,390" stroke={C.red} strokeWidth={10} strokeLinecap="round" />
                      </An>
                      {t > tDef && <Tok k="Cl" p={[1240, 380]} op={0.9} />}
                      {[0, 1].map((k) => {
                        const p = trickle(k);
                        return p === null ? null : <Tok key={'tr' + k} k="HCO3" p={ptAt(DC.hco3Out, 0.2 + 0.8 * p)} op={Math.sin(p * Math.PI) * 0.8} s={0.7} />;
                      })}
                      {clump > 0 &&
                        Array.from({ length: 14 }, (_, i) => {
                          const fall = Math.min(1, clump * 1.6 - i * 0.05);
                          if (fall <= 0) return null;
                          const x0 = 1420 + ((i * 53) % 380), y0 = 160 + ((i * 97) % 300);
                          const x1 = 1520 + ((i * 31) % 220), y1 = 800 + ((i * 17) % 120);
                          return <circle key={i} cx={x0 + (x1 - x0) * fall} cy={y0 + (y1 - y0) * fall} r={18 + (i % 3) * 6} fill={C.amber} stroke={C.amberD} strokeWidth={3} opacity={0.85} />;
                        })}
                      {plug > 0 && <path d="M1380,780 C1440,720 1760,720 1830,790 L1830,1000 L1380,1000 Z" fill={C.amberD} opacity={0.75 * plug} />}
                      <An t={t} tw={show(A('plugs the small ducts') + 0.5)}>
                        <Tag x={1600} y={940} size={34} fill="#fff" stroke={C.amberD} color={C.amberD}>
                          plug
                        </Tag>
                      </An>
                    </>
                  )}
                </>
              ),
            }}
          />
        </World>
      )}

      {/* transporter labels (screen space, cam at base during 3.2-3.5) */}
      {t > B32 && t < MIRROR_T && (
        <g>
          <An t={t} tw={tw(slideIn(tNHE + 0.3, -20, 0), fade(B35 - 0.3, 0.5))}>
            <Tag x={655} y={390} size={22} fill="#FBE3D4" color={C.redD}>
              Na^+^/H^+^ exchanger
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(tATP + 0.3, -20, 0), fade(B35 - 0.3, 0.5))}>
            <Tag x={660} y={612} size={22} fill="#FFF1C9" color="#7A5E14">
              Na^+^/K^+^ ATPase
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(tNBC, -20, 0), fade(B35 - 0.3, 0.5))}>
            <Tag x={685} y={300} size={22} fill={C.goldL} color="#7A5E14">
              Na^+^–HCO_3_^−^ co-transport
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(A('secondary active transport'), 0, 20), fade(B34, 0.5))}>
            <Caption x={960} y={1035} size={30} fill={C.goldL} color="#7A5E14" stroke="none">
              secondary active transport
            </Caption>
          </An>
          <An t={t} tw={tw(slideIn(tAE + 0.3, 20, 0), fade(B35 + 2, 0.5))}>
            <Tag x={1555} y={640} size={22} fill="#D7ECF6" color={C.tealD}>
              Cl^−^/HCO_3_^−^ exchanger
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(A('or cftr'), 20, 0), fade(B35 + 2, 0.5))}>
            <Tag x={1540} y={300} size={22} fill={C.greenL} color="#2E7048">
              CFTR (Cl^−^ channel)
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(A('isotonic'), 0, 20), fade(B36, 0.5))}>
            <Caption x={1500} y={1035} size={28} fill={C.tealL} color={C.tealD} stroke="none">
              isotonic NaHCO_3_ solution
            </Caption>
          </An>
          <An t={t} tw={tw(slideIn(tWater, 0, 20), fade(B36, 0.5))}>
            <Caption x={620} y={1035} size={28} fill="#E3F2F8" color={C.tealD} stroke="none">
              H_2_O follows by osmosis
            </Caption>
          </An>
        </g>
      )}
      {/* membrane tags before step one */}
      {t > A('basolateral membrane') && t < B34 + 1 && (
        <>
          <An t={t} tw={tw(show(A('basolateral membrane'), 0.4), fade(B33 - 0.3, 0.6))}>
            <Tag x={420} y={1035} size={24} fill="#fff" stroke={C.gold}>
              basolateral (blood side)
            </Tag>
          </An>
          <An t={t} tw={tw(show(A('apical membrane'), 0.4), fade(B34 - 0.3, 0.6))}>
            <Tag x={1470} y={1035} size={24} fill="#fff" stroke={C.teal}>
              apical (lumen side)
            </Tag>
          </An>
        </>
      )}
      {/* acid tide gauge on the duct cell */}
      {t > tAcid - 0.5 && t < MIRROR_T + 0.5 && (
        <An t={t} tw={tw(slideIn(tAcid - 0.3, 0, 20), fade(MIRROR_T - 0.3, 0.4))}>
          <Card x={360} y={800} w={330} h={250} rx={24} />
          <Gauge x={525} y={950} dev={-0.6 * prog(t, tAcid, 1)} label="pancreatic venous blood" />
          <Tag x={525} y={830} size={24} fill={C.redL} color={C.redD}>
            acid tide
          </Tag>
        </An>
      )}
      {/* step rail */}
      {t > A('four steps') - 0.3 && t < B36 && (
        <An t={t} tw={tw(slideIn(A('four steps') - 0.2, 0, -20), fade(B36 - 0.4, 0.5))}>
          <Card x={420} y={14} w={1080} h={76} rx={38} />
          {steps.map(([lbl, at], i) => {
            const on = prog(t, at - 0.1, 0.4);
            return (
              <g key={i}>
                <g transform={`translate(${470 + i * 265},52)`}>
                  <circle cx={0} cy={0} r={24} fill={mix('#fff', C.teal, on)} stroke={C.teal} strokeWidth={3} />
                  <Tx x={0} y={1} size={26} w={800} fill={mix(C.teal, '#fff', on)}>
                    {String(i + 1)}
                  </Tx>
                </g>
                <Tx x={505 + i * 265} y={52} size={24} w={700} fill={mix(C.greyL, C.ink, on)} anchor="start">
                  {lbl}
                </Tx>
              </g>
            );
          })}
        </An>
      )}

      {/* ================= 3.6 mirror: parietal vs duct ================= */}
      {t > MIRROR_T - 0.5 && t < B37 + 0.5 && <MirrorScene t={t} />}

      {/* ================= 3.7 cystic fibrosis HUD ================= */}
      {cf && t < B38 + 0.5 && (
        <An t={t} tw={tw(show(B37 - 0.4, 0.5), fade(B38 - 0.4, 0.5))}>
          <ClinicalFrame />
          <Tag x={720} y={70} size={30} w={800} fill="#fff" stroke={C.red} color={C.redD}>
            Cystic fibrosis
          </Tag>
          <An t={t} tw={slideIn(tDef + 0.3, 0, -20)}>
            <g transform="translate(960,140)">
              {[
                ['CFTR defect', tDef + 0.3, C.redD],
                ['↓ Cl^−^, HCO_3_^−^, H_2_O', A('less bicarbonate') - 0.3, C.tealD],
                ['thick juice', A('scant thick'), C.amberD],
                ['duct plugs', A('plugs the small ducts'), C.amberD],
              ].map(([s, at, c], i) => (
                <An t={t} tw={show(at as number, 0.4)} key={i}>
                  <Tx x={-640 + i * 400} y={0} size={28} w={800} fill={c as string}>
                    {(i ? '→  ' : '') + (s as string)}
                  </Tx>
                </An>
              ))}
            </g>
          </An>
          {/* acinus inset going fibrotic */}
          <An t={t} tw={slideIn(A('enzymes trapped') - 0.2, 30, 0)}>
            <Card x={1530} y={220} w={360} h={560} rx={26} />
            <Acinus
              t={t}
              cx={1650}
              cy={420}
              R={95}
              id="acg3cf"
              grey={prog(t, A('destroy the gland') + 0.6, 1.6)}
              cellTint={Math.sin(clamp((t - A('enzymes trapped')) / 2.5) * Math.PI) * 0.8}
              a={{ cells: tw(to(A('enzymes trapped') + 0.3, 1.2, { s: 1.08 }), to(A('destroy the gland') + 0.5, 1.4, { s: 0.94 })) }}
              sl={{ duct: <ellipse cx={1820} cy={420} rx={30} ry={14} fill={C.amberD} /> }}
            />
            <Tx x={1710} y={590} size={24} w={700} fill={C.ink2}>
              enzymes trapped
            </Tx>
            <An t={t} tw={show(A('destroy the gland') + 1.2)}>
              <Tag x={1710} y={660} size={26} fill={C.greyL} color={C.ink2}>
                fibrosis
              </Tag>
            </An>
          </An>
          {/* outcome chips */}
          {[
            ['pancreatic insufficiency', A('pancreatic insufficiency'), 520],
            ['steatorrhea', A('digest fat'), 960],
            ['↓ vitamins A D E K', A('a d e and k') - 0.2, 1360],
          ].map(([s, at, x], i) => (
            <An t={t} tw={slideIn(at as number, 0, 30)} key={i}>
              <Tag x={x as number} y={960} size={32} fill={C.redL} color={C.redD} shadow>
                {s as string}
              </Tag>
            </An>
          ))}
        </An>
      )}

      {/* ================= 3.8 flow-rate chart ================= */}
      {t > B38 - 0.5 && t < BOARD_T + 1 && <FlowScene t={t} />}

      {/* ================= 3.9 board ================= */}
      {t > BOARD_T - 0.6 && (
        <An t={t} tw={show(BOARD_T - 0.4, 0.5)}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
          <Board t={t} a={{ ...boardIn(BOARD_T - 0.4), noteT: show(A('carbonic anhydrase', 2) - 0.2, 0.8) }} shown={{ a0: true, a1: true, t0: true, t1: true }} />
          <An t={t} tw={tw(show(A('carbonic anhydrase', 2) - 0.2, 0.4), fade(A('carbonic anhydrase', 2) + 2.5, 0.6))}>
            <rect x={1170} y={318} width={540} height={36} rx={18} fill={C.teal} opacity={0.15} />
          </An>
        </An>
      )}

      <TitleCard t={t} n={3} title="The bicarbonate factory" question="How does one cell produce fluid five times richer in bicarbonate than blood?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

// ---------------------------------------------------------------------------
const MirrorScene: React.FC<{ t: number }> = ({ t }) => {
  const tAlk = A('alkaline tide');
  const tOff = A('tend to offset');
  const merge = prog(t, tOff, 1.6);
  const cyc1 = (k: number) => (((t - MIRROR_T) / 2.2 + k / 2) % 1 + 1) % 1;
  const cell = (x0: number, label: string, fill: string, stroke: string) => (
    <g>
      <rect x={x0} y={260} width={420} height={480} rx={44} fill={fill} stroke={stroke} strokeWidth={9} />
      <Tx x={x0 + 210} y={300} size={28} w={800} fill={stroke}>
        {label}
      </Tx>
    </g>
  );
  const pPar = t > A('parietal cell') ? 1 : 0;
  return (
    <An t={t} tw={tw(show(MIRROR_T - 0.4, 0.5), fade(B37 - 0.4, 0.5))}>
      <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
      {/* left: stomach */}
      <An t={t} tw={slideIn(MIRROR_T, -80, 0, 0.8)}>
        <rect x={70} y={200} width={220} height={600} rx={40} fill="#F7D5D0" stroke={C.pinkD} strokeWidth={3} />
        <Tx x={180} y={840} size={24} w={700} fill={C.pinkD}>
          stomach lumen
        </Tx>
        {cell(310, 'parietal cell', '#FCEDEB', '#C76B62')}
        <rect x={750} y={200} width={170} height={600} rx={80} fill="#F7D9D5" stroke="#D9847C" strokeWidth={3} />
        <Tx x={835} y={840} size={24} w={700} fill="#B5544B">
          blood
        </Tx>
        {pPar > 0 &&
          [0, 1].map((k) => {
            const p = cyc1(k);
            return (
              <g key={k} opacity={Math.sin(p * Math.PI)}>
                <g transform={`translate(${520 - 360 * p},430)`}>{ION.H({})}</g>
                <g transform={`translate(${520 + 315 * p},600)`}>{ION.HCO3({})}</g>
              </g>
            );
          })}
        <Arrow d="M450,470 L230,470" color="red" sw={6} op={0.5} />
        <Arrow d="M600,640 L820,640" color="teal" sw={6} op={0.5} />
      </An>
      {/* right: duct */}
      <An t={t} tw={slideIn(MIRROR_T - 0.3, 80, 0, 0.8)}>
        <rect x={1000} y={200} width={170} height={600} rx={80} fill="#F7D9D5" stroke="#D9847C" strokeWidth={3} />
        <Tx x={1085} y={840} size={24} w={700} fill="#B5544B">
          blood
        </Tx>
        {cell(1190, 'duct cell', '#EEF7FA', C.teal)}
        <rect x={1630} y={200} width={220} height={600} rx={40} fill="#E3F2F8" stroke="#A8D2E3" strokeWidth={3} />
        <Tx x={1740} y={840} size={24} w={700} fill={C.tealD}>
          duct lumen
        </Tx>
        {[0, 1].map((k) => {
          const p = cyc1(k + 0.25);
          return (
            <g key={k} opacity={Math.sin(p * Math.PI)}>
              <g transform={`translate(${1400 - 315 * p},430)`}>{ION.H({})}</g>
              <g transform={`translate(${1400 + 360 * p},600)`}>{ION.HCO3({})}</g>
            </g>
          );
        })}
        <Arrow d="M1320,470 L1100,470" color="red" sw={6} op={0.5} />
        <Arrow d="M1470,640 L1690,640" color="teal" sw={6} op={0.5} />
      </An>
      {/* mirror line */}
      <An t={t} tw={show(A('mirror images') - 0.2, 0.6)}>
        <line x1={960} x2={960} y1={170} y2={880} stroke={C.ink2} strokeWidth={4} strokeDasharray="14 10" />
        <Tag x={960} y={130} size={30} fill={C.ink} color="#fff">
          mirror images
        </Tag>
      </An>
      {/* gauges */}
      <g transform={`translate(${(960 - 790) * merge},0)`} opacity={1 - merge * 0.999}>
        <An t={t} tw={show(A('parietal cell'), 0.5)}>
          <Gauge x={790} y={975} r={60} dev={0.6 * prog(t, tAlk, 1)} />
          <Tx x={560} y={975} size={26} w={800} fill="#3A5FA8">
            Stomach: alkaline tide
          </Tx>
        </An>
      </g>
      <g transform={`translate(${(960 - 1130) * merge},0)`} opacity={1 - merge * 0.999}>
        <Gauge x={1130} y={975} r={60} dev={-0.6} />
        <Tx x={1365} y={975} size={26} w={800} fill={C.red}>
          Pancreas: acid tide
        </Tx>
      </g>
      {merge > 0.6 && (
        <g opacity={prog(t, tOff + 1.0, 0.5)}>
          <Gauge x={960} y={975} r={66} dev={0.08 * Math.sin((t - tOff) * 2) * (1 - prog(t, tOff + 1.5, 2))} />
          <Tx x={1210} y={975} size={26} w={800} fill={C.ink2}>
            over a meal: tend to offset
          </Tx>
        </g>
      )}
    </An>
  );
};

// ---------------------------------------------------------------------------
const CX0 = 170, CX1 = 1050, CY0 = 900, CYS = 4.3; // chart frame
const fx = (f: number) => CX0 + f * (CX1 - CX0);
const fy = (c: number) => CY0 - c * CYS;
const HCO = (f: number) => 28 + 112 * (1 - Math.exp(-3.0 * f));
const curve = (fn: (f: number) => number) =>
  Array.from({ length: 41 }, (_, i) => i / 40)
    .map((f, i) => `${i ? 'L' : 'M'}${fx(f).toFixed(1)},${fy(fn(f)).toFixed(1)}`)
    .join(' ');
const D_NA = curve(() => 152);
const D_K = curve(() => 8);
const D_HCO = curve(HCO);
const D_CL = curve((f) => 155 - HCO(f));

const FlowScene: React.FC<{ t: number }> = ({ t }) => {
  const tSK = A('sodium and potassium');
  const tUp = A('bicarbonate climbs');
  const tDn = A('chloride falls');
  const tSum = A('sum stays constant');
  const tTaps = A('two fluids');
  const tSec = A('by the hormone secretin');
  const open = prog(t, tSec + 0.3, 1.6);
  const cursor = 0.15 + 0.7 * open;
  const glass = mix(C.green, C.teal, open);
  return (
    <An t={t} tw={tw(show(B38 - 0.4, 0.5), fade(BOARD_T - 0.4, 0.5))}>
      <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
      {/* axes */}
      <An t={t} tw={show(A('flow rate') - 0.3, 0.6)}>
        <path d={`M${CX0},180 L${CX0},${CY0} L${CX1 + 40},${CY0}`} fill="none" stroke={C.ink2} strokeWidth={4} />
        {[0, 50, 100, 150].map((c) => (
          <g key={c}>
            <line x1={CX0 - 10} x2={CX0} y1={fy(c)} y2={fy(c)} stroke={C.ink2} strokeWidth={3} />
            <Tx x={CX0 - 20} y={fy(c)} size={20} w={600} fill={C.ink2} anchor="end">
              {String(c)}
            </Tx>
          </g>
        ))}
        <Tx x={(CX0 + CX1) / 2} y={CY0 + 50} size={26} w={700} fill={C.ink2}>
          flow rate →
        </Tx>
        <Tx x={CX0} y={150} size={24} w={700} fill={C.ink2} anchor="start">
          concentration (mEq/L)
        </Tx>
      </An>
      <Draw d={D_NA} p={prog(t, tSK, 1.4)} stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
      <Draw d={D_K} p={prog(t, tSK + 0.3, 1.4)} stroke={C.lilac} strokeWidth={7} strokeLinecap="round" />
      <Draw d={D_HCO} p={prog(t, tUp - 0.2, 1.6)} stroke={C.teal} strokeWidth={8} strokeLinecap="round" />
      <Draw d={D_CL} p={prog(t, tDn - 0.2, 1.6)} stroke={C.green} strokeWidth={8} strokeLinecap="round" />
      <An t={t} tw={show(tSK + 1.0)}>
        <Tx x={CX1 + 50} y={fy(152)} size={26} w={800} fill="#9B7A1C" anchor="start">
          Na^+^
        </Tx>
        <Tx x={CX1 + 50} y={fy(8)} size={26} w={800} fill={C.lilac} anchor="start">
          K^+^
        </Tx>
      </An>
      <An t={t} tw={show(tUp + 1.0)}>
        <Tx x={CX1 + 50} y={fy(HCO(1)) - 6} size={26} w={800} fill={C.tealD} anchor="start">
          HCO_3_^−^
        </Tx>
      </An>
      <An t={t} tw={show(tDn + 1.0)}>
        <Tx x={CX1 + 50} y={fy(155 - HCO(1)) + 6} size={26} w={800} fill="#2E7048" anchor="start">
          Cl^−^
        </Tx>
      </An>
      <An t={t} tw={slideIn(tSK + 1.2, 0, -20)}>
        <Tag x={610} y={110} size={24} fill="#fff" stroke={C.greyL}>
          Na^+^, K^+^ ≈ constant
        </Tag>
      </An>
      <An t={t} tw={slideIn(A('as flow rises'), 0, 20)}>
        <Tag x={610} y={990} size={26} fill="#fff" stroke={C.greyL}>
          ↑ flow → ↑ HCO_3_^−^, ↓ Cl^−^
        </Tag>
      </An>
      {/* sum bracket at a sample flow */}
      <An t={t} tw={show(tSum, 0.5)}>
        <line x1={fx(0.6)} x2={fx(0.6)} y1={fy(HCO(0.6))} y2={fy(0)} stroke={C.teal} strokeWidth={10} opacity={0.6} />
        <line x1={fx(0.6) + 14} x2={fx(0.6) + 14} y1={fy(155 - HCO(0.6))} y2={fy(0)} stroke={C.green} strokeWidth={10} opacity={0.6} />
        <path d={`M${fx(0.6) + 36},${fy(155)} l14,0 l0,${155 * CYS} l-14,0`} fill="none" stroke={C.ink} strokeWidth={3} />
        <Tag x={fx(0.6) + 210} y={fy(78)} size={22} fill={C.ink} color="#fff">
          HCO_3_^−^ + Cl^−^ ≈ constant
        </Tag>
        <Tx x={fx(0.6) + 210} y={fy(78) + 40} size={22} w={600} fill={C.ink2}>
          → isotonic
        </Tx>
      </An>
      {/* cursor */}
      <An t={t} tw={show(tSec, 0.4)}>
        <line x1={fx(cursor)} x2={fx(cursor)} y1={190} y2={CY0} stroke={C.ink} strokeWidth={3} strokeDasharray="8 6" />
        <circle cx={fx(cursor)} cy={fy(HCO(cursor))} r={10} fill={C.teal} stroke="#fff" strokeWidth={3} />
        <circle cx={fx(cursor)} cy={fy(155 - HCO(cursor))} r={10} fill={C.green} stroke="#fff" strokeWidth={3} />
      </An>
      {/* two taps */}
      <An t={t} tw={slideIn(tTaps, 40, 0)}>
        <Card x={1300} y={150} w={570} h={800} rx={30} />
        {/* acinar tap (small) */}
        <rect x={1360} y={230} width={140} height={44} rx={12} fill={C.greenL} stroke={C.green} strokeWidth={4} />
        <rect x={1460} y={274} width={30} height={40} fill={C.greenL} stroke={C.green} strokeWidth={4} />
        <An t={t} tw={show(A('acinar secretion'))}>
          <rect x={1471} y={318} width={8} height={330} fill={C.green} opacity={0.7} />
          <Tx x={1430} y={205} size={22} w={700} fill="#2E7048">
            acinar: plasma-like, Cl^−^-rich
          </Tx>
        </An>
        {/* duct tap (large) */}
        <rect x={1620} y={230} width={200} height={56} rx={14} fill={C.tealL} stroke={C.teal} strokeWidth={4} />
        <rect x={1640} y={286} width={44} height={46} fill={C.tealL} stroke={C.teal} strokeWidth={4} />
        <An t={t} tw={show(A('ductal secretion'))}>
          <rect x={1662 - 6 - 12 * open} y={336} width={12 + 24 * open} height={312} fill={C.teal} opacity={0.75} />
          <Tx x={1745} y={205} size={22} w={700} fill={C.tealD}>
            ductal: HCO_3_^−^-rich
          </Tx>
        </An>
        {/* glass */}
        <defs>
          <clipPath id="glassclip">
            <path d="M1420,640 L1720,640 L1690,900 L1450,900 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#glassclip)">
          <rect x={1400} y={900 - 200 * Math.min(1, prog(t, tTaps + 0.5, 3) + 0.2)} width={340} height={260} fill={glass} opacity={0.55} />
        </g>
        <path d="M1420,640 L1720,640 L1690,900 L1450,900 Z" fill="none" stroke={C.ink2} strokeWidth={5} />
        {/* secretin */}
        <An t={t} tw={pop(tSec - 0.1, 0.6)}>
          <Hex x={1800} y={420} r={40} fill={C.teal} label="S" size={30} />
          <Tx x={1800} y={490} size={22} w={700} fill={C.tealD}>
            secretin
          </Tx>
          <Arrow d="M1770,400 C1740,360 1720,330 1700,300" color="teal" sw={5} />
        </An>
        <An t={t} tw={show(A('at low flow'))}>
          <Tx x={1570} y={930} size={22} w={600} fill={C.ink2}>
            {open < 0.5 ? 'low flow: more Cl^−^' : 'high flow: ductal fluid dominates'}
          </Tx>
        </An>
      </An>
    </An>
  );
};

void [Card, StepBadge, move, Hex];
