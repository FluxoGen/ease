#!/bin/bash
# Regenerates the Google Play assets in store/ from the real app: puts the emulator on a 1080x1920 screen with a clean
# status bar, installs the debug build, runs store-assets.mjs, then restores the display.
# Use an emulator (it clears the app's data). Usage: qa/android/store.sh
ADB_BIN="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
A="$ADB_BIN${ANDROID_SERIAL:+ -s $ANDROID_SERIAL}"
cd "$(dirname "$0")"
./install.sh
$A shell wm size 1080x1920 >/dev/null; $A shell wm density 420 >/dev/null; sleep 3
$A shell settings put global sysui_demo_allowed 1
for c in "-e command enter" "-e command clock -e hhmm 0941" "-e command battery -e level 100 -e plugged false" "-e command network -e wifi show -e level 4 -e fully true" "-e command notifications -e visible false"; do
  $A shell am broadcast -a com.android.systemui.demo $c >/dev/null 2>&1
done
node store-assets.mjs
$A shell am broadcast -a com.android.systemui.demo -e command exit >/dev/null 2>&1
$A shell wm size reset >/dev/null; $A shell wm density reset >/dev/null
