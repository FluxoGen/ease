import { library, type LibraryPoint } from './library';

export interface Routine {
  id: string;
  title: string;
  description: string;
  /** Points from a dedicated VA handout, in handout order. Shown first. */
  core: string[];
  /** Every point in the routine: core first, then library points tagged for it. */
  pointIds: string[];
  sourceUrl?: string;
}

interface RoutineDef {
  id: string;
  title: string;
  description: string;
  core?: string[];
  sourceUrl?: string;
}

const DEFS: RoutineDef[] = [
  { id: 'low_back_pain', title: 'Low Back', description: 'Points traditionally used for low back discomfort.', core: ['si4', 'ear_low_back_zone', 'ub_low_back_lines', 'bl40', 'bl57'], sourceUrl: 'https://www.va.gov/files/2021-12/4309_Acupressure_For_Back_Pain.pdf' },
  { id: 'headache', title: 'Headaches', description: 'Points traditionally used for headache discomfort.', core: ['li4', 'si3', 'gb20', 'ex-hn5', 'lr3', 'ki1'], sourceUrl: 'https://www.va.gov/files/2021-12/4300_Acupressure_for_Headaches.pdf' },
  { id: 'neck_pain', title: 'Neck', description: 'Points traditionally used for neck discomfort.', core: ['ex-ue8', 'si3', 'gb20', 'ex-hn15', 'gb21', 'bl60'], sourceUrl: 'https://www.va.gov/files/2021-12/4313_AcupressureforNeckPain.pdf' },
  { id: 'sleep', title: 'Sleep', description: 'Points traditionally used to support restful sleep.', core: ['ht7', 'anmian', 'ex-hn3', 'ki1', 'sp6', 'pc6'], sourceUrl: 'https://www.va.gov/files/2021-12/4312_AcupressureforSleep.pdf' },
  { id: 'well_being', title: 'Well-Being', description: 'Points traditionally used for general well-being.', core: ['li4', 'li11', 'lu7', 'st36', 'sp6'], sourceUrl: 'https://www.va.gov/files/2023-07/Acupressure%20for%20Well-Being.pdf' },
  { id: 'nausea', title: 'Nausea', description: 'Points traditionally used to settle nausea.', core: ['pc6', 'st36'] },
  { id: 'stress_anxiety', title: 'Stress & Anxiety', description: 'Points traditionally used to calm stress and worry.' },
  { id: 'menstrual_cramps', title: 'Menstrual Cramps', description: 'Points traditionally used for period cramps.' },
  { id: 'cold_flu', title: 'Cold & Flu', description: 'Points traditionally used for cold and flu symptoms.' },
  { id: 'energy_fatigue', title: 'Energy & Fatigue', description: 'Points traditionally used when you feel run down.' },
  { id: 'upper_back', title: 'Upper & Mid Back', description: 'Points traditionally used for upper and mid back tension.' },
  { id: 'shoulder_tension', title: 'Shoulder Tension', description: 'Points traditionally used for tight or sore shoulders.' },
  { id: 'eye_strain', title: 'Eye Strain', description: 'Points traditionally used for tired, strained eyes.' },
  { id: 'ear_hearing', title: 'Ear & Hearing', description: 'Points traditionally used for ear discomfort and ringing.' },
  { id: 'digestive_health', title: 'Digestive Health', description: 'Points traditionally used for indigestion and bloating.' },
  { id: 'constipation', title: 'Constipation', description: 'Points traditionally used to help things move.' },
  { id: 'toothache_jaw', title: 'Toothache & Jaw', description: 'Points traditionally used for toothache and jaw tension.' },
  { id: 'nose_sinus', title: 'Nose & Sinus', description: 'Points traditionally used for a blocked or runny nose.' },
  { id: 'cough_breathing', title: 'Cough & Breathing', description: 'Points traditionally used for cough and chest tightness.' },
  { id: 'hand_wrist_strain', title: 'Hand, Wrist & Elbow', description: 'Points traditionally used for strain along the arm, wrist or hand.' },
  { id: 'knee_pain', title: 'Knee', description: 'Points traditionally used for knee discomfort.' },
  { id: 'hip_leg_pain', title: 'Hip & Leg', description: 'Points traditionally used for hip and leg discomfort.' },
  { id: 'foot_ankle_strain', title: 'Foot & Ankle', description: 'Points traditionally used for foot and ankle strain.' },
];

/** A routine is only shown when enough well-sourced points support it. */
const MIN_POINTS = 3;

const usable = (p: LibraryPoint) => p.selfCare !== 'avoid';

export const routines: Routine[] = DEFS.map((d) => {
  const core = (d.core ?? []).filter((id) => library.some((p) => p.id === id));
  const tagged = library.filter((p) => usable(p) && p.tags.includes(d.id) && !core.includes(p.id)).map((p) => p.id);
  return { id: d.id, title: d.title, description: d.description, core, pointIds: [...core, ...tagged], sourceUrl: d.sourceUrl };
}).filter((r) => r.pointIds.length >= MIN_POINTS);

export const routinesById: Record<string, Routine> = Object.fromEntries(routines.map((r) => [r.id, r]));
