// Reusable set pieces (React port of lib.js). Flat vector style on the paper canvas.
// Each component takes the global time t and an animation map `a`
// (part name -> tweens), so chapters can drive any sub-part on cue.
import React from 'react';
import { An, Card, P, pol, Tag, Tx } from './prims';
import { C } from './colors';
import { E, prog, show, slideIn, pop, fade, tw, Tw } from './anim';
import { W, H } from './timeline';

export type AMap = Record<string, Tw[] | undefined>;

// ---------- small glyphs ----------
export const LockIcon: React.FC<{ x: number; y: number; s?: number; color?: string; open?: number }> = ({ x, y, s = 1, color = C.grey, open = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path
      d="M-7,-2 L-7,-8 A7,7 0 0 1 7,-8 L7,-2"
      fill="none"
      stroke={color}
      strokeWidth={3.2}
      strokeLinecap="round"
      transform={open ? `translate(0,${-6 * open}) rotate(${-30 * open},7,-2)` : undefined}
    />
    <rect x={-10} y={-3} width={20} height={15} rx={3} fill={color} />
    <circle cx={0} cy={4} r={2.3} fill="#fff" />
  </g>
);

export const Ion: React.FC<{ label: string; color: string; x?: number; y?: number; r?: number; size?: number; tc?: string; op?: number }> = ({
  label, color, x = 0, y = 0, r = 21, size = 23, tc = '#fff', op,
}) => {
  const h = r * 2;
  const plain = label.replace(/[_^]/g, '');
  const w = Math.max(h, plain.length * size * 0.55 + 18);
  return (
    <g transform={`translate(${x},${y})`} opacity={op}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} stroke="#fff" strokeWidth={3} />
      <Tx x={0} y={1} size={size} w={700} fill={tc}>
        {label}
      </Tx>
    </g>
  );
};
type IonP = { x?: number; y?: number; op?: number; r?: number; size?: number };
export const ION = {
  H: (p: IonP) => <Ion label="H^+^" color={C.red} {...p} />,
  HCO3: (p: IonP) => <Ion label="HCO_3_^−^" color={C.teal} {...p} />,
  Cl: (p: IonP) => <Ion label="Cl^−^" color={C.green} {...p} />,
  Na: (p: IonP) => <Ion label="Na^+^" color={C.gold} tc={C.ink} {...p} />,
  K: (p: IonP) => <Ion label="K^+^" color={C.lilac} {...p} />,
  CO2: (p: IonP) => <Ion label="CO_2_" color={C.grey} {...p} />,
  H2O: (p: IonP) => <Ion label="H_2_O" color="#7FB8D6" {...p} />,
  Ca: (p: IonP) => <Ion label="Ca^2+^" color={C.violetL} tc={C.violet} {...p} />,
};

export const StepBadge: React.FC<{ n: number | string; x: number; y: number; color?: string; r?: number }> = ({ n, x, y, color = C.ink, r = 24 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={color} />
    <Tx x={x} y={y + 1} size={r * 1.08} w={800} fill="#fff">
      {String(n)}
    </Tx>
  </g>
);

/** hexagon hormone glyph */
export const Hex: React.FC<{ x: number; y: number; r?: number; fill: string; label?: string; size?: number; stroke?: string }> = ({ x, y, r = 26, fill, label, size, stroke = '#fff' }) => (
  <g>
    <polygon points={P([0, 60, 120, 180, 240, 300].map((a) => pol(x, y, r, a + 30)))} fill={fill} stroke={stroke} strokeWidth={3} />
    {label && (
      <Tx x={x} y={y + 1} size={size || r * 0.62} w={800} fill="#fff">
        {label}
      </Tx>
    )}
  </g>
);

/** violet nerve bolt */
export const Bolt: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = C.violet }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M6,-30 L-14,4 L0,4 L-6,30 L16,-6 L2,-6 L10,-30 Z" fill={fill} stroke="#fff" strokeWidth={2.5} strokeLinejoin="round" />
  </g>
);

/** enzyme glyph: circle with a cutting blade (active) or padlock (locked) */
export const Enzyme: React.FC<{ x: number; y: number; r?: number; active?: number; label?: string; lsize?: number; lock?: boolean; lockOpen?: number }> = ({
  x, y, r = 30, active = 1, label, lsize = 22, lock, lockOpen = 0,
}) => {
  const fill = active >= 1 ? C.amber : active <= 0 ? C.grey : undefined;
  const mixF = fill || `rgb(${Math.round(138 + (232 - 138) * active)},${Math.round(143 + (144 - 143) * active)},${Math.round(152 + (42 - 152) * active)})`;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={mixF} stroke={active > 0.5 ? C.amberD : C.greyD} strokeWidth={3} />
      {active > 0.5 && (
        <path
          d={`M${x - r * 0.6},${y + r * 0.4} L${x},${y - r * 0.6} L${x + r * 0.6},${y + r * 0.4}`}
          fill="none"
          stroke="#fff"
          strokeWidth={r * 0.17}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={Math.min(1, (active - 0.5) * 2)}
        />
      )}
      {lock && <LockIcon x={x + r * 0.7} y={y - r * 0.7} s={r / 28} color={C.greyD} open={lockOpen} />}
      {label && (
        <Tx x={x} y={y + r + lsize * 0.9} size={lsize} w={700} fill={active > 0.5 ? C.amberD : C.greyD}>
          {label}
        </Tx>
      )}
    </g>
  );
};

/** gold key (enteropeptidase) */
export const Key: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <circle cx={-26} cy={0} r={18} fill="none" stroke={C.gold} strokeWidth={9} />
    <path d="M-8,0 L36,0 M24,0 L24,14 M34,0 L34,11" stroke={C.gold} strokeWidth={9} strokeLinecap="round" fill="none" />
    <circle cx={-26} cy={0} r={18} fill="none" stroke="#B8901F" strokeWidth={2} />
  </g>
);

/** white shield (trypsin inhibitor) */
export const Shield: React.FC<{ x: number; y: number; s?: number; fill?: string; stroke?: string }> = ({ x, y, s = 1, fill = '#fff', stroke = C.teal }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M0,-34 L28,-24 C28,6 20,22 0,36 C-20,22 -28,6 -28,-24 Z" fill={fill} stroke={stroke} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-10,0 L-2,9 L12,-9" fill="none" stroke={stroke} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// ---------- pH strip ----------
export const PhStrip: React.FC<{ x: number; y: number; w: number; value: number; id: string; card?: boolean }> = ({ x, y, w, value, id, card }) => {
  const pos = (v: number) => x + ((v - 1) / 8) * w;
  return (
    <g>
      {card && <Card x={x - 90} y={y - 120} w={w + 140} h={190} rx={26} />}
      <defs>
        <linearGradient id={id} x1={0} x2={1} y1={0} y2={0}>
          {[
            ['0%', '#C93A35'],
            ['22%', '#E0673B'],
            ['45%', '#E9B949'],
            ['62%', '#9CC79A'],
            ['78%', '#3E9CC2'],
            ['100%', '#3A5FA8'],
          ].map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      <rect x={pos(7)} y={y - 34} width={pos(8) - pos(7)} height={68} rx={10} fill={C.tealL} opacity={0.9} />
      <rect x={x} y={y - 16} width={w} height={32} rx={16} fill={`url(#${id})`} stroke="#fff" strokeWidth={3} />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((v) => (
        <Tx key={v} x={pos(v)} y={y + 44} size={22} w={600} fill={C.ink2}>
          {String(v)}
        </Tx>
      ))}
      <Tx x={x - 46} y={y} size={28} w={800}>
        pH
      </Tx>
      <g transform={`translate(${pos(value)},${y})`}>
        <path d="M0,-22 L-14,-46 L14,-46 Z" fill={C.ink} />
        <rect x={-38} y={-96} width={76} height={46} rx={23} fill={C.ink} />
        <Tx x={0} y={-73} size={24} w={700} fill="#fff">
          {value.toFixed(1)}
        </Tx>
      </g>
    </g>
  );
};

// ---------- upper GI map (world coords) ----------
export const PANC_D =
  'M702,700 C700,652 760,640 800,660 C860,690 900,700 960,690 C1080,670 1200,640 1310,615 C1400,595 1470,585 1510,600 C1546,615 1540,652 1505,662 C1440,680 1360,692 1290,702 C1180,720 1060,750 960,765 C900,775 880,800 862,836 C842,872 772,876 730,858 C700,842 702,780 702,700 Z';
export const PDUCT_D = 'M1500,628 C1400,640 1300,660 1180,686 C1060,712 950,726 880,742 C800,758 740,742 696,714';
export const DUO_D =
  'M885,602 C820,600 760,598 722,610 C684,622 668,650 668,700 L668,820 C668,880 700,905 760,905 L1000,905 C1050,905 1070,880 1076,840 L1086,780 C1092,748 1122,740 1152,760';
export const STOM_D =
  'M1075,275 C1060,230 1110,200 1170,205 C1260,212 1322,280 1322,370 C1322,500 1272,600 1172,650 C1082,695 962,690 900,650 L882,616 L890,586 C960,600 1040,596 1090,560 C1150,515 1150,420 1120,350 C1105,315 1090,295 1075,275 Z';
export const CBD_D = 'M724,318 L716,450 C711,560 708,640 694,712';
export const CYSTIC_D = 'M650,402 C680,410 704,426 716,448';
export const GB_D = 'M612,388 C588,432 598,482 640,492 C684,498 694,452 676,398 Z';
export const LIVER_D =
  'M300,250 C420,170 760,150 980,190 C1040,200 1062,238 1022,270 C900,332 760,380 640,402 C520,422 380,402 322,352 C282,322 272,282 300,250 Z';
export const SPLEEN_D =
  'M1560,500 C1600,460 1680,470 1700,530 C1715,590 1690,650 1640,660 C1600,665 1588,622 1600,590 C1580,570 1550,540 1560,500 Z';
export const ESO_D = 'M1052,120 C1058,180 1066,230 1078,276';
export const PAPILLA = [694, 714] as const;

export const ISLETS: [number, number][] = Array.from({ length: 26 }, (_, i) => {
  const x = 740 + ((i * 131) % 760), y = 640 + ((i * 71) % 170);
  return [x, y - (x - 740) * 0.09];
});

type Slots = Partial<Record<'under' | 'behindPanc' | 'overPanc' | 'overDuo' | 'overStom' | 'top', React.ReactNode>>;
export const GutMap: React.FC<{
  t: number;
  a?: AMap;
  torso?: boolean;
  sl?: Slots;
  pductStroke?: string;
  pductW?: number;
  stomFill?: string;
  gbScale?: number;
  oddiR?: number;
  pylorusW?: number;
}> = ({ t, a = {}, torso, sl = {}, pductStroke = C.amberD, pductW = 6, stomFill = C.pink, gbScale = 1, oddiR = 15, pylorusW = 10 }) => (
  <g>
    {torso && (
      <An t={t} tw={a.torso}>
        <circle cx={990} cy={-470} r={175} fill="#F6E7D8" stroke="#DCC3A9" strokeWidth={6} />
        <path d="M890,-300 L1090,-300 L1110,-200 L870,-200 Z" fill="#F6E7D8" stroke="#DCC3A9" strokeWidth={6} />
        <path d="M350,-110 C350,-250 1630,-250 1630,-110 L1590,1160 C1570,1270 410,1270 390,1160 Z" fill="#F6E7D8" stroke="#DCC3A9" strokeWidth={6} />
      </An>
    )}
    {sl.under}
    <An t={t} tw={a.liver}>
      <path d={LIVER_D} fill="#DDA595" stroke="#A9705F" strokeWidth={4} />
    </An>
    <An t={t} tw={a.ducts}>
      <path d={CBD_D} fill="none" stroke={C.bile} strokeWidth={11} strokeLinecap="round" />
      <path d={CYSTIC_D} fill="none" stroke={C.bile} strokeWidth={9} strokeLinecap="round" />
    </An>
    <An t={t} tw={a.gb}>
      <path d={GB_D} fill="#C5CA74" stroke={C.bile} strokeWidth={4} transform={gbScale !== 1 ? `translate(640,440) scale(${gbScale}) translate(-640,-440)` : undefined} />
    </An>
    <An t={t} tw={a.spleen}>
      <path d={SPLEEN_D} fill="#C9A3BF" stroke="#8E6683" strokeWidth={4} />
    </An>
    <An t={t} tw={a.panc}>
      {sl.behindPanc}
      <path d={PANC_D} fill={C.panc} stroke={C.pancD} strokeWidth={4} strokeLinejoin="round" />
      <defs>
        <clipPath id="pclip">
          <path d={PANC_D} />
        </clipPath>
      </defs>
      <An t={t} tw={a.lob} base={{ o: 0.35 }}>
        <g clipPath="url(#pclip)">
          {Array.from({ length: 120 }, (_, i) => (
            <circle key={i} cx={690 + ((i * 97) % 860)} cy={590 + ((i * 53) % 300)} r={16 + (i % 3) * 4} fill="none" stroke={C.pancD} strokeWidth={1.5} />
          ))}
        </g>
      </An>
      <An t={t} tw={a.pduct} base={{ o: 0 }}>
        <path d={PDUCT_D} fill="none" stroke={pductStroke} strokeWidth={pductW} strokeLinecap="round" />
      </An>
      <An t={t} tw={a.islets} base={{ o: 0 }}>
        {ISLETS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} fill="#FFF6E2" stroke={C.pancD} strokeWidth={1.5} />
        ))}
      </An>
      {sl.overPanc}
    </An>
    <An t={t} tw={a.duo}>
      <path d={DUO_D} fill="none" stroke={C.fleshD} strokeWidth={56} strokeLinecap="round" strokeLinejoin="round" />
      <path d={DUO_D} fill="none" stroke={C.flesh} strokeWidth={47} strokeLinecap="round" strokeLinejoin="round" />
    </An>
    {sl.overDuo}
    <An t={t} tw={a.papilla}>
      <circle cx={694} cy={714} r={9} fill="#E7B48E" stroke={C.fleshD} strokeWidth={3} />
    </An>
    <An t={t} tw={a.oddi} base={{ o: 0 }}>
      <circle cx={694} cy={714} r={oddiR} fill="none" stroke="#B25A4A" strokeWidth={4} />
    </An>
    <An t={t} tw={a.stom} pv={[1180, 450]}>
      <path d={ESO_D} fill="none" stroke={C.pinkD} strokeWidth={44} strokeLinecap="round" />
      <path d={ESO_D} fill="none" stroke={C.pink} strokeWidth={36} strokeLinecap="round" />
      <path d={STOM_D} fill={stomFill} stroke={C.pinkD} strokeWidth={4.5} strokeLinejoin="round" />
      <g opacity={0.45}>
        {[
          'M1150,260 C1200,300 1230,380 1240,460',
          'M1180,240 C1250,290 1280,380 1270,500',
          'M1110,620 C1150,610 1200,580 1230,540',
          'M980,640 C1040,640 1100,620 1150,590',
        ].map((d) => (
          <path key={d} d={d} fill="none" stroke={C.pinkD} strokeWidth={3} strokeLinecap="round" />
        ))}
      </g>
      {sl.overStom}
    </An>
    <An t={t} tw={a.pylorus}>
      <path d="M884,586 L880,618" stroke="#A85F55" strokeWidth={pylorusW} strokeLinecap="round" />
    </An>
    {sl.top}
  </g>
);

// ---------- acinus cross-section + intercalated duct (local coords) ----------
export function acinusGeom(cx: number, cy: number, R = 250) {
  const r0 = R * 0.22, open = 26, n = 9;
  const span = (360 - 2 * open) / n;
  const cells = Array.from({ length: n }, (_, i) => {
    const a0 = open + i * span + 1.6, a1 = open + (i + 1) * span - 1.6;
    const am = (a0 + a1) / 2;
    return { a0, a1, am };
  });
  const dx0 = cx + R * 0.55, dx1 = cx + R * 2.6, dw = R * 0.34;
  const gpos: [number, number][] = [[0.3, 0], [0.3, -0.28], [0.3, 0.28], [0.4, -0.14], [0.4, 0.14], [0.5, 0]];
  const granules = cells.map(({ am }) => gpos.map(([fr, fa]) => pol(cx, cy, r0 + 10 + fr * (R - r0) * 0.62, am + fa * span)));
  const locks = cells.map(({ am }) => pol(cx, cy, r0 + 10 + 0.62 * (R - r0) * 0.62, am));
  const nuclei = cells.map(({ am }) => pol(cx, cy, R * 0.78, am));
  return { r0, span, cells, dx0, dx1, dw, granules, locks, nuclei, cx, cy, R };
}

export const Acinus: React.FC<{
  t: number;
  cx: number;
  cy: number;
  R?: number;
  a?: AMap;
  id: string;
  cellTint?: number; // 0..1 amber tint over acinar cells
  ductTint?: number; // 0..1 teal tint over duct cells
  centroTint?: number;
  grey?: number; // 0..1 fibrotic grey
  sl?: Partial<Record<'lumen' | 'duct' | 'top', React.ReactNode>>;
}> = ({ t, cx, cy, R = 250, a = {}, id, cellTint = 0, ductTint = 0, centroTint = 0, grey = 0, sl = {} }) => {
  const g = acinusGeom(cx, cy, R);
  const { r0, dx0, dx1, dw } = g;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx={cx} cy={cy} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDF0DC" />
          <stop offset="55%" stopColor="#FBE6C8" />
          <stop offset="100%" stopColor="#E8D2E6" />
        </radialGradient>
      </defs>
      <An t={t} tw={a.bm}>
        <circle cx={cx} cy={cy} r={R + 9} fill="none" stroke="#CDB6D6" strokeWidth={5} opacity={0.9} />
      </An>
      <An t={t} tw={a.lumen}>
        <circle cx={cx} cy={cy} r={r0 + 6} fill="#FFF9EE" />
      </An>
      <An t={t} tw={a.duct}>
        <rect x={cx + r0 * 0.5} y={cy - dw * 0.28} width={dx1 - cx} height={dw * 0.56} fill="#EAF6FA" />
        {sl.duct}
        <An t={t} tw={a.ductCells}>
          {[-1, 1].map((side) =>
            Array.from({ length: 7 }, (_, i) => {
              const x = dx0 + (i * (dx1 - dx0)) / 7, w = (dx1 - dx0) / 7 - 6;
              const y = side < 0 ? cy - dw * 0.28 - dw * 0.55 : cy + dw * 0.28;
              return (
                <g key={`${side}${i}`}>
                  <rect x={x} y={y} width={w} height={dw * 0.55} rx={10} fill="#D3EAF4" stroke={C.teal} strokeWidth={3} />
                  {ductTint > 0 && <rect x={x} y={y} width={w} height={dw * 0.55} rx={10} fill={C.teal} opacity={ductTint * 0.55} />}
                  <circle cx={x + w / 2} cy={y + dw * 0.275 + side * 6} r={9} fill="#9CC6DA" />
                </g>
              );
            }),
          )}
        </An>
      </An>
      <An t={t} tw={a.centro}>
        {[
          [cx + r0 * 0.55, cy - r0 * 0.55],
          [cx + r0 * 0.95, cy + r0 * 0.35],
          [cx + r0 * 1.6, cy - r0 * 0.1],
        ].map(([x, y], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={r0 * 0.55}
            ry={r0 * 0.38}
            transform={`rotate(${i * 40 - 30},${x},${y})`}
            fill={centroTint > 0 ? `rgba(42,143,184,${0.15 + 0.35 * centroTint})` : '#F1F4F6'}
            stroke={centroTint > 0 ? C.teal : '#8FB5C6'}
            strokeWidth={3}
          />
        ))}
      </An>
      <An t={t} tw={a.cells}>
        {g.cells.map(({ a0, a1 }, i) => {
          const [x0, y0] = pol(cx, cy, r0 + 8, a0), [x1, y1] = pol(cx, cy, R, a0), [x2, y2] = pol(cx, cy, R, a1), [x3, y3] = pol(cx, cy, r0 + 8, a1);
          const d = `M${x0},${y0} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} L${x3},${y3} A${r0},${r0} 0 0 0 ${x0},${y0} Z`;
          return (
            <An t={t} tw={a['cell' + i]} key={i}>
              <path d={d} fill={`url(#${id})`} stroke={C.pancD} strokeWidth={4} strokeLinejoin="round" />
              {cellTint > 0 && <path d={d} fill={C.amber} opacity={cellTint * 0.45} />}
              {grey > 0 && <path d={d} fill="#B9BCC3" opacity={grey * 0.85} />}
            </An>
          );
        })}
        {g.cells.map(({ a0, a1, am }, i) => (
          <g key={'o' + i} opacity={1 - grey * 0.7}>
            {[R * 0.9, R * 0.94].map((rr) => {
              const [p0x, p0y] = pol(cx, cy, rr, a0 + g.span * 0.22), [p1x, p1y] = pol(cx, cy, rr, a1 - g.span * 0.22);
              return <path key={rr} d={`M${p0x},${p0y} A${rr},${rr} 0 0 1 ${p1x},${p1y}`} fill="none" stroke="#A98BC0" strokeWidth={2.2} opacity={0.7} />;
            })}
            <ellipse cx={g.nuclei[i][0]} cy={g.nuclei[i][1]} rx={R * 0.085} ry={R * 0.07} transform={`rotate(${am},${g.nuclei[i][0]},${g.nuclei[i][1]})`} fill="#9C7FB6" opacity={0.85} />
          </g>
        ))}
      </An>
      <An t={t} tw={a.grans}>
        {g.granules.map((gs, i) => (
          <An t={t} tw={a['gran' + i]} key={i}>
            {gs.map(([gx, gy], k) => (
              <circle key={k} cx={gx} cy={gy} r={R * 0.04} fill={C.amber} stroke={C.amberD} strokeWidth={1.5} />
            ))}
          </An>
        ))}
      </An>
      <An t={t} tw={a.locks}>
        {g.locks.map(([lx, ly], i) => (
          <An t={t} tw={a['lock' + i]} key={i}>
            <LockIcon x={lx} y={ly} s={R * 0.0034} color={C.grey} />
          </An>
        ))}
      </An>
      {sl.lumen}
      {sl.top}
    </g>
  );
};

// ---------- duct cell transport diagram (full canvas, world coords) ----------
export const DC = {
  co2In: 'M300,520 C450,520 700,520 860,520',
  hOut: 'M880,500 C760,470 600,452 520,450 C470,450 380,452 300,456',
  naIn: 'M300,430 C380,430 470,432 520,432 C560,432 620,430 660,430',
  hco3Out: 'M930,540 C1050,560 1220,556 1300,556 C1340,556 1400,560 1480,580',
  clIn: 'M1480,520 C1400,522 1340,524 1300,524 C1240,524 1200,500 1200,450',
  clOut: 'M1200,450 C1200,390 1250,360 1300,360 C1350,360 1400,360 1470,370',
  naOut: 'M640,700 C600,680 540,650 500,640 C460,632 380,630 300,630',
  kIn: 'M300,660 C380,664 460,660 500,654 C540,650 600,660 640,690',
  para: 'M300,900 C700,900 1000,918 1300,918 C1400,918 1460,880 1520,840',
  nbcIn: 'M300,300 C400,300 470,300 500,300 C560,300 640,320 700,360',
};

export const DuctCell: React.FC<{
  t: number;
  a?: AMap;
  cftrGrey?: number;
  cftrOpen?: number; // 0..1 widens the channel pore
  sl?: Partial<Record<'under' | 'cell' | 'top', React.ReactNode>>;
}> = ({ t, a = {}, cftrGrey = 0, cftrOpen = 0, sl = {} }) => {
  const tp = (x: number, y: number, w: number, h: number, fill: string, stroke: string) => (
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h * 0.3} fill={fill} stroke={stroke} strokeWidth={3.5} />
  );
  const memb = (x: number, y: number, w: number, h: number, op: number, fill: string) => (
    <g opacity={op}>
      <rect x={x} y={y} width={w} height={h} rx={44} fill={fill} stroke={C.teal} strokeWidth={11} filter={op === 1 ? 'url(#soft)' : undefined} />
      <rect x={x} y={y} width={w} height={h} rx={44} fill="none" stroke="#fff" strokeWidth={2.6} />
    </g>
  );
  const cg = cftrGrey;
  return (
    <g>
      {sl.under}
      <An t={t} tw={a.blood}>
        <rect x={70} y={120} width={250} height={840} rx={125} fill="#F7D9D5" stroke="#D9847C" strokeWidth={4} />
        <rect x={84} y={134} width={222} height={812} rx={111} fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.8} />
        {Array.from({ length: 7 }, (_, i) => {
          const x = 150 + (i % 2) * 90, y = 200 + i * 110;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={34} ry={20} fill="#E27E73" />
              <ellipse cx={x} cy={y} rx={16} ry={8} fill="#EFA79F" />
            </g>
          );
        })}
        <Tx x={195} y={1000} size={30} w={700} fill="#B5544B">
          blood
        </Tx>
      </An>
      <An t={t} tw={a.neighbors}>
        {memb(500, -60, 820, 210, 0.6, '#E7F1F5')}
        {memb(500, 930, 820, 210, 0.6, '#E7F1F5')}
      </An>
      <An t={t} tw={a.cell}>
        {memb(500, 170, 820, 740, 1, '#EEF7FA')}
        <g opacity={0.55}>
          {[
            [640, 330, 20],
            [1150, 760, -25],
            [1010, 830, 10],
          ].map(([x, y, r]) => (
            <g key={x} transform={`rotate(${r},${x},${y})`}>
              <ellipse cx={x} cy={y} rx={46} ry={20} fill="#F6DCC8" stroke="#D8A88A" strokeWidth={2.5} />
              <path d={`M${x - 30},${y} q10,-12 20,0 t20,0 t20,0`} fill="none" stroke="#D8A88A" strokeWidth={2} />
            </g>
          ))}
        </g>
        <ellipse cx={760} cy={760} rx={120} ry={78} fill="#DCD3EA" stroke="#9A89BC" strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={700 + ((i * 37) % 130)} cy={730 + ((i * 23) % 60)} r={5 + (i % 3)} fill="#B9A9D3" opacity={0.8} />
        ))}
        {sl.cell}
      </An>
      <An t={t} tw={a.tj}>
        {[
          [1300, 162],
          [1300, 918],
        ].map(([x, y]) => (
          <rect key={y} x={x - 26} y={y - 10} width={40} height={20} rx={6} fill={C.ink2} />
        ))}
      </An>
      <An t={t} tw={a.lumen}>
        <rect x={1340} y={60} width={520} height={960} rx={60} fill="#E3F2F8" stroke="#A8D2E3" strokeWidth={3} />
        <Tx x={1600} y={1000} size={30} w={700} fill={C.tealD}>
          duct lumen
        </Tx>
      </An>
      <An t={t} tw={a.basoLbl}>
        <Tx x={500} y={128} size={24} w={700} fill={C.ink2}>
          basolateral
        </Tx>
      </An>
      <An t={t} tw={a.apiLbl}>
        <Tx x={1320} y={128} size={24} w={700} fill={C.ink2}>
          apical
        </Tx>
      </An>
      <An t={t} tw={a.nbc} base={{ o: 0 }}>
        {tp(500, 300, 56, 70, C.goldL, C.gold)}
      </An>
      <An t={t} tw={a.nhe} base={{ o: 0 }}>
        {tp(500, 450, 64, 96, '#FBE3D4', C.red)}
        <path d="M478,450 L522,450" stroke="#fff" strokeWidth={3} />
      </An>
      <An t={t} tw={a.atpase} base={{ o: 0 }}>
        <circle cx={500} cy={640} r={48} fill="#FFF1C9" stroke={C.gold} strokeWidth={4} />
        <Tx x={500} y={640} size={22} w={800}>
          ATP
        </Tx>
      </An>
      <An t={t} tw={a.cftr} base={{ o: 0 }}>
        {tp(1320, 360, 60, 84, cg > 0 ? `rgb(${205 - 0 * cg},${232 - 15 * cg},${214 - 0 * cg})` : C.greenL, cg > 0.5 ? C.grey : C.green)}
        <rect x={1320 - 8 - 6 * cftrOpen} y={330} width={16 + 12 * cftrOpen} height={60} rx={8} fill="#fff" />
        {cg > 0 && <rect x={1290} y={318} width={60} height={84} rx={25} fill={C.greyL} opacity={cg * 0.85} />}
      </An>
      <An t={t} tw={a.ae} base={{ o: 0 }}>
        {tp(1320, 540, 64, 100, '#D7ECF6', C.teal)}
        <path d="M1298,540 L1342,540" stroke="#fff" strokeWidth={3} />
      </An>
      <An t={t} tw={a.ca} base={{ o: 0 }}>
        <circle cx={900} cy={520} r={40} fill="#fff" stroke={C.violet} strokeWidth={4} strokeDasharray="7 6" />
        <Tx x={900} y={520} size={26} w={800} fill={C.violet}>
          CA
        </Tx>
      </An>
      {sl.top}
    </g>
  );
};

// ---------- two-factory board (hud coords) ----------
export const BOARD_ROWS = ['Product', 'Cell', 'Trigger', 'Hormone', 'Messenger', 'What goes wrong'];
export const BOARD_CELLS = {
  amber: ['Enzymes', 'Acinar cell', 'Peptides + fatty acids', 'CCK (+ ACh)', 'Ca^2+^ (IP_3_)', 'Premature activation → acute pancreatitis'],
  teal: ['HCO_3_^−^ fluid (NaHCO_3_)', 'Centroacinar + duct cells', 'Acid (pH < 4.5–5)', 'Secretin', 'cAMP', 'CFTR defect → thick juice (cystic fibrosis)'],
};
export const BOARD_NOTES = {
  amber: 'RER → Golgi → zymogen granules · released by ↑Ca^2+^',
  teal: 'made by carbonic anhydrase · exported via Cl^−^ exchange',
};
export const BOARD = { colX: { amber: 860, teal: 1440 }, top: 250, rh: 122 };

/**
 * Board parts (keys of `a`): bg, title, headA, headT, lines, row0..5, a0..5, t0..5,
 * noteA, noteT, pot, warnA, warnT. Cells/notes/pot are hidden unless animated.
 */
export const Board: React.FC<{ t: number; a?: AMap; shown?: Partial<Record<string, boolean>>; hl?: React.ReactNode }> = ({ t, a = {}, shown = {}, hl }) => {
  const { colX, top, rh } = BOARD;
  const vis = (k: string) => (shown[k] ? undefined : { o: 0 });
  return (
    <g>
      <An t={t} tw={a.bg}>
        <Card x={140} y={70} w={1640} h={940} rx={34} />
      </An>
      {hl}
      <An t={t} tw={a.title}>
        <Tx x={340} y={158} size={34} w={800} fill={C.ink2}>
          The pancreas
        </Tx>
      </An>
      {(['amber', 'teal'] as const).map((side) => (
        <An t={t} tw={a[side === 'amber' ? 'headA' : 'headT']} key={side}>
          <rect x={colX[side] - 280} y={112} width={560} height={92} rx={46} fill={C[side]} />
          <Tx x={colX[side]} y={158} size={40} w={800} fill="#fff">
            {side === 'amber' ? 'Acinar factory' : 'Duct factory'}
          </Tx>
        </An>
      ))}
      <An t={t} tw={a.lines}>
        {BOARD_ROWS.map((_, i) => (
          <line key={i} x1={180} x2={1740} y1={top + i * rh + rh - 6} y2={top + i * rh + rh - 6} stroke={C.greyL} strokeWidth={2} />
        ))}
      </An>
      {BOARD_ROWS.map((r, i) => {
        const y = top + i * rh;
        return (
          <g key={r}>
            <An t={t} tw={a['row' + i]}>
              <Tx x={200} y={y + rh / 2 - 4} size={30} w={700} fill={C.ink2} anchor="start">
                {r}
              </Tx>
            </An>
            {(['amber', 'teal'] as const).map((side) => {
              const txt = BOARD_CELLS[side][i];
              const key = (side === 'amber' ? 'a' : 't') + i;
              const long = txt.length > 30;
              const k = txt.indexOf('→');
              return (
                <An t={t} tw={a[key]} base={vis(key)} key={side}>
                  {long ? (
                    <>
                      <Tx x={colX[side]} y={y + rh / 2 - 22} size={25} w={650}>
                        {txt.slice(0, k + 1).trim()}
                      </Tx>
                      <Tx x={colX[side]} y={y + rh / 2 + 14} size={25} w={650}>
                        {txt.slice(k + 1).trim()}
                      </Tx>
                    </>
                  ) : (
                    <Tx x={colX[side]} y={y + rh / 2 - 4} size={31} w={650}>
                      {txt}
                    </Tx>
                  )}
                </An>
              );
            })}
          </g>
        );
      })}
      {(['amber', 'teal'] as const).map((side) => {
        const key = side === 'amber' ? 'noteA' : 'noteT';
        return (
          <An t={t} tw={a[key]} base={vis(key)} key={key}>
            <Tx x={colX[side]} y={top + 86} size={19} w={500} fill={side === 'amber' ? C.amberD : C.tealD}>
              {BOARD_NOTES[side]}
            </Tx>
          </An>
        );
      })}
      {(['amber', 'teal'] as const).map((side) => {
        const key = side === 'amber' ? 'warnA' : 'warnT';
        const x = colX[side] - 262, y = top + 5 * rh + rh / 2 - 4;
        return (
          <An t={t} tw={a[key]} base={vis(key)} key={key}>
            <path d={`M${x},${y - 18} L${x + 20},${y + 16} L${x - 20},${y + 16} Z`} fill={C.red} stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
            <Tx x={x} y={y + 4} size={20} w={800} fill="#fff">
              !
            </Tx>
          </An>
        );
      })}
      <An t={t} tw={a.pot} base={vis('pot')}>
        <path d="M1030,672 L1300,672" stroke={C.violet} strokeWidth={6} strokeLinecap="round" markerEnd="url(#ar-violet)" markerStart="url(#ar-violet)" fill="none" />
        <Tx x={1165} y={640} size={22} w={700} fill={C.violet}>
          potentiate
        </Tx>
      </An>
    </g>
  );
};

/** helper: standard board entrance + exit inside a chapter */
export const boardIn = (t0: number): AMap => ({
  bg: show(t0, 0.5),
  title: show(t0 + 0.15),
  headA: show(t0 + 0.2, 0.35),
  headT: show(t0 + 0.2, 0.35),
  lines: show(t0 + 0.25, 0.5),
  ...Object.fromEntries(BOARD_ROWS.map((_, i) => ['row' + i, slideIn(t0 + 0.3 + i * 0.06, -24, 0, 0.4)])),
});

// ---------- title cards (hud) ----------
export const TitleCard: React.FC<{ t: number; n: number; title: string; question: string; t0: number; t1: number }> = ({ t, n, title, question, t0, t1 }) => {
  const color = n % 2 ? C.teal : C.amber;
  // wrap long questions onto two lines
  const words = question.split(' ');
  let lines = [question];
  if (question.length > 62) {
    let best = 1, bd = 1e9;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ').length, b = words.slice(i).join(' ').length;
      if (Math.abs(a - b) < bd) {
        bd = Math.abs(a - b);
        best = i;
      }
    }
    lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  }
  return (
    <An t={t} tw={tw(show(t0, 0.35), fade(t1 - 0.45, 0.45))}>
      <rect x={0} y={0} width={W} height={H} fill={C.paper} />
      <An t={t} tw={pop(t0 + 0.1, 0.6)}>
        <circle cx={960} cy={330} r={74} fill="none" stroke={color} strokeWidth={7} />
        <Tx x={960} y={334} size={78} w={800} fill={color}>
          {String(n)}
        </Tx>
      </An>
      <An t={t} tw={slideIn(t0 + 0.25, 0, 30)}>
        <Tx x={960} y={520} size={76} w={800}>
          {title}
        </Tx>
      </An>
      <An t={t} tw={show(t0 + 0.45)}>
        <line x1={860} x2={1060} y1={600} y2={600} stroke={C.greyL} strokeWidth={4} />
      </An>
      <An t={t} tw={slideIn(t0 + 0.6, 0, 20)}>
        {lines.map((l, i) => (
          <Tx key={i} x={960} y={668 + i * 50} size={36} w={500} fill={C.ink2} italic>
            {l}
          </Tx>
        ))}
      </An>
    </An>
  );
};

export const ClinicalFrame: React.FC = () => (
  <g>
    <rect x={24} y={24} width={W - 48} height={H - 48} rx={30} fill="none" stroke={C.red} strokeWidth={5} />
    <Tag x={160} y={70} size={26} fill={C.red} color="#fff">
      Clinical link
    </Tag>
  </g>
);

export const Caption: React.FC<{ x: number; y: number; children: string; size?: number; fill?: string; color?: string; stroke?: string; w?: number }> = ({
  x, y, children, size = 30, fill = '#fff', color, stroke = C.greyL, w,
}) => (
  <Tag x={x} y={y} size={size} fill={fill} stroke={stroke} sw={2} color={color} w={w}>
    {children}
  </Tag>
);

/** full-screen paper overlay */
export const Paper: React.FC<{ op?: number }> = ({ op = 1 }) => <rect x={0} y={0} width={W} height={H} fill={C.paper} opacity={op} />;

/** simple glow helper */
export const Glow: React.FC<{ d: string; color: string; op: number; small?: boolean }> = ({ d, color, op, small }) =>
  op > 0.001 ? <path d={d} fill={color} filter={small ? 'url(#glowS)' : 'url(#glow)'} opacity={op} /> : null;

export { prog, E };
