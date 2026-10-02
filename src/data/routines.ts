import type { Routine } from '../types';

export const routines: Routine[] = [
  {
    id: 'low_back_pain',
    title: 'Low Back',
    description: 'Points traditionally used for low back discomfort.',
    pointIds: [
      'si4', 'ear_low_back_zone', 'ub_low_back_lines', 'ub40', 'ub57',
      'bl23', 'bl25', 'bl27', 'bl28', 'bl22', 'gb30', 'gv4', 'ex_b2',
    ],
    sourceUrl: 'https://www.va.gov/files/2021-12/4309_Acupressure_For_Back_Pain.pdf',
    extraNote:
      'The first five points above are what that VA handout covers (two of its entries — Ling Gu and Hip Area — were left out because they aren\'t recognized standard points). The rest (BL22/23/25/27/28, GB30, GV4, the Huatuojiaji line) are additional classical low-back points not in that handout — each is marked "not yet reviewed" on its own page.',
  },
  {
    id: 'headache',
    title: 'Headaches',
    description: 'Points traditionally used for headache discomfort.',
    pointIds: ['li4', 'si3', 'gb20', 'tai_yang', 'lr3', 'kd1', 'gv20', 'bl2', 'st6', 'gb14'],
    sourceUrl: 'https://www.va.gov/files/2021-12/4300_Acupressure_for_Headaches.pdf',
    extraNote:
      'The first six points above are exactly what that VA handout covers. GV20, BL2, ST6, and GB14 are additional classical points commonly cited for headaches — each is marked "not yet reviewed" on its own page.',
  },
  {
    id: 'neck_pain',
    title: 'Neck',
    description: 'Points traditionally used for neck discomfort.',
    pointIds: ['luo_zhen', 'si3', 'gb20', 'bai_lao', 'gb21', 'ub60', 'bl10'],
    sourceUrl: 'https://www.va.gov/files/2021-12/4313_AcupressureforNeckPain.pdf',
    extraNote:
      'The first six points above are exactly what that VA handout covers. BL10 is an additional classical neck point — marked "not yet reviewed" on its own page.',
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
    pointIds: ['yin_tang', 'ht7', 'pc6', 'cv17', 'lr14', 'bl15'],
    sourceNote:
      'Yin Tang, HT7, and PC6 are drawn from the sleep routine — also commonly used for stress and anxiety. CV17, LR14, and BL15 are additional classical points for this ("not yet reviewed" — see each point\'s own page). See each point\'s page for its own source.',
  },
  {
    id: 'menstrual_cramps',
    title: 'Menstrual Cramps',
    description: 'Points traditionally used for menstrual pain (not for use during pregnancy).',
    pointIds: ['sp6', 'li4', 'sp10'],
    sourceNote:
      'SP6 and LI4 are two of the most widely cited points for menstrual cramps in Traditional Chinese Medicine (they\'re also the two most commonly cited points to avoid during pregnancy, for the same reason). SP10 ("Sea of Blood") is an additional classical point for this, not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'cold_flu',
    title: 'Cold & Flu',
    description: 'Points traditionally used for congestion and early cold symptoms.',
    pointIds: ['li4', 'gb20', 'li11', 'li20', 'lu1', 'gv14', 'lu9', 'lu5', 'lu11'],
    sourceNote:
      'LI4, GB20, and LI11 are drawn from other routines — commonly cited together for colds and congestion. LI20 (beside the nose), the Lung points (LU1/5/9/11), and GV14 (a classical fever/immune point) are additional points for this, not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'energy_fatigue',
    title: 'Energy & Fatigue',
    description: 'Points traditionally used when feeling drained or sluggish.',
    pointIds: ['st36', 'kd1', 'gb20', 'cv4', 'cv6', 'gv20', 'gv4'],
    sourceNote:
      'ST36, KD1, and GB20 are drawn from other routines — a VA Whole Health document on chemotherapy-induced nausea separately confirms ST36 is "commonly used for gastrointestinal discomfort, nausea and vomiting, and stress and fatigue." CV4, CV6, GV20, and GV4 are additional classical vitality points, not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'upper_back',
    title: 'Upper & Mid Back',
    description: 'Points traditionally used for tension between the shoulder blades and along the spine.',
    pointIds: ['bl13', 'bl14', 'bl15', 'bl18', 'bl19', 'bl20', 'bl21', 'gv14', 'ex_b2', 'bl10', 'si11'],
    sourceNote:
      'The Back-Shu points (BL13-21) and the Huatuojiaji paraspinal line are classical points running down the spine, distinct from the lower-back-focused VA routine. All of these are newer additions, not yet reviewed by a licensed acupuncturist — see each point\'s own page.',
  },
  {
    id: 'shoulder_tension',
    title: 'Shoulder Tension',
    description: 'Points traditionally used for tightness across the top of the shoulder.',
    pointIds: ['gb21', 'li15', 'si11'],
    sourceNote:
      'GB21 is drawn from the neck routine above (VA-sourced). LI15 and SI11 are additional classical shoulder points, not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'eye_strain',
    title: 'Eye Strain',
    description: 'Points traditionally used around the eyes and brow for visual fatigue.',
    pointIds: ['tai_yang', 'gb20', 'gb1', 'gb14', 'bl2'],
    sourceNote:
      'Tai Yang and GB20 are drawn from the headache routine above (VA-sourced). GB1, GB14, and BL2 are additional classical points around the eyes, not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'ear_hearing',
    title: 'Ear & Hearing',
    description: 'Points traditionally used around the ear.',
    pointIds: ['an_mian', 'te17', 'si19'],
    sourceNote:
      'An Mian is drawn from the sleep routine above (VA-sourced). TE17 and SI19 are additional classical points around the ear, not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'digestive_health',
    title: 'Digestive Health',
    description: 'Points traditionally used for indigestion and general digestive discomfort.',
    pointIds: ['st36', 'pc6', 'cv12', 'st25', 'lr13', 'bl20', 'bl21'],
    sourceNote:
      'ST36 and PC6 are drawn from other routines above (VA-sourced). CV12, ST25, LR13, BL20, and BL21 are additional classical digestive points, not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'hand_wrist_strain',
    title: 'Hand, Wrist & Elbow',
    description: 'Points traditionally used for strain along the arm, wrist, or hand.',
    pointIds: [
      'li4', 'li11', 'lu7', 'ht7', 'pc6', 'si3', 'si4', 'luo_zhen',
      'li1', 'li3', 'si1', 'si8', 'te1', 'te3', 'te5', 'te10', 'ht3', 'ht5', 'ht9',
      'pc3', 'pc7', 'pc8', 'pc9', 'lu5', 'lu9', 'lu11',
    ],
    sourceNote:
      'The first eight points are drawn from other routines above (VA-sourced). The rest are additional classical points along the arm — many of them the Five-Shu (transporting) points for their channels — not yet reviewed. See each point\'s page for its own source.',
  },
  {
    id: 'foot_ankle_strain',
    title: 'Foot & Ankle',
    description: 'Points traditionally used for strain along the lower leg, ankle, or foot.',
    pointIds: [
      'kd1', 'ub60', 'lr3',
      'sp4', 'sp1', 'sp3', 'sp9', 'gb34', 'gb41', 'gb44', 'lr1', 'lr2', 'lr8',
      'st40', 'st43', 'st44', 'st45', 'kd3', 'kd6', 'kd7', 'kd10', 'bl62', 'bl65', 'bl67',
    ],
    sourceNote:
      'KD1, UB60, and LR3 are drawn from other routines above (VA-sourced). The rest are additional classical points along the leg and foot — many of them the Five-Shu (transporting) points for their channels — not yet reviewed. See each point\'s page for its own source.',
  },
];

export const routinesById = Object.fromEntries(routines.map((r) => [r.id, r]));
