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
];

export const routinesById = Object.fromEntries(routines.map((r) => [r.id, r]));
