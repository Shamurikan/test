#!/usr/bin/env bash
# Join the video segments (decoded, so segments from different encoder runs join cleanly), add the separately
# rendered narration mix, loudness-normalise it (two-pass EBU R128, -16 LUFS / -1.5 dBTP) and encode the master.
set -euo pipefail
cd "$(dirname "$0")/.."
S=out/seg
OUT=${1:-out/small-intestine-explainer.mp4}
V=("$S/part1_raw.mp4" "$S/v_16880-23999.mp4" "$S/v_24000-30999.mp4" "$S/v_31000-37509.mp4")
A=$S/audio.wav
STATS=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -y -i "${V[0]}" -i "${V[1]}" -i "${V[2]}" -i "${V[3]}" -i "$A" \
  -filter_complex "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[v];[4:a]loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -tune animation -movflags +faststart \
  -c:a aac -b:a 192k "$OUT"
ls -la "$OUT"
