// Chapter 1 — One organ, two glands
import React from 'react';
import { An, Arrow, Callout, Card, Draw, P, pol, ptAt, Tag, Tx } from '../lib/prims';
import { Acinus, acinusGeom, Board, boardIn, Caption, GutMap, ISLETS, LockIcon, PANC_D, PDUCT_D, CBD_D, CYSTIC_D, STOM_D, TitleCard, Glow } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, move, pop, prog, pulse, resolve, rnd, scaleTo, show, slideIn, to, tw, v } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { cam, Stage, toScreen, useChapterT, World } from '../lib/scene';

const K = anchors(1);
const { A, AE } = K;
const [c0] = K.span;

// beat starts
const B12 = A('about ninety nine');
const ZOOM_T = A('clusters'); // zoom into tissue
const ISLET_T = A('within the islets');
const SHRINK_T = A('lecture of their own');
const B13 = A('zoom into the exocrine');
const ACI_T = A('the acinus is lined');
const B14 = A('all these ducts');
const B15 = A("let's start");

// world camera
const CAM_BASE = { cx: 1000, cy: 540, cs: 0.95 };
const ISL: [number, number] = [1100, 700];
const CAMS = [
  cam(ZOOM_T - 0.5, 1.3, ISL[0], ISL[1], 5, E.in),
  // jump back in (hidden) then pull back out at 1.4
  cam(B14 - 0.6, 0.01, 1130, 690, 5),
  cam(B14 - 0.2, 1.8, 1000, 540, 0.95, E.out),
  cam(A('together they empty') - 0.4, 1.6, 790, 700, 1.75),
];

// ---- duct tree geometry (1.3) ----
type Seg = { x0: number; y0: number; x1: number; y1: number; d: number };
const SEGS: Seg[] = [];
const LEAVES: [number, number, number][] = [];
(function rec(x: number, y: number, ang: number, len: number, d: number) {
  const a = (ang * Math.PI) / 180;
  const x1 = x + len * Math.cos(a), y1 = y + len * Math.sin(a);
  SEGS.push({ x0: x, y0: y, x1, y1, d });
  if (d === 4) {
    LEAVES.push([x1 + 22 * Math.cos(a), y1 + 22 * Math.sin(a), d]);
    return;
  }
  const sp = 36 - d * 5;
  rec(x1, y1, ang - sp + (rnd(SEGS.length) - 0.5) * 8, len * 0.74, d + 1);
  rec(x1, y1, ang + sp + (rnd(SEGS.length + 7) - 0.5) * 8, len * 0.74, d + 1);
})(700, 990, -62, 250, 0);
const HI_LEAF = 9; // the acinus we zoom into

// ---- islet close-up cells (1.2) ----
const ICX = 640, ICY = 600, IR = 300;
const ICELLS: { x: number; y: number; k: number }[] = [];
for (let row = -6; row <= 6; row++)
  for (let col = -6; col <= 6; col++) {
    const x = ICX + col * 50 + (row % 2 ? 25 : 0), y = ICY + row * 44;
    if (Math.hypot(x - ICX, y - ICY) > IR - 30) continue;
    const r = rnd(row * 31 + col * 7 + 3);
    ICELLS.push({ x, y, k: r < 0.6 ? 0 : r < 0.85 ? 1 : r < 0.95 ? 2 : 3 });
  }
const ITINT = ['#9DBFE6', '#F1A9BC', '#B9DC8C', '#D5D7DC'];

// ---- tissue field (1.2) ----
const TF = { cx: 960, cy: 600, r: 420 };
const ACINI_TF: [number, number][] = [];
for (let i = 0; i < 70; i++) {
  const x = 560 + (i % 10) * 88 + (Math.floor(i / 10) % 2 ? 44 : 0) + (rnd(i) - 0.5) * 20;
  const y = 230 + Math.floor(i / 10) * 108 + (rnd(i + 50) - 0.5) * 20;
  if (Math.hypot(x - TF.cx, y - TF.cy) > TF.r - 40) continue;
  if (Math.hypot(x - 900, y - 520) < 150) continue; // room for the islet
  if (Math.abs(y - (820 - (x - 560) * 0.12)) < 40) continue; // room for the duct
  ACINI_TF.push([x, y]);
}
const TF_DUCT = 'M560,840 C700,820 900,800 1100,770 C1220,752 1300,742 1380,735';
const TF_CAP = 'M760,190 C800,330 1060,420 1050,560 C1040,700 1180,780 1240,1000';

const AC = acinusGeom(700, 580, 300);

export const Ch1: React.FC = () => {
  const t = useChapterT(1);
  const camS = resolve(t, CAMS, CAM_BASE);
  const S = (x: number, y: number) => toScreen(x, y, camS);
  const worldOp = v(t, 1, [ZOOM_T + 0.25, 0.55, 0], [B14 - 0.5, 0.01, 0], [B14 - 0.45, 0.7, 1]);
  const twoT = A('two glands', 2);
  void AE;

  // 1.4 flows
  const ductP = prog(t, A('main pancreatic duct'), 1.6);
  const stoneT = A('gallstone');
  const blocked = t > stoneT + 0.9;
  const flowDots = (d: string, n: number, speed: number, t0: number, colors: string[], r = 7) => {
    if (t < t0) return null;
    const lt = t - t0;
    return Array.from({ length: n }, (_, k) => {
      let p = ((lt * speed + k / n) % 1 + 1) % 1;
      if (blocked) {
        const lb = stoneT + 0.9 - t0;
        const p0 = ((lb * speed + k / n) % 1 + 1) % 1;
        p = Math.min(p0, 0.86 - (k % 5) * 0.02); // pile up behind the stone
      }
      const [x, y] = ptAt(d, p);
      return <circle key={k} cx={x} cy={y} r={r} fill={colors[k % colors.length]} stroke="#fff" strokeWidth={2} opacity={Math.min(1, lt / 0.4)} />;
    });
  };
  const oddiR = 15 + (t > A('sphincter of oddi') ? 3.5 * Math.sin((t - A('sphincter of oddi')) * 4.5) : 0);
  const stoneP = prog(t, stoneT, 0.9, E.in);
  const flash = t > stoneT + 0.9 && t < stoneT + 2.4 ? Math.sin(((t - stoneT - 0.9) / 1.5) * Math.PI) : 0;

  // labels in screen space that follow the world
  const lbl = (txt: string, wx: number, wy: number, dx: number, dy: number, at: number, until: number, color?: string) => {
    const [x, y] = S(wx, wy);
    return (
      <An t={t} tw={tw(show(at, 0.4), fade(until, 0.4))} key={txt}>
        <Callout ax={x} ay={y} x={x + dx} y={y + dy} color={color}>
          {txt}
        </Callout>
      </An>
    );
  };

  // islet close-up group transform: grows from the tissue islet, later shrinks into a badge
  const isl = resolve(
    t,
    tw(to(ISLET_T - 0.2, 1.0, { s: 1, x: 0, y: 0 }, E.io), to(SHRINK_T, 1.0, { s: 0.22, x: 1030, y: -400 }, E.io), fade(B13 + 0.8, 0.5)),
    { s: 0.33, x: 260, y: -80, o: 1 },
  );

  return (
    <Stage>
      {/* ================= WORLD: organ view (1.1, 1.4) ================= */}
      {worldOp > 0.001 && (
        <World t={t} base={CAM_BASE} cam={CAMS} op={worldOp}>
          <GutMap
            t={t}
            a={{
              stom: tw(to(A('behind the stomach'), 0.9, { o: 0.16 })),
              islets: t > B14 ? undefined : tw(show(twoT, 0.5)),
              pduct: [],
            }}
            oddiR={oddiR}
            sl={{
              behindPanc: <Glow d={PANC_D} color={C.red} op={flash * 0.8} />,
              overPanc: (
                <>
                  {/* head / body / tail highlights */}
                  <g clipPath="url(#pclip)">
                    <An t={t} tw={tw(show(A('head') - 0.1, 0.4), fade(A('head') + 2.2, 0.6))}>
                      <ellipse cx={780} cy={770} rx={110} ry={120} fill={C.amber} opacity={0.45} />
                    </An>
                    <An t={t} tw={tw(show(A('parallel') - 0.1, 0.4), fade(A('parallel') + 2.0, 0.6))}>
                      <ellipse cx={1100} cy={690} rx={190} ry={90} fill={C.amber} opacity={0.4} />
                    </An>
                    <An t={t} tw={tw(show(A('its tail') - 0.1, 0.4), fade(A('its tail') + 2.4, 0.6))}>
                      <ellipse cx={1440} cy={625} rx={140} ry={70} fill={C.amber} opacity={0.45} />
                    </An>
                  </g>
                  {/* main pancreatic duct with mixed flow */}
                  {t > B14 && <Draw d={PDUCT_D} p={ductP} stroke={C.amberD} strokeWidth={9} strokeLinecap="round" />}
                  {t > B14 && ductP >= 1 && flowDots(PDUCT_D, 14, 0.22, A('main pancreatic duct') + 1.4, [C.amber, C.teal])}
                </>
              ),
              overDuo: (
                <>
                  <An t={t} tw={tw(show(A('c shaped') - 0.1, 0.4), fade(A('c shaped') + 2.6, 0.6))}>
                    <path d="M885,602 C820,600 760,598 722,610 C684,622 668,650 668,700 L668,820 C668,880 700,905 760,905 L1000,905 C1050,905 1070,880 1076,840" fill="none" stroke={C.amber} strokeWidth={14} opacity={0.35} strokeLinecap="round" />
                  </An>
                  {t > B14 && flowDots(CBD_D, 8, 0.25, A('common bile duct') + 0.2, [C.olive], 7)}
                  {t > B14 && flowDots(CYSTIC_D, 3, 0.4, A('common bile duct') + 0.4, [C.olive], 6)}
                </>
              ),
              top: (
                <>
                  <An t={t} tw={tw(show(A('behind the stomach') + 0.2, 0.7), fade(B12 - 0.2, 0.5))}>
                    <path d={STOM_D} fill="none" stroke={C.pinkD} strokeWidth={4} strokeDasharray="14 10" />
                  </An>
                  {/* gallstone */}
                  {t > stoneT - 0.05 && (
                    <g transform={`translate(${ptAt(CBD_D, 0.55 + 0.45 * stoneP).join(',')})`}>
                      <ellipse cx={0} cy={0} rx={13} ry={10} fill="#8B7A5C" stroke="#5A4C34" strokeWidth={3} />
                      <circle cx={-4} cy={-3} r={3} fill="#B3A27F" />
                    </g>
                  )}
                </>
              ),
            }}
          />
        </World>
      )}
      {/* labels following the organ view */}
      {worldOp > 0.001 && t < B12 && (
        <>
          {lbl('pancreas', 1250, 640, 120, 150, A('the pancreas lies'), B12 - 0.4, C.amberD)}
          {lbl('head', 760, 790, -250, 30, A('head') + 0.05, B12 - 0.4)}
          {lbl('body', 1100, 700, 20, 190, A('parallel'), B12 - 0.4)}
          {lbl('tail', 1460, 625, 120, 140, A('its tail') + 0.05, B12 - 0.4)}
          {lbl('duodenum', 900, 905, 0, 120, A('duodenum'), B12 - 0.4)}
          {lbl('spleen', 1640, 560, 130, -120, A('spleen'), B12 - 0.4)}
          {lbl('stomach', 1250, 330, 200, -120, A('behind the stomach') + 0.3, A('its head') - 0.2)}
        </>
      )}
      {worldOp > 0.001 && t > B14 && t < B15 + 1 && (
        <>
          {lbl('main pancreatic duct', 1200, 683, 120, 150, A('main pancreatic duct') + 0.3, A('together they empty') - 0.6, C.amberD)}
          {lbl('common bile duct', 718, 520, -300, -40, A('common bile duct') + 0.1, A('together they empty') - 0.6, C.olive)}
          {lbl('liver', 520, 280, -60, -150, A('liver'), A('together they empty') - 0.6)}
          {lbl('gallbladder', 630, 460, -260, 60, A('gallbladder'), A('together they empty') - 0.6)}
          {lbl('papilla of Vater', 694, 714, -330, -60, A('papilla of vater'), B15)}
          {lbl('sphincter of Oddi', 700, 728, -320, 110, A('sphincter of oddi'), B15)}
        </>
      )}
      {/* gallstone tag */}
      {t > B14 && (
        <An t={t} tw={tw(slideIn(stoneT + 0.9, 0, 20), fade(B15, 0.4))}>
          <Caption x={1300} y={980} fill={C.redL} color={C.redD} stroke="none">
            gallstone blocks both outflows
          </Caption>
        </An>
      )}

      {/* "two glands" layer split (1.1) */}
      <An t={t} tw={tw(show(twoT - 0.1, 0.4), fade(B12 + 0.2, 0.5))}>
        <rect x={0} y={0} width={1920} height={1080} fill={C.paper} opacity={0.82} />
        <An t={t} tw={tw(to(twoT, 0.9, { y: -150 }, E.out))}>
          <g transform={`translate(${S(0, 0)[0]},${S(0, 0)[1]}) scale(${camS.cs})`}>
            <path d={PANC_D} fill={C.panc} stroke={C.pancD} strokeWidth={4} />
            <g clipPath="url(#pclip)" opacity={0.5}>
              {Array.from({ length: 120 }, (_, i) => (
                <circle key={i} cx={690 + ((i * 97) % 860)} cy={590 + ((i * 53) % 300)} r={16 + (i % 3) * 4} fill="none" stroke={C.pancD} strokeWidth={1.8} />
              ))}
            </g>
          </g>
        </An>
        <An t={t} tw={tw(to(twoT, 0.9, { y: 170 }, E.out))}>
          <g transform={`translate(${S(0, 0)[0]},${S(0, 0)[1]}) scale(${camS.cs})`}>
            <path d={PANC_D} fill="#FFFDF7" stroke={C.greyL} strokeWidth={4} strokeDasharray="12 9" />
            {ISLETS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={9} fill="#FFF6E2" stroke={C.pancD} strokeWidth={2} />
            ))}
          </g>
        </An>
        <An t={t} tw={slideIn(twoT + 0.5, -30, 0)}>
          <Tag x={420} y={S(0, 600)[1] - 150} size={30} fill={C.amberL} color={C.amberD}>
            exocrine
          </Tag>
        </An>
        <An t={t} tw={slideIn(twoT + 0.7, -30, 0)}>
          <Tag x={420} y={S(0, 700)[1] + 170} size={30} fill="#FFF6E2" color={C.ink2} stroke={C.greyL}>
            endocrine (islets)
          </Tag>
        </An>
        <An t={t} tw={slideIn(twoT + 0.3, 0, -20)}>
          <Caption x={960} y={110} size={34}>
            two glands: exocrine + endocrine
          </Caption>
        </An>
      </An>

      {/* ================= 1.2 proportion bar ================= */}
      <An t={t} tw={tw(slideIn(A('ninety nine percent') - 0.1, 0, -30, 0.6), fade(B13 - 0.2, 0.5))}>
        <Card x={250} y={36} w={1420} h={112} rx={22} />
        <rect x={290} y={62} width={1340 * 0.99} height={30} rx={8} fill={C.amber} />
        <rect x={290 + 1340 * 0.99 + 2} y={62} width={1340 * 0.01 + 6} height={30} rx={3} fill="#FFF6E2" stroke={C.pancD} strokeWidth={2} />
        <Tx x={300} y={120} size={25} w={700} fill={C.amberD} anchor="start">
          exocrine 99% → ducts → gut
        </Tx>
        <An t={t} tw={show(A('one percent') - 0.1)}>
          <Tx x={1640} y={120} size={25} w={700} fill={C.red} anchor="end">
            endocrine 1% → blood
          </Tx>
        </An>
      </An>

      {/* ================= 1.2 tissue field (zoomed view) ================= */}
      <An t={t} pv={[960, 600]} tw={tw(pop(ZOOM_T + 0.35, 0.8), to(ISLET_T - 0.3, 0.6, { o: 0.12 }), to(SHRINK_T + 0.5, 0.6, { o: 1 }), scaleTo(B13, 2.6, 1.6, E.in), fade(A('branching') - 0.6, 0.6))}>
        <defs>
          <clipPath id="tfclip">
            <circle cx={TF.cx} cy={TF.cy} r={TF.r} />
          </clipPath>
        </defs>
        <circle cx={TF.cx} cy={TF.cy} r={TF.r + 10} fill="#fff" filter="url(#soft)" />
        <g clipPath="url(#tfclip)">
          <rect x={0} y={0} width={1920} height={1080} fill="#FBEBD3" />
          {ACINI_TF.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={34} fill="#F8DDB5" stroke={C.pancD} strokeWidth={2.5} />
              {[0, 60, 120, 180, 240, 300].map((a) => {
                const [gx, gy] = pol(x, y, 17, a + i * 13);
                return <circle key={a} cx={gx} cy={gy} r={5.5} fill={C.amber} />;
              })}
              <circle cx={x} cy={y} r={5} fill="#FFF9EE" />
            </g>
          ))}
          {/* duct */}
          <path d={TF_DUCT} fill="none" stroke={C.teal} strokeWidth={44} strokeLinecap="round" />
          <path d={TF_DUCT} fill="none" stroke="#EAF6FA" strokeWidth={32} strokeLinecap="round" />
          {/* capillary */}
          <path d={TF_CAP} fill="none" stroke="#D9847C" strokeWidth={30} strokeLinecap="round" />
          <path d={TF_CAP} fill="none" stroke="#F4BDB6" strokeWidth={20} strokeLinecap="round" />
          {/* islet */}
          <circle cx={900} cy={520} r={110} fill="#FFF6E2" stroke={C.pancD} strokeWidth={3} />
          {ICELLS.map(({ x, y, k }, i) => (
            <circle key={i} cx={900 + (x - ICX) * 0.33} cy={520 + (y - ICY) * 0.33} r={7} fill="#F4EEE2" stroke="#E6D9C2" strokeWidth={1} />
          ))}
          {/* arrows */}
          <Arrow d="M600,836 C760,816 960,795 1160,765 C1260,750 1320,742 1400,734" color="amber" sw={8} p={prog(t, A('into ducts'), 1.4)} />
          <Arrow d="M990,560 C1020,580 1030,590 1040,600" color="red" sw={8} p={prog(t, A('directly into the blood'), 0.6)} />
        </g>
        <An t={t} tw={show(A('into ducts') + 0.6)}>
          <Tag x={1480} y={870} size={26} fill={C.amberL} color={C.amberD}>
            → ducts → gut
          </Tag>
        </An>
        <An t={t} tw={show(A('directly into the blood') + 0.3)}>
          <Tag x={1240} y={420} size={26} fill={C.redL} color={C.redD}>
            hormones → blood
          </Tag>
        </An>
        <An t={t} tw={show(A('clusters') + 0.6)}>
          <Tag x={540} y={300} size={26} fill="#fff" stroke={C.pancD} color={C.amberD}>
            acini (exocrine)
          </Tag>
        </An>
        <An t={t} tw={show(A('islets of langerhans'))}>
          <Tag x={900} y={360} size={26} fill="#fff" stroke={C.greyL}>
            islet of Langerhans
          </Tag>
        </An>
      </An>

      {/* ================= 1.2 islet close-up ================= */}
      {t > ISLET_T - 0.25 && isl.o > 0.001 && (
        <g
          opacity={Math.min(1, prog(t, ISLET_T - 0.25, 0.35)) * isl.o}
          transform={`translate(${isl.x},${isl.y}) translate(${ICX},${ICY}) scale(${isl.s}) translate(${-ICX},${-ICY})`}
        >
          <circle cx={ICX} cy={ICY} r={IR} fill="#FFFAF0" stroke={C.pancD} strokeWidth={5} filter="url(#soft)" />
          {ICELLS.map(({ x, y, k }, i) => {
            const named = [A('beta cells'), A('alpha cells'), A('delta cells'), 1e9][k];
            const p = prog(t, named, 0.6);
            return <circle key={i} cx={x} cy={y} r={21} fill={mix('#F4EEE2', ITINT[k], p)} stroke="#fff" strokeWidth={3} />;
          })}
          <An t={t} tw={show(SHRINK_T + 0.6)}>
            <Tx x={ICX} y={ICY + IR + 90} size={100} w={700} fill={C.ink2}>
              islets: another lecture
            </Tx>
          </An>
        </g>
      )}
      {t > ISLET_T && t < SHRINK_T + 1 && (
        <An t={t} tw={tw(fade(SHRINK_T, 0.5))}>
          {[
            ['β · insulin · ~60%', A('beta cells'), 0],
            ['α · glucagon · ~25%', A('alpha cells'), 1],
            ['δ · somatostatin · ~10%', A('delta cells'), 2],
          ].map(([s, at, k]) => (
            <An t={t} tw={slideIn((at as number) + 0.2, 40, 0)} key={k as number}>
              <circle cx={1110} cy={430 + (k as number) * 120} r={26} fill={ITINT[k as number]} stroke="#fff" strokeWidth={3} />
              <Tx x={1160} y={430 + (k as number) * 120} size={40} w={700} anchor="start">
                {s as string}
              </Tx>
            </An>
          ))}
          <An t={t} tw={show(A('insulin and glucagon') + 0.3)}>
            <Tx x={1110} y={810} size={30} w={500} fill={C.ink2} anchor="start" italic>
              insulin + glucagon: glucose, fat, protein
            </Tx>
          </An>
        </An>
      )}
      <An t={t} tw={tw(slideIn(A('exocrine pancreas') - 0.1, 0, -30), fade(B13 + 0.3, 0.5))}>
        <Tag x={960} y={540} size={52} fill={C.amber} color="#fff" shadow>
          Today: exocrine pancreas
        </Tag>
      </An>

      {/* ================= 1.3 duct tree → grapes ================= */}
      {t > B13 - 0.5 && t < ACI_T + 1.5 && (
        <TreeScene t={t} />
      )}

      {/* ================= 1.3 acinus key frame ================= */}
      {t > ACI_T - 0.6 && t < B14 + 1.2 && <AcinusScene t={t} />}

      {/* ================= 1.5 board ================= */}
      {t > B15 - 0.6 && (
        <An t={t} tw={show(B15 - 0.5, 0.5)}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.paper} />
          <Board
            t={t}
            a={{
              ...boardIn(B15 - 0.3),
              a0: show(A('acinar cell') - 0.1),
              a1: show(A('acinar cell') + 0.25),
              t0: show(A('duct cell') - 0.1),
              t1: show(A('duct cell') + 0.25),
            }}
          />
        </An>
      )}

      <TitleCard t={t} n={1} title="One organ, two glands" question="How is the pancreas built to make two very different products?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};

// ---------------------------------------------------------------------------
const TreeScene: React.FC<{ t: number }> = ({ t }) => {
  const drawT = A('branching');
  const sacT = A('rounded sac');
  const grapeT = A('bunch of grapes');
  const grape2 = A('each grape is');
  const stemT = A('the stems are');
  const zoom = prog(t, ACI_T - 0.7, 1.0, E.in);
  const [hx, hy] = LEAVES[HI_LEAF];
  const toGrape = prog(t, grapeT, 0.8) * (1 - prog(t, grape2 + 0.2, 0.8));
  const stemBrown = prog(t, grapeT, 0.8) * (1 - prog(t, stemT, 0.8));
  const ductCol = mix(C.teal, '#7A5A3A', stemBrown);
  const leafFill = mix('#F8DDB5', '#9CC25C', toGrape);
  const leafStroke = mix(C.pancD, '#5F8A2C', toGrape);
  const sc = 1 + zoom * 5;
  const op = 1 - prog(t, ACI_T - 0.3, 0.5);
  return (
    <An t={t} tw={show(B13 - 0.5, 0.6)}>
      <g opacity={op} transform={`translate(${hx},${hy}) scale(${sc}) translate(${-hx},${-hy})`}>
        {SEGS.map((s, i) => (
          <Draw
            key={i}
            d={`M${s.x0},${s.y0} L${s.x1},${s.y1}`}
            p={prog(t, drawT + s.d * 0.35, 0.45)}
            stroke={ductCol}
            strokeWidth={22 - s.d * 4}
            strokeLinecap="round"
          />
        ))}
        {LEAVES.map(([x, y], i) => (
          <An t={t} tw={pop(sacT + i * 0.04, 0.5)} key={i}>
            <circle cx={x} cy={y} r={30} fill={leafFill} stroke={leafStroke} strokeWidth={3} />
            {toGrape > 0.05 && <circle cx={x - 9} cy={y - 10} r={7} fill="#fff" opacity={0.6 * toGrape} />}
            {toGrape < 0.95 &&
              [0, 72, 144, 216, 288].map((a) => {
                const [gx, gy] = pol(x, y, 14, a);
                return <circle key={a} cx={gx} cy={gy} r={4.5} fill={C.amber} opacity={1 - toGrape} />;
              })}
          </An>
        ))}
        {/* grape leaf at the stem */}
        <An t={t} tw={tw(show(grapeT, 0.6), fade(stemT, 0.6))}>
          <path d="M470,960 C420,900 380,930 360,980 C400,990 440,990 470,960 Z" fill="#7FA94A" stroke="#5F8A2C" strokeWidth={3} />
        </An>
        <An t={t} tw={tw(show(A('called an acinus') + 0.1, 0.3))}>
          <circle cx={hx} cy={hy} r={44} fill="none" stroke={C.amber} strokeWidth={6} />
        </An>
      </g>
      <g opacity={op}>
        <An t={t} tw={tw(slideIn(A('compound gland') + 0.1, 0, 20), fade(grapeT - 0.3, 0.4))}>
          <Caption x={1350} y={900} size={30}>
            compound gland (branched ducts)
          </Caption>
        </An>
        <An t={t} tw={tw(show(A('called an acinus') + 0.2), fade(grapeT - 0.3, 0.4))}>
          <Callout ax={hx + 40} ay={hy - 20} x={hx + 240} y={hy - 120} color={C.amberD}>
            acinus
          </Callout>
        </An>
        <An t={t} tw={tw(slideIn(grape2 + 0.2, 0, 20), fade(ACI_T - 0.6, 0.4))}>
          <Caption x={1350} y={300} size={32} fill={C.amberL} color={C.amberD} stroke="none">
            grape = acinus
          </Caption>
        </An>
        <An t={t} tw={tw(slideIn(stemT + 0.1, 0, 20), fade(ACI_T - 0.6, 0.4))}>
          <Caption x={1350} y={390} size={32} fill={C.tealL} color={C.tealD} stroke="none">
            stems = ducts
          </Caption>
        </An>
        {/* salivary gland inset */}
        <An t={t} tw={tw(slideIn(A('salivary gland') - 0.1, 40, 0), fade(A('compound gland') + 2.2, 0.5))}>
          <Card x={1330} y={120} w={420} h={330} />
          {[
            [1500, 250],
            [1545, 225],
            [1585, 255],
            [1530, 290],
            [1575, 300],
            [1615, 220],
            [1490, 300],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={30} fill="#F3D4C4" stroke="#C48A72" strokeWidth={3} />
          ))}
          <path d="M1500,300 C1470,340 1440,360 1400,370" fill="none" stroke={C.teal} strokeWidth={7} strokeLinecap="round" />
          <Tx x={1540} y={405} size={28} w={700} fill={C.ink2}>
            salivary gland
          </Tx>
        </An>
      </g>
    </An>
  );
};

// ---------------------------------------------------------------------------
const AcinusScene: React.FC<{ t: number }> = ({ t }) => {
  const g = AC;
  const enzT = A('the acini make');
  const bicT = A('the ducts make');
  const cellTint = enzT < t ? Math.sin(clamp((t - enzT) / 1.6) * Math.PI) : 0;
  const ductTint = Math.max(
    bicT < t ? Math.sin(clamp((t - bicT) / 1.6) * Math.PI) : 0,
    A('second factory') < t ? Math.sin(clamp((t - A('second factory')) / 1.6) * Math.PI) * 0.8 : 0,
  );
  const centroTint = prog(t, A('centroacinar') - 0.1, 0.6);
  const inT = ACI_T - 0.5;
  const out = prog(t, B14 - 0.6, 0.8, E.in);
  const dropT = A('sodium bicarbonate');
  const drops =
    t > dropT - 0.2
      ? Array.from({ length: 9 }, (_, k) => {
          const p = (((t - dropT) * 0.28 + k / 9) % 1 + 1) % 1;
          const x = 760 + p * 720;
          return (
            <g key={k} opacity={Math.min(1, (t - dropT + 0.2) / 0.5) * Math.min(1, (1 - p) * 6)}>
              <path d={`M${x},${570} c-8,10 -9,16 0,20 c9,-4 8,-10 0,-20 z`} transform={`translate(0,-8) scale(1)`} fill={C.teal} />
            </g>
          );
        })
      : null;
  const s = 0.55 + 0.45 * prog(t, inT, 1.0, E.out) - 0.45 * out;
  return (
    <g opacity={prog(t, inT, 0.5) * (1 - out)} transform={`translate(960,540) scale(${s}) translate(-960,-540)`}>
      <rect x={-2000} y={-2000} width={6000} height={6000} fill={C.paper} />
      <Acinus
        t={t}
        cx={g.cx}
        cy={g.cy}
        R={g.R}
        id="acg1"
        cellTint={cellTint}
        ductTint={ductTint}
        centroTint={centroTint}
        a={{
          grans: pop(A('zymogen granules') - 0.1, 0.5),
          locks: pop(A('inactive form') - 0.05, 0.5),
          duct: show(A('intercalated ducts') - 0.4, 0.5),
          centro: show(A('centroacinar') - 0.3, 0.4),
        }}
        sl={{ duct: drops }}
      />
      <An t={t} tw={show(ACI_T + 0.2)}>
        <Tag x={700} y={220} size={34} w={800} fill="#fff" stroke={C.pancD} color={C.amberD}>
          acinus
        </Tag>
      </An>
      <An t={t} tw={show(A('acinar cells') - 0.1)}>
        <Callout ax={pol(700, 580, 255, 205)[0]} ay={pol(700, 580, 255, 205)[1]} x={215} y={360} color={C.amberD}>
          acinar cells
        </Callout>
      </An>
      <An t={t} tw={show(A('zymogen granules') + 0.2)}>
        <Callout ax={g.granules[3][5][0]} ay={g.granules[3][5][1]} x={235} y={800} color={C.amberD}>
          zymogen granules
        </Callout>
      </An>
      <An t={t} tw={show(A('inactive form') + 0.2)}>
        <g>
          <LockIcon x={120} y={880} s={1.3} />
          <Tx x={150} y={882} size={26} w={600} fill={C.ink2} anchor="start">
            inactive enzymes
          </Tx>
        </g>
      </An>
      <An t={t} tw={show(A('centroacinar') + 0.1)}>
        <Callout ax={700 + g.r0 * 0.95} ay={580 + g.r0 * 0.35} x={880} y={960} color={C.tealD}>
          centroacinar cells
        </Callout>
      </An>
      <An t={t} tw={show(A('intercalated ducts') + 0.1)}>
        <Callout ax={1240} ay={520} x={1290} y={360} color={C.tealD}>
          intercalated duct
        </Callout>
      </An>
      <An t={t} tw={show(A('progressively larger') + 0.1)}>
        <Arrow d="M1500,580 L1640,580" color="teal" sw={7} />
        <Tx x={1700} y={540} size={24} w={600} fill={C.tealD}>
          larger ducts
        </Tx>
      </An>
      <An t={t} tw={slideIn(dropT + 0.3, 0, 20)}>
        <Tag x={1350} y={700} size={30} fill={C.tealL} color={C.tealD}>
          NaHCO_3_ fluid
        </Tag>
      </An>
      <An t={t} tw={slideIn(enzT, 0, 20)}>
        <Caption x={480} y={1010} size={32} fill={C.amberL} color={C.amberD} stroke="none">
          acini → enzymes
        </Caption>
      </An>
      <An t={t} tw={slideIn(bicT, 0, 20)}>
        <Caption x={1420} y={1010} size={32} fill={C.tealL} color={C.tealD} stroke="none">
          ducts → bicarbonate
        </Caption>
      </An>
    </g>
  );
};

void [Card, P, move, pulse, scaleTo, AE, LockIcon];
