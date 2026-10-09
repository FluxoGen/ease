import AtlasDiagram from '../components/atlas/AtlasDiagram';
import { VIEWS, type ViewId, type XY } from '../components/atlas/geometry';
import { library, pointXY } from '../data/library';

// Dev-only: every view drawn in full with each library point labelled, for the visual sweep.
export default function AtlasSweep() {
  const byView = new Map<ViewId, Array<{ code: string; xy: XY }>>();
  const problems: string[] = [];
  for (const p of library) {
    const xy = pointXY(p);
    if (!xy) { problems.push(`${p.code}: no position`); continue; }
    const [W, H] = VIEWS[p.view].size;
    if (xy[0] < 0 || xy[0] > W || xy[1] < 0 || xy[1] > H) problems.push(`${p.code}: outside ${p.view}`);
    const list = byView.get(p.view) ?? [];
    list.push({ code: p.code, xy });
    byView.set(p.view, list);
  }
  return (
    <div className="bg-white p-4 text-charcoal">
      <pre id="problems" className="whitespace-pre-wrap text-xs">{problems.join('\n')}</pre>
      {[...byView.entries()].map(([view, pts]) => (
        <section key={view} id={`v-${view}`} className="mb-6 inline-block w-[520px] align-top">
          <h2 className="font-bold">{view} ({pts.length})</h2>
          <AtlasDiagram view={view} full marks={pts.map((p) => p.xy)} labels={pts.map((p) => p.code)} className="w-full border" />
        </section>
      ))}
    </div>
  );
}
