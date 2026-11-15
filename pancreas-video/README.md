# Physiology of the Pancreas — animated teaching video (Remotion)

A ~25-minute (25:22.75) medical teaching film on the physiology of the (mainly exocrine) pancreas, built in [Remotion](https://www.remotion.dev).
It's built from the lecture *L4) Physiology of pancreas*. The narration is the TTS audio, and every visual event is locked to the spoken word.

- **Spec:** `docs/SCRIPT_AND_VISUAL_PLAN.md` (narration + per-beat visuals + sync anchors). The narration is final; the audio was generated from `docs/Pancreas_narration_for_TTS.txt`.
- **Project history and decisions:** `docs/HANDOFF.md`.

## Quick start

```bash
npm install
npx remotion studio                # preview: PancreasFilm (full) + Chapters/Ch0…Ch9
```

Render the full film:

```bash
npx remotion render PancreasFilm out/Pancreas_Physiology_full.mp4 --jpeg-quality=92 --x264-preset=fast
```

1920×1080, 30 fps, 45,682 frames. That's about 30 min on 4 cores.

## Audio

The audio is the master clock. `src/data/timeline.json` holds every word's time in the **edited** soundtrack, and each animation uses phrase anchors (`A('phrase')`), never hard-coded seconds.

1. Put the TTS file at `pipeline/audio_in/narration.m4a`.
2. Run `pipeline/rebuild_audio.sh` (needs Python 3 with numpy + scipy, and ffmpeg). This writes `public/final_audio.wav`.
   - `<Film>` and the per-chapter compositions then play the full narration automatically.
   - Until that file exists, only Chapter 0 has sound (`public/audio/ch0_sample.wav`, taken from the approved Ch0 sample).
3. If you already have a rendered film, you can skip re-rendering: `scripts/mux_audio.sh` lays the narration onto it in seconds.

If the narration is ever regenerated, `rebuild_audio.sh` re-aligns it and updates `src/data/timeline.json`. The anchors follow automatically, and then you re-render.

## Layout

```
src/
  Root.tsx            compositions (PancreasFilm + Chapters/Ch0…Ch9), Inter fonts
  Film.tsx            chapters on one timeline + narration
  chapters/Ch0…Ch9    one file per chapter (Ch0 is a 1:1 port of the approved original)
  lib/anim.ts         deterministic tween resolver (port of the original engine.js semantics)
  lib/prims.tsx       <An> animated group, rich text (_sub_ ^sup^), pills, arrows, path drawing
  lib/components.tsx  gut map, acinus, duct cell, two-factory board, pH strip, title cards…
  lib/timeline.ts     timeline data + phrase anchors A()/AE()
  data/               timeline.json (word times), Inter glyph widths
pipeline/             audio alignment + soundtrack edit (Python)
docs/                 script & visual plan, TTS text, handoff
```

## Visual system

- Flat vector on paper `#FBF7F0`, set in Inter.
- Fixed colour meanings: amber = enzymes/acinar/CCK · teal = bicarbonate/duct/secretin · red = acid/danger · violet = nerves/ACh · green = Cl⁻/CFTR · gold = Na⁺ · grey = inactive/locked.
- Elements appear when they are named, never before.

## Notes

- The sandbox this was built in couldn't download Remotion's browser, so `REMOTION_BROWSER=/path/to/chrome-headless-shell` can point Remotion at a local one. On a normal machine, leave it unset.
- Remotion's licence is free for individuals and teams of up to 3. See remotion.dev/license.
