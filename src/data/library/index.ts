import type { ViewId, XY } from '../../components/atlas/geometry';
import { resolvePlace, type Place } from '../../components/atlas/place';
import raw from './points.json';
import type { CautionId, SelfCare, TechniqueId } from './shared';

export type Area = 'head' | 'chest-belly' | 'back' | 'arm' | 'hand' | 'leg' | 'foot';
export type Evidence = 'who' | 'refs' | 'disputed' | 'va';

export interface LibraryPoint {
  id: string;
  code: string;
  pinyin: string;
  english: string;
  channel: string;
  area: Area;
  view: ViewId;
  find: string;
  selfCare: SelfCare;
  technique: TechniqueId | null;
  cautions: CautionId[];
  pregnancy: boolean;
  tags: string[];
  /** Number of sourced indications behind each tag. */
  tagWeight: Record<string, number>;
  indications: string[];
  sources: Array<{ s: string; p?: string }>;
  evidence: Evidence;
  note?: string;
  avoidReason?: string;
  /** VA handout photo key (file stem in src/assets/points). */
  image?: string;
  place?: Place;
  xy?: XY;
  /** Series points (e.g. the finger webs) show several dots. */
  marks?: XY[];
}

export const library = raw as unknown as LibraryPoint[];
export const libraryById: Record<string, LibraryPoint> = Object.fromEntries(library.map((p) => [p.id, p]));

/** Old point ids (before the library) → new ids, so shared links keep working. */
const ALIASES: Record<string, string> = {
  ub40: 'bl40', ub57: 'bl57', ub60: 'bl60', kd1: 'ki1', kd3: 'ki3', kd6: 'ki6', kd7: 'ki7', kd10: 'ki10',
  tai_yang: 'ex-hn5', yin_tang: 'ex-hn3', bai_lao: 'ex-hn15', luo_zhen: 'ex-ue8', an_mian: 'anmian', ex_b2: 'ex-b2',
};

export function findPoint(id: string): LibraryPoint | undefined {
  const k = id.toLowerCase();
  return libraryById[k] ?? libraryById[ALIASES[k] ?? ''];
}

const xyCache = new Map<string, XY | null>();
/** Drawing position of a point on its view (null if it cannot be placed). */
export function pointXY(p: LibraryPoint): XY | null {
  if (xyCache.has(p.id)) return xyCache.get(p.id)!;
  let xy: XY | null = p.xy ?? null;
  if (!xy && p.place) {
    try { xy = resolvePlace(p.view, p.place); } catch { xy = null; }
  }
  xyCache.set(p.id, xy);
  return xy;
}
