// Chapter 7 — Control
import React from 'react';
import { An, Arrow, Card, Draw, ptAt, Tag, Tx } from '../lib/prims';
import { Acinus, acinusGeom, Board, boardIn, Bolt, Caption, DC, DuctCell, GutMap, Hex, ION, PhStrip, TitleCard } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, pop, prog, show, slideIn, tw, v } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { Stage, useChapterT, World } from '../lib/scene';

const K = anchors(7);
const { A } = K;
const [c0] = K.span;
const B71b = A('acetylcholine is released');
const B72 = A('cholecystokinin or cck');
const LOGIC1 = A('notice the logic');
const B73 = A('secretin comes from');
const DUCT_T = A('secretin acts on');
const NEUT_T = A('in the duodenum that');
const LOGIC2 = A('again the logic');
const B74 = A('these stimuli are deployed');
const CATCH = A('but notice a catch');
const INT_T = A('the intestinal phase');
const CONTRAST = A('there is a neat contrast');
const BOARD_T = A('four more cells');

const CAMB = { cx: 1050, cy: 520, cs: 0.85 };
const VAGUS_D = 'M1180,-260 C1170,0 1210,250 1180,420 C1160,520 1140,600 1130,680';
const cycl = (t: number, a: number, b: number, per: number, off = 0) => (t < a || t >= b ? null : (((t - a) / per + off) % 1 + 1) % 1);
type K_ = keyof typeof ION;
const Tok: React.FC<{ k: K_; p: [number, number] | null; op?: number; s?: number }> = ({ k, p, op = 1, s = 1 }) =>
  p && op > 0.01 ? <g transform={`translate(${p[0]},${p[1]}) scale(${s})`}>{ION[k]({ op })}</g> : null;

/** mucosa strip with endocrine cells (I or S) */
const Mucosa: React.FC<{ t: number; kind: 'I' | 'S'; tint: number; pre?: number }> = ({ t, kind, tint, pre = 0 }) => {
  const col = kind === 'I' ? C.amber : C.teal;
  return (
    <g>
      <rect x={80} y={160} width={1160} height={300} rx={30} fill={kind === 'I' ? '#FBF1E4' : '#FBEDEA'} />
      <Tx x={140} y={200} size={22} w={700} fill={C.ink2} anchor="start">
        duodenal lumen
      </Tx>
      {Array.from({ length: 14 }, (_, i) => {
        const x = 100 + i * 80;
        const endo = i % 4 === 2;
        return (
          <g key={i}>
            <rect x={x} y={460} width={76} height={170} rx={14} fill={endo ? mix('#F7EDE6', kind === 'I' ? C.amberL : C.tealL, tint) : '#F7E3DA'} stroke={endo ? mix(C.pinkD, col, tint) : C.pinkD} strokeWidth={endo ? 4 : 2.5} />
            <ellipse cx={x + 38} cy={580} rx={18} ry={14} fill="#C9A8C9" />
            {endo && kind === 'S' && pre > 0 && (
              <g>
                <Hex x={x + 38} y={515} r={14} fill={mix(C.grey, C.teal, pre)} stroke="#fff" />
              </g>
            )}
            {endo && kind === 'I' && <Hex x={x + 38} y={515} r={12} fill={mix(C.greyL, C.amber, tint)} stroke="#fff" />}
          </g>
        );
      })}
      <rect x={80} y={630} width={1160} height={200} fill="#FBEAE2" />
      <rect x={80} y={720} width={1160} height={60} rx={30} fill="#F7D9D5" stroke="#D9847C" strokeWidth={3} />
      <Tx x={160} y={810} size={20} w={700} fill="#B5544B" anchor="start">
        capillary
      </Tx>
      {t > -1 && null}
    </g>
  );
};

export const Ch7: React.FC = () => {
  const t = useChapterT(7);
  // 7.1 map
  const mapOp = v(t, 1, [B72 - 0.4, 0.5, 0]);
  const vag = prog(t, A('vagus nerve') - 0.2, 1.4);
  const trickle = t > A('relatively little water') - 0.3;
  return (
    <Stage>
      {/* ================= 7.1 map + nerve ================= */}
      {t < B72 + 0.5 && (
        <g opacity={mapOp}>
          <World t={t} base={CAMB}>
            <GutMap
              t={t}
              a={{ stom: [{ t0: -1, d: 0.01, p: { o: 0.5 }, e: E.lin }] }}
              sl={{
                top: (
                  <>
                    <Draw d={VAGUS_D} p={vag} stroke={C.violet} strokeWidth={10} strokeLinecap="round" />
                    {vag >= 1 &&
                      [0, 1, 2].map((k) => {
                        const p = cycl(t, A('vagus nerve') + 1.2, B72, 1.6, k / 3);
                        if (p === null) return null;
                        const [x, y] = ptAt(VAGUS_D, p);
                        return <circle key={k} cx={x} cy={y} r={14} fill="#fff" stroke={C.violet} strokeWidth={5} />;
                      })}
                    {/* enteric neurons along the duodenum */}
                    <An t={t} tw={pop(A('enteric nervous system') - 0.3, 0.5)}>
                      {[
                        [668, 760],
                        [760, 905],
                        [900, 905],
                        [1040, 905],
                        [800, 600],
                      ].map(([x, y], i) => (
                        <g key={i} transform={`translate(${x},${y})`}>
                          <circle r={11} fill={C.violet} />
                          {[0, 72, 144, 216, 288].map((a) => (
                            <line key={a} x1={0} y1={0} x2={22 * Math.cos((a * Math.PI) / 180)} y2={22 * Math.sin((a * Math.PI) / 180)} stroke={C.violet} strokeWidth={3} />
                          ))}
                        </g>
                      ))}
                    </An>
                  </>
                ),
              }}
            />
          </World>
          <An t={t} tw={slideIn(A('vagus nerve') + 0.5, -20, 0)}>
            <Tag x={1330} y={220} size={26} fill={C.violetL} color={C.violet}>
              vagus nerve
            </Tag>
          </An>
          <An t={t} tw={slideIn(A('enteric nervous system'), -20, 0)}>
            <Tag x={420} y={900} size={24} fill={C.violetL} color={C.violet}>
              enteric cholinergic neurons
            </Tag>
          </An>
          {/* acinus inset */}
          <An t={t} tw={slideIn(A('acts mainly on'), 30, 0)}>
            <Card x={1380} y={430} w={500} h={460} rx={28} />
            <Acinus t={t} cx={1560} cy={630} R={120} id="acg7a" cellTint={0.5 * Math.sin(clamp((t - A('acts mainly on')) / 2) * Math.PI)} />
            {t > A('plenty of enzymes') &&
              [0, 1, 2, 3, 4, 5].map((k) => {
                const p = cycl(t, A('plenty of enzymes'), B72, 2.0, k / 6);
                if (p === null) return null;
                return <circle key={k} cx={1560 + p * 240} cy={630 + Math.sin(k) * 10} r={8} fill={C.amber} opacity={Math.sin(p * Math.PI)} />;
              })}
            {trickle && <rect x={1600} y={626} width={240 * prog(t, A('relatively little water') - 0.3, 1)} height={4} fill={C.teal} />}
            <Tx x={1630} y={800} size={24} w={700} fill={C.ink}>
              ACh → acinar cells
            </Tx>
            <An t={t} tw={show(A('relatively little water'))}>
              <Tx x={1630} y={840} size={24} w={600} fill={C.ink2}>
                enzymes, little water
              </Tx>
            </An>
          </An>
        </g>
      )}
      {/* signal icons (persist through 7.1) */}
      {t < B72 + 0.5 && (
        <An t={t} tw={fade(B72 - 0.4, 0.5)}>
          {[
            ['acetylcholine', A('acetylcholine'), 'v'],
            ['cholecystokinin (CCK)', A('cholecystokinin'), 'a'],
            ['secretin', A('and secretin'), 't'],
          ].map(([s, at, k], i) => (
            <An t={t} tw={pop(at as number, 0.6)} key={i}>
              <Card x={300 + i * 440} y={40} w={400} h={110} rx={26} />
              {k === 'v' ? <Bolt x={370 + i * 440} y={95} s={1.2} /> : <Hex x={370 + i * 440} y={95} r={30} fill={k === 'a' ? C.amber : C.teal} label={k === 'a' ? 'CCK' : 'S'} size={k === 'a' ? 16 : 24} />}
              <Tx x={420 + i * 440} y={95} size={28} w={800} anchor="start" fill={k === 'v' ? C.violet : k === 'a' ? C.amberD : C.tealD}>
                {s as string}
              </Tx>
            </An>
          ))}
        </An>
      )}

      {/* ================= 7.2 CCK ================= */}
      {t > B72 - 0.5 && t < B73 + 0.5 && <CckScene t={t} />}
      {/* ================= 7.3 secretin ================= */}
      {t > B73 - 0.5 && t < DUCT_T + 0.5 && <SecretinScene t={t} />}
      {t > DUCT_T - 0.5 && t < NEUT_T + 0.5 && <DuctScene t={t} />}
      {t > NEUT_T - 0.5 && t < B74 + 0.5 && <NeutScene t={t} />}
      {/* ================= 7.4 phases ================= */}
      {t > B74 - 0.5 && t < BOARD_T + 0.5 && <PhaseScene t={t} />}
      {/* ================= 7.5 board ================= */}
      {t > BOARD_T - 0.6 && (
        <An t={t} tw={show(BOARD_T - 0.4, 0.5)}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
          <Board
            t={t}
            a={{
              ...boardIn(BOARD_T - 0.4),
              a2: show(A('nutrients for the acinar') - 0.1, 0.5),
              t2: show(A('acid for the duct') - 0.1, 0.5),
              a3: show(A('cck with acetylcholine') - 0.1, 0.5),
              t3: show(A('versus secretin') + 0.1, 0.5),
              a4: show(A('calcium versus') - 0.1, 0.5),
              t4: show(A('versus cyclic') + 0.2, 0.5),
            }}
            shown={{ a0: true, a1: true, t0: true, t1: true, noteA: true, noteT: true, a5: true, t5: true, warnA: true, warnT: true }}
          />
        </An>
      )}
      <TitleCard t={t} n={7} title="Control" question="How does the pancreas know when to secrete, and what to secrete?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

// ---------------------------------------------------------------------------
const CckScene: React.FC<{ t: number }> = ({ t }) => {
  const tI = A('i cells');
  const tPep = A('proteoses and peptones');
  const tFa = A('long chain fatty acids');
  const tBlood = A('through the blood');
  const tInc = A('marked increase');
  const tint = prog(t, tI, 0.8);
  const ICX = [100 + 2 * 80 + 38, 100 + 6 * 80 + 38, 100 + 10 * 80 + 38];
  const BLOOD_D = 'M260,750 L1240,750 C1320,750 1360,700 1400,640 C1430,600 1460,580 1500,580';
  return (
    <An t={t} tw={tw(show(B72 - 0.3, 0.5), fade(B73 - 0.3, 0.5))}>
      <Mucosa t={t} kind="I" tint={tint} />
      <An t={t} tw={slideIn(tI + 0.2, 0, -20)}>
        <Tag x={500} y={680} size={26} fill={C.amberL} color={C.amberD}>
          I cells · duodenum + upper jejunum
        </Tag>
      </An>
      {/* nutrients touching I cells */}
      {[
        [tPep, 'pep'],
        [tFa, 'fa'],
      ].map(([at, k], j) =>
        [0, 1, 2].map((c) => {
          const p = prog(t, (at as number) + c * 0.2, 1.4, E.out);
          if (p <= 0) return null;
          const x = ICX[c] + (j ? 40 : -40), y = 230 + 210 * p;
          return k === 'pep' ? (
            <g key={`${j}${c}`}>
              {[0, 1, 2].map((b) => (
                <circle key={b} cx={x - 16 + b * 16} cy={y - 20} r={8} fill={['#E07A5F', '#81B29A', '#F2CC8F'][b]} stroke={C.ink} strokeWidth={1.5} />
              ))}
            </g>
          ) : (
            <path key={`${j}${c}`} d={`M${x - 30},${y - 20} l12,-8 l12,8 l12,-8 l12,8`} fill="none" stroke="#C9A93A" strokeWidth={6} strokeLinecap="round" />
          );
        }),
      )}
      <An t={t} tw={slideIn(tPep, 0, -20)}>
        <Tag x={480} y={260} size={24} fill="#fff" stroke={C.greyL}>
          proteoses, peptones
        </Tag>
      </An>
      <An t={t} tw={slideIn(tFa, 0, -20)}>
        <Tag x={960} y={260} size={24} fill="#FBF0C4" color="#8A6D12">
          long-chain fatty acids
        </Tag>
      </An>
      {/* CCK into blood -> pancreas */}
      {t > tBlood - 0.8 &&
        [0, 1, 2, 3, 4].map((k) => {
          const p = cycl(t, tBlood - 0.8, B73, 2.6, k / 5);
          if (p === null) return null;
          const [x, y] = ptAt(BLOOD_D, p);
          return <Hex key={k} x={x} y={y} r={16} fill={C.amber} />;
        })}
      <Card x={1450} y={330} w={420} h={520} rx={28} />
      <Acinus t={t} cx={1600} cy={560} R={110} id="acg7b" cellTint={prog(t, tInc - 0.2, 0.8)} />
      {t > tInc &&
        [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
          const p = cycl(t, tInc, B73, 1.4, k / 8);
          if (p === null) return null;
          return <circle key={k} cx={1600 + p * 230} cy={560 + Math.sin(k * 2) * 12} r={8} fill={C.amber} opacity={Math.sin(p * Math.PI)} />;
        })}
      <Tx x={1660} y={730} size={26} w={800} fill={C.amberD}>
        acinar cells: ↑↑ enzymes
      </Tx>
      <An t={t} tw={pop(A('seventy to eighty percent'), 0.6)}>
        <Tag x={1660} y={790} size={26} fill={C.amber} color="#fff">
          ~70–80% of post-meal enzymes
        </Tag>
      </An>
      <An t={t} tw={slideIn(tBlood, 0, 20)}>
        <Tx x={760} y={870} size={26} w={700} fill={C.amberD}>
          CCK travels in the blood to the pancreas
        </Tx>
      </An>
      {/* logic link */}
      <An t={t} tw={show(LOGIC1, 0.4)}>
        <rect x={0} y={900} width={1920} height={180} fill={C.paper} />
        <Tag x={430} y={980} size={30} fill="#fff" stroke={C.greyL}>
          peptides + fatty acids
        </Tag>
        <Arrow d="M650,960 C900,880 1100,880 1310,960" color="amber" sw={7} p={prog(t, LOGIC1 + 0.3, 1.0)} />
        <Tag x={1530} y={980} size={30} fill={C.amberL} color={C.amberD}>
          enzymes that digest them
        </Tag>
      </An>
    </An>
  );
};

// ---------------------------------------------------------------------------
const SecretinScene: React.FC<{ t: number }> = ({ t }) => {
  const tS = A('s cells');
  const tPre = A('prosecretin');
  const tAcid = A('its stimulus is acid');
  const tThr = A('four and a half to five');
  const tRel = A('released and activated');
  const tBlood = A('absorbed into the blood');
  const tThree = A('toward three');
  const tint = prog(t, tS, 0.8);
  const pre = prog(t, tRel, 1.0);
  const ph = v(t, 6, [tAcid, 1.4, 4.2], [tThree - 0.2, 1.4, 3.2]);
  const BLOOD_D = 'M260,750 L1240,750 C1320,750 1360,700 1400,640 C1430,600 1460,580 1500,580';
  const curve = 'M1430,780 C1520,776 1600,770 1650,740 C1700,700 1720,620 1740,520';
  return (
    <An t={t} tw={tw(show(B73 - 0.3, 0.5), fade(DUCT_T - 0.3, 0.5))}>
      <Mucosa t={t} kind="S" tint={tint} pre={t > tPre - 0.3 ? 0.001 + pre : 0} />
      {/* acid chyme */}
      {t > tAcid - 0.3 &&
        Array.from({ length: 10 }, (_, i) => {
          const p = (((t - tAcid) * 0.15 + i / 10) % 1 + 1) % 1;
          return <circle key={i} cx={100 + p * 1100} cy={300 + Math.sin(i * 2 + t) * 50} r={18 + (i % 3) * 6} fill={C.red} opacity={0.3 * Math.min(1, (t - tAcid + 0.3) / 0.6)} />;
        })}
      <An t={t} tw={slideIn(tS + 0.2, 0, -20)}>
        <Tag x={500} y={680} size={26} fill={C.tealL} color={C.tealD}>
          S cells · duodenum + jejunum
        </Tag>
      </An>
      <An t={t} tw={slideIn(tPre, 0, -20)}>
        <Tag x={1000} y={680} size={24} fill={C.greyL} color={C.ink2}>
          {pre > 0.5 ? 'prosecretin → secretin' : 'stored as prosecretin'}
        </Tag>
      </An>
      {t > tBlood - 0.5 &&
        [0, 1, 2, 3, 4].map((k) => {
          const p = cycl(t, tBlood - 0.5, DUCT_T, 2.4, k / 5);
          if (p === null) return null;
          const [x, y] = ptAt(BLOOD_D, p);
          return <Hex key={k} x={x} y={y} r={16} fill={C.teal} />;
        })}
      {/* pH strip with threshold */}
      <An t={t} tw={slideIn(tAcid - 0.2, 0, -30)}>
        <Card x={1330} y={40} w={560} h={250} rx={26} />
        <PhStrip x={1420} y={200} w={420} value={ph} id="ph7a" />
        <An t={t} tw={show(tThr - 0.1, 0.4)}>
          <rect x={1420 + (3.5 / 8) * 420} y={150} width={(0.5 / 8) * 420 + 4} height={100} fill={C.red} opacity={0.25} />
          <Tx x={1620} y={270} size={20} w={700} fill={C.redD}>
            threshold pH 4.5–5
          </Tx>
        </An>
      </An>
      {/* inset release curve */}
      <An t={t} tw={slideIn(tThree - 0.4, 30, 0)}>
        <Card x={1330} y={330} w={560} h={560} rx={26} />
        <Tx x={1610} y={380} size={24} w={800} fill={C.tealD}>
          secretin release
        </Tx>
        <path d="M1420,440 L1420,800 L1800,800" fill="none" stroke={C.ink2} strokeWidth={3} />
        <Tx x={1430} y={830} size={20} w={700} fill={C.ink2}>
          pH 5
        </Tx>
        <Tx x={1760} y={830} size={20} w={700} fill={C.ink2}>
          pH 3
        </Tx>
        <Draw d={curve} p={prog(t, tThree - 0.2, 1.4)} stroke={C.teal} strokeWidth={7} strokeLinecap="round" />
        <Tx x={1600} y={860} size={20} w={600} fill={C.ink2}>
          {'falling pH →'}
        </Tx>
      </An>
      <An t={t} tw={slideIn(tBlood, 0, 20)}>
        <Tx x={760} y={870} size={26} w={700} fill={C.tealD}>
          secretin travels in the blood to the pancreas
        </Tx>
      </An>
    </An>
  );
};

// ---------------------------------------------------------------------------
const DuctScene: React.FC<{ t: number }> = ({ t }) => {
  const tC = A('cyclic a m p');
  const tCF = A('cftr chloride channel');
  const t145 = A('one hundred forty five');
  const open = prog(t, tCF + 0.2, 0.8);
  const fast = t > tCF + 0.6;
  const loopPer = fast ? 0.9 : 2.2;
  return (
    <An t={t} tw={tw(show(DUCT_T - 0.3, 0.5), fade(NEUT_T - 0.3, 0.5))}>
      <World t={t} base={{ cx: 960, cy: 560, cs: 0.92 }}>
        <DuctCell
          t={t}
          cftrOpen={open}
          a={{ nbc: [], nhe: [], atpase: [], cftr: [], ae: [], ca: [] }}
          sl={{
            top: (
              <>
                {/* secretin docks */}
                <g transform={`translate(${200 + 260 * prog(t, DUCT_T, 1.2, E.out)},${720})`}>
                  <Hex x={0} y={0} r={30} fill={C.teal} label="S" size={24} />
                </g>
                <path d="M486,720 l-20,-14 l0,28 z" fill={C.teal} />
                <An t={t} tw={pop(tC - 0.1, 0.6)}>
                  <circle cx={700} cy={720} r={44} fill="#fff" stroke={C.teal} strokeWidth={4} />
                  <Tx x={700} y={722} size={24} w={800} fill={C.tealD}>
                    cAMP
                  </Tx>
                  <Arrow d="M740,690 C900,560 1100,420 1270,370" color="teal" sw={5} dash="10 8" p={prog(t, tCF - 0.4, 1)} />
                </An>
                {/* chloride loop + bicarbonate output */}
                {[0, 1, 2].map((k) => {
                  const p = cycl(t, DUCT_T + 0.5, NEUT_T, loopPer, k / 3);
                  if (p === null) return null;
                  const tok = p < 0.5 ? ptAt(DC.clOut, p * 2) : ptAt(DC.clIn, 1 - (p - 0.5) * 2);
                  return (
                    <g key={k}>
                      <Tok k="Cl" p={tok} s={0.85} />
                      {p > 0.5 && <Tok k="HCO3" p={ptAt(DC.hco3Out, 0.25 + (p - 0.5) * 1.5)} op={Math.sin((p - 0.5) * 2 * Math.PI)} s={0.85} />}
                    </g>
                  );
                })}
                {fast &&
                  Array.from({ length: 8 }, (_, k) => {
                    const p = cycl(t, tCF + 0.6, NEUT_T, 2.0, k / 8);
                    if (p === null) return null;
                    return <Tok key={'o' + k} k="HCO3" p={[1420 + (k % 3) * 120, 160 + p * 800]} op={Math.sin(p * Math.PI)} s={0.8} />;
                  })}
              </>
            ),
          }}
        />
      </World>
      <An t={t} tw={slideIn(DUCT_T + 0.3, 0, -20)}>
        <Tag x={960} y={50} size={30} fill={C.tealL} color={C.tealD}>
          secretin → duct cells
        </Tag>
      </An>
      <An t={t} tw={slideIn(tCF, 0, 20)}>
        <Caption x={700} y={1035} size={30} fill="#fff" color={C.tealD} stroke={C.teal}>
          secretin → cAMP → opens CFTR
        </Caption>
      </An>
      <An t={t} tw={pop(t145 - 0.1, 0.6)}>
        <Tag x={1500} y={1035} size={28} fill={C.teal} color="#fff">
          HCO_3_^−^ up to 145 mEq/L, low Cl^−^
        </Tag>
      </An>
    </An>
  );
};

// ---------------------------------------------------------------------------
const NeutScene: React.FC<{ t: number }> = ({ t }) => {
  const tEq = A('sodium chloride and carbonic acid');
  const tCO2 = A('water and carbon dioxide');
  const tOut = A('breathed out');
  const tNeut = A('neutral salt solution');
  const ph = v(t, 2.5, [NEUT_T + 1, 6, 5], [tNeut - 0.5, 1.5, 7.5]);
  const meet = prog(t, NEUT_T + 0.5, 2.5);
  const split = prog(t, A('summoned') - 0.4, 0.6);
  return (
    <An t={t} tw={tw(show(NEUT_T - 0.3, 0.5), fade(B74 - 0.3, 0.5))}>
      <rect x={140} y={160} width={1640} height={420} rx={60} fill="#F7E3DA" stroke={C.pinkD} strokeWidth={3} />
      <Tx x={240} y={200} size={22} w={700} fill={C.pinkD} anchor="start">
        duodenum
      </Tx>
      {/* tokens meeting */}
      {[0, 1, 2, 3, 4].map((k) => {
        const y = 270 + k * 65;
        const hx = 300 + 520 * meet, bx = 1600 - 520 * meet;
        const done = prog(t, tEq + k * 0.15, 0.6);
        return (
          <g key={k}>
            <Tok k="H" p={[hx, y]} op={1 - done} />
            <Tok k="HCO3" p={[bx, y]} op={1 - done} />
            {done > 0 && (
              <g opacity={done}>
                <circle cx={900} cy={y} r={20} fill={C.greyL} stroke="#fff" strokeWidth={3} />
                <circle cx={940} cy={y} r={20} fill={C.grey} stroke="#fff" strokeWidth={3} />
                <Tx x={920} y={y} size={18} w={800} fill="#fff">
                  NaCl
                </Tx>
              </g>
            )}
          </g>
        );
      })}
      {/* CO2 bubbles to lungs */}
      {t > tCO2 &&
        [0, 1, 2, 3, 4].map((k) => {
          const p = cycl(t, tCO2, B74, 2.4, k / 5);
          if (p === null) return null;
          return <Tok key={k} k="CO2" p={[1100 + k * 40 + p * 250, 450 - p * 380]} op={Math.sin(p * Math.PI)} s={0.8} />;
        })}
      <An t={t} tw={pop(tOut - 0.2, 0.6)}>
        <g transform="translate(1560,110)">
          <path d="M-10,-50 L-10,0 C-60,-10 -90,40 -80,90 C-70,120 -30,110 -15,80 L-10,10 Z" fill="#F4B9B4" stroke={C.red} strokeWidth={3} />
          <path d="M10,-50 L10,0 C60,-10 90,40 80,90 C70,120 30,110 15,80 L10,10 Z" fill="#F4B9B4" stroke={C.red} strokeWidth={3} />
        </g>
        <Tx x={1700} y={110} size={22} w={700} fill={C.redD} anchor="start">
          breathed out
        </Tx>
      </An>
      {/* equation */}
      <Card x={240} y={640} w={1440} h={140} rx={30} />
      <An t={t} tw={show(A('hydrochloric acid and') - 0.1)}>
        <Tx x={300} y={710} size={36} w={700} anchor="start">
          HCl + NaHCO_3_
        </Tx>
      </An>
      <An t={t} tw={show(tEq)}>
        <Tx x={620} y={710} size={36} w={700} anchor="start">
          → NaCl + H_2_CO_3_
        </Tx>
      </An>
      <An t={t} tw={show(tCO2)}>
        <Tx x={1030} y={710} size={36} w={700} anchor="start">
          → NaCl + H_2_O + CO_2_
        </Tx>
      </An>
      <An t={t} tw={slideIn(NEUT_T + 0.6, 0, 30)}>
        <PhStrip x={760} y={930} w={520} value={ph} id="ph7b" />
      </An>
      {/* split card */}
      {split > 0 && (
        <g opacity={split}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} opacity={0.94} />
          <Card x={160} y={340} w={760} h={360} rx={34} stroke={C.amber} sw={5} />
          <Card x={1000} y={340} w={760} h={360} rx={34} stroke={C.teal} sw={5} />
          <Tx x={540} y={470} size={38} w={800} fill={C.amberD}>
            nutrients → CCK
          </Tx>
          <Tx x={540} y={560} size={38} w={800} fill={C.amberD}>
            → enzymes
          </Tx>
          <Tx x={1380} y={470} size={38} w={800} fill={C.tealD}>
            acid → secretin
          </Tx>
          <Tx x={1380} y={560} size={38} w={800} fill={C.tealD}>
            → bicarbonate
          </Tx>
          <Tx x={960} y={800} size={30} w={600} fill={C.ink2} italic>
            Each hormone is summoned by the problem it solves.
          </Tx>
        </g>
      )}
    </An>
  );
};

// ---------------------------------------------------------------------------
const PANELS = [
  { title: 'Cephalic', at: 'the cephalic phase', share: '~20%', shareAt: 'twenty percent', stim: 'sight, smell, taste, sound, chewing, swallowing', med: 'ACh (vagus)' },
  { title: 'Gastric', at: 'the gastric phase', share: '5–10%', shareAt: 'five to ten percent', stim: 'distension, protein', med: 'vagovagal reflex · ACh' },
  { title: 'Intestinal', at: 'the intestinal phase', share: '70–75%', shareAt: 'seventy to seventy five', stim: 'acid, fatty acids, peptides', med: 'secretin, CCK, vagovagal' },
];
const PanelIcon: React.FC<{ k: number; x: number; y: number; t: number }> = ({ k, x, y, t }) => {
  if (k === 0)
    return (
      <g>
        <circle cx={x} cy={y} r={46} fill="#F6E7D8" stroke="#DCC3A9" strokeWidth={4} />
        <circle cx={x + 18} cy={y - 8} r={5} fill={C.ink2} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${x - 70 - i * 12},${y - 30 + Math.sin(t * 3 + i) * 4} q-8,10 0,20 q8,10 0,20`} fill="none" stroke={C.ink2} strokeWidth={3} opacity={0.6} />
        ))}
      </g>
    );
  if (k === 1)
    return (
      <g transform={`translate(${x},${y}) scale(${1 + 0.06 * Math.sin(t * 2)})`}>
        <path d="M-20,-50 C-60,-40 -60,30 -10,45 C30,55 60,30 55,0 L40,-10 C35,20 10,25 -5,15 C-25,0 -20,-30 0,-45 Z" fill={C.pink} stroke={C.pinkD} strokeWidth={4} />
      </g>
    );
  return (
    <g>
      <path d={`M${x - 60},${y - 30} C${x - 70},${y + 40} ${x + 60},${y + 50} ${x + 60},${y - 10}`} fill="none" stroke={C.fleshD} strokeWidth={34} strokeLinecap="round" />
      <path d={`M${x - 60},${y - 30} C${x - 70},${y + 40} ${x + 60},${y + 50} ${x + 60},${y - 10}`} fill="none" stroke={C.flesh} strokeWidth={26} strokeLinecap="round" />
      <circle cx={x - 20} cy={y + 20} r={9} fill={C.red} />
      <circle cx={x + 15} cy={y + 24} r={7} fill="#C9A93A" />
      <circle cx={x + 40} cy={y + 8} r={7} fill="#81B29A" />
    </g>
  );
};
const PhaseScene: React.FC<{ t: number }> = ({ t }) => {
  const tVag = A('vagotomy');
  const vagCut = prog(t, tVag - 0.2, 0.5);
  const dimEarly = prog(t, tVag + 0.2, 0.6) * (1 - prog(t, INT_T - 0.2, 0.6));
  const tWash = A('washes the stored enzymes');
  const flood = prog(t, tWash - 0.3, 2.0);
  const pileN = Math.floor(18 * prog(t, CATCH + 0.6, 3.5));
  const bar = v(t, 0, [A('twenty percent'), 1, 0.2], [A('five to ten percent'), 1, 0.275], [A('seventy to seventy five'), 1.4, 1]);
  const inset = t < CONTRAST - 0.2;
  const acG = acinusGeom(560, 790, 110);
  return (
    <An t={t} tw={tw(show(B74 - 0.3, 0.5), fade(BOARD_T - 0.3, 0.5))}>
      <Tx x={960} y={60} size={32} w={800}>
        Three phases of pancreatic secretion
      </Tx>
      {PANELS.map((p, k) => {
        const at = A(p.at);
        const dim = k < 2 ? dimEarly : 0;
        return (
          <An t={t} tw={slideIn(at - 0.1, 0, 30)} key={k}>
            <g opacity={1 - dim * 0.6}>
              <Card x={110 + k * 580} y={110} w={540} h={440} rx={30} stroke={k === 2 ? C.teal : C.greyL} sw={k === 2 ? 5 : 3} />
              <Tx x={380 + k * 580} y={160} size={36} w={800}>
                {p.title}
              </Tx>
              <PanelIcon k={k} x={250 + k * 580} y={270} t={t} />
              <Tx x={330 + k * 580} y={240} size={20} w={700} fill={C.ink2} anchor="start">
                STIMULUS
              </Tx>
              {p.stim.split(', ').reduce<string[][]>((acc, w, i) => {
                const li = Math.floor(i / 2);
                (acc[li] = acc[li] || []).push(w);
                return acc;
              }, []).map((ws, i) => (
                <Tx key={i} x={330 + k * 580} y={275 + i * 32} size={23} w={600} anchor="start">
                  {ws.join(', ')}
                </Tx>
              ))}
              <Tx x={160 + k * 580} y={400} size={20} w={700} fill={C.ink2} anchor="start">
                MEDIATOR
              </Tx>
              <Tx x={160 + k * 580} y={435} size={26} w={700} fill={k === 2 ? C.tealD : C.violet} anchor="start">
                {p.med}
              </Tx>
              <An t={t} tw={pop(A(p.shareAt) - 0.1, 0.6)}>
                <Tag x={380 + k * 580} y={505} size={32} fill={k === 2 ? C.teal : C.violet} color="#fff">
                  {p.share}
                </Tag>
              </An>
            </g>
          </An>
        );
      })}
      {/* vagus line across early panels + scissors */}
      <An t={t} tw={tw(show(A('the vagus releases') - 0.2, 0.5), fade(INT_T, 0.5))}>
        <path d={`M120,590 L${600 + 0},590`} stroke={C.violet} strokeWidth={8} strokeLinecap="round" />
        <path d={`M${660},590 L1220,590`} stroke={C.violet} strokeWidth={8} strokeLinecap="round" transform={`translate(${30 * vagCut},${10 * vagCut})`} />
        <Tx x={130} y={620} size={20} w={700} fill={C.violet} anchor="start">
          vagus
        </Tx>
        {vagCut > 0 && (
          <g transform="translate(630,590)" opacity={Math.min(1, vagCut * 2)}>
            <path d="M-16,-34 L8,10 M16,-34 L-8,10" stroke={C.red} strokeWidth={6} strokeLinecap="round" />
            <circle cx={-18} cy={-40} r={10} fill="none" stroke={C.red} strokeWidth={5} />
            <circle cx={18} cy={-40} r={10} fill="none" stroke={C.red} strokeWidth={5} />
          </g>
        )}
        <An t={t} tw={slideIn(tVag + 0.3, 0, 20)}>
          <Tag x={900} y={640} size={26} fill={C.redL} color={C.redD}>
            greatly reduced after vagotomy
          </Tag>
        </An>
      </An>
      {/* catch inset: acinus with piled granules, later flushed */}
      {inset && (
        <An t={t} tw={tw(slideIn(CATCH, 0, 30), fade(CONTRAST - 0.4, 0.4))}>
          <Card x={300} y={680} w={1320} h={260} rx={30} />
          <Acinus t={t} cx={560} cy={790} R={100} id="acg7c" sl={{ duct: flood > 0 ? <rect x={560} y={790 - 14} width={(acG.dx1 - 560) * flood} height={28} fill={C.teal} opacity={0.7} /> : null }} />
          {Array.from({ length: pileN }, (_, i) => {
            const fx = flood > 0 ? flood * (300 + i * 20) : 0;
            const x = 580 + (i % 6) * 18 + fx, y = 780 + Math.floor(i / 6) * 14 - 10;
            return <circle key={i} cx={Math.min(x, 900)} cy={y} r={7} fill={C.amber} stroke={C.amberD} strokeWidth={1.5} opacity={1 - Math.max(0, (x - 900) / 100)} />;
          })}
          <Tx x={1210} y={770} size={28} w={700} fill={C.ink}>
            {flood > 0.1 ? 'intestinal phase: fluid washes enzymes out' : 'enzymes without water stay stored'}
          </Tx>
          <Tx x={1210} y={820} size={24} w={500} fill={C.ink2}>
            {flood > 0.1 ? 'secretin-driven ductal flow' : 'in the acini and ducts'}
          </Tx>
        </An>
      )}
      {/* running share bar */}
      <An t={t} tw={tw(show(A('twenty percent') - 0.3), fade(CONTRAST - 0.4, 0.4))}>
        <rect x={300} y={985} width={1320} height={36} rx={18} fill={C.greyL} />
        <rect x={300} y={985} width={1320 * bar} height={36} rx={18} fill={bar > 0.3 ? C.teal : C.violet} />
        <Tx x={1640} y={1003} size={26} w={800} anchor="start">
          {`${Math.round(bar * 100)}%`}
        </Tx>
        <Tx x={290} y={1003} size={22} w={700} fill={C.ink2} anchor="end">
          cumulative
        </Tx>
      </An>
      {/* contrast with the stomach */}
      {t > CONTRAST - 0.3 && (
        <An t={t} tw={show(CONTRAST - 0.2, 0.5)}>
          <Card x={240} y={600} w={1440} h={440} rx={30} />
          {[
            ['Stomach', [30, 60, 10], 420],
            ['Pancreas', [20, 7.5, 72.5], 1100],
          ].map(([name, vals, x0], j) => (
            <g key={j}>
              <Tx x={(x0 as number) + 200} y={650} size={30} w={800} fill={j ? C.tealD : C.pinkD}>
                {name as string}
              </Tx>
              {(vals as number[]).map((val, i) => {
                const h = 4 * val * prog(t, CONTRAST + 0.3 + j * 0.8 + i * 0.15, 0.8);
                const hi = (j === 0 && i === 1) || (j === 1 && i === 2);
                return (
                  <g key={i}>
                    <rect x={(x0 as number) + i * 140} y={980 - h} width={100} height={h} rx={10} fill={hi ? (j ? C.teal : C.pinkD) : C.greyL} />
                    <Tx x={(x0 as number) + i * 140 + 50} y={1005} size={18} w={700} fill={C.ink2}>
                      {['cephalic', 'gastric', 'intestinal'][i]}
                    </Tx>
                  </g>
                );
              })}
            </g>
          ))}
          <An t={t} tw={slideIn(A('for gastric secretion'), 0, 10)}>
            <Tag x={630} y={720} size={22} fill={C.pink} color={C.redD}>
              stomach: gastric phase most important
            </Tag>
          </An>
          <An t={t} tw={slideIn(A('for pancreatic secretion'), 0, 10)}>
            <Tag x={1310} y={720} size={22} fill={C.tealL} color={C.tealD}>
              pancreas: intestinal phase most important
            </Tag>
          </An>
        </An>
      )}
    </An>
  );
};

void [Caption, Draw];
