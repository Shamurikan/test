// Chapter 9 — One meal, start to finish
import React from 'react';
import { An, Card, Draw, P, pol, ptAt, Tag, Tx } from '../lib/prims';
import { Acinus, acinusGeom, Board, boardIn, BOARD, Bolt, CBD_D, DUO_D, Enzyme, GutMap, Hex, Key, PDUCT_D, PhStrip, STOM_D, TitleCard } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, pop, prog, pulse, show, slideIn, to, tw, v } from '../lib/anim';
import { anchors, silence } from '../lib/timeline';
import { Stage, useChapterT, World } from '../lib/scene';

const K = anchors(9);
const { A } = K;
const [c0, c1] = K.span;
const B92 = A('then the first squirt');
const B93 = A('in the duodenum bicarbonate');
const B94 = A('two factories');
const ENDCARD = A('understand that partnership') + 0.6;
const B95 = A('before you go');
const HOLDS = [silence('q1-hold'), silence('q2-hold'), silence('q3-hold')];
const [TAIL0] = silence('tail');
const CAMB = { cx: 1000, cy: 600, cs: 0.92 };
const DUO_FIRST = 'M885,602 C820,600 760,598 722,610 C684,622 668,650 668,700 L668,820';
const cyc = (t: number, a: number, b: number, per: number, off = 0) => (t < a || t >= b ? null : (((t - a) / per + off) % 1 + 1) % 1);
const VAGUS_D = 'M1180,-260 C1170,0 1210,250 1180,420 C1160,520 1140,600 1130,680';

export const Ch9: React.FC = () => {
  const t = useChapterT(9);
  const mapOn = t < B94 + 0.5;
  return (
    <Stage>
      {mapOn && <MealScene t={t} />}
      {t > B94 - 0.6 && t < B95 + 1 && <WholeBoard t={t} />}
      {t > ENDCARD - 0.5 && t < A('what are the three') && <EndCard t={t} />}
      {t > B95 - 0.5 && <Questions t={t} />}
      {/* fade to black */}
      <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={prog(t, TAIL0 + 0.2, 2.4)} />
      <TitleCard t={t} n={9} title="One meal, start to finish" question="What happens in the pancreas, step by step, when you eat?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

// ---------------------------------------------------------------------------
const MealScene: React.FC<{ t: number }> = ({ t }) => {
  const tSmell = A('smell dinner');
  const tACh = A('acetylcholine');
  const tWait = A('the enzymes wait');
  const tStretch = A('stomach stretches');
  const tChyme = A('acidic chyme');
  const tSec = A('releases secretin');
  const tCl = A('chloride channels');
  const tWash = A('washing the stored');
  const tCCK = A('release cck');
  const tGB = A('the gallbladder contracts');
  const tOddi = A('sphincter of oddi opens');
  const tPot = A('potentiate one another');
  const tPH = A('ph rises');
  const tKey = A('enteropeptidase');
  const tApart = A('taken apart');
  const tSlow = A('stomach is slowed');
  const tDown = A('winds down');
  // playhead 0..1 along timeline: cephalic 0-0.2, gastric 0.2-0.33, intestinal 0.33-1
  const play = v(t, 0, [tSmell, 1.5, 0.1], [tStretch - 0.3, 1.2, 0.26], [tChyme - 0.3, 1.2, 0.45], [B93, 20, 0.95, E.lin]);
  const pile = prog(t, tACh + 0.8, 4);
  const flood = prog(t, tWash - 0.3, 2.2);
  const gb = 1 - 0.18 * Math.sin(clamp((t - tGB) / 1.2) * Math.PI);
  const oddiR = 15 + 9 * prog(t, tOddi, 0.8);
  const pyl = 10 + 14 * prog(t, tSlow, 0.8);
  const down = prog(t, tDown, 2.0);
  const ph = v(t, 6.5, [tChyme, 1.2, 2.2], [tPH - 0.3, 2.0, 7.5]);
  const stretch = 1 + 0.07 * Math.sin(clamp((t - tStretch) / 2) * Math.PI);
  const ag = acinusGeom(1580, 300, 95);
  const potPulse = Math.sin(clamp((t - tPot) / 1.2) * Math.PI);
  return (
    <An t={t} tw={tw(show(K.firstContent - 0.3, 0.5), fade(B94 - 0.4, 0.5))}>
      <g opacity={1 - 0.45 * down}>
        <World t={t} base={CAMB}>
          <GutMap
            t={t}
            gbScale={gb}
            oddiR={oddiR}
            pylorusW={pyl}
            a={{ oddi: show(tOddi - 0.3, 0.4), stom: tw(to(tStretch, 1.0, { s: 1.06 }), to(tStretch + 1.2, 1.0, { s: 1 })) }}
            sl={{
              overStom: <path d={STOM_D} fill={C.red} opacity={0.25 * prog(t, tStretch + 1, 2) * (1 - prog(t, tPH, 2))} />,
              overPanc: (
                <>
                  {t > tWash - 0.3 && <Draw d={PDUCT_D} p={flood} stroke={C.teal} strokeWidth={12} strokeLinecap="round" opacity={0.7 * (1 - down)} />}
                  {t > tWash &&
                    [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
                      const p = cyc(t, tWash, tDown + 1, 1.6, k / 8);
                      if (p === null) return null;
                      const [x, y] = ptAt(PDUCT_D, p);
                      return <circle key={k} cx={x} cy={y} r={8} fill={k % 2 ? C.amber : C.teal} stroke="#fff" strokeWidth={2} opacity={1 - down} />;
                    })}
                </>
              ),
              overDuo: (
                <>
                  <Draw d={DUO_FIRST} p={prog(t, tChyme, 1.8)} stroke={mix(C.red, '#D9C3AE', prog(t, tPH - 0.3, 2))} strokeWidth={40} strokeLinecap="round" opacity={0.42 * (1 - down)} />
                  {t > tGB &&
                    [0, 1, 2, 3, 4].map((k) => {
                      const p = cyc(t, tGB + 0.2, tDown + 1, 1.6, k / 5);
                      if (p === null) return null;
                      const [x, y] = ptAt(CBD_D, 0.3 + 0.7 * p);
                      return <circle key={k} cx={x} cy={y} r={7} fill={C.olive} stroke="#fff" strokeWidth={2} opacity={1 - down} />;
                    })}
                </>
              ),
              top: (
                <>
                  <Draw d={VAGUS_D} p={prog(t, tACh - 0.4, 1.0)} stroke={C.violet} strokeWidth={10} strokeLinecap="round" opacity={1 - 0.7 * prog(t, tChyme, 1)} />
                  {t > tACh &&
                    [0, 1].map((k) => {
                      const p = cyc(t, tACh + 0.6, tChyme + 4, 1.4, k / 2);
                      if (p === null) return null;
                      const [x, y] = ptAt(VAGUS_D, p);
                      return <circle key={k} cx={x} cy={y} r={14} fill="#fff" stroke={C.violet} strokeWidth={5} />;
                    })}
                  {/* secretin + CCK rising from the duodenum */}
                  {t > tSec &&
                    [0, 1, 2].map((k) => {
                      const p = cyc(t, tSec, tDown, 2.0, k / 3);
                      if (p === null) return null;
                      const [x, y] = ptAt('M760,880 C900,860 1050,780 1150,690', p);
                      return <Hex key={'s' + k} x={x} y={y} r={14} fill={C.teal} />;
                    })}
                  {t > tCCK &&
                    [0, 1, 2].map((k) => {
                      const p = cyc(t, tCCK, tDown, 2.0, k / 3);
                      if (p === null) return null;
                      const [x, y] = ptAt(k === 0 ? 'M760,880 C700,700 640,560 640,470' : 'M760,880 C900,840 1000,760 1050,700', p);
                      return <Hex key={'c' + k} x={x} y={y} r={14} fill={C.amber} />;
                    })}
                </>
              ),
            }}
          />
        </World>
        {/* steaming plate */}
        <An t={t} tw={tw(pop(tSmell - 0.2, 0.6), fade(tChyme, 0.5))}>
          <ellipse cx={260} cy={300} rx={130} ry={40} fill="#fff" stroke={C.greyL} strokeWidth={5} />
          <ellipse cx={260} cy={290} rx={80} ry={22} fill="#C9744F" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${220 + i * 40},${250 - ((t * 30) % 30)} q12,-20 0,-40 q-12,-20 0,-40`} fill="none" stroke={C.grey} strokeWidth={4} opacity={0.6} />
          ))}
          <Tx x={260} y={380} size={24} w={700} fill={C.ink2}>
            smell, sight, taste
          </Tx>
        </An>
        {/* acinus inset */}
        <Card x={1420} y={150} w={460} h={330} rx={26} />
        <Acinus t={t} cx={1580} cy={300} R={95} id="acg9" cellTint={0.3} sl={{ duct: flood > 0 ? <rect x={1580} y={300 - 14} width={(ag.dx1 - 1580) * flood} height={28} fill={C.teal} opacity={0.7} /> : null }} />
        {Array.from({ length: Math.floor(16 * pile) }, (_, i) => {
          const fx = flood * (300 + i * 18);
          const x = 1590 + (i % 5) * 16 + fx, y = 290 + Math.floor(i / 5) * 13 - 10;
          return <circle key={i} cx={Math.min(x, 1870)} cy={y} r={6} fill={C.amber} stroke={C.amberD} strokeWidth={1.5} opacity={1 - clamp((x - 1830) / 60)} />;
        })}
        <Tx x={1650} y={445} size={22} w={700} fill={C.ink2}>
          {flood > 0.1 ? 'flushed out by HCO_3_^−^ fluid' : t > tWait ? 'enzymes wait (little fluid)' : 'acinus'}
        </Tx>
        {/* duct-cell inset with CFTR opening */}
        <An t={t} tw={tw(slideIn(tCl - 0.3, 30, 0), fade(tWash + 2.5, 0.5))}>
          <Card x={1420} y={510} w={460} h={300} rx={26} />
          <rect x={1480} y={560} width={260} height={200} rx={30} fill="#EEF7FA" stroke={C.teal} strokeWidth={6} />
          <rect x={1730} y={560} width={110} height={200} rx={20} fill="#E3F2F8" />
          <rect x={1726 - 6 * prog(t, tCl, 0.6)} y={610} width={12 + 12 * prog(t, tCl, 0.6)} height={50} rx={6} fill={C.green} />
          {[0, 1, 2].map((k) => {
            const p = cyc(t, tCl + 0.4, tWash + 3, 0.9, k / 3);
            return p === null ? null : <circle key={k} cx={1700 + p * 120} cy={700 - k * 20} r={10} fill={C.teal} opacity={Math.sin(p * Math.PI)} />;
          })}
          <Tx x={1610} y={600} size={20} w={700} fill={C.tealD}>
            cAMP → CFTR opens
          </Tx>
          <Tx x={1650} y={790} size={20} w={700} fill={C.tealD}>
            HCO_3_^−^ flood
          </Tx>
        </An>
        {/* signal icons */}
        <g>
          {[
            ['ACh', tACh, C.violet],
            ['secretin', tSec, C.teal],
            ['CCK', tCCK, C.amber],
          ].map(([l, at, col], i) => (
            <An t={t} tw={pop(at as number, 0.5)} key={i}>
              <g transform={`translate(${120 + i * 150},${470}) scale(${1 + 0.25 * potPulse})`}>
                {i === 0 ? <Bolt x={0} y={0} s={1.1} /> : <Hex x={0} y={0} r={30} fill={col as string} label={i === 1 ? 'S' : 'CCK'} size={i === 1 ? 22 : 14} />}
              </g>
              <Tx x={120 + i * 150} y={525} size={20} w={700} fill={col as string}>
                {l as string}
              </Tx>
            </An>
          ))}
          <An t={t} tw={tw(slideIn(tPot + 0.3, 0, 10), fade(B93 + 3, 0.5))}>
            <Tag x={270} y={580} size={24} fill={C.violet} color="#fff">
              potentiation
            </Tag>
          </An>
        </g>
        {/* captions */}
        <An t={t} tw={tw(slideIn(tCl + 0.2, 0, 20), fade(B93, 0.5))}>
          <Tag x={760} y={140} size={26} fill={C.tealL} color={C.tealD}>
            secretin → cAMP → CFTR → HCO_3_^−^ flood
          </Tag>
        </An>
        <An t={t} tw={tw(slideIn(tCCK + 0.2, 0, 20), fade(B93, 0.5))}>
          <Tag x={760} y={200} size={26} fill={C.amberL} color={C.amberD}>
            CCK → enzymes + bile
          </Tag>
        </An>
      </g>
      {/* pH + unlocking + nutrients (9.3) */}
      <An t={t} tw={tw(slideIn(tChyme - 0.2, 0, 30), fade(tDown + 1.5, 0.6))}>
        <PhStrip x={180} y={985} w={520} value={ph} id="ph9" card />
      </An>
      <An t={t} tw={tw(slideIn(tKey - 0.3, 0, 30), fade(tDown, 0.6))}>
        <Card x={820} y={880} w={560} h={170} rx={26} />
        <Key x={900} y={960} s={0.9} r={180 * prog(t, tKey + 0.3, 0.6)} />
        {[0, 1, 2, 3, 4].map((k) => {
          const on = prog(t, tKey + 0.8 + k * 0.25, 0.4);
          return <Enzyme key={k} x={1010 + k * 78} y={960} r={24} active={on} lock={on < 0.5} lockOpen={on} />;
        })}
        <Tx x={1100} y={1025} size={20} w={700} fill={C.ink2}>
          enteropeptidase → trypsin → all zymogens
        </Tx>
      </An>
      <An t={t} tw={tw(slideIn(tApart - 0.6, 0, 30), fade(tDown, 0.6))}>
        <Card x={1420} y={840} w={460} h={210} rx={26} />
        {['protein', 'starch', 'fat', 'DNA'].map((s, i) => {
          const sp = prog(t, tApart - 0.2 + i * 0.15, 0.6, E.out) * 10;
          const x = 1490 + i * 108, y = 930;
          return (
            <g key={s}>
              {i === 0 && [0, 1, 2, 3].map((b) => <circle key={b} cx={x - 18 + b * 12 + (b < 2 ? -sp : sp)} cy={y} r={7} fill={['#E07A5F', '#81B29A', '#F2CC8F', '#3D85C6'][b]} stroke={C.ink} strokeWidth={1.5} />)}
              {i === 1 && [0, 1, 2].map((b) => <polygon key={b} points={P([0, 60, 120, 180, 240, 300].map((a) => pol(x - 18 + b * 18 + (b === 0 ? -sp : b === 2 ? sp : 0), y, 9, a + 30)))} fill="#F6E2A8" stroke="#B08B2E" strokeWidth={2} />)}
              {i === 2 && [[-1, -1], [1, -1], [0, 1]].map(([a, b], j) => <circle key={j} cx={x + a * (7 + sp)} cy={y + b * (6 + sp * 0.6)} r={sp > 0.5 ? 8 : 14 - j * 3} fill="#F7E08A" stroke="#C9A93A" strokeWidth={2} />)}
              {i === 3 && (
                <g>
                  <path d={`M${x - 24},${y - sp} q6,-11 12,0 t12,0 t12,0 t12,0`} fill="none" stroke={C.violet} strokeWidth={3.5} />
                  <path d={`M${x - 24},${y + sp} q6,11 12,0 t12,0 t12,0 t12,0`} fill="none" stroke={C.teal} strokeWidth={3.5} />
                </g>
              )}
              <Tx x={x} y={985} size={18} w={700} fill={C.ink2}>
                {s}
              </Tx>
            </g>
          );
        })}
        <Tx x={1650} y={1025} size={20} w={700} fill={C.amberD}>
          taken apart
        </Tx>
      </An>
      <An t={t} tw={tw(slideIn(tSlow, 0, -20), fade(B94 - 0.5, 0.4))}>
        <Tag x={760} y={140} size={26} fill="#fff" stroke={C.greyL}>
          stomach slowed
        </Tag>
      </An>
      <An t={t} tw={tw(slideIn(tDown, 0, -20), fade(B94 - 0.5, 0.4))}>
        <Tag x={760} y={200} size={26} fill={C.greyL} color={C.ink2}>
          stimuli fade → secretion stops
        </Tag>
      </An>
      {/* phase timeline with playhead */}
      <g>
        <Card x={20} y={18} w={1100} h={90} rx={30} />
        {[
          ['Cephalic ~20%', 0, 0.2, C.violet],
          ['Gastric 5–10%', 0.2, 0.33, C.violet],
          ['Intestinal 70–75%', 0.33, 1, C.teal],
        ].map(([l, a, b, col], i) => {
          const x0 = 60 + (a as number) * 1020, x1 = 60 + (b as number) * 1020;
          const on = play >= (a as number) + 0.01;
          return (
            <g key={i}>
              <rect x={x0 + 3} y={48} width={x1 - x0 - 6} height={30} rx={12} fill={on ? (col as string) : C.greyL} opacity={on ? 0.85 : 1} />
              <Tx x={(x0 + x1) / 2} y={64} size={i < 2 ? 16 : 20} w={800} fill={on ? '#fff' : C.ink2}>
                {l as string}
              </Tx>
            </g>
          );
        })}
        <g transform={`translate(${60 + play * 1020},0)`}>
          <path d="M0,40 L-10,26 L10,26 Z" fill={C.ink} />
          <line x1={0} x2={0} y1={40} y2={86} stroke={C.ink} strokeWidth={3} />
        </g>
      </g>
    </An>
  );
};

// ---------------------------------------------------------------------------
const WholeBoard: React.FC<{ t: number }> = ({ t }) => {
  const rowsAt: [number[], number][] = [
    [[0], A('two products')],
    [[2, 3], A('two signals')],
    [[4], A('two messengers')],
    [[5], A('two ways to fail')],
  ];
  const { top, rh } = BOARD;
  const push = 1 + 0.04 * prog(t, B94, 18, E.sine);
  const soft = prog(t, ENDCARD - 0.4, 0.6);
  return (
    <An t={t} tw={tw(show(B94 - 0.4, 0.5), fade(A('what are the three') - 0.4, 0.5))}>
      <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
      <g transform={`translate(960,540) scale(${push}) translate(-960,-540)`} opacity={1 - 0.75 * soft}>
        <Board
          t={t}
          a={{
            ...boardIn(B94 - 0.4),
            headA: tw(show(B94 - 0.2, 0.35), pulse(B94 + 0.1, 1.08)),
            headT: tw(show(B94 - 0.2, 0.35), pulse(B94 + 0.1, 1.08)),
            pot: tw(pulse(A('partnership') - 0.1, 1.15)),
          }}
          shown={{ a0: true, a1: true, a2: true, a3: true, a4: true, a5: true, t0: true, t1: true, t2: true, t3: true, t4: true, t5: true, noteA: true, noteT: true, warnA: true, warnT: true, pot: true }}
          hl={
            <>
              {rowsAt.map(([rows, at], k) =>
                rows.map((r) => {
                  const o = Math.sin(clamp((t - at + 0.1) / 2.2) * Math.PI);
                  return o > 0.01 ? <rect key={`${k}-${r}`} x={170} y={top + r * rh + 6} width={1580} height={rh - 14} rx={20} fill={C.gold} opacity={0.22 * o} /> : null;
                }),
              )}
            </>
          }
        />
      </g>
    </An>
  );
};

const OBJECTIVES = [
  'Functional anatomy of the pancreas',
  'Components of pancreatic juice and their roles',
  'Cellular mechanism of bicarbonate secretion',
  'Activation of pancreatic digestive enzymes',
  'Cellular mechanism of enzyme secretion',
  'Hormonal and neural regulation of secretion',
  'Potentiation of the secretory response',
];
const EndCard: React.FC<{ t: number }> = ({ t }) => (
  <An t={t} tw={tw(slideIn(ENDCARD - 0.3, 0, 30, 0.7), fade(A('what are the three') - 0.5, 0.5))}>
    <Card x={460} y={130} w={1000} h={820} rx={36} />
    <Tx x={960} y={210} size={38} w={800}>
      What you can now explain
    </Tx>
    {OBJECTIVES.map((o, i) => {
      const tick = prog(t, ENDCARD + 0.2 + i * 0.32, 0.35, E.back);
      return (
        <g key={i}>
          <circle cx={560} cy={300 + i * 90} r={24} fill={mix('#fff', C.green, Math.min(1, tick))} stroke={C.green} strokeWidth={3} />
          {tick > 0.05 && <path d={`M548,${300 + i * 90} l8,9 l16,-18`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
          <Tx x={610} y={300 + i * 90} size={30} w={600} anchor="start">
            {o}
          </Tx>
        </g>
      );
    })}
  </An>
);

// ---------------------------------------------------------------------------
const QS = [
  {
    q: 'What are the three phases of pancreatic secretion, and roughly how much does each contribute?',
    a: ['Cephalic ~20% · gastric 5–10% · intestinal 70–75%'],
    at: 'what are the three',
  },
  {
    q: 'What is the multiplicative, or potentiation, effect?',
    a: ['Together, ACh, CCK and secretin produce far more', 'than the sum of their separate effects.'],
    at: 'what is the multiplicative',
  },
  {
    q: 'Why does a blocked pancreatic duct lead to the pancreas digesting itself?',
    a: ['Enzymes pool, trypsin inhibitor is overwhelmed,', 'and trypsin activates the whole cascade.'],
    at: 'and why does a blocked',
  },
];
const wrap = (s: string, n: number) => {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > n) {
      lines.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
};
const Questions: React.FC<{ t: number }> = ({ t }) => (
  <An t={t} tw={show(B95 - 0.3, 0.5)}>
    <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
    <An t={t} tw={tw(slideIn(B95, 0, 20), fade(A('what are the three') - 0.4, 0.4))}>
      <Tx x={960} y={470} size={64} w={800}>
        Check yourself
      </Tx>
      <Tx x={960} y={560} size={32} w={500} fill={C.ink2} italic>
        Pause after each question and answer it out loud.
      </Tx>
    </An>
    {QS.map((q, i) => {
      const t0 = A(q.at) - 0.2;
      const [h0, h1] = HOLDS[i];
      const t1 = i < 2 ? A(QS[i + 1].at) - 0.4 : 1e9;
      const ansT = h0 + 4.0;
      const ring = prog(t, h0, h1 - h0, E.lin);
      const lines = wrap(q.q, 44);
      return (
        <An t={t} tw={tw(slideIn(t0, 60, 0, 0.6), fade(t1, 0.4))} key={i}>
          <Card x={260} y={170} w={1400} h={740} rx={40} stroke={i === 0 ? C.violet : i === 1 ? C.violet : C.amber} sw={5} />
          <Tag x={960} y={250} size={28} fill={C.ink} color="#fff">
            {`Question ${i + 1} of 3`}
          </Tag>
          {lines.map((l, k) => (
            <Tx key={k} x={960} y={380 + k * 66} size={50} w={800}>
              {l}
            </Tx>
          ))}
          {/* pause ring */}
          {t > h0 && t < h1 + 0.3 && (
            <g opacity={1 - prog(t, ansT - 0.3, 0.4) * 0.6}>
              <circle cx={960} cy={640} r={46} fill="none" stroke={C.greyL} strokeWidth={8} />
              <path
                d={`M960,594 A46,46 0 ${ring > 0.5 ? 1 : 0} 1 ${960 + 46 * Math.sin(ring * 2 * Math.PI - 1e-4)},${640 - 46 * Math.cos(ring * 2 * Math.PI - 1e-4)}`}
                fill="none"
                stroke={C.teal}
                strokeWidth={8}
                strokeLinecap="round"
              />
              <Tx x={960} y={720} size={24} w={600} fill={C.ink2}>
                pause and answer
              </Tx>
            </g>
          )}
          <An t={t} tw={slideIn(ansT, 0, 20, 0.6)}>
            <rect x={360} y={760} width={1200} height={120} rx={24} fill={C.greenL} />
            {q.a.map((l, k) => (
              <Tx key={k} x={960} y={(q.a.length === 1 ? 820 : 795) + k * 46} size={32} w={600} fill="#24543A">
                {l}
              </Tx>
            ))}
          </An>
        </An>
      );
    })}
  </An>
);

void [c1, CBD_D];
