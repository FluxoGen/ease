import { useCallback, useEffect, useRef, useState } from 'react';
import { persistNative } from '../native';

export type PregnancyStatus = 'yes' | 'no' | 'unset';

const STORAGE_KEY = 'ease.pregnancyStatus';

function readStatus(): PregnancyStatus {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'yes' || value === 'no') return value;
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
  return 'unset';
}

export function usePregnancyStatus() {
  const [status, setStatusState] = useState<PregnancyStatus>(readStatus);
  // Only a real change clears the native copy; the first render must not wipe a saved answer.
  const first = useRef(true);

  useEffect(() => {
    try {
      if (status === 'unset') {
        localStorage.removeItem(STORAGE_KEY);
        if (!first.current) persistNative(STORAGE_KEY, null);
      } else {
        localStorage.setItem(STORAGE_KEY, status);
        persistNative(STORAGE_KEY, status);
      }
    } catch {
      // ignore storage errors
    }
    first.current = false;
  }, [status]);

  const setStatus = useCallback((next: PregnancyStatus) => {
    setStatusState(next);
  }, []);

  return { status, setStatus };
}
