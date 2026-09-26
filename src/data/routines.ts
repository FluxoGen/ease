import type { Routine } from '../types';

export const routines: Routine[] = [
  {
    id: 'low_back_pain',
    title: 'Low Back',
    description: 'Points traditionally used for low back discomfort.',
    pointIds: ['si4', 'ling_gu', 'ear_low_back_zone', 'ub_low_back_lines', 'hip_area', 'ub40', 'ub57'],
    sourceUrl: 'https://www.va.gov/files/2021-12/4309_Acupressure_For_Back_Pain.pdf',
  },
  {
    id: 'headache',
    title: 'Headaches',
    description: 'Points traditionally used for headache discomfort.',
    pointIds: ['li4', 'si3', 'gb20', 'tai_yang', 'lr3', 'kd1'],
    sourceUrl: 'https://www.va.gov/files/2021-12/4300_Acupressure_for_Headaches.pdf',
  },
  {
    id: 'neck_pain',
    title: 'Neck',
    description: 'Points traditionally used for neck discomfort.',
    pointIds: ['luo_zhen', 'si3', 'gb20', 'bai_lao', 'gb21', 'ub60'],
    sourceUrl: 'https://www.va.gov/files/2021-12/4313_AcupressureforNeckPain.pdf',
  },
  {
    id: 'sleep',
    title: 'Sleep',
    description: 'Points traditionally used to support restful sleep.',
    pointIds: ['ht7', 'an_mian', 'yin_tang', 'kd1', 'sp6', 'pc6'],
    sourceUrl: 'https://www.va.gov/files/2021-12/4312_AcupressureforSleep.pdf',
  },
  {
    id: 'well_being',
    title: 'Well-Being',
    description: 'Points traditionally used for general wellness.',
    pointIds: ['li4', 'li11', 'lu7', 'st36', 'sp6'],
    sourceUrl: 'https://www.va.gov/files/2023-07/Acupressure%20for%20Well-Being.pdf',
  },
  {
    id: 'nausea',
    title: 'Nausea',
    description: 'Points traditionally used for nausea and upset stomach.',
    pointIds: ['pc6', 'st36'],
    sourceUrl:
      'https://www.va.gov/WHOLEHEALTHLIBRARY/docs/Managing-Chemotherapy-Induced-Nausea-and-Vomiting.pdf',
  },
  {
    id: 'stress_anxiety',
    title: 'Stress & Anxiety',
    description: 'Points traditionally used for calming a racing mind or a tense body.',
    pointIds: ['yin_tang', 'ht7', 'pc6'],
    sourceNote:
      'These three points are drawn from the sleep routine above — Yin Tang, HT7, and PC6 are also commonly used for stress and anxiety in Traditional Chinese Medicine. See each point\'s page for its own source.',
  },
  {
    id: 'menstrual_cramps',
    title: 'Menstrual Cramps',
    description: 'Points traditionally used for menstrual pain (not for use during pregnancy).',
    pointIds: ['sp6', 'li4'],
    sourceNote:
      'Drawn from the sleep and well-being/headache routines above — SP6 and LI4 are two of the most widely cited points for menstrual cramps in Traditional Chinese Medicine (they\'re also the two most commonly cited points to avoid during pregnancy, for the same reason). See each point\'s page for its own source.',
  },
  {
    id: 'cold_flu',
    title: 'Cold & Flu',
    description: 'Points traditionally used for congestion and early cold symptoms.',
    pointIds: ['li4', 'gb20', 'li11'],
    sourceNote:
      'Drawn from the headache, neck, and well-being routines above — LI4, GB20, and LI11 are commonly cited together for colds and congestion in Traditional Chinese Medicine. See each point\'s page for its own source.',
  },
  {
    id: 'energy_fatigue',
    title: 'Energy & Fatigue',
    description: 'Points traditionally used when feeling drained or sluggish.',
    pointIds: ['st36', 'kd1', 'gb20'],
    sourceNote:
      'Drawn from other routines above — a VA Whole Health document on chemotherapy-induced nausea separately confirms ST36 is "commonly used for gastrointestinal discomfort, nausea and vomiting, and stress and fatigue"; KD1 and GB20 are widely cited alongside it for low energy in Traditional Chinese Medicine. See each point\'s page for its own source.',
  },
];

export const routinesById = Object.fromEntries(routines.map((r) => [r.id, r]));
