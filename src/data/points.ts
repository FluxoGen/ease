import type { Point } from '../types';

import SI4 from '../assets/points/SI4.jpg';
import LingGu from '../assets/points/Ling_Gu.jpg';
import EarLowBackZone from '../assets/points/Ear_Low_Back_Zone.jpg';
import UBLowBackLines from '../assets/points/UB_Low_Back_Lines.jpg';
import HipArea from '../assets/points/Hip_Area.jpg';
import UB40 from '../assets/points/UB40.jpg';
import UB57 from '../assets/points/UB57.jpg';
import LI4 from '../assets/points/LI4.jpg';
import SI3 from '../assets/points/SI3.jpg';
import GB20 from '../assets/points/GB20.jpg';
import TaiYang from '../assets/points/Tai_Yang.jpg';
import LR3 from '../assets/points/LR3.jpg';
import KD1 from '../assets/points/KD1.jpg';
import LuoZhen from '../assets/points/Luo_Zhen.jpg';
import BaiLao from '../assets/points/Bai_Lao.jpg';
import GB21 from '../assets/points/GB21.jpg';
import UB60 from '../assets/points/UB60.jpg';
import HT7 from '../assets/points/HT7.jpg';
import AnMian from '../assets/points/An_Mian.jpg';
import YinTang from '../assets/points/Yin_Tang.jpg';
import SP6 from '../assets/points/SP6.jpg';
import PC6 from '../assets/points/PC6.jpg';
import ST36 from '../assets/points/ST36.jpg';
import LI11 from '../assets/points/LI11.jpg';
import Lu7 from '../assets/points/Lu7.jpg';

const VA_SOURCE = 'VA Portland Health Care System / VHA Office of Patient Centered Care, public domain';

export const points: Point[] = [
  {
    id: 'si4',
    name: 'SI4',
    altNames: ['Wrist Bone'],
    meridian: 'Small Intestine',
    region: 'hand',
    location: 'On the palm side of the hand, in the depression along the outer edge of the wrist, below the base of the little finger.',
    useTags: ['low_back_pain'],
    image: SI4,
    source: VA_SOURCE,
  },
  {
    id: 'ling_gu',
    name: 'Ling Gu',
    altNames: ['Efficacious Bone'],
    region: 'hand',
    location: 'On the back of the hand, in the webbing between the thumb and index finger, closer to the index-finger side.',
    useTags: ['low_back_pain'],
    image: LingGu,
    source: VA_SOURCE,
  },
  {
    id: 'ear_low_back_zone',
    name: 'Ear Low Back Zone',
    region: 'ear',
    location: 'On the ear, along the upper ridge (antihelix), roughly a third of the way down from the top.',
    useTags: ['low_back_pain'],
    image: EarLowBackZone,
    source: VA_SOURCE,
  },
  {
    id: 'ub_low_back_lines',
    name: 'UB Low Back Lines',
    meridian: 'Urinary Bladder',
    region: 'back',
    location: 'Two vertical lines on the lower back, about one to two thumb-widths on either side of the spine, level with the waist.',
    useTags: ['low_back_pain'],
    image: UBLowBackLines,
    source: VA_SOURCE,
  },
  {
    id: 'hip_area',
    name: 'Hip Area',
    region: 'hip',
    location: 'On the buttock, in the muscular area at the level where the back pockets of a pair of pants would sit.',
    useTags: ['low_back_pain'],
    image: HipArea,
    source: VA_SOURCE,
  },
  {
    id: 'ub40',
    name: 'UB40',
    altNames: ['Weizhong'],
    meridian: 'Urinary Bladder',
    region: 'knee',
    location: 'At the back of the knee, in the crease at the midpoint when the leg is straight.',
    useTags: ['low_back_pain'],
    image: UB40,
    source: VA_SOURCE,
  },
  {
    id: 'ub57',
    name: 'UB57',
    altNames: ['Chengshan'],
    meridian: 'Urinary Bladder',
    region: 'calf',
    location: 'On the back of the calf, in the V-shaped notch below the belly of the calf muscle, about halfway between the knee and the heel.',
    useTags: ['low_back_pain'],
    image: UB57,
    source: VA_SOURCE,
  },
  {
    id: 'li4',
    name: 'LI4',
    altNames: ['Hegu'],
    meridian: 'Large Intestine',
    region: 'hand',
    location: 'On the back of the hand, in the highest point of the muscle when the thumb and index finger are brought together.',
    useTags: ['headache', 'well_being'],
    image: LI4,
    pregnancyCaution: true,
    source: VA_SOURCE,
  },
  {
    id: 'si3',
    name: 'SI3',
    altNames: ['Houxi'],
    meridian: 'Small Intestine',
    region: 'hand',
    location: 'On the outer edge of the hand, at the end of the crease that appears when you make a loose fist, below the little finger.',
    useTags: ['headache', 'neck_pain'],
    image: SI3,
    source: VA_SOURCE,
  },
  {
    id: 'gb20',
    name: 'GB20',
    altNames: ['Fengchi'],
    meridian: 'Gallbladder',
    region: 'neck',
    location: 'At the base of the skull, in the two hollows on either side of the spine, below the ridge of bone at the back of the head.',
    useTags: ['headache', 'neck_pain'],
    image: GB20,
    source: VA_SOURCE,
  },
  {
    id: 'tai_yang',
    name: 'Tai Yang',
    region: 'temple',
    location: 'At the temple, in the soft hollow about a finger-width beyond the outer corner of the eyebrow.',
    useTags: ['headache'],
    image: TaiYang,
    source: VA_SOURCE,
  },
  {
    id: 'lr3',
    name: 'LR3',
    altNames: ['Taichong'],
    meridian: 'Liver',
    region: 'foot',
    location: 'On the top of the foot, in the depression where the bones of the big toe and second toe meet, before the ankle.',
    useTags: ['headache'],
    image: LR3,
    source: VA_SOURCE,
  },
  {
    id: 'kd1',
    name: 'KD1',
    altNames: ['Yongquan'],
    meridian: 'Kidney',
    region: 'foot',
    location: 'On the sole of the foot, in the hollow that forms about a third of the way down from the base of the toes when they are curled.',
    useTags: ['headache', 'sleep'],
    image: KD1,
    source: VA_SOURCE,
  },
  {
    id: 'luo_zhen',
    name: 'Luo Zhen',
    altNames: ['Stiff Neck Point'],
    region: 'hand',
    location: 'On the back of the hand, in the small hollow between the knuckles of the index and middle fingers.',
    useTags: ['neck_pain'],
    image: LuoZhen,
    source: VA_SOURCE,
  },
  {
    id: 'bai_lao',
    name: 'Bai Lao',
    region: 'neck',
    location: 'On the back of the neck, on either side of the spine, just above where the shoulder muscle meets the neck.',
    useTags: ['neck_pain'],
    image: BaiLao,
    source: VA_SOURCE,
  },
  {
    id: 'gb21',
    name: 'GB21',
    altNames: ['Jianjing'],
    meridian: 'Gallbladder',
    region: 'shoulder',
    location: 'On top of the shoulder, midway between the base of the neck and the outer edge of the shoulder.',
    useTags: ['neck_pain'],
    image: GB21,
    source: VA_SOURCE,
  },
  {
    id: 'ub60',
    name: 'UB60',
    altNames: ['Kunlun'],
    meridian: 'Urinary Bladder',
    region: 'ankle',
    location: 'On the outside of the ankle, in the hollow between the ankle bone and the Achilles tendon.',
    useTags: ['neck_pain'],
    image: UB60,
    pregnancyCaution: true,
    source: VA_SOURCE,
  },
  {
    id: 'ht7',
    name: 'HT7',
    altNames: ['Shenmen'],
    meridian: 'Heart',
    region: 'wrist',
    location: 'On the palm side of the wrist, at the crease, on the little-finger side.',
    useTags: ['sleep'],
    image: HT7,
    source: VA_SOURCE,
  },
  {
    id: 'an_mian',
    name: 'An Mian',
    altNames: ['Peaceful Sleep'],
    region: 'head',
    location: 'Behind the ear, in the hollow just behind the earlobe, at the hairline.',
    useTags: ['sleep'],
    image: AnMian,
    source: VA_SOURCE,
  },
  {
    id: 'yin_tang',
    name: 'Yin Tang',
    altNames: ['Hall of Impression'],
    region: 'forehead',
    location: 'Between the eyebrows, at the midpoint above the bridge of the nose.',
    useTags: ['sleep', 'headache'],
    image: YinTang,
    source: VA_SOURCE,
  },
  {
    id: 'sp6',
    name: 'SP6',
    altNames: ['Sanyinjiao'],
    meridian: 'Spleen',
    region: 'lower leg',
    location: 'On the inside of the lower leg, about four finger-widths above the tip of the inner ankle bone, just behind the shin bone.',
    useTags: ['sleep', 'well_being'],
    image: SP6,
    pregnancyCaution: true,
    source: VA_SOURCE,
  },
  {
    id: 'pc6',
    name: 'PC6',
    altNames: ['Neiguan'],
    meridian: 'Pericardium',
    region: 'forearm',
    location: 'On the inside of the forearm, about two to three finger-widths above the wrist crease, between the two central tendons.',
    useTags: ['sleep'],
    image: PC6,
    source: VA_SOURCE,
  },
  {
    id: 'st36',
    name: 'ST36',
    altNames: ['Zusanli'],
    meridian: 'Stomach',
    region: 'lower leg',
    location: 'On the outside of the lower leg, about four finger-widths below the kneecap, one finger-width outside the shin bone.',
    useTags: ['well_being'],
    image: ST36,
    source: VA_SOURCE,
  },
  {
    id: 'li11',
    name: 'LI11',
    altNames: ['Quchi'],
    meridian: 'Large Intestine',
    region: 'elbow',
    location: 'At the outer end of the elbow crease, when the elbow is bent.',
    useTags: ['well_being'],
    image: LI11,
    source: VA_SOURCE,
  },
  {
    id: 'lu7',
    name: 'Lu7',
    altNames: ['Lieque'],
    meridian: 'Lung',
    region: 'wrist',
    location: 'On the thumb side of the forearm, about two finger-widths above the wrist crease.',
    useTags: ['well_being'],
    image: Lu7,
    source: VA_SOURCE,
  },
];

export const pointsById = Object.fromEntries(points.map((p) => [p.id, p]));
