import { App as CapApp } from '@capacitor/app';
import { isNative } from './native';

export interface VersionInfo {
  /** e.g. 1.0.0 */
  version: string;
  /** Android: the versionCode (build number). Website: the commit id of the build. */
  build: string;
  /** Short commit id of the web bundle (in the Android app this can differ from the APK if it was not re-synced). */
  bundle: string;
  native: boolean;
}

/** What to show for "version and build number". In the app it is the installed APK's; on the website, the deploy's. */
export async function getVersionInfo(): Promise<VersionInfo> {
  const web = { version: __APP_VERSION__, build: __BUILD_ID__, bundle: __BUILD_ID__, native: false };
  if (!isNative) return web;
  try {
    const info = await CapApp.getInfo();
    return { version: info.version, build: info.build, bundle: __BUILD_ID__, native: true };
  } catch {
    return web;
  }
}

export const formatVersion = (v: VersionInfo) => `Version ${v.version} (build ${v.build})`;
