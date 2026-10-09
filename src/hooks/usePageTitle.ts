import { useEffect } from 'react';

const SITE = 'Ease';

/** Sets the browser-tab / history / screen-reader title for the current page. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE}: self-acupressure points`;
  }, [title]);
}
