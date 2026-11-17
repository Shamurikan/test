/**
 * Part 0 · Location anatomy. Every visual here is a textbook plate (Gray's, Junqueira, Guyton), filmed live:
 * the camera moves across the figure while the narration names each structure, and the book's own labels light up
 * with their leader lines re-traced to the exact point they mark.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../lib/theme";
import { E, Header, prog, useT } from "../lib/anim";
import { makeCue } from "../lib/timing";
import { DEFAULT_REGION, FULL_REGION, Facts, Shots, around, tipOf, type Fact, type Region, type Shot } from "../lib/figure";

const RIGHT: Region = DEFAULT_REGION; // x 760..1800
const WIDE: Region = FULL_REGION;
const TALL_R: Region = { x: 1010, y: 88, w: 760, h: 844 };

/** How much a wide (left-reaching) plate is on screen right now: the header and facts step aside for it. */
const wideness = (shots: Shot[], t: number) => {
  let k = 0;
  for (const s of shots) {
    const r = s.region ?? DEFAULT_REGION;
    if (r.x > 700) continue;
    const v = prog(t, s.t0 - 0.35, 0.45) * (1 - prog(t, s.t1 - 0.2, 0.45, E.in));
    k = Math.max(k, v);
  }
  return k;
};

const Scene: React.FC<{ kicker: string; title: string; shots: Shot[]; facts?: Fact[]; color?: string }> = ({ kicker, title, shots, facts, color = "#F3D3C2" }) => {
  const t = useT();
  const w = wideness(shots, t);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - w }}>
        <Header kicker={kicker} title={title} color={color} t={t} />
        {facts && <Facts facts={facts} t={t} />}
      </div>
      <Shots shots={shots} />
    </AbsoluteFill>
  );
};

const GOLD = C.gold, TEAL = C.teal, CORAL = C.coral, VIOLET = C.violet, BLUE = C.bloodBlue, RED = C.blood, GREEN = C.lymph, NERVE = C.nerve;

/* ───────────── a01 · Where it lies ───────────── */
const q1 = makeCue("a01");
const A01shots: Shot[] = [
  {
    plate: "abdomen-boundaries",
    t0: 0.2,
    t1: q1("Open"),
    keys: [
      { t: 0, f: [0.0, 0.05, 0.95, 0.95] },
      { t: q1("diaphragm") - 0.3, f: [0.05, 0.12, 0.85, 0.82], dur: 1.6 },
    ],
    anns: [
      { k: "label", t: q1("diaphragm"), text: "Diaphragm", say: "Diaphragm · roof", color: GOLD },
      { k: "label", t: q1("pelvic inlet"), text: "Pelvic inlet", say: "Pelvic inlet · floor", color: TEAL },
      { k: "label", t: q1("abdominal muscles"), text: "Abdominal wall", say: "Abdominal wall · front", color: CORAL },
    ],
  },
  {
    plate: "abdomen-viscera",
    t0: q1("Open") - 0.1,
    t1: q1("draped") + 0.1,
    keys: [
      { t: 0, f: [0.05, 0.1, 0.95, 0.9] },
      { t: q1("coils") - 0.2, f: [0.18, 0.38, 0.85, 0.85], dur: 1.6 },
    ],
    anns: [
      { k: "label", t: q1("coils"), text: "Small intestine", say: "Small intestine", color: GOLD },
      { k: "label", t: q1("below the liver"), text: "Liver", say: "Liver", color: CORAL, side: "l" },
      { k: "label", t: q1("stomach,"), text: "Stomach", say: "Stomach", color: CORAL },
      { k: "label", t: q1("colon"), text: "Colon", say: "Colon frames it", color: TEAL, side: "r" },
    ],
  },
  {
    plate: "greater-omentum",
    t0: q1("draped"),
    t1: q1("On the surface") + 0.1,
    enter: "right",
    view: [0.04, 0, 1, 1],
    keys: [{ t: 0, f: [0.06, 0.12, 0.96, 0.9] }],
    anns: [{ k: "label", t: q1("greater omentum") - 0.1, text: "Greater omentum", say: "Greater omentum · apron", color: GOLD }],
  },
  {
    plate: "nine-regions",
    t0: q1("On the surface"),
    t1: q1("jejunum mostly") + 0.2,
    keys: [{ t: 0, f: [0.08, 0.12, 0.92, 0.82] }],
    anns: [
      { k: "label", t: q1("epigastric"), text: "Epigastric region", say: "Epigastric", color: CORAL },
      { k: "label", t: q1("umbilical"), text: "Umbilical region", say: "Umbilical", color: CORAL },
    ],
  },
  {
    plate: "four-quadrants",
    t0: q1("jejunum mostly"),
    t1: q1("One landmark") + 0.2,
    enter: "fade",
    keys: [{ t: 0, f: [0.12, 0.3, 0.88, 0.82] }],
    anns: [
      { k: "label", t: q1("left upper"), text: "Left upper", say: "Jejunum · LUQ", color: GOLD },
      { k: "label", t: q1("right lower"), text: "Right lower", say: "Ileum · RLQ + pelvis", color: TEAL },
    ],
  },
  {
    plate: "l1-level-viscera",
    t0: q1("One landmark"),
    t1: 999,
    region: WIDE,
    enter: "zoom",
    keys: [
      { t: 0, f: [0.1, 0.05, 0.9, 0.88] },
      { t: q1("crosses") - 0.2, f: [0.22, 0.38, 0.72, 0.66], dur: 1.6 },
    ],
    anns: [
      { k: "plane", t: q1("transpyloric") , y: 0.533, x0: 0.18, x1: 0.82, say: "Transpyloric plane · L1", color: GOLD },
      { k: "label", t: q1("pylorus,"), text: "Duodenum", say: "Pylorus → 1st part of duodenum", color: CORAL, side: "l" },
      { k: "label", t: q1("origin"), text: "Superior mesenteric artery", say: "Origin of the SMA", color: RED, side: "r" },
      { k: "label", t: q1("origin") + 0.6, text: "Neck of pancreas", say: "Neck of pancreas", color: GOLD, side: "u" },
    ],
  },
];
const A01facts: Fact[] = [
  { t: q1("fills"), head: "Location", text: "Abdominal cavity, centre and below", until: q1("One landmark") },
  { t: q1("diaphragm"), head: "Boundaries", text: "Diaphragm ↑ · pelvic inlet ↓ · wall ← · spine →", color: C.teal, until: q1("One landmark") },
  { t: q1("Open"), head: "Relations", text: "Under liver & stomach · in colonic frame · behind omentum", color: C.gold, until: q1("One landmark") },
  { t: q1("On the surface"), head: "Surface", text: "D: epigastric/umbilical · J: LUQ · I: RLQ", color: C.violet, until: q1("One landmark") },
];
export const A01: React.FC = () => <Scene kicker="Location anatomy" title="Where it lies" shots={A01shots} facts={A01facts} />;

/* ───────────── a02 · Peritoneum & mesentery ───────────── */
const q2 = makeCue("a02");
const A02shots: Shot[] = [
  {
    plate: "gut-mesenteries",
    t0: 0.2,
    t1: q2("Where that"),
    keys: [{ t: 0, f: [0, 0, 1, 1] }, { t: q2("dorsal mesentery") - 0.3, f: [0.1, 0.05, 1, 0.65], dur: 1.4 }],
    anns: [
      { k: "label", t: q2("tube"), text: "Gastrointestinal tract", say: "Gut tube", color: GOLD },
      { k: "label", t: q2("dorsal mesentery"), text: "Dorsal mesentery", say: "Dorsal mesentery", color: TEAL, noTrace: true },
      { k: "label", t: q2("back wall"), text: "Aorta", say: "Posterior wall", color: RED },
    ],
  },
  {
    plate: "intra-to-retroperitoneal",
    t0: q2("Where that"),
    t1: q2("The jejunum and ileum hang"),
    region: WIDE,
    keys: [
      { t: 0, f: [0, 0, 1, 0.55] },
      { t: q2("fuses") - 0.3, f: [0.4, 0.05, 1, 0.62], dur: 1.2 },
      { t: q2("fixed") - 0.4, f: [0, 0.5, 0.75, 1], dur: 1.4 },
    ],
    anns: [
      { k: "label", t: q2("survives"), text: "Mesentery", say: "Mesentery kept → intraperitoneal", color: GOLD, side: "r" },
      { k: "label", t: q2("fuses"), text: "Mesentery before fusion with wall", say: "Fuses with the wall", color: CORAL, side: "l" },
      { k: "label", t: q2("secondarily"), text: "Secondary retroperitoneal", say: "Secondarily retroperitoneal", color: TEAL, noTrace: true },
      { k: "label", t: q2("fixed") + 0.2, text: "Intraperitoneal part", say: "Still intraperitoneal", color: GOLD, side: "r" },
    ],
  },
  {
    plate: "greater-lesser-sacs",
    t0: q2("The jejunum and ileum hang"),
    t1: q2("Its root"),
    keys: [{ t: 0, f: [0.2, 0.1, 0.9, 0.95] }, { t: q2("fan-shaped") - 0.2, f: [0.3, 0.28, 0.75, 0.75], dur: 1.2 }],
    anns: [
      { k: "label", t: q2("hang"), text: "Mesentery", say: "Mesentery", color: GOLD, side: "r" },
      { k: "label", t: q2("double fold"), text: "Small intestine", say: "Jejunum & ileum", color: TEAL, noTrace: true },
      { k: "label", t: q2("double fold") + 0.8, text: "Duodenum", say: "Duodenum · retroperitoneal", color: CORAL, side: "r" },
    ],
  },
  {
    plate: "mesentery-root",
    t0: q2("Its root"),
    t1: 999,
    region: TALL_R,
    keys: [{ t: 0, f: [0.05, 0.08, 0.95, 0.95] }, { t: q2("obliquely") - 0.2, f: [0.18, 0.3, 0.86, 0.8], dur: 1.4 }],
    anns: [
      { k: "label", t: q2("Its root"), text: "Root of the mesentery", say: "Root · ~15 cm", color: GOLD },
      { k: "trace", t: q2("obliquely"), dur: 2.2, pts: [[0.545, 0.43], [0.505, 0.5], [0.465, 0.56], [0.43, 0.62]], color: GOLD, w: 9 },
      { k: "pin", t: q2("duodenojejunal"), at: [0.548, 0.425], say: "DJ flexure · left of L2", color: CORAL, side: "r" },
      { k: "pin", t: q2("sacroiliac"), at: [0.43, 0.625], say: "Right sacroiliac joint", color: TEAL, side: "l" },
    ],
  },
];
const A02facts: Fact[] = [
  { t: q2("survives"), head: "Intraperitoneal", text: "Jejunum · ileum · first 2 cm of duodenum", color: C.gold },
  { t: q2("secondarily"), head: "Retroperitoneal (2°)", text: "Rest of the duodenum, fixed", color: C.teal },
  { t: q2("Its root"), head: "Mesentery root", text: "≈15 cm · L2 (left) → right S-I joint", color: C.coralSoft },
  { t: q2("free border"), head: "Free border", text: "≈6 m long → coils", color: C.violet },
];
export const A02: React.FC = () => <Scene kicker="Location anatomy" title="Peritoneum" shots={A02shots} facts={A02facts} />;

/* ───────────── a03 · Duodenum ───────────── */
const q3 = makeCue("a03");
const D = "duodenum-parts";
const A03shots: Shot[] = [
  {
    plate: D,
    t0: 0.2,
    t1: q3("Its superior part") + 0.2,
    keys: [{ t: 0, f: [0.05, 0, 0.98, 0.95] }, { t: q3("C-shaped") - 0.2, f: around([tipOf(D, "superior part"), tipOf(D, "inferior part"), tipOf(D, "ascending part")], 0.14), dur: 1.4 }],
    anns: [
      { k: "label", t: q3("C-shaped"), text: "Duodenum —descending", color: CORAL, noTrace: false },
      { k: "label", t: q3("head of the pancreas"), text: "Pancreas", say: "Head of pancreas", color: GOLD, side: "r" },
      { k: "label", t: q3("from L1"), text: "L1", color: TEAL },
      { k: "label", t: q3("to L3"), text: "L3", color: TEAL },
    ],
  },
  {
    plate: "stomach-duodenum",
    t0: q3("Its superior part"),
    t1: q3("The descending part"),
    keys: [{ t: 0, f: [0, 0.05, 1, 1] }, { t: q3("pylorus") - 0.2, f: [0, 0.5, 0.55, 1], dur: 1.2 }],
    anns: [
      { k: "label", t: q3("pylorus"), text: "Pyloric sphincter", say: "Pyloric sphincter", color: CORAL, side: "r" },
      { k: "label", t: q3("duodenal cap") - 0.3, text: "Duodenum", say: "Duodenal cap · mobile", color: GOLD, side: "r" },
    ],
  },
  {
    plate: "barium-stomach-duodenum",
    t0: q3("duodenal cap"),
    t1: q3("The descending part") + 0.2,
    enter: "right",
    keys: [{ t: 0, f: [0.5, 0.05, 1, 0.9] }],
    anns: [{ k: "label", t: q3("ulcers") - 0.4, text: "Normal duodenal cap", say: "Ulcers occur here", color: CORAL }],
  },
  {
    plate: D,
    t0: q3("The descending part"),
    t1: q3("posteromedial"),
    keys: [{ t: 0, f: around([tipOf(D, "descending part"), tipOf(D, "Pancreas")], 0.14) }],
    anns: [
      { k: "label", t: q3("descending part") + 0.1, text: "Duodenum —descending", say: "Descending (2nd) part", color: CORAL },
      { k: "label", t: q3("head of the pancreas", 2), text: "Pancreas", color: GOLD },
    ],
  },
  {
    plate: "pancreatic-ducts-papillae",
    t0: q3("posteromedial"),
    t1: q3("The inferior part"),
    region: WIDE,
    keys: [{ t: 0, f: [0.2, 0.05, 0.95, 0.95] }, { t: q3("major duodenal papilla") - 0.2, f: [0.18, 0.15, 0.6, 0.8], dur: 1.2 }],
    anns: [
      { k: "label", t: q3("major duodenal papilla"), text: "Major duodenal papilla", say: "Major papilla", color: GOLD, side: "l" },
      { k: "label", t: q3("bile duct"), text: "Bile duct", say: "Bile duct", color: C.lymph, side: "r" },
      { k: "label", t: q3("main pancreatic duct"), text: "Main pancreatic duct", say: "Main pancreatic duct", color: TEAL, side: "u" },
      { k: "label", t: q3("hepatopancreatic"), text: "Hepatopancreatic ampulla", say: "Ampulla · sphincter of Oddi", color: CORAL, side: "r" },
      { k: "label", t: q3("minor papilla"), text: "Minor duodenal papilla", say: "Minor papilla", color: VIOLET, side: "l" },
      { k: "label", t: q3("accessory"), text: "Accessory pancreatic duct", say: "Accessory duct", color: VIOLET, side: "r" },
    ],
  },
  {
    plate: D,
    t0: q3("The inferior part"),
    t1: 999,
    region: WIDE,
    keys: [{ t: 0, f: [0.15, 0.05, 0.88, 0.7] }, { t: q3("ascending part") - 0.2, f: [0.3, 0.25, 0.72, 0.62], dur: 1.2 }],
    anns: [
      { k: "label", t: q3("inferior part"), text: "Duodenum —inferior", say: "Inferior (3rd) part", color: CORAL, side: "l" },
      { k: "label", t: q3("vena cava"), text: "Inferior vena cava", say: "IVC", color: BLUE, side: "u" },
      { k: "label", t: q3("the aorta"), text: "Abdominal aorta", say: "Aorta", color: RED, side: "r" },
      { k: "label", t: q3("ascending part"), text: "Duodenum —ascending", say: "Ascending (4th) part → DJ flexure", color: GOLD, side: "r" },
      { k: "pin", t: q3("Treitz") - 0.4, at: [0.552, 0.418], say: "Ligament of Treitz", color: TEAL, side: "u", dist: 70 },
    ],
  },
];
const A03facts: Fact[] = [
  { t: q3("C-shaped"), head: "Form", text: "C-shaped · 20–25 cm · widest, most fixed", color: C.coralSoft },
  { t: q3("from L1"), head: "Level", text: "L1 → L3, around head of pancreas", color: C.teal },
  { t: q3("major duodenal papilla"), head: "Openings", text: "Major papilla: bile + main pancreatic duct · minor: accessory duct", color: C.gold },
  { t: q3("Treitz") - 0.4, head: "Ends", text: "DJ flexure at L2 · suspensory muscle (Treitz)", color: C.violet },
];
export const A03: React.FC = () => <Scene kicker="Location anatomy" title="The duodenum" shots={A03shots} facts={A03facts} />;

/* ───────────── a04 · Duodenum: relations & supply ───────────── */
const q4 = makeCue("a04");
const A04shots: Shot[] = [
  {
    plate: D,
    t0: 0.2,
    t1: q4("The third part"),
    keys: [{ t: 0, f: [0.02, 0, 0.6, 0.62] }],
    anns: [
      { k: "label", t: q4("bile duct"), text: "Bile duct", say: "Bile duct", color: C.lymph, side: "r" },
      { k: "label", t: q4("portal vein"), text: "Portal vein", say: "Portal vein", color: BLUE, side: "r" },
      { k: "label", t: q4("right kidney"), text: "Right kidney", say: "Right kidney", color: CORAL, side: "r" },
    ],
  },
  {
    plate: "pancreas-duodenum-sma",
    t0: q4("The third part"),
    t1: q4("The duodenum also"),
    keys: [{ t: 0, f: [0.1, 0.25, 0.9, 1] }, { t: q4("pinched") , f: [0.2, 0.45, 0.75, 0.95], dur: 1.2 }],
    anns: [
      { k: "label", t: q4("aorta behind"), text: "Aorta", say: "Aorta · behind", color: RED, side: "r" },
      { k: "label", t: q4("superior mesenteric artery"), text: "Superior mesenteric artery", say: "SMA · in front", color: RED, side: "r" },
      { k: "label", t: q4("and vein"), text: "Superior mesenteric vein", say: "SMV", color: BLUE, noTrace: true },
      { k: "label", t: q4("pinched"), text: "Duodenum", say: "3rd part, pinched", color: GOLD, side: "l" },
    ],
  },
  {
    plate: "foregut-midgut-hindgut",
    t0: q4("The duodenum also"),
    t1: q4("Above the major"),
    keys: [{ t: 0, f: [0, 0.05, 1, 0.75] }],
    anns: [
      { k: "label", t: q4("two blood"), text: "Foregut", color: GOLD },
      { k: "label", t: q4("two blood") + 0.5, text: "Midgut", color: TEAL },
      { k: "label", t: q4("two blood") + 1.0, text: "Celiac trunk", say: "Celiac trunk", color: RED, side: "l" },
      { k: "label", t: q4("two blood") + 1.5, text: "Superior mesenteric artery", say: "SMA", color: RED, side: "l" },
    ],
  },
  {
    plate: "duodenum-arteries",
    t0: q4("Above the major"),
    t1: 999,
    region: WIDE,
    keys: [
      { t: 0, f: [0.05, 0.05, 0.98, 0.92] },
      { t: q4("foregut") - 0.2, f: [0.15, 0.08, 0.75, 0.55], dur: 1.2 },
      { t: q4("Below it") - 0.2, f: [0.2, 0.42, 0.85, 0.9], dur: 1.2 },
      { t: q4("The two arcades") - 0.2, f: [0.12, 0.2, 0.85, 0.8], dur: 1.2 },
    ],
    anns: [
      { k: "label", t: q4("celiac trunk"), text: "Gastroduodenal", say: "Gastroduodenal a. (celiac)", color: GOLD, noTrace: true },
      { k: "label", t: q4("superior pancreaticoduodenal"), text: "Anterior superior pancreaticoduodenal", say: "Superior PD arteries", color: GOLD, side: "l" },
      { k: "label", t: q4("superior pancreaticoduodenal") + 0.4, text: "Posterior superior pancreaticoduodenal", color: GOLD },
      { k: "label", t: q4("fed by the superior mesenteric"), text: "Superior mesenteric artery", say: "SMA", color: TEAL, side: "r" },
      { k: "label", t: q4("inferior pancreaticoduodenal"), text: "Anterior inferior pancreaticoduodenal", say: "Inferior PD arteries", color: TEAL, side: "r" },
      { k: "label", t: q4("inferior pancreaticoduodenal") + 0.4, text: "Posterior inferior pancreaticoduodenal", color: TEAL },
      { k: "ring", t: q4("The two arcades"), at: [0.43, 0.49], r: [0.12, 0.12], color: CORAL },
      { k: "pin", t: q4("linking"), at: [0.43, 0.49], say: "Celiac ↔ SMA anastomosis", color: CORAL, side: "l", dist: 160 },
    ],
  },
];
const A04facts: Fact[] = [
  { t: q4("Behind the first"), head: "Posterior (D1)", text: "Bile duct · gastroduodenal a. · portal vein", color: C.coralSoft },
  { t: q4("Behind the second"), head: "Posterior (D2)", text: "Right kidney", color: C.coralSoft },
  { t: q4("The third part"), head: "D3", text: "Between aorta (behind) and SMA/SMV (in front)", color: C.teal },
  { t: q4("Above the major"), head: "Supply", text: "Foregut: celiac → GDA → superior PD · midgut: SMA → inferior PD", color: C.gold },
];
export const A04: React.FC = () => <Scene kicker="Location anatomy" title="Duodenal relations" shots={A04shots} facts={A04facts} />;

/* ───────────── a05 · Jejunum & ileum ───────────── */
const q5 = makeCue("a05");
const A05shots: Shot[] = [
  {
    plate: "barium-jejunum-ileum",
    t0: 0.2,
    t1: q5("Its wall") + 0.2,
    keys: [{ t: 0, f: [0, 0, 1, 1] }],
    anns: [
      { k: "label", t: q5("jejunum makes"), text: "Jejunum", say: "Jejunum · proximal 2/5", color: GOLD },
      { k: "spot", t: q5("jejunum makes"), until: q5("ileum the") - 0.1, rect: [0.04, 0.12, 0.66, 0.56], ellipse: true },
      { k: "label", t: q5("ileum the"), text: "Ileum", say: "Ileum · distal 3/5", color: TEAL },
      { k: "spot", t: q5("ileum the"), until: q5("The jejunum lies"), rect: [0.04, 0.5, 0.72, 0.96], ellipse: true },
      { k: "spot", t: q5("The jejunum lies"), rect: [0.04, 0.12, 0.66, 0.56], ellipse: true },
    ],
  },
  {
    plate: "plicae-jejunum",
    t0: q5("Its wall"),
    t1: q5("The ileum lies"),
    region: WIDE,
    keys: [{ t: 0, f: [0, 0, 1, 1] }, { t: q5("tall circular") - 0.2, f: [0.2, 0.15, 0.85, 0.95], dur: 1.2 }],
    anns: [
      { k: "label", t: q5("tall circular"), text: "P", say: "Plica circularis", color: GOLD },
      { k: "label", t: q5("tall circular") + 0.6, text: "SM", say: "Submucosal core", color: TEAL },
      { k: "label", t: q5("feathery") , text: "V", say: "Villi", color: CORAL },
    ],
  },
  {
    plate: "barium-jejunum-ileum",
    t0: q5("feathery"),
    t1: q5("The mesentery tells"),
    enter: "fade",
    keys: [{ t: 0, f: [0.0, 0.08, 0.8, 0.62] }, { t: q5("The ileum lies") - 0.2, f: [0.0, 0.44, 0.8, 0.98], dur: 1.4 }],
    anns: [
      { k: "spot", t: q5("feathery"), until: q5("The ileum lies"), rect: [0.04, 0.12, 0.66, 0.56], ellipse: true },
      { k: "pin", t: q5("feathery") + 0.3, at: [0.3, 0.3], say: "Feathery jejunal folds", color: GOLD, side: "r", dist: 120 },
      { k: "spot", t: q5("thinner"), rect: [0.04, 0.5, 0.72, 0.96], ellipse: true },
      { k: "pin", t: q5("thinner") + 0.3, at: [0.35, 0.72], say: "Smoother ileal loops", color: TEAL, side: "r", dist: 120 },
    ],
  },
  {
    plate: "jejunum-ileum-arcades",
    t0: q5("The mesentery tells"),
    t1: 999,
    region: TALL_R,
    keys: [
      { t: 0, f: [0, 0, 1, 1] },
      { t: q5("the jejunum has") - 0.2, f: [0.0, 0.0, 1, 0.5], dur: 1.2 },
      { t: q5("the ileum has") - 0.2, f: [0.0, 0.5, 1, 1], dur: 1.2 },
      { t: q5("Peyer") - 0.3, f: [0, 0, 1, 1], dur: 1.0 },
    ],
    anns: [
      { k: "label", t: q5("long vasa"), text: "Vasa recta", say: "Long vasa recta", color: GOLD, side: "l" },
      { k: "label", t: q5("one or two"), text: "Arterial arcades", say: "1–2 arcades", color: GOLD, side: "l" },
      { k: "label", t: q5("short vasa"), text: "Vasa recta", nth: 2, say: "Short vasa recta", color: TEAL, side: "l" },
      { k: "label", t: q5("many arcades"), text: "Arterial arcades", nth: 2, say: "Many arcades · more fat", color: TEAL, side: "l" },
    ],
  },
];
const A05facts: Fact[] = [
  { t: q5("The jejunum lies"), head: "Jejunum", text: "LUQ · thick, wide, red · tall dense plicae", color: C.gold },
  { t: q5("The ileum lies"), head: "Ileum", text: "RLQ & pelvis · thin · low sparse plicae", color: C.teal },
  { t: q5("long vasa"), head: "Mesentery (J)", text: "Long vasa recta · 1–2 arcades", color: C.gold },
  { t: q5("short vasa"), head: "Mesentery (I)", text: "Short vasa recta · many arcades · fat · Peyer’s patches", color: C.teal },
];
export const A05: React.FC = () => <Scene kicker="Location anatomy" title="Jejunum vs ileum" shots={A05shots} facts={A05facts} />;

/* ───────────── a06 · Superior mesenteric vessels ───────────── */
const q6 = makeCue("a06");
const SB = "sma-initial-branches";
const A06shots: Shot[] = [
  {
    plate: "aorta-anterior-branches",
    t0: 0.2,
    t1: q6("It passes"),
    keys: [{ t: 0, f: [0.05, 0.05, 0.95, 0.95] }, { t: q6("leaves") - 0.2, f: [0.3, 0.18, 0.72, 0.56], dur: 1.4 }],
    anns: [
      { k: "label", t: q6("superior mesenteric artery"), text: "Superior mesenteric artery", say: "SMA · L1", color: RED, side: "l" },
      { k: "label", t: q6("celiac trunk"), text: "Celiac trunk", say: "Celiac trunk above", color: GOLD, side: "l" },
    ],
  },
  {
    plate: SB,
    t0: q6("It passes"),
    t1: q6("From its left"),
    region: WIDE,
    keys: [{ t: 0, f: [0.2, 0.1, 0.85, 0.75] }],
    anns: [
      { k: "label", t: q6("neck of the pancreas"), text: "Pancreas", nth: 2, say: "Neck of pancreas · in front", color: GOLD, side: "l" },
      { k: "label", t: q6("left renal"), text: "Superior mesenteric artery", say: "SMA", color: RED, side: "r" },
      { k: "label", t: q6("third part"), text: "Duodenum", say: "3rd part of duodenum · behind", color: CORAL, side: "l" },
    ],
  },
  {
    plate: "sma-distribution",
    t0: q6("From its left"),
    t1: q6("The superior mesenteric vein"),
    region: WIDE,
    keys: [
      { t: 0, f: [0.08, 0.0, 0.85, 0.66] },
      { t: q6("arcades") - 0.2, f: [0.4, 0.1, 0.82, 0.62], dur: 1.2 },
      { t: q6("From its right") - 0.2, f: [0.1, 0.05, 0.6, 0.66], dur: 1.2 },
    ],
    anns: [
      { k: "label", t: q6("jejunal and ileal"), text: "Jejunal arteries", say: "Jejunal arteries", color: GOLD, side: "r" },
      { k: "label", t: q6("jejunal and ileal") + 0.5, text: "Ileal arteries", say: "Ileal arteries", color: GOLD, side: "r" },
      { k: "label", t: q6("vasa recta"), text: "Vasa recta", say: "Vasa recta", color: TEAL, side: "r" },
      { k: "label", t: q6("middle colic"), text: "Middle colic artery", say: "Middle colic", color: CORAL, side: "l" },
      { k: "label", t: q6("right colic"), text: "Right colic artery", say: "Right colic", color: CORAL, side: "l" },
      { k: "label", t: q6("ileocolic"), text: "Ileocolic artery", say: "Ileocolic", color: CORAL, side: "l" },
    ],
  },
  {
    plate: "portal-vein-smv",
    t0: q6("The superior mesenteric vein"),
    t1: q6("So everything"),
    keys: [{ t: 0, f: [0, 0.1, 0.95, 0.95] }, { t: q6("joins") - 0.2, f: [0.2, 0.15, 0.85, 0.7], dur: 1.2 }],
    anns: [
      { k: "label", t: q6("vein runs"), text: "Superior mesenteric vein", say: "SMV", color: BLUE, noTrace: true },
      { k: "label", t: q6("splenic vein"), text: "Splenic vein", say: "Splenic vein", color: BLUE, side: "l" },
      { k: "label", t: q6("portal vein"), text: "Portal vein", say: "Portal vein", color: VIOLET, side: "l" },
    ],
  },
  {
    plate: "splanchnic-circulation",
    t0: q6("So everything"),
    t1: 999,
    region: TALL_R,
    keys: [{ t: 0, f: [0, 0, 1, 1] }],
    anns: [
      { k: "trace", t: q6("absorbed"), dur: 2.4, pts: [[0.48, 0.9], [0.46, 0.78], [0.44, 0.62], [0.44, 0.5], [0.4, 0.44], [0.32, 0.36]], color: BLUE, w: 8 },
      { k: "label", t: q6("liver first") - 0.3, text: "Hepatic sinuses", say: "Liver first", color: GOLD, side: "r" },
    ],
  },
];
const A06facts: Fact[] = [
  { t: q6("leaves"), head: "Origin", text: "Aorta at L1, below the celiac trunk", color: C.blood },
  { t: q6("It passes"), head: "Course", text: "Behind pancreatic neck → in front of L renal v., uncinate, D3", color: C.coralSoft },
  { t: q6("From its left"), head: "Branches", text: "Left: 15–18 jejunal/ileal · right: middle colic, right colic, ileocolic", color: C.gold },
  { t: q6("The superior mesenteric vein"), head: "Vein", text: "SMV + splenic v. → portal vein → liver", color: C.bloodBlue },
];
export const A06: React.FC = () => <Scene kicker="Location anatomy" title="SMA & SMV" shots={A06shots} facts={A06facts} />;

/* ───────────── a07 · Lymph & nerves ───────────── */
const q7 = makeCue("a07");
const A07shots: Shot[] = [
  {
    plate: "villus-vessels-lacteal",
    t0: 0.2,
    t1: q7("drains"),
    keys: [{ t: 0, f: [0.05, 0.05, 0.95, 0.95] }, { t: q7("lacteal") - 0.2, f: [0.2, 0.0, 0.62, 0.7], dur: 1.2 }],
    anns: [{ k: "label", t: q7("lacteal"), text: "Lacteal", say: "Lacteal", color: GREEN }],
  },
  {
    plate: "abdominal-lymphatics",
    t0: q7("drains"),
    t1: q7("The nerves"),
    region: WIDE,
    keys: [{ t: 0, f: [0.2, 0.08, 0.8, 0.75] }, { t: q7("intestinal trunk") - 0.2, f: [0.36, 0.2, 0.64, 0.48], dur: 1.2 }],
    anns: [
      { k: "label", t: q7("superior mesenteric nodes"), text: "Superior mesenteric nodes", say: "Superior mesenteric nodes", color: GREEN, side: "r" },
      { k: "label", t: q7("intestinal trunk"), text: "Intestinal trunk", say: "Intestinal trunk", color: GREEN, side: "l" },
      { k: "label", t: q7("cisterna"), text: "Cisterna chyli", say: "Cisterna chyli · L1–L2", color: GOLD, side: "l" },
      { k: "trace", t: q7("thoracic duct") - 0.2, dur: 1.4, pts: [[0.48, 0.38], [0.485, 0.3], [0.49, 0.2], [0.5, 0.08]], color: GREEN, w: 8 },
    ],
  },
  {
    plate: "prevertebral-ganglia",
    t0: q7("The nerves"),
    t1: q7("Sympathetic"),
    keys: [{ t: 0, f: [0.15, 0.0, 0.95, 0.75] }, { t: q7("The nerves") + 0.4, f: [0.3, 0.12, 0.9, 0.55], dur: 1.2 }],
    anns: [
      { k: "label", t: q7("ride"), text: "Superior mesenteric ganglion", say: "Superior mesenteric ganglion", color: NERVE, noTrace: true },
      { k: "pin", t: q7("ride") + 0.3, at: [0.52, 0.355], say: "Plexus on the SMA root", color: NERVE, side: "l" },
    ],
  },
  {
    plate: "visceral-pathways",
    t0: q7("Sympathetic") - 0.1,
    t1: q7("Pain fibers"),
    region: WIDE,
    keys: [{ t: 0, f: [0.1, 0.05, 0.95, 0.95] }],
    anns: [
      { k: "label", t: q7("splanchnic"), text: "Greater splanchnic nerve", say: "Splanchnic nerve (lesser for midgut)", color: NERVE, side: "r" },
      { k: "label", t: q7("synapse in"), text: "Preganglionic sympathetic", say: "Synapse in a prevertebral ganglion", color: NERVE, side: "l" },
      { k: "label", t: q7("vagus"), text: "Vagus nerve", say: "Vagus · parasympathetic", color: TEAL, side: "l" },
      { k: "label", t: q7("neurons in the gut wall"), text: "Enteric neuron", say: "Enteric neuron", color: TEAL, side: "r" },
    ],
  },
  {
    plate: "nine-regions-referred",
    t0: q7("Pain fibers"),
    t1: 999,
    region: TALL_R,
    keys: [{ t: 0, f: [0.12, 0.1, 0.88, 0.95] }, { t: q7("umbilicus") - 0.3, f: [0.3, 0.38, 0.72, 0.72], dur: 1.2 }],
    anns: [
      { k: "label", t: q7("umbilicus") - 0.2, text: "Umbilical region", say: "Midgut pain · umbilicus (T10)", color: CORAL, side: "r" },
    ],
  },
];
const A07facts: Fact[] = [
  { t: q7("lacteal"), head: "Lymph", text: "Lacteal → mesenteric & SM nodes → intestinal trunk → cisterna chyli → thoracic duct", color: C.lymph },
  { t: q7("Sympathetic"), head: "Sympathetic", text: "T8–T10 · lesser splanchnic n. → SM ganglion · slows gut", color: C.nerve },
  { t: q7("Parasympathetic"), head: "Parasympathetic", text: "Vagus → enteric neurons in the wall", color: C.teal },
  { t: q7("Pain fibers"), head: "Pain", text: "Back to T9–T10 → felt at the umbilicus", color: C.coral },
];
export const A07: React.FC = () => <Scene kicker="Location anatomy" title="Lymph & nerves" shots={A07shots} facts={A07facts} />;

/* ───────────── a08 · Ileocecal junction ───────────── */
const q8 = makeCue("a08");
const A08shots: Shot[] = [
  {
    plate: "cecum-appendix",
    t0: 0.2,
    t1: q8("Two lips"),
    keys: [{ t: 0, f: [0, 0, 1, 0.92] }, { t: q8("posteromedial") - 0.2, f: [0.15, 0.15, 0.75, 0.62], dur: 1.2 }],
    anns: [
      { k: "label", t: q8("ileum opens"), text: "Ileum", say: "Terminal ileum", color: GOLD, side: "r" },
      { k: "label", t: q8("cecum"), text: "Cecum", say: "Cecum", color: TEAL, noTrace: true },
      { k: "label", t: q8("ascending colon"), text: "Ascending colon", say: "Ascending colon", color: TEAL, side: "r" },
    ],
  },
  {
    plate: "ileocecal-junction",
    t0: q8("Two lips"),
    t1: q8("The junction is supplied"),
    region: WIDE,
    keys: [{ t: 0, f: [0, 0.3, 1, 0.68] }, { t: q8("circular muscle") - 0.2, f: [0, 0.68, 1, 1], dur: 1.4 }],
    anns: [
      { k: "label", t: q8("Two lips"), text: "Ileocecal fold flaps", say: "Ileocecal fold (two lips)", color: GOLD, side: "r" },
      { k: "label", t: q8("Two lips") + 0.5, text: "Ileum", say: "Ileum", color: GOLD, side: "l" },
      { k: "pin", t: q8("ileocecal sphincter"), at: [0.52, 0.86], say: "Ileocecal sphincter (endoscopy)", color: CORAL, side: "u", dist: 70 },
    ],
  },
  {
    plate: "cecum-arteries",
    t0: q8("The junction is supplied"),
    t1: q8("We'll see"),
    keys: [{ t: 0, f: [0, 0.05, 1, 1] }],
    anns: [
      { k: "label", t: q8("ileocolic"), text: "Ileocolic artery", say: "Ileocolic artery", color: RED, side: "l" },
      { k: "label", t: q8("superior mesenteric"), text: "Super mesenteric artery", say: "from the SMA", color: RED, side: "l" },
    ],
  },
  {
    plate: "ileocecal-emptying",
    t0: q8("We'll see"),
    t1: 999,
    region: TALL_R,
    keys: [{ t: 0, f: [0, 0, 1, 1] }],
    anns: [
      { k: "label", t: q8("slows"), text: "Ileocecal sphincter", say: "Slows emptying", color: GOLD, side: "r" },
      { k: "label", t: q8("reflux"), text: "Valve", say: "Blocks reflux", color: CORAL, side: "r" },
    ],
  },
];
const A08facts: Fact[] = [
  { t: q8("ileocecal junction"), head: "Location", text: "Right iliac fossa", color: C.teal },
  { t: q8("posteromedial"), head: "Opening", text: "Posteromedial wall, cecum / ascending colon", color: C.gold },
  { t: q8("Two lips"), head: "Structure", text: "Ileocecal fold (2 lips) + sphincter", color: C.coralSoft },
  { t: q8("The junction is supplied"), head: "Supply", text: "Ileocolic artery (SMA, right side)", color: C.blood },
];
export const A08: React.FC = () => <Scene kicker="Location anatomy" title="Ileocecal junction" shots={A08shots} facts={A08facts} />;

/* ───────────── a09 · Layers of the wall ───────────── */
const q9 = makeCue("a09");
const A09shots: Shot[] = [
  {
    plate: "gi-layers",
    t0: 0.2,
    t1: q9("The mucosa and submucosa rise"),
    region: WIDE,
    keys: [
      { t: 0, f: [0, 0, 1, 1] },
      { t: q9("the mucosa,") - 0.2, f: [0, 0.05, 0.62, 0.42], dur: 1.2 },
      { t: q9("The submucosa") - 0.2, f: [0, 0.3, 0.62, 0.62], dur: 1.2 },
      { t: q9("The muscularis") - 0.2, f: [0, 0.5, 0.62, 0.86], dur: 1.2 },
      { t: q9("And the serosa") - 0.2, f: [0, 0.62, 0.62, 0.98], dur: 1.2 },
    ],
    anns: [
      { k: "label", t: q9("the mucosa,"), text: "Mucosa Epithelium Lamina propria", say: "Mucosa", color: CORAL },
      { k: "label", t: q9("muscularis mucosae"), text: "Muscularis mucosae", color: CORAL },
      { k: "label", t: q9("The submucosa"), text: "Submucosa Submucosal gland", say: "Submucosa", color: GOLD },
      { k: "label", t: q9("submucosal plexus"), text: "Submucosal nerve plexus", say: "Submucosal (Meissner) plexus", color: NERVE },
      { k: "label", t: q9("inner circular"), text: "Inner circular layer", say: "Inner circular", color: RED },
      { k: "label", t: q9("outer longitudinal"), text: "Outer longitudinal layer", say: "Outer longitudinal", color: RED },
      { k: "label", t: q9("myenteric"), text: "Myenteric nerve plexus", say: "Myenteric (Auerbach) plexus", color: NERVE },
      { k: "label", t: q9("And the serosa"), text: "Serosa", say: "Serosa · visceral peritoneum", color: TEAL },
    ],
  },
  {
    plate: "brunner-glands",
    t0: q9("Brunner") - 0.3,
    t1: q9("The muscularis") - 0.1,
    region: { x: 1300, y: 290, w: 470, h: 620 },
    enter: "right",
    keys: [{ t: 0, f: [0, 0.4, 1, 1] }],
    anns: [{ k: "label", t: q9("Brunner"), text: "DG", say: "Brunner’s glands", color: GOLD }],
  },
  {
    plate: "si-absorptive-surface",
    t0: q9("The mucosa and submucosa rise"),
    t1: q9("Hold on"),
    region: WIDE,
    keys: [
      { t: 0, f: [0, 0, 0.7, 0.58] },
      { t: q9("which carry villi") - 0.2, f: [0.28, 0.0, 1, 0.45], dur: 1.2 },
      { t: q9("which carry microvilli") - 0.2, f: [0.45, 0.58, 1, 0.86], dur: 1.2 },
    ],
    anns: [
      { k: "label", t: q9("circular folds"), text: "Circular fold", say: "Circular fold", color: GOLD },
      { k: "label", t: q9("which carry villi"), text: "(c) Intestinal villus", say: "Villus", color: CORAL },
      { k: "label", t: q9("which carry microvilli"), text: "Microvilli", say: "Microvilli", color: TEAL },
    ],
  },
  {
    plate: "intestinal-wall-section",
    t0: q9("Hold on"),
    t1: 999,
    region: TALL_R,
    keys: [{ t: 0, f: [0, 0, 1, 1] }],
    anns: [
      { k: "label", t: q9("movement"), text: "Circular muscle", say: "Movement", color: RED, side: "r" },
      { k: "label", t: q9("secretion"), text: "Mucosal gland", say: "Secretion", color: GOLD, side: "r" },
      { k: "label", t: q9("absorption"), text: "Epithelial lining", say: "Absorption", color: TEAL, side: "r" },
    ],
  },
];
const A09facts: Fact[] = [
  { t: q9("the mucosa,"), head: "Mucosa", text: "Epithelium · lamina propria · muscularis mucosae", color: C.coralSoft },
  { t: q9("The submucosa"), head: "Submucosa", text: "Vessels · Meissner plexus · Brunner glands (duodenum)", color: C.gold },
  { t: q9("The muscularis"), head: "Muscularis externa", text: "Inner circular · Auerbach plexus · outer longitudinal", color: C.blood },
  { t: q9("And the serosa"), head: "Serosa", text: "Visceral peritoneum", color: C.teal },
];
export const A09: React.FC = () => <Scene kicker="Location anatomy" title="Layers of the wall" shots={A09shots} facts={A09facts} />;
