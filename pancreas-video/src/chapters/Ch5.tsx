// Chapter 5 — Unlocking
import React from 'react';
import { An, Arrow, Card, Draw, ptAt, Tag, Tx } from '../lib/prims';
import { Board, boardIn, Caption, ClinicalFrame, CBD_D, Enzyme, GutMap, Key, PANC_D, PDUCT_D, Shield, TitleCard, Glow } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, pop, prog, resolve, rnd, show, slideIn, to, tw, v } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { cam, Stage, toScreen, useChapterT, World } from '../lib/scene';

const K = anchors(5);
const { A } = K;
const [c0] = K.span;
const B52 = A('trypsin then becomes');
const AUTO = A('autocatalytically');
const MAP_T = A('the logic is beautiful');
const B53 = A('now imagine');
const BODY_T = A('this is acute pancreatitis');
const BOARD_T = A('we can now fill');

// villi along the bottom
const VILLI = Array.from({ length: 9 }, (_, i) => 120 + i * 210);
const villusD = (x: number) => `M${x - 80},1080 L${x - 80},760 C${x - 80},640 ${x + 80},640 ${x + 80},760 L${x + 80},1080`;

const CASC = [
  { name: ['chymotrypsinogen', 'chymotrypsin'], at: 'chymotrypsinogen into' },
  { name: ['procarboxypeptidase', 'carboxypeptidase'], at: 'procarboxypeptidase into' },
  { name: ['proelastase', 'elastase'], at: 'proelastase into' },
  { name: ['prophospholipase', 'phospholipase A₂'], at: 'phospholipase' },
  { name: ['procolipase', 'colipase'], at: 'colipase' },
];

// map camera for 5.3
const CAMB = { cx: 1050, cy: 600, cs: 1.0 };
const CAMS = [cam(B53 + 0.6, 1.6, 820, 720, 1.6), cam(A('pool inside') - 0.5, 1.4, 1000, 680, 1.2)];

export const Ch5: React.FC = () => {
  const t = useChapterT(5);
  // 5.1
  const tKey = A('enteropeptidase');
  const keyRise = prog(t, tKey - 0.2, 1.2, E.out);
  const tJob = A('enteropeptidase has one job');
  const tSnip = A('snips a short peptide');
  const tryIn = prog(t, tJob - 0.6, 2.0, E.out);
  const turn = prog(t, tSnip - 0.2, 0.6);
  const act1 = prog(t, A('active trypsin') - 0.1, 0.6);
  // 5.2
  const trypX = (() => {
    let x = 230;
    CASC.forEach((c, i) => {
      x = x + (330 * i + 470 - x) * prog(t, A(c.at) - 0.6, 0.6);
    });
    return x;
  })();
  const branch = (lvl: number) => prog(t, AUTO + 0.3 + lvl * 0.7, 0.6, E.out);
  // 5.3
  const camS = resolve(t, CAMS, CAMB);
  const S = (x: number, y: number) => toScreen(x, y, camS);
  const stoneT = A('gallstone');
  const stoneP = prog(t, stoneT, 0.9, E.in);
  const pile = prog(t, A('pool inside'), 4);
  const swamp = prog(t, A('overwhelmed') - 0.3, 1.5);
  const heat = prog(t, A('digest itself') - 0.4, 2.2);
  const swarm = prog(t, A('only so much'), 5.5);

  return (
    <Stage>
      {/* ================= 5.1 the key in the duodenum ================= */}
      {t < B52 + 1 && (
        <An t={t} tw={tw(show(K.firstContent - 0.3, 0.6), fade(B52 - 0.3, 0.6))}>
          <rect x={0} y={0} width={1920} height={1080} fill="#FBEEE6" />
          {/* chyme wash */}
          {t > A('when chyme touches') &&
            Array.from({ length: 12 }, (_, i) => {
              const p = ((((t - A('when chyme touches')) * 0.12 + i / 12) % 1) + 1) % 1;
              return <circle key={i} cx={-100 + p * 2100} cy={560 + Math.sin(i * 1.7 + t) * 40} r={20 + (i % 3) * 8} fill="#D9A07A" opacity={0.35 * Math.min(1, (t - A('when chyme touches')) / 0.8)} />;
            })}
          {VILLI.map((x, i) => (
            <g key={i}>
              <path d={villusD(x)} fill="#F2C4B0" stroke="#C98479" strokeWidth={4} />
              {Array.from({ length: 13 }, (_, k) => {
                const a = Math.PI + (k / 12) * Math.PI;
                const cx = x + 80 * Math.cos(a), cy = 720 + 80 * Math.sin(a) * 0.9;
                return <line key={k} x1={cx} y1={cy} x2={cx + 14 * Math.cos(a)} y2={cy + 14 * Math.sin(a)} stroke="#C98479" strokeWidth={3} strokeLinecap="round" />;
              })}
            </g>
          ))}
          <An t={t} tw={show(A('intestinal mucosa'), 0.4)}>
            <Tag x={1530} y={1010} size={26} fill="#fff" stroke={C.pinkD}>
              brush border (duodenal mucosa)
            </Tag>
          </An>
          {/* key rises from the brush border */}
          {t > tKey - 0.2 && (
            <g opacity={Math.min(1, keyRise * 2)}>
              <Key
                x={960 + (800 - 960) * prog(t, tSnip - 1.3, 1.0)}
                y={640 - 210 * keyRise + (389 - 430) * prog(t, tSnip - 1.3, 1.0)}
                s={1.6}
                r={180 * prog(t, tSnip - 1.3, 1.0) + 90 * turn}
              />
            </g>
          )}
          <An t={t} tw={slideIn(tKey + 0.4, 0, 20)}>
            <Tag x={960} y={210} size={30} fill={C.goldL} color="#7A5E14">
              enteropeptidase (enterokinase)
            </Tag>
          </An>
          {/* trypsinogen drifts in */}
          {t > tJob - 0.6 && (
            <g transform={`translate(${-200 + 900 * tryIn},0)`}>
              <Enzyme x={0} y={430} r={58} active={act1} lock={turn < 0.5} lockOpen={turn} />
              {/* activation peptide */}
              <g transform={`translate(${-70 - 120 * prog(t, tSnip + 0.3, 1)},${430 + 140 * prog(t, tSnip + 0.3, 1)}) rotate(${200 * prog(t, tSnip + 0.3, 1)})`} opacity={1 - prog(t, tSnip + 2.5, 0.6)}>
                <circle cx={0} cy={0} r={12} fill={C.grey} />
                <circle cx={20} cy={4} r={10} fill={C.grey} />
              </g>
              <Tx x={0} y={540} size={30} w={800} fill={act1 > 0.5 ? C.amberD : C.greyD}>
                {act1 > 0.5 ? 'trypsin' : 'trypsinogen'}
              </Tx>
            </g>
          )}
          <An t={t} tw={slideIn(tSnip + 0.6, 0, 20)}>
            <Tag x={500} y={640} size={22} fill={C.greyL} color={C.ink2}>
              activation peptide
            </Tag>
          </An>
          <An t={t} tw={slideIn(A('active trypsin') + 0.2, 0, 20)}>
            <Tag x={1220} y={430} size={28} fill={C.amberL} color={C.amberD}>
              trypsinogen → trypsin
            </Tag>
          </An>
        </An>
      )}

      {/* ================= 5.2 master switch + feedback ================= */}
      {t > B52 - 0.4 && t < MAP_T + 0.8 && (
        <An t={t} tw={tw(show(B52 - 0.3, 0.5), fade(MAP_T - 0.2, 0.5))}>
          <Tx x={960} y={90} size={34} w={800} fill={C.amberD}>
            trypsin activates…
          </Tx>
          {CASC.map((c, i) => {
            const on = prog(t, A(c.at) - 0.1, 0.5);
            const x = 470 + 330 * i;
            return (
              <g key={i}>
                <Enzyme x={x} y={260} r={46} active={on} lock={on < 0.5} lockOpen={on} />
                <Tx x={x} y={345} size={on > 0.5 ? 26 : 22} w={700} fill={on > 0.5 ? C.amberD : C.greyD}>
                  {on > 0.5 ? c.name[1] : c.name[0]}
                </Tx>
              </g>
            );
          })}
          {/* the trypsin that walks along the row */}
          <g transform={`translate(${trypX - 230},0)`} opacity={1 - prog(t, AUTO - 0.4, 0.4)}>
            <Enzyme x={230} y={150} r={34} />
            <Tx x={230} y={100} size={22} w={800} fill={C.amberD}>
              trypsin
            </Tx>
          </g>
          {/* autocatalysis: 1 → 2 → 4 → 8 */}
          {t > AUTO - 0.3 && (
            <g>
              <Tx x={960} y={470} size={28} w={700} fill={C.ink2}>
                trypsin activates more trypsinogen (autocatalysis)
              </Tx>
              {[0, 1, 2, 3].map((lvl) => {
                const n = 2 ** lvl;
                const b = lvl === 0 ? 1 : branch(lvl - 1);
                return Array.from({ length: n }, (_, k) => {
                  const x = 960 + (k - (n - 1) / 2) * (lvl === 3 ? 110 : 900 / n);
                  const y = 560 + lvl * 120;
                  const px = lvl === 0 ? x : 960 + (Math.floor(k / 2) - (n / 2 - 1) / 2) * (lvl - 1 === 3 ? 110 : 900 / (n / 2));
                  const py = y - 120;
                  return (
                    <g key={`${lvl}-${k}`} opacity={b}>
                      {lvl > 0 && <line x1={px} y1={py + 30} x2={px + (x - px) * b} y2={py + 30 + (y - py - 60) * b} stroke={C.amber} strokeWidth={4} />}
                      <Enzyme x={px + (x - px) * b} y={py + (y - py) * b} r={26} />
                    </g>
                  );
                });
              })}
              {[1, 2, 4, 8].map((n, lvl) => (
                <g key={n} opacity={lvl === 0 ? 1 : branch(lvl - 1)}>
                  <Tx x={1560} y={560 + lvl * 120} size={34} w={800} fill={C.amberD}>
                    {`×${n}`}
                  </Tx>
                </g>
              ))}
              <An t={t} tw={pop(A('positive feedback') - 0.1, 0.6)}>
                <path d="M300,760 A110,110 0 1 1 380,890" fill="none" stroke={C.amber} strokeWidth={8} markerEnd="url(#ar-amber)" />
                <Tx x={300} y={760} size={26} w={800} fill={C.amberD}>
                  positive
                </Tx>
                <Tx x={300} y={795} size={26} w={800} fill={C.amberD}>
                  feedback
                </Tx>
              </An>
            </g>
          )}
        </An>
      )}

      {/* ================= 5.2 map: locked vs unlocked ; 5.3 papilla view ================= */}
      {t > MAP_T - 0.5 && t < BODY_T + 0.6 && (
        <An t={t} tw={tw(show(MAP_T - 0.3, 0.6), fade(BODY_T - 0.3, 0.6))}>
          <World t={t} base={CAMB} cam={CAMS}>
            <GutMap
              t={t}
              a={{ stom: [to(-1, 0.01, { o: 0.25 })], pduct: tw(show(B53 + 1, 0.6)) }}
              pductW={6 + 10 * pile}
              pductStroke={mix(C.amberD, C.amber, pile)}
              sl={{
                behindPanc: <Glow d={PANC_D} color={C.red} op={heat * 0.7} />,
                overPanc: (
                  <>
                    {heat > 0 && (
                      <g clipPath="url(#pclip)">
                        {Array.from({ length: 40 }, (_, i) => (
                          <circle
                            key={i}
                            cx={700 + ((i * 113) % 840)}
                            cy={600 + ((i * 61) % 260)}
                            r={30 + (i % 4) * 12}
                            fill={i % 3 ? C.red : '#7E2622'}
                            opacity={clamp(heat * 2 - (i % 10) * 0.12) * (i % 3 ? 0.35 : 0.5)}
                          />
                        ))}
                      </g>
                    )}
                    {/* pooled granules */}
                    {pile > 0 &&
                      Array.from({ length: 34 }, (_, i) => {
                        const x = 760 + ((i * 89) % 720), y = 660 + ((i * 47) % 90) - (x - 760) * 0.09;
                        return <circle key={i} cx={x} cy={y} r={9} fill={C.amber} stroke={C.amberD} strokeWidth={2} opacity={clamp(pile * 1.4 - (i % 12) * 0.08)} />;
                      })}
                  </>
                ),
                top: t > stoneT - 0.05 && (
                  <g transform={`translate(${ptAt(CBD_D, 0.55 + 0.45 * stoneP).join(',')})`}>
                    <ellipse cx={0} cy={0} rx={13} ry={10} fill="#8B7A5C" stroke="#5A4C34" strokeWidth={3} />
                  </g>
                ),
              }}
            />
          </World>
          {/* map icons (5.2) */}
          {t < B53 + 0.3 && (
            <An t={t} tw={fade(B53 - 0.2, 0.5)}>
              {[0, 1, 2, 3].map((k) => {
                const [x, y] = S(860 + k * 170, 720 - k * 30);
                return (
                  <An t={t} tw={pop(MAP_T + 0.4 + k * 0.12, 0.5)} key={'p' + k}>
                    <Enzyme x={x} y={y} r={24} active={0} lock />
                  </An>
                );
              })}
              {[0, 1, 2].map((k) => {
                const [x, y] = S(700 + k * 140, 905 - (k === 0 ? 120 : 0));
                return (
                  <An t={t} tw={pop(A('only in the intestine') + 0.2 + k * 0.12, 0.5)} key={'d' + k}>
                    <Enzyme x={x} y={y} r={24} />
                  </An>
                );
              })}
              <An t={t} tw={pop(A('only in the intestine') - 0.1, 0.6)}>
                <Key x={S(860, 960)[0]} y={S(860, 960)[1]} s={1.1} />
                <circle cx={S(860, 905)[0]} cy={S(860, 905)[1]} r={8} fill={C.gold} />
              </An>
              <An t={t} tw={slideIn(MAP_T + 0.6, 0, 20)}>
                <Tag x={S(1200, 560)[0]} y={S(1200, 560)[1] - 40} size={28} fill={C.greyL} color={C.ink}>
                  pancreas: locked
                </Tag>
              </An>
              <An t={t} tw={slideIn(A('only in the intestine') + 0.4, 0, 20)}>
                <Tag x={S(900, 1010)[0]} y={S(900, 1010)[1] + 20} size={28} fill={C.amberL} color={C.amberD}>
                  duodenum: unlocked
                </Tag>
              </An>
            </An>
          )}
          {/* pancreatitis overlays */}
          {t > B53 && (
            <>
              <An t={t} tw={tw(show(B53, 0.5))}>
                <ClinicalFrame />
                <Tag x={720} y={70} size={30} w={800} fill="#fff" stroke={C.red} color={C.redD}>
                  Acute pancreatitis
                </Tag>
              </An>
              <An t={t} tw={slideIn(stoneT + 0.6, 0, 20)}>
                <Tag x={420} y={250} size={26} fill="#fff" stroke={C.greyL}>
                  gallstone at the papilla
                </Tag>
              </An>
              <An t={t} tw={pop(A('alcohol') - 0.1, 0.6)}>
                <g transform="translate(420,380)">
                  <path d="M-14,-60 L14,-60 L14,-30 C30,-20 34,0 34,20 L34,60 C34,70 28,76 18,76 L-18,76 C-28,76 -34,70 -34,60 L-34,20 C-34,0 -30,-20 -14,-30 Z" fill="#B9D8C2" stroke="#4E7D5E" strokeWidth={4} />
                  <rect x={-34} y={10} width={68} height={34} fill="#fff" opacity={0.7} />
                </g>
                <Tag x={420} y={500} size={24} fill="#fff" stroke={C.greyL}>
                  or injury (e.g. alcohol)
                </Tag>
              </An>
              {/* chain caption */}
              <An t={t} tw={tw(slideIn(A('pool inside') - 0.2, 0, 20))}>
                <Card x={460} y={880} w={1000} h={120} rx={26} />
                {[
                  ['enzymes pool', A('pool inside') - 0.2, C.amberD],
                  ['inhibitor overwhelmed', A('overwhelmed'), C.ink2],
                  ['autodigestion', A('digest itself') - 0.2, C.redD],
                ].map(([s, at, c], i) => (
                  <An t={t} tw={show(at as number, 0.4)} key={i}>
                    <Tx x={640 + i * 330} y={940} size={30} w={800} fill={c as string}>
                      {(i ? '→ ' : '') + (s as string)}
                    </Tx>
                  </An>
                ))}
              </An>
              {/* shields swamped by trypsin */}
              {t > A('only so much') - 0.3 && (
                <g>
                  {[0, 1, 2, 3, 4].map((k) => {
                    const [x, y] = S(880 + k * 150, 690 - k * 26);
                    return (
                      <g key={'s' + k} opacity={(1 - swamp * 0.85) * prog(t, A('only so much') - 0.3, 0.5)}>
                        <Shield x={x} y={y - 50} s={0.8} stroke={mix(C.ink2, C.grey, swamp)} />
                      </g>
                    );
                  })}
                  {Array.from({ length: 30 }, (_, i) => {
                    const appear = clamp(swarm * 1.6 - i / 30);
                    if (appear <= 0) return null;
                    const [x, y] = S(820 + ((i * 97) % 700) + Math.sin(t * 2 + i) * 10, 640 + ((i * 41) % 110) - ((i * 97) % 700) * 0.09);
                    return (
                      <g key={'tr' + i} opacity={appear}>
                        <Enzyme x={x} y={y - 40} r={13} />
                      </g>
                    );
                  })}
                </g>
              )}
            </>
          )}
        </An>
      )}

      {/* ================= 5.3b patient ================= */}
      {t > BODY_T - 0.5 && t < BOARD_T + 0.6 && (
        <An t={t} tw={tw(show(BODY_T - 0.3, 0.5), fade(BOARD_T - 0.3, 0.5))}>
          <ClinicalFrame />
          <Tag x={720} y={70} size={30} w={800} fill="#fff" stroke={C.red} color={C.redD}>
            Acute pancreatitis
          </Tag>
          {/* side-view silhouette facing right */}
          <g>
            <circle cx={620} cy={250} r={90} fill="#F6E7D8" stroke="#DCC3A9" strokeWidth={5} />
            <path d="M585,320 L655,320 C700,330 760,380 770,450 C790,540 800,620 780,720 C760,820 740,900 735,960 L555,960 C548,820 540,600 548,450 C552,380 565,340 585,320 Z" fill="#F6E7D8" stroke="#DCC3A9" strokeWidth={5} />
            <Tx x={830} y={600} size={20} w={700} fill={C.ink2} anchor="start">
              front
            </Tx>
            <Tx x={470} y={600} size={20} w={700} fill={C.ink2} anchor="end">
              back
            </Tx>
            <An t={t} tw={pop(A('upper abdominal pain') - 0.2, 0.6)}>
              <circle cx={772} cy={560} r={34 + 6 * Math.sin(t * 6)} fill={C.red} opacity={0.55} filter="url(#glowS)" />
              <circle cx={772} cy={560} r={16} fill={C.red} />
            </An>
            <Arrow d="M752,562 C690,565 600,580 535,600" color="red" sw={9} p={prog(t, A('radiating to the back') - 0.1, 0.9)} />
          </g>
          <An t={t} tw={slideIn(A('upper abdominal pain'), 30, 0)}>
            <Caption x={1300} y={300} size={30} fill={C.redL} color={C.redD} stroke="none">
              epigastric pain → back
            </Caption>
          </An>
          <An t={t} tw={slideIn(A('leak into'), 30, 0)}>
            <Tx x={1300} y={420} size={26} w={600} fill={C.ink2}>
              enzymes leak into the blood
            </Tx>
          </An>
          {[
            ['↑ lipase (more specific)', A('lipase and amylase') - 0.1, 500],
            ['↑ amylase', A('lipase and amylase') + 0.4, 590],
          ].map(([s, at, y], i) => (
            <An t={t} tw={slideIn(at as number, 0, 30)} key={i}>
              <Tag x={1300} y={y as number} size={32} fill={C.amberL} color={C.amberD} shadow>
                {s as string}
              </Tag>
            </An>
          ))}
          <An t={t} tw={slideIn(A('circulatory shock') - 0.2, 30, 0)}>
            <Card x={1060} y={680} w={480} h={200} rx={26} />
            <Tx x={1150} y={730} size={26} w={800} fill={C.redD}>
              BP
            </Tx>
            <path d={`M1190,730 L1290,${730 + 45 * prog(t, A('circulatory shock'), 1.4)} L1400,${735 + 55 * prog(t, A('circulatory shock'), 1.4)}`} fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" markerEnd="url(#ar-red)" />
            <Tx x={1300} y={845} size={26} w={700} fill={C.redD}>
              severe: shock
            </Tx>
          </An>
          <An t={t} tw={slideIn(A('the same positive feedback'), 0, 20)}>
            <Tag x={960} y={970} size={28} fill={C.ink} color="#fff">
              same positive feedback: fast digestion, catastrophic failure
            </Tag>
          </An>
        </An>
      )}

      {/* ================= 5.4 board ================= */}
      {t > BOARD_T - 0.6 && (
        <An t={t} tw={show(BOARD_T - 0.4, 0.5)}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
          <Board
            t={t}
            a={{
              ...boardIn(BOARD_T - 0.4),
              a5: show(A('causing pancreatitis') - 0.1, 0.6),
              warnA: pop(A('causing pancreatitis') + 0.2, 0.5),
              t5: show(A('cystic fibrosis') - 0.1, 0.6),
              warnT: pop(A('cystic fibrosis') + 0.2, 0.5),
            }}
            shown={{ a0: true, a1: true, t0: true, t1: true, noteA: true, noteT: true }}
          />
        </An>
      )}

      <TitleCard t={t} n={5} title="Unlocking" question="If everything leaves the pancreas locked, where is the key?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

void [Draw, PDUCT_D, rnd, v];
