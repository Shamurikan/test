# The Small Intestine: Move · Digest · Absorb

A 14.8-minute narrated explainer of **Lecture 5: Physiology of the small intestine (motility, secretion and absorption)**,
from the lecture by Prof. Mohammed Alzoghaibi and Dr. Hayam Gad.
It runs at 1920×1080, 30 fps, with burned-in captions.

The output file is `out/small-intestine-explainer.mp4`, which is not in git. See *Rebuild* below.

## How it is made

| Layer | Tool | Where |
| --- | --- | --- |
| Script (33 scenes, 3 acts + quiz) | hand-written from the lecture | `script/scenes.json` |
| Narration | Fish Audio TTS (voice "Adrian", speed 1.1) | `remotion/public/vo/*.mp3` |
| Word timings | Fish Audio ASR, aligned to the script | `script/align.py` → `remotion/src/data/vo.json` |
| Master timeline | durations from the narration | `script/timeline.mjs` → `remotion/src/data/timeline.json` |
| Title, chapter cards, surface-area zoom, quiz, outro | **HyperFrames** (HTML + GSAP) | `hf-src/` templates → `hyperframes/` project |
| 27 physiology scenes, narration mix, captions, transitions | **Remotion** (React) | `remotion/src/` |

Every animation is keyed to the spoken word. `makeCue("s05")("contraction ring")` in Remotion and `cue("…")`
in HyperFrames return the moment that phrase is said. Both engines share one palette, the same fonts
(Fraunces, Inter, JetBrains Mono) and one baked background plate, so they cut together as one film.
The HyperFrames scenes render into one clip, and the Remotion master places each slice with `<Video trimBefore>`.

See `STORYBOARD.md` for the scene list and visual language, and `REVIEW.md` for the review notes.

## Rebuild

```bash
npm install
npm run tts          # only if you change the script (needs api.fish.audio access)
npm run align        # word timings → remotion/src/data/vo.json
npm run timeline     # scene durations → remotion/src/data/timeline.json
npm run hf:build     # generate hyperframes/index.html + compositions/*
npm run hf:check     # HyperFrames lint + layout/contrast audit
npm run hf:render    # → remotion/public/hf/hf.mp4
npm run stills -- s05:7,16 main:30   # review frames → out/stills/
npm run render       # Remotion master → out/main_raw.mp4
npm run master       # loudness-normalise (−16 LUFS) + final encode → out/small-intestine-explainer.mp4
```

`remotion.config.ts` points Remotion at the preinstalled Chromium headless shell.
For HyperFrames, set `HYPERFRAMES_BROWSER_PATH` to the same binary.
