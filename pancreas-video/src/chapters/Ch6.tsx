// Chapter 6 — The arsenal at work
import React from 'react';
import { An, Card, P, pol, Tag, Tx } from '../lib/prims';
import { Enzyme, TitleCard } from '../lib/components';
import { C } from '../lib/colors';
import { clamp, E, fade, mix, pop, prog, show, slideIn, tw } from '../lib/anim';
import { anchors } from '../lib/timeline';
import { Stage, useChapterT } from '../lib/scene';

const K = anchors(6);
const { A } = K;
const [c0] = K.span;
const B62 = A('proteins first');
const EXO = A('exopeptidases work');
const PART = A('the two groups are partners');
const B63 = A('carbohydrates', 2);
const B64 = A('fats', 2);
const EMUL0 = A('but lipase has');
const B64b = A('two more enzymes');
const B65 = A('finally ribonuclease');
const GLOW_T = A('no other digestive juice');

// ---------- grid ----------
const QUADS = [
  { title: 'Protein', at: 'proteins', x: 120, y: 120, enz: ['trypsin', 'chymotrypsin', 'elastase', 'carboxypeptidase A & B'] },
  { title: 'Carbohydrate', at: 'carbohydrates', x: 980, y: 120, enz: ['pancreatic amylase'] },
  { title: 'Fat', at: 'fats', x: 120, y: 560, enz: ['lipase', 'cholesterol esterase', 'phospholipase A_2_'] },
  { title: 'Nucleic acid', at: 'nucleic acids', x: 980, y: 560, enz: ['ribonuclease', 'deoxyribonuclease'] },
];
const Hexa: React.FC<{ x: number; y: number; r?: number; fill?: string; stroke?: string; flip?: boolean }> = ({ x, y, r = 24, fill = '#F6E2A8', stroke = '#B08B2E', flip }) => (
  <g>
    <polygon points={P([0, 60, 120, 180, 240, 300].map((a) => pol(x, y, r, a + 30)))} fill={fill} stroke={stroke} strokeWidth={3} />
    {flip !== undefined && <circle cx={x} cy={flip ? y + r * 0.55 : y - r * 0.55} r={4} fill={stroke} />}
  </g>
);
const QuadIcon: React.FC<{ k: number; x: number; y: number }> = ({ k, x, y }) => {
  if (k === 0)
    return (
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={x - 75 + i * 30} cy={y + Math.sin(i) * 10} r={14} fill={['#E07A5F', '#81B29A', '#F2CC8F', '#3D85C6', '#E07A5F', '#81B29A'][i]} stroke={C.ink} strokeWidth={2} />
        ))}
      </g>
    );
  if (k === 1)
    return (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <Hexa key={i} x={x - 66 + i * 44} y={y} r={20} />
        ))}
        <Hexa x={x - 22} y={y + 40} r={20} />
      </g>
    );
  if (k === 2)
    return (
      <g>
        <rect x={x - 70} y={y - 40} width={18} height={80} rx={6} fill="#D9B44A" />
        {[-30, 0, 30].map((dy) => (
          <path key={dy} d={`M${x - 52},${y + dy} l20,-8 l20,8 l20,-8 l20,8 l20,-8 l20,8`} fill="none" stroke="#C9A93A" strokeWidth={5} strokeLinecap="round" />
        ))}
      </g>
    );
  return (
    <g>
      <path d={`M${x - 70},${y} q15,-26 30,0 t30,0 t30,0 t30,0 t30,0`} fill="none" stroke={C.violet} strokeWidth={6} />
      <path d={`M${x - 70},${y} q15,26 30,0 t30,0 t30,0 t30,0 t30,0`} fill="none" stroke={C.teal} strokeWidth={6} />
    </g>
  );
};
const Grid: React.FC<{ t: number; glow: number; first: boolean }> = ({ t, glow, first }) => (
  <g>
    {QUADS.map((q, k) => {
      const at = first ? A(q.at) : 0;
      const lit = first ? prog(t, at - 0.1, 0.5) : 1;
      return (
        <An t={t} tw={first ? pop(at - 0.2, 0.6) : []} key={k}>
          <rect x={q.x - 6} y={q.y - 6} width={832} height={412} rx={34} fill={C.amber} opacity={0.35 * glow} filter="url(#glowS)" />
          <Card x={q.x} y={q.y} w={820} h={400} rx={30} stroke={mix(C.greyL, C.amber, lit)} sw={4} />
          <Tx x={q.x + 40} y={q.y + 60} size={40} w={800} anchor="start" fill={C.ink}>
            {q.title}
          </Tx>
          <QuadIcon k={k} x={q.x + 170} y={q.y + 230} />
          {q.enz.map((e, i) => (
            <An t={t} tw={first ? slideIn(at + 0.3 + i * 0.12, 0, -20) : []} key={i}>
              <Tx x={q.x + 360} y={q.y + 140 + i * 58} size={30} w={600} anchor="start" fill={C.amberD}>
                {e}
              </Tx>
            </An>
          ))}
        </An>
      );
    })}
  </g>
);

// ---------- protein chain ----------
const NB = 24;
const LETTERS: Record<number, string> = { 4: 'K', 9: 'R', 14: 'F', 19: 'Y' };
const CUTS = [
  { after: 4, by: 0 },
  { after: 9, by: 0 },
  { after: 14, by: 1 },
  { after: 19, by: 1 },
  { after: 21, by: 2 },
];
const BEAD_COL = (i: number) => (LETTERS[i] ? (i === 4 || i === 9 ? '#3D85C6' : '#9C6AC9') : ['#E07A5F', '#81B29A', '#F2CC8F', '#D9A5B3'][i % 4]);
const pieceOf = (i: number) => CUTS.filter((c) => i > c.after).length;
const PIECE_END = [4, 9, 14, 19, 21, 23];

const ProteinScene: React.FC<{ t: number }> = ({ t }) => {
  const tTry = A('lysine and arginine');
  const tChy = A('phenylalanine and tyrosine');
  const tEla = A('together they break');
  const cutAt = [tTry, tChy, tEla];
  const spread = prog(t, tEla + 0.3, 1.2);
  const tNib = A('one at a time');
  const nibOrder = [5, 4, 3, 2, 1, 0, 3, 1];
  const nibbed = (piece: number, n: number) => {
    // time the n-th nibble of a piece happens
    let count = 0;
    for (let k = 0; k < nibOrder.length; k++) {
      if (nibOrder[k] === piece) {
        if (count === n) return tNib + k * 0.7;
        count++;
      }
    }
    return 1e9;
  };
  const brush = prog(t, A('brush border') - 0.3, 2.0);
  const freeAA = nibOrder.filter((_, k) => t > tNib + k * 0.7 + 0.5).length;
  const glowEnds = Math.sin(clamp((t - A('a new end')) / 2.4) * Math.PI);
  return (
    <An t={t} tw={tw(show(B62 - 0.3, 0.6), fade(B63 - 0.4, 0.5))}>
      <Tx x={960} y={110} size={40} w={800}>
        Protein
      </Tx>
      <An t={t} tw={slideIn(A('endopeptidases cut'), 0, -20)}>
        <Tag x={520} y={200} size={28} fill={C.amberL} color={C.amberD}>
          endopeptidases: cut inside the chain
        </Tag>
      </An>
      <An t={t} tw={slideIn(EXO, 0, -20)}>
        <Tag x={1400} y={200} size={28} fill="#FBE0C0" color={C.amberD}>
          exopeptidases: trim from the C end
        </Tag>
      </An>
      {/* brush border strip */}
      <An t={t} tw={show(A('brush border') - 0.4, 0.6)}>
        <rect x={150} y={930} width={1620} height={60} rx={20} fill="#F2C4B0" stroke="#C98479" strokeWidth={3} />
        {Array.from({ length: 54 }, (_, i) => (
          <line key={i} x1={170 + i * 30} x2={170 + i * 30} y1={930} y2={912} stroke="#C98479" strokeWidth={4} strokeLinecap="round" />
        ))}
        <Tx x={960} y={1030} size={26} w={700} fill={C.pinkD}>
          brush-border enzymes finish the job
        </Tx>
      </An>
      <An t={t} tw={show(A('one at a time') - 0.2)}>
        <Card x={1490} y={710} w={330} h={180} rx={22} />
        <Tx x={1655} y={740} size={22} w={700} fill={C.ink2}>
          {`free amino acids: ${freeAA}`}
        </Tx>
      </An>
      {/* beads */}
      {Array.from({ length: NB }, (_, i) => {
        const pc = pieceOf(i);
        const cutDone = CUTS.filter((c, k) => i > c.after && t > cutAt[c.by] + 0.2 + (k % 2) * 0.35).length;
        let x = 230 + i * 60 + cutDone * 18 + spread * pc * 34;
        let y = 470 + Math.sin(i * 0.9) * 14 + spread * (pc % 2 ? 40 : -20);
        y += brush * (380 - (pc % 2 ? 40 : -20) * 0.5);
        // nibbling: last beads of pieces leave to the pool
        const fromEnd = PIECE_END[pc] - i;
        const tn = fromEnd < 2 ? nibbed(pc, fromEnd) : 1e9;
        const np = prog(t, tn, 0.8, E.out);
        if (np > 0) {
          const k2 = nibOrder.findIndex((v, k) => v === pc && tn === tNib + k * 0.7);
          x = x + (1550 + (k2 % 4) * 70 - x) * np;
          y = y + (790 + Math.floor(k2 / 4) * 52 - y) * np;
        }
        const isEnd = fromEnd === 0 || (np === 0 && fromEnd === 1 && tn < 1e8 && t > nibbed(pc, 0) + 0.8);
        return (
          <g key={i}>
            {isEnd && glowEnds > 0 && np === 0 && <circle cx={x} cy={y} r={34} fill={C.amber} opacity={0.5 * glowEnds} filter="url(#glowS)" />}
            <circle cx={x} cy={y} r={22} fill={BEAD_COL(i)} stroke={C.ink} strokeWidth={2.5} />
            {LETTERS[i] && (
              <Tx x={x} y={y + 1} size={22} w={800} fill="#fff">
                {LETTERS[i]}
              </Tx>
            )}
          </g>
        );
      })}
      <An t={t} tw={tw(show(B62 + 0.5), fade(A('together they break'), 0.5))}>
        <Tx x={190} y={470} size={30} w={800} fill={C.ink2}>
          N
        </Tx>
        <Tx x={1700} y={470} size={30} w={800} fill={C.ink2}>
          C
        </Tx>
      </An>
      {/* scissors flashes at the cuts */}
      {CUTS.map((c, k) => {
        const ct = cutAt[c.by] + (k % 2) * 0.35;
        const p = prog(t, ct - 0.3, 0.9);
        if (p <= 0 || p >= 1) return null;
        const x = 230 + c.after * 60 + 30 + k * 18;
        return (
          <g key={k} opacity={Math.sin(p * Math.PI)} transform={`translate(${x},${400})`}>
            <path d="M-14,-30 L6,10 M14,-30 L-6,10" stroke={C.amberD} strokeWidth={6} strokeLinecap="round" />
            <circle cx={-16} cy={-36} r={9} fill="none" stroke={C.amberD} strokeWidth={5} />
            <circle cx={16} cy={-36} r={9} fill="none" stroke={C.amberD} strokeWidth={5} />
          </g>
        );
      })}
      {/* tags for the endopeptidases */}
      {[
        ['trypsin: after Lys (K), Arg (R)', tTry, 330],
        ['chymotrypsin: after Phe (F), Tyr (Y) — aromatic', tChy, 650 + 20],
        ['elastase', tEla, 1390],
      ].map(([s, at, x], i) => (
        <An t={t} tw={tw(slideIn((at as number) + 0.1, 0, 20), fade(EXO - 0.3, 0.4))} key={i}>
          <Tag x={i === 1 ? 960 : (x as number)} y={i === 1 ? 650 : 590} size={24} fill="#fff" stroke={C.amber} color={C.amberD}>
            {s as string}
          </Tag>
        </An>
      ))}
      <An t={t} tw={tw(slideIn(A('almost no free'), 0, 20), fade(EXO, 0.4))}>
        <Tag x={960} y={760} size={26} fill={C.greyL} color={C.ink}>
          peptides, but almost no free amino acids
        </Tag>
      </An>
      {/* carboxypeptidase clamp + amino acid counter */}
      <An t={t} tw={tw(pop(A('carboxypeptidases'), 0.6), fade(PART + 4, 0.5))}>
        <g transform="translate(1630,600)">
          <path d="M30,-34 C-20,-40 -40,-10 -40,0 C-40,10 -20,40 30,34 L30,18 C0,22 -20,10 -20,0 C-20,-10 0,-22 30,-18 Z" fill={C.amber} stroke={C.amberD} strokeWidth={3} />
        </g>
        <Tag x={1630} y={680} size={22} fill="#fff" stroke={C.amber} color={C.amberD}>
          carboxypeptidase A & B
        </Tag>
      </An>
      <An t={t} tw={tw(slideIn(A('a new end') - 0.2, 0, 20), fade(A('brush border') - 0.6, 0.4))}>
        <Tag x={760} y={760} size={28} fill={C.amber} color="#fff">
          each cut = a new C end (one → six)
        </Tag>
      </An>
      <An t={t} tw={slideIn(A('mostly small peptides'), 0, 20)}>
        <Tag x={760} y={830} size={26} fill="#fff" stroke={C.greyL}>
          products: small peptides + some amino acids
        </Tag>
      </An>
    </An>
  );
};

// ---------- starch ----------
const MAIN = Array.from({ length: 14 }, (_, i) => i);
const SIDE = [
  [6, 1],
  [6, 2],
];
const PIECES = [
  { idx: [0, 1], kind: 'maltose', to: [330, 640] },
  { idx: [2, 3, 4], kind: 'maltotriose', to: [1010, 640] },
  { idx: [5, 6], side: true, kind: 'dextrin', to: [1590, 620] },
  { idx: [7, 8], kind: 'maltose', to: [530, 640] },
  { idx: [9, 10], kind: 'maltose', to: [730, 640] },
  { idx: [11, 12, 13], kind: 'maltotriose', to: [1290, 640] },
];
const StarchScene: React.FC<{ t: number }> = ({ t }) => {
  const tCut = A('alpha one four');
  const tMal = A('maltose');
  const tTri = A('maltotriose');
  const tCel = A('cellulose');
  const tFib = A('plant fiber');
  const bounce = prog(t, tCel + 0.2, 0.7);
  const back = prog(t, tCel + 0.9, 0.8, E.out);
  const out = prog(t, tFib, 1.6, E.in);
  return (
    <An t={t} tw={tw(show(B63 - 0.3, 0.6), fade(B64 - 0.4, 0.5))}>
      <Tx x={960} y={110} size={40} w={800}>
        Carbohydrate
      </Tx>
      <An t={t} tw={slideIn(A('pancreatic amylase'), 0, -20)}>
        <Tag x={560} y={200} size={28} fill={C.amberL} color={C.amberD}>
          {'α-amylase (pancreatic > salivary)'}
        </Tag>
      </An>
      <An t={t} tw={slideIn(tCut, 0, -20)}>
        <Tag x={1360} y={200} size={28} fill="#fff" stroke={C.amber} color={C.amberD}>
          cuts α-1,4 bonds · keeps α-1,6 branches
        </Tag>
      </An>
      {PIECES.map((pc, k) => {
        const moveP = prog(t, (pc.kind === 'maltotriose' ? tTri : tMal) - 0.4 + (pc.kind === 'dextrin' ? 1.4 : 0), 1.0);
        const x0 = 260 + pc.idx[0] * 100, y0 = 380;
        const len = pc.idx.length;
        const tx = pc.to[0] - ((len - 1) * 50) / 2 + (pc.kind === 'dextrin' ? -20 : 0);
        const dx = (tx - x0) * moveP, dy = (pc.to[1] - y0) * moveP;
        const sep = prog(t, tCut + 0.3 + k * 0.12, 0.5) * 14;
        return (
          <g key={k} transform={`translate(${dx + sep * (k - 2.5)},${dy})`}>
            {pc.idx.map((i, j) => {
              const xi = 260 + i * 100 - moveP * 48 * j;
              const xp = 260 + (i - 1) * 100 - moveP * 48 * (j - 1);
              return (
                <g key={i}>
                  {j > 0 && <line x1={xp} x2={xi} y1={y0} y2={y0} stroke="#B08B2E" strokeWidth={5} />}
                  <Hexa x={xi} y={y0} r={moveP > 0.5 ? 24 : 28} />
                </g>
              );
            })}
            {pc.side &&
              SIDE.map(([, n]) => (
                <g key={n}>
                  <line x1={260 + 6 * 100 - moveP * 48} y1={y0 + 26 + (n - 1) * 60} x2={260 + 6 * 100 - moveP * 48 + 20} y2={y0 + 26 + n * 60 - 26} stroke="#8C6A1C" strokeWidth={5} strokeDasharray="6 5" />
                  <Hexa x={260 + 6 * 100 - moveP * 48 + 20 * n} y={y0 + n * 60} r={moveP > 0.5 ? 24 : 28} />
                </g>
              ))}
          </g>
        );
      })}
      {/* links that get cut */}
      {[1, 4, 6, 8, 10].map((after, k) =>
        t < tCut + k * 0.12 + 0.35 ? <line key={'l' + k} x1={260 + after * 100} x2={260 + (after + 1) * 100} y1={380} y2={380} stroke="#B08B2E" strokeWidth={5} /> : null,
      )}
      {/* cut marks */}
      {[1, 4, 6, 8, 10].map((after, k) => {
        const p = prog(t, tCut + k * 0.12, 0.8);
        if (p <= 0 || p >= 1) return null;
        const x = 260 + after * 100 + 50;
        return <path key={k} d={`M${x - 14},330 L${x + 14},430`} stroke={C.amber} strokeWidth={7} strokeLinecap="round" opacity={Math.sin(p * Math.PI)} />;
      })}
      <An t={t} tw={slideIn(tMal + 0.4, 0, 20)}>
        <Tx x={530} y={730} size={30} w={800} fill={C.amberD}>
          maltose
        </Tx>
      </An>
      <An t={t} tw={slideIn(tTri + 0.4, 0, 20)}>
        <Tx x={1150} y={730} size={30} w={800} fill={C.amberD}>
          maltotriose
        </Tx>
      </An>
      <An t={t} tw={slideIn(tTri + 1.6, 0, 20)}>
        <Tx x={1590} y={790} size={28} w={800} fill={C.amberD}>
          α-limit dextrins
        </Tx>
      </An>
      {/* cellulose */}
      <An t={t} tw={show(tCel - 0.3, 0.5)}>
        <g transform={`translate(${out * 1400},0)`}>
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              {i > 0 && <line x1={500 + (i - 1) * 90 + 24} x2={500 + i * 90 - 24} y1={900} y2={900} stroke="#6E8B3D" strokeWidth={5} />}
              <Hexa x={500 + i * 90} y={900} r={26} fill="#DCE8C2" stroke="#6E8B3D" flip={i % 2 === 1} />
            </g>
          ))}
          <Tag x={950} y={985} size={26} fill="#EEF4E0" color="#4E6B22">
            cellulose (β-1,4): not digested
          </Tag>
        </g>
        <g transform={`translate(${200 + 230 * bounce - 180 * back},${830 - 40 * back})`}>
          <Enzyme x={0} y={0} r={36} />
        </g>
        <An t={t} tw={slideIn(tFib, 0, 20)}>
          <Tag x={1700} y={830} size={30} fill="#EEF4E0" color="#4E6B22">
            → fiber
          </Tag>
        </An>
      </An>
    </An>
  );
};

// ---------- fats ----------
const Tail: React.FC<{ x: number; y: number; n?: number; color?: string }> = ({ x, y, n = 7, color = '#C9A93A' }) => (
  <path d={`M${x},${y} ` + Array.from({ length: n }, (_, i) => `l26,${i % 2 ? 12 : -12}`).join(' ')} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
);
const BileSalt: React.FC<{ x: number; y: number; a: number }> = ({ x, y, a }) => (
  <g transform={`translate(${x},${y}) rotate(${a})`}>
    <line x1={0} y1={0} x2={30} y2={0} stroke={C.olive} strokeWidth={5} strokeLinecap="round" />
    <circle cx={0} cy={0} r={8} fill={C.olive} />
  </g>
);
const FatScene: React.FC<{ t: number }> = ({ t }) => {
  const tFFA = A('two free fatty acids');
  const cut = prog(t, tFFA, 1.2, E.out);
  const tEm = A('emulsifying');
  const em = prog(t, tEm, 1.6);
  const tPush = A('push lipase away');
  const tCo = A('colipase');
  const drops: [number, number, number][] = Array.from({ length: 11 }, (_, i) => {
    const a = i * 0.57 * Math.PI;
    const rr = i === 0 ? 0 : 170 + (i % 3) * 80;
    return [760 + Math.cos(a) * rr * em, 560 + Math.sin(a) * rr * 0.75 * em, i === 0 ? 80 : 46];
  });
  // lipase approach to drop 0
  const lipX = (() => {
    let x = 1400;
    x = x + (900 - x) * prog(t, tPush - 1.2, 1.0);
    x = x + (1050 - x) * prog(t, tPush + 0.1, 0.6, E.out);
    x = x + (880 - x) * prog(t, tCo + 1.0, 0.8);
    return x;
  })();
  const coX = 1300 + (850 - 1300) * prog(t, tCo, 1.0);
  const sc1 = prog(t, B64b + 1.2, 1.2), sc2 = prog(t, A('lysolecithin') - 0.6, 1.2);
  return (
    <An t={t} tw={tw(show(B64 - 0.3, 0.6), fade(B65 - 0.4, 0.5))}>
      <Tx x={960} y={110} size={40} w={800}>
        Fat
      </Tx>
      {/* F1: triglyceride → 2-MG + 2 FFA */}
      <An t={t} tw={tw(show(B64 + 0.2, 0.5), fade(EMUL0 - 0.3, 0.5))}>
        <rect x={700} y={380} width={30} height={300} rx={10} fill="#D9B44A" />
        <Tx x={715} y={720} size={24} w={700} fill="#8A6D12">
          glycerol
        </Tx>
        {[0, 1, 2].map((k) => {
          const outer = k !== 1;
          const dx = outer ? cut * 380 : 0, dy = outer ? (k === 0 ? -60 : 60) * cut : 0;
          return (
            <g key={k} transform={`translate(${dx},${dy})`}>
              <Tail x={738} y={420 + k * 110} />
            </g>
          );
        })}
        <An t={t} tw={pop(A('pancreatic lipase') + 0.2, 0.6)}>
          <Enzyme x={560} y={420} r={42} label="lipase" lsize={26} />
        </An>
        <An t={t} tw={slideIn(A('splits each triglyceride'), 0, 20)}>
          <Tag x={960} y={250} size={30} fill="#fff" stroke={C.greyL}>
            triglyceride → 2-monoglyceride + 2 free fatty acids
          </Tag>
        </An>
        <An t={t} tw={slideIn(tFFA + 0.8, 0, 20)}>
          <Tx x={810} y={790} size={28} w={800} fill="#8A6D12">
            2-monoglyceride
          </Tx>
          <Tx x={1340} y={420} size={28} w={800} fill="#8A6D12">
            free fatty acid
          </Tx>
          <Tx x={1340} y={760} size={28} w={800} fill="#8A6D12">
            free fatty acid
          </Tx>
        </An>
      </An>
      {/* F2: emulsification + colipase */}
      <An t={t} tw={tw(show(EMUL0 - 0.2, 0.5), fade(B64b - 0.2, 0.5))}>
        <rect x={160} y={180} width={1600} height={760} rx={40} fill="#EAF5FA" />
        <Tx x={300} y={230} size={24} w={700} fill={C.tealD}>
          water
        </Tx>
        {drops.map(([x, y, r], i) => (i === 0 || em > 0.05 ? <circle key={i} cx={x} cy={y} r={i === 0 ? 80 + 140 * (1 - em) : r * em} fill="#F7E08A" stroke="#C9A93A" strokeWidth={4} /> : null))}
        {em > 0.2 &&
          drops.map(([x, y, r], i) =>
            Array.from({ length: 8 }, (_, j) => {
              const a = (j / 8) * 360 + i * 11;
              const rr = (i === 0 ? 80 : r) + 4;
              return <BileSalt key={`${i}-${j}`} x={x + rr * Math.cos((a * Math.PI) / 180)} y={y + rr * Math.sin((a * Math.PI) / 180)} a={a} />;
            }),
          )}
        <An t={t} tw={slideIn(A('dissolves in water'), 0, 20)}>
          <Tag x={960} y={880} size={26} fill="#fff" stroke={C.greyL}>
            lipase is water-soluble; fat is not
          </Tag>
        </An>
        <An t={t} tw={slideIn(tEm + 0.3, 0, -20)}>
          <Tag x={520} y={300} size={26} fill={C.oliveL} color="#5E5418">
            bile salts: emulsify
          </Tag>
        </An>
        <g transform={`translate(${lipX},${560})`}>
          <Enzyme x={0} y={-40} r={38} />
          <Tx x={0} y={20} size={22} w={800} fill={C.amberD}>
            lipase
          </Tx>
        </g>
        <An t={t} tw={slideIn(tPush + 0.2, 0, 20)}>
          <Tag x={1250} y={420} size={24} fill="#fff" stroke={C.greyL}>
            bile-salt coat pushes lipase off
          </Tag>
        </An>
        <An t={t} tw={pop(tCo - 0.1, 0.5)}>
          <g transform={`translate(${coX},${540})`}>
            <path d="M-14,-22 L14,-22 L14,22 L-14,22 Z" fill={C.amberL} stroke={C.amberD} strokeWidth={4} rx={6} />
            <path d="M-14,-8 L-26,-8 M-14,8 L-26,8" stroke={C.amberD} strokeWidth={4} />
          </g>
          <Tag x={1290} y={480} size={24} fill={C.amberL} color={C.amberD}>
            colipase: anchors lipase
          </Tag>
        </An>
        <An t={t} tw={slideIn(A('only in partnership'), 0, 20)}>
          <Tag x={960} y={800} size={30} fill={C.amber} color="#fff">
            lipase + bile salts + colipase
          </Tag>
        </An>
      </An>
      {/* F3: two vignettes */}
      <An t={t} tw={tw(show(B64b - 0.1, 0.5))}>
        <Card x={140} y={200} w={780} h={700} rx={30} />
        <Tx x={530} y={260} size={30} w={800} fill={C.amberD}>
          cholesterol esterase
        </Tx>
        <Tx x={530} y={300} size={22} w={500} fill={C.ink2}>
          (carboxyl ester hydrolase)
        </Tx>
        {/* sterol rings */}
        <g transform={`translate(${-60 * sc1},0)`}>
          {[0, 1, 2].map((i) => (
            <Hexa key={i} x={360 + i * 46} y={520 + (i % 2) * 26} r={28} fill="#E9E0F2" stroke="#7B5EA7" />
          ))}
          <polygon points={P([0, 72, 144, 216, 288].map((a) => pol(500, 520, 26, a - 90)))} fill="#E9E0F2" stroke="#7B5EA7" strokeWidth={3} />
        </g>
        <g transform={`translate(${120 * sc1},${80 * sc1})`}>
          <Tail x={530} y={520} n={6} />
        </g>
        <An t={t} tw={slideIn(B64b + 2.2, 0, 20)}>
          <Tx x={530} y={760} size={26} w={700}>
            cholesterol ester → cholesterol + FA
          </Tx>
        </An>
        <Card x={1000} y={200} w={780} h={700} rx={30} />
        <An t={t} tw={show(A('phospholipase a two') - 0.3, 0.4)}>
          <Tx x={1390} y={260} size={30} w={800} fill={C.amberD}>
            phospholipase A_2_
          </Tx>
          {/* phospholipid: head + two tails */}
          <circle cx={1200} cy={520} r={34} fill="#D9E6F2" stroke="#3A5FA8" strokeWidth={4} />
          <Tx x={1200} y={522} size={20} w={800} fill="#3A5FA8">
            P
          </Tx>
          <rect x={1236} y={470} width={24} height={110} rx={8} fill="#D9B44A" />
          <Tail x={1266} y={490} n={6} />
          <g transform={`translate(${130 * sc2},${100 * sc2})`}>
            <Tail x={1266} y={560} n={6} />
          </g>
          <Tx x={1300} y={445} size={18} w={700} fill={C.ink2}>
            position 2 →
          </Tx>
        </An>
        <An t={t} tw={slideIn(A('lysolecithin') + 0.1, 0, 20)}>
          <Tx x={1390} y={760} size={26} w={700}>
            phospholipid → lysolecithin + FA
          </Tx>
        </An>
      </An>
    </An>
  );
};

// ---------- nucleic acids ----------
const NucScene: React.FC<{ t: number }> = ({ t }) => {
  const frag = prog(t, A('mononucleotides') - 0.3, 1.4, E.out);
  return (
    <An t={t} tw={tw(show(B65 - 0.3, 0.5), fade(A('four classes of food') - 0.4, 0.5))}>
      <Tx x={960} y={110} size={40} w={800}>
        Nucleic acid
      </Tx>
      <An t={t} tw={slideIn(B65 + 0.4, 0, -20)}>
        <Tag x={960} y={210} size={28} fill={C.amberL} color={C.amberD}>
          ribonuclease · deoxyribonuclease
        </Tag>
      </An>
      {Array.from({ length: 8 }, (_, i) => {
        const x = 520 + i * 125 + (i - 3.5) * 60 * frag, y = 540 + (i % 2 ? 40 : -40) * frag;
        return (
          <g key={i}>
            {i < 7 && frag < 0.3 && <line x1={520 + i * 125 + 30} x2={520 + (i + 1) * 125 - 30} y1={460} y2={460} stroke={C.ink2} strokeWidth={5} opacity={1 - frag * 3} />}
            <g transform={`translate(${x - (520 + i * 125)},${y - 540})`}>
              <circle cx={520 + i * 125} cy={460} r={16} fill="#E3B23C" />
              <polygon points={P([0, 72, 144, 216, 288].map((a) => pol(520 + i * 125, 530, 28, a - 90)))} fill="#F2D8C8" stroke="#B5523F" strokeWidth={3} />
              <rect x={520 + i * 125 - 20} y={570} width={40} height={60} rx={8} fill={[C.violet, C.teal, C.green, C.red][i % 4]} />
            </g>
          </g>
        );
      })}
      <An t={t} tw={slideIn(A('mononucleotides'), 0, 20)}>
        <Tag x={960} y={820} size={32} fill="#fff" stroke={C.greyL}>
          RNA, DNA → mononucleotides
        </Tag>
        <Tx x={960} y={880} size={22} w={600} fill={C.ink2}>
          phosphate · sugar · base
        </Tx>
      </An>
    </An>
  );
};

export const Ch6: React.FC = () => {
  const t = useChapterT(6);
  const glow = Math.sin(clamp((t - GLOW_T) / 3) * Math.PI * 0.5) * (1 - prog(t, K.span[1] - 1.2, 0.8));
  return (
    <Stage>
      {t < B62 + 0.5 && (
        <An t={t} tw={fade(B62 - 0.3, 0.5)}>
          <Grid t={t} glow={0} first />
        </An>
      )}
      {t > B62 - 0.5 && t < B63 + 0.5 && <ProteinScene t={t} />}
      {t > B63 - 0.5 && t < B64 + 0.5 && <StarchScene t={t} />}
      {t > B64 - 0.5 && t < B65 + 0.5 && <FatScene t={t} />}
      {t > B65 - 0.5 && t < A('four classes of food') + 0.5 && <NucScene t={t} />}
      {t > A('four classes of food') - 0.5 && (
        <An t={t} tw={show(A('four classes of food') - 0.3, 0.6)}>
          <Grid t={t} glow={glow} first={false} />
          <An t={t} tw={pop(GLOW_T + 0.2, 0.6)}>
            <Tag x={960} y={540} size={34} fill={C.amber} color="#fff" shadow>
              one secretion, all four classes
            </Tag>
          </An>
        </An>
      )}
      <TitleCard t={t} n={6} title="The arsenal at work" question="Once unlocked, what does each enzyme actually do?" t0={c0} t1={K.firstContent} />
    </Stage>
  );
};
