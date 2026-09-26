import { useCallback, useEffect, useState } from 'react';

export type PregnancyStatus = 'yes' | 'no' | 'unset';

const STORAGE_KEY = 'tsubo.pregnancyStatus';

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

  useEffect(() => {
    try {
      if (status === 'unset') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, status);
      }
    } catch {
      // ignore storage errors
    }
  }, [status]);

  const setStatus = useCallback((next: PregnancyStatus) => {
    setStatusState(next);
  }, []);

  return { status, setStatus };
}
