export type UseTag =
  | 'low_back_pain'
  | 'headache'
  | 'neck_pain'
  | 'sleep'
  | 'well_being'
  | 'nausea'
  | 'stress_anxiety'
  | 'menstrual_cramps'
  | 'cold_flu'
  | 'energy_fatigue';

export type FivePhase = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

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
  /** Classical TCM designations (Yuan-source, Five-Shu category, Luo-connecting,
   * Eight Confluent point, Four Command Points, etc). Standard textbook facts,
   * only set where genuinely well-established — most extra/empirical points
   * outside the 14 primary meridians won't have any. */
  classicalGroups?: string[];
  /** The Five-Shu "transporting point" element, where the point is one of
   * those five per channel (Jing-well/Ying-spring/Shu-stream/Jing-river/
   * He-sea). Not the channel's own overall element — a separate, rotating
   * classification per point position. */
  fivePhase?: FivePhase;
  /** Position on the body-map silhouette (0-240 x, 0-600 y), and which
   * silhouette view it's shown on. Omitted for points that don't map
   * cleanly onto a simple front/back outline. */
  bodyMap?: { view: 'front' | 'back'; x: number; y: number };
  /** false only for points added pending review by a licensed acupuncturist
   * (the WHO-361 expansion path) — every VA-sourced point here is true. */
  verified: boolean;
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
