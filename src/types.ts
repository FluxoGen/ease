export type UseTag =
  | 'low_back_pain'
  | 'headache'
  | 'neck_pain'
  | 'sleep'
  | 'well_being';

export interface Point {
  id: string;
  name: string;
  altNames?: string[];
  meridian?: string;
  region: string;
  location: string;
  useTags: UseTag[];
  image: string;
  pregnancyCaution?: boolean;
  source: string;
}

export interface Routine {
  id: UseTag;
  title: string;
  description: string;
  pointIds: string[];
  sourceUrl: string;
}
