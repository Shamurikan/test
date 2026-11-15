// Chapter 2 — Pancreatic juice
import React from 'react';
import { An, Arrow, Card, Draw, ptAt, Tag, Tx } from '../lib/prims';
import { Acinus, Board, boardIn, Caption, ClinicalFrame, DUO_D, Enzyme, GutMap, Ion, PhStrip, StepBadge, STOM_D, TitleCard } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, move, pop, prog, show, slideIn, to, tw, v } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { Stage, useChapterT, World } from '../lib/scene';

const K = anchors(2);
const { A } = K;
const [c0] = K.span;
const B22 = A('by weight');
const B23 = A('why such an alkaline');
const B24 = A('these jobs are linked');
const BOARD_T = A('bicarbonate is not');
const CAMB = { cx: 1260, cy: 640, cs: 1.08 };
const JEJ_D = 'M1152,760 C1210,795 1270,800 1330,782 C1390,764 1430,800 1450,880';
const DUO_FIRST = 'M885,602 C820,600 760,598 722,610 C684,622 668,650 668,700 L668,820';
const TEAL_D = 'M668,714 L668,820 C668,880 700,905 760,905 L1000,905 C1050,905 1070,880 1076,840';
const GASTRIN_D = 'M760,880 C880,1010 1420,760 1240,470';

const FoodIcon: React.FC<{ kind: number; x: number; y: number; split: number }> = ({ kind, x, y, split }) => {
  const d = split * 10;
  if (kind === 0)
    return (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={x - 24 + i * 16 + (i < 2 ? -d : d)} cy={y} r={8} fill={['#E07A5F', '#81B29A', '#F2CC8F', '#3D85C6'][i]} stroke={C.ink} strokeWidth={1.5} />
        ))}
      </g>
    );
  if (kind === 1)
    return (
      <g>
        {[0, 1, 2].map((i) => (
          <polygon key={i} points={[0, 60, 120, 180, 240, 300].map((a) => `${x - 22 + i * 22 + (i < 1 ? -d : i > 1 ? d : 0) + 11 * Math.cos(((a + 30) * Math.PI) / 180)},${y + 11 * Math.sin(((a + 30) * Math.PI) / 180)}`).join(' ')} fill="#F6E2A8" stroke="#B08B2E" strokeWidth={2} />
        ))}
      </g>
    );
  return (
    <g>
      {split < 0.05 ? (
        <circle cx={x} cy={y} r={16} fill="#F7E08A" stroke="#C9A93A" strokeWidth={2} />
      ) : (
        [[-1, -1], [1, -1], [0, 1]].map(([a, b], i) => <circle key={i} cx={x + a * (6 + d)} cy={y + b * (5 + d * 0.6)} r={8} fill="#F7E08A" stroke="#C9A93A" strokeWidth={2} />)
      )}
    </g>
  );
};

export const Ch2: React.FC = () => {
  const t = useChapterT(2);
  // ---- 2.1 flask ----
  const fill = prog(t, K.firstContent + 0.6, 3.5, E.out);
  const streamOn = t > K.firstContent && t < B22 + 1;
  const tilt = v(t, -12, [A('isotonic') + 0.1, 1.2, 0, E.back]);
  const jug = prog(t, A('about a liter a day'), 2.2);
  // ---- 2.3 / 2.4 world ----
  const worldIn = prog(t, B23 - 0.6, 0.7);
  const neut = prog(t, A('neutralizes that acid') + 0.4, 1.8);
  const phVal = v(t, 2, [A('seven to eight'), 1.6, 7.5], [B24 + 0.5, 1.0, 2.5], [A('cannot keep up'), 1.0, 1.8]);
  const eroIn = A('erode it') - 3;
  const heal = prog(t, A('protects the duodenal lining'), 1.4);
  const ero = t > A('second by removing') - 0.2 ? (0.25 + 0.35 * (0.5 + 0.5 * Math.sin((t - eroIn) * 7))) * (1 - heal) : 0;
  const pepGrey = prog(t, A('protects the duodenal lining') + 0.3, 0.8);
  const zes = t > B24;
  const flood = prog(t, A('pour out acid'), 1.2);
  const floodPulse = zes ? 0.35 + 0.15 * Math.sin((t - B24) * 5) : 0;
  const redFront = prog(t, A('cannot keep up'), 2.5);
  const lipGrey = prog(t, A('lipase is inactivated') + 0.3, 0.8);
  const cut3 = prog(t, A('delivers the enzymes') + 0.8, 0.6, E.out);
  const bolusP = prog(t, A('chyme leaves') + 0.3, 2.6) * 0.4;

  const ulcers: [number, number, number][] = [
    [820, 604, A('ulcers form')],
    [670, 700, A('ulcers form') + 0.3],
    [900, 906, A('further along')],
    [1074, 845, A('further along') + 0.4],
    [1300, 786, A('even in the jejunum') + 0.2],
    [1430, 815, A('even in the jejunum') + 0.6],
  ];

  return (
    <Stage>
      {/* ================= 2.1 the flask ================= */}
      {t < B22 + 1.2 && (
        <An t={t} tw={tw(fade(B22 - 0.2, 0.6))}>
          <An t={t} tw={show(K.firstContent - 0.2, 0.5)}>
            <Acinus t={t} cx={250} cy={210} R={95} id="acg2a" cellTint={0.4} />
            <Tx x={250} y={345} size={24} w={700} fill={C.amberD}>
              acini · enzymes
            </Tx>
            {/* duct segment */}
            <rect x={640} y={170} width={260} height={70} rx={14} fill="#EAF6FA" stroke={C.teal} strokeWidth={4} />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={648 + i * 50} y={176} width={44} height={18} rx={6} fill="#D3EAF4" stroke={C.teal} strokeWidth={2} />
            ))}
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={'b' + i} x={648 + i * 50} y={216} width={44} height={18} rx={6} fill="#D3EAF4" stroke={C.teal} strokeWidth={2} />
            ))}
            <Tx x={770} y={135} size={24} w={700} fill={C.tealD}>
              ducts · bicarbonate fluid
            </Tx>
          </An>
          {/* streams */}
          <Draw d="M330,250 C420,300 480,330 520,410" p={prog(t, K.firstContent + 0.2, 0.9)} stroke={C.amber} strokeWidth={14} strokeLinecap="round" opacity={0.85} />
          <Draw d="M770,240 C700,320 580,330 540,410" p={prog(t, K.firstContent + 0.4, 0.9)} stroke={C.teal} strokeWidth={22} strokeLinecap="round" opacity={0.85} />
          {streamOn &&
            [0, 1, 2, 3, 4, 5].map((k) => {
              const p = ((t * 0.8 + k / 6) % 1 + 1) % 1;
              const [x, y] = ptAt(k % 2 ? 'M770,240 C700,320 580,330 540,410' : 'M330,250 C420,300 480,330 520,410', p);
              return <circle key={k} cx={x} cy={y} r={7} fill="#fff" opacity={0.8 * Math.sin(p * Math.PI)} />;
            })}
          {/* flask */}
          <An t={t} tw={pop(K.firstContent, 0.6)}>
            <defs>
              <clipPath id="flaskclip">
                <path d="M490,420 L490,520 L330,860 C320,890 340,920 380,920 L660,920 C700,920 720,890 710,860 L550,520 L550,420 Z" />
              </clipPath>
            </defs>
            <g clipPath="url(#flaskclip)">
              <rect x={300} y={920 - 380 * fill} width={440} height={400} fill="#DCEFF5" />
              <rect x={300} y={920 - 380 * fill} width={440} height={10} fill="#C4E3EE" />
            </g>
            <path d="M490,420 L490,520 L330,860 C320,890 340,920 380,920 L660,920 C700,920 720,890 710,860 L550,520 L550,420" fill="none" stroke={C.ink2} strokeWidth={6} strokeLinejoin="round" />
            <rect x={474} y={408} width={92} height={16} rx={6} fill={C.ink2} />
            <Tag x={520} y={990} size={30} fill="#fff" stroke={C.greyL}>
              pancreatic juice
            </Tag>
          </An>
          {/* stats */}
          <An t={t} tw={slideIn(A('one and a half liters') - 0.1, 30, 0)}>
            <Tag x={1150} y={190} size={36} fill="#fff" stroke={C.greyL} shadow>
              1–1.5 L/day
            </Tag>
          </An>
          <An t={t} tw={slideIn(A('clear and alkaline'), 30, 0)}>
            <Tag x={1530} y={190} size={30} fill="#fff" stroke={C.greyL}>
              clear · alkaline
            </Tag>
          </An>
          <An t={t} tw={slideIn(A('ph of about eight') - 0.3, 0, 30)}>
            <PhStrip x={1080} y={420} w={640} value={v(t, 7, [A('about eight', 1), 0.8, 8])} id="ph2a" />
          </An>
          {/* balance scale */}
          <An t={t} tw={slideIn(A('isotonic') - 0.2, 0, 30)}>
            <path d="M1250,780 L1250,630 M1200,790 L1300,790" stroke={C.ink2} strokeWidth={8} strokeLinecap="round" />
            <g transform={`rotate(${tilt},1250,630)`}>
              <path d="M1080,630 L1420,630" stroke={C.ink2} strokeWidth={8} strokeLinecap="round" />
              <g transform={`rotate(${-tilt},1080,630)`}>
                <path d="M1080,630 L1040,700 M1080,630 L1120,700" stroke={C.greyL} strokeWidth={3} />
                <path d="M1020,700 L1140,700 C1130,735 1030,735 1020,700 Z" fill={C.redL} stroke="#D9847C" strokeWidth={3} />
                <Tx x={1080} y={762} size={26} w={700} fill={C.redD}>
                  plasma
                </Tx>
              </g>
              <g transform={`rotate(${-tilt},1420,630)`}>
                <path d="M1420,630 L1380,700 M1420,630 L1460,700" stroke={C.greyL} strokeWidth={3} />
                <path d="M1360,700 L1480,700 C1470,735 1370,735 1360,700 Z" fill="#DCEFF5" stroke={C.teal} strokeWidth={3} />
                <Tx x={1420} y={762} size={26} w={700} fill={C.tealD}>
                  juice
                </Tx>
              </g>
            </g>
            <circle cx={1250} cy={630} r={10} fill={C.ink2} />
          </An>
          <An t={t} tw={slideIn(A('isotonic') + 0.9, 0, 20)}>
            <Tag x={1250} y={870} size={30} fill="#fff" stroke={C.greyL}>
              isotonic (= plasma)
            </Tag>
          </An>
          {/* jug */}
          <An t={t} tw={slideIn(A('about a liter a day') - 0.3, 30, 0)}>
            <defs>
              <clipPath id="jugclip">
                <path d="M1600,600 L1780,600 L1770,850 C1768,870 1755,880 1735,880 L1645,880 C1625,880 1612,870 1610,850 Z" />
              </clipPath>
            </defs>
            <g clipPath="url(#jugclip)">
              <rect x={1590} y={880 - 270 * jug} width={200} height={280} fill={C.teal} opacity={0.75} />
            </g>
            <path d="M1600,600 L1780,600 L1770,850 C1768,870 1755,880 1735,880 L1645,880 C1625,880 1612,870 1610,850 Z" fill="none" stroke={C.ink2} strokeWidth={5} />
            <path d="M1780,640 C1840,650 1840,760 1774,770" fill="none" stroke={C.ink2} strokeWidth={5} />
            <Tx x={1690} y={640} size={28} w={800} fill={C.ink2}>
              1 L
            </Tx>
            <Tag x={1690} y={950} size={26} fill={C.tealL} color={C.tealD}>
              ~1 L/day from ducts
            </Tag>
          </An>
        </An>
      )}

      {/* ================= 2.2 composition ================= */}
      {t > B22 - 0.6 && t < B23 + 1 && (
        <An t={t} tw={tw(show(B22 - 0.3, 0.6), fade(B23 - 0.5, 0.5))}>
          <rect x={560} y={150} width={180} height={780} rx={20} fill="#fff" stroke={C.ink2} strokeWidth={4} />
          <An t={t} tw={show(B22 + 0.2, 0.8)}>
            <rect x={566} y={156 + 210} width={168} height={568} rx={14} fill={C.water} />
            <Tx x={650} y={660} size={30} w={700} fill={C.tealD}>
              water
            </Tx>
          </An>
          <An t={t} tw={show(A('organic material') - 0.1, 0.5)}>
            <rect x={566} y={156} width={168} height={110} rx={14} fill={C.amber} />
            <Tx x={650} y={211} size={24} w={800} fill="#fff">
              organic
            </Tx>
          </An>
          <An t={t} tw={show(A('inorganic') - 0.1, 0.5)}>
            <rect x={566} y={268} width={168} height={96} fill={C.teal} />
            <Tx x={650} y={316} size={24} w={800} fill="#fff">
              inorganic
            </Tx>
          </An>
          <An t={t} tw={show(A('organic material') + 0.6)}>
            <Tag x={430} y={180} size={22} fill={C.paper2} color={C.ink2} rx={10}>
              not to scale
            </Tag>
          </An>
          {/* organic row */}
          <An t={t} tw={slideIn(A('organic material') + 0.1, 30, 0)}>
            <Arrow d="M760,211 L860,211" color="amber" sw={5} />
            <Tx x={890} y={190} size={34} w={800} fill={C.amberD} anchor="start">
              organic 1–2%
            </Tx>
            <Tx x={890} y={236} size={28} w={500} anchor="start">
              enzymes (protein)
            </Tx>
          </An>
          <An t={t} tw={slideIn(A('acinar cells') - 0.1, 30, 0)}>
            <Arrow d="M1230,212 L1440,212" color="amber" sw={6} />
            <Acinus t={t} cx={1560} cy={212} R={80} id="acg2b" cellTint={0.4} />
            <Tx x={1560} y={325} size={24} w={700} fill={C.amberD}>
              acinar cells
            </Tx>
          </An>
          {/* inorganic row */}
          <An t={t} tw={slideIn(A('inorganic') + 0.1, 30, 0)}>
            <Arrow d="M760,316 L860,420" color="teal" sw={5} />
            <Tx x={890} y={430} size={34} w={800} fill={C.tealD} anchor="start">
              inorganic ~1%
            </Tx>
          </An>
          {[
            ['Na^+^', C.gold, A('sodium'), C.ink, 26],
            ['K^+^', C.lilac, A('potassium'), '#fff', 26],
            ['Ca^2+^', C.violetL, A('calcium'), C.violet, 26],
            ['Cl^−^', C.green, A('chloride'), '#fff', 26],
            ['HCO_3_^−^', C.teal, A('bicarbonate', 1, B22), '#fff', 44],
          ].map(([l, c, at, tc, r], i) => (
            <An t={t} tw={pop(at as number, 0.5)} key={i}>
              <Ion label={l as string} color={c as string} tc={tc as string} x={930 + i * 110 + (i === 4 ? 30 : 0)} y={540} r={r as number} size={i === 4 ? 32 : 23} />
            </An>
          ))}
          <An t={t} tw={slideIn(A('carried mostly') + 0.3, 0, 20)}>
            <Tag x={1100} y={650} size={28} fill={C.tealL} color={C.tealD}>
              mostly NaHCO_3_
            </Tag>
          </An>
          <An t={t} tw={slideIn(A('centroacinar and duct cells') - 0.1, 30, 0)}>
            <Arrow d="M1300,650 L1440,650" color="teal" sw={6} />
            <rect x={1460} y={615} width={220} height={70} rx={14} fill="#EAF6FA" stroke={C.teal} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={1468 + i * 52} y={621} width={46} height={18} rx={6} fill="#D3EAF4" stroke={C.teal} strokeWidth={2} />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <rect key={'b' + i} x={1468 + i * 52} y={661} width={46} height={18} rx={6} fill="#D3EAF4" stroke={C.teal} strokeWidth={2} />
            ))}
            <Tx x={1570} y={730} size={24} w={700} fill={C.tealD}>
              centroacinar & duct cells
            </Tx>
          </An>
        </An>
      )}

      {/* ================= 2.3 / 2.4 organ view ================= */}
      {t > B23 - 0.7 && t < BOARD_T + 1 && (
        <World t={t} base={CAMB} op={worldIn}>
          <GutMap
            t={t}
            a={{ stom: tw(to(A('chyme leaves'), 0.45, { sy: 0.95, sx: 1.02 }), to(A('chyme leaves') + 0.45, 0.5, { sy: 1, sx: 1 })) }}
            stomFill={mix(C.pink, '#E58B80', flood)}
            sl={{
              under: zes && (
                <An t={t} tw={show(A('even in the jejunum') - 1.2, 0.5)}>
                  <Draw d={JEJ_D} p={prog(t, A('further along'), 1.2)} stroke={C.fleshD} strokeWidth={56} strokeLinecap="round" />
                  <Draw d={JEJ_D} p={prog(t, A('further along'), 1.2)} stroke={C.flesh} strokeWidth={47} strokeLinecap="round" />
                </An>
              ),
              overStom: <path d={STOM_D} fill={C.red} opacity={v(t, 0, [A('hydrochloric acid') - 0.3, 0.8, 0.25], [B24, 0.5, 0]) + floodPulse * flood} />,
              overDuo: (
                <>
                  <Draw d={DUO_FIRST} p={prog(t, A('chyme leaves') + 0.4, 2.4)} stroke={mix(C.red, '#D9C3AE', neut)} strokeWidth={40} strokeLinecap="round" opacity={0.4 * (1 - prog(t, B24, 0.6))} />
                  <Draw d={TEAL_D} p={prog(t, A('neutralizes that acid'), 1.4)} stroke={C.teal} strokeWidth={34} strokeLinecap="round" opacity={0.35 * (1 - prog(t, B24, 0.6))} />
                  {zes && <Draw d={DUO_D} p={redFront} stroke={C.red} strokeWidth={40} strokeLinecap="round" opacity={0.45} />}
                  {zes && <Draw d={JEJ_D} p={prog(t, A('even in the jejunum'), 1.2)} stroke={C.red} strokeWidth={40} strokeLinecap="round" opacity={0.45} />}
                  {ero > 0 && <ellipse cx={668} cy={790} rx={30} ry={46} fill={C.red} opacity={ero} />}
                  {zes &&
                    ulcers.map(([x, y, at], i) => (
                      <An t={t} tw={pop(at, 0.5)} key={i}>
                        <ellipse cx={x} cy={y} rx={17} ry={12} fill="#7E2622" stroke="#fff" strokeWidth={2.5} />
                      </An>
                    ))}
                </>
              ),
              top: (
                <>
                  <An t={t} tw={tw(show(A('chyme leaves') + 0.3, 0.3), fade(B24, 0.4))}>
                    <g transform={`translate(${ptAt(DUO_D, bolusP).join(',')})`}>
                      <circle cx={0} cy={0} r={20} fill={mix(C.red, '#C9B39C', neut)} opacity={0.85} />
                      <circle cx={-14} cy={6} r={13} fill={mix(C.red, '#C9B39C', neut)} opacity={0.7} />
                    </g>
                  </An>
                  {/* gastrinoma */}
                  <An t={t} tw={pop(A('gastrin secreting tumor'), 0.7)}>
                    <path d="M730,880 C720,850 760,830 790,846 C820,836 840,870 822,894 C830,920 790,935 770,920 C740,930 720,905 730,880 Z" fill="#B784A7" stroke="#7E4E70" strokeWidth={4} />
                  </An>
                  {zes &&
                    t > A('gastrin secreting tumor') + 0.4 &&
                    [0, 1, 2, 3, 4, 5].map((k) => {
                      const p = (((t - A('gastrin secreting tumor')) * 0.4 + k / 6) % 1 + 1) % 1;
                      const [x, y] = ptAt(GASTRIN_D, p);
                      return <circle key={k} cx={x} cy={y} r={9} fill="#9B6A8C" stroke="#fff" strokeWidth={2.5} opacity={Math.sin(p * Math.PI)} />;
                    })}
                </>
              ),
            }}
          />
        </World>
      )}
      {/* tags on the organ view */}
      {t > B23 && t < BOARD_T + 1 && (
        <>
          <An t={t} tw={tw(slideIn(A('hydrochloric acid'), -20, 0), fade(B24, 0.4))}>
            <Tag x={600} y={420} size={28} fill={C.red} color="#fff">
              HCl
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(A('pepsin'), -20, 0), fade(B24, 0.4))}>
            <Tag x={600} y={490} size={28} fill={mix(C.redL, C.greyL, pepGrey)} color={mix(C.redD, C.greyD, pepGrey)}>
              pepsin
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(A('ph around two') - 0.2, 0, 50), fade(BOARD_T - 0.3, 0.4))}>
            <PhStrip x={190} y={985} w={600} value={phVal} id="ph2b" card />
          </An>
          {/* three jobs cards */}
          {[
            [1, 'Neutralize acid', '→ pH 7–8 (enzyme optimum)', A('first it neutralizes')],
            [2, 'Protect the duodenal mucosa', 'from acid and pepsin', A('second by removing')],
            [3, 'Digest', 'carbohydrate, fat, protein', A('third it delivers')],
          ].map(([n, l1, l2, at], i) => (
            <An t={t} tw={tw(slideIn(at as number, 40, 0), fade(B24, 0.5))} key={i}>
              <Card x={1290} y={250 + i * 210} w={590} h={180} rx={24} stroke={C.teal} sw={3} />
              <StepBadge n={n as number} x={1350} y={300 + i * 210} color={C.teal} />
              <Tx x={1395} y={300 + i * 210} size={32} w={800} anchor="start">
                {l1 as string}
              </Tx>
              <Tx x={1395} y={350 + i * 210} size={26} w={500} fill={C.ink2} anchor="start">
                {l2 as string}
              </Tx>
              {i === 2 &&
                [0, 1, 2].map((k) => (
                  <g key={k}>
                    <FoodIcon kind={k} x={1440 + k * 150} y={395 + i * 210} split={cut3} />
                  </g>
                ))}
            </An>
          ))}
          <An t={t} tw={tw(show(A('delivers the enzymes') + 0.2, 0.3), fade(B24, 0.5))}>
            {[0, 1, 2].map((k) => (
              <g key={k} transform={`translate(${-60 * (1 - prog(t, A('delivers the enzymes') + 0.2, 0.7))},0)`}>
                <Enzyme x={1395 + k * 150} y={395 + 2 * 210} r={14} />
              </g>
            ))}
          </An>
        </>
      )}

      {/* ================= 2.4 clinical link ================= */}
      {zes && t < BOARD_T + 1 && (
        <>
          <An t={t} tw={tw(show(B24, 0.5), fade(BOARD_T - 0.3, 0.4))}>
            <ClinicalFrame />
            <Tag x={760} y={70} size={30} w={800} fill="#fff" stroke={C.red} color={C.redD}>
              Zollinger–Ellison syndrome
            </Tag>
          </An>
          <An t={t} tw={tw(show(A('gastrin secreting tumor') + 0.2), fade(BOARD_T - 0.3, 0.4))}>
            <Tag x={190} y={820} size={26} fill="#E9D3E2" color="#6B3E5E">
              gastrinoma
            </Tag>
          </An>
          <An t={t} tw={tw(slideIn(A('gastrin secreting tumor') + 0.4, 40, 0), fade(BOARD_T - 0.3, 0.4))}>
            <Caption x={1560} y={240} size={28}>
              gastrinoma → ↑ gastrin → ↑↑ acid
            </Caption>
          </An>
          <An t={t} tw={tw(slideIn(A('even in the jejunum') + 0.3, 40, 0), fade(BOARD_T - 0.3, 0.4))}>
            <Caption x={1560} y={340} size={28}>
              distal duodenal + jejunal ulcers
            </Caption>
          </An>
          <An t={t} tw={tw(slideIn(A('pancreatic lipase') - 0.1, 40, 0), fade(BOARD_T - 0.3, 0.4))}>
            <Card x={1290} y={420} w={560} h={330} rx={24} />
            <Enzyme x={1400} y={560} r={42} active={1 - lipGrey} label="lipase" lsize={26} />
            <An t={t} tw={slideIn(A('lipase is inactivated') + 0.6, 0, 10)}>
              <Tag x={1400} y={470} size={22} fill={C.greyL} color={C.ink2}>
                inactivated
              </Tag>
            </An>
            {t > A('fat goes undigested') &&
              [0, 1, 2, 3].map((k) => {
                const p = (((t - A('fat goes undigested')) * 0.35 + k / 4) % 1 + 1) % 1;
                return <circle key={k} cx={1480 + p * 330} cy={560 + Math.sin(p * 6 + k) * 18} r={16} fill="#F7E08A" stroke="#C9A93A" strokeWidth={3} opacity={Math.sin(p * Math.PI)} />;
              })}
            <An t={t} tw={slideIn(A('fatty stools'), 0, 20)}>
              <Tag x={1660} y={690} size={28} fill="#FBF0C4" color="#8A6D12">
                steatorrhea
              </Tag>
            </An>
          </An>
          <An t={t} tw={tw(slideIn(A('fatty stools') + 0.4, 40, 0), fade(BOARD_T - 0.3, 0.4))}>
            <Caption x={1570} y={820} size={28}>
              lipase inactivated → steatorrhea
            </Caption>
          </An>
        </>
      )}

      {/* ================= board: bicarbonate enables enzymes ================= */}
      {t > BOARD_T - 0.6 && (
        <An t={t} tw={show(BOARD_T - 0.4, 0.5)}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
          <Board t={t} a={boardIn(BOARD_T - 0.4)} shown={{ a0: true, a1: true, t0: true, t1: true }} />
          <Arrow d="M1300,285 C1210,248 1040,248 950,285" color="teal" sw={7} p={prog(t, A('allows the enzymes') - 0.2, 0.9)} />
          <An t={t} tw={show(A('allows the enzymes') + 0.4)}>
            <Tag x={1125} y={228} size={20} fill={C.tealL} color={C.tealD}>
              bicarbonate enables enzymes
            </Tag>
          </An>
        </An>
      )}

      <TitleCard t={t} n={2} title="Pancreatic juice" question="What does the pancreas actually secrete, and why is it built that way?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

void [clamp, move];
