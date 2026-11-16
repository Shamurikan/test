// Neuromuscular junction: an interactive figure built with the Anima skill kit.
// Run: node figures/neuromuscular-junction/build.mjs [--light]
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BIO_CSS, blobOf, blobSvg } from "../../.claude/skills/anima/kit/blob.mjs";
import { figureSvg, pageHtml, pathOf, plateHtml } from "../../.claude/skills/anima/kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const light = process.argv.includes("--light");
const WIDTH = 960;
const HEIGHT = 660;

// ---------- model: one cycle, phase p in [0,1) ----------
const STEPS = [
  { a: 0.0, b: 0.12, name: "Action potential reaches the terminal", short: "nerve AP arrives" },
  { a: 0.12, b: 0.24, name: "Voltage-gated Ca²⁺ channels open; Ca²⁺ flows in", short: "Ca²⁺ influx" },
  { a: 0.24, b: 0.34, name: "Docked vesicles fuse and release ACh", short: "exocytosis" },
  { a: 0.34, b: 0.46, name: "ACh diffuses across the synaptic cleft", short: "ACh diffusion" },
  { a: 0.46, b: 0.62, name: "ACh binds nicotinic receptors; Na⁺ enters; end-plate potential", short: "AChR open · EPP" },
  { a: 0.62, b: 0.78, name: "AChE hydrolyses ACh; muscle action potential spreads", short: "ACh hydrolysis" },
  { a: 0.78, b: 1.0, name: "Choline reuptake; vesicles refill and re-dock", short: "recycling" },
];
function stepOf(p) {
  for (let i = 0; i < STEPS.length; i++) if (p < STEPS[i].b) return i;
  return STEPS.length - 1;
}
// Representative end-plate membrane potential (mV) for the drawn trace only.
function vm(p, inhibited) {
  const sm = (u) => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  let v = -90;
  v += 35 * sm((p - 0.47) / 0.06); // EPP up to threshold (~ -55)
  if (p > 0.53 && p < 0.66) { // muscle action potential
    const u = (p - 0.53) / 0.13;
    v = u < 0.25 ? -55 + 85 * sm(u / 0.25) : 30 - 128 * sm((u - 0.25) / 0.6);
  }
  if (p >= 0.66) {
    const tail = inhibited ? -70 + -20 * sm((p - 0.9) / 0.1) : -90 - 4 * Math.exp(-(p - 0.66) / 0.03);
    v = p < 0.7 ? -98 + (tail + 98) * sm((p - 0.66) / 0.04) : tail;
  }
  return v;
}
for (const [p, want] of [[0.1, -90], [0.6, null], [0.9, -90]]) {
  const v = vm(p, false);
  if (want !== null && Math.abs(v - want) > 1) throw new Error(`vm(${p}) = ${v}`);
}
if (!(vm(0.85, true) > vm(0.85, false) + 10)) throw new Error("AChE inhibition must prolong depolarisation");
if (stepOf(0.5) !== 4) throw new Error("step lookup");

// ---------- world (flat cross-section, schematic, not to scale) ----------
const FP = { origin: [0, 0], scale: 1 / Math.sqrt(1.6), azimuth: 90, elevation: 0 };
const W = (x, y) => [x, 0, -y];
const f1 = (v) => +v.toFixed(1);
const ringE = (cx, cy, rx, ry, n = 26, phase = 0, wob = 0.03) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + wob * Math.sin(a * 3 + phase) + (wob / 2) * Math.cos(a * 5 - phase);
    return W(cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w);
  });

const PRE = 262;           // presynaptic membrane (bottom of terminal)
const POST = 300;          // postsynaptic sarcolemma (crest level)
const BL = 281;            // basal lamina in the cleft
const AZ = [330, 480, 630]; // active zones, opposite fold openings
const FOLD = { w: 13, bottom: 430 };
const AR = [232, 282, 372, 430, 530, 588, 678, 728]; // AChR clusters on crests
const ACHE = [[257, BL], [401, BL], [559, BL], [703, BL], [330, 352], [480, 352], [630, 352], [190, BL], [770, BL]];
const CHT = [215, 745];
const TERM = { x0: 168, x1: 792, top: 104 };

// terminal outline: domed top, flat bottom
const termPts = (() => {
  const pts = [];
  const cx = (TERM.x0 + TERM.x1) / 2, rx = (TERM.x1 - TERM.x0) / 2, ry = PRE - TERM.top;
  for (let i = 0; i <= 28; i++) {
    const a = Math.PI + (i / 28) * Math.PI, c = Math.cos(a), s = Math.sin(a);
    pts.push(W(cx + Math.sign(c) * Math.abs(c) ** 0.55 * rx, PRE + Math.sign(s) * Math.abs(s) ** 0.75 * ry));
  }
  for (let i = 1; i < 8; i++) pts.push(W(TERM.x1 - (i / 8) * (TERM.x1 - TERM.x0), PRE));
  return pts;
})();
const terminal = blobOf(termPts, FP, { tone: "hi", id: "terminal", highlight: 0.86, shade: 0.94 });
const termPath = blobOf(termPts, FP).d;

// Schwann cell cap (terminal/perisynaptic Schwann cell) over the terminal
const capOuter = [], capInner = [];
{
  const cx = 480, rx = 330, ry = PRE - TERM.top + 26;
  for (let i = 0; i <= 30; i++) {
    const a = Math.PI + 0.06 + (i / 30) * (Math.PI - 0.12), c = Math.cos(a), s = Math.sin(a);
    capOuter.push([cx + Math.sign(c) * Math.abs(c) ** 0.55 * rx, PRE - 6 + Math.sign(s) * Math.abs(s) ** 0.75 * ry]);
    capInner.push([cx + Math.sign(c) * Math.abs(c) ** 0.55 * (rx - 16), PRE - 6 + Math.sign(s) * Math.abs(s) ** 0.75 * (ry - 16)]);
  }
}
const capPath = pathOf([...capOuter, ...capInner.slice().reverse()], true);

// sarcolemma with junctional folds
const sarcPts = (() => {
  const pts = [[40, POST]];
  for (const fx of AZ) {
    pts.push([fx - FOLD.w - 8, POST], [fx - FOLD.w, POST + 6]);
    pts.push([fx - FOLD.w + 1, FOLD.bottom - 14]);
    for (let k = 0; k <= 8; k++) { const a = Math.PI - (k / 8) * Math.PI; pts.push([fx + Math.cos(a) * (FOLD.w - 1), FOLD.bottom - 14 + Math.sin(a) * 14]); }
    pts.push([fx + FOLD.w, POST + 6], [fx + FOLD.w + 8, POST]);
  }
  pts.push([920, POST]);
  return pts;
})();
const sarcLine = pathOf(sarcPts);
const muscleFill = `${pathOf(sarcPts)}L920 640L40 640Z`;
const cleftFill = `M40 ${PRE}H920V${POST}H40Z`;
const blPath = (() => {
  let d = `M40 ${BL}`;
  for (const fx of AZ) d += `H${fx - 4}V${FOLD.bottom - 18}H${fx + 4}V${BL}`;
  return d + "H920";
})();

const vesicleBlob = (i) => blobOf(ringE(0, 0, 13, 13, 22, i, 0.02), FP, { tone: "lit", highlight: 0.62, shade: 0.9 });
const RESERVE = [[262, 196], [300, 150], [356, 205], [398, 160], [440, 210], [520, 206], [560, 152], [604, 204], [652, 160], [700, 200], [430, 132], [512, 128], [240, 236], [722, 236], [375, 238], [585, 238]];
const DOCK = AZ.map((x) => [x, PRE - 15]);
const mitoBlob = (cx, cy, rx, ry, i) => blobOf(ringE(cx, cy, rx, ry, 30, i, 0.04), FP, { tone: "mid", highlight: 0.8, shade: 0.92 });
const MITO = [[338, 150, 44, 19], [636, 148, 40, 18]];
const nucBlob = (cx, cy, i) => blobOf(ringE(cx, cy, 52, 19, 30, i, 0.03), FP, { tone: "mid", highlight: 0.75, shade: 0.92 });

const dotAt = (x, y) => `<circle class="nm-dot" cx="${x}" cy="${y}" r="1.7"/>`;
const label = (text, [tx, ty], [px, py], anchor = "start", cls = "") => {
  const sx = anchor === "end" ? tx + 4 : anchor === "start" ? tx - 4 : tx;
  const sy = anchor === "middle" ? (py < ty ? ty - 13 : ty + 4) : ty - 4;
  return `<path class="nm-leader" d="${pathOf([[sx, sy], [px, py]])}"/>${dotAt(px, py)}<text class="nm-label ${cls}" x="${tx}" y="${ty}" text-anchor="${anchor}">${text}</text>`;
};

// AChR: side view of the pentamer, three visible subunits, vestibule, pore, rapsyn underneath
const achr = (x, i) => {
  const sub = (dx, h) => `<rect class="nm-sub" x="${f1(x + dx - 4)}" y="${POST - 14}" width="8" height="${h}" rx="4"/>`;
  return `<g class="nm-achr" id="achr-${i}">${sub(-8, 30)}${sub(8, 30)}${sub(0, 33)}<path class="nm-pore" d="M${x} ${POST - 11}V${POST + 14}"/>`
    + `<circle class="nm-site" cx="${x - 4}" cy="${POST - 8}" r="1.6"/><circle class="nm-site" cx="${x + 4}" cy="${POST - 8}" r="1.6"/>`
    + `<ellipse class="nm-rapsyn" cx="${x}" cy="${POST + 22}" rx="8" ry="4"/></g>`;
};
const ache = ([x, y], i) => `<g class="nm-ache" id="ache-${i}" transform="translate(${x} ${y})"><path class="nm-colq" d="M0 0V-5"/>${[[-3.4, -8.5], [3.4, -8.5], [-3.4, -14.5], [3.4, -14.5]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3.3"/>`).join("")}</g>`;
const ACHE_DRAW = ACHE.map(([x, y]) => (y === BL ? [x, y] : [x, y]));
const nav = (fx, side) => {
  const x = fx + side * (FOLD.w - 1);
  return `<rect class="nm-nav" x="${x - 3.5}" y="${FOLD.bottom - 44}" width="7" height="16" rx="3"/><rect class="nm-nav" x="${x - 3.5}" y="${FOLD.bottom - 70}" width="7" height="16" rx="3"/>`;
};
const cav = (x) => `<rect class="nm-cav" x="${x - 4}" y="${PRE - 9}" width="8" height="17" rx="3.5"/><path class="nm-cav-pore" d="M${x} ${PRE - 7}V${PRE + 6}"/>`;
const axonPts = [[30, 62], [110, 64], [172, 78], [222, 108], [262, 152]];

const lipidStrip = (y, x0, x1) => {
  let out = "";
  for (let x = x0 + 4; x < x1; x += 8) out += `<circle class="nm-head" cx="${x}" cy="${y}" r="1.7"/>`;
  return out;
};


const body = [
  `<ellipse class="nm-halo" cx="480" cy="640" rx="440" ry="14"/>`,
  // muscle fibre
  `<g class="hot" tabindex="0" data-info="Skeletal muscle fibre (postsynaptic). Its membrane at the junction, the motor end plate, is folded into junctional folds that run down from the cleft. Myofibrils with their repeating sarcomeres fill the fibre; several fibre nuclei cluster beneath the end plate (subsynaptic nuclei) and specialise in making synaptic proteins.">
<path class="nm-muscle" d="${muscleFill}"/>
${[0, 1, 2].map((r) => { const y = 520 + r * 30; let s = `<rect class="nm-myo" x="50" y="${y}" width="860" height="22" rx="10"/>`; for (let x = 70; x < 900; x += 64) s += `<rect class="nm-aband" x="${x + 14}" y="${y + 3}" width="34" height="16" rx="3"/><path class="nm-z" d="M${x} ${y + 1}V${y + 21}"/>`; return s; }).join("")}
${blobSvg(nucBlob(250, 470, 1))}${blobSvg(nucBlob(710, 474, 2))}${blobSvg(nucBlob(480, 478, 3))}
</g>`,
  `<g class="hot" tabindex="0" id="endplate" data-info="Motor end plate: the postsynaptic sarcolemma. Nicotinic ACh receptors pack the crests and upper flanks of the junctional folds at about 10,000 per µm² (Slater 2017), held by the scaffold protein rapsyn. Voltage-gated Na⁺ channels (Nav1.4) concentrate in the depths of the folds, where they help the end-plate potential trigger a muscle action potential.">
<path class="nm-sarc-glow" id="sarc-glow" d="${sarcLine}"/><path class="nm-sarc" d="${sarcLine}"/>${AZ.map((fx) => nav(fx, -1) + nav(fx, 1)).join("")}</g>`,
  // cleft and basal lamina
  `<g class="hot" tabindex="0" data-info="Synaptic cleft, about 50 nm wide at the primary cleft (drawn much wider here). It extends into each junctional fold as a secondary cleft. A basal lamina runs through it and holds acetylcholinesterase.">
<path class="nm-cleft" d="${cleftFill}"/></g>`,
  `<path class="nm-bl" d="${blPath}"/>`,
  // presynaptic terminal
  `<g class="hot" tabindex="0" data-info="Motor neuron terminal (bouton). It is the unmyelinated end of a myelinated α-motor axon. It is packed with synaptic vesicles and mitochondria. ACh is made here from choline and acetyl-CoA by choline acetyltransferase, then loaded into vesicles by the vesicular ACh transporter (VAChT).">
${blobSvg(terminal)}<path class="nm-term-glow" id="term-glow" d="${termPath}"/>
${MITO.map(([x, y, rx, ry], i) => `${blobSvg(mitoBlob(x, y, rx, ry, i))}<path class="nm-cristae" d="${Array.from({ length: 6 }, (_, k) => { const cx = x - rx * 0.62 + (k * rx * 1.24) / 5; return `M${f1(cx)} ${f1(y - ry * 0.55)}V${f1(y + ry * 0.55)}`; }).join("")}"/>`).join("")}
</g>`,
  `<g class="hot" tabindex="0" data-info="Terminal (perisynaptic) Schwann cell. It caps the nerve terminal but does not cover the release face. It maintains and repairs the synapse.">
<path class="nm-schwann" d="${capPath}"/></g>`,
  `<g class="hot" tabindex="0" data-info="Myelinated α-motor neuron axon. Myelin (drawn as sleeves split by nodes of Ranvier) speeds conduction; the myelin stops where the axon enters the terminal, and the last stretch is bare.">
<path class="nm-axon-edge" d="${pathOf(axonPts)}"/><path class="nm-myelin" d="${pathOf(axonPts)}"/><path class="nm-axon" d="${pathOf(axonPts)}"/></g>`,
  `<path id="ap-path" class="nm-ap-path" d="${pathOf(axonPts)}"/>`,
  `<circle id="ap-dot" class="nm-ap" r="6"/>`,
  // vesicles
  ...RESERVE.map(([x, y], i) => `<g class="hot nm-ves" tabindex="0" data-info="Synaptic vesicle, about 50 nm across. Each holds roughly 5,000–10,000 ACh molecules, one quantum (Wood &amp; Slater 2001). Release of one quantum gives a miniature end-plate potential of about 0.5 mV. Most vesicles here form a reserve pool." transform="translate(${x} ${y})">${blobSvg(vesicleBlob(i))}${[[-5, -3], [4, -5], [-1, 3], [6, 3], [-6, 5]].map(([a, b]) => `<circle class="nm-vdot" cx="${a}" cy="${b}" r="1.7"/>`).join("")}</g>`),
  ...DOCK.map(([x, y], i) => `<g class="hot nm-ves nm-dock" id="dock-${i}" tabindex="0" data-info="Docked vesicle at an active zone, the dense bar where Ca²⁺ channels cluster. When Ca²⁺ enters, the SNARE proteins (synaptobrevin, syntaxin, SNAP-25), triggered by synaptotagmin, fuse the vesicle with the membrane and ACh spills into the cleft." transform="translate(${x} ${y})">${blobSvg(vesicleBlob(i + 20))}${[[-5, -3], [4, -5], [-1, 3], [6, 3], [-6, 5]].map(([a, b]) => `<circle class="nm-vdot" cx="${a}" cy="${b}" r="1.7"/>`).join("")}</g>`),
  `<g class="hot" tabindex="0" data-info="Active zones: release sites lined up opposite the openings of the junctional folds. Each has a dense bar of scaffold proteins, docked vesicles and P/Q-type (Cav2.1) voltage-gated Ca²⁺ channels.">
${AZ.map((x) => `<path class="nm-bar" d="M${x - 9} ${PRE}L${x - 5} ${PRE - 5}H${x + 5}L${x + 9} ${PRE}Z"/>${cav(x - 30)}${cav(x + 30)}`).join("")}</g>`,
  `<g class="hot" tabindex="0" data-info="High-affinity choline transporter (CHT1). About half of the choline freed by acetylcholinesterase is taken back into the terminal and reused to make new ACh. This step limits the rate of synthesis.">
${CHT.map((x) => `<rect class="nm-cht" x="${x - 5}" y="${PRE - 10}" width="10" height="19" rx="4"/>`).join("")}</g>`,
  `<path class="nm-pre-line" d="M${TERM.x0} ${PRE}H${TERM.x1}"/>`,
  `<g class="nm-lipid">${lipidStrip(PRE - 1, TERM.x0 + 30, TERM.x1 - 30)}</g>`,
  // receptors and enzyme
  `<g class="hot" tabindex="0" data-info="Nicotinic ACh receptor (muscle type): a ligand-gated channel of five subunits (two α, β, δ and ε in adults; γ replaces ε in fetal muscle). Three subunits are visible in this side view. It opens only when two ACh molecules bind, one at each α–δ and α–ε interface (bright dots). The open pore passes Na⁺ in and K⁺ out, with net inward current.">${AR.map(achr).join("")}</g>`,
  `<g class="hot" tabindex="0" data-info="Acetylcholinesterase (AChE): a tetramer anchored to the basal lamina by its collagen tail (ColQ). It is one of the fastest enzymes known, with turnover on the order of 10⁴ molecules per second (Quinn 1987). It splits ACh into choline and acetate within about a millisecond, ending the signal.">${ACHE_DRAW.map(ache).join("")}</g>`,
  // particle layers
  `<g id="ca"></g><g id="na"></g><g id="ach"></g><g id="chol"></g>`,
  // labels
  label("myelinated motor axon", [50, 28], [70, 50], "start"),
  label("Schwann cell", [858, 92], [790, 128], "start"),
  label("mitochondrion", [180, 120], [296, 146], "end"),
  label("synaptic vesicles", [858, 168], [702, 196], "start"),
  label("active zone", [858, 236], [662, PRE - 4], "start"),
  label("Ca²⁺ channel", [102, 230], [298, PRE - 6], "end"),
  label("choline transporter", [142, 258], [210, PRE - 2], "end"),
  label("synaptic cleft", [102, 284], [150, 280], "end"),
  label("basal lamina", [858, 272], [840, BL], "start"),
  label("AChE", [858, 300], [778, BL - 12], "start"),
  label("nicotinic AChR", [102, 330], [228, POST - 10], "end"),
  label("motor end plate", [102, 360], [170, POST + 2], "end"),
  label("junctional fold", [858, 350], [646, 380], "start"),
  label("Na⁺ channels", [858, 400], [644, FOLD.bottom - 36], "start"),
  label("subsynaptic nucleus", [142, 470], [198, 470], "end"),
  label("myofibril (sarcomeres)", [858, 616], [860, 591], "end"),
  `<text class="nm-label nm-name" x="480" y="46" text-anchor="middle">motor neuron terminal</text>`,
  `<text class="nm-label nm-name" x="480" y="508" text-anchor="middle">skeletal muscle fibre</text>`,
  `<text id="step-tag" class="nm-step" x="480" y="72" text-anchor="middle"></text>`,
].join("");

const svg = figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: "Schematic cross-section of a vertebrate neuromuscular junction. A myelinated motor axon ends in a terminal full of synaptic vesicles and mitochondria and capped by a Schwann cell. Across the synaptic cleft, with its basal lamina and acetylcholinesterase, lies the motor end plate of a skeletal muscle fibre. The end plate is folded into junctional folds, with nicotinic acetylcholine receptors on the crests and sodium channels in the depths. An animation steps through acetylcholine release, binding, hydrolysis and recycling.",
  body,
  className: "nm-fig",
});

const framed = plateHtml({
  fig: "Fig 1",
  title: "Neuromuscular junction",
  hint: "hover or focus a part · space: pause · ←/→: step",
  readout: "1/7 · nerve AP arrives",
  caption: "Schematic, not to scale: the cleft (~50 nm) and the vesicles (~50 nm) are greatly enlarged against the terminal (a few µm). The geometry follows a mammalian twitch-muscle junction. The molecules are cartoons, and the particle counts are illustrative.",
  body: `<div class="nm-svg">${svg}</div>`,
});

const trace = `<svg class="nm-trace" viewBox="0 0 340 150" role="img" aria-label="Representative end-plate membrane potential over one cycle">
<path class="nm-axis" d="M44 14V128H330"/>
${[[30, "+30"], [-55, "−55"], [-90, "−90"]].map(([v, t]) => { const y = 128 - ((v + 100) / 140) * 114; return `<path class="nm-grid" d="M44 ${f1(y)}H330"/><text class="nm-tick" x="38" y="${f1(y + 4)}" text-anchor="end">${t}</text>`; }).join("")}
<text class="nm-tick" x="187" y="146" text-anchor="middle">one cycle (time stretched)</text>
<text class="nm-tick" x="330" y="10" text-anchor="end">mV, representative</text>
<path id="trace-ghost" class="nm-trace-ghost"/><path id="trace-line" class="nm-trace-line"/><circle id="trace-dot" class="nm-trace-dot" r="3.5"/>
<text class="nm-tick nm-thr" x="50" y="${f1(128 - (45 / 140) * 114 - 4)}">threshold</text>
</svg>`;

const controls = `
<div class="nm-controls">
  <button id="prev" type="button" aria-label="Previous step">← step</button>
  <button id="next" type="button" aria-label="Next step">step →</button>
  <label class="nm-switch"><input id="inh" type="checkbox"> <span>AChE inhibited (generic)</span></label>
  <button id="pause" type="button" aria-pressed="false">Pause motion</button>
</div>
<div class="nm-panel">
  <ol id="steps" class="nm-steps">${STEPS.map((s, i) => `<li data-i="${i}"><button type="button">${s.name}</button></li>`).join("")}</ol>
  ${trace}
</div>
<p id="status" class="nm-status" aria-live="polite"></p>
<p id="info" class="nm-info" aria-live="polite">Hover over or focus a labelled part for a short explanation. Click a step to jump to it.</p>`;

const sources = `<footer class="bio-sources">
<h2>What the figure shows, and the evidence</h2>
<ul>
<li><strong>Structure.</strong> Active zones sit opposite the openings of the junctional folds. AChRs pack the fold crests at about 10,000 per µm². Folds raise the postsynaptic area 2–8× depending on species, and they are deepest in humans (<a href="https://doi.org/10.3390/ijms18102183">Slater 2017, Int J Mol Sci 18:2183</a>, open access). Nanoscale AChR stripes line up with the fold openings and the active zones (<a href="https://www.eneuro.org/content/4/4/eneuro.0232-17.2017">York &amp; Zheng 2017, eNeuro</a>, open access).</li>
<li><strong>Quanta, potentials and safety factor.</strong> A single vesicle (quantum) gives a miniature end-plate potential of about 0.5 mV. A nerve impulse releases tens to hundreds of quanta, enough to bring the end plate from rest (about −80 to −90 mV) past threshold. Release in normal adult mammals exceeds the amount needed by a factor of about 3–5 (the safety factor). Voltage-gated Na⁺ channels in the fold depths add to this margin (<a href="https://doi.org/10.1016/S0301-0082(00)00055-1">Wood &amp; Slater 2001, Prog Neurobiol 64:393–429</a>; <a href="https://doi.org/10.1113/jphysiol.1997.sp022007">Wood &amp; Slater 1997, J Physiol 500:165–176</a>).</li>
<li><strong>Release machinery.</strong> Ca²⁺ entry through P/Q-type channels at active zones triggers SNARE-mediated, synaptotagmin-dependent exocytosis. This is standard textbook material (Purves et al., <em>Neuroscience</em>, chapters on synaptic transmission; Kandel et al., <em>Principles of Neural Science</em>).</li>
<li><strong>Receptor and enzyme.</strong> The muscle nicotinic AChR is an α₂βδε pentamer (γ in fetal muscle) that needs two ACh molecules to open. AChE is anchored by ColQ in the basal lamina and works close to the diffusion limit (Quinn 1987, <em>Chem Rev</em> 87:955–979).</li>
<li><strong>The trace.</strong> The membrane-potential curve is representative and not a recording. Its time axis is stretched; the real end-plate potential lasts a few milliseconds. The "AChE inhibited" toggle is a generic teaching switch and names no drug or dose. With the enzyme blocked, ACh stays in the cleft longer, binds repeatedly and prolongs depolarisation.</li>
</ul>
<p><strong>Simplified.</strong> Left out: perisynaptic Schwann cell detail, the Ca²⁺ buffering and K⁺ channels of the terminal, endocytosis pathways, MuSK, agrin and Lrp4 signalling, the T-tubules and sarcoplasmic reticulum, and excitation–contraction coupling. Particle numbers and timing are illustrative.</p>
<p>For education only. This figure is not medical advice.</p>
</footer>`;

const script = `
const STEPS = ${JSON.stringify(STEPS)};
const stepOf = ${stepOf.toString()};
const vm = ${vm.toString()};
const D = ${JSON.stringify({ AZ, AR, ACHE, CHT, PRE, POST, BL, axon: axonPts, dock: DOCK, fold: FOLD })};
const NS = "http://www.w3.org/2000/svg";
const svg = document.querySelector(".nm-fig");
const $ = (id) => document.getElementById(id);
const readout = document.querySelector("[data-readout]");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const T = 15000;
const clamp = (v) => Math.max(0, Math.min(1, v));
const ease = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const seg = (p, a, b) => clamp((p - a) / (b - a));
const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const mk = (name, attrs, parent) => { const el = document.createElementNS(NS, name); for (const k in attrs) el.setAttribute(k, attrs[k]); parent.appendChild(el); return el; };
const put = (el, p, o) => { el.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")"); el.style.opacity = o.toFixed(2); };
const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5; return s - Math.floor(s); };

let inh = false, playing = !reduce.matches, visible = true, last = 0, frame = 0;
let sim = reduce.matches ? 0.55 * T : 0;

// along a polyline
const apPath = $("ap-path"), apLen = apPath.getTotalLength();

// particles
const caEls = [], achEls = [], naEls = [], cholEls = [];
D.AZ.forEach((x, a) => { for (const side of [-1, 1]) for (let k = 0; k < 3; k++) { const g = mk("g", { class: "nm-p" }, $("ca")); mk("circle", { class: "nm-ca", r: 3 }, g); caEls.push({ g, x: x + side * 30, k, a }); } });
const achrSites = D.AR.flatMap((x, r) => [[x - 4, D.POST - 8, r], [x + 4, D.POST - 8, r]]);
D.AZ.forEach((x, a) => {
  const near = achrSites.filter((s) => Math.abs(s[0] - x) < 120).sort((s, t) => Math.abs(s[0] - x) - Math.abs(t[0] - x)).slice(0, 8);
  for (let j = 0; j < 11; j++) {
    const g = mk("g", { class: "nm-p" }, $("ach"));
    mk("circle", { class: "nm-ach-halo", r: 6 }, g); mk("circle", { class: "nm-ach", r: 3.4 }, g);
    const site = j < near.length ? near[j] : null;
    const tgt = site ? [site[0], site[1]] : [x + (hash(j + a * 11) - 0.5) * 8, 344];
    const ae = D.ACHE.reduce((b, e) => (Math.hypot(e[0] - tgt[0], e[1] - tgt[1]) < Math.hypot(b[0] - tgt[0], b[1] - tgt[1]) ? e : b));
    const cht = D.CHT[x < 480 ? 0 : x > 480 ? 1 : (j % 2)];
    achEls.push({ g, x, j, a, site, tgt, ae: [ae[0], ae[1] - 12], cht, id: a * 11 + j });
    const c = mk("g", { class: "nm-p" }, $("chol")); mk("circle", { class: "nm-chol", r: 2.8 }, c); const ac = mk("circle", { class: "nm-acet", r: 1.8 }, $("chol"));
    cholEls.push({ c, ac });
  }
});
D.AR.forEach((x, r) => { for (let k = 0; k < 3; k++) { const g = mk("g", { class: "nm-p" }, $("na")); mk("circle", { class: "nm-na", r: 2.6 }, g); naEls.push({ g, x, r, k }); } });
const achrEls = D.AR.map((_, r) => $("achr-" + r));
const acheEls = D.ACHE.map((_, i) => $("ache-" + i));
const dockEls = D.dock.map((_, i) => $("dock-" + i));
const apDot = $("ap-dot"), termGlow = $("term-glow"), sarcGlow = $("sarc-glow"), stepTag = $("step-tag");
const stepItems = [...document.querySelectorAll("#steps li")];
const traceLine = $("trace-line"), traceGhost = $("trace-ghost"), traceDot = $("trace-dot");
const TX = (p) => 44 + p * 286, TY = (v) => 128 - ((v + 100) / 140) * 114;
function traceD(flag) { let d = ""; for (let i = 0; i <= 200; i++) { const p = i / 200; d += (i ? "L" : "M") + TX(p).toFixed(1) + " " + TY(vm(p, flag)).toFixed(1); } return d; }
function setTrace() { traceLine.setAttribute("d", traceD(inh)); traceGhost.setAttribute("d", inh ? traceD(false) : ""); }

let lastStep = -1;
function draw() {
  const p = (sim % T) / T;
  const st = stepOf(p);
  // 1 nerve AP
  const u0 = seg(p, 0, 0.09);
  const pt = apPath.getPointAtLength(apLen * ease(u0));
  apDot.setAttribute("cx", pt.x.toFixed(1)); apDot.setAttribute("cy", pt.y.toFixed(1));
  apDot.style.opacity = (u0 > 0 && u0 < 1 ? 1 : 0).toFixed(2);
  termGlow.style.opacity = (Math.sin(Math.PI * seg(p, 0.07, 0.22)) * 0.9).toFixed(2);
  // 2 Ca2+
  caEls.forEach((c) => {
    const a = 0.12 + c.k * 0.025 + c.a * 0.006, u = seg(p, a, a + 0.07);
    const from = [c.x + (c.k - 1) * 5, D.PRE + 14], to = [c.x + (c.k - 1) * 9, D.PRE - 34 - c.k * 4];
    const o = p < a ? 0 : u < 1 ? Math.min(1, u * 6) : Math.max(0, 1 - seg(p, a + 0.07, 0.36));
    put(c.g, lerp(from, to, ease(u)), o);
  });
  // 3 exocytosis
  dockEls.forEach((v, i) => {
    const [x, y] = D.dock[i];
    let dy = 0, sx = 1, sy = 1, o = 1;
    if (p >= 0.24 && p < 0.34) { const u = seg(p, 0.24, 0.34); dy = 9 * ease(u); sx = 1 + 0.5 * ease(u); sy = 1 - 0.75 * ease(u); o = 1 - ease(seg(p, 0.29, 0.34)); }
    else if (p >= 0.34 && p < 0.82) o = 0;
    else if (p >= 0.82) { const u = ease(seg(p, 0.82, 0.97)); dy = -40 * (1 - u); o = u; }
    v.setAttribute("transform", "translate(" + x + " " + (y + dy).toFixed(1) + ") scale(" + sx.toFixed(3) + " " + sy.toFixed(3) + ")");
    v.style.opacity = o.toFixed(2);
  });
  // 4-6 ACh
  let bound = new Array(D.AR.length).fill(0);
  achEls.forEach((m, n) => {
    const r0 = 0.27 + m.j * 0.004;
    const ch = cholEls[n];
    const wob = (s) => [Math.sin(sim / 260 + m.id) * s, Math.cos(sim / 310 + m.id * 1.7) * s];
    let pos = [m.x, D.PRE], o = 0, cp = null, co = 0, ao = 0, apos = null;
    const unbind = inh ? 0.9 : 0.62;
    if (p >= r0 && p < 0.47) {
      const u = seg(p, r0, 0.47), mid = [m.x + (m.tgt[0] - m.x) * 0.5 + (hash(m.id) - 0.5) * 30, D.PRE + 12];
      const a = lerp([m.x, D.PRE + 2], mid, ease(Math.min(1, u * 2))), b = lerp(mid, m.tgt, ease(Math.max(0, u * 2 - 1)));
      pos = u < 0.5 ? a : b; const w = wob(3 * (1 - u)); pos = [pos[0] + w[0], pos[1] + w[1]]; o = Math.min(1, u * 5);
    } else if (p >= 0.47 && p < unbind) {
      if (m.site) {
        if (inh) { const w = wob(4 * Math.sin(Math.PI * seg(p, 0.62, 0.9))); pos = [m.tgt[0] + w[0], m.tgt[1] - Math.abs(w[1])]; }
        else pos = m.tgt;
        o = 1; bound[m.site[2]]++;
      } else if (!inh) { const u = seg(p, 0.47, 0.6); pos = lerp(m.tgt, m.ae, ease(u)); o = 1; }
      else { const w = wob(5); pos = [m.tgt[0] + w[0], m.tgt[1] + w[1]]; o = 1; }
    } else if (p >= unbind) {
      if (inh) { const u = seg(p, 0.9, 1); pos = [m.tgt[0], m.tgt[1] + 8 * u]; o = 1 - u; }
      else {
        const u = seg(p, 0.62, 0.68);
        pos = lerp(m.site ? m.tgt : m.ae, m.ae, ease(u)); o = p < 0.7 ? 1 : 0;
        if (p >= 0.68) {
          const v = seg(p, 0.68, 0.74), w = seg(p, 0.8, 0.95);
          apos = [m.ae[0] - 8 * v, m.ae[1] - 6 * v]; ao = p < 0.74 ? Math.min(1, v * 4) : 1 - seg(p, 0.74, 0.8);
          cp = w > 0 ? lerp([m.ae[0] + 7, m.ae[1] - 4], [m.cht + (m.j % 3 - 1) * 3, D.PRE - 14], ease(w)) : [m.ae[0] + 7 * Math.min(1, v * 2), m.ae[1] - 4 * Math.min(1, v * 2)];
          co = p < 0.95 ? Math.min(1, v * 4) : 1 - seg(p, 0.95, 1);
        }
      }
    }
    put(m.g, pos, o);
    if (cp) put(ch.c, cp, co); else ch.c.style.opacity = 0;
    if (apos) { ch.ac.setAttribute("cx", apos[0].toFixed(1)); ch.ac.setAttribute("cy", apos[1].toFixed(1)); ch.ac.style.opacity = ao.toFixed(2); } else ch.ac.style.opacity = 0;
  });
  // receptors open when doubly liganded
  const open = D.AR.map((_, r) => bound[r] >= 2 ? 1 : 0);
  achrEls.forEach((e, r) => e.style.setProperty("--on", open[r]));
  naEls.forEach((c) => {
    if (!open[c.r]) { c.g.style.opacity = 0; return; }
    const u = ((sim / 900 + c.k / 3 + c.r * 0.13) % 1);
    put(c.g, [c.x + Math.sin(u * 6 + c.k) * 1.2, D.POST - 22 + 54 * u], Math.sin(Math.PI * u));
  });
  // AChE activity
  const hyd = inh ? 0 : Math.sin(Math.PI * seg(p, 0.58, 0.76));
  acheEls.forEach((e) => e.style.setProperty("--on", hyd.toFixed(2)));
  // muscle AP in fold depths and along sarcolemma
  sarcGlow.style.opacity = (Math.sin(Math.PI * seg(p, 0.53, 0.68)) * 0.95).toFixed(2);
  // trace
  traceDot.setAttribute("cx", TX(p).toFixed(1)); traceDot.setAttribute("cy", TY(vm(p, inh)).toFixed(1));
  if (st !== lastStep) {
    lastStep = st;
    const txt = (st + 1) + "/7 · " + STEPS[st].short;
    readout.textContent = txt; stepTag.textContent = STEPS[st].name;
    stepItems.forEach((li, i) => li.classList.toggle("is-on", i === st));
    $("status").textContent = "Step " + (st + 1) + " of 7: " + STEPS[st].name + "." + (inh ? " Acetylcholinesterase is inhibited." : "");
  }
}

function tick(now) {
  frame = 0;
  if (!playing || !visible) return;
  const dt = Math.min(64, now - (last || now));
  last = now; sim += dt; draw();
  frame = requestAnimationFrame(tick);
}
function start() { if (playing && visible && !frame) { last = 0; frame = requestAnimationFrame(tick); } }
function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; }
const pauseBtn = $("pause");
function setPlaying(v) { playing = v; pauseBtn.textContent = v ? "Pause motion" : "Play motion"; pauseBtn.setAttribute("aria-pressed", String(!v)); if (v) start(); else { stop(); draw(); } }
function goStep(i) {
  i = (i + 7) % 7; const s = STEPS[i];
  sim = Math.floor(sim / T) * T + (s.a + (s.b - s.a) * 0.7) * T;
  lastStep = -1; setPlaying(false);
}
pauseBtn.addEventListener("click", () => setPlaying(!playing));
$("next").addEventListener("click", () => goStep(stepOf((sim % T) / T) + 1));
$("prev").addEventListener("click", () => goStep(stepOf((sim % T) / T) - 1));
stepItems.forEach((li, i) => li.querySelector("button").addEventListener("click", () => goStep(i)));
$("inh").addEventListener("change", (e) => { inh = e.target.checked; setTrace(); lastStep = -1; draw(); });
document.addEventListener("keydown", (e) => {
  if (e.target.closest("input, textarea, select")) return;
  if (e.code === "Space" && !e.target.closest("button, a")) { e.preventDefault(); setPlaying(!playing); }
  if (e.key === "ArrowRight") { e.preventDefault(); goStep(stepOf((sim % T) / T) + 1); }
  if (e.key === "ArrowLeft") { e.preventDefault(); goStep(stepOf((sim % T) / T) - 1); }
});
reduce.addEventListener("change", () => setPlaying(!reduce.matches));
const info = $("info"), idle = info.textContent;
svg.querySelectorAll(".hot").forEach((el) => {
  const on = () => { info.textContent = el.dataset.info; el.classList.add("is-hot"); };
  const off = () => { info.textContent = idle; el.classList.remove("is-hot"); };
  el.addEventListener("pointerenter", on); el.addEventListener("pointerleave", off);
  el.addEventListener("focus", on); el.addEventListener("blur", off);
});
new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); }).observe(svg);
setTrace();
if (reduce.matches) { pauseBtn.textContent = "Play motion"; pauseBtn.setAttribute("aria-pressed", "true"); }
draw(); start();
`;

const style = `
.nm-svg{padding:0}
.nm-fig{display:block;width:100%;height:auto}
.nm-fig .bio-blob-base{fill:var(--anatomy-shade-2)}
.nm-halo{fill:var(--anatomy-halo);opacity:var(--anatomy-halo-opacity);filter:blur(12px)}
.nm-muscle{fill:var(--anatomy-shade-3);stroke:none}
.nm-myo{fill:var(--anatomy-shade-2);stroke:var(--anatomy-lo);stroke-width:.7}
.nm-aband{fill:var(--anatomy-shade-1)}
.nm-z{stroke:var(--anatomy-mid);stroke-width:1}
.nm-sarc{fill:none;stroke:var(--anatomy-hi);stroke-width:2.2;stroke-linejoin:round}
.nm-sarc-glow{fill:none;stroke:var(--anatomy-green);stroke-width:7;opacity:0;filter:blur(2px)}
.nm-cleft{fill:var(--anatomy-shade-0);opacity:.55}
.nm-bl{fill:none;stroke:var(--anatomy-lo);stroke-width:1.2;stroke-dasharray:1 3;stroke-linecap:round}
.nm-term-glow{fill:none;stroke:var(--anatomy-lit);stroke-width:4;opacity:0;filter:blur(1.5px)}
.nm-axon-edge{fill:none;stroke:var(--anatomy-mid);stroke-width:13;stroke-linecap:round}
.nm-axon{fill:none;stroke:var(--anatomy-shade-2);stroke-width:10;stroke-linecap:round}
.nm-myelin{fill:none;stroke:var(--anatomy-shade-1);stroke-width:26;stroke-dasharray:62 5 58 5 40 400;filter:drop-shadow(0 0 .6px var(--anatomy-mid))}
.nm-ap-path{fill:none;stroke:none}
.nm-ap{fill:var(--anatomy-lit);filter:drop-shadow(0 0 6px var(--anatomy-lit));opacity:0}
.nm-schwann{fill:var(--anatomy-shade-1);stroke:var(--anatomy-mid);stroke-width:.8;opacity:.9}
.nm-cristae{fill:none;stroke:var(--anatomy-lo);stroke-width:1;stroke-linecap:round}
.nm-ves .bio-blob-base{fill:var(--anatomy-shade-3)}
.nm-vdot{fill:var(--anatomy-lit)}
.nm-bar{fill:var(--anatomy-hi)}
.nm-cav{fill:var(--anatomy-paper);stroke:var(--anatomy-blue);stroke-width:1.4}
.nm-cav-pore{stroke:var(--anatomy-blue);stroke-width:1}
.nm-cht{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:1.2}
.nm-pre-line{fill:none;stroke:var(--anatomy-hi);stroke-width:1.6}
.nm-head{fill:var(--anatomy-mid)}
.nm-sub{fill:var(--anatomy-shade-1);stroke:var(--anatomy-hi);stroke-width:1}
.nm-achr{--on:0}
.nm-achr .nm-sub{stroke:color-mix(in srgb,var(--anatomy-green) calc(var(--on) * 100%),var(--anatomy-hi))}
.nm-achr{filter:drop-shadow(0 0 calc(var(--on) * 4px) var(--anatomy-green))}
.nm-pore{stroke:var(--anatomy-green);stroke-width:2.2;opacity:calc(var(--on));stroke-linecap:round}
.nm-site{fill:var(--anatomy-lit)}
.nm-rapsyn{fill:var(--anatomy-shade-1);stroke:var(--anatomy-mid);stroke-width:.8}
.nm-nav{fill:var(--anatomy-paper);stroke:var(--anatomy-green);stroke-width:1.2}
.nm-ache{--on:0}
.nm-ache circle{fill:var(--anatomy-paper);stroke:var(--anatomy-red);stroke-width:1.2}
.nm-ache{filter:drop-shadow(0 0 calc(var(--on) * 5px) var(--anatomy-red))}
.nm-colq{stroke:var(--anatomy-red);stroke-width:1.2}
.nm-p{pointer-events:none}
.nm-ca{fill:var(--anatomy-blue)}
.nm-na{fill:var(--anatomy-green)}
.nm-ach{fill:var(--anatomy-lit);stroke:var(--anatomy-paper);stroke-width:.8}
.nm-ach-halo{fill:var(--anatomy-lit);opacity:.28}
.nm-chol{fill:var(--anatomy-paper);stroke:var(--anatomy-lit);stroke-width:1.2}
.nm-acet{fill:var(--anatomy-red);pointer-events:none}
.nm-label{fill:var(--anatomy-text);font:11.5px var(--anatomy-mono)}
.nm-label.nm-name{fill:var(--anatomy-strong);font-size:12.5px}
.nm-step{fill:var(--anatomy-strong);font:600 12.5px var(--anatomy-mono)}
.nm-leader{fill:none;stroke:var(--anatomy-mid);stroke-width:.7}
.nm-dot{fill:var(--anatomy-dot)}
.hot{cursor:help;outline:none}
.hot.is-hot{filter:drop-shadow(0 0 3px var(--anatomy-lit))}
.hot:focus-visible{outline:2px solid var(--anatomy-lit);outline-offset:3px}
.nm-controls{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin:14px 2px 6px;font:12.5px var(--anatomy-mono);color:var(--anatomy-text)}
.nm-controls button,.nm-steps button{border:1px solid var(--anatomy-faint);background:transparent;color:var(--anatomy-text);font:inherit;padding:6px 10px;cursor:pointer}
.nm-controls #pause{margin-left:auto}
.nm-controls input{accent-color:var(--anatomy-lit);margin-right:6px}
.nm-controls :focus-visible,.nm-steps :focus-visible{outline:2px solid var(--anatomy-lit);outline-offset:3px}
.nm-panel{display:grid;grid-template-columns:1fr 340px;gap:18px;align-items:start;margin:8px 2px}
@media(max-width:720px){.nm-panel{grid-template-columns:1fr}}
.nm-steps{margin:0;padding-left:22px;font:12.5px/1.4 var(--anatomy-mono);color:var(--anatomy-muted)}
.nm-steps li{margin:3px 0}
.nm-steps button{border:none;padding:3px 4px;text-align:left;color:inherit}
.nm-steps li.is-on{color:var(--anatomy-strong)}
.nm-steps li.is-on button{border-left:2px solid var(--anatomy-lit);padding-left:8px}
.nm-trace{width:100%;max-width:340px;height:auto}
.nm-axis{fill:none;stroke:var(--anatomy-mid);stroke-width:1}
.nm-grid{stroke:var(--anatomy-faint);stroke-width:.6}
.nm-tick{fill:var(--anatomy-muted);font:10.5px var(--anatomy-mono)}
.nm-trace-line{fill:none;stroke:var(--anatomy-green);stroke-width:1.8;stroke-linejoin:round}
.nm-trace-ghost{fill:none;stroke:var(--anatomy-mid);stroke-width:1;stroke-dasharray:3 3}
.nm-trace-dot{fill:var(--anatomy-lit)}
.nm-status{font:12px/1.5 var(--anatomy-mono);color:var(--anatomy-text);margin:6px 2px}
.nm-info{min-height:4.6em;font:12.5px/1.55 var(--anatomy-mono);color:var(--anatomy-strong);margin:8px 2px;border-left:2px solid var(--anatomy-faint);padding-left:10px}
.bio-sources{margin:20px 2px;color:var(--anatomy-muted);font-size:12.5px;line-height:1.65}
.bio-sources h2{font:600 13px var(--anatomy-mono);color:var(--anatomy-text);margin:0 0 8px}
.bio-sources ul{padding-left:18px}.bio-sources li{margin:6px 0}
.bio-sources a{color:var(--anatomy-text);text-underline-offset:2px}
`;

const html = pageHtml({
  title: "Neuromuscular Junction",
  theme: light ? "light" : "dark",
  width: WIDTH + 40,
  body: `<style>${BIO_CSS}${style}</style>${framed}${controls}${sources}`,
  script,
});
const filename = light ? "neuromuscular-junction-light.html" : "neuromuscular-junction.html";
writeFileSync(join(HERE, filename), html);
console.log(`wrote ${filename}`);
