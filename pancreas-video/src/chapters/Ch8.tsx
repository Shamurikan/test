// Chapter 8 — Better together
import React from 'react';
import { An, Arrow, Card, Draw, ptAt, Tag, Tx } from '../lib/prims';
import { Acinus, acinusGeom, Board, boardIn, Bolt, CBD_D, GutMap, Hex, TitleCard } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, pop, prog, pulse, show, slideIn, tw, v } from '../lib/anim';
import { anchors, silence } from '../lib/timeline';
import { Stage, toScreen, useChapterT, World } from '../lib/scene';

const K = anchors(8);
const { A, AE } = K;
const [c0] = K.span;
const B82 = A('there are two reasons');
const MOL = A('the molecular reason');
const B83 = A('look at the other actions');
const SEC_T = A('secretin inhibits');
const LOOP_T = A('put together this is');
const [REF0, REF1] = silence('ref-card');
const BOARD_T = A('and on the board');
const cyc = (t: number, a: number, b: number, per: number, off = 0) => (t < a || t >= b ? null : (((t - a) / per + off) % 1 + 1) % 1);
const CAMB = { cx: 1000, cy: 560, cs: 0.95 };

export const Ch8: React.FC = () => {
  const t = useChapterT(8);
  return (
    <Stage>
      {t < B82 + 0.5 && <BarScene t={t} />}
      {t > B82 - 0.5 && t < MOL + 0.5 && <CargoScene t={t} />}
      {t > MOL - 0.5 && t < B83 + 0.5 && <MolScene t={t} />}
      {t > B83 - 0.5 && t < BOARD_T + 0.5 && <MapScene t={t} />}
      {t > BOARD_T - 0.6 && (
        <An t={t} tw={show(BOARD_T - 0.4, 0.5)}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
          <Board
            t={t}
            a={{ ...boardIn(BOARD_T - 0.4), pot: tw(show(A('potentiate each other') - 0.2, 0.6), pulse(A('potentiate each other') + 0.6, 1.08)) }}
            shown={{ a0: true, a1: true, a2: true, a3: true, a4: true, a5: true, t0: true, t1: true, t2: true, t3: true, t4: true, t5: true, noteA: true, noteT: true, warnA: true, warnT: true }}
          />
        </An>
      )}
      <TitleCard t={t} n={8} title="Better together" question="Why does the pancreas rely on all three signals at once?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

// ---------------------------------------------------------------------------
const BarScene: React.FC<{ t: number }> = ({ t }) => {
  const tAlone = A('alone');
  const tSum = A('the sum');
  const tFar = A('far greater');
  const base = 880, sc = 6;
  const vals = [22, 28, 30];
  const cols = [C.violet, C.amber, C.teal];
  const names = ['ACh', 'CCK', 'secretin'];
  const sumH = prog(t, tSum - 0.2, 1.0);
  const allH = prog(t, tFar - 0.3, 1.6, E.out);
  return (
    <An t={t} tw={tw(show(K.firstContent - 0.2, 0.5), fade(B82 - 0.3, 0.5))}>
      <Tag x={1700} y={140} size={24} fill={C.greyL} color={C.ink2}>
        schematic
      </Tag>
      <Tx x={300} y={140} size={30} w={800} fill={C.ink2} anchor="start">
        pancreatic secretion
      </Tx>
      <line x1={260} x2={1700} y1={base} y2={base} stroke={C.ink2} strokeWidth={4} />
      {vals.map((val, i) => {
        const h = val * sc * prog(t, tAlone - 0.4 + i * 0.25, 0.8, E.out);
        return (
          <g key={i}>
            <rect x={340 + i * 230} y={base - h} width={150} height={h} rx={10} fill={cols[i]} />
            <Tx x={415 + i * 230} y={base + 40} size={28} w={800} fill={cols[i]}>
              {names[i]}
            </Tx>
          </g>
        );
      })}
      {/* sum bar */}
      <An t={t} tw={show(tSum - 0.3, 0.4)}>
        {vals.map((val, i) => {
          const off = vals.slice(0, i).reduce((a, b) => a + b, 0) * sc;
          return <rect key={i} x={1080} y={base - off - val * sc * sumH} width={150} height={val * sc * sumH} fill={cols[i]} stroke="#fff" strokeWidth={2} />;
        })}
        <Tx x={1155} y={base + 40} size={28} w={800}>
          sum
        </Tx>
      </An>
      <An t={t} tw={show(tFar - 0.4, 0.4)}>
        <rect x={1360} y={base - 112 * sc * allH} width={150} height={112 * sc * allH} rx={10} fill={C.ink} />
        <Tx x={1435} y={base + 40} size={26} w={800}>
          all three
        </Tx>
        <Tx x={1435} y={base + 74} size={26} w={800}>
          together
        </Tx>
      </An>
      <An t={t} tw={show(tFar + 1.3, 0.5)}>
        <line x1={1060} x2={1530} y1={base - 80 * sc} y2={base - 80 * sc} stroke={C.ink2} strokeWidth={3} strokeDasharray="12 8" />
        <path d={`M1550,${base - 80 * sc} L1560,${base - 80 * sc} L1560,${base - 112 * sc} L1550,${base - 112 * sc}`} fill="none" stroke={C.red} strokeWidth={4} />
        <Tag x={1700} y={base - 96 * sc} size={24} fill={C.redL} color={C.redD}>
          extra
        </Tag>
      </An>
      <An t={t} tw={slideIn(A('they multiply') - 0.1, 0, 20)}>
        <Tag x={660} y={300} size={32} fill="#fff" stroke={C.greyL} shadow>
          {'together > sum of parts'}
        </Tag>
      </An>
      <An t={t} tw={slideIn(A('potentiation') - 0.1, 0, 20)}>
        <Tag x={660} y={390} size={34} fill={C.violet} color="#fff">
          potentiation (multiplicative effect)
        </Tag>
      </An>
    </An>
  );
};

// ---------------------------------------------------------------------------
const CargoScene: React.FC<{ t: number }> = ({ t }) => {
  const tCargo = A('the cargo');
  const tRiver = A('the river');
  const g = acinusGeom(520, 560, 220);
  const flow = prog(t, tRiver - 0.1, 2.4);
  return (
    <An t={t} tw={tw(show(B82 - 0.3, 0.5), fade(MOL - 0.3, 0.5))}>
      <Tx x={960} y={110} size={34} w={800}>
        1 · physical: cargo needs a river
      </Tx>
      <Acinus t={t} cx={520} cy={560} R={220} id="acg8a" sl={{ duct: flow > 0 ? <rect x={520} y={560 - 30} width={(g.dx1 - 520) * flow} height={60} fill={C.teal} opacity={0.55} /> : null }} />
      {Array.from({ length: 16 }, (_, i) => {
        const fx = flow * (400 + (i % 8) * 60);
        const x = 500 + (i % 4) * 20 + fx, y = 530 + Math.floor(i / 4) * 18;
        return <circle key={i} cx={Math.min(x, g.dx1 + 120)} cy={y} r={9} fill={C.amber} stroke={C.amberD} strokeWidth={2} opacity={prog(t, tCargo - 0.4, 0.6) * (1 - clamp((x - g.dx1 - 60) / 80))} />;
      })}
      {/* duodenum at the end */}
      <rect x={1640} y={380} width={180} height={360} rx={60} fill={C.flesh} stroke={C.fleshD} strokeWidth={4} />
      <Tx x={1730} y={780} size={24} w={700} fill={C.ink2}>
        duodenum
      </Tx>
      <An t={t} tw={slideIn(tCargo, 0, 20)}>
        <Tag x={520} y={880} size={30} fill={C.amberL} color={C.amberD}>
          CCK + ACh = cargo (enzymes)
        </Tag>
      </An>
      <An t={t} tw={slideIn(tRiver, 0, 20)}>
        <Tag x={1200} y={880} size={30} fill={C.tealL} color={C.tealD}>
          secretin = river (fluid)
        </Tag>
      </An>
      <An t={t} tw={slideIn(A('each makes'), 0, 20)}>
        <Tx x={960} y={970} size={28} w={600} fill={C.ink2} italic>
          each makes the other's effect visible
        </Tx>
      </An>
    </An>
  );
};

// ---------------------------------------------------------------------------
const MolScene: React.FC<{ t: number }> = ({ t }) => {
  const tCamp = A('cyclic a m p');
  const tCa = A('act through calcium');
  const tRe = A('reinforce each other');
  const tSev = A('several');
  const meterBase = prog(t, tCa + 1.0, 0.8);
  const jump = prog(t, tSev - 0.2, 1.0, E.back);
  const cell = (x: number, col: string, label: string) => (
    <g>
      <rect x={x} y={300} width={460} height={340} rx={60} fill="#fff" stroke={col} strokeWidth={8} filter="url(#soft)" />
      <Tx x={x + 230} y={350} size={28} w={800} fill={col}>
        {label}
      </Tx>
    </g>
  );
  return (
    <An t={t} tw={tw(show(MOL - 0.3, 0.5), fade(B83 - 0.3, 0.5))}>
      <Tx x={960} y={110} size={34} w={800}>
        2 · molecular: second messengers reinforce each other
      </Tx>
      {cell(330, C.amber, 'acinar cell')}
      {cell(1130, C.teal, 'duct cell')}
      <An t={t} tw={pop(tCa - 0.1, 0.6)}>
        <circle cx={560} cy={480} r={78} fill={C.violetL} stroke={C.violet} strokeWidth={4} />
        <Tx x={560} y={482} size={30} w={800} fill={C.violet}>
          IP_3_ / Ca^2+^
        </Tx>
      </An>
      <An t={t} tw={pop(tCamp - 0.1, 0.6)}>
        <circle cx={1360} cy={480} r={78} fill={C.tealL} stroke={C.teal} strokeWidth={4} />
        <Tx x={1360} y={482} size={32} w={800} fill={C.tealD}>
          cAMP
        </Tx>
      </An>
      {/* inputs */}
      <An t={t} tw={slideIn(tCa - 0.2, 0, 30)}>
        <Bolt x={400} y={780} s={1.2} />
        <Tx x={400} y={840} size={22} w={700} fill={C.violet}>
          vagus → ACh
        </Tx>
        <Arrow d="M415,748 L470,645" color="violet" sw={6} />
        <Hex x={560} y={790} r={30} fill={C.amber} label="CCK" size={15} />
        <Tx x={560} y={850} size={22} w={700} fill={C.amberD}>
          I cells → CCK
        </Tx>
        <Arrow d="M560,755 L560,645" color="amber" sw={6} />
      </An>
      <An t={t} tw={slideIn(tCamp - 0.2, 0, 30)}>
        <Hex x={1360} y={790} r={30} fill={C.teal} label="S" size={22} />
        <Tx x={1360} y={850} size={22} w={700} fill={C.tealD}>
          S cells → secretin
        </Tx>
        <Arrow d="M1360,755 L1360,645" color="teal" sw={6} />
      </An>
      {/* potentiation lightning arrows */}
      <An t={t} tw={show(tRe - 0.1, 0.4)}>
        <Draw d="M630,800 L860,760 L840,800 L1120,600" p={prog(t, tRe - 0.1, 0.9)} stroke={C.violet} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
        <Draw d="M1130,330 L900,250 L920,290 L700,310" p={prog(t, tRe + 0.6, 0.9)} stroke={C.teal} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
        <Tag x={930} y={720} size={22} fill="#fff" stroke={C.violet} color={C.violet}>
          potentiates
        </Tag>
      </An>
      <An t={t} tw={slideIn(A('amplify'), 0, 20)}>
        <Tag x={1600} y={200} size={24} fill={C.tealL} color={C.tealD}>
          ACh, CCK potentiate secretin
        </Tag>
      </An>
      <An t={t} tw={slideIn(A('secretin enhances'), 0, 20)}>
        <Tag x={320} y={200} size={24} fill={C.amberL} color={C.amberD}>
          secretin augments CCK
        </Tag>
      </An>
      {/* output meters */}
      {[
        [560, C.amber, 'enzymes'],
        [1360, C.teal, 'HCO_3_^−^ fluid'],
      ].map(([x, col, l], i) => {
        const h = 60 * meterBase + 110 * jump;
        return (
          <g key={i} opacity={meterBase}>
            <rect x={(x as number) + 260} y={620} width={50} height={-0} fill="none" />
            <rect x={(x as number) + 250 - (i ? 0 : 0)} y={900 - 0} width={0} height={0} />
            <rect x={(x as number) - 25 + (i ? 330 : -330)} y={940 - h} width={50} height={h} rx={8} fill={col as string} />
            <rect x={(x as number) - 25 + (i ? 330 : -330)} y={770} width={50} height={170} rx={8} fill="none" stroke={C.greyL} strokeWidth={3} />
            <Tx x={(x as number) + (i ? 330 : -330)} y={975} size={22} w={700} fill={C.ink2}>
              {l as string}
            </Tx>
          </g>
        );
      })}
      <An t={t} tw={slideIn(A('in practice'), 0, 20)}>
        <Tx x={960} y={1010} size={26} w={600} fill={C.ink2} italic>
          a meal always presents several stimuli at once
        </Tx>
      </An>
    </An>
  );
};

// ---------------------------------------------------------------------------
const MapScene: React.FC<{ t: number }> = ({ t }) => {
  const tGB = A('contracts the gallbladder');
  const tOddi = A('relaxes the sphincter');
  const tEmpty = A('slows gastric emptying');
  const tPyl = A('contracts the pylorus');
  const gb = 1 - 0.18 * Math.sin(clamp((t - tGB) / 1.2) * Math.PI);
  const oddiR = 15 + 9 * prog(t, tOddi, 0.8);
  const pyl = 10 + 8 * prog(t, tEmpty, 0.8) + 8 * prog(t, tPyl, 0.8);
  const acidDial = v(t, 0.6, [A('inhibits gastric acid'), 1.2, -0.4]);
  const gDim = prog(t, A('release of gastrin'), 0.8);
  const camS = CAMB;
  const S = (x: number, y: number) => toScreen(x, y, camS);
  const loopOn = t > LOOP_T - 0.4;
  const refOn = prog(t, REF0 - 0.1, 0.5) * (1 - prog(t, BOARD_T - 0.5, 0.4));
  const CCK_PATHS = ['M760,880 C700,700 640,560 640,470', 'M760,880 C860,760 900,700 900,640', 'M760,880 C900,800 1150,500 1200,440'];
  return (
    <An t={t} tw={tw(show(B83 - 0.3, 0.5), fade(BOARD_T - 0.3, 0.5))}>
      <g opacity={loopOn ? 1 - 0.85 * prog(t, LOOP_T, 0.6) : 1}>
        <World t={t} base={CAMB}>
          <GutMap
            t={t}
            gbScale={gb}
            oddiR={oddiR}
            pylorusW={pyl}
            a={{ oddi: show(tOddi - 0.3, 0.4) }}
            sl={{
              overDuo: (
                <>
                  {t > tGB &&
                    [0, 1, 2, 3, 4, 5].map((k) => {
                      const p = cyc(t, tGB + 0.3, LOOP_T, 1.6, k / 6);
                      if (p === null) return null;
                      const [x, y] = ptAt(CBD_D, 0.3 + 0.7 * p);
                      const teal = t > A('bile ducts') && k % 2 === 0;
                      return <circle key={k} cx={x} cy={y} r={7} fill={teal ? C.teal : C.olive} stroke="#fff" strokeWidth={2} />;
                    })}
                </>
              ),
              top: (
                <>
                  {/* hormone particles from the duodenum */}
                  {t < SEC_T &&
                    t > tGB - 1 &&
                    [0, 1, 2].map((k) => {
                      const p = cyc(t, tGB - 1, SEC_T, 2.2, k / 3);
                      if (p === null) return null;
                      const [x, y] = ptAt(CCK_PATHS[k], p);
                      return <Hex key={k} x={x} y={y} r={14} fill={C.amber} />;
                    })}
                  {t > SEC_T - 0.5 &&
                    t < LOOP_T &&
                    [0, 1, 2].map((k) => {
                      const p = cyc(t, SEC_T - 0.5, LOOP_T, 2.2, k / 3);
                      if (p === null) return null;
                      const [x, y] = ptAt(CCK_PATHS[(k + 1) % 3 === 0 ? 0 : 2], p);
                      return <Hex key={k} x={x} y={y} r={14} fill={C.teal} />;
                    })}
                  {/* G cells in the antrum */}
                  <An t={t} tw={show(A('release of gastrin') - 0.6, 0.4)}>
                    {[
                      [960, 640],
                      [1000, 650],
                      [1040, 640],
                    ].map(([x, y], i) => (
                      <circle key={i} cx={x} cy={y} r={10} fill={gDim > 0.5 ? C.greyL : '#B784A7'} stroke="#fff" strokeWidth={2} />
                    ))}
                  </An>
                </>
              ),
            }}
          />
        </World>
        {/* HUD labels on the map */}
        <An t={t} tw={slideIn(tGB + 0.2, -20, 0)}>
          <Tag x={S(640, 440)[0] - 170} y={S(640, 440)[1]} size={24} fill={C.amberL} color={C.amberD}>
            gallbladder contracts
          </Tag>
        </An>
        <An t={t} tw={slideIn(tOddi + 0.2, -20, 0)}>
          <Tag x={S(694, 714)[0] - 180} y={S(694, 714)[1] + 40} size={24} fill={C.amberL} color={C.amberD}>
            Oddi relaxes
          </Tag>
        </An>
        <An t={t} tw={slideIn(tEmpty + 0.2, 0, -20)}>
          <Tag x={S(882, 600)[0]} y={S(882, 600)[1] - 70} size={24} fill="#fff" stroke={C.greyL}>
            pylorus: emptying slows
          </Tag>
        </An>
        <An t={t} tw={slideIn(A('trophic effect'), 20, 0)}>
          <Tag x={1560} y={760} size={24} fill={C.amberL} color={C.amberD}>
            trophic to pancreas
          </Tag>
        </An>
        <An t={t} tw={slideIn(A('feeling of fullness') - 0.2, 20, 0)}>
          <Tag x={1560} y={820} size={24} fill={C.amberL} color={C.amberD}>
            satiety
          </Tag>
        </An>
        {/* acid dial on stomach */}
        <An t={t} tw={pop(A('inhibits gastric acid') - 0.3, 0.5)}>
          <g transform={`translate(${S(1240, 330)[0]},${S(1240, 330)[1]})`}>
            <circle r={44} fill="#fff" stroke={C.red} strokeWidth={4} />
            <line x1={0} y1={0} x2={34 * Math.cos(-Math.PI / 2 + acidDial)} y2={34 * Math.sin(-Math.PI / 2 + acidDial)} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
            <Tx x={0} y={66} size={20} w={800} fill={C.redD}>
              acid ↓
            </Tx>
          </g>
        </An>
        <An t={t} tw={slideIn(A('release of gastrin'), 20, 0)}>
          <Tag x={S(1000, 660)[0] + 120} y={S(1000, 660)[1] + 70} size={22} fill="#E9D3E2" color="#6B3E5E">
            G cells: gastrin ↓
          </Tag>
        </An>
        <An t={t} tw={slideIn(A('bile ducts'), -20, 0)}>
          <Tag x={S(720, 520)[0] - 200} y={S(720, 520)[1]} size={22} fill={C.tealL} color={C.tealD}>
            biliary HCO_3_^−^ ↑
          </Tag>
        </An>
        <An t={t} tw={tw(slideIn(B83 + 0.5, 0, -20))}>
          <Card x={1380} y={60} w={480} h={110} rx={24} />
          <Hex x={1440} y={115} r={24} fill={C.amber} label="CCK" size={12} />
          <Hex x={1500} y={115} r={24} fill={C.teal} label="S" size={18} />
          <Tx x={1540} y={115} size={24} w={700} anchor="start">
            coordinate the upper gut
          </Tx>
        </An>
      </g>
      {/* feedback loop diagram */}
      {loopOn && (
        <An t={t} tw={tw(show(LOOP_T - 0.2, 0.5), fade(REF0 - 0.1, 0.4))}>
          {[
            ['duodenum senses acid, fat, protein', 960, 230, C.ink],
            ['CCK + secretin released', 1450, 540, C.violet],
            ['HCO_3_^−^, enzymes, bile in · stomach slowed', 960, 850, C.tealD],
            ['duodenum normalized → hormones fall', 470, 540, C.ink2],
          ].map(([s, x, y, col], i) => (
            <An t={t} tw={pop(LOOP_T + [0.3, 3.0, 6.0, 10.5][i], 0.5)} key={i}>
              <Tag x={x as number} y={y as number} size={28} fill="#fff" stroke={col as string} color={col as string} shadow>
                {s as string}
              </Tag>
            </An>
          ))}
          {[
            'M1160,260 C1350,300 1450,400 1460,490',
            'M1450,590 C1430,720 1300,810 1200,830',
            'M720,840 C560,800 480,700 470,590',
            'M480,490 C500,380 620,280 760,250',
          ].map((d, i) => (
            <Arrow key={i} d={d} color={i === 3 ? 'grey' : 'violet'} sw={7} p={prog(t, LOOP_T + 0.6 + i * 1.6 + (i === 3 ? AE('controls its own input') - LOOP_T - 6.4 : 0), 1.0)} />
          ))}
          <An t={t} tw={slideIn(A('controls its own input'), 0, 20)}>
            <Tx x={960} y={545} size={36} w={800} fill={C.ink}>
              feedback loop
            </Tx>
            <Tx x={960} y={590} size={26} w={600} fill={C.ink2} italic>
              the duodenum controls its own input
            </Tx>
          </An>
        </An>
      )}
      {/* reference card during the silent hold */}
      {refOn > 0 && <RefCard op={refOn} />}
    </An>
  );
};

const REF = {
  CCK: [
    '↑ enzyme secretion',
    "augments secretin's HCO₃⁻ effect",
    'contracts gallbladder',
    'relaxes sphincter of Oddi',
    'slows gastric emptying',
    '↑ intestinal motility; relaxes ileocecal sphincter',
    'trophic to pancreas',
    'satiety',
  ],
  Secretin: [
    '↑ HCO₃⁻ and water from ducts',
    "augments CCK's enzyme effect",
    '↑ hepatic bile flow and biliary HCO₃⁻',
    '↓ gastric acid and gastrin; ↑ pepsin secretion',
    '↓ gastric motility; contracts pylorus; slows emptying',
    'relaxes LES',
    '↓ intestinal motility; contracts ileocecal sphincter',
  ],
};
const RefCard: React.FC<{ op: number }> = ({ op }) => (
  <g opacity={op}>
    <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
    <Tx x={960} y={90} size={36} w={800}>
      Reference: other actions of CCK and secretin
    </Tx>
    {(['CCK', 'Secretin'] as const).map((k, j) => (
      <g key={k}>
        <Card x={110 + j * 870} y={150} w={830} h={860} rx={30} stroke={j ? C.teal : C.amber} sw={5} />
        <Tx x={525 + j * 870} y={210} size={36} w={800} fill={j ? C.tealD : C.amberD}>
          {k}
        </Tx>
        {REF[k].map((line, i) => (
          <g key={i}>
            <circle cx={170 + j * 870} cy={290 + i * 88} r={7} fill={j ? C.teal : C.amber} />
            <Tx x={195 + j * 870} y={290 + i * 88} size={28} w={500} anchor="start">
              {line}
            </Tx>
          </g>
        ))}
      </g>
    ))}
  </g>
);

void [REF1, Draw];
