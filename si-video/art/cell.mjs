// The absorptive enterocyte (literal cell anatomy, schematic scale), drawn in a local frame:
// apical surface at x = 0, basal surface at x = L, lateral membranes at y = 0 and y = Wd.
// Structure after Ross & Pawlina / Junqueira (and the lecture's EM of the brush border): microvilli with
// actin-filament cores rooted in the terminal web, a glycocalyx coat; junctional complex near the apex
// (zonula occludens, zonula adherens, macula adherens/desmosome); apical SER (lipid resynthesis), mitochondria,
// RER, a supranuclear Golgi apparatus, basal oval nucleus with nucleolus and heterochromatin; lateral
// intercellular spaces; basal lamina; lamina propria with a fenestrated capillary.
import { rngOf, smoothClosed, smoothOpen } from "./histo.mjs";

const f1 = (v) => Math.round(v * 10) / 10;

export const CP = {
  cyto: "#EBA497",
  cytoDeep: "#D9877B",
  membrane: "#FFD9CF",
  membraneDark: "#B86A62",
  mv: "#F5B9AB",
  mvCore: "#B2554F",
  glyco: "#FFE9E0",
  web: "#C9746B",
  tj: "#3A1418",
  adh: "#7E2A30",
  nucleus: "#7A4A86",
  nucleusEdge: "#4E2A5C",
  hetero: "#4A2356",
  nucleolus: "#3A1846",
  mito: "#E07E62",
  mitoEdge: "#9C4636",
  cristae: "#FFC8B2",
  ser: "#A98BE0",
  rer: "#8E73C9",
  ribo: "#5A3E8E",
  golgi: "#58B886",
  golgiEdge: "#2E7A55",
  vesicle: "#F2E2A0",
  lyso: "#6B3A4A",
  lp: "#7E3540",
  fiber: "#A04C56",
  endo: "#E2A39C",
  endoNuc: "#5A2A4E",
};

function capsule(cx, cy, len, wid, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const pts = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const x = Math.cos(a) * len, y = Math.sin(a) * wid;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return smoothClosed(pts);
}

function mitochondrion(cx, cy, len, wid, ang, rand) {
  const c = Math.cos(ang), s = Math.sin(ang);
  let cr = "";
  const n = Math.max(3, Math.round(len / 5));
  for (let k = 1; k < n; k++) {
    const u = -len * 0.8 + (k / n) * len * 1.6;
    const side = k % 2 ? 1 : -1;
    const p0 = [u, side * wid * 0.85], p1 = [u + 1.5, -side * wid * 0.15];
    const a = [cx + p0[0] * c - p0[1] * s, cy + p0[0] * s + p0[1] * c];
    const b = [cx + p1[0] * c - p1[1] * s, cy + p1[0] * s + p1[1] * c];
    cr += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`;
  }
  return { body: capsule(cx, cy, len, wid, ang), cristae: cr };
}

/** One enterocyte (local frame). Options: fat = place SER/Golgi for the fat-absorption steps. */
export function cellLocal({ L = 520, Wd = 560, seed = 4, id = "ec", detail = 1, fat = false, nucleus = true, mvLen = 54, apicalOnly = false, noMv = false } = {}) {
  const rand = rngOf(seed);
  const parts = [];
  // cytoplasm
  parts.push(
    `<defs><linearGradient id="${id}-cy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${CP.cyto}"/><stop offset="0.6" stop-color="${CP.cyto}"/><stop offset="1" stop-color="${CP.cytoDeep}"/></linearGradient></defs>`,
  );
  parts.push(`<path d="M0 0 L${L} 0 L${L} ${Wd} L0 ${Wd} Z" fill="url(#${id}-cy)"/>`);
  // free ribosomes / glycogen speckle
  let speck = "";
  for (let k = 0; k < 220 * detail; k++) speck += `M${f1(20 + rand() * (L - 30))} ${f1(8 + rand() * (Wd - 16))}h0.1`;
  parts.push(`<path d="${speck}" stroke="#B9706A" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>`);
  // terminal web: a feltwork of fine filaments just under the apical membrane
  let web = "";
  for (let k = 0; k < 26; k++) {
    const x = 4 + rand() * 18;
    web += `M${f1(x)} ${f1(rand() * Wd)}q${f1((rand() - 0.5) * 6)} ${f1(14 + rand() * 18)} ${f1((rand() - 0.5) * 4)} ${f1(32 + rand() * 20)}`;
  }
  parts.push(`<rect x="0" y="0" width="22" height="${Wd}" fill="${CP.web}" opacity="0.28"/><path d="${web}" stroke="${CP.web}" stroke-width="0.9" fill="none" opacity="0.8"/>`);
  // nucleus (basal), envelope with pores, heterochromatin, nucleolus
  const NUC = { x: L * (fat ? 0.86 : 0.74), y: Wd * 0.56, rx: Math.min(L * (fat ? 0.125 : 0.17), 92), ry: Math.min(Wd * 0.13, 74) };
  if (nucleus && !apicalOnly) {
    const nx = L * (fat ? 0.86 : 0.74), ny = Wd * 0.56, rx = Math.min(L * (fat ? 0.125 : 0.17), 92), ry = Math.min(Wd * 0.13, 74);
    let het = "";
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2 + rand() * 0.3;
      het += capsule(nx + Math.cos(a) * rx * 0.8, ny + Math.sin(a) * ry * 0.78, 7 + rand() * 6, 3, a + Math.PI / 2);
    }
    for (let k = 0; k < 10; k++) het += capsule(nx + (rand() - 0.5) * rx, ny + (rand() - 0.5) * ry, 3 + rand() * 4, 2, rand() * 3);
    let pores = "";
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      pores += `M${f1(nx + Math.cos(a) * (rx + 2.5))} ${f1(ny + Math.sin(a) * (ry + 2.5))}h0.1`;
    }
    parts.push(
      `<ellipse cx="${f1(nx)}" cy="${f1(ny)}" rx="${f1(rx + 3)}" ry="${f1(ry + 3)}" fill="none" stroke="${CP.nucleusEdge}" stroke-width="2"/>` +
        `<ellipse cx="${f1(nx)}" cy="${f1(ny)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${CP.nucleus}"/>` +
        `<path d="${het}" fill="${CP.hetero}" opacity="0.85"/>` +
        `<circle cx="${f1(nx + rx * 0.15)}" cy="${f1(ny - ry * 0.1)}" r="${f1(ry * 0.26)}" fill="${CP.nucleolus}"/>` +
        `<path d="${pores}" stroke="${CP.cyto}" stroke-width="3" stroke-linecap="round"/>`,
    );
  }
  // RER: cisternae studded with ribosomes, wrapping the nucleus (supranuclear and lateral)
  let rer = "", ribo = "";
  if (!apicalOnly) {
    for (let k = 0; k < 4; k++) {
      const R = 1.25 + k * 0.14;
      for (const side of [-1, 1]) {
        const pts = [];
        for (let q = 0; q <= 8; q++) {
          const a = Math.PI + side * (0.35 + (q / 8) * 1.05);
          pts.push([NUC.x + Math.cos(a) * NUC.rx * R, NUC.y + Math.sin(a) * NUC.ry * R]);
        }
        rer += smoothOpen(pts);
        pts.forEach(([x, y], q) => (ribo += `M${f1(x + (q % 2 ? 2.5 : -2.5))} ${f1(y + (q % 2 ? -2 : 2))}h0.1`));
      }
    }
    for (const yy of [Wd * 0.14, Wd * 0.86]) {
      for (let k = 0; k < 4; k++) {
        const y = yy + (k - 1.5) * 8;
        rer += `M${f1(L * 0.5)} ${f1(y)}C${f1(L * 0.58)} ${f1(y - 5)} ${f1(L * 0.66)} ${f1(y + 5)} ${f1(L * 0.76)} ${f1(y)}`;
        for (let q = 0; q < 9; q++) ribo += `M${f1(L * 0.5 + q * L * 0.03)} ${f1(y + (q % 2 ? 3 : -3))}h0.1`;
      }
    }
  }
  parts.push(`<path d="${rer}" fill="none" stroke="${CP.rer}" stroke-width="3" opacity="0.75"/><path d="${ribo}" stroke="${CP.ribo}" stroke-width="2.2" stroke-linecap="round"/>`);
  // SER: smooth anastomosing tubules in the apical cytoplasm (site of triglyceride resynthesis)
  let ser = "";
  const serX = fat ? 85 : 70;
  const nodes = [];
  for (let k = 0; k < Math.round(Wd / 34); k++) nodes.push([serX + (rand() - 0.5) * 44, 18 + (k + rand() * 0.6) * 34]);
  for (let k = 0; k < nodes.length - 1; k++) {
    const [ax, ay] = nodes[k], [bx, by] = nodes[k + 1];
    ser += `M${f1(ax)} ${f1(ay)}Q${f1((ax + bx) / 2 + (rand() - 0.5) * 20)} ${f1((ay + by) / 2)} ${f1(bx)} ${f1(by)}`;
    if (rand() < 0.6) ser += `M${f1(ax)} ${f1(ay)}q${f1(14 + rand() * 16)} ${f1(6 + rand() * 8)} ${f1(26 + rand() * 18)} ${f1((rand() - 0.5) * 20)}`;
  }
  parts.push(`<path d="${ser}" fill="none" stroke="${CP.ser}" stroke-width="5" stroke-linecap="round" opacity="0.75"/><path d="${ser}" fill="none" stroke="#E3D6FA" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/>`);
  // Golgi: supranuclear stack of curved cisternae with budding vesicles
  const gx = fat ? 214 : NUC.x - NUC.rx - 70, gy = NUC.y - 6;
  let gol = "", ves = "";
  for (let k = 0; k < 5; k++) {
    const r = 40 + k * 9;
    gol += `M${f1(gx + k * 7 - 6)} ${f1(gy - r)}Q${f1(gx - 24 + k * 7)} ${f1(gy)} ${f1(gx + k * 7 - 6)} ${f1(gy + r)}`;
  }
  for (let k = 0; k < 9; k++) {
    const a = (rand() - 0.5) * 2.4;
    ves += `<circle cx="${f1(gx + 30 + rand() * 30)}" cy="${f1(gy + Math.sin(a) * 60)}" r="${f1(3 + rand() * 3)}" fill="${CP.vesicle}" stroke="#B89A4A" stroke-width="0.8"/>`;
  }
  if (!apicalOnly) parts.push(`<path d="${gol}" fill="none" stroke="${CP.golgiEdge}" stroke-width="7" stroke-linecap="round"/><path d="${gol}" fill="none" stroke="${CP.golgi}" stroke-width="4.5" stroke-linecap="round"/>${ves}`);
  // mitochondria: numerous, elongated parallel to the apical-basal axis, densest apically and basally
  let mb = "", mc = "";
  const spots = [];
  const avoid = (x, y) =>
    (!apicalOnly && ((x - NUC.x) / (NUC.rx + 22)) ** 2 + ((y - NUC.y) / (NUC.ry + 22)) ** 2 < 1) || (!apicalOnly && Math.abs(x - gx) < 46 && Math.abs(y - gy) < 90);
  const target = Math.round((apicalOnly ? 6 : 30) * detail * Math.max(0.5, Wd / 560));
  for (let tries = 0; tries < 900 && spots.length < target; tries++) {
    const band = rand();
    const x = apicalOnly ? 34 + rand() * (L * 0.5) : band < 0.4 ? 34 + rand() * 90 : band < 0.75 ? L * 0.78 + rand() * L * 0.18 : 120 + rand() * (L * 0.6);
    const y = 18 + rand() * (Wd - 36);
    if (avoid(x, y) || spots.some(([a, b]) => Math.hypot((a - x) * 0.6, b - y) < 22)) continue;
    spots.push([x, y]);
    const m = mitochondrion(x, y, 15 + rand() * 9, 6.2, (rand() - 0.5) * 0.5, rand);
    mb += m.body;
    mc += m.cristae;
  }
  parts.push(`<path d="${mb}" fill="${CP.mito}" stroke="${CP.mitoEdge}" stroke-width="1.2"/><path d="${mc}" stroke="${CP.cristae}" stroke-width="1.3" stroke-linecap="round" fill="none"/>`);
  // lysosomes and pinocytic vesicles
  let ly = "";
  for (let k = 0; k < 6; k++) ly += `<circle cx="${f1(L * 0.3 + rand() * L * 0.3)}" cy="${f1(30 + rand() * (Wd - 60))}" r="${f1(4 + rand() * 3)}" fill="${CP.lyso}" opacity="0.8"/>`;
  for (let k = 0; k < 7; k++) ly += `<circle cx="${f1(26 + rand() * 20)}" cy="${f1(20 + rand() * (Wd - 40))}" r="3" fill="none" stroke="${CP.membraneDark}" stroke-width="1"/>`;
  parts.push(ly);
  // microvilli: finger-like projections with actin cores rooted in the terminal web, coated by glycocalyx
  let mv = "", core = "", fuzz = "";
  const n = Math.round(Wd / 12.5);
  for (let k = 0; k < n; k++) {
    const y = (k + 0.5) * (Wd / n);
    const len = mvLen * (0.92 + rand() * 0.16);
    mv += `M${f1(2)} ${f1(y - 4.2)}L${f1(-len + 4.2)} ${f1(y - 4.2)}A4.2 4.2 0 0 0 ${f1(-len + 4.2)} ${f1(y + 4.2)}L2 ${f1(y + 4.2)}Z`;
    core += `M${f1(-len + 6)} ${f1(y)}L${f1(16)} ${f1(y)}`;
    for (let q = 0; q < 3; q++) fuzz += `M${f1(-len + 1)} ${f1(y - 3 + q * 3)}q${f1(-4)} ${f1((rand() - 0.5) * 4)} ${f1(-7)} ${f1((rand() - 0.5) * 3)}`;
  }
  if (!noMv) parts.push(
    `<rect x="${-mvLen - 14}" y="0" width="${mvLen + 14}" height="${Wd}" fill="${CP.glyco}" opacity="0.07"/>` +
      `<path d="${mv}" fill="${CP.mv}" stroke="${CP.membraneDark}" stroke-width="0.8"/>` +
      `<path d="${core}" stroke="${CP.mvCore}" stroke-width="1.6" opacity="0.85"/>` +
      `<path d="${fuzz}" fill="none" stroke="${CP.glyco}" stroke-width="0.9" opacity="0.65"/>`,
  );
  // membranes
  parts.push(`<path d="M0 0L0 ${Wd}" stroke="${CP.membrane}" stroke-width="2"/><path d="M${L} 0L${L} ${Wd}" stroke="${CP.membrane}" stroke-width="2.4"/>`);
  return parts.join("");
}

/** Junctional complex on a lateral membrane at y = yy (local frame), near the apex. */
export function junctions(yy) {
  let s = "";
  // zonula occludens: kissing points sealing the paracellular path
  for (let k = 0; k < 4; k++) s += `<circle cx="${4 + k * 5}" cy="${yy - 2}" r="1.7" fill="${CP.tj}"/><circle cx="${4 + k * 5}" cy="${yy + 2}" r="1.7" fill="${CP.tj}"/>`;
  // zonula adherens: dense plaques with actin
  s += `<rect x="28" y="${yy - 6}" width="16" height="3.4" fill="${CP.adh}"/><rect x="28" y="${yy + 2.6}" width="16" height="3.4" fill="${CP.adh}"/>`;
  // desmosome: plaques with intermediate filaments fanning into the cytoplasm
  s += `<rect x="70" y="${yy - 7}" width="12" height="4" fill="${CP.adh}"/><rect x="70" y="${yy + 3}" width="12" height="4" fill="${CP.adh}"/>`;
  s += `<path d="M76 ${yy - 7}q-6 -12 2 -22M76 ${yy - 7}q8 -10 4 -22M76 ${yy + 7}q-6 12 2 22M76 ${yy + 7}q8 10 4 22" fill="none" stroke="${CP.adh}" stroke-width="0.9" opacity="0.7"/>`;
  return s;
}

/** Full horizontal stage for the transport scenes: neighbours, the cell, basal lamina, lamina propria, fenestrated capillary. */
export function enterocyteStage({ AP = 700, BL = 1220, CAP = 1520, CY0 = 300, CY1 = 860, cap = "blood", id = "es" } = {}) {
  const L = BL - AP, Wd = CY1 - CY0;
  const rand = rngOf(31);
  const neighbour = (dy, sid) =>
    `<g transform="translate(${AP} ${CY0 + dy})">${cellLocal({ L, Wd, seed: sid, id: `${id}-n${sid}`, detail: 0.7 })}</g>`;
  // lamina propria between basal lamina and capillary
  let fib = "";
  for (let k = 0; k < 60; k++) {
    const x = BL + 16 + rand() * (CAP - 70 - BL - 16), y = CY0 - 120 + rand() * (Wd + 240);
    fib += `M${f1(x)} ${f1(y)}q${f1(6 + rand() * 6)} ${f1((rand() - 0.5) * 10)} ${f1(14 + rand() * 8)} ${f1((rand() - 0.5) * 8)}`;
  }
  let fibro = "";
  for (let k = 0; k < 9; k++) fibro += capsule(BL + 30 + rand() * (CAP - 110 - BL), CY0 - 80 + rand() * (Wd + 160), 9, 2.2, rand() * Math.PI);
  const capC = cap === "blood" ? { wall: "#E2A39C", lumen: "#5A1E2A", edge: "#B5574A" } : { wall: "#A8DDB8", lumen: "#1E4A2E", edge: "#3E9C5A" };
  // capillary: a vertical vessel with a thin fenestrated endothelium (gaps on the epithelial side), endothelial nuclei bulging
  const cx = CAP, r = 60, y0 = CY0 - 140, y1 = CY1 + 140;
  let fen = "";
  for (let y = y0 + 12; y < y1 - 12; y += 22) fen += `M${cx - r - 2} ${f1(y)}l0 6`;
  let endoN = "";
  for (let y = y0 + 60; y < y1; y += 170) endoN += capsule(cx - r + 4, y, 14, 4.2, Math.PI / 2) + capsule(cx + r - 4, y + 85, 14, 4.2, Math.PI / 2);
  const capillary =
    `<rect x="${cx - r - 6}" y="${y0}" width="${2 * r + 12}" height="${y1 - y0}" fill="${capC.edge}"/>` +
    `<rect x="${cx - r}" y="${y0}" width="${2 * r}" height="${y1 - y0}" fill="${capC.wall}"/>` +
    `<rect x="${cx - r + 6}" y="${y0}" width="${2 * r - 12}" height="${y1 - y0}" fill="${capC.lumen}" opacity="0.92"/>` +
    `<path d="${fen}" stroke="${capC.lumen}" stroke-width="3"/>` +
    `<path d="${endoN}" fill="${CP.endoNuc}"/>` +
    // pericyte wrapped on the far side
    `<path d="M${cx + r + 6} ${CY0 + 120}q18 40 0 90" fill="none" stroke="#9C5A62" stroke-width="7" stroke-linecap="round"/>`;
  return (
    `<defs><linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="0.3" stop-color="#fff"/><stop offset="0.7" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>` +
    `<mask id="${id}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect x="${AP - 120}" y="${CY0 - 150}" width="${CAP - AP + 220}" height="${Wd + 300}" fill="url(#${id}-fade)"/></mask></defs>` +
    `<g mask="url(#${id}-m)">` +
    `<rect x="${BL + 4}" y="${CY0 - 210}" width="${CAP - BL + 100}" height="${Wd + 420}" fill="${CP.lp}"/>` +
    `<path d="${fib}" fill="none" stroke="${CP.fiber}" stroke-width="1.6" opacity="0.8"/><path d="${fibro}" fill="${CP.endoNuc}" opacity="0.8"/>` +
    capillary +
    neighbour(-Wd - 6, 7) +
    neighbour(Wd + 6, 9) +
    `<rect x="${AP}" y="${CY0 - 6}" width="${L}" height="6" fill="#3A1418" opacity="0.55"/><rect x="${AP}" y="${CY1}" width="${L}" height="6" fill="#3A1418" opacity="0.55"/>` +
    `</g>` +
    `<g transform="translate(${AP} ${CY0})">${cellLocal({ L, Wd, seed: 4, id: `${id}-c` })}${junctions(0)}${junctions(Wd)}</g>` +
    // basal lamina
    `<path d="M${BL + 7} ${CY0 - 200}L${BL + 7} ${CY1 + 200}" stroke="#F4D7CD" stroke-width="2" opacity="0.8" mask="url(#${id}-m)"/>`
  );
}

/** Vertical cell (lumen at the top): local frame rotated so apical faces up. */
export function enterocyteVertical({ x0, x1, top, bottom, id = "ev", fat = false, seed = 4, detail = 1, mvLen = 44, noMv = false }) {
  const L = bottom - top, Wd = x1 - x0;
  return `<g transform="translate(${x1} ${top}) rotate(90)">${cellLocal({ L, Wd, seed, id, fat, detail, mvLen, noMv })}${junctions(0)}${junctions(Wd)}</g>`;
}

/** Microvilli alone on a horizontal apical surface at y (lumen up), for animating their growth. */
export function microvilliRow({ x0, x1, y, mvLen = 60, seed = 3 }) {
  const rand = rngOf(seed);
  let mv = "", core = "", fuzz = "";
  const n = Math.round((x1 - x0) / 12.5);
  for (let k = 0; k < n; k++) {
    const x = x0 + (k + 0.5) * ((x1 - x0) / n);
    const len = mvLen * (0.92 + rand() * 0.16);
    mv += `M${f1(x - 4.2)} ${f1(y + 2)}L${f1(x - 4.2)} ${f1(y - len + 4.2)}A4.2 4.2 0 0 1 ${f1(x + 4.2)} ${f1(y - len + 4.2)}L${f1(x + 4.2)} ${f1(y + 2)}Z`;
    core += `M${f1(x)} ${f1(y - len + 6)}L${f1(x)} ${f1(y + 14)}`;
    for (let q = 0; q < 3; q++) fuzz += `M${f1(x - 3 + q * 3)} ${f1(y - len - 1)}q${f1((rand() - 0.5) * 4)} -4 ${f1((rand() - 0.5) * 3)} -7`;
  }
  return `<path d="${mv}" fill="${CP.mv}" stroke="${CP.membraneDark}" stroke-width="0.8"/><path d="${core}" stroke="${CP.mvCore}" stroke-width="1.6" opacity="0.85"/><path d="${fuzz}" fill="none" stroke="${CP.glyco}" stroke-width="0.9" opacity="0.65"/>`;
}

/** A row of cell apices (lumen up): the brush border strip used for the enzyme and micelle scenes. */
export function brushStrip({ x0 = 192, x1 = 1728, y = 690, depth = 140, cellW = 110, id = "bs", mvLen = 70 }) {
  let s = "";
  let k = 0;
  for (let x = x0 - 20; x < x1 + 20; x += cellW, k++) {
    s += `<g transform="translate(${x + cellW} ${y}) rotate(90)">${cellLocal({ L: depth + 120, Wd: cellW, seed: 40 + k, id: `${id}${k}`, detail: 1, apicalOnly: true, mvLen })}${junctions(0)}</g>`;
  }
  return (
    `<defs><linearGradient id="${id}-fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>` +
    `<mask id="${id}-fm" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect x="0" y="${y - mvLen - 20}" width="1920" height="${depth + mvLen + 40}" fill="url(#${id}-fg)"/></mask>` +
    `<clipPath id="${id}-cl"><rect x="${x0 - 30}" y="0" width="${x1 - x0 + 60}" height="1080"/></clipPath></defs>` +
    `<g mask="url(#${id}-fm)" clip-path="url(#${id}-cl)">${s}</g>`
  );
}

export function rbcSvg(x, y, ang = 0, s = 1) {
  // biconcave disc seen obliquely: pale centre
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)}) scale(${s})"><ellipse rx="22" ry="12" fill="#D9363F"/><ellipse rx="12" ry="5.5" fill="#F06A6A" opacity="0.8"/><ellipse rx="22" ry="12" fill="none" stroke="#8E1E28" stroke-width="1.2"/></g>`;
}

/* previews */
export function previewStage() {
  return enterocyteStage({});
}
export function previewStrip() {
  return brushStrip({});
}
export function previewVertical() {
  return enterocyteVertical({ x0: 940, x1: 1660, top: 420, bottom: 790, fat: true });
}
