import React from 'react';
import { getLength, getPointAtLength } from '@remotion/paths';
import { resolve, Tw } from './anim';
import { C } from './colors';
import WIDTHS from '../data/interWidths.json';

// ---------------------------------------------------------------------------
// <An>: an animated SVG group. Opacity/translate/scale/rotate come from tweens.
// Scale and rotate pivot around the group's own bounding-box centre
// (CSS transform-box: fill-box), like the original engine; pass pv to override.
// ---------------------------------------------------------------------------
type AnProps = {
  t: number;
  tw?: Tw[];
  base?: Record<string, number>;
  pv?: [number, number];
  children?: React.ReactNode;
  keep?: boolean; // keep mounted when invisible
} & Omit<React.SVGProps<SVGGElement>, 'transform'>;

export const An: React.FC<AnProps> = ({ t, tw, base, pv, children, keep, style, ...rest }) => {
  const s = resolve(t, tw, base);
  if (s.o <= 0.001 && !keep) return null;
  const sc = s.s !== 1 || s.sx !== 1 || s.sy !== 1 || s.r !== 0;
  const o = Math.max(0, Math.min(1, s.o));
  if (!sc) {
    return (
      <g opacity={o < 1 ? o : undefined} transform={s.x || s.y ? `translate(${s.x},${s.y})` : undefined} style={style} {...rest}>
        {children}
      </g>
    );
  }
  if (pv) {
    return (
      <g
        opacity={o < 1 ? o : undefined}
        transform={`translate(${s.x},${s.y}) translate(${pv[0]},${pv[1]}) rotate(${s.r}) scale(${s.s * s.sx},${s.s * s.sy}) translate(${-pv[0]},${-pv[1]})`}
        style={style}
        {...rest}
      >
        {children}
      </g>
    );
  }
  return (
    <g
      opacity={o < 1 ? o : undefined}
      style={{
        transformBox: 'fill-box',
        transformOrigin: 'center',
        transform: `translate(${s.x}px,${s.y}px) rotate(${s.r}deg) scale(${s.s * s.sx},${s.s * s.sy})`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Text with light markup: _x_ subscript, ^x^ superscript, e.g. 'HCO_3_^−^'
// ---------------------------------------------------------------------------
const split = (str: string) => str.split(/(_[^_]+_|\^[^^]+\^)/).filter(Boolean);

const WT = WIDTHS as unknown as Record<string, Record<string, number>>;
const pickW = (w: number) => (w <= 400 ? '400' : w <= 500 ? '500' : w <= 600 ? '600' : w <= 700 ? '700' : '800');
/** width of a (marked-up) string in Inter, from the font's advance widths */
export function textWidth(str: string, size: number, weight = 500): number {
  const tab = WT[pickW(weight)];
  let wsum = 0;
  for (const p of split(str)) {
    const sub = (p[0] === '_' || p[0] === '^') && p.length > 2;
    const txt = sub ? p.slice(1, -1) : p;
    let w = 0;
    for (const ch of txt) w += tab[ch] ?? 0.6;
    wsum += w * size * (sub ? 0.68 : 1);
  }
  return wsum;
}

export type TxOpts = {
  size?: number;
  w?: number;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  italic?: boolean;
  base?: string;
  ls?: number;
  op?: number;
};
export const Tx: React.FC<{ x: number; y: number; children: string } & TxOpts> = ({
  x, y, children, size = 30, w = 500, fill = C.ink, anchor = 'middle', italic, base = 'central', ls, op,
}) => (
  <text
    x={x}
    y={y}
    fontFamily="Inter"
    fontSize={size}
    fontWeight={w}
    fill={fill}
    textAnchor={anchor}
    dominantBaseline={base as 'central'}
    letterSpacing={ls}
    opacity={op}
    fontStyle={italic ? 'italic' : undefined}
  >
    {split(children).map((p, i) => {
      if (p[0] === '_' && p.length > 2)
        return (
          <tspan key={i} baselineShift="-22%" fontSize="68%">
            {p.slice(1, -1)}
          </tspan>
        );
      if (p[0] === '^' && p.length > 2)
        return (
          <tspan key={i} baselineShift="38%" fontSize="68%">
            {p.slice(1, -1)}
          </tspan>
        );
      return <tspan key={i}>{p}</tspan>;
    })}
  </text>
);

/** multi-line text */
export const TxL: React.FC<{ x: number; y: number; lines: string[]; lh?: number } & TxOpts> = ({ x, y, lines, lh, ...o }) => {
  const L = lh || (o.size || 30) * 1.3;
  return (
    <g>
      {lines.map((l, i) => (
        <Tx key={i} x={x} y={y + i * L} {...o}>
          {l}
        </Tx>
      ))}
    </g>
  );
};

/** rounded pill label centred at (x, y) */
export type TagOpts = { size?: number; w?: number; color?: string; fill?: string; stroke?: string; sw?: number; padX?: number; rx?: number; shadow?: boolean };
export const tagSize = (str: string, o: TagOpts = {}) => {
  const size = o.size || 28;
  return { w: textWidth(str, size, o.w || 600) + (o.padX ?? size * 0.9) * 2, h: size * 1.75 };
};
export const Tag: React.FC<{ x: number; y: number; children: string } & TagOpts> = ({ x, y, children, ...o }) => {
  const size = o.size || 28;
  const { w, h } = tagSize(children, o);
  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={o.rx === undefined ? h / 2 : o.rx}
        fill={o.fill || '#fff'}
        stroke={o.stroke || 'none'}
        strokeWidth={o.sw || 2.5}
        filter={o.shadow ? 'url(#soft)' : undefined}
      />
      <Tx x={0} y={0} size={size} w={o.w || 600} fill={o.color || C.ink}>
        {children}
      </Tx>
    </g>
  );
};

/** label with a leader line from (ax, ay) to the pill at (x, y) */
export const Callout: React.FC<{ ax: number; ay: number; x: number; y: number; children: string; lc?: string; p?: number } & TagOpts> = ({
  ax, ay, x, y, children, lc = C.ink2, p = 1, ...o
}) => (
  <g>
    <path d={`M${ax},${ay} L${ax + (x - ax) * p},${ay + (y - ay) * p}`} stroke={lc} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    <circle cx={ax} cy={ay} r={5} fill={lc} />
    <Tag x={x} y={y} size={26} fill="#fff" stroke={C.greyL} sw={2} {...o}>
      {children}
    </Tag>
  </g>
);

// ---------------------------------------------------------------------------
// paths
// ---------------------------------------------------------------------------
const lenCache = new Map<string, number>();
export const plen = (d: string) => {
  let l = lenCache.get(d);
  if (l === undefined) {
    l = getLength(d);
    lenCache.set(d, l);
  }
  return l;
};
/** point at fraction p (0..1) along path d */
export const ptAt = (d: string, p: number) => {
  const L = plen(d);
  const q = getPointAtLength(d, Math.max(0, Math.min(1, p)) * L);
  return [q ? q.x : 0, q ? q.y : 0] as [number, number];
};

type PathProps = Omit<React.SVGProps<SVGPathElement>, 'd'> & { d: string };
/** stroke drawn on to fraction p */
export const Draw: React.FC<PathProps & { p: number }> = ({ d, p, ...rest }) => {
  if (p <= 0) return null;
  const L = plen(d);
  return <path d={d} fill="none" strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - Math.min(1, p))} {...rest} />;
};

const colorName = (c: string) => {
  for (const k in C) if ((C as Record<string, string>)[k] === c) return k;
  return 'ink';
};
/** arrow with marker head; color is a palette name or palette hex */
export const Arrow: React.FC<{ d: string; color?: string; sw?: number; dash?: string; op?: number; p?: number; head?: boolean }> = ({
  d, color = 'ink', sw = 5, dash, op, p = 1, head = true,
}) => {
  const name = (C as Record<string, string>)[color] ? color : colorName(color);
  const stroke = (C as Record<string, string>)[name];
  if (p <= 0) return null;
  const L = plen(d);
  const common = {
    d,
    fill: 'none',
    stroke,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    opacity: op,
  };
  if (p >= 1) return <path {...common} strokeDasharray={dash} markerEnd={head ? `url(#ar-${name})` : undefined} />;
  return <path {...common} strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - p)} markerEnd={head && p > 0.92 ? `url(#ar-${name})` : undefined} />;
};

export const Card: React.FC<{ x: number; y: number; w: number; h: number; rx?: number; fill?: string; stroke?: string; sw?: number; shadow?: boolean }> = ({
  x, y, w, h, rx = 28, fill = '#fff', stroke = 'none', sw = 3, shadow = true,
}) => <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} strokeWidth={sw} filter={shadow ? 'url(#soft)' : undefined} />;

/** shared <defs>: arrow heads per colour, soft shadow, glow */
export const Defs: React.FC = () => (
  <defs>
    {Object.entries(C).map(([k, c]) => (
      <marker key={k} id={`ar-${k}`} viewBox="0 0 10 10" refX={7} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill={c} />
      </marker>
    ))}
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx={0} dy={6} stdDeviation={8} floodColor="#5a4a30" floodOpacity={0.16} />
    </filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={10} />
    </filter>
    <filter id="glowS" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={5} />
    </filter>
  </defs>
);

export const pol = (cx: number, cy: number, r: number, a: number): [number, number] => [
  cx + r * Math.cos((a * Math.PI) / 180),
  cy + r * Math.sin((a * Math.PI) / 180),
];
export const P = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ');
