#!/usr/bin/env bash
# Rebuild the edited soundtrack + word timeline from the TTS narration.
#   needs: python3 (numpy, scipy), ffmpeg;  input: pipeline/audio_in/narration.m4a
#   writes: public/final_audio.wav (picked up automatically by the Remotion film)
#           src/data/timeline.json (word anchors; only changes if the audio changed)
set -euo pipefail
cd "$(dirname "$0")"
[ -f audio_in/narration.m4a ] || { echo "missing pipeline/audio_in/narration.m4a"; exit 1; }
python3 envelope.py
python3 align.py ../docs/Pancreas_narration_for_TTS.txt
python3 build_timeline.py
if ! cmp -s timeline.json ../src/data/timeline.json; then
  echo "NOTE: timeline.json changed (different audio). Copying it in; re-render the film."
  cp timeline.json ../src/data/timeline.json
fi
cp final_audio.wav ../public/final_audio.wav
echo "done: public/final_audio.wav"
