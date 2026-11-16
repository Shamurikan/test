// Anterior view of the upper GI tract, built with the Anima kit (plan-view camera: world x,y = screen px, z = depth).
// Literal anatomy: stomach (fundus, body, antrum, pyloric sphincter, curvature vessels), duodenal C-loop around the
// pancreatic head (retroperitoneal, behind the transverse colon), jejunum (upper left of the abdomen, screen right)
// and ileum (lower right, screen left) as depth-sorted shaded tubes, ileocecal junction, cecum with appendix,
// ascending / transverse / descending / sigmoid colon with haustra, rectum.
// Orientation follows the standard anterior view: the patient's right is on screen left.
import { iso, depthOf, pathOf } from "./anima/iso-kit.mjs";
import { tubePieces, ringsSvg } from "./anima/tube.mjs";

export const P = { origin: [0, 0], scale: 1 / Math.sqrt(1.6), azimuth: 90, elevation: 90 };

// Catmull-Rom through 3D control points
export function smooth3(ctrl, perSeg = 14) {
  const out = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1, 2].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}

const f1 = (v) => Math.round(v * 10) / 10;

/** Colour a kit tube piece (the kit's own tubeSvg uses theme classes; here we paint the film's tissue palette). */
export function tubeSvgColored(piece, pal) {
  const rings = piece.rings?.length ? ringsSvg(piece.rings, "lo").replaceAll('class="tb-ring" data-tone="lo"', `fill="none" stroke="${pal.ring ?? pal.edge}" stroke-width="${pal.ringW ?? 1.2}" stroke-linecap="round"`) : "";
  return (
    `<path d="${piece.body}" fill="${pal.body}"/>` +
    (piece.wide ? `<path d="${piece.shade}" fill="${pal.shade}"/><path d="${piece.shine}" fill="${pal.shine}" opacity="${pal.shineO ?? 0.75}"/>` : "") +
    rings +
    `<path d="${piece.edges}" fill="none" stroke="${pal.edge}" stroke-width="${pal.edgeW ?? 1.6}" stroke-linejoin="round" stroke-linecap="round"/>`
  );
}

let CLIP_N = 0;
/** Smooth, glossy shading for a kit tube piece: the kit's silhouette, painted with layered strokes along the
 *  centreline (light from the upper left), clipped to the silhouette. Optional haustral clefts. */
export function tubeSvgSmooth(piece, pal, { clefts = null } = {}) {
  // unclipped, butt-capped layers: every layer stays inside the silhouette (offset + half-width < r) and the kit's
  // 0.5-unit lead overlaps neighbouring pieces, so joints show no seams
  const r = piece.radii.reduce((a, b) => a + b, 0) / piece.radii.length;
  const c = pathOf(piece.points.map((p) => iso(p, P)));
  const layer = (w, color, dx, dy, o = 1) =>
    `<path d="${c}" fill="none" stroke="${color}" stroke-width="${f1(w)}" stroke-linecap="butt" stroke-linejoin="round" transform="translate(${f1(dx)} ${f1(dy)})"${o < 1 ? ` opacity="${o}"` : ""}/>`;
  return (
    `<path d="${piece.body}" fill="${pal.shade}"/>` +
    layer(r * 1.62, pal.body, -0.1 * r, -0.13 * r) +
    layer(r * 1.1, pal.light1 ?? pal.shine, -0.2 * r, -0.26 * r, 0.85) +
    layer(r * 0.6, pal.light2 ?? pal.shine, -0.27 * r, -0.35 * r, 0.75) +
    layer(r * 0.2, pal.spec ?? "#FFF1EC", -0.32 * r, -0.41 * r, 0.55) +
    (clefts ?? "") +
    `<path d="${piece.edges}" fill="none" stroke="${pal.edge}" stroke-width="${pal.edgeW ?? 1.6}" stroke-linejoin="round" stroke-linecap="round"/>`
  );
}

export const PAL = {
  si: { drop: true, body: "#DE8676", shade: "#9E4646", light1: "#EFA595", light2: "#F8C3B6", spec: "#FFEDE7", edge: "#6E2429", edgeW: 1.6 },
  duo: { drop: true, body: "#D47C6E", shade: "#934040", light1: "#E89A8B", light2: "#F3B8AA", spec: "#FFE8E1", edge: "#6E2429", edgeW: 1.6 },
  colon: { drop: true, body: "#CF8E74", shade: "#8A4A3E", light1: "#E0A88C", light2: "#EDC3A8", spec: "#FBE5D6", edge: "#5E2426", edgeW: 1.8 },
  appendix: { body: "#C98670", shade: "#8A4A3E", light1: "#DDA28A", light2: "#ECBFA6", spec: "#FBE5D6", edge: "#5E2426", edgeW: 1.3 },
  esophagus: { body: "#C2635C", shade: "#7E3236", light1: "#D88378", light2: "#E8A296", spec: "#F9D5CD", edge: "#5E1F25", edgeW: 1.4 },
  artery: { body: "#E5484D", shade: "#A32A35", shine: "#FF8A8A", edge: "#7A1E28", edgeW: 0.8 },
  vein: { body: "#5B7BE0", shade: "#3A55A8", shine: "#9DB2F2", edge: "#26386E", edgeW: 0.8 },
};

/* ───────────── geometry ───────────── */

// small intestine: pylorus → duodenal C → duodenojejunal flexure → jejunum (screen right/up) → ileum (screen left/low) → ileocecal valve
const SI_CTRL = [
  [1262, 402, 2], // pylorus
  [1212, 398, 1],
  [1174, 422, 0], // superior flexure
  [1160, 474, 0], // D2 descending, around the pancreatic head
  [1168, 532, 0],
  [1204, 568, 0], // inferior flexure, D3
  [1268, 576, 0],
  [1326, 560, 1], // D4 ascending
  [1352, 534, 4], // duodenojejunal flexure (behind the transverse colon)
  [1384, 604, 12], // jejunum: upper left quadrant of the patient (screen upper right)
  [1396, 690, 18],
  [1440, 724, 22],
  [1474, 690, 20],
  [1470, 616, 16],
  [1508, 590, 14],
  [1546, 616, 18],
  [1548, 696, 24],
  [1586, 730, 28],
  [1596, 772, 30],
  [1500, 772, 34],
  [1420, 778, 32],
  [1352, 748, 30],
  [1318, 674, 26], // ileum: lower right quadrant of the patient (screen lower left)
  [1252, 640, 22],
  [1186, 654, 20],
  [1166, 716, 24],
  [1238, 744, 28],
  [1300, 800, 34],
  [1246, 860, 30],
  [1160, 846, 26],
  [1112, 782, 22],
  [1132, 712, 18],
  [1096, 652, 16],
  [1054, 690, 14],
  [1062, 784, 16],
  [1104, 842, 20],
  [1092, 884, 18], // terminal ileum
  [1046, 878, 16], // enters the cecum from the medial side (ileocecal valve)
];
const SI_PTS = smooth3(SI_CTRL, 12);
const siRadius = (f) => (f < 0.13 ? 16 : 21 - 5 * Math.min(1, (f - 0.13) / 0.87));

// colon: cecum → ascending → hepatic flexure → transverse (in front of duodenum) → splenic flexure → descending → sigmoid → rectum
const COLON_CTRL = [
  [1004, 872, 6], // cecum (pouch drawn separately)
  [996, 800, 8],
  [990, 700, 8], // ascending colon
  [992, 590, 10],
  [1000, 520, 12],
  [1030, 482, 16], // hepatic flexure
  [1110, 494, 30],
  [1214, 532, 42], // transverse colon sags in front of the duodenum
  [1320, 546, 44],
  [1440, 520, 40],
  [1556, 470, 30],
  [1620, 436, 20], // splenic flexure (higher than the hepatic)
  [1654, 478, 14],
  [1652, 600, 12], // descending colon
  [1644, 720, 12],
  [1632, 820, 14],
  [1586, 880, 18], // sigmoid colon
  [1504, 866, 22],
  [1448, 898, 20],
  [1418, 940, 16], // rectum, continuing into the pelvis
  [1412, 990, 14],
];
const COLON_PTS = smooth3(COLON_CTRL, 12);
const COLON_LEN = (() => { let L = 0; for (let i = 1; i < COLON_PTS.length; i++) L += Math.hypot(COLON_PTS[i][0] - COLON_PTS[i - 1][0], COLON_PTS[i][1] - COLON_PTS[i - 1][1]); return L; })();
const HAUSTRA = 30; // px between haustral clefts
const colonRadius = (f) => {
  const s2 = f * COLON_LEN;
  const base = f > 0.9 ? 25 - (f - 0.9) * 50 : 27;
  if (f > 0.86) return base; // rectum and lower sigmoid: no haustra
  const u = (s2 % HAUSTRA) / HAUSTRA;
  return base * (0.86 + 0.16 * Math.pow(Math.sin(Math.PI * u), 0.7));
};
const APPENDIX = smooth3([[992, 918, 4], [978, 940, 4], [956, 950, 5], [936, 940, 6], [926, 918, 6], [930, 896, 6]], 10);
const ESOPHAGUS = smooth3([[1352, 96, 6], [1350, 170, 6], [1356, 228, 6]], 10);

// stomach outline (anterior surface): cardia → fundus → greater curvature → antrum → pylorus → lesser curvature → back to cardia
const STOMACH_OUT = [
  [1342, 236], [1366, 206], [1408, 190], [1452, 198], [1484, 226], [1500, 268], [1506, 320], [1498, 380],
  [1474, 432], [1432, 470], [1376, 484], [1322, 474], [1286, 448], [1268, 424], [1256, 412], // greater curvature → pyloric canal
  [1256, 396], [1268, 386], [1292, 392], [1322, 404], [1352, 404], [1380, 390], [1398, 364], [1402, 330], [1394, 292], [1376, 262], [1360, 246],
];

function closedCurve(pts, tension = 0.5) {
  const n = pts.length;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2, p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2, p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + "Z";
}
function openCurve(pts) {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}

/** Stomach as a volumetric organ with curvature vessels; `id` keeps gradient ids unique. */
export function stomachSvg({ id = "st", food = 0, outline = STOMACH_OUT, scale = 1, tx = 0, ty = 0, mirror = false } = {}) {
  const pts = outline.map(([x, y]) => {
    let X = x;
    if (mirror) X = 2 * 1380 - x;
    return [(X - 1380) * scale + 1380 + tx, (y - 340) * scale + 340 + ty];
  });
  const d = closedCurve(pts);
  const m = (x, y) => [((mirror ? 2 * 1380 - x : x) - 1380) * scale + 1380 + tx, (y - 340) * scale + 340 + ty];
  // greater-curvature gastroepiploic arcade and lesser-curvature gastric arcade with short branches
  const arcG = [m(1468, 232), m(1490, 282), m(1494, 342), m(1482, 400), m(1452, 446), m(1404, 470), m(1350, 470), m(1306, 450)];
  const arcL = [m(1366, 252), m(1386, 290), m(1390, 332), m(1376, 370), m(1344, 392), m(1300, 396)];
  const branches = (arc, inward, n) => {
    let s = "";
    for (let i = 1; i < arc.length - 1; i += 1) {
      const [x, y] = arc[i];
      const [px, py] = arc[i - 1], [nx, ny] = arc[i + 1];
      let tx2 = nx - px, ty2 = ny - py;
      const L = Math.hypot(tx2, ty2) || 1;
      let ox = (-ty2 / L) * inward, oy = (tx2 / L) * inward;
      for (let k = -1; k <= 1; k += 2) s += `M${f1(x)} ${f1(y)}Q${f1(x + ox * 0.5 + (tx2 / L) * k * 6)} ${f1(y + oy * 0.5 + (ty2 / L) * k * 6)} ${f1(x + ox + (tx2 / L) * k * 10)} ${f1(y + oy + (ty2 / L) * k * 10)}`;
    }
    return s;
  };
  const pyl = m(1262, 404);
  const sx = scale;
  return (
    `<defs>` +
    `<radialGradient id="${id}-g" cx="0.62" cy="0.36" r="0.75"><stop offset="0" stop-color="#F4A898"/><stop offset="0.55" stop-color="#D9776C"/><stop offset="1" stop-color="#9C3F40"/></radialGradient>` +
    `<clipPath id="${id}-c"><path d="${d}"/></clipPath>` +
    `<filter id="${id}-b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${9 * sx}"/></filter>` +
    `</defs>` +
    `<path d="${d}" fill="#000" opacity="0.35" transform="translate(${6 * sx} ${10 * sx})" filter="url(#${id}-b)"/>` +
    `<path d="${d}" fill="url(#${id}-g)"/>` +
    `<g clip-path="url(#${id}-c)">` +
    // inner rim shadow for volume
    `<path d="${d}" fill="none" stroke="#6E2429" stroke-width="${26 * sx}" opacity="0.45" filter="url(#${id}-b)"/>` +
    // food seen through the wall (s11)
    (food > 0 ? `<path d="${d}" fill="#C9A46A" opacity="${(0.55 * food).toFixed(2)}" transform="translate(${(1380 + tx) * (1 - 0.86)} ${(360 + ty) * (1 - 0.86)}) scale(0.86)"/>` : "") +
    // muscular striations along the body (oblique and longitudinal fibres, faint)
    Array.from({ length: 9 }, (_, i) => {
      const a = m(1300 + i * 22, 200 + i * 6), b = m(1250 + i * 26, 470);
      return `<path d="M${f1(a[0])} ${f1(a[1])}Q${f1((a[0] + b[0]) / 2 + 40 * sx)} ${f1((a[1] + b[1]) / 2)} ${f1(b[0])} ${f1(b[1])}" stroke="#FFD3C8" stroke-width="${1 * sx}" opacity="0.12" fill="none"/>`;
    }).join("") +
    // highlight
    `<ellipse cx="${f1(m(1452, 268)[0])}" cy="${f1(m(1452, 268)[1])}" rx="${36 * sx}" ry="${54 * sx}" fill="#FFE1D8" opacity="0.18" filter="url(#${id}-b)"/>` +
    `</g>` +
    // curvature vessels
    `<path d="${openCurve(arcG)}" stroke="#7A1E28" stroke-width="${5.5 * sx}" fill="none" stroke-linecap="round"/>` +
    `<path d="${openCurve(arcG)}" stroke="#E5484D" stroke-width="${3.2 * sx}" fill="none" stroke-linecap="round"/>` +
    `<path d="${branches(arcG, -22 * sx, 6)}" stroke="#D63F48" stroke-width="${1.6 * sx}" fill="none" stroke-linecap="round" opacity="0.9"/>` +
    `<path d="${openCurve(arcL)}" stroke="#7A1E28" stroke-width="${4.5 * sx}" fill="none" stroke-linecap="round"/>` +
    `<path d="${openCurve(arcL)}" stroke="#E5484D" stroke-width="${2.6 * sx}" fill="none" stroke-linecap="round"/>` +
    `<path d="${branches(arcL, 16 * sx, 4)}" stroke="#D63F48" stroke-width="${1.3 * sx}" fill="none" stroke-linecap="round" opacity="0.85"/>` +
    // outline
    `<path d="${d}" fill="none" stroke="#6E2429" stroke-width="${2.2 * sx}"/>` +
    // pyloric sphincter: thickened muscular ring
    `<ellipse cx="${f1(pyl[0])}" cy="${f1(pyl[1])}" rx="${7 * sx}" ry="${15 * sx}" fill="#B4474B" stroke="#6E2429" stroke-width="${1.6 * sx}"/>`
  );
}

function pancreasSvg() {
  // head nestled in the duodenal C, neck, body behind the stomach, tail toward the spleen; lobulated surface
  const outline = "M1176 500C1172 470 1196 452 1226 456C1262 460 1290 452 1330 440C1390 424 1460 420 1520 404C1556 396 1574 410 1562 428C1548 448 1490 456 1430 466C1370 476 1320 488 1290 506C1262 524 1252 552 1222 556C1192 560 1180 530 1176 500Z";
  let lob = "";
  const r = (i) => ((i * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 260; i++) {
    const t = r(i * 3 + 1), u = r(i * 7 + 5);
    const x = 1172 + t * 400, y = 396 + u * 166;
    lob += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(5 + r(i + 7) * 5)}" fill="none" stroke="#B88A55" stroke-width="0.9" opacity="0.55"/>`;
  }
  return (
    `<defs><linearGradient id="pan-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2D29E"/><stop offset="1" stop-color="#C9985E"/></linearGradient>` +
    `<clipPath id="pan-c"><path d="${outline}"/></clipPath></defs>` +
    `<path d="${outline}" fill="url(#pan-g)"/>` +
    `<g clip-path="url(#pan-c)">${lob}</g>` +
    `<path d="${outline}" fill="none" stroke="#8E6A3A" stroke-width="1.6"/>`
  );
}

function cleftsFor(piece, startLen) {
  // haustral clefts: short arcs across the colon at each cleft, a dark groove with a pale lip
  let d = "", lip = "";
  const pts = piece.points;
  let walked = startLen;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k0 = Math.ceil(walked / HAUSTRA), k1 = Math.floor((walked + seg) / HAUSTRA);
    for (let k = k0; k <= k1; k++) {
      const t = (k * HAUSTRA - walked) / (seg || 1);
      if (k * HAUSTRA > COLON_LEN * 0.86) continue;
      const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const tx = (b[0] - a[0]) / (seg || 1), ty = (b[1] - a[1]) / (seg || 1);
      const nx = -ty, ny = tx, R = 23;
      const bow = 5;
      d += `M${f1(x + nx * R)} ${f1(y + ny * R)}Q${f1(x + tx * bow)} ${f1(y + ty * bow)} ${f1(x - nx * R)} ${f1(y - ny * R)}`;
      lip += `M${f1(x + nx * R + tx * 3)} ${f1(y + ny * R + ty * 3)}Q${f1(x + tx * (bow + 3))} ${f1(y + ty * (bow + 3))} ${f1(x - nx * R + tx * 3)} ${f1(y - ny * R + ty * 3)}`;
    }
    walked += seg;
  }
  return `<path d="${d}" fill="none" stroke="#6E3328" stroke-width="2.4" opacity="0.8"/><path d="${lip}" fill="none" stroke="#F6D2BD" stroke-width="1.4" opacity="0.5"/>`;
}

function colonItems() {
  const pieces = tubePieces(COLON_PTS, colonRadius, P, { maxLength: 40 });
  return pieces.map((piece) => {
    // taenia libera: a pale longitudinal band along the anterior surface
    const c = piece.points.map((p) => iso(p, P));
    const taenia = `<path d="${pathOf(c)}" fill="none" stroke="#EBC6AE" stroke-width="5" stroke-linecap="round" opacity="${piece.from > COLON_LEN * 0.86 ? 0 : 0.42}" transform="translate(2 3)"/>`;
    return { depth: depthOf(piece.mid, P), svg: tubeSvgSmooth(piece, PAL.colon, { clefts: cleftsFor(piece, piece.from) + taenia }) };
  });
}

function mesenterySvg() {
  // the mesentery fills the infracolic space behind the coils; its root runs obliquely from the
  // duodenojejunal flexure (upper left of the patient) to the ileocecal junction (right iliac fossa)
  const body = "M1000 610C1040 556 1140 560 1240 572C1340 584 1440 560 1560 548C1640 548 1660 620 1652 700C1646 780 1640 830 1592 872C1520 908 1400 906 1280 904C1160 902 1080 916 1020 896C990 860 984 760 990 680C992 650 994 628 1000 610Z";
  const root = [[1352, 560], [1300, 640], [1220, 720], [1140, 800], [1070, 860]];
  // arcades: from the root toward the loops (SMA branches in red, SMV tributaries in blue)
  const targets = [[1400, 650], [1460, 700], [1540, 680], [1580, 760], [1500, 800], [1400, 760], [1320, 820], [1250, 860], [1180, 720], [1110, 660], [1080, 780], [1160, 860]];
  let art = "", vein = "";
  targets.forEach(([tx, ty], i) => {
    const r0 = root[Math.min(root.length - 1, Math.floor((i / targets.length) * root.length))];
    const mx = (r0[0] + tx) / 2 + ((i % 2) * 2 - 1) * 18, my = (r0[1] + ty) / 2 - 12;
    art += `M${r0[0]} ${r0[1]}Q${f1(mx)} ${f1(my)} ${tx} ${ty}`;
    vein += `M${r0[0] + 5} ${r0[1] + 4}Q${f1(mx + 6)} ${f1(my + 6)} ${tx + 6} ${ty + 5}`;
    // vasa recta fanning out at the loop
    for (let k = -2; k <= 2; k++) art += `M${tx} ${ty}l${k * 7} ${-10 - Math.abs(k) * 2}`;
  });
  return (
    `<defs><radialGradient id="mes-g" cx="0.45" cy="0.45" r="0.7"><stop offset="0" stop-color="#C98972"/><stop offset="0.7" stop-color="#9C5A50"/><stop offset="1" stop-color="#6E3536"/></radialGradient></defs>` +
    `<filter id="mes-f" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14"/></filter>` +
    `<path d="${body}" fill="url(#mes-g)" opacity="0.85" filter="url(#mes-f)"/>` +
    `<path d="M${root.map((p) => p.join(" ")).join("L")}" fill="none" stroke="#D9A88E" stroke-width="22" stroke-linecap="round" opacity="0.22" filter="url(#mes-f)"/>` +
    `<path d="${vein}" fill="none" stroke="#5B7BE0" stroke-width="2" opacity="0.65"/>` +
    `<path d="${art}" fill="none" stroke="#E5484D" stroke-width="2" opacity="0.8"/>`
  );
}

function cecumSvg() {
  // blind pouch below the ileocecal junction, wider than the ascending colon
  return (
    `<defs><radialGradient id="cec-g" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#EDC3A8"/><stop offset="0.5" stop-color="#CF8E74"/><stop offset="1" stop-color="#7E4036"/></radialGradient></defs>` +
    `<path d="M966 846C962 884 974 920 1004 928C1036 934 1052 904 1046 870C1042 846 1028 834 1004 832C986 832 970 836 966 846Z" fill="url(#cec-g)" stroke="#5E2426" stroke-width="1.8"/>` +
    `<path d="M972 872Q1004 862 1040 874" fill="none" stroke="#6E3328" stroke-width="2.2" opacity="0.7"/>` +
    `<path d="M978 902Q1006 892 1036 902" fill="none" stroke="#6E3328" stroke-width="2" opacity="0.6"/>`
  );
}

function epiploicSvg() {
  // small fatty tags (appendices epiploicae) along the taeniae of the transverse and descending colon
  const tags = [[1126, 470], [1240, 506], [1350, 520], [1470, 494], [1574, 446], [1680, 560], [1676, 690], [1662, 800], [968, 640], [962, 760]];
  return tags.map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" transform="rotate(${(i * 47) % 180} ${x} ${y})" fill="#F2D27A" stroke="#B08A3A" stroke-width="0.8"/>`).join("");
}

function shadowLayer(pts, radius) {
  // one soft contact shadow under a whole tube (drawn behind everything else)
  return `<path d="${pathOf(pts.map((p) => iso(p, P)))}" fill="none" stroke="#000" stroke-width="${radius * 2 + 6}" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" transform="translate(4 8)" filter="url(#gm-soft6)"/>`;
}
export function shadowsSvg() {
  return `<defs><filter id="gm-soft6" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter></defs>` + shadowLayer(SI_PTS, 19) + shadowLayer(COLON_PTS, 26);
}

let CACHE = null;
/** Static depth-sorted items for the abdominal map. */
export function gutItems() {
  if (CACHE) return CACHE;
  const si = tubePieces(SI_PTS, siRadius, P, { maxLength: 40 });
  const n = si.length;
  const items = [];
  si.forEach((piece, i) => items.push({ depth: depthOf(piece.mid, P), svg: tubeSvgSmooth(piece, i / n < 0.12 ? PAL.duo : PAL.si) }));
  items.push(...colonItems());
  items.push({ depth: 7, svg: cecumSvg() });
  items.push({ depth: 6.5, svg: tubePieces(APPENDIX, (f) => 6.5 - f * 1.5, P, { maxLength: 20 }).map((p) => tubeSvgSmooth(p, PAL.appendix)).join("") });
  items.push({ depth: 45, svg: epiploicSvg() });
  CACHE = items.sort((a, b) => a.depth - b.depth);
  return CACHE;
}

/** Dense screen polyline of the small intestine centreline, with cumulative length, for bands and markers. */
const DENSE = (() => {
  const pts = [];
  for (let i = 0; i < SI_PTS.length - 1; i++) {
    const a = SI_PTS[i], b = SI_PTS[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
    for (let k = 0; k < n; k++) pts.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n, a[2] + ((b[2] - a[2]) * k) / n]);
  }
  pts.push(SI_PTS[SI_PTS.length - 1]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, total: cum[cum.length - 1] };
})();
export const SI_TOTAL = DENSE.total;
export const SI_PATH_D = "M" + DENSE.pts.filter((_, i) => i % 3 === 0).map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L");
export function siPoint(frac) {
  const L = Math.max(0, Math.min(1, frac)) * DENSE.total;
  let lo = 0, hi = DENSE.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (DENSE.cum[mid] < L) lo = mid;
    else hi = mid;
  }
  const t = (L - DENSE.cum[lo]) / (DENSE.cum[hi] - DENSE.cum[lo] || 1);
  const a = DENSE.pts[lo], b = DENSE.pts[hi];
  return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z: a[2] + (b[2] - a[2]) * t };
}
/** Sub-path of the SI between fractions a and b (3D points). */
export function siSub(a, b) {
  const s = Math.max(0, a), e = Math.min(1, b);
  if (e - s < 0.002) return null;
  const pts = [];
  const n = Math.max(3, Math.ceil(((e - s) * DENSE.total) / 6));
  for (let i = 0; i <= n; i++) {
    const p = siPoint(s + ((e - s) * i) / n);
    pts.push([p.x, p.y, p.z + 0.2]);
  }
  return pts;
}
/** Depth-sorted items for a coloured band riding on the SI (e.g. the MMC or a fast peristaltic wave). */
export function bandItems(a, b, pal, grow = 2) {
  const pts = siSub(a, b);
  if (!pts) return [];
  const base = (f) => siRadius(Math.max(0, Math.min(1, a + (b - a) * f)));
  return tubePieces(pts, (f) => base(f) + grow, P, { maxLength: 24 }).map((piece) => ({ depth: depthOf(piece.mid, P) + 0.1, svg: tubeSvgSmooth(piece, pal) }));
}

/** The stomach mirrored so its pylorus points right and lands on (px, py): for the "unrolled" tube diagrams. */
export function stomachAt({ id = "sta", px, py, scale = 0.62, food = 0 }) {
  const mx = 2 * 1380 - 1262, my = 404;
  const tx = px - ((mx - 1380) * scale + 1380), ty = py - ((my - 340) * scale + 340);
  const ex = (x) => ((2 * 1380 - x) - 1380) * scale + 1380 + tx, ey = (y) => (y - 340) * scale + 340 + ty;
  const eso = `<path d="M${f1(ex(1352))} ${f1(ey(150))}L${f1(ex(1352))} ${f1(ey(236))}" stroke="#7E3236" stroke-width="${f1(30 * scale)}" stroke-linecap="round"/><path d="M${f1(ex(1352))} ${f1(ey(150))}L${f1(ex(1352))} ${f1(ey(236))}" stroke="#C2635C" stroke-width="${f1(22 * scale)}" stroke-linecap="round"/><path d="M${f1(ex(1352) - 3 * scale)} ${f1(ey(150))}L${f1(ex(1352) - 3 * scale)} ${f1(ey(236))}" stroke="#E8A296" stroke-width="${f1(7 * scale)}" stroke-linecap="round" opacity="0.7"/>`;
  return eso + stomachSvg({ id, food, scale, tx, ty, mirror: true });
}

export const ANCHOR = {
  pylorus: [1262, 404],
  stomach: [1420, 330],
  valve: [1046, 878],
  cecum: [1006, 884],
  colonUp: [994, 600],
  duodenum: [1150, 470],
  jejunum: [1500, 650],
  ileum: [1150, 780],
  esophagusTop: [1352, 110],
};

export function staticBack() {
  // mesenteric shadow behind the coils + pancreas + esophagus
  const shadow = `<ellipse cx="1330" cy="720" rx="320" ry="200" fill="#000" opacity="0.32" filter="url(#gm-soft)"/><ellipse cx="1330" cy="560" rx="380" ry="120" fill="#000" opacity="0.2" filter="url(#gm-soft)"/>`;
  const eso = tubePieces(ESOPHAGUS, 14, P, { maxLength: 20 }).map((p) => tubeSvgSmooth(p, PAL.esophagus)).join("");
  return `<defs><filter id="gm-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="28"/></filter></defs>${shadow}${mesenterySvg()}${pancreasSvg()}${eso}${shadowsSvg()}`;
}

/** Full static map as one SVG string (stomach above the duodenum, behind the transverse colon in depth order). */
export function gutMapSvg({ food = 0, extra = [] } = {}) {
  const items = [...gutItems(), ...extra].sort((a, b) => a.depth - b.depth);
  // stomach sits at depth ~25: in front of duodenum and pancreas, behind the transverse colon's front loops
  const stomach = { depth: 25, svg: stomachSvg({ id: "gm-st", food }) };
  const all = [...items, stomach].sort((a, b) => a.depth - b.depth);
  return wrapMask(staticBack() + all.map((i) => i.svg).join(""));
}

/** The rectum continues into the pelvis: fade the bottom of the sigmoid/rectum instead of cutting it. */
export function wrapMask(inner) {
  return (
    `<defs><linearGradient id="gm-fadeg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>` +
    `<mask id="gm-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect x="0" y="0" width="1920" height="1080" fill="#fff"/><rect x="1330" y="905" width="180" height="90" fill="url(#gm-fadeg)"/><rect x="1330" y="995" width="180" height="85" fill="#000"/><linearGradient id="gm-fadeu" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><rect x="1310" y="80" width="90" height="70" fill="url(#gm-fadeu)"/><rect x="1310" y="0" width="90" height="80" fill="#000"/></mask></defs>` +
    `<g mask="url(#gm-mask)">${inner}</g>`
  );
}

export const _debug = { SI_PTS, COLON_PTS, siRadius, colonRadius, pathOf, iso };
