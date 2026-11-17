/**
 * Textbook beats inside the physiology scenes: at the words a figure illustrates, the running animation steps back
 * and the textbook plate plays for a few seconds (camera move + the book's own labels), then hands back.
 */
import { C } from "../lib/theme";
import { makeCue } from "../lib/timing";
import type { Shot } from "../lib/figure";

const GOLD = C.gold, TEAL = C.teal, CORAL = C.coral, RED = C.blood, BLUE = C.bloodBlue, NERVE = C.nerve, GREEN = C.lymph, VIOLET = C.violet;

const b04 = makeCue("s04"), b05 = makeCue("s05"), b06 = makeCue("s06"), b07 = makeCue("s07"), b08 = makeCue("s08"), b09 = makeCue("s09");
const b10 = makeCue("s10"), b11 = makeCue("s11"), b12 = makeCue("s12"), b13 = makeCue("s13"), b14 = makeCue("s14"), b15 = makeCue("s15");
const b16 = makeCue("s16"), b17 = makeCue("s17"), b18 = makeCue("s18"), b20 = makeCue("s20"), b22 = makeCue("s22"), b23 = makeCue("s23");
const b24 = makeCue("s24"), b26 = makeCue("s26"), b27 = makeCue("s27");

export const BEATS: Record<string, Shot[]> = {
  s04: [
    {
      plate: "peristalsis",
      t0: b04("Rings") - 0.2,
      t1: b04("As it relaxes"),
      keys: [{ t: 0, f: [0, 0.52, 1, 1] }],
      anns: [
        { k: "label", t: b04("Rings"), text: "B. Segmentation", say: "Guyton · segmentation contractions", color: GOLD },
        { k: "pin", t: b04("chain"), at: [0.5, 0.86], say: "Chyme churned, not pushed", color: TEAL, side: "u", dist: 60 },
      ],
    },
    {
      plate: "segmentation",
      t0: b04("As it relaxes"),
      t1: b04("Instead"),
      enter: "fade",
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b04("As it relaxes") + 0.3, text: "Regularly spaced", say: "New rings form in between", color: GOLD },
        { k: "label", t: b04("Chyme barely"), text: "Irregularly spaced", say: "Patterns shift constantly", color: TEAL },
      ],
    },
  ],
  s05: [
    {
      plate: "peristalsis",
      t0: b05("A contraction ring") - 0.2,
      t1: b05("Here,"),
      keys: [{ t: 0, f: [0, 0, 1, 0.5] }],
      anns: [
        { k: "label", t: b05("contraction ring"), text: "Contraction", say: "Contraction ring behind", color: CORAL, noTrace: true },
        { k: "label", t: b05("behind") + 0.2, text: "Relaxation", say: "Relaxation ahead", color: TEAL },
        { k: "label", t: b05("behind") + 0.6, text: "Direction of movement", say: "→ forward", color: GOLD },
      ],
    },
  ],
  s06: [
    {
      plate: "enteric-system",
      t0: b06("Both peristalsis") - 0.2,
      t1: 999,
      keys: [{ t: 0, f: [0.05, 0.12, 0.98, 0.98] }],
      anns: [
        { k: "label", t: b06("myenteric"), text: "Myenteric plexus", say: "Myenteric plexus", color: NERVE },
        { k: "label", t: b06("myenteric") + 0.6, text: "Circular muscle layer", say: "Circular layer", color: RED },
        { k: "label", t: b06("myenteric") + 1.1, text: "Longitudinal muscle layer", say: "Longitudinal layer", color: CORAL },
      ],
    },
  ],
  s07: [
    {
      plate: "enteroendocrine-table",
      t0: b07("It's regulated"),
      t1: b07("and it stops"),
      keys: [{ t: 0, f: [0, 0.05, 1, 0.98] }],
      anns: [{ k: "label", t: b07("motilin"), text: "Motilin", say: "Mo cells · motilin → MMC", color: GOLD, noTrace: true }],
    },
  ],
  s08: [
    {
      plate: "ileocecal-emptying",
      t0: b08("Between ileum") - 0.2,
      t1: b08("Peristaltic rush"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b08("Between ileum"), text: "Ileocecal sphincter", say: "Ileocecal junction", color: GOLD },
        { k: "label", t: b08("time for absorption") - 0.3, text: "in cecum inhibits", say: "Cecal pressure holds chyme back", color: CORAL },
      ],
    },
  ],
  s09: [
    {
      plate: "villus-vessels-lacteal",
      t0: b09("Each squeeze") - 0.2,
      t1: 999,
      keys: [{ t: 0, f: [0.3, 0, 1, 0.6] }],
      anns: [
        { k: "label", t: b09("Each squeeze"), text: "Smooth muscle", say: "Smooth-muscle strands squeeze", color: CORAL },
        { k: "label", t: b09("lymph"), text: "Lacteal", say: "…and pump the lacteal", color: GREEN },
      ],
    },
  ],
  s10: [
    {
      plate: "slow-waves-spikes",
      t0: b10("Vagal") - 0.2,
      t1: b10("Among hormones"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b10("Vagal"), text: "Stimulation by 1. Stretch", say: "Vagus (ACh) → depolarization → spikes", color: TEAL },
        { k: "label", t: b10("Sympathetic"), text: "Stimulation by 1. Norepine", say: "Sympathetic (NE) → hyperpolarization", color: CORAL },
      ],
    },
    {
      plate: "gi-hormones-table",
      t0: b10("Among hormones"),
      t1: 999,
      enter: "fade",
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b10("gastrin"), text: "Gastrin", say: "Gastrin ↑", color: TEAL, noTrace: true },
        { k: "label", t: b10("CCK"), text: "Cholecystokinin", say: "CCK ↑", color: TEAL, noTrace: true },
        { k: "label", t: b10("motilin"), text: "Motilin", say: "Motilin ↑ (MMC)", color: GOLD, noTrace: true },
        { k: "label", t: b10("Secretin"), text: "Secretin", say: "Secretin ↓", color: CORAL, noTrace: true },
      ],
    },
  ],
  s11: [
    {
      plate: "enteric-control",
      t0: b11("Impulses") - 0.2,
      t1: b11("The ileocecal valve"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b11("myenteric"), text: "Myenteric plexus", say: "Myenteric plexus", color: NERVE },
        { k: "label", t: b11("vagus"), text: "Parasympathetic", say: "Vagal input", color: TEAL },
      ],
    },
    {
      plate: "ileocecal-emptying",
      t0: b11("The ileocecal valve"),
      t1: b11("A new meal"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b11("relaxes"), text: "Ileocecal sphincter", say: "Sphincter relaxes", color: TEAL },
        { k: "label", t: b11("passes"), text: "Fluidity of contents", say: "Chyme into the cecum", color: GOLD },
      ],
    },
  ],
  s12: [
    {
      plate: "crypt-lieberkuhn",
      t0: b12("Two cell") - 0.2,
      t1: b12("about eighteen"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b12("Goblet"), text: "Mucous goblet cell", say: "Goblet cells → mucus", color: TEAL },
        { k: "label", t: b12("Enterocytes secrete"), text: "Epithelial cell", say: "Enterocytes → water & ions", color: GOLD },
      ],
    },
    {
      plate: "daily-secretions",
      t0: b12("about eighteen"),
      t1: b12("Up on the villi"),
      enter: "fade",
      keys: [{ t: 0, f: [0, 0, 0.9, 1] }],
      anns: [{ k: "label", t: b12("eighteen") + 0.2, text: "Small intestine secretion", say: "1800 mL/day · pH 7.5–8.0", color: GOLD, noTrace: true }],
    },
    {
      plate: "crypts-paneth",
      t0: b12("Up on the villi"),
      t1: 999,
      keys: [{ t: 0, f: [0, 0, 0.5, 1] }],
      anns: [
        { k: "label", t: b12("Up on the villi") + 0.2, text: "V", say: "Villi absorb", color: TEAL },
        { k: "label", t: b12("Up on the villi") + 0.8, text: "IC", say: "Crypts secrete", color: GOLD },
      ],
    },
  ],
  s13: [
    {
      plate: "brunner-glands",
      t0: b13("Brunner") - 0.2,
      t1: b13("They respond"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b13("Brunner"), text: "DG", say: "Brunner’s glands · submucosa", color: GOLD },
        { k: "label", t: b13("alkaline"), text: "MM", say: "Below the muscularis mucosae", color: TEAL },
      ],
    },
    {
      plate: "daily-secretions",
      t0: b13("They respond"),
      t1: 999,
      enter: "fade",
      keys: [{ t: 0, f: [0, 0, 0.9, 1] }],
      anns: [{ k: "label", t: b13("They respond") + 0.2, text: "Brunner's gland secretion", say: "≈200 mL/day · pH 8.0–8.9", color: GOLD, noTrace: true }],
    },
  ],
  s14: [
    {
      plate: "microvilli",
      t0: b14("Most stay") - 0.2,
      t1: b14("Peptidases"),
      keys: [{ t: 0, f: [0, 0, 1, 0.66] }],
      anns: [
        { k: "label", t: b14("brush border"), text: "G", say: "Glycocalyx: the enzymes sit here", color: GOLD },
        { k: "label", t: b14("inside"), text: "TW", say: "Terminal web", color: TEAL },
      ],
    },
  ],
  s15: [
    {
      plate: "carbohydrate-digestion",
      t0: b15("Pancreatic amylase") - 0.2,
      t1: 999,
      keys: [
        { t: 0, f: [0, 0, 0.5, 1] },
        { t: b15("The brush border") - 0.2, f: [0, 0, 1, 1], dur: 1.2 },
      ],
      anns: [
        { k: "label", t: b15("Pancreatic amylase"), text: "Pancreatic amylase", say: "Pancreatic amylase 50–80%", color: GOLD },
        { k: "label", t: b15("Maltase"), text: "Maltase and", say: "Maltase · α-dextrinase", color: TEAL },
        { k: "label", t: b15("Sucrase"), text: "Sucrase (intestine)", say: "Sucrase", color: CORAL },
        { k: "label", t: b15("Lactase"), text: "Lactase (intestine)", say: "Lactase", color: VIOLET },
      ],
    },
  ],
  s16: [
    {
      plate: "pancreas-duodenum-histo",
      t0: b16("The rest") - 0.2,
      t1: b16("Enterokinase"),
      keys: [{ t: 0, f: [0, 0.05, 0.5, 0.75] }],
      anns: [
        { k: "label", t: b16("duodenum"), text: "Duodenum", say: "Duodenum", color: GOLD },
        { k: "label", t: b16("jejunum"), text: "Jejunum", say: "Jejunum", color: TEAL },
      ],
    },
  ],
  s17: [
    {
      plate: "protein-digestion",
      t0: b17("Trypsin") - 0.2,
      t1: b17("Only a small"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b17("Trypsin"), text: "Trypsin, chymotrypsin", say: "Pancreatic proteases", color: GOLD },
        { k: "label", t: b17("polypeptides"), text: "Polypeptides", say: "→ polypeptides", color: TEAL },
        { k: "label", t: b17("elastase"), text: "elastase", color: CORAL },
      ],
    },
  ],
  s18: [
    {
      plate: "bile-gallbladder",
      t0: b18("First, bile") - 0.2,
      t1: b18("They're amphipathic"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b18("First, bile"), text: "Cholecystokinin via blood", say: "CCK: gallbladder contracts", color: GOLD },
        { k: "label", t: b18("lecithin"), text: "Sphincter", say: "Bile enters the duodenum", color: TEAL },
      ],
    },
    {
      plate: "fat-digestion",
      t0: b18("This is emulsification") - 0.4,
      t1: b18("Now pancreatic"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [{ k: "label", t: b18("emulsification"), text: "(Bile + agitation)", say: "Bile + churning = emulsified fat", color: GOLD }],
    },
    {
      plate: "fat-hydrolysis",
      t0: b18("Now pancreatic"),
      t1: b18("Without enough"),
      enter: "fade",
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b18("pancreatic lipase"), text: "Lipase", say: "Pancreatic lipase", color: GOLD },
        { k: "label", t: b18("free fatty"), text: "(Stearic acid)", say: "Free fatty acids", color: TEAL },
        { k: "label", t: b18("two-monoglycerides") , text: "(2-Monoglyceride)", say: "2-monoglyceride", color: CORAL },
      ],
    },
  ],
  s20: [
    {
      plate: "brush-border-tem",
      t0: b20("biggest") - 0.2,
      t1: 999,
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [{ k: "label", t: b20("biggest") + 0.4, text: "Brush border", say: "Brush border (TEM)", color: TEAL }],
    },
  ],
  s22: [
    {
      plate: "na-glucose-cotransport",
      t0: b22("Glucose and galactose") - 0.2,
      t1: b22("Fructose"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b22("with sodium"), text: "Na-binding", say: "Na⁺ binds", color: C.na },
        { k: "label", t: b22("SGLT1") + 0.2, text: "Glucose-binding site", say: "Glucose rides along", color: GOLD },
      ],
    },
    {
      plate: "hexose-absorption",
      t0: b22("Fructose"),
      t1: b22("Pentoses"),
      keys: [{ t: 0, f: [0, 0, 1, 0.86] }],
      anns: [
        { k: "label", t: b22("Fructose") + 0.2, text: "SGLT1", say: "SGLT1", color: GOLD, noTrace: true },
        { k: "label", t: b22("GLUT5"), text: "GLUT5", say: "GLUT5 · fructose", color: TEAL, noTrace: true },
        { k: "label", t: b22("GLUT2"), text: "GLUT2", say: "GLUT2 → blood", color: CORAL, noTrace: true },
      ],
    },
  ],
  s23: [
    {
      plate: "na-cl-glucose-aa",
      t0: b23("L-amino") - 0.2,
      t1: b23("D-amino"),
      keys: [{ t: 0, f: [0, 0, 1, 0.9] }],
      anns: [{ k: "label", t: b23("sodium cotransport"), text: "Amino Acids", say: "Na⁺–amino acid cotransport", color: GOLD }],
    },
  ],
  s24: [
    {
      plate: "lipid-absorption-enterocyte",
      t0: b24("Two:") - 0.2,
      t1: b24("With plenty"),
      keys: [{ t: 0, f: [0.565, 0, 1, 1] }],
      anns: [
        { k: "label", t: b24("Two:"), text: "Triglyceride synthesis", say: "② SER: triglycerides rebuilt", color: GOLD, noTrace: true },
        { k: "label", t: b24("Three:"), text: "chylomicron", say: "③ Golgi: chylomicrons", color: TEAL, noTrace: true },
        { k: "label", t: b24("Four:"), text: "Lymphatic capillary", say: "④ ⑤ into the lacteal", color: GREEN, noTrace: true },
      ],
    },
  ],
  s26: [
    {
      plate: "ion-water-transport",
      t0: b26("Water and electrolytes cross") - 0.2,
      t1: b26("Tight junctions"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b26("transcellular"), text: "Lumen", say: "Through the cells", color: GOLD, noTrace: true },
        { k: "label", t: b26("paracellular"), text: "Tight junction", say: "Between them · tight junction", color: TEAL, noTrace: true },
      ],
    },
    {
      plate: "junctional-complexes",
      t0: b26("Tight junctions"),
      t1: 999,
      keys: [{ t: 0, f: [0, 0, 1, 0.55] }],
      anns: [{ k: "label", t: b26("leaky"), text: "Tight junction (occluding", say: "Leaky in the small intestine", color: TEAL }],
    },
  ],
  s27: [
    {
      plate: "epithelial-active-transport",
      t0: b27("The basolateral") - 0.2,
      t1: b27("The jejunum absorbs"),
      keys: [{ t: 0, f: [0, 0, 1, 1] }],
      anns: [
        { k: "label", t: b27("pump"), text: "Active transport", say: "Na⁺ pumped out", color: GOLD },
        { k: "label", t: b27("water follows"), text: "Osmosis", say: "Water follows", color: C.water },
      ],
    },
  ],
};
