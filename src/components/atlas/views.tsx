import type { ReactNode } from 'react';
import { BackArt, FaceFront, FootSide, FootTop, HandBack, HandPalm, TorsoFront } from '../regions/art';
import {
  ArmInner, ArmOuter, FootSole, HeadBack, HeadSide, HeadTop, LegBack, LegFront, LegInner, LegOuter, TorsoSide,
} from './art';
import type { ViewId } from './geometry';

/** Drawing for each atlas view. Geometry (landmarks, lines, scales) lives in ./geometry.ts. */
export const VIEW_ART: Record<ViewId, () => ReactNode> = {
  'foot-top': FootTop,
  'foot-inner': () => <FootSide outer={false} />,
  'foot-outer': () => <FootSide outer />,
  'foot-sole': FootSole,
  'hand-palm': HandPalm,
  'hand-back': HandBack,
  'arm-inner': ArmInner,
  'arm-outer': ArmOuter,
  'leg-front': LegFront,
  'leg-inner': LegInner,
  'leg-outer': LegOuter,
  'leg-back': LegBack,
  'torso-front': TorsoFront,
  'torso-side': TorsoSide,
  back: BackArt,
  'face-front': FaceFront,
  'head-side': HeadSide,
  'head-back': HeadBack,
  'head-top': HeadTop,
};
