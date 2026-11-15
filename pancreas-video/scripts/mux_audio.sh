#!/usr/bin/env bash
# Lay the full narration onto an already-rendered (silent or partial-audio) film.
#   usage: scripts/mux_audio.sh [in.mp4] [out.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
IN=${1:-out/Pancreas_Physiology_full.mp4}
OUT=${2:-out/Pancreas_Physiology_full_with_audio.mp4}
[ -f public/final_audio.wav ] || { echo "missing public/final_audio.wav: run pipeline/rebuild_audio.sh first"; exit 1; }
ffmpeg -v error -y -i "$IN" -i public/final_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$OUT"
echo "wrote $OUT"
