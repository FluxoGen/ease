import {
  Activity, Battery, Bone, Brain, Droplets, Dumbbell, Ear, Eye, Feather, Flower2, Footprints, Frown, Hand, HeartPulse,
  Hourglass, Moon, Move, PersonStanding, Shirt, Smile, Thermometer, Utensils, Wind, type LucideIcon,
} from 'lucide-react';
import { routinesById, type Routine } from './routines';

export const ROUTINE_ICONS: Record<string, LucideIcon> = {
  low_back_pain: Activity,
  headache: Brain,
  neck_pain: Move,
  sleep: Moon,
  well_being: HeartPulse,
  nausea: Frown,
  stress_anxiety: Feather,
  menstrual_cramps: Flower2,
  cold_flu: Thermometer,
  energy_fatigue: Battery,
  upper_back: Shirt,
  shoulder_tension: Dumbbell,
  eye_strain: Eye,
  ear_hearing: Ear,
  digestive_health: Utensils,
  constipation: Hourglass,
  toothache_jaw: Smile,
  nose_sinus: Droplets,
  cough_breathing: Wind,
  hand_wrist_strain: Hand,
  knee_pain: Bone,
  hip_leg_pain: PersonStanding,
  foot_ankle_strain: Footprints,
};

/** The six most common reasons people open the app; shown first on Home. */
export const POPULAR = ['headache', 'neck_pain', 'low_back_pain', 'sleep', 'stress_anxiety', 'nausea'];

/** Chunked so Home never shows a flat wall of 23 choices. */
export const SYMPTOM_GROUPS: Array<{ id: string; title: string; routines: string[] }> = [
  { id: 'head', title: 'Head & face', routines: ['headache', 'eye_strain', 'ear_hearing', 'toothache_jaw', 'nose_sinus'] },
  { id: 'neck-back', title: 'Neck, shoulders & back', routines: ['neck_pain', 'shoulder_tension', 'upper_back', 'low_back_pain'] },
  { id: 'chest', title: 'Chest & breathing', routines: ['cough_breathing', 'cold_flu'] },
  { id: 'belly', title: 'Belly & digestion', routines: ['digestive_health', 'nausea', 'constipation', 'menstrual_cramps'] },
  { id: 'limbs', title: 'Arms & legs', routines: ['hand_wrist_strain', 'hip_leg_pain', 'knee_pain', 'foot_ankle_strain'] },
  { id: 'mind', title: 'Mind & energy', routines: ['sleep', 'stress_anxiety', 'energy_fatigue', 'well_being'] },
];

export const routineList = (ids: string[]): Routine[] => ids.map((id) => routinesById[id]).filter(Boolean);
