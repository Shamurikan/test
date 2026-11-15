// Chapter 4 — The enzyme factory
import React from 'react';
import { An, Arrow, Card, Draw, ptAt, Tag, Tx } from '../lib/prims';
import { Acinus, Board, boardIn, Caption, Enzyme, Hex, LockIcon, Shield, TitleCard, AMap } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, pop, prog, pulse, rnd, show, slideIn, to, tw, v } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { Stage, useChapterT } from '../lib/scene';

const K = anchors(4);
const { A } = K;
const [c0] = K.span;
const B42 = A('enzymes are synthesized');
const B43 = A('they wait for a signal');
const B44 = A('here is the critical');
const B45 = A('but a lock can fail');
const BOARD_T = A('on the board');

// ---------- upright acinar cell geometry (screen coords) ----------
export const CELL_D = 'M640,960 C620,960 610,945 616,925 L842,190 C848,172 860,162 880,162 L1040,162 C1060,162 1072,172 1078,190 L1304,925 C1310,945 1300,960 1280,960 Z';
export const GRANULES: [number, number][] = Array.from({ length: 22 }, (_, i) => {
  const row = Math.floor(i / 5), col = i % 5;
  const y = 215 + row * 46 + (rnd(i) - 0.5) * 10;
  const half = 85 + (y - 200) * 0.3;
  return [960 - half + 26 + (col * (2 * half - 52)) / 4 + (rnd(i + 9) - 0.5) * 10, y];
});
const ER_LINES = [0, 1, 2, 3, 4].map((k) => {
  const y = 820 + k * 26;
  const half = 240 + (y - 800) * 0.32;
  return `M${960 - half},${y} C${960 - half / 2},${y - 14} ${960 + half / 2},${y + 14} ${960 + half},${y}`;
});
const ER_SIDE = [
  'M720,620 C740,660 730,720 700,770',
  'M745,610 C765,650 755,715 728,768',
  'M1200,620 C1180,660 1190,720 1220,770',
  'M1175,610 C1155,650 1165,715 1192,768',
];
const MITO: [number, number, number][] = [
  [745, 880, 15],
  [1180, 875, -18],
  [790, 560, 60],
  [1130, 560, -60],
];
const GOLGI = [0, 1, 2, 3].map((k) => `M${885 - k * 6},${505 + k * 18} C${930},${480 + k * 18} ${990},${480 + k * 18} ${1035 + k * 6},${505 + k * 18}`);

export const AcinarCell: React.FC<{
  t: number;
  a?: AMap;
  erHi?: number;
  mitoHi?: number;
  granHi?: number;
  granN?: number; // granules shown
  locks?: number; // 0..1 padlocks on granules
  ca?: number; // calcium wave progress 0..1 (-1 none)
  sl?: Partial<Record<'under' | 'inside' | 'top', React.ReactNode>>;
}> = ({ t, a = {}, erHi = 0, mitoHi = 0, granHi = 0, granN = 22, locks = 0, ca = -1, sl = {} }) => (
  <g>
    {/* lumen + capillary */}
    <An t={t} tw={a.lumen}>
      <rect x={560} y={40} width={800} height={110} rx={50} fill="#FFF9EE" stroke="#E8D9BF" strokeWidth={3} />
      <Tx x={1450} y={95} size={24} w={700} fill={C.ink2} anchor="start">
        acinus lumen
      </Tx>
    </An>
    <An t={t} tw={a.cap}>
      <rect x={430} y={985} width={1060} height={70} rx={35} fill="#F7D9D5" stroke="#D9847C" strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse key={i} cx={520 + i * 170} cy={1020} rx={30} ry={16} fill="#E27E73" />
      ))}
      <Tx x={1520} y={1020} size={24} w={700} fill="#B5544B" anchor="start">
        capillary
      </Tx>
    </An>
    {sl.under}
    <An t={t} tw={a.cell}>
      <path d={CELL_D} fill="#FBEFDD" stroke={C.pancD} strokeWidth={6} />
      <defs>
        <clipPath id="cellclip">
          <path d={CELL_D} />
        </clipPath>
      </defs>
      {ca >= 0 && ca < 1.2 && (
        <g clipPath="url(#cellclip)">
          <rect x={600} y={960 - 900 * ca} width={720} height={260} fill={C.violetL} opacity={0.55 * (1 - Math.max(0, ca - 0.8) / 0.4)} />
        </g>
      )}
      {/* RER */}
      <g>
        {[...ER_LINES, ...ER_SIDE].map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke={mix('#C9A2C8', C.violet, erHi)} strokeWidth={5 + erHi * 2} strokeLinecap="round" />
            {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((p) => {
              const [x, y] = ptAt(d, p);
              return <circle key={p} cx={x} cy={y - 6} r={3.5} fill={C.ink2} />;
            })}
          </g>
        ))}
      </g>
      {/* mitochondria */}
      {MITO.map(([x, y, r]) => (
        <g key={x} transform={`rotate(${r},${x},${y})`}>
          <ellipse cx={x} cy={y} rx={44 + mitoHi * 4} ry={20 + mitoHi * 2} fill={mix('#F6DCC8', '#F2B48E', mitoHi)} stroke="#D8A88A" strokeWidth={3} />
          <path d={`M${x - 30},${y} q10,-12 20,0 t20,0 t20,0`} fill="none" stroke="#D8A88A" strokeWidth={2.5} />
        </g>
      ))}
      {/* nucleus */}
      <circle cx={960} cy={700} r={92} fill="#DCD3EA" stroke="#9A89BC" strokeWidth={4} />
      <circle cx={985} cy={690} r={22} fill="#B9A9D3" />
      {/* Golgi */}
      {GOLGI.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#C7A35A" strokeWidth={9} strokeLinecap="round" />
      ))}
      {/* granules */}
      {GRANULES.slice(0, granN).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={17 + granHi * 2} fill={C.amber} stroke={C.amberD} strokeWidth={2.5} />
          {locks > 0 && (
            <g opacity={clamp(locks * 3 - (i % 6) * 0.25)}>
              <LockIcon x={x} y={y} s={0.7} color="#fff" />
            </g>
          )}
        </g>
      ))}
      {sl.inside}
    </An>
    {sl.top}
  </g>
);

// zymogen name with highlighted fragment
const ZName: React.FC<{ x: number; y: number; pre: string; hl: string; post: string; on: number; size?: number }> = ({ x, y, pre, hl, post, on, size = 30 }) => (
  <text x={x} y={y} fontFamily="Inter" fontSize={size} fontWeight={700} textAnchor="middle" dominantBaseline="central" fill={C.ink2}>
    <tspan>{pre}</tspan>
    <tspan fill={mix(C.ink2, C.greyD, on)} fontWeight={on > 0.5 ? 800 : 700} textDecoration={on > 0.5 ? 'underline' : undefined}>
      {hl}
    </tspan>
    <tspan>{post}</tspan>
  </text>
);

const ZYM = [
  { x: 330, y: 400, pre: 'trypsin', hl: 'ogen', post: '', at: 'trypsinogen' },
  { x: 760, y: 400, pre: 'chymotrypsin', hl: 'ogen', post: '', at: 'chymotrypsinogen' },
  { x: 1190, y: 400, pre: '', hl: 'pro', post: 'elastase', at: 'proelastase' },
  { x: 480, y: 660, pre: '', hl: 'pro', post: 'carboxypeptidase A & B', at: 'procarboxypeptidase' },
  { x: 1080, y: 660, pre: '', hl: 'pro', post: 'phospholipase A₂', at: 'phospholipase a two' },
];

export const Ch4: React.FC = () => {
  const t = useChapterT(4);
  const zoomIn = prog(t, K.firstContent + 0.8, 1.6, E.in);
  const cellIn = prog(t, K.firstContent + 1.8, 0.8);
  const erHi = Math.sin(clamp((t - A('rough endoplasmic reticulum')) / 2.2) * Math.PI);
  const mitoHi = Math.sin(clamp((t - A('mitochondria')) / 1.8) * Math.PI);
  const granHi = Math.sin(clamp((t - A('packed with granules')) / 1.6) * Math.PI);
  // assembly line
  const asmA = A('ribosomes'), asmB = A('and wait') + 0.3;
  const asm = (k: number, per: number) => (t < asmA || t > asmB ? null : (((t - asmA) / per + k / 4) % 1 + 1) % 1);
  const caP = t > A('calcium rises') ? prog(t, A('calcium rises'), 2.2) : -1;
  const exoT = A('fuse with the apical');
  const cellOut = prog(t, B44 - 0.4, 0.6);
  const bigShield = prog(t, A('the whole arsenal') - 0.1, 0.9, E.out);
  const flip = prog(t, A('activated too early'), 0.7);
  const tipT = A('chain reaction');
  const shieldT = A('trypsin inhibitor');
  const tip = (i: number) => (i === 0 ? 0 : 18 * prog(t, tipT + i * 0.15, 0.8) * (1 - 0.6 * prog(t, shieldT + 0.3, 0.6)));

  return (
    <Stage>
      {/* 4.1 acinus → push into one cell */}
      {t < K.firstContent + 3 && (
        <g opacity={1 - prog(t, K.firstContent + 1.8, 0.6)} transform={`translate(960,780) scale(${1 + zoomIn * 3}) translate(-960,-780)`}>
          <Acinus t={t} cx={960} cy={560} R={260} id="acg4" a={{ duct: [], cell4: pulse(K.firstContent + 0.2, 1.06) }} cellTint={0.25} />
        </g>
      )}
      {/* the upright acinar cell */}
      {t > K.firstContent + 1.6 && t < B44 + 0.5 && (
        <g opacity={cellIn * (1 - cellOut)}>
          <AcinarCell
            t={t}
            erHi={erHi}
            mitoHi={mitoHi}
            granHi={granHi}
            locks={prog(t, A('and wait'), 1.2)}
            ca={caP}
            granN={t > exoT ? 22 : 22}
            sl={{
              inside: (
                <>
                  {/* chains extruding from ribosomes */}
                  {[0, 1, 2, 3, 4, 5].map((k) => {
                    const p = asm(k * 0.67, 3.2);
                    if (p === null) return null;
                    // ribosome -> ER -> Golgi -> apex
                    const kk = k % 4;
                    const d = `M${800 + kk * 100},${860} C${820 + kk * 90},760 ${900 + kk * 30},620 ${940 + kk * 12},540 C${950},420 ${920 + kk * 30},330 ${880 + kk * 50},${250 + kk * 12}`;
                    const [x, y] = ptAt(d, p);
                    const r = p < 0.45 ? 9 : 11 + (p - 0.45) * 16;
                    const fill = p < 0.55 ? '#E8D2B0' : mix('#F3C88E', C.amber, (p - 0.55) / 0.45);
                    return <circle key={k} cx={x} cy={y} r={r} fill={fill} stroke={C.amberD} strokeWidth={p > 0.6 ? 2 : 1} opacity={Math.min(1, Math.sin(p * Math.PI) * 2)} />;
                  })}
                  {/* exocytosis: three granules fuse with the apical membrane */}
                  {t > exoT &&
                    [0, 1, 2].map((k) => {
                      const st = exoT + k * 0.8;
                      const p = prog(t, st, 1.2);
                      const x0 = [900, 960, 1020][k];
                      const y = 215 - 50 * p;
                      return (
                        <g key={k}>
                          <circle cx={x0} cy={y} r={17 * (1 - 0.6 * prog(t, st + 1.0, 0.5))} fill={C.amber} stroke={C.amberD} strokeWidth={2.5} opacity={1 - prog(t, st + 1.2, 0.5)} />
                          {p >= 1 &&
                            [0, 1, 2, 3, 4].map((j) => (
                              <circle key={j} cx={x0 + (j - 2) * 12 * prog(t, st + 1.1, 1)} cy={160 - 50 * prog(t, st + 1.1, 1.4) - j * 4} r={5} fill={C.amber} opacity={1 - prog(t, st + 2.4, 0.8)} />
                            ))}
                        </g>
                      );
                    })}
                </>
              ),
              top: (
                <>
                  {/* nerve + receptors */}
                  <An t={t} tw={show(A('acetylcholine') - 0.3, 0.4)}>
                    <Draw d="M180,1060 C300,1000 420,960 600,930" p={prog(t, A('acetylcholine') - 0.3, 0.8)} stroke={C.violet} strokeWidth={9} strokeLinecap="round" />
                    <circle cx={604} cy={928} r={14} fill={C.violet} />
                    <Tx x={300} y={940} size={22} w={700} fill={C.violet}>
                      vagus nerve
                    </Tx>
                  </An>
                  <An t={t} tw={pop(A('binds to receptors') - 0.2, 0.5)}>
                    <path d="M680,948 l-14,-26 l28,0 z" fill={C.violet} />
                    <path d="M1240,948 l-14,-26 l28,0 z" fill={C.amber} />
                  </An>
                  {/* ACh token docking */}
                  {t > A('acetylcholine') && (
                    <g transform={`translate(${620 + 60 * prog(t, A('acetylcholine') + 0.3, 1)},${930 + 10 * prog(t, A('acetylcholine') + 0.3, 1)})`} opacity={1 - prog(t, B44 - 1, 0.5)}>
                      <circle cx={0} cy={0} r={22} fill={C.violet} stroke="#fff" strokeWidth={3} />
                      <Tx x={0} y={1} size={15} w={800} fill="#fff">
                        ACh
                      </Tx>
                    </g>
                  )}
                  {t > A('cholecystokinin') && (
                    <g transform={`translate(1240,${1020 - 70 * prog(t, A('cholecystokinin'), 1.2)})`} opacity={1 - prog(t, B44 - 1, 0.5)}>
                      <Hex x={0} y={0} r={24} fill={C.amber} label="CCK" size={13} />
                    </g>
                  )}
                  <An t={t} tw={slideIn(A('acetylcholine') + 0.6, -20, 0)}>
                    <Tag x={360} y={860} size={22} fill={C.violetL} color={C.violet}>
                      ACh (muscarinic)
                    </Tag>
                  </An>
                  <An t={t} tw={slideIn(A('cholecystokinin') + 0.5, 20, 0)}>
                    <Tag x={1560} y={900} size={22} fill={C.amberL} color={C.amberD}>
                      CCK
                    </Tag>
                  </An>
                  <An t={t} tw={slideIn(A('calcium rises') - 0.2, -20, 0)}>
                    <Card x={180} y={560} w={330} h={200} rx={22} />
                    <Tx x={345} y={605} size={26} w={800}>
                      receptor → Gq
                    </Tx>
                    <Tx x={345} y={655} size={26} w={800}>
                      → IP_3_
                    </Tx>
                    <Tx x={345} y={712} size={32} w={800} fill={C.violet}>
                      → ↑ Ca^2+^
                    </Tx>
                  </An>
                  <An t={t} tw={slideIn(A('calcium is the trigger'), -20, 0)}>
                    <Tag x={345} y={800} size={24} fill={C.violet} color="#fff">
                      Ca^2+^ = trigger
                    </Tag>
                  </An>
                  <An t={t} tw={slideIn(A('exocytosis') - 0.1, 0, -20)}>
                    <Tag x={960} y={95} size={32} fill={C.amber} color="#fff">
                      exocytosis
                    </Tag>
                  </An>
                </>
              ),
            }}
          />
          {/* labels */}
          <An t={t} tw={tw(show(A('protein export'), 0.4), fade(B43, 0.5))}>
            <Tag x={330} y={240} size={24} fill="#fff" stroke={C.greyL}>
              apex (lumen side)
            </Tag>
            <Tag x={330} y={940} size={24} fill="#fff" stroke={C.greyL}>
              base (blood side)
            </Tag>
          </An>
          {[
            ['rough ER', 1240, 880, 1560, 820, A('rough endoplasmic reticulum')],
            ['mitochondria', 1205, 875, 1560, 940, A('mitochondria')],
            ['nucleus', 1050, 700, 1560, 700, A('mitochondria') + 0.6],
            ['zymogen granules', 1060, 260, 1560, 300, A('packed with granules')],
          ].map(([s, ax, ay, x, y, at], i) => (
            <An t={t} tw={tw(show(at as number), fade(A('ribosomes') - 0.4, 0.5))} key={i}>
              <path d={`M${ax},${ay} L${(x as number) - 110},${y}`} stroke={C.ink2} strokeWidth={2} />
              <circle cx={ax as number} cy={ay as number} r={5} fill={C.ink2} />
              <Tag x={x as number} y={y as number} size={26} fill="#fff" stroke={C.greyL}>
                {s as string}
              </Tag>
            </An>
          ))}
          {/* assembly line caption */}
          <An t={t} tw={tw(slideIn(A('ribosomes') - 0.1, 30, 0), fade(B43 - 0.3, 0.5))}>
            <Card x={1380} y={230} w={440} h={520} rx={26} />
            {[
              ['ribosomes', A('ribosomes')],
              ['rough ER', A('threaded into')],
              ['Golgi', A('golgi apparatus')],
              ['zymogen granules', A('zymogen granules')],
            ].map(([s, at], i) => (
              <g key={i} opacity={0.25 + 0.75 * prog(t, at as number, 0.4)}>
                <Tx x={1600} y={290 + i * 110} size={32} w={800} fill={i === 3 ? C.amberD : C.ink}>
                  {s as string}
                </Tx>
                {i < 3 && (
                  <Tx x={1600} y={345 + i * 110} size={30} w={700} fill={C.ink2}>
                    ↓
                  </Tx>
                )}
              </g>
            ))}
            <An t={t} tw={show(A('and wait') - 0.2)}>
              <Tx x={1600} y={710} size={24} w={600} fill={C.ink2} italic>
                stored at the apex
              </Tx>
            </An>
          </An>
        </g>
      )}

      {/* ================= 4.4–4.5 zymogen row ================= */}
      {t > B44 - 0.4 && t < BOARD_T + 0.5 && (
        <An t={t} tw={tw(show(B44 - 0.2, 0.5), fade(BOARD_T - 0.4, 0.5))}>
          <An t={t} tw={slideIn(A('inactive precursors') - 0.1, 0, -20)}>
            <Tag x={760} y={150} size={34} fill="#fff" stroke={C.grey}>
              zymogens = inactive precursors
            </Tag>
          </An>
          {ZYM.map((z, i) => {
            const at = A(z.at);
            const isTryp = i === 0;
            const act = isTryp ? flip : 0;
            const hl = Math.max(z.hl === 'ogen' ? prog(t, A('ending ogen'), 0.5) : prog(t, A('prefix pro'), 0.5), 0);
            return (
              <An t={t} tw={pop(at - 0.1, 0.5)} key={i}>
                <g transform={`rotate(${tip(i)},${z.x + 40},${z.y + 60})`}>
                  <Enzyme x={z.x} y={z.y - 30} r={48} active={act} lock={act < 0.5} />
                  {isTryp && flip > 0.5 ? (
                    <Tx x={z.x} y={z.y + 60} size={30} w={800} fill={C.amberD}>
                      trypsin (active)
                    </Tx>
                  ) : (
                    <ZName x={z.x} y={z.y + 60} pre={z.pre} hl={z.hl} post={z.post} on={hl} />
                  )}
                </g>
                {isTryp && t > shieldT - 0.1 && (
                  <g transform={`translate(${z.x - 70 + 70 * prog(t, shieldT - 0.1, 0.4, E.back)},${z.y - 40})`}>
                    <Shield x={0} y={0} s={1.4} stroke={C.ink2} />
                  </g>
                )}
              </An>
            );
          })}
          <An t={t} tw={tw(slideIn(A('ending ogen') + 0.3, 0, 20), fade(B45, 0.4))}>
            <Tag x={760} y={860} size={30} fill={C.greyL} color={C.ink}>
              -ogen / pro- = inactive (locked)
            </Tag>
          </An>
          {/* active pair */}
          <An t={t} tw={tw(slideIn(A('amylase and lipase') - 0.1, 60, 0), fade(B45 + 0.2, 0.5))}>
            <line x1={1440} x2={1440} y1={260} y2={800} stroke={C.greyL} strokeWidth={3} strokeDasharray="10 8" />
            <Enzyme x={1660} y={360} r={48} label="amylase" lsize={30} />
            <Enzyme x={1660} y={620} r={48} label="lipase" lsize={30} />
            <Tag x={1660} y={830} size={28} fill={C.amberL} color={C.amberD}>
              secreted active
            </Tag>
          </An>
          {/* 4.5 */}
          <An t={t} tw={slideIn(shieldT + 0.4, 0, 20)}>
            <Tag x={330} y={540} size={22} fill="#fff" stroke={C.ink2}>
              trypsin inhibitor (SPINK1)
            </Tag>
          </An>
          {[
            ['in the cells', A('inside the cells')],
            ['in the acini', A('in the acini')],
            ['in the ducts', A('in the ducts')],
          ].map(([s, at], i) => (
            <An t={t} tw={tw(slideIn(at as number, 0, 30), fade(BOARD_T - 0.6, 0.4))} key={i}>
              <Card x={420 + i * 400} y={870} w={340} h={110} rx={24} />
              <g transform={`translate(${480 + i * 400 + 10 * Math.sin((t - (at as number)) * 2.4)},925)`}>
                <Shield x={0} y={0} s={0.9} stroke={C.ink2} />
              </g>
              <Tx x={640 + i * 400} y={925} size={28} w={700}>
                {s as string}
              </Tx>
            </An>
          ))}
          {bigShield > 0 && (
            <g opacity={Math.min(1, bigShield * 1.5) * (1 - prog(t, BOARD_T - 0.6, 0.4))} transform={`translate(760,520) scale(${0.3 + 0.7 * bigShield}) translate(-760,-520)`}>
              <path d="M760,180 L1320,260 C1320,560 1160,760 760,880 C360,760 200,560 200,260 Z" fill={C.ink2} fillOpacity={0.06} stroke={C.ink2} strokeOpacity={0.7} strokeWidth={8} strokeDasharray="22 14" />
            </g>
          )}
          <An t={t} tw={slideIn(A('blocking trypsin') - 0.1, 40, 0)}>
            <Tag x={1660} y={540} size={30} fill={C.ink} color="#fff">
              block trypsin → block all
            </Tag>
          </An>
        </An>
      )}

      {/* ================= 4.6 board ================= */}
      {t > BOARD_T - 0.6 && (
        <An t={t} tw={show(BOARD_T - 0.4, 0.5)}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
          <Board t={t} a={{ ...boardIn(BOARD_T - 0.4), noteA: show(A('calcium rises', 2) - 0.3, 0.8) }} shown={{ a0: true, a1: true, t0: true, t1: true, noteT: true }} />
          <An t={t} tw={pop(A('locked zymogens'), 0.5)}>
            <LockIcon x={1000} y={300} s={1.6} color={C.amber} />
          </An>
          <An t={t} tw={tw(show(A('calcium rises', 2) - 0.3, 0.4), fade(A('calcium rises', 2) + 2.4, 0.6))}>
            <rect x={600} y={318} width={520} height={36} rx={18} fill={C.amber} opacity={0.15} />
          </An>
        </An>
      )}

      <TitleCard t={t} n={4} title="The enzyme factory" question="How does a cell manufacture enzymes that could destroy it, and survive?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

void [Arrow, Caption, to, v];
