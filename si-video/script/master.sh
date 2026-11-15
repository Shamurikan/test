#!/usr/bin/env bash
# Final master: two-pass EBU R128 loudness normalisation (-16 LUFS, -1.5 dBTP) and a web-friendly H.264 encode.
set -euo pipefail
cd "$(dirname "$0")/.."
IN=${1:-out/main_raw.mp4}
OUT=${2:-out/small-intestine-explainer.mp4}
STATS=$(ffmpeg -hide_banner -nostats -i "$IN" -vn -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -y -i "$IN" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -tune animation -movflags +faststart \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -c:a aac -b:a 192k -ar 48000 "$OUT"
ls -la "$OUT"
