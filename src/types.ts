export type UseTag =
  | 'low_back_pain'
  | 'headache'
  | 'neck_pain'
  | 'sleep'
  | 'well_being'
  | 'nausea'
  | 'stress_anxiety';

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
  /** Present when one dedicated official handout covers this exact routine. */
  sourceUrl?: string;
  /** Shown instead of sourceUrl when the routine draws on points already
   * sourced elsewhere rather than one dedicated handout. */
  sourceNote?: string;
}
