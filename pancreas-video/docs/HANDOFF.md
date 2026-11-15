# HANDOFF — Physiology of the Pancreas: Animated Teaching Video

Handoff prepared 2026-11-15 from a claude.ai session, so the project can continue in Claude Code.
Markers used in this document: **[ESTABLISHED]** means decided or verified in the session. **[ASSUMPTION]** means my default, never confirmed by the user. **[OPEN]** means unresolved.

---

## 0. Read this first (60-second orientation)

- **What:** a ~25-minute, professionally animated medical teaching video on the physiology of the (mainly exocrine) pancreas. It is built from the user's lecture *L4) Physiology of pancreas*, narrated by the user's own TTS audio, with every visual synchronized to the spoken words.
- **Where we are:** the script, visual plan and TTS audio are done. The audio is aligned word by word and the final soundtrack edit is built (25:22.75). A complete animation engine plus component library exists. **Chapter 0 (0:00–0:59) is fully built, rendered and synced.** Three style frames were made for review.
- **Checkpoint state [OPEN]:** the user was sent the Chapter 0 synced sample and three style frames and asked to approve the look before Chapters 1–9 are built. **The user has not yet approved or commented.** They asked for this handoff instead.
- **Next action:** set up the environment (§10.1). Rebuild the timeline and render Chapter 0 to prove the setup works. Ask the user whether the Chapter 0 look and timing are approved, or what to change. Then build `web/ch1.js` … `web/ch9.js` following `docs/SCRIPT_AND_VISUAL_PLAN.md`, render, assemble and deliver.
- **Authoritative spec for visuals and narration:** `docs/SCRIPT_AND_VISUAL_PLAN.md`. It is an exact export of the claude.ai Docs artifact, rev 28. Its narration is verified word-for-word identical to `docs/Pancreas_narration_for_TTS.txt`, which is the text the audio was generated from.

---

## 1. Project purpose and the user's requirements

### 1.1 The user's brief (from the user's instruction file; paraphrased closely, key phrases verbatim)

The user uploaded a lecture plus an example analyzed script. The example is an Osmosis.org video about ischemic stroke: *"Its topic is unrelated to the current lecture, so disregard its medical content completely."* It is only a reference for *"the quality and approach I am aiming for, particularly its narration, explanatory depth, pacing, organization, and coordination between spoken explanations and visual media."*

Requirements **[ESTABLISHED]**:
- *"Approach this as an educational production project, not simply a task of summarizing slides or generating narration."*
- Use your own medical understanding, creativity and professional judgment. Full creative freedom over teaching approach, presentation, visual design and structure. *"Take ownership of the creative and educational decisions… rather than following a predetermined template."*
- Speaker voice: *"an experienced medical professor: medically knowledgeable, intellectually precise, clear, engaging"*. Substantial medical depth while staying natural and easy to follow.
- Narration and visuals must be developed **together**. Visuals are not an afterthought; *"each visual serving a clear educational purpose."*
- The script must be natural spoken narration suitable for a third-party TTS app.
- *"I am not looking for a conventional slide presentation with voiceover, nor do I want a basic AI-generated video."*
- Final result: *"visuals naturally following the speaker's explanations rather than appearing as disconnected illustrations or a sequence of slides."* Particular attention to *"accurate synchronization, appropriate pacing, continuity between scenes, visual clarity, and the relationship between what is being said and what is being shown."*

### 1.2 The user's 4-phase workflow [ESTABLISHED]

1. Understand the lecture and develop the explanation. **Done.**
2. Create the narration script and visual plan together. **Done** (`docs/SCRIPT_AND_VISUAL_PLAN.md`).
3. The user generates audio externally with a TTS app. That app does not preserve timestamps, so **the final audio is the reference for all timing.** **Done:** the audio was received and aligned.
4. Produce the video and synchronize everything to the actual audio. **In progress:** Chapter 0 is done; Chapters 1–9 remain.

### 1.3 Other context
- The user's timezone is Asia/Riyadh. They used the claude.ai **mobile app** in the original session. Docs and long content were read on a phone.
- The lecture comes from a student team's annotated notes ("Physiology team 445"). It marks slide content by source (male/female slides), "Important", "Doctor's notes" and "Extra".
- **[OPEN] Possible content update:** the lecture's front page says it *"was reviewed using last year's slide 44, as this year's slides are not yet available… we will update you if any changes are found."* If the user later supplies an updated lecture, re-check the script.

---

## 2. Status by phase

| Phase / item | Status | Where |
|---|---|---|
| Lecture study, fact-checking against Guyton & First Aid | Done | §4, plan's "Accuracy notes" |
| Narration script (10 chapters, 51 beats, 3,637 words) | Done, final (audio generated from it) | `docs/SCRIPT_AND_VISUAL_PLAN.md`, `docs/Pancreas_narration_for_TTS.txt` |
| Visual plan (per-beat Visual / On screen / Sync anchors) | Done | same plan file |
| TTS audio from user | Received: 24:47.66, complete | user's file `f572c344-Pancreas_narration_for_TTS.m4a` |
| Audio-to-script alignment (word-level) | Done, verified | `prod/align.py` → `prod/align.json` |
| Soundtrack edit + final timeline (25:22.75) | Done | `prod/build_timeline.py` → `final_audio.wav` (regenerate), `prod/timeline.json` |
| Animation engine + component library | Done (extend as needed) | `prod/web/engine.js`, `prod/web/lib.js` |
| Chapter 0 animation | **Done, rendered, synced** | `prod/web/ch0.js`, `prod/parts/ch0.mp4`, `prod/parts/Pancreas_Ch0_sync_sample.mp4` |
| Style frames (duct cell, acinus, board) | Done, sent to user | `prod/frames/style_*.jpg` (scenes `ch103/101/109.js`) |
| User approval of look and sync | **[OPEN] pending** | — |
| Chapters 1–9 animation | **Not started** | to create: `prod/web/ch1.js` … `ch9.js` |
| Full render, assembly, QC, delivery | Not started | `render_chapter.py`, `assemble.py` |

---

## 3. File inventory

### 3.1 Original files the user uploaded (download these separately)

| Uploaded filename (as stored) | What it is | Relevance | Download? Put it here |
|---|---|---|---|
| `c6c746df-L4_Physiology_of_pancreas.pdf` (16 MB, 13 pages, A2, made in Canva; title "L4) Physiology of pancreas") | **The lecture**: the subject of the video. Team-annotated notes with objectives, figures, doctor's notes, MCQs (p.12) and SAQs (p.13). | **Primary content source.** | **YES** → `source/L4_Physiology_of_pancreas.pdf` |
| `f572c344-Pancreas_narration_for_TTS.m4a` (12.2 MB, AAC, 24:47.66) | **The TTS narration audio** generated by the user from `Pancreas_narration_for_TTS.txt`. | **Master clock for all timing. Required to rebuild the soundtrack.** | **YES** → `prod/audio_in/narration.m4a` (rename exactly) |
| `c94c92eb-attachment.txt` (7.8 KB) | Example "analyzed script with timings" from an Osmosis video on ischemic stroke (25:29). | Style and quality reference only. Medical content to be ignored. | Recommended → `source/reference_osmosis_stroke_script.txt` |
| `08892c59-attachment.txt` (5 KB) | **The user's project instructions** (the brief in §1.1). | The user's own words on requirements. | Recommended → `source/user_project_instructions.txt` |
| `41b10140-attachment.txt` (38 KB) | "Professional Audio & Narration Editor Analysis" of the audio, supplied by the user (made by a third-party tool). | **Unreliable; NOT used for timing** (see §6.2). Keep only for reference. | Optional → `source/audio_analysis_UNRELIABLE.txt` |
| `Hall__John_E__-_Guyton_and_Hall_Textbook_of_Medical_Physiology__14th_Edition__2021_.pdf` (62 MB) | Guyton & Hall, 14th ed. | Fact-checking source. Pages used: printed 808 (glandular secretion), 815–816 (pancreatic secretion), 825–826 (digestion). PDF page = printed page − 43. | Optional (only needed for re-checking facts) → `source/` |
| `Le__Tao__…First_Aid_for_the_USMLE_Step_1__35th_Edition__2025_.pdf` (125 MB) | First Aid for the USMLE Step 1, 2025. | Fact-checking source. Pages used: 58 (CF), 357 (ZES), 378 (GI regulatory substances), 380 (pancreatic secretions and enzymes), 404 (acute pancreatitis). PDF page = printed page + 21. | Optional → `source/` |
| `730630df-L1_General_principles_of_GIT_physiology_1__2.pdf` (22 MB, 21 pages) | A different lecture (L1&2 General principles of GIT physiology). It was in the upload folder before this project started and was **never referenced** in this conversation. | **Not part of this project** (possibly a future video in the same series). | Not needed |

**Minimum needed to continue:** the lecture PDF and the `.m4a` audio. Everything else needed is inside this package.

### 3.2 Files produced in the claude.ai session

| Item | Location | Notes |
|---|---|---|
| Docs artifact "Physiology of the Pancreas — Narration Script & Visual Plan" | https://claude.ai/artifact/5Gzi9BjVM5csPgiUJy3Hy5 (doc id `22a0469c-aa03-41b1-865a-fa344664d8a4`) | **Claude Code cannot open it.** The exact export is in this package as `docs/SCRIPT_AND_VISUAL_PLAN.md` (snapshot rev 28). If the user edits the claude.ai doc later, they must re-export it (Markdown) and replace the file. |
| `Pancreas_narration_for_TTS.txt` | `docs/` | The exact text the user pasted into the TTS app. It includes `[Chapter N - Title]` lines, which the TTS app read aloud. |
| `Pancreas_Ch0_sync_sample.mp4` | `prod/parts/` | Chapter 0 with audio (59.13 s), as sent to the user for approval. |
| `style_duct_cell.jpg`, `style_acinus.jpg`, `style_board.jpg` | `prod/frames/` | Style frames sent to the user for approval. |

### 3.3 This package

```
pancreas_video_project/
├── HANDOFF.md                     ← this file
├── CLAUDE.md                      ← short pointer and rules for Claude Code
├── docs/
│   ├── SCRIPT_AND_VISUAL_PLAN.md  ← AUTHORITATIVE spec: narration + per-beat visual plan + TTS notes + accuracy notes
│   ├── Pancreas_narration_for_TTS.txt   ← exact TTS input text (alignment input)
│   └── reference/L4_pancreas_lecture_text_extract.txt  ← pdftotext -layout of the lecture (for quick searching)
├── source/                        ← put the original uploads here (see 3.1)
└── prod/                          ← production; run every script FROM THIS FOLDER
    ├── envelope.py        step 1: audio_in/narration.m4a → audio_in/db.npy (loudness envelope)
    ├── align.py           step 2: script ↔ audio alignment → align.json
    ├── build_timeline.py  step 3: edit soundtrack → final_audio.wav + timeline.json
    ├── make_tljs.py       step 4: timeline.json → web/tl.js
    ├── render.py          render frames (stills or frame ranges) with headless Chromium → mp4
    ├── render_chapter.py  render one chapter with N parallel workers → parts/chN.mp4
    ├── assemble.py        concat chapters + mux final_audio.wav → output/*.mp4
    ├── align.json, timeline.json, frames_index.txt   (generated; already present and verified)
    ├── audio_in/          db.npy present; PUT narration.m4a HERE
    ├── web/
    │   ├── index.html     page shell; loads tl.js, engine.js, lib.js, then ch{N}.js from ?ch=N
    │   ├── engine.js      animation engine (tracks, camera, text, anchors)
    │   ├── lib.js         components (gut map, acinus, duct cell, board, pH strip, ions, title cards…)
    │   ├── tl.js          timeline data (TL_DATA global)
    │   ├── ch0.js         Chapter 0 (done)
    │   ├── ch101.js ch103.js ch109.js   style-frame scenes (acinus, duct cell, board), not in the film
    │   └── fonts/         Inter OTFs bundled (OFL licence) so rendering does not depend on system fonts
    ├── parts/             ch0.mp4 (rendered Ch0, video only), Pancreas_Ch0_sync_sample.mp4
    ├── frames/            style frames; stills go here
    └── output/            final assembled videos go here
```

Not included because they regenerate: `final_audio.wav` (73 MB; run `build_timeline.py`) and the 16 kHz raw decode. The pipeline was **re-run from inside this package** before handoff: `align.json` and `timeline.json` came out byte-identical, the bundled-font render was pixel-identical to the original style frame, and `render_chapter.py 0` plus `assemble.py --partial` produced a correct 59.13 s, 1920×1080, 30 fps H.264 + AAC file.

---

## 4. Content: the lecture and the medical fact base

### 4.1 Lecture objectives (all 7 are covered by the script) [ESTABLISHED]
1. Functional anatomy of the pancreas → Ch1
2. Major components of pancreatic juice and their physiologic roles → Ch2, Ch6
3. Cellular mechanisms of bicarbonate secretion → Ch3
4. Activation of pancreatic digestive enzymes → Ch5
5. Cellular mechanisms of enzyme secretion → Ch4
6. Hormonal and neural regulation of pancreatic secretion → Ch7 (+ CCK/secretin other actions in Ch8)
7. Potentiation of the secretory response → Ch8

### 4.2 Key lecture facts used (from the slides)
- Compound gland (exocrine + endocrine); exocrine ~99%; islets ~1%; β ~60% (insulin), α ~25% (glucagon), δ ~10% (somatostatin).
- Pancreatic duct joins the common bile duct → papilla of Vater, sphincter of Oddi.
- Juice: 1.2–1.5 L/day, pH ~8, isotonic, HCO₃⁻ rises with flow rate. Organic 1–2% (enzymes, acinar cells); inorganic ~1% (Na⁺, K⁺, Ca²⁺, Cl⁻, HCO₃⁻; centroacinar and intercalated duct cells).
- Functions: neutralize acid (enzyme optimum pH 7–8), protect duodenal mucosa, digest.
- Enzymes: trypsin, chymotrypsin, elastase, carboxy(poly)peptidase A & B; amylase (α-1,4; maltose, few trisaccharides; not cellulose); lipase (+ colipase + bile salts) → 2-monoglyceride + 2 FFA; cholesterol esterase; phospholipase A₂ → lysolecithin + FA; RNase/DNase → mononucleotides.
- Activation: enteropeptidase (enterokinase) → trypsin; trypsin activates the rest and is autocatalytic. Trypsin inhibitor protects the gland; duct blockade → acute pancreatitis (autodigestion within hours).
- HCO₃⁻ mechanism: CO₂ + H₂O → (carbonic anhydrase) → H₂CO₃ → H⁺ + HCO₃⁻. H⁺ exits basolaterally (Na⁺/H⁺ exchange, secondary active via Na⁺/K⁺ ATPase). HCO₃⁻ exits apically (Cl⁻/HCO₃⁻ exchanger); Cl⁻ recycled through an apical channel. Pancreatic venous blood "acid tide" vs gastric "alkaline tide".
- Flow rate: HCO₃⁻ ↑ and Cl⁻ ↓ reciprocally; Na⁺ and K⁺ constant near plasma.
- Phases: cephalic ~20%, gastric 5–10%, intestinal 70–75%. The gastric phase is most important for gastric secretion; the intestinal phase is most important for pancreatic secretion (inverse relationship). Vagotomy affects the cephalic and gastric phases.
- Stimuli: ACh (vagus, enteric), CCK (I cells; peptides/proteoses/peptones, long-chain fatty acids → enzymes; 70–80% of post-meal enzymes), secretin (S cells; prosecretin; duodenal pH < 4.5–5.0 → HCO₃⁻ up to 145 mEq/L, ~5× plasma). Second messengers: CCK/ACh → IP₃/Ca²⁺ (acinar); secretin → cAMP (duct). Potentiation (multiplicative effect).
- Other actions (lecture lists, shown on the reference card in Ch8): CCK augments secretin's HCO₃⁻ effect, contracts the gallbladder, relaxes Oddi, slows gastric emptying, ↑ intestinal motility and relaxes the ileocecal sphincter, trophic, satiety. Secretin augments CCK's enzyme effect, ↑ hepatic bile flow and biliary HCO₃⁻, ↓ gastric acid and gastrin, ↑ pepsin secretion, ↓ gastric motility, contracts the pylorus, slows emptying, relaxes the LES, ↓ intestinal motility, contracts the ileocecal sphincter.

### 4.3 Doctor's notes and emphasis in the lecture [ESTABLISHED]
- The acinus/duct figure: *"Dr. Focused on this Picture (Pictures are Important)"* → acinus cross-section is a key frame (Ch1 1.3).
- Pancreatic juice secretion in response to chyme: *"Could come in SAQs"*. Zymogen synthesis/activation: *"Could come in SAQs"*.
- Trypsin inhibitor page: *"Dr: 'SAQs will come from this', You need to know that it relates to Zollinger Addison Syndrome"*. "Addison" is a typo for **Zollinger–Ellison**; it is handled as the Ch2 clinical link.
- Enzyme table: *"This is just a collection of all the enzymes. The activity shown in this picture isn't important."* So enzyme specificities appear only as light on-screen labels plus one sentence.
- Acid tide vs alkaline tide marked SAQ (female doctor explained).
- SAQs at the end: phases of pancreatic secretion; multiplicative/potentiation effect; "Mention the divisions of the pancreas". MCQ answer key printed: A-C-A-B-D-A.

### 4.4 Corrections and refinements relative to the slides [ESTABLISHED]
The full table with sources is in the plan's **"Accuracy notes"** section. In brief:
- **"Compound gland":** in histology this means *branched ducts*, not "exocrine + endocrine". Narration uses "compound gland" for the duct tree (Ch1 1.3) and "two glands sharing one body" for exocrine plus endocrine (Ch1 1.1).
- Amylase and lipase are secreted **active**. Prophospholipase A₂ and procolipase are activated by trypsin.
- The apical Cl⁻ channel is named **CFTR**. Cystic fibrosis is added as a clinical link. Secretin → cAMP → opens CFTR (beyond the slides; one sentence).
- The flow-rate curve is explained as a two-fluid mixture (Cl⁻-rich acinar vs HCO₃⁻-rich ductal).
- Acid and alkaline tides are phrased cautiously: they "tend to offset".
- Vagotomy: slides say "affected"; narration says **"greatly reduced"** (revised from my earlier draft, "lost").
- "Every turn of the Cl⁻ cycle pushes **more** bicarbonate" (revised from "one bicarbonate"; the exchanger stoichiometry can be 1 Cl⁻ : 2 HCO₃⁻).
- Daily volume: "one to one and a half liters" (slides 1.2–1.5; Guyton ~1 L).

---

## 5. The teaching design (summary; the plan file is the full spec)

- **Spine [ESTABLISHED]:** "Two factories in one organ." The **acinar factory** makes enzymes, is triggered by nutrients via CCK + ACh, uses Ca²⁺ (IP₃), and fails by premature activation → pancreatitis. The **duct factory** makes HCO₃⁻ fluid, is triggered by acid via secretin, uses cAMP, and fails when CFTR is defective → cystic fibrosis. A recurring **two-factory board** fills in across chapters and is complete in Ch9.
- **Enzyme arc:** made → locked → shipped → unlocked → put to work.
- **Clinical links (only where they explain physiology):** ZES (Ch2), CF (Ch3), acute pancreatitis (Ch5), vagotomy (Ch7).
- **Taken from the Osmosis reference:** a guiding question opens each chapter (on a title card); short declarative sentences; the visual changes every 1–2 sentences; longer pauses at chapter boundaries. The reference had sentence-level timings, ~0.4–0.85 s pauses between sentences, 0.85–1.4 s at section transitions marked [P-01]…[P-07], and a 25:29 runtime.

### 5.1 Chapters and final timing [ESTABLISHED; times are in the FINAL edited timeline]

| Ch | Title (title-card question) | Final t0–t1 (s) | Global frames @30fps | Plan beats | Status |
|---|---|---|---|---|---|
| 0 | Cold open (no card; main title at the end: "Physiology of the Pancreas" / "Two factories in one gland") | 0.00–59.12 | 0–1774 | 0.1–0.4 | **Done** |
| 1 | One organ, two glands (*How is the pancreas built to make two very different products?*) | 59.12–208.10 | 1774–6243 | 1.1–1.5 | To build |
| 2 | Pancreatic juice (*What does the pancreas actually secrete, and why is it built that way?*) | 208.10–329.95 | 6243–9898 | 2.1–2.4 | To build |
| 3 | The bicarbonate factory (*How does one cell produce fluid five times richer in bicarbonate than blood?*) | 329.95–580.23 | 9898–17407 | 3.1–3.9 | To build |
| 4 | The enzyme factory (*How does a cell manufacture enzymes that could destroy it, and survive?*) | 580.23–708.03 | 17407–21241 | 4.1–4.6 | To build |
| 5 | Unlocking (*If everything leaves the pancreas locked, where is the key?*) | 708.03–823.96 | 21241–24719 | 5.1–5.4 | To build |
| 6 | The arsenal at work (*Once unlocked, what does each enzyme actually do?*) | 823.96–989.79 | 24719–29694 | 6.1–6.5 | To build |
| 7 | Control (*How does the pancreas know when to secrete, and what to secrete?*) | 989.79–1240.34 | 29694–37210 | 7.1–7.5 | To build |
| 8 | Better together (*Why does the pancreas rely on all three signals at once?*) | 1240.34–1378.52 | 37210–41356 | 8.1–8.4 | To build |
| 9 | One meal, start to finish (*What happens in the pancreas, step by step, when you eat?*) | 1378.52–1522.749 | 41356–45682 | 9.1–9.5 | To build |

Chapter boundaries sit 0.15 s before the end of each inter-chapter silence. In Chapters 1–9 the **spoken chapter announcement** ("Chapter one, One organ, two glands.") begins about 0.45 s after t0 and plays over the title card.

### 5.2 Visual system [ESTABLISHED; implemented in `lib.js`/`engine.js`]
- 1920×1080, 30 fps, flat vector style, paper background `#FBF7F0`, font Inter.
- Color code (fixed meaning across the whole film): amber `#E8902A` = enzyme pathway / acinar / CCK; teal `#2A8FB8` = bicarbonate pathway / duct / secretin; red `#D64541` = acid / H⁺ / danger; violet `#7B5EA7` = nerves / ACh; green `#4CA36B` = Cl⁻ / CFTR; gold `#E3B23C` = Na⁺; grey `#8A8F98` = inactive / locked / dimmed; ink `#2B2D33`. Also: lilac = K⁺; olive = bile.
- Recurring devices: two-factory board, continuous zoom (camera moves rather than cuts), pH strip (1–9, 7–8 band shaded teal), lock and key (zymogens padlocked, enteropeptidase = key), ion tokens on drawn paths.
- Motion rules: an element appears when its name is spoken, never before; earlier elements dim to ~35–40% rather than vanish; arrows draw on; each chapter opens on a title card and returns to a familiar view. Labels carry ≤ 7 words; formulas use true subscripts and charges; full sentences only on summary cards. "Clinical link" frame = red border + tag (`clinicalFrame()` in lib).

---

## 6. Audio: facts, alignment and the edited soundtrack

### 6.1 The audio file [ESTABLISHED, measured]
- `narration.m4a`: AAC, 24:47.66 (1487.66 s). It contains the full script, including Ch9 9.4 and the 9.5 recall questions.
- **The TTS app read the file title and every bracketed chapter line aloud**, because the user pasted the whole file as one take (my recommendation had been one clip per chapter without the bracket lines). So the audio starts "Pancreas narration for TTS. Chapter zero, cold open. …" and each chapter starts "Chapter one, One organ, two glands." etc.
- The pauses are true digital silence (below −50 dB). Distribution: sentence pauses ~400–500 ms; comma/colon ~300–400 ms; **paragraph pauses ≥ 700 ms, exactly 89 of them** = 1 title line + 89 non-empty lines of the TTS file (10 headers + 79 paragraphs) → 90 blocks, matched one-to-one.
- Mean speaking rate ~147 wpm; 4.0–5.0 syllables/s per paragraph, consistent throughout.

### 6.2 The user's "audio analysis" file is unreliable [ESTABLISHED]
`41b10140-attachment.txt` claims 6,380 words and 258 wpm (the script has 3,637 words). Its chapter times overlap (Ch8 "starts" at 22:30, before Ch7 "ends" at 22:55). It leaves large unexplained gaps (Ch0 ends at 0:53.8 but Ch1 "starts" at 1:45), and its transcript stops at "Two factories… two ways to fail" at 24:48, missing the rest of 9.4 and all of 9.5, which are in the audio. **None of its timings are used.** Its transcript does flag two possible pronunciation issues: "lysophosphithin" for *lysolecithin*, and "a monoglyceride" for *two-monoglyceride*. These may be the tool's own transcription errors (see §11).

### 6.3 Alignment method (`align.py`) [ESTABLISHED]
- `envelope.py`: 10 ms RMS envelope in dB → `audio_in/db.npy`.
- `align.py`: silence runs (< −50 dB); ≥ 0.70 s gaps split the audio into the 90 blocks. Inside each block, a monotonic DP matches pauses ≥ 120 ms to punctuation boundaries, with weights . ? ! = 3, : ; = 2, , = 1 (sentence ends are near-mandatory; timing is penalized against syllable-proportional prediction). Words are then placed by syllable proportion inside each clause.
- **Result: all 90 blocks matched, zero unmatched sentence boundaries, rates consistent.** Expected word-time accuracy is roughly ±0.15–0.3 s within clauses; clause and sentence boundaries are near-exact.
- Output `align.json`: per block `{block, chapter, header, text, s, e, words:[{w,s,e}]}` in **source** time. Block 0 = file title, block 1 = "Chapter zero" header, blocks 2–5 = Ch0 paragraphs, block 6 = Ch1 header, …, block 82 = "Put together, this is a feedback loop…" (Ch8), block 89 = "Before you go, try three questions…" (Ch9).

### 6.4 Soundtrack edit (`build_timeline.py`) [ESTABLISHED]
Edit decision list, final duration **1522.749 s (25:22.75)**:
- 0.6 s silent lead-in.
- **Cut** block 0 (file title) and block 1 ("Chapter zero, cold open").
- Ch0 content (source from block 2 start − 0.25 to block 5 end + 0.35).
- **3.6 s silence for the main title card** (final 55.67–59.27).
- Each chapter 1–9: source from header start − 0.30 to last block end + 0.35, followed by **0.9 s** inserted silence (so chapter breaks are ~1.55 s total).
- **4.5 s hold** after block 82 for the Ch8 reference card (final 1367.75–1372.25).
- **7.5 s holds** after each of the 3 recall questions (final 1489.48–1496.98, 1500.37–1507.87, 1512.249–1519.749). Then a 3.0 s tail (1519.749–1522.749).
- 10 ms micro-fades at every cut. Output: mono 24 kHz `final_audio.wav`. Muxed as AAC 160 kbps.
- `timeline.json` = `{duration, chapters:[{chapter,t0,t1}], edl:[...], blocks:[...]}`, with words in **final** time. Blocks 0–1 are excluded.

---

## 7. Production pipeline (technical reference)

### 7.1 Architecture
Each chapter is an HTML/SVG page (`web/index.html?ch=N`). It loads `tl.js` (timeline), `engine.js`, `lib.js` and `chN.js`, then calls `boot()`, `setChapter(N)`, `buildChapter()` and `settle()`, and sets `window.READY = true`. `render.py` drives headless Chromium (Playwright). For each global frame f it calls `renderAt(f/30)` and screenshots a JPEG (q92), **reusing the previous JPEG when nothing changed**, then pipes the frames to ffmpeg (libx264 veryfast, CRF 18, yuv420p, GOP 60). Chapters are rendered in parallel slices, concatenated with `-c copy`, then muxed with the audio.

### 7.2 Engine API (`engine.js`), essentials
- Layers: `world` (camera-transformed) and `hud` (screen space). `el(tag, attrs, parent)`, `G(attrs, parent)`.
- **State tweens:** `to(e, t0, dur, {o, x, y, s, sx, sy, r}, ease)`. Helpers: `show` (fade in; element starts hidden), `fade` (to opacity 0 by default), `dim`, `pop` (scale-in with overshoot), `slideIn(e, t, dx, dy, d)`, `move`, `scaleTo`. `hidden(e)` sets base opacity 0. `pivot(e, x, y)` sets the scale/rotate centre.
- **Attribute tweens:** `attrTo(e, t, d, name, a, b)`, `colorTo(e, t, d, name, c1, c2)`, `counter(textEl, t, d, a, b, fmt)`, `draw(path, t, d)` (stroke draw-on), `along(e, path, t, d, ease, r0, r1)` (move along a path), `fx(t, d, fn(p))` (custom), `init(fn)` (per-frame reset), `loop(t0, t1, fn(localT))` (continuous motion).
- **Camera:** `cam(t, d, cx, cy, s)` centres world point (cx, cy) at zoom s. Set the initial camera with `world._base = {cx, cy, cs}`.
- **Text:** `T(str, x, y, {size, w, fill, anchor, italic})` with markup `_x_` subscript and `^x^` superscript (e.g. `'HCO_3_^−^'`). Also `TL(lines,…)`, `tag(str, x, y, {size, fill, color, stroke})` (pill label), `callout(str, ax, ay, x, y)` (leader label), `arrow(d, colorName, {sw})`.
- **Anchors (sync):** `A(phrase, n=1, after=-1)` = start time (final timeline) of the n-th occurrence of `phrase` in the current chapter's words. `AE(phrase)` = end time. Also `blockSpan(block)` and `chapterSpan(ch)`.
- Easing: `E.io` (default), `E.out`, `E.in`, `E.back`, `E.sine`, `E.lin`.

### 7.3 Components (`lib.js`)
`gutMap(parent, {torso})` (liver, gallbladder, CBD/cystic duct, spleen, pancreas with lobule texture, `islets` layer, `pduct` pancreatic duct (opacity 0 by default), duodenum tube + invisible `duoPath` for motion, `papilla`, `oddi` ring (opacity 0), stomach group `stom` with esophagus/rugae/`pylorus`, optional torso and head); `acinus(parent, cx, cy, R)` (9 wedge cells, nuclei, RER arcs, amber granules, one padlock per cell in `.locks`, centroacinar cells, intercalated duct cells, `.ductLumen`); `ductCell(parent)` (full-canvas duct-cell diagram: blood vessel left, bilayer cell, nucleus, mitochondria, transporters `nbc`, `nhe`, `atpase`, `cftr`, `ae`, CA glyph `ca`, lumen right, tight junctions, invisible ion paths in `.pth`: `co2In, hOut, naIn, hco3Out, clIn, clOut, naOut, kIn, para, nbcIn`); `ION.H/HCO3/Cl/Na/K/CO2/H2O(parent)` + `place(e, x, y)`; `stepBadge(n, x, y)`; `card(x, y, w, h, parent, {stroke})`; `lockIcon(x, y, scale, color)`; `phStrip(x, y, w, parent, {card})` with `.set(t, d, value)`; `board(parent)` (headers `.head.amber/.teal`, `.title`, `.lines`, `.rows[i]`, `.cells.amber[i]/.teal[i]`, `.notes.amber/.teal`, `.potArrow`; contents in `BOARD_CELLS` / `BOARD_NOTES`); `titleCard(n, title, question, t0, t1)`; `clinicalFrame()`; `caption(str, x, y)`.

Board contents as implemented: Product: Enzymes | HCO₃⁻ fluid (NaHCO₃); Cell: Acinar cell | Centroacinar + duct cells; Trigger: Peptides + fatty acids | Acid (pH < 4.5–5); Hormone: CCK (+ ACh) | Secretin; Messenger: Ca²⁺ (IP₃) | cAMP; What goes wrong: Premature activation → acute pancreatitis | CFTR defect → thick juice (cystic fibrosis). Notes under Product (shown in Ch3/Ch4): "RER → Golgi → zymogen granules · released by ↑Ca²⁺" | "made by carbonic anhydrase · exported via Cl⁻ exchange". The potentiation double arrow sits between the columns in the Hormone row (moved there so it doesn't cover the bottom row).

### 7.4 Gotchas (learned the hard way) [ESTABLISHED]
1. **Register animations only after an element's children exist.** The pivot (scale/rotate centre) comes from `getBBox()` at first registration. Override it with `pivot()`.
2. **`attrTo` / `colorTo` / `counter` / `draw` use `firstInit`:** only the FIRST call per element and attribute sets the pre-animation baseline. (The bug before this fix: a later `attrTo(glow, …, .75 → 0)` made the glow visible from t = 0.) When chaining, pass explicit from-values that continue from the previous call.
3. `to()` from-values are resolved in `settle()` per element, so tracks may overlap and frames can render in any order (parallel workers are safe).
4. **`loop()` bypasses the state system:** set attributes directly and add an `init()` that resets them (e.g. opacity 0). Any continuous motion must be a track or a loop, or the static-frame skipper will freeze it.
5. Elements with state opacity 0 get `display:none`.
6. **All scripts share one global scope.** Don't redeclare top-level names used by the engine, lib or page (`C, E, W, H, NS, T, TL, G, P, A, AE, TL_DATA, QP, CHN, world, hud, defs…`). Earlier, a `const P` in `index.html` collided with `lib.js`'s `P()`; it was renamed `QP`. Keep chapter code inside `buildChapter()`.
7. **Anchor phrases are normalized:** lowercase, punctuation dropped, **hyphens split into words** ("C-shaped" → `c shaped`, "sodium-hydrogen" → `sodium hydrogen`), numbers are words ("one hundred forty-five"). In Chapters 1–9 the **spoken header is part of the chapter's word stream**, so `A('two glands')` in Ch1 hits the header first; use `A('two glands', 2)` or `after`. Missing anchors throw, and `render.py` prints `BUILD ERROR`.
8. Chapters ≥ 100 (style frames) have no words; anchors can't be used there.
9. Text width is measured at build time (`getComputedTextLength`). `index.html` force-loads the bundled Inter weights first. Keep that, or label pills will be mis-sized.
10. In Ch0 the camera is zoomed out (0.5) at the start; screen positions of world points depend on the camera at that moment. HUD elements that must touch world objects (e.g. Ch0 sparks) use precomputed screen coordinates.

### 7.5 Performance [ESTABLISHED, measured in the sandbox: 2 CPU cores]
Chapter 0 (1774 frames) rendered in ~66 s with 2 workers (~27–30 fps throughput; static frames are skipped). The full film is 45,682 frames, so expect ~25–35 min of total render time on similar hardware. A still renders in a few seconds.

---

## 8. Chapter 0 as built (reference implementation for style and density)

`web/ch0.js` follows plan beats 0.1–0.4, with these implementation choices (all **[ESTABLISHED]**, sent to the user):
- **0.1:** torso view (camera cx 1250, cy 470, zoom 0.5), zooming on "soft" to the organs (cx 1400, cy 600, 0.75). A right-hand white panel shows a plate (steak, bread, butter). The four nutrient molecules appear in a **2×2 grid** (protein bead chain, starch hexagons, fat droplet, DNA), each popping on its word and then snipping apart. The pancreas glows on "gland"; the stomach fades to 28% on "stomach". 14 amber sparks loop from the pancreas to the molecules from "powerful" to just after "DNA". On "the gland that makes them" one spark returns, a red crack draws on the pancreas, and a red glow appears.
- **0.2:** camera to the stomach–duodenum (1000, 640, 1.08); red acid tint; stomach squeeze; red bolus along the duodenum (`duoPath` 0→0.40); red tint drawn along the 1st–2nd duodenal parts. **The pH strip sits in a white card at the bottom** (moved from the top so it doesn't cover organs). The needle jumps to 7, then moves to 2, **landing as "two" is spoken** (retimed after review). The caption reads "chyme · pH ≈ 2"; the enzyme icon turns grey with a red ✕; the duodenal wall pulses red (erosion).
- **0.3:** paper overlay hides the world; two cards: amber "Problem 1 / Deliver enzymes / without self-digestion" (big padlock pulses on "without destroying") and teal "Problem 2 / Neutralize the acid / fast enough for enzymes" (mini pH strip 2→8 on "neutralize").
- **0.4:** the cards shrink and fly into the board header positions; the empty board appears (headers, row labels staggered); rows pulse on "product", "signal" (Trigger and Hormone) and "failing". Main title "Physiology of the Pancreas" + amber/teal bar + "Two factories in one gland" on "one at a time", fading out in the last 0.45 s of the chapter.
- Verified sync points: sparks on "powerful enzymes" (7.5 s), protein snip on "proteins" (13.0 s), needle 2→8 on "neutralize" (41.4 s), board on "two factories" (47.3 s).

---

## 9. Decisions log (including revisions)

| # | Decision | Status / revision |
|---|---|---|
| 1 | Teaching spine "two factories"; 10 chapters (0–9); target ~25 min to match the reference's 25:29 | Established |
| 2 | Clinical links: ZES, CF, acute pancreatitis, vagotomy, used only where they explain physiology | Established |
| 3 | Script and visual plan delivered as a claude.ai Docs artifact; narration-only TXT for TTS | Established (Docs copy now exported to `docs/`) |
| 4 | Self-review corrections: "compound gland" usage; "one bicarbonate" → "more bicarbonate"; vagotomy "lost" → "greatly reduced"; First Aid citation p.380 → p.378 for the HCO₃⁻ quote; a typo in visual note 3.2 | **Revised** during scripting, before audio (audio reflects the corrected text) |
| 5 | TTS advice: one clip per chapter, without bracket lines | **Not followed by the user** (single take, headers read aloud). Revised plan: cut the file title and "Chapter zero"; **keep Ch1–9 spoken headers over the title cards** (they replace the planned silent ~3 s holds) |
| 6 | Timing source: waveform alignment, not the user's analysis file | Established (analysis file proven unreliable) |
| 7 | Holds: main title 3.6 s (plan said ~3 s + optional music sting; implemented silent); Ch8 reference card 4.5 s (plan ~4 s); recall questions 7.5 s each (plan: ~5 s silence + ~4 s answer; implemented 7.5 s total, the answer should appear ~4 s into each hold) | Established in `build_timeline.py` |
| 8 | Checkpoint: style frames + Ch0 sample for approval before building Ch1–9 | Established; **approval pending** |
| 9 | Ch0 layout fixes after self-review: molecules in a 2×2 grid; pH strip at the bottom in a card; needle lands on "two"; initial camera shifted so the torso clears the food panel | Established |
| 10 | Rendering stack: HTML/SVG + deterministic JS engine + Playwright screenshots + ffmpeg | Established (proven) |
| 11 | Output spec: 1920×1080, 30 fps, H.264 CRF 18 (veryfast), AAC 160 kbps, mono 24 kHz source audio | **[ASSUMPTION]**: chosen by me; the user never specified |
| 12 | Music: none so far (voice-only works; an original quiet bed and stings could be added) | **[OPEN]** |
| 13 | Burned-in captions | **[OPEN]** (offered as optional; an SRT can be generated from `timeline.json`) |

---

## 10. How to continue

### 10.1 Environment setup (user's machine; OS unknown)
- Python 3.10+ (developed on 3.13): `pip install playwright numpy scipy pillow`, then `python -m playwright install chromium`.
- **ffmpeg** (with libx264 and aac) on PATH.
- Fonts are bundled (`prod/web/fonts`); no system install needed.
- Place `narration.m4a` in `prod/audio_in/` (§3.1). **Run all commands from `prod/`.**

### 10.2 Rebuild and verify (≈ 2 min)
```bash
cd prod
python envelope.py                                        # → audio_in/db.npy
python align.py ../docs/Pancreas_narration_for_TTS.txt    # → align.json (prints per-block report; last column "0" = no missed sentence ends)
python build_timeline.py                                  # → final_audio.wav, timeline.json (final duration 1522.75)
python make_tljs.py                                       # → web/tl.js
python render.py 0 --stills 9 26.6 47.5                   # spot-check frames → frames/ch0_*.jpg
python render_chapter.py 0 --workers 2                    # → parts/ch0.mp4  (~1 min)
python assemble.py --partial                              # → output/Pancreas_Physiology_ch0-0.mp4
```
`align.json` and `timeline.json` are already in the package; regeneration should reproduce them exactly (verified).

### 10.3 Building a chapter (recommended workflow)
1. Read the chapter's beats in `docs/SCRIPT_AND_VISUAL_PLAN.md` (Visual / On screen / Sync for each beat).
2. Print the chapter's word timings to pick anchors, e.g.
   `python -c "import json;T=json.load(open('timeline.json'));[print(b['block'],' '.join(f\"{w['w']}@{w['s']:.1f}\" for w in b['words'])) for b in T['blocks'] if b['chapter']==3]"`
3. Write `web/chN.js` with `function buildChapter(){…}`. Start with `const [c0, c1] = chapterSpan(N);` and a `titleCard(N, title, question, c0, firstContentWordTime)`, where the first content word is the first word of the first non-header block. Drive every event with `A('phrase')` anchors, never hard-coded seconds. Reuse lib components; add new components to `lib.js`.
4. Check with stills at the busiest moments (`render.py N --stills t1 t2 …`), look at them, and fix overlaps and legibility. Then `render_chapter.py N`.
5. After all chapters: `assemble.py` → `output/Pancreas_Physiology_full.mp4`. QC by extracting frames at key anchors and comparing with the plan.

### 10.4 Remaining work, per chapter (components still to build in `lib.js`)
- **Ch1:** reuse `gutMap` (stomach fade; head/body/tail highlights; spleen; `islets` layer); 99%/1% proportion bar; islet zoom with α/β/δ tints and labels; continuous zoom to the duct tree; salivary-gland inset; grape-bunch → duct-tree morph; **acinus key frame** (reuse `acinus()`, labels appearing on cue); NaHCO₃ droplets in the duct; pull-back with `pduct`, `cbd`, `papilla`, `oddi` ring, gallstone drop and red flash; board rows Product + Cell.
- **Ch2:** flask with merging amber + teal streams; stat chips; pH strip at 8; balance scale (plasma = juice); 1 L jug; 100% composition bar (not to scale) with ion tokens; stomach→duodenum with 3 numbered cards; **ZES clinical frame** (gastrinoma, red flood, ulcer craters into the jejunum, lipase grey, steatorrhea); board arrow teal→amber "bicarbonate enables enzymes".
- **Ch3 (longest, 4:10):** HCO₃⁻ bars (25 vs 145, ×5); zoom into `ductCell()`; animate tokens along `.pth` paths; equation write-on; step badges 1–4; ATPase energy line; Cl⁻ recycling loop ×3 accelerating; lumen-negative paracellular Na⁺ + water; **acid-tide mirror with a parietal cell (new component)**; **CF clinical** (CFTR cross, output drop, plug, fibrosis, chips); **flow-rate line chart (new)** + two-taps mixing glass with a secretin icon; board teal note.
- **Ch4:** **upright acinar cell (new):** RER stacks with ribosomes, mitochondria, nucleus, Golgi, granules, capillary, receptors; assembly-line animation; ACh (violet) + CCK (amber) docking → "Gq → IP₃ → ↑Ca²⁺" → calcium wave → exocytosis; zymogen row with padlocks and the "-ogen/pro-" letters lit; amylase/lipase active; trypsin flips → domino tilt → **trypsin inhibitor shield**; board amber note.
- **Ch5:** **duodenal villi / brush border close-up (new)**; gold key; trypsinogen → trypsin; cascade popping padlocks; 1→2→4→8 branching with a feedback loop arrow; locked/unlocked map; **pancreatitis clinical** (gallstone at the papilla, duct swelling, shields swamped, heat map, body silhouette pain to the back, lipase/amylase chips, BP icon); board "What goes wrong" row.
- **Ch6:** four-quadrant grid; protein chain with K/R/F/Y beads, scissors, carboxypeptidase clamp, amino-acid counter, C-ends glowing; starch α-1,4 cuts → maltose / maltotriose / α-limit dextrins; cellulose bounce; fat globule → emulsification → lipase pushed off → colipase anchor → TG → 2-MG + 2 FFA; cholesterol ester and PLA₂ vignettes; nucleotides; grid glows.
- **Ch7 (4:11):** upper-GI map with 3 signal icons; vagus + enteric neurons; I cells → CCK through the blood (70–80% chip); S cells, prosecretin → secretin, pH threshold 4.5–5, inset curve; duct-cell inset (cAMP, CFTR opens); neutralization equation + CO₂ to a lungs icon; split card "nutrients → CCK → enzymes | acid → secretin → bicarbonate"; **three-panel phase timeline (new)** with a running share bar; granules piling with no flow; vagotomy scissors; teal flood; stomach-vs-pancreas crossing bars; board Trigger / Hormone / Messenger rows.
- **Ch8:** schematic bar chart (label it "schematic"; together > sum); cargo vs river; redrawn lecture regulation figure (acinar IP₃/Ca²⁺ core, duct cAMP core, "potentiates" lightning arrows); upper-GI map of CCK and secretin effects; feedback-loop diagram; **reference card during the 4.5 s hold (1367.75–1372.25)**; board potentiation arrow.
- **Ch9:** phase timeline with a playhead; compressed replays of earlier animations; pH 2→7.5; key → cascade; nutrients break apart (echoing the cold open); everything winds down; **completed board** with row highlights on "Two factories / products / signals / messengers / ways to fail" + potentiation arrow; end card with the 7 objectives ticked; **3 question cards** (each appears as its question is spoken; the answer appears ~4 s into each 7.5 s hold); fade to black in the tail (1519.75–1522.75).

---

## 11. Unresolved matters, risks, open questions

1. **[OPEN] User approval of the look and sync** (Ch0 sample + style frames). Ask before building Ch1–9, unless the user says to proceed.
2. **[OPEN] Pronunciation was never verified by ear.** I could only measure the audio. Words worth a listen, with times in the **original** `narration.m4a`: pH 0:30.4, Langerhans 1:30.8, acinus 2:10.0, centroacinar 2:32.5, acini 2:50.2, Vater 3:10.2, Oddi 3:13.8, Zollinger-Ellison 5:01.6, ATPase 6:42.6, chymotrypsinogen 10:46.6, "ogen" 10:51.0, enteropeptidase 11:55.7, colipase 12:19.6, maltotriose 15:11.7, two-monoglyceride 15:27.9, **lysolecithin 16:10.3** (the analysis tool heard "lysophosphithin"), proteoses 17:07.8, vagovagal 19:20.5.
   **If a paragraph is regenerated:** splice it into `narration.m4a` at that paragraph's surrounding pauses (block `s`/`e` in `align.json`, source time), then re-run steps 1–4. Anchors are phrase-based, so chapter scripts adapt automatically, but every chapter after the splice shifts in time and must be re-rendered.
3. **[OPEN] Music and sound design:** not decided. The plan works voice-only.
4. **[OPEN] Captions:** optional. They could be generated from `timeline.json` (word times) as SRT or burned in.
5. **[OPEN] Lecture version:** the notes were built on last year's slides; the team may issue updates.
6. **[RISK] Scope:** about 24 minutes of animation remain. Chapters 3 and 7 are the heaviest (≈ 4 min each, many new components).
7. **[RISK] Environment drift:** the sandbox was Linux. Playwright/Chromium or font rendering on another OS may differ slightly. The bundled fonts minimize this. Re-check stills after setup.
8. **[NOTE]** The plan doc in claude.ai remains the user's editable copy. `docs/SCRIPT_AND_VISUAL_PLAN.md` is a snapshot (rev 28). Narration must not change without new audio.
9. **[NOTE]** `docs/SCRIPT_AND_VISUAL_PLAN.md` contains the full TTS notes, pronunciation table and accuracy table with sources. Read those sections when touching narration or facts.

---

## 12. Established vs assumed: quick reference

**Established:** everything in §§1–9 marked so. That includes the script text, chapter structure, color code, audio facts, alignment results, the edit list and final timeline, the engine and components, Chapter 0, the unreliability of the analysis file, and the medical corrections.

**Assumptions (not confirmed by the user):** output encoding spec; no music; captions off; silent title holds; hold lengths (4.5 s, 7.5 s); keeping the spoken chapter announcements; the exact visual layouts of unbuilt chapters (the plan gives the intent; the layout is the builder's judgment); that the user wants the final film as a single MP4.

**Not known:** the user's OS and hardware for Claude Code; which TTS app or voice was used (they can't be regenerated identically by us); whether the user wants Chapter 0 changed.

---

## 13. Exact stopping point and next step

The last message to the user (claude.ai) delivered `Pancreas_Ch0_sync_sample.mp4` and the three style frames. It asked them to confirm the look and timing, or to request changes (colors, illustration detail, label density, pacing) **before** Chapters 1–9 are built. No reply was received; the user then requested this handoff.

**Next step in Claude Code:**
1. Do the setup and verification (§10.1–10.2).
2. Ask the user: "Is the Chapter 0 look and timing approved, or what should change?" If they ask for changes, apply them to `lib.js` / `ch0.js` first so they carry through.
3. Build Ch1 → Ch9 in order (§10.3–10.4), checking stills for each and rendering each chapter as it is finished.
4. Assemble, run QC, and deliver `output/Pancreas_Physiology_full.mp4`.
