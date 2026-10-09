import { useEffect, useState } from 'react';

/** App only: empty space the height of the fixed bottom action bar, so the last content can always scroll clear of it. */
export default function BarSpacer() {
  const [h, setH] = useState(96);
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.pressbar');
    if (!bar) return;
    const measure = () => setH(Math.ceil(bar.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);
  return <div aria-hidden="true" style={{ height: h }} className="hidden app:block" />;
}
