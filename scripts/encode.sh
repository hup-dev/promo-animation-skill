#!/bin/bash
# Encode rendered frames to MP4. Usage:
#   ./encode.sh frames/        promo-static.mp4 17.5 [audio.mp3]
#   ./encode.sh frames-zoom/   promo-zoom.mp4   19.5 [audio.mp3]
#
# Audio is optional. Tail fade ends 1s before video end.

set -euo pipefail

FRAMES_DIR="${1:?frames dir}"
OUT="${2:?output mp4 path}"
DURATION="${3:?duration in seconds (e.g. 17.5)}"
AUDIO="${4:-}"

FADE_START=$(awk "BEGIN{print $DURATION - 1.0}")

if [[ -n "$AUDIO" && -f "$AUDIO" ]]; then
  ffmpeg -y -framerate 30 -i "${FRAMES_DIR%/}/f_%05d.png" \
    -i "$AUDIO" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart \
    -c:a aac -b:a 192k -af "afade=t=out:st=${FADE_START}:d=1.0" \
    -t "$DURATION" -shortest "$OUT"
else
  ffmpeg -y -framerate 30 -i "${FRAMES_DIR%/}/f_%05d.png" \
    -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -movflags +faststart \
    -t "$DURATION" "$OUT"
fi

ls -lh "$OUT"
