import { createContext, useContext } from 'react';
import type { PregnancyStatus } from '../hooks/usePregnancyStatus';

export interface PregnancyContextValue {
  status: PregnancyStatus;
  setStatus: (status: PregnancyStatus) => void;
}

export const PregnancyContext = createContext<PregnancyContextValue | null>(null);

export function usePregnancy() {
  const ctx = useContext(PregnancyContext);
  if (!ctx) throw new Error('usePregnancy must be used within PregnancyContext.Provider');
  return ctx;
}
