// Histology of the small intestine as procedural SVG (literal anatomy, longitudinal sections).
// Morphology follows standard histology (Ross & Pawlina; Junqueira's Basic Histology) and the lecture's figures:
// villi lined by simple columnar enterocytes (basal oval nuclei, apical brush border) with goblet cells that become
// more frequent toward the tip; lamina propria core with a subepithelial fenestrated capillary plexus (arteriole up,
// venule down), a blind-ended central lacteal and smooth-muscle strands; crypts of Lieberkühn with goblet cells and
// Paneth cells (apical eosinophilic granules) at the base; muscularis mucosae; submucosa (Brunner's glands in the
// duodenum: compound tubuloacinar mucous glands, pale cytoplasm, flattened basal nuclei, ducts opening into crypts);
// muscularis externa (inner circular cut across, outer longitudinal cut lengthwise) with the myenteric plexus between.

const f1 = (v) => Math.round(v * 10) / 10;
export const rngOf = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const H = {
  cyto: "#E9A69A",
  cytoDeep: "#D98B80",
  cellLine: "#B8645E",
  nucleus: "#6E3A78",
  nucleusRim: "#4A2356",
  chromatin: "#3E1C4A",
  brush: "#F8D0C4",
  glyco: "#FFE6DC",
  bm: "#F4D7CD",
  lp: "#9C4049",
  lpDeep: "#7E2F3A",
  lpFiber: "#B85A63",
  lpNucleus: "#4E2350",
  mucin: "#D9E5EC",
  mucinDot: "#BFD1DE",
  mucinEdge: "#94AEC0",
  paneth: "#FF8F6B",
  arteriole: "#E5484D",
  venule: "#5B7BE0",
  capillary: "#C9425F",
  rbc: "#FF7A7A",
  lactealLumen: "#A9DDB9",
  lactealWall: "#3E9C5A",
  muscle: "#B4474B",
  muscleNuc: "#5A2338",
  submucosa: "#6E2A33",
  collagen: "#8E4048",
  brunner: "#BCD0DE",
  brunnerEdge: "#7E9BB4",
  brunnerNuc: "#3E4A70",
  circ: "#A33A3F",
  circDeep: "#7E2A30",
  long: "#8E2F33",
  ganglion: "#E8C26A",
  neuron: "#B98A2E",
  serosa: "#D59A8E",
};

/* ───────────── geometry helpers ───────────── */

/** Resample a polyline at a fixed spacing; returns points with unit tangents and right-hand normals. */
export function resample(pts, step) {
  const out = [];
  let acc = 0;
  out.push({ x: pts[0][0], y: pts[0][1] });
  for (let i = 1; i < pts.length; i++) {
    let [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    let seg = Math.hypot(bx - ax, by - ay);
    while (acc + seg >= step) {
      const t = (step - acc) / seg;
      ax = ax + (bx - ax) * t;
      ay = ay + (by - ay) * t;
      out.push({ x: ax, y: ay });
      seg = Math.hypot(bx - ax, by - ay);
      acc = 0;
    }
    acc += seg;
  }
  // tangents/normals (smoothed over neighbours)
  for (let i = 0; i < out.length; i++) {
    const a = out[Math.max(0, i - 2)], b = out[Math.min(out.length - 1, i + 2)];
    let tx = b.x - a.x, ty = b.y - a.y;
    const L = Math.hypot(tx, ty) || 1;
    tx /= L;
    ty /= L;
    out[i].tx = tx;
    out[i].ty = ty;
    out[i].nx = -ty; // right-hand normal (toward the tissue when walking left→right with the lumen above)
    out[i].ny = tx;
  }
  return out;
}

const poly = (pts) => "M" + pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L") + "Z";
const line = (pts) => "M" + pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L");

/** Rounded polyline through corner points (fillet radius r): smooth surface contours. */
export function filleted(corners, r = 10, seg = 6) {
  const out = [corners[0]];
  for (let i = 1; i < corners.length - 1; i++) {
    const [px, py] = corners[i - 1], [cx, cy] = corners[i], [nx, ny] = corners[i + 1];
    const d1 = Math.hypot(cx - px, cy - py), d2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const a = [cx + ((px - cx) / d1) * rr, cy + ((py - cy) / d1) * rr];
    const b = [cx + ((nx - cx) / d2) * rr, cy + ((ny - cy) / d2) * rr];
    for (let k = 0; k <= seg; k++) {
      const t = k / seg;
      const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * cx + t * t * b[0];
      const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cy + t * t * b[1];
      out.push([x, y]);
    }
  }
  out.push(corners[corners.length - 1]);
  return out;
}

/** A villus surface: left side up, rounded tip, right side down. Slight organic waviness. */
export function villusContour(cx, base, h, w, rand, wav = 3) {
  const r = w / 2;
  const pts = [];
  const n = Math.max(8, Math.round((h - r) / 14));
  for (let i = 0; i <= n; i++) {
    const y = base - (i / n) * (h - r);
    pts.push([cx - r + Math.sin(i * 0.9 + rand() * 2) * wav * (i > 0 && i < n ? 1 : 0), y]);
  }
  for (let k = 1; k < 18; k++) {
    const a = Math.PI + (k / 18) * Math.PI;
    pts.push([cx + Math.cos(a) * r, base - (h - r) + Math.sin(a) * r * 1.08]);
  }
  for (let i = n; i >= 0; i--) {
    const y = base - (i / n) * (h - r);
    pts.push([cx + r + Math.sin(i * 1.1 + rand() * 2) * wav * (i > 0 && i < n ? 1 : 0), y]);
  }
  return pts;
}

/** A crypt (tubular gland) going down from the surface: left wall down, rounded base, right wall up. */
export function cryptContour(cx, base, depth, w) {
  const r = w / 2;
  const pts = [];
  const n = Math.max(6, Math.round((depth - r) / 14));
  for (let i = 0; i <= n; i++) pts.push([cx - r, base + (i / n) * (depth - r)]);
  for (let k = 1; k < 14; k++) {
    const a = Math.PI - (k / 14) * Math.PI;
    pts.push([cx + Math.cos(a) * r, base + (depth - r) + Math.sin(a) * r]);
  }
  for (let i = n; i >= 0; i--) pts.push([cx + r, base + (i / n) * (depth - r)]);
  return pts;
}

/* ───────────── epithelium ───────────── */

/**
 * Simple columnar epithelium along an apical contour (tissue on the right-hand side).
 * Returns { cells, nuclei, goblets, paneth, brush, bm, inner } SVG strings and the inner (basal) polyline.
 * `goblet(s)` gives the goblet probability at arc fraction s; `paneth(i, p)` marks Paneth cells.
 */
export function epithelium(contour, { thick = 26, cellW = 11, seed = 1, goblet = () => 0.12, paneth = null, brush = true, detail = 1 } = {}) {
  const rand = rngOf(seed);
  const S = resample(contour, cellW);
  const O = S.map((p) => [p.x, p.y]);
  const I = S.map((p) => [p.x + p.nx * thick, p.y + p.ny * thick]);
  let cells = "", lat = "", nuclei = "", chrom = "", goblets = "", gobDots = "", gobNuc = "", pan = "", brushD = "";
  let lastGob = -10;
  for (let i = 0; i < S.length - 1; i++) {
    const a = S[i], b = S[i + 1];
    const s = i / (S.length - 1);
    const o0 = O[i], o1 = O[i + 1], i0 = I[i], i1 = I[i + 1];
    // lateral membrane
    lat += `M${f1(o0[0])} ${f1(o0[1])}L${f1(i0[0])} ${f1(i0[1])}`;
    const mx = (o0[0] + o1[0]) / 2, my = (o0[1] + o1[1]) / 2;
    const nx = (a.nx + b.nx) / 2, ny = (a.ny + b.ny) / 2;
    const tx = (a.tx + b.tx) / 2, ty = (a.ty + b.ty) / 2;
    const isPaneth = paneth ? paneth(i, s, a) : false;
    const isGoblet = !isPaneth && i - lastGob > 3 && rand() < goblet(s);
    if (isGoblet) {
      lastGob = i;
      // mucin-filled theca bulging toward the apex, narrow stem with a compressed basal nucleus
      const top = [mx + nx * thick * 0.12, my + ny * thick * 0.12];
      const mid = [mx + nx * thick * 0.4, my + ny * thick * 0.4];
      const low = [mx + nx * thick * 0.66, my + ny * thick * 0.66];
      const wv = cellW * 0.55;
      const cup = [
        [top[0] - tx * wv * 0.55, top[1] - ty * wv * 0.55],
        [mid[0] - tx * wv, mid[1] - ty * wv],
        [low[0] - tx * wv * 0.35, low[1] - ty * wv * 0.35],
        [low[0] + tx * wv * 0.35, low[1] + ty * wv * 0.35],
        [mid[0] + tx * wv, mid[1] + ty * wv],
        [top[0] + tx * wv * 0.55, top[1] + ty * wv * 0.55],
      ];
      goblets += smoothClosed(cup);
      for (let k = 0; k < 4 * detail; k++) {
        const u = (rand() - 0.5) * 1.2, v = 0.15 + rand() * 0.45;
        gobDots += `M${f1(mx + nx * thick * v + tx * wv * u)} ${f1(my + ny * thick * v + ty * wv * u)}h0.1`;
      }
      const nb = [mx + nx * thick * 0.84, my + ny * thick * 0.84];
      gobNuc += ellipsePath(nb[0], nb[1], cellW * 0.3, thick * 0.07, Math.atan2(ty, tx));
      // stretch cell boundaries slightly (shared lateral lines already drawn)
    } else {
      // enterocyte nucleus: basal third, oval, oriented with the cell axis
      const v = 0.6 + (rand() - 0.5) * 0.12;
      const c = [mx + nx * thick * v, my + ny * thick * v];
      const ang = Math.atan2(ny, nx);
      nuclei += ellipsePath(c[0], c[1], thick * 0.2, cellW * 0.3, ang);
      if (detail > 0.5) {
        for (let k = 0; k < 2; k++) chrom += `M${f1(c[0] + (rand() - 0.5) * cellW * 0.3)} ${f1(c[1] + (rand() - 0.5) * cellW * 0.3)}h0.1`;
      }
      if (isPaneth) {
        for (let k = 0; k < 5; k++) {
          const u = (rand() - 0.5) * 0.8, vv = 0.12 + rand() * 0.28;
          pan += `<circle cx="${f1(mx + nx * thick * vv + tx * cellW * u * 0.5)}" cy="${f1(my + ny * thick * vv + ty * cellW * u * 0.5)}" r="${f1(1.3 + rand() * 1.1)}"/>`;
        }
      } else if (brush) {
        // microvilli: a dense fringe on the apical surface
        for (let k = 0; k < 3; k++) {
          const u = (k + 0.5) / 3;
          const px = o0[0] + (o1[0] - o0[0]) * u, py = o0[1] + (o1[1] - o0[1]) * u;
          brushD += `M${f1(px)} ${f1(py)}l${f1(-nx * 5)} ${f1(-ny * 5)}`;
        }
      }
    }
  }
  const band = poly([...O, ...I.slice().reverse()]);
  return {
    O,
    I,
    svg:
      `<path d="${band}" fill="${H.cyto}"/>` +
      `<path d="${line(I)}" fill="none" stroke="${H.cytoDeep}" stroke-width="${f1(thick * 0.5)}" opacity="0.45" transform="translate(0 0)"/>` +
      `<path d="${lat}" stroke="${H.cellLine}" stroke-width="0.8" opacity="0.75" fill="none"/>` +
      (goblets ? `<path d="${goblets}" fill="${H.mucin}" stroke="${H.mucinEdge}" stroke-width="0.8"/><path d="${gobDots}" stroke="${H.mucinDot}" stroke-width="2" stroke-linecap="round"/>` : "") +
      `<path d="${nuclei}" fill="${H.nucleus}" stroke="${H.nucleusRim}" stroke-width="0.6"/>` +
      (chrom ? `<path d="${chrom}" stroke="${H.chromatin}" stroke-width="1.6" stroke-linecap="round"/>` : "") +
      (gobNuc ? `<path d="${gobNuc}" fill="${H.chromatin}"/>` : "") +
      (pan ? `<g fill="${H.paneth}" stroke="#B24A33" stroke-width="0.4">${pan}</g>` : "") +
      `<path d="${line(O)}" fill="none" stroke="#C7766D" stroke-width="1.2"/>` +
      (brushD ? `<path d="${brushD}" stroke="${H.brush}" stroke-width="1.1" stroke-linecap="round" opacity="0.95"/><path d="${line(O.map((p, k) => [p[0] - S[k].nx * 6.5, p[1] - S[k].ny * 6.5]))}" fill="none" stroke="${H.glyco}" stroke-width="2.4" opacity="0.18"/>` : "") +
      `<path d="${line(I)}" fill="none" stroke="${H.bm}" stroke-width="1.3" opacity="0.9"/>`,
  };
}

function ellipsePath(cx, cy, rx, ry, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return smoothClosed(pts);
}

export function smoothClosed(pts) {
  const n = pts.length;
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + "Z";
}
export function smoothOpen(pts) {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}

export function insidePoly(poly) {
  return (x, y) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-9) + xi) c = !c;
    }
    return c;
  };
}

/** Subepithelial capillary basket inside a villus core: a jittered mesh coloured arterial (red) → venous (blue). */
function capillaryMesh(cx, base, top, r, rand, inside, { cols = 6, rowGap = 26, width = 1.7 } = {}) {
  const rows = Math.max(4, Math.round((base - top) / rowGap));
  const nodes = [];
  for (let j = 0; j <= rows; j++) {
    const row = [];
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);
      const x = cx - r * 0.86 + u * r * 1.72 + (rand() - 0.5) * 8;
      const y = base - 8 - (j / rows) * (base - top - 8) + (rand() - 0.5) * 10;
      row.push(inside(x, y) ? [x, y] : null);
    }
    nodes.push(row);
  }
  const col = (u) => {
    const a = [0xe5, 0x48, 0x4d], b = [0x8c, 0x4a, 0xb8], c2 = [0x5b, 0x7b, 0xe0];
    const m = u < 0.5 ? a.map((v, k) => v + (b[k] - v) * u * 2) : b.map((v, k) => v + (c2[k] - v) * (u - 0.5) * 2);
    return `rgb(${m.map((v) => Math.round(v)).join(",")})`;
  };
  const byCol = Array.from({ length: cols }, () => "");
  const seg = (p, q) => {
    const mx = (p[0] + q[0]) / 2 + (rand() - 0.5) * 7, my = (p[1] + q[1]) / 2 + (rand() - 0.5) * 7;
    return `M${f1(p[0])} ${f1(p[1])}Q${f1(mx)} ${f1(my)} ${f1(q[0])} ${f1(q[1])}`;
  };
  for (let j = 0; j <= rows; j++)
    for (let i = 0; i < cols; i++) {
      const p = nodes[j][i];
      if (!p) continue;
      if (i < cols - 1 && nodes[j][i + 1] && rand() < 0.8) byCol[i] += seg(p, nodes[j][i + 1]);
      if (j < rows && nodes[j + 1][i]) byCol[i] += seg(p, nodes[j + 1][i]);
    }
  return byCol.map((d, i) => (d ? `<path d="${d}" fill="none" stroke="${col(i / (cols - 1))}" stroke-width="${width}" opacity="0.8"/>` : "")).join("");
}

/* ───────────── lamina propria contents ───────────── */

function lpTexture(inside, bbox, rand, density = 1) {
  // fibroblasts (elongated nuclei), lymphocytes/plasma cells (round dark nuclei), collagen fibres
  let fib = "", lym = "", col = "";
  const area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]);
  const n = Math.round((area / 900) * density);
  for (let k = 0; k < n; k++) {
    const x = bbox[0] + rand() * (bbox[2] - bbox[0]), y = bbox[1] + rand() * (bbox[3] - bbox[1]);
    if (!inside(x, y)) continue;
    const r = rand();
    if (r < 0.45) fib += ellipsePath(x, y, 5 + rand() * 2.5, 1.5, rand() * Math.PI);
    else if (r < 0.75) lym += `M${f1(x + 2.6)} ${f1(y)}a2.6 2.6 0 1 0 -5.2 0a2.6 2.6 0 1 0 5.2 0Z`;
    else col += `M${f1(x)} ${f1(y)}q${f1(6 + rand() * 6)} ${f1((rand() - 0.5) * 8)} ${f1(14 + rand() * 8)} ${f1((rand() - 0.5) * 6)}`;
  }
  return `<path d="${col}" fill="none" stroke="${H.lpFiber}" stroke-width="1.2" opacity="0.7"/><path d="${fib}" fill="${H.lpNucleus}" opacity="0.8"/><path d="${lym}" fill="#3A1840" opacity="0.85"/>`;
}

/* ───────────── a single villus (longitudinal section) ───────────── */

export function villusSvg({ cx = 900, base = 900, h = 500, w = 160, seed = 3, thick = null, cellW = 11, lacteal = 1, capillaries = 1, id = "v", detail = 1, tipGoblet = 0.24 } = {}) {
  const rand = rngOf(seed);
  const T = thick ?? Math.max(18, Math.min(30, w * 0.16));
  const C = villusContour(cx, base, h, w, rand, 2.5);
  const epi = epithelium(C, { thick: T, cellW, seed: seed * 7 + 1, goblet: (s) => 0.07 + tipGoblet * Math.sin(Math.PI * s) ** 2, detail });
  const inner = epi.I;
  const core = poly([...inner, [cx + w / 2 - T, base + 2], [cx - w / 2 + T, base + 2]]);
  const r = w / 2 - T;
  const top = base - h + T * 1.05;
  const corePoly = [...inner, [cx + w / 2 - T, base + 2], [cx - w / 2 + T, base + 2]];
  const inCore = insidePoly(corePoly);
  const inside = (x, y) => inCore(x, y) && inCore(x + 5, y) && inCore(x - 5, y) && inCore(x, y - 5);
  let vessels = "";
  if (capillaries) {
    // arteriole ascends eccentrically, breaks up into the subepithelial capillary basket at the tip; venules drain down the other side
    const art = smoothOpen([[cx - r * 0.42, base], [cx - r * 0.46, base - h * 0.4], [cx - r * 0.3, base - h * 0.75], [cx, top + 12]]);
    const ven = smoothOpen([[cx + r * 0.1, top + 16], [cx + r * 0.52, base - h * 0.7], [cx + r * 0.6, base - h * 0.35], [cx + r * 0.55, base]]);
    let rbc = "";
    for (let k = 1; k < 9; k++) {
      const y = base - (k / 9) * h * 0.75;
      rbc += `<ellipse cx="${f1(cx - r * 0.44 + (k % 2) * 1.5)}" cy="${f1(y)}" rx="1.8" ry="2.6" fill="${H.rbc}"/>`;
    }
    vessels =
      capillaryMesh(cx, base, top, r, rand, inside, { cols: Math.max(5, Math.round(w / 34)), rowGap: 26, width: 1.6 }) +
      `<path d="${art}" fill="none" stroke="#7A1E28" stroke-width="7"/><path d="${art}" fill="none" stroke="${H.arteriole}" stroke-width="4.6"/>` +
      `<path d="${ven}" fill="none" stroke="#26386E" stroke-width="8"/><path d="${ven}" fill="none" stroke="${H.venule}" stroke-width="5.4"/>` +
      rbc;
  }
  let lact = "";
  if (lacteal) {
    const lw = Math.max(7, w * 0.085);
    const lTop = base - h * 0.78;
    const lp = [];
    for (let k = 0; k <= 10; k++) {
      const y = base - 2 - (k / 10) * (base - 2 - lTop);
      lp.push([cx + Math.sin(k * 0.8 + seed) * 2, y]);
    }
    const d = smoothOpen(lp);
    let endo = "";
    for (let k = 1; k < 10; k += 2) {
      const [x, y] = lp[k];
      endo += ellipsePath(x - lw / 2 + 1, y, 1.4, 4, 0) + ellipsePath(x + lw / 2 - 1, y - 12, 1.4, 4, 0);
    }
    // smooth muscle strands (from the muscularis mucosae) alongside the lacteal
    let sm = "";
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const x = cx + side * (lw / 2 + 6 + k * 5);
        const y0 = base - 8 - k * 20, y1 = lTop + 30 + k * 26;
        sm += `M${f1(x)} ${f1(y0)}Q${f1(x + side * 3)} ${f1((y0 + y1) / 2)} ${f1(x)} ${f1(y1)}`;
      }
    }
    lact =
      `<path d="${sm}" fill="none" stroke="${H.muscle}" stroke-width="2.6" stroke-linecap="round" opacity="0.8"/>` +
      `<path d="${d}" fill="none" stroke="${H.lactealWall}" stroke-width="${f1(lw + 2.4)}" stroke-linecap="round"/>` +
      `<path d="${d}" fill="none" stroke="${H.lactealLumen}" stroke-width="${f1(lw)}" stroke-linecap="round" opacity="0.92"/>` +
      `<path d="${endo}" fill="#2E7A45"/>`;
  }
  return (
    `<defs><linearGradient id="${id}-lp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.lp}"/><stop offset="1" stop-color="${H.lpDeep}"/></linearGradient></defs>` +
    `<path d="${core}" fill="url(#${id}-lp)"/>` +
    lpTexture(inside, [cx - r, top, cx + r, base], rand, 1.1 * detail) +
    vessels +
    lact +
    epi.svg
  );
}

/* ───────────── mucosa field: villi and crypts along one surface ───────────── */

/**
 * items: [{ x, kind: "v" | "c" }] left→right. Villi rise `vh` from `base`; crypts sink `cd`.
 * Returns the full mucosa down to `bottom` (muscularis mucosae at `mmY` when given).
 */
export function mucosaSvg({ x0, x1, base, items, vh = 300, cd = 230, vw = 110, cw = 64, bottom = 900, mmY = null, seed = 11, id = "mu", thick = 22, cellW = 10, villusDetail = 1, lacteals = true }) {
  const rand = rngOf(seed);
  // surface contour: flat inter-villous floor with villi and crypt mouths, filleted corners
  const corners = [[x0, base]];
  for (const it of items) {
    if (it.kind === "v") {
      const r = vw / 2;
      corners.push([it.x - r, base]);
      const C = villusContour(it.x, base, vh, vw, rand, 2.2).slice(1, -1);
      corners.push(...C);
      corners.push([it.x + r, base]);
    } else {
      const r = cw / 2;
      corners.push([it.x - r, base]);
      corners.push(...cryptContour(it.x, base, cd, cw).slice(1, -1));
      corners.push([it.x + r, base]);
    }
  }
  corners.push([x1, base]);
  const contour = filleted(corners, 8, 4);
  const cryptBase = base + cd;
  const epi = epithelium(contour, {
    thick,
    cellW,
    seed: seed * 3 + 2,
    goblet: (s) => 0.16,
    paneth: (i, s, p) => p.y > cryptBase - cw * 0.45,
    detail: villusDetail,
  });
  const inner = epi.I;
  const lpBottom = mmY ?? bottom;
  const lpArea = poly([...inner, [x1, lpBottom], [x0, lpBottom]]);
  // lamina propria inside villi and between crypts
  const lpPoly = [...inner, [x1, lpBottom], [x0, lpBottom]];
  const inLP = insidePoly(lpPoly);
  const insideLP = (x, y) => inLP(x, y) && inLP(x + 4, y) && inLP(x - 4, y);
  let extras = "";
  // villus cores: capillary loops + lacteals
  for (const it of items) {
    if (it.kind !== "v") continue;
    const r = vw / 2 - thick;
    const lx = it.x;
    const lTop = base - vh * 0.72;
    if (lacteals) {
      const lw = Math.max(6, vw * 0.08);
      const d = `M${f1(lx)} ${f1(base + 2)}L${f1(lx)} ${f1(lTop)}`;
      const ly = `M${f1(lx)} ${f1(base + 2)}C${f1(lx + 4)} ${f1(base + 40)} ${f1(lx - 6)} ${f1(lpBottom - 40)} ${f1(lx + 2)} ${f1(lpBottom - 2)}`;
      extras += `<path d="${ly}" stroke="${H.lactealWall}" stroke-width="3.2" fill="none" opacity="0.85"/>`;
      extras += `<path d="${d}" stroke="${H.lactealWall}" stroke-width="${f1(lw + 2.2)}" stroke-linecap="round"/><path d="${d}" stroke="${H.lactealLumen}" stroke-width="${f1(lw)}" stroke-linecap="round" opacity="0.92"/>`;
    }
    const top = base - vh + thick + 4;
    extras += capillaryMesh(lx, base, top, r, rand, insideLP, { cols: 4, rowGap: 24, width: 1.4 });
    const art = smoothOpen([[lx - r * 0.45, lpBottom - 2], [lx - r * 0.5, base], [lx - r * 0.4, base - vh * 0.55], [lx, top + 8]]);
    const ven = smoothOpen([[lx + r * 0.1, top + 10], [lx + r * 0.55, base - vh * 0.5], [lx + r * 0.55, base], [lx + r * 0.5, lpBottom - 2]]);
    extras += `<path d="${art}" fill="none" stroke="#7A1E28" stroke-width="5"/><path d="${art}" fill="none" stroke="${H.arteriole}" stroke-width="3.2"/>`;
    extras += `<path d="${ven}" fill="none" stroke="#26386E" stroke-width="5.5"/><path d="${ven}" fill="none" stroke="${H.venule}" stroke-width="3.6"/>`;
  }
  let mm = "";
  if (mmY !== null) {
    // muscularis mucosae: thin band of smooth muscle cut lengthwise
    let fibres = "";
    for (let k = 0; k < Math.round((x1 - x0) / 26); k++) {
      const x = x0 + k * 26 + rand() * 8;
      fibres += ellipsePath(x + 10, mmY + 6 + (rand() - 0.5) * 3, 9, 1.4, (rand() - 0.5) * 0.15);
    }
    mm = `<rect x="${x0}" y="${mmY}" width="${x1 - x0}" height="12" fill="${H.muscle}"/><path d="${fibres}" fill="${H.muscleNuc}" opacity="0.7"/>`;
  }
  return {
    svg:
      `<defs><linearGradient id="${id}-lp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${H.lp}"/><stop offset="1" stop-color="${H.lpDeep}"/></linearGradient></defs>` +
      `<path d="${lpArea}" fill="url(#${id}-lp)"/>` +
      lpTexture(insideLP, [x0, base - vh, x1, lpBottom], rand, 1.0) +
      extras +
      mm +
      epi.svg,
    contour,
  };
}

/* ───────────── duodenal wall with Brunner's glands ───────────── */

function acinus(cx, cy, r, rand) {
  // a mucous tubuloacinar unit: pale foamy columnar cells, flattened basal nuclei against the basal lamina, tiny lumen
  const n = Math.max(6, Math.round(r * 0.45));
  let cells = "", nuc = "", foam = "";
  for (let k = 0; k < n; k++) {
    const a0 = (k / n) * Math.PI * 2 + rand() * 0.2, am = a0 + Math.PI / n;
    cells += `M${f1(cx + Math.cos(a0) * r * 0.28)} ${f1(cy + Math.sin(a0) * r * 0.28)}L${f1(cx + Math.cos(a0) * r * 0.96)} ${f1(cy + Math.sin(a0) * r * 0.96)}`;
    nuc += ellipsePath(cx + Math.cos(am) * r * 0.84, cy + Math.sin(am) * r * 0.84, 1.3, r * 0.18, am + Math.PI / 2);
    for (let q = 0; q < 2; q++) {
      const rr = r * (0.42 + rand() * 0.3), aa = am + (rand() - 0.5) * 0.5;
      foam += `M${f1(cx + Math.cos(aa) * rr)} ${f1(cy + Math.sin(aa) * rr)}h0.1`;
    }
  }
  const rx = r * (0.9 + rand() * 0.2), ry = r * (0.8 + rand() * 0.2);
  return {
    fill: `M${f1(cx + rx)} ${f1(cy)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0Z`,
    lumen: `M${f1(cx + r * 0.18)} ${f1(cy)}a${f1(r * 0.18)} ${f1(r * 0.14)} 0 1 0 ${f1(-r * 0.36)} 0a${f1(r * 0.18)} ${f1(r * 0.14)} 0 1 0 ${f1(r * 0.36)} 0Z`,
    cells,
    nuc,
    foam,
  };
}

export function brunnerWallSvg({ x0 = 860, x1 = 1728, lumenTop = 300, base = 470, vh = 92, vw = 50, cd = 88, cw = 24, mmY = 568, smTop = 580, smBottom = 790, glands = [960, 1150, 1340, 1530], seed = 21, id = "bw" } = {}) {
  const rand = rngOf(seed);
  // short, broad duodenal villi alternating with crypts
  const items2 = [];
  for (let x = x0 + 46; x < x1 - 40; ) {
    items2.push({ x, kind: "v" });
    const gap = vw / 2 + cw / 2 + 4 + rand() * 6;
    items2.push({ x: x + gap, kind: "c" });
    x += gap * 2;
  }
  const mu = mucosaSvg({ x0, x1, base, items: items2.filter((it) => it.x < x1 - 34), vh, cd, vw, cw, mmY, bottom: mmY, seed: seed + 3, id: `${id}-mu`, thick: 13, cellW: 7, villusDetail: 0.6, lacteals: true });
  // submucosa: dense irregular connective tissue with vessels and Brunner's glands
  let col = "";
  for (let k = 0; k < 120; k++) {
    const x = x0 + rand() * (x1 - x0), y = smTop + 6 + rand() * (smBottom - smTop - 12);
    col += `M${f1(x)} ${f1(y)}q${f1(10 + rand() * 10)} ${f1((rand() - 0.5) * 10)} ${f1(26 + rand() * 12)} ${f1((rand() - 0.5) * 8)}`;
  }
  let gl = "", glLum = "", glCells = "", glNuc = "", glFoam = "", ducts = "", septa = "", mainDucts = "";
  for (const gx of glands) {
    // a lobule of 9–12 acini around a branching duct that crosses the muscularis mucosae into a crypt
    const cy = smTop + 100 + (rand() - 0.5) * 20;
    const acini = [];
    // pack acini in a lobule by rejection sampling
    for (let tries = 0; tries < 900 && acini.length < 44; tries++) {
      const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 78;
      const ax = gx + Math.cos(a) * d * 1.25, ay = cy + Math.sin(a) * d * 0.78, r = 11 + rand() * 5;
      if (acini.every(([bx, by, br]) => Math.hypot(ax - bx, ay - by) > r + br - 3)) acini.push([ax, ay, r]);
    }
    septa += `<ellipse cx="${f1(gx)}" cy="${f1(cy)}" rx="${f1(78 * 1.25 + 14)}" ry="${f1(78 * 0.78 + 12)}" fill="#8A4A52" opacity="0.35"/>`;
    for (const [ax, ay, r] of acini) {
      const A = acinus(ax, ay, r, rand);
      gl += A.fill;
      glLum += A.lumen;
      glCells += A.cells;
      glNuc += A.nuc;
      glFoam += A.foam;
    }
    // a few branching intralobular ducts (hidden mostly behind the packed acini)
    for (let k = 0; k < 4; k++) {
      const a = -Math.PI / 2 + (k - 1.5) * 0.9;
      ducts += `M${f1(gx)} ${f1(cy - 30)}Q${f1(gx + Math.cos(a) * 30)} ${f1(cy)} ${f1(gx + Math.cos(a) * 70)} ${f1(cy + 30 + Math.sin(k) * 10)}`;
    }
    // main duct up through the muscularis mucosae, opening at a crypt base
    const cryptX = items2.filter((it) => it.kind === "c").reduce((best, it) => (Math.abs(it.x - gx) < Math.abs(best - gx) ? it.x : best), gx);
    mainDucts += `M${f1(gx)} ${f1(cy - 62)}C${f1(gx)} ${f1(mmY + 10)} ${f1(cryptX)} ${f1(mmY + 20)} ${f1(cryptX)} ${f1(base + cd - 6)}`;
  }
  const vessels =
    `<path d="M${x0} ${smBottom - 30}C${x0 + 200} ${smBottom - 50} ${x0 + 420} ${smBottom - 18} ${x1} ${smBottom - 40}" fill="none" stroke="#7A1E28" stroke-width="9"/>` +
    `<path d="M${x0} ${smBottom - 30}C${x0 + 200} ${smBottom - 50} ${x0 + 420} ${smBottom - 18} ${x1} ${smBottom - 40}" fill="none" stroke="${H.arteriole}" stroke-width="6"/>` +
    `<path d="M${x0} ${smBottom - 14}C${x0 + 260} ${smBottom - 28} ${x0 + 520} ${smBottom - 2} ${x1} ${smBottom - 20}" fill="none" stroke="#26386E" stroke-width="10"/>` +
    `<path d="M${x0} ${smBottom - 14}C${x0 + 260} ${smBottom - 28} ${x0 + 520} ${smBottom - 2} ${x1} ${smBottom - 20}" fill="none" stroke="${H.venule}" stroke-width="7"/>`;
  // muscularis externa: inner circular (cut across: rows of round profiles), myenteric plexus, outer longitudinal (cut lengthwise)
  const circTop = smBottom, circBot = smBottom + 34, longTop = circBot + 8, longBot = longTop + 20;
  let circ = "";
  for (let y = circTop + 5; y < circBot; y += 7) for (let x = x0 + ((y / 7) % 2) * 4; x < x1; x += 9) circ += `M${f1(x + 3)} ${f1(y)}a3 2.6 0 1 0 -6 0a3 2.6 0 1 0 6 0Z`;
  let longF = "";
  for (let k = 0; k < Math.round((x1 - x0) / 22); k++) longF += ellipsePath(x0 + k * 22 + rand() * 6, longTop + 6 + rand() * 8, 10, 1.3, 0);
  let gang = "";
  for (let x = x0 + 70; x < x1 - 40; x += 150 + rand() * 60) {
    gang += `<ellipse cx="${f1(x)}" cy="${f1(circBot + 4)}" rx="22" ry="7" fill="${H.ganglion}" stroke="${H.neuron}" stroke-width="1"/>`;
    for (let k = -1; k <= 1; k++) gang += `<circle cx="${f1(x + k * 10)}" cy="${f1(circBot + 4)}" r="3" fill="${H.neuron}"/>`;
  }
  return (
    `<rect x="${x0}" y="${smTop}" width="${x1 - x0}" height="${smBottom - smTop}" fill="${H.submucosa}"/>` +
    `<path d="${col}" fill="none" stroke="${H.collagen}" stroke-width="2" opacity="0.65"/>` +
    vessels +
    septa +
    `<path d="${ducts}" fill="none" stroke="${H.brunnerEdge}" stroke-width="4" stroke-linecap="round"/><path d="${ducts}" fill="none" stroke="#DCEAF2" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="${gl}" fill="${H.brunner}" stroke="${H.brunnerEdge}" stroke-width="1"/>` +
    `<path d="${glFoam}" stroke="#A9C0D1" stroke-width="2.6" stroke-linecap="round" opacity="0.8"/>` +
    `<path d="${glCells}" stroke="${H.brunnerEdge}" stroke-width="0.5" opacity="0.35"/>` +
    `<path d="${glNuc}" fill="${H.brunnerNuc}"/>` +
    `<path d="${glLum}" fill="#EEF5FA" stroke="${H.brunnerEdge}" stroke-width="0.5"/>` +
    `<path d="${mainDucts}" fill="none" stroke="${H.brunnerEdge}" stroke-width="5" stroke-linecap="round"/><path d="${mainDucts}" fill="none" stroke="#E6F0F6" stroke-width="2.4" stroke-linecap="round"/>` +
    mu.svg +
    `<rect x="${x0}" y="${circTop}" width="${x1 - x0}" height="${circBot - circTop}" fill="${H.circ}"/><path d="${circ}" fill="${H.circDeep}" opacity="0.75"/>` +
    `<rect x="${x0}" y="${circBot}" width="${x1 - x0}" height="8" fill="#5A2128"/>` +
    gang +
    `<rect x="${x0}" y="${longTop}" width="${x1 - x0}" height="${longBot - longTop}" fill="${H.long}"/><path d="${longF}" fill="${H.muscleNuc}" opacity="0.7"/>` +
    `<rect x="${x0}" y="${longBot}" width="${x1 - x0}" height="4" fill="${H.serosa}"/>`
  );
}

/* ───────────── previews ───────────── */
export function previewVillus() {
  return villusSvg({ cx: 960, base: 980, h: 820, w: 260, seed: 5, id: "pv" });
}
export function previewMucosa() {
  const items = [{ x: 840, kind: "v" }, { x: 965, kind: "c" }, { x: 1090, kind: "v" }, { x: 1215, kind: "c" }, { x: 1340, kind: "v" }, { x: 1465, kind: "c" }, { x: 1590, kind: "v" }];
  return mucosaSvg({ x0: 740, x1: 1728, base: 600, items, vh: 300, cd: 230, vw: 110, cw: 64, bottom: 900, mmY: 868, id: "pm" }).svg;
}
export function previewBrunner() {
  return brunnerWallSvg({});
}
