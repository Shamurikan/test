// Chapter 0 — Cold open (port of the approved ch0.js)
import React from 'react';
import { An, Card, Draw, P, pol, ptAt, Tx } from '../lib/prims';
import { Board, BOARD_ROWS, Caption, GutMap, LockIcon, PhStrip, DUO_D, PANC_D, STOM_D } from '../lib/components';
import { C } from '../lib/colors';
import { E, fade, hidden, mix, move, pop, prog, pulse, scaleTo, show, slideIn, to, tw, v, win } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { cam, Stage, useChapterT, World } from '../lib/scene';

const K = anchors(0);
const { A } = K;
const [, c1] = K.span;
const T2 = A('at the same moment');
const T3 = A('so the pancreas');
const T4 = A('two factories');
const MX = (i: number) => [1415, 1695, 1415, 1695][i];
const MY = (i: number) => [622, 622, 800, 800][i];
const MOLT = [A('proteins'), A('starches'), A('fats'), A('dna')];
const SRC = [772, 607];
const SPARK_P = [0, 1, 2, 3].map((i) => `M${SRC[0]},${SRC[1]} C${950 + i * 40},${300 - i * 20} ${MX(i) - 200},${MY(i) - 260} ${MX(i)},${MY(i) - 40}`);
const BACK_P = `M${MX(0)},${MY(0) - 40} C1150,520 950,690 ${SRC[0] + 10},${SRC[1] + 8}`;
const SP0 = A('powerful'), SP1 = A('even dna') + 1.2;

export const Ch0: React.FC = () => {
  const t = useChapterT(0);
  const snipL = (tt: number) => tw(move(tt, 0.5, -14, -6, E.out), to(tt, 0.5, { r: -14 }));
  const snipR = (tt: number) => tw(move(tt, 0.5, 14, 6, E.out), to(tt, 0.5, { r: 14 }));
  const glowO = v(t, 0, [A('gland'), 0.8, 0.75], [T2, 0.6, 0]);
  const redGlowO = v(t, 0, [A('makes them'), 0.5, 0.55], [T2, 0.6, 0]);
  const phVal = v(t, 2, [A('with a ph') - 0.25, 0.01, 7], [A('with a ph') + 0.15, 0.75, 2]);
  const ph2Val = v(t, 2, [A('neutralize') + 0.1, 1.6, 8]);
  const eroO = t >= A('intestinal lining') && t < T3 + 0.2 ? 0.25 + 0.35 * (0.5 + 0.5 * Math.sin((t - A('intestinal lining')) * 7)) : 0;
  const enzP = prog(t, A('cannot work'), 0.7);
  const bolusP = prog(t, A('acid') + 0.2, 3.2) * 0.4;
  const bsP = prog(t, A('gland', 2) - 0.2, 0.9, E.in);
  const tw4 = A('one at a time');

  return (
    <Stage>
      <World t={t} base={{ cx: 1250, cy: 470, cs: 0.5 }} cam={[cam(A('soft'), 3.2, 1400, 600, 0.75), cam(T2 - 0.3, 2.0, 1000, 640, 1.08)]}>
        <GutMap
          t={t}
          torso
          a={{ stom: tw(to(A('stomach'), 0.8, { o: 0.28 }), to(T2, 0.6, { o: 1 }), to(A('wave'), 0.45, { sy: 0.95, sx: 1.02 }), to(A('wave') + 0.45, 0.5, { sy: 1, sx: 1 })) }}
          sl={{
            behindPanc: glowO > 0.001 && <path d={PANC_D} fill={C.amber} filter="url(#glow)" opacity={glowO} />,
            overPanc: (
              <>
                {redGlowO > 0.001 && <ellipse cx={1145} cy={705} rx={90} ry={50} fill={C.red} filter="url(#glow)" opacity={redGlowO} />}
                <An t={t} tw={fade(T2, 0.6)}>
                  <Draw d="M1120,668 L1146,690 L1132,704 L1166,728 L1158,742" p={prog(t, A('makes them'), 0.45)} stroke={C.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                </An>
              </>
            ),
            overStom: <path d={STOM_D} fill={C.red} opacity={v(t, 0, [A('acid') - 0.2, 0.8, 0.32])} />,
          }}
        />
        {/* bolus of chyme */}
        <An t={t} tw={show(A('acid') + 0.2, 0.3)}>
          <g transform={`translate(${ptAt(DUO_D, bolusP).join(',')})`}>
            <circle cx={0} cy={0} r={20} fill={C.red} opacity={0.85} />
            <circle cx={-14} cy={6} r={13} fill={C.red} opacity={0.7} />
          </g>
        </An>
        <Draw
          d="M885,602 C820,600 760,598 722,610 C684,622 668,650 668,700 L668,820"
          p={prog(t, A('acid') + 0.4, 3.0)}
          stroke={C.red}
          strokeWidth={40}
          strokeLinecap="round"
          opacity={v(t, 0, [A('acid') + 0.4, 0.3, 0.35])}
        />
        {/* enzyme icon greys out in acid */}
        <An t={t} tw={pop(A('those enzymes'))}>
          <circle cx={820} cy={800} r={30} fill={mix(C.amber, C.grey, enzP)} stroke={mix(C.amberD, '#6B7079', enzP)} strokeWidth={3} />
          <path d="M802,812 L822,782 L842,812" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <Tx x={820} y={856} size={22} w={700} fill={C.amberD}>
            enzymes
          </Tx>
        </An>
        <An t={t} tw={pop(A('in acid') + 0.1, 0.4)}>
          <path d="M848,770 L880,802 M880,770 L848,802" stroke={C.red} strokeWidth={7} strokeLinecap="round" />
        </An>
        {eroO > 0 && <ellipse cx={668} cy={790} rx={30} ry={46} fill={C.red} opacity={eroO} />}
      </World>

      {/* ---------------- HUD ---------------- */}
      <rect x={0} y={0} width={1920} height={1080} fill={C.paper} opacity={v(t, 0, [T3, 0.6, 1])} />
      {/* food panel */}
      <An t={t} tw={tw(slideIn(A('each time') + 0.1, 60, 0, 0.7), fade(T2 - 0.4, 0.5))}>
        <Card x={1250} y={120} w={610} h={840} />
        <circle cx={1555} cy={330} r={150} fill="#fff" stroke={C.greyL} strokeWidth={6} />
        <circle cx={1555} cy={330} r={118} fill="none" stroke={C.paper2} strokeWidth={4} />
        <path d="M1460,300 C1460,250 1540,240 1560,280 C1580,320 1540,360 1500,360 C1470,360 1460,340 1460,300 Z" fill="#B5523F" stroke="#7E3326" strokeWidth={4} />
        <path d="M1480,300 C1500,290 1520,300 1530,320" fill="none" stroke="#E59A88" strokeWidth={5} strokeLinecap="round" />
        <path d="M1575,250 C1575,225 1655,225 1655,250 L1650,330 L1580,330 Z" fill="#E7B66A" stroke="#A8742B" strokeWidth={4} />
        <rect x={1588} y={258} width={54} height={60} rx={8} fill="#F6DDA8" />
        <rect x={1530} y={370} width={62} height={44} rx={6} fill="#F7E08A" stroke="#C9A93A" strokeWidth={4} />
        {/* protein */}
        <g transform={`translate(${MX(0)},${MY(0)}) scale(1.35) translate(${-MX(0)},${-MY(0)})`}>
          <An t={t} tw={pop(MOLT[0] - 0.5, 0.5)}>
            {[0, 1].map((half) => (
              <An t={t} tw={half ? snipR(MOLT[0] + 0.1) : snipL(MOLT[0] + 0.1)} key={half}>
                {[0, 1, 2].map((j) => {
                  const i = half * 3 + j;
                  return (
                    <circle key={i} cx={MX(0) - 50 + i * 20} cy={MY(0) + Math.sin(i) * 10} r={10} fill={['#E07A5F', '#81B29A', '#F2CC8F', '#3D85C6', '#E07A5F', '#81B29A'][i]} stroke={C.ink} strokeWidth={2} />
                  );
                })}
              </An>
            ))}
          </An>
        </g>
        {/* starch */}
        <g transform={`translate(${MX(1)},${MY(1)}) scale(1.35) translate(${-MX(1)},${-MY(1)})`}>
          <An t={t} tw={pop(MOLT[1] - 0.5, 0.5)}>
            {[0, 1].map((half) => (
              <An t={t} tw={half ? snipR(MOLT[1] + 0.1) : snipL(MOLT[1] + 0.1)} key={half}>
                {[0, 1].map((j) => {
                  const i = half * 2 + j;
                  const x = MX(1) - 48 + i * 32, y = MY(1) + (i % 2) * 8;
                  return <polygon key={i} points={P([0, 60, 120, 180, 240, 300].map((a) => pol(x, y, 15, a + 30)))} fill="#F6E2A8" stroke="#B08B2E" strokeWidth={2.5} />;
                })}
              </An>
            ))}
          </An>
        </g>
        {/* fat */}
        <g transform={`translate(${MX(2)},${MY(2)}) scale(1.35) translate(${-MX(2)},${-MY(2)})`}>
          <An t={t} tw={pop(MOLT[2] - 0.5, 0.5)}>
            <An t={t} tw={fade(MOLT[2] + 0.1, 0.25)}>
              <circle cx={MX(2)} cy={MY(2)} r={36} fill="#F7E08A" stroke="#C9A93A" strokeWidth={3} />
            </An>
            {[
              [-24, -14],
              [22, -12],
              [0, 20],
            ].map(([dx, dy], i) => (
              <An t={t} key={i} tw={tw(show(MOLT[2] + 0.1, 0.2), move(MOLT[2] + 0.1, 0.6, [-6, 6, 0][i], [-5, -4, 6][i], E.out))}>
                <circle cx={MX(2) + dx} cy={MY(2) + dy} r={13} fill="#F7E08A" stroke="#C9A93A" strokeWidth={3} />
              </An>
            ))}
          </An>
        </g>
        {/* DNA */}
        <g transform={`translate(${MX(3)},${MY(3)}) scale(1.35) translate(${-MX(3)},${-MY(3)})`}>
          <An t={t} tw={pop(MOLT[3] - 0.5, 0.5)}>
            <An t={t} tw={move(MOLT[3] + 0.1, 0.6, 0, -16, E.out)}>
              <path d={`M${MX(3) - 48},${MY(3)} q12,-22 24,0 t24,0 t24,0 t24,0`} fill="none" stroke={C.violet} strokeWidth={5} strokeLinecap="round" />
            </An>
            <An t={t} tw={move(MOLT[3] + 0.1, 0.6, 0, 16, E.out)}>
              <path d={`M${MX(3) - 48},${MY(3)} q12,22 24,0 t24,0 t24,0 t24,0`} fill="none" stroke={C.teal} strokeWidth={5} strokeLinecap="round" />
            </An>
          </An>
        </g>
        {['protein', 'starch', 'fat', 'DNA'].map((s, i) => (
          <An t={t} tw={show(MOLT[i] - 0.3)} key={s}>
            <Tx x={MX(i)} y={MY(i) + 82} size={28} w={700} fill={C.ink2}>
              {s}
            </Tx>
          </An>
        ))}
      </An>
      {/* sparks from the pancreas to the food */}
      {t >= SP0 &&
        t < SP1 &&
        Array.from({ length: 14 }, (_, k) => {
          const lt = t - SP0;
          const ph = ((lt - k * 0.22) % 3.08) / 1.3;
          if (lt - k * 0.22 < 0 || ph > 1 || (lt > SP1 - SP0 - 1.3 && ph < 0.05)) return null;
          const [x, y] = ptAt(SPARK_P[k % 4], E.io(ph));
          return <circle key={k} cx={x} cy={y} r={11} fill={C.amber} stroke="#fff" strokeWidth={3} opacity={Math.sin(Math.PI * ph)} />;
        })}
      <An t={t} tw={tw(show(A('gland', 2) - 0.2, 0.2), fade(A('gland', 2) + 0.75, 0.15))}>
        <circle cx={ptAt(BACK_P, bsP)[0]} cy={ptAt(BACK_P, bsP)[1]} r={11} fill={C.amber} stroke={C.red} strokeWidth={4} />
      </An>
      {/* pH strip */}
      <An t={t} tw={tw(slideIn(A('with a ph') - 0.2, 0, 60, 0.6), fade(T3, 0.5))}>
        <PhStrip x={560} y={975} w={800} value={phVal} id="ph0a" card />
      </An>
      <An t={t} tw={tw(slideIn(A('near two') + 0.3, 0, 20), fade(T3, 0.4))}>
        <Caption x={1250} y={420} fill={C.redL} color="#8E2B26" stroke="none">
          chyme · pH ≈ 2
        </Caption>
      </An>
      {/* 0.3 two problem cards */}
      <An t={t} pv={[550, 540]} tw={tw(slideIn(A('two problems'), -60, 0, 0.6), to(T4, 0.8, { x: 310, y: -382, sx: 0.74, sy: 0.16 }), fade(T4 + 0.7, 0.3))}>
        <Card x={170} y={250} w={760} h={580} stroke={C.amber} sw={5} />
      </An>
      <An t={t} pv={[1370, 540]} tw={tw(slideIn(A('two problems') + 0.15, 60, 0, 0.6), to(T4, 0.8, { x: -110, y: -382, sx: 0.74, sy: 0.16 }), fade(T4 + 0.7, 0.3))}>
        <Card x={990} y={250} w={760} h={580} stroke={C.teal} sw={5} />
      </An>
      <An t={t} tw={tw(show(A('it must deliver'), 0.5), fade(T4 - 0.6, 0.4))}>
        <An t={t} pv={[550, 445]} tw={tw(scaleTo(A('without destroying'), 0.25, 1.12), scaleTo(A('without destroying') + 0.25, 0.35, 1))}>
          <LockIcon x={550} y={440} s={6.5} color={C.amber} />
        </An>
        <Tx x={550} y={620} size={40} w={800} fill={C.amber}>
          Problem 1
        </Tx>
        <Tx x={550} y={690} size={38} w={600}>
          Deliver enzymes
        </Tx>
        <Tx x={550} y={740} size={38} w={600}>
          without self-digestion
        </Tx>
      </An>
      <An t={t} tw={tw(show(A('and it must neutralize') - 0.2, 0.5), fade(T4 - 0.6, 0.4))}>
        <PhStrip x={1110} y={470} w={520} value={ph2Val} id="ph0b" />
        <Tx x={1370} y={620} size={40} w={800} fill={C.teal}>
          Problem 2
        </Tx>
        <Tx x={1370} y={690} size={38} w={600}>
          Neutralize the acid
        </Tx>
        <Tx x={1370} y={740} size={38} w={600}>
          fast enough for enzymes
        </Tx>
      </An>
      {/* 0.4 the empty board */}
      {t > T4 && (
        <Board
          t={t}
          a={{
            bg: show(T4 + 0.55, 0.5),
            headA: show(T4 + 0.7, 0.3),
            headT: show(T4 + 0.7, 0.3),
            title: show(T4 + 0.9),
            lines: show(T4 + 0.9, 0.6),
            ...Object.fromEntries(
              BOARD_ROWS.map((_, i) => {
                const p = i === 0 ? pulse(A('product')) : i === 2 ? pulse(A('signal')) : i === 3 ? pulse(A('signal') + 0.12) : i === 5 ? pulse(A('failing')) : [];
                return ['row' + i, tw(slideIn(T4 + 1.0 + i * 0.14, -30, 0, 0.45), p)];
              }),
            ),
          }}
        />
      )}
      {/* main title */}
      <An t={t} tw={tw(show(tw4 + 0.2, 0.6), fade(c1 - 0.5, 0.45))}>
        <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
        <An t={t} tw={slideIn(tw4 + 0.5, 0, 30, 0.8)}>
          <Tx x={960} y={500} size={92} w={800}>
            Physiology of the Pancreas
          </Tx>
        </An>
        <An t={t} tw={pop(tw4 + 1.0, 0.6)}>
          <rect x={760} y={590} width={196} height={10} rx={5} fill={C.amber} />
          <rect x={964} y={590} width={196} height={10} rx={5} fill={C.teal} />
        </An>
        <An t={t} tw={slideIn(tw4 + 1.3, 0, 20, 0.7)}>
          <Tx x={960} y={670} size={40} w={500} fill={C.ink2}>
            Two factories in one gland
          </Tx>
        </An>
      </An>
    </Stage>
  );
};
// silence unused-import lint for helpers kept for parity
void hidden;
void win;
