import { library, type LibraryPoint } from './library';
import { routines, type Routine } from './routines';

/** Everyday words → routine. Kept small and reviewable; the point search below covers the rest. */
const SYNONYMS: Record<string, string[]> = {
  migraine: ['headache'], 'head ache': ['headache'], 'back pain': ['low_back_pain'], backache: ['low_back_pain'],
  sciatica: ['hip_leg_pain', 'low_back_pain'], 'cant sleep': ['sleep'], 'cannot sleep': ['sleep'], insomnia: ['sleep'],
  tired: ['energy_fatigue'], exhausted: ['energy_fatigue'], fatigue: ['energy_fatigue'], stress: ['stress_anxiety'],
  anxiety: ['stress_anxiety'], anxious: ['stress_anxiety'], worry: ['stress_anxiety'], period: ['menstrual_cramps'],
  cramps: ['menstrual_cramps'], indigestion: ['digestive_health'], bloating: ['digestive_health'], stomach: ['digestive_health', 'nausea'],
  tummy: ['digestive_health'], vomit: ['nausea'], sick: ['nausea'], cold: ['cold_flu'], flu: ['cold_flu'], fever: ['cold_flu'],
  'sore throat': ['cold_flu'], sinus: ['nose_sinus'], 'runny nose': ['nose_sinus'], 'blocked nose': ['nose_sinus'],
  toothache: ['toothache_jaw'], tooth: ['toothache_jaw'], jaw: ['toothache_jaw'], tinnitus: ['ear_hearing'], ringing: ['ear_hearing'],
  eyes: ['eye_strain'], 'screen time': ['eye_strain'], cough: ['cough_breathing'], wheeze: ['cough_breathing'],
  wrist: ['hand_wrist_strain'], elbow: ['hand_wrist_strain'], hand: ['hand_wrist_strain'], hip: ['hip_leg_pain'], knee: ['knee_pain'],
  ankle: ['foot_ankle_strain'], foot: ['foot_ankle_strain'], heel: ['foot_ankle_strain'], shoulder: ['shoulder_tension'],
  neck: ['neck_pain'], constipated: ['constipation'],
};

const norm = (s: string) => s.toLowerCase().replace(/['’]/g, '').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const compact = (s: string) => norm(s).replace(/ /g, '');

interface Indexed { p: LibraryPoint; code: string; name: string; eng: string; ind: string[] }
const index: Indexed[] = library.map((p) => ({
  p, code: compact(p.code), name: norm(p.pinyin), eng: norm(p.english), ind: p.indications.map(norm),
}));

export interface SearchResult { routines: Routine[]; points: LibraryPoint[]; totalPoints: number }

export function search(query: string, maxPoints = 8): SearchResult {
  const q = norm(query);
  const qc = compact(query);
  if (!q) return { routines: [], points: [], totalPoints: 0 };

  const routineIds = new Set<string>();
  for (const [word, ids] of Object.entries(SYNONYMS)) if (q === word || q.includes(word) || word.startsWith(q)) ids.forEach((id) => routineIds.add(id));
  const rs = routines.filter((r) => routineIds.has(r.id) || norm(r.title).includes(q) || norm(r.description).includes(q));

  // A symptom search ranks that routine's own order first (its best points lead), then everything else.
  const routineRank = new Map<string, number>();
  for (const r of rs.slice(0, 2)) r.pointIds.forEach((id, i) => routineRank.set(id, Math.max(routineRank.get(id) ?? 0, 62 + 36 * (1 - i / r.pointIds.length))));

  const scored: Array<[number, LibraryPoint]> = [];
  for (const it of index) {
    let s = routineRank.get(it.p.id) ?? 0;
    if (it.code === qc) s = 100;
    else if (it.code.startsWith(qc) && qc.length >= 2) s = Math.max(s, 80 - Math.min(it.code.length - qc.length, 10));
    else if (it.name === q) s = Math.max(s, 90);
    else if (it.name.startsWith(q)) s = Math.max(s, 70);
    else if (it.eng.split(' ').some((w) => w.startsWith(q))) s = Math.max(s, 55);
    else if (it.ind.some((i) => i === q || i.split(' ').some((w) => w.startsWith(q)))) s = Math.max(s, 45);
    else if (q.length >= 3 && (it.name.includes(q) || it.eng.includes(q) || it.ind.some((i) => i.includes(q)))) s = Math.max(s, 30);
    if (s) scored.push([s - (it.p.selfCare === 'avoid' ? 25 : 0), it.p]);
  }
  scored.sort((a, b) => b[0] - a[0] || a[1].code.localeCompare(b[1].code, undefined, { numeric: true }));
  return { routines: rs.slice(0, 4), points: scored.slice(0, maxPoints).map((x) => x[1]), totalPoints: scored.length };
}
