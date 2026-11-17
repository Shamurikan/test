# Textbook figures

This film shows the original textbook figures for both the anatomy and the physiology. They come from the six excerpt PDFs the user supplied:
- Gray's Anatomy for Students, Ch. 4 (Abdomen)
- Junqueira's Basic Histology, Ch. 1–5 and 15–17
- Guyton and Hall Medical Physiology, Ch. 1–13 and 55–67

The figures are copyrighted and used here for the user's own study, so neither the source PDFs nor the extracted images are committed to git (see `.gitignore`). The scripts below regenerate them from the user's PDFs, and SHA-256 checksums in `figlib/index/source_sha256.txt` identify the exact source files.

## Image handling (ORI *Guidelines for Best Practices in Image Processing*, INMED 2012)

| Guideline | How it is applied |
|---|---|
| 1. Treat images as data; document all processing | Every plate's manifest entry (`figlib/index/manifest_curated.json`) records the source PDF and its SHA-256, the page, the crop box in PDF points, the render DPI and resampling rule, and the SHA-256 of the output file |
| 2. Keep the original | Embedded rasters are first written byte-for-byte in their native encoding (`figlib/raw/`); the PDFs themselves stay untouched (`figlib/src/` links to the uploads) |
| 3. Simple adjustments to the whole image only | None are applied: no levels, contrast, colour, sharpening or noise filtering |
| 4. Cropping is acceptable | Each plate is the figure's own region (art plus its own labels); captions, legends, body text and page furniture are excluded |
| 5. Compare to the original | Contact sheets of every crop were reviewed against the page renders |
| 6. Manipulate the whole image, not parts | Nothing inside a plate is retouched, cloned, erased or recoloured |
| 7. Pseudo-colour | Not used |
| 10. Avoid lossy compression | Plates are lossless PNG; review sheets are JPEG and are never used as a source |
| 11–12. Resample once, by an integer factor | Each crop is rendered once from the PDF, at an integer multiple of the dominant raster's native resolution (≥ 300 dpi) or at 300 dpi for vector art; on screen the video only scales the whole plate |
| Annotation | Highlights, re-traced leader lines, pins, rings, traces, spotlights and loupes are drawn on a separate layer above the plate. The plate's pixels are only moved, scaled, or faded as a whole, and each shot credits its book and figure number |

## Pipeline

1. `script/fig_index.py`: per-page text, captions, raster inventory and vector-drawing density for all 694 pages.
2. `script/fig_captions.py` builds the caption list. `script/fig_extract.py` makes a first-pass crop of every candidate page (319 regions), which were reviewed visually.
3. `script/fig_curate.py`: the curated list of **174 figures**, ranked A (core), B (supporting) or C (least connection: clinical, comparison, context).
4. `script/fig_art.py` renders the art-only plates, with caption-anchored column detection for two-column Guyton pages.
5. `script/fig_labels.py` finds each plate's own labels and the point each label's leader line lands on (2,505 labels, 1,067 with leader tips) → `remotion/src/data/figlabels.json`. Scenes highlight a label by its text, e.g. `lab("duodenum-parts", "Superior mesenteric")`.
6. `script/validate_figs.py` checks that every narration cue and every referenced label exists.

## Figures on screen

| Plate | Book · Fig. | Title | Used in |
|---|---|---|---|
| `abdomen-boundaries` | Gray's Anatomy for Students · 4.1 (PDF p. 1) | Abdomen: boundaries | a01 |
| `abdomen-viscera` | Gray's Anatomy for Students · 4.2 (PDF p. 3) | The abdomen contains and protects the abdominal viscera | a01 |
| `gut-mesenteries` | Gray's Anatomy for Students · 4.6 (PDF p. 6) | The gut tube is suspended by mesenteries | a02 |
| `intra-to-retroperitoneal` | Gray's Anatomy for Students · 4.7 (PDF p. 7) | Intraperitoneal to secondarily retroperitoneal | a02 |
| `four-quadrants` | Gray's Anatomy for Students · 4.22 (PDF p. 23) | Four-quadrant topographical pattern | a01 |
| `nine-regions` | Gray's Anatomy for Students · 4.23 (PDF p. 24) | Nine-region organizational pattern | a01 |
| `greater-lesser-sacs` | Gray's Anatomy for Students · 4.54 (PDF p. 51) | Greater and lesser sacs (sagittal) | a02 |
| `greater-omentum` | Gray's Anatomy for Students · 4.59 (PDF p. 54) | Greater omentum | a01 |
| `mesentery-root` | Gray's Anatomy for Students · 4.61 (PDF p. 56) | Peritoneal reflections: root of the mesentery | a02 |
| `stomach-duodenum` | Gray's Anatomy for Students · 4.64 (PDF p. 58) | Stomach and first part of duodenum (pylorus) | a03 |
| `barium-stomach-duodenum` | Gray's Anatomy for Students · 4.65 (PDF p. 58) | Barium radiographs of stomach and duodenum | a03 |
| `duodenum-parts` | Gray's Anatomy for Students · 4.66 (PDF p. 59) | Duodenum: four parts and relations | a03, a04 |
| `duodenum-arteries` | Gray's Anatomy for Students · 4.67 (PDF p. 60) | Arterial supply to the duodenum | a04 |
| `barium-jejunum-ileum` | Gray's Anatomy for Students · 4.68 (PDF p. 60) | Barium radiograph: jejunum and ileum | a05 |
| `jejunum-ileum-arcades` | Gray's Anatomy for Students · 4.69 (PDF p. 61) | Jejunum vs ileum: arcades and vasa recta | a05 |
| `ileocecal-junction` | Gray's Anatomy for Students · 4.70 (PDF p. 61) | Ileocecal junction (radiograph, drawing, endoscopy) | a08 |
| `cecum-appendix` | Gray's Anatomy for Students · 4.82 (PDF p. 67) | Cecum, appendix and terminal ileum | a08 |
| `cecum-arteries` | Gray's Anatomy for Students · 4.85 (PDF p. 68) | Arterial supply to cecum and appendix (ileocolic) | a08 |
| `pancreas-duodenum-sma` | Gray's Anatomy for Students · 4.107 (PDF p. 82) | Pancreas, duodenum, SMA and SMV | a04 |
| `pancreatic-ducts-papillae` | Gray's Anatomy for Students · 4.109 (PDF p. 84) | Pancreatic duct system and duodenal papillae | a03 |
| `aorta-anterior-branches` | Gray's Anatomy for Students · 4.121 (PDF p. 93) | Anterior branches of the abdominal aorta | a06 |
| `foregut-midgut-hindgut` | Gray's Anatomy for Students · 4.122 (PDF p. 94) | Foregut, midgut and hindgut arterial supply | a04 |
| `sma-initial-branches` | Gray's Anatomy for Students · 4.126 (PDF p. 98) | Initial branching of the superior mesenteric artery | a06 |
| `sma-distribution` | Gray's Anatomy for Students · 4.127 (PDF p. 99) | Superior mesenteric artery: distribution and angiogram | a06 |
| `portal-vein-smv` | Gray's Anatomy for Students · 4.131 (PDF p. 104) | Portal vein and superior mesenteric vein | a06 |
| `prevertebral-ganglia` | Gray's Anatomy for Students · 4.137 (PDF p. 112) | Abdominal prevertebral plexus and ganglia | a07 |
| `enteric-system` | Gray's Anatomy for Students · 4.139 (PDF p. 114) | The enteric system | s06 |
| `abdominal-lymphatics` | Gray's Anatomy for Students · 4.168 (PDF p. 142) | Abdominal lymphatics: intestinal trunk, cisterna chyli | a07 |
| `visceral-pathways` | Gray's Anatomy for Students · 4.171 (PDF p. 146) | Nerve fibers passing through the prevertebral plexus | a07 |
| `l1-level-viscera` | Gray's Anatomy for Students · 4.179 (PDF p. 155) | LI vertebral level: duodenum, pancreas, SMA (surface) | a01 |
| `nine-regions-referred` | Gray's Anatomy for Students · 4.182 (PDF p. 158) | Nine regions and referred visceral pain | a07 |
| `na-glucose-cotransport` | Guyton and Hall Textbook of Medical Physiology · 4-13 (PDF p. 61) | Sodium co-transport of glucose | s22 |
| `epithelial-active-transport` | Guyton and Hall Textbook of Medical Physiology · 4-15 (PDF p. 62) | Active transport across a layer of cells | s27 |
| `intestinal-wall-section` | Guyton and Hall Textbook of Medical Physiology · 63-2 (PDF p. 99) | Cross section of the intestinal wall | a09 |
| `slow-waves-spikes` | Guyton and Hall Textbook of Medical Physiology · 63-3 (PDF p. 99) | Membrane potentials in intestinal smooth muscle | s10 |
| `enteric-control` | Guyton and Hall Textbook of Medical Physiology · 63-4 (PDF p. 101) | Neural control of the gut wall | s11 |
| `gi-hormones-table` | Guyton and Hall Textbook of Medical Physiology · T63-1 (PDF p. 103) | Table 63-1 Gastrointestinal hormone actions | s10 |
| `peristalsis` | Guyton and Hall Textbook of Medical Physiology · 63-5 (PDF p. 104) | Peristalsis: contraction and downstream relaxation | s04, s05 |
| `splanchnic-circulation` | Guyton and Hall Textbook of Medical Physiology · 63-6 (PDF p. 105) | Splanchnic circulation | a06 |
| `segmentation` | Guyton and Hall Textbook of Medical Physiology · 64-3 (PDF p. 113) | Segmentation movements of the small intestine | s04 |
| `ileocecal-emptying` | Guyton and Hall Textbook of Medical Physiology · 64-4 (PDF p. 115) | Emptying at the ileocecal valve | a08, s08, s11 |
| `daily-secretions` | Guyton and Hall Textbook of Medical Physiology · T65-1 (PDF p. 120) | Daily secretion of intestinal juices | s12, s13 |
| `bile-gallbladder` | Guyton and Hall Textbook of Medical Physiology · 65-11 (PDF p. 129) | Liver secretion and gallbladder emptying | s18 |
| `crypt-lieberkuhn` | Guyton and Hall Textbook of Medical Physiology · 65-13 (PDF p. 132) | A crypt of Lieberkuhn | s12 |
| `carbohydrate-digestion` | Guyton and Hall Textbook of Medical Physiology · 66-1 (PDF p. 135) | Digestion of carbohydrates | s15 |
| `protein-digestion` | Guyton and Hall Textbook of Medical Physiology · 66-2 (PDF p. 136) | Digestion of proteins | s17 |
| `fat-hydrolysis` | Guyton and Hall Textbook of Medical Physiology · 66-3 (PDF p. 136) | Hydrolysis of neutral fat by lipase | s18 |
| `fat-digestion` | Guyton and Hall Textbook of Medical Physiology · 66-4 (PDF p. 137) | Digestion of fats | s18 |
| `brush-border-tem` | Guyton and Hall Textbook of Medical Physiology · 66-7 (PDF p. 139) | Brush border of an epithelial cell | s20 |
| `na-cl-glucose-aa` | Guyton and Hall Textbook of Medical Physiology · 66-8 (PDF p. 140) | Absorption of Na+, Cl-, glucose and amino acids | s23 |
| `hexose-absorption` | Guyton and Hall Textbook of Medical Physiology · 66-9 (PDF p. 141) | Absorption of glucose, galactose and fructose | s22 |
| `junctional-complexes` | Junqueira's Basic Histology · 4-4 (PDF p. 22) | Junctional complexes of epithelial cells | s26 |
| `microvilli` | Junqueira's Basic Histology · 4-8 (PDF p. 26) | Microvilli: LM, SEM, TEM and molecular diagram | s14 |
| `ion-water-transport` | Junqueira's Basic Histology · 4-28 (PDF p. 43) | Ion and water absorption and secretion across epithelia | s26 |
| `gi-layers` | Junqueira's Basic Histology · 15-2 (PDF p. 3) | Major layers and organization of the digestive tract | a09 |
| `enteroendocrine-table` | Junqueira's Basic Histology · T15-1 (PDF p. 20) | Table 15-1 Principal enteroendocrine cells | s07 |
| `si-absorptive-surface` | Junqueira's Basic Histology · 15-22 (PDF p. 22) | Absorptive surface of the small intestine | a09 |
| `plicae-jejunum` | Junqueira's Basic Histology · 15-23 (PDF p. 23) | Circular folds (plicae circulares) of the jejunum | a05 |
| `lipid-absorption-enterocyte` | Junqueira's Basic Histology · 15-25 (PDF p. 25) | Lipid absorption and processing by enterocytes | s24 |
| `crypts-paneth` | Junqueira's Basic Histology · 15-26 (PDF p. 26) | Intestinal crypts with Paneth cells | s12 |
| `villus-vessels-lacteal` | Junqueira's Basic Histology · 15-28 (PDF p. 27) | Microvasculature, lymphatics and muscle in villi | a07, s09 |
| `brunner-glands` | Junqueira's Basic Histology · 15-29 (PDF p. 28) | Duodenal (Brunner) glands | a09, s13 |
| `pancreas-duodenum-histo` | Junqueira's Basic Histology · 16-7 (PDF p. 41) | Pancreas and duodenum (ampulla, papilla) | s16 |

63 plates appear on screen. The other 111 curated plates are indexed and ready for reuse; `figlib/index/curated.json` lists them all with topic and priority.
