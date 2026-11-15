# The Small Intestine: Move · Digest · Absorb

An explainer of Lecture 5, *Physiology of the small intestine: motility, secretion and absorption*
(Prof. Mohammed Alzoghaibi & Dr. Hayam Gad). It runs 14.7 minutes at 1920×1080, 30 fps.

## Idea

One meal enters the small intestine, and the tube does three jobs to it: it **moves** the meal,
**digests** it and **absorbs** it. Every scene is one of those jobs, shown with a mechanism you can watch:
a ring of muscle squeezing, an enzyme cutting a chain, a transporter carrying sodium and glucose together.

## Visual language

| Token | Value | Meaning |
| --- | --- | --- |
| Ground | baked radial plate `#261116 → #0B0608` + grain | "inside the body"; the same plate in both engines |
| Ink | `#F7EFE9` / muted `#CDBDB5` | text |
| Coral `#FF7A63` | accent, Part 1 (Move) | highlights, contraction |
| Gold `#FFC857` | fat, Part 2 (Digest) | triglycerides, fatty acids, chylomicrons |
| Teal `#3FD0BC` | protein, Part 3 (Absorb) | amino acids, peptides |
| Violet `#A891FF` | carbohydrate | glucose hexagons; fructose is a pink pentagon |
| Sky `#5CC8FF` | Na⁺ | sodium |
| Red `#E5484D` / Green `#6FD38A` | blood / lymph (lacteal) | textbook convention |

Type: **Fraunces** for titles and numbers, **Inter** for labels and captions, **JetBrains Mono** for small data tags.
Every diagram builds up one part at a time, and each part appears on the word that names it
(narration word timings come from Fish Audio ASR).

## Engines

- **HyperFrames** (HTML + GSAP): the title, the three chapter cards (one composition mounted three times with variables),
  the surface-area zoom (×3 ×10 ×20 = ×600), the 8-question quiz and the outro.
  They are rendered together into one clip, `remotion/public/hf/hf.mp4`.
- **Remotion** (React): the master timeline, 27 animated physiology scenes, the narration track, burned-in captions,
  and blur-swap transitions. The HyperFrames clip is placed into the master with `<Video trimBefore>`.

## Scenes

| # | Engine | Scene | Main visual |
| --- | --- | --- | --- |
| s01 | HF | Cold open | intestine coil drawing itself; title; Move · Digest · Absorb |
| s02 | RM | The tube | unrolled tube to scale: duodenum 0.5 m, jejunum 2–3 m, ileum 3–4 m; 90% bracket |
| c1 | HF | Part 1: Motility | chapter card |
| s03 | RM | Five patterns | five lanes, each running its own motion |
| s04 | RM | Segmentation | ring constrictions alternate; chyme sloshes back and forth (chain of sausages) |
| s05 | RM | Peristalsis | propulsive and receiving segments; circular and longitudinal muscle layers |
| s06 | RM | Speed, atropine | wave on a cm ruler fades after 3–5 cm; net 1 cm/min; 3–5 h; plexus dims under atropine |
| s07 | RM | MMC | glowing band sweeps the coiled intestine for 1.5–2 h, pushing debris into the colon |
| s08 | RM | Antiperistalsis, rush | backward waves at two junctions; fast flush with a brainstem reflex arc |
| s09 | RM | Villi | villi shorten fast, lengthen slowly and sway; lymph pumped down the lacteal |
| s10 | RM | Control of motility | accelerators vs brakes; the tube's wave speed reacts as each one lands |
| s11 | RM | Gastroileal reflex | stomach fills → vagal impulse → ileal wave → ileocecal valve opens |
| c2 | HF | Part 2: Secretion & digestion | chapter card |
| s12 | RM | Crypts of Lieberkühn | crypts secrete (arrows out), villi absorb (arrows in); 1800 mL/day, pH 7.5–8 |
| s13 | RM | Control of secretion, Brunner's glands | stimulators/inhibitor; alkaline mucus neutralising acid |
| s14 | RM | Brush-border enzymes | four enzyme families splitting substrates on the microvilli |
| s15 | RM | Carbohydrate digestion | starch chain chopped by ptyalin then pancreatic amylase; four disaccharidase lanes |
| s16 | RM | Protein activation | pepsin pH meter and collagen; enterokinase → trypsin cascade |
| s17 | RM | Protein cutting | endopeptidases cut, carboxypeptidase clips the COOH end; di/tripeptides |
| s18 | RM | Fat digestion | bile salts coat a globule → emulsified droplets → lipase → FA + 2-MG |
| s19 | RM | Micelles | self-assembly, negative heads outward, cargo inside, ferry to brush border |
| c3 | HF | Part 3: Absorption | chapter card |
| s20 | HF | Absorptive surface | zoom: folds ×3 → villi ×10 → microvilli ×20 = ×600 → 250 m² tennis court |
| s21 | RM | End products | each nutrient morphs into its absorbable form |
| s22 | RM | Carbohydrate absorption | SGLT1, GLUT5, GLUT2, Na⁺/K⁺-ATPase; lactose intolerance |
| s23 | RM | Protein absorption | Na⁺–AA, D-AA diffusion, H⁺–peptide carrier, cytoplasmic peptidases; cystinuria |
| s24 | RM | Fat absorption | five numbered steps from micelle to lacteal; 97% vs 40–50% |
| s25 | RM | Vitamins | sites along the tube; B12 + intrinsic factor; pernicious anemia |
| s26 | RM | Fluid budget, routes | 9 L in → 8.5 L + 0.4 L absorbed; transcellular vs paracellular |
| s27 | RM | Sodium & water | four Na⁺ entry routes; pump into the lateral space; water follows |
| s28 | RM | Cl⁻, K⁺, HCO₃⁻, Ca²⁺ | four ion panels; PTH → vitamin D pathway |
| s29 | RM | Hormonal control of absorption | each hormone lights up the segment it acts on |
| s30 | RM | Where nutrients go | blood → portal vein → liver; lymph → thoracic duct → left subclavian vein |
| s31 | RM | Absorption sites | Gantt-style bands along the tube |
| s32 | HF | Quiz | the lecture's 6 MCQs + 2 SAQs with a countdown and an answer reveal |
| s33 | HF | Outro | 6 m · 250 m² · 9 L/day; "almost nothing goes to waste" |
