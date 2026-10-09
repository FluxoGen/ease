#!/bin/bash
# QA android/sizes: runs tour.mjs on the connected emulator at six screen sizes by overriding the display size and density
# (narrow 320 dp phone, small phone, typical phone, largest display-size setting, unfolded foldable, tablet).
# The display override is reset at the end. Usage: qa/android/sizes.sh   (SCALES=1.0,2.0 by default)
ADB_BIN="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
A="$ADB_BIN${ANDROID_SERIAL:+ -s $ANDROID_SERIAL}"
cd "$(dirname "$0")"
for cfg in "Narrow320dp:720x1280:360" "Small360x640:720x1280:320" "Phone411x914:1080x2400:420" "LargeDisplaySize:1344x2992:640" "FoldInner700x840:1840x2208:420" "Tablet800x1280:1600x2560:320"; do
  IFS=: read label size dens <<< "$cfg"
  $A shell wm size "$size" >/dev/null; $A shell wm density "$dens" >/dev/null; sleep 4
  echo "=== $label ($size @ $dens)"
  SCALES="${SCALES:-1.0,2.0}" node tour.mjs "$label" 2>&1 | tail -40
done
$A shell wm size reset >/dev/null; $A shell wm density reset >/dev/null
echo "=== ALL DONE"
