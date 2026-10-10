#!/bin/bash
# Regenerates the Google Play assets in store/ from the real app: phone, tablet and desktop/Chromebook screenshots, the icon
# and the feature graphic. Puts the emulator on each screen size with a clean status bar, installs the debug build, then
# restores the display.
# Use an emulator (it clears the app's data). Usage: qa/android/store.sh
ADB_BIN="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
A="$ADB_BIN${ANDROID_SERIAL:+ -s $ANDROID_SERIAL}"
cd "$(dirname "$0")"
./install.sh
demo() {
  $A shell settings put global sysui_demo_allowed 1
  for c in "-e command enter" "-e command clock -e hhmm 0941" "-e command battery -e level 100 -e plugged false" "-e command network -e wifi show -e level 4 -e fully true" "-e command notifications -e visible false"; do
    $A shell am broadcast -a com.android.systemui.demo $c >/dev/null 2>&1
  done
}
# kind, screen size, density (dp size = px / (density/160)): phone 1080x1920 = 411x731 dp; tablet 2560x1440 = 914x514 dp; desktop 1920x1080 = 960x540 dp
for cfg in "phone:1080x1920:420" "tablet:2560x1440:280" "desktop:1920x1080:240"; do
  IFS=: read kind size dens <<< "$cfg"
  $A shell wm size "$size" >/dev/null; $A shell wm density "$dens" >/dev/null; sleep 3
  demo
  node store-assets.mjs "$kind"
done
node store-assets.mjs graphics
$A shell am broadcast -a com.android.systemui.demo -e command exit >/dev/null 2>&1
$A shell wm size reset >/dev/null; $A shell wm density reset >/dev/null
