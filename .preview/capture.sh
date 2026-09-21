#!/bin/zsh
set -euo pipefail
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SHOTS="$(cd "$(dirname "$0")" && pwd)/shots"
BASE="http://127.0.0.1:8765/gallery.html"
STARTERS=(social-app e-commerce marketplace booking events content local-business messaging-app community productivity saas habits)
mkdir -p "$SHOTS"

capture() {
  local starter="$1" vp="$2" w="$3" h="$4"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size="${w},${h}" \
    --virtual-time-budget=6000 \
    --screenshot="${SHOTS}/${starter}-${vp}.png" \
    "${BASE}?starter=${starter}&vp=${vp}"
}

for s in "${STARTERS[@]}"; do
  echo "desktop $s"
  capture "$s" desktop 1280 800 >/dev/null
  echo "phone $s"
  capture "$s" phone 390 844 >/dev/null
done
ls -lh "$SHOTS"/*-desktop.png "$SHOTS"/*-phone.png
