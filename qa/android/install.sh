#!/bin/bash
# Builds the web part, syncs it into android/, builds the debug APK and installs it on the connected emulator/device.
# Needs Android Studio's JDK 21 (JAVA_HOME is set below if it is installed in the default place).
set -e
cd "$(dirname "$0")/../.."
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
ADB_BIN="${ADB:-$HOME/Library/Android/sdk/platform-tools/adb}"
npm run android:sync
(cd android && ./gradlew assembleDebug -q)
"$ADB_BIN" ${ANDROID_SERIAL:+-s $ANDROID_SERIAL} install -r android/app/build/outputs/apk/debug/app-debug.apk
