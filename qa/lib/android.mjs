// adb helpers. Uses $ADB if set, else the Android SDK's adb; $ANDROID_SERIAL picks one device when several are attached.
import os from 'node:os';
import path from 'node:path';

const sdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT ?? path.join(os.homedir(), 'Library', 'Android', 'sdk');
export const ADB_BIN = process.env.ADB ?? path.join(sdk, 'platform-tools', 'adb');
export const SERIAL = process.env.ANDROID_SERIAL;
export const ADB = `${ADB_BIN}${SERIAL ? ' -s ' + SERIAL : ''}`;
export const PKG = 'com.fluxogen.ease';
