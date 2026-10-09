import { useEffect, useState } from 'react';
import { formatVersion, getVersionInfo, type VersionInfo } from '../version';

/** "Version 1.0.0 (build 1)", plus the web bundle's commit id in the Android app. */
export default function VersionLine({ className = '' }: { className?: string }) {
  const [v, setV] = useState<VersionInfo | null>(null);
  useEffect(() => { getVersionInfo().then(setV); }, []);
  if (!v) return null;
  return (
    <p className={`selectable ${className}`}>
      {formatVersion(v)}
      {v.native && <span className="block text-[11px] opacity-80">Content {v.bundle}</span>}
    </p>
  );
}
