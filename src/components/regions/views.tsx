import type { RegionView, RegionViewId } from './art';
import { FootTop, FootSide, HandPalm, HandBack, ElbowFront, ElbowBack, LegFront, KneeBack, TorsoFront, BackArt, FaceFront, HeadSide } from './art';

export const REGION_VIEWS: Record<RegionViewId, RegionView> = {
  'foot-top': { label: 'Right foot · top view', size: [300, 420], win: [250, 250], pullX: [160, 0.6], Art: FootTop },
  'foot-inner': { label: 'Right foot · inner side', size: [400, 300], win: [200, 200], Art: () => <FootSide outer={false} /> },
  'foot-outer': { label: 'Right foot · outer side', size: [400, 300], win: [200, 200], Art: () => <FootSide outer /> },
  'hand-palm': { label: 'Right hand · palm side', size: [300, 540], win: [250, 250], pullX: [160, 0.7], Art: HandPalm },
  'hand-back': { label: 'Right hand · back of hand', size: [300, 540], win: [250, 250], pullX: [170, 0.7], Art: HandBack },
  'elbow-front': { label: 'Right arm · inside of elbow', size: [300, 380], win: [170, 170], Art: ElbowFront },
  'elbow-back': { label: 'Right arm · back of elbow', size: [300, 380], win: [170, 170], Art: ElbowBack },
  'leg-front': { label: 'Right leg · front', size: [300, 620], win: [220, 220], Art: LegFront },
  'knee-back': { label: 'Right leg · back of knee', size: [300, 420], win: [200, 200], Art: KneeBack },
  'torso-front': { label: 'Front of the torso', size: [300, 520], win: [240, 240], mirrorX: 150, Art: TorsoFront },
  back: { label: 'Back', size: [300, 620], win: [210, 210], mirrorX: 150, Art: BackArt },
  'face-front': { label: 'Face · front', size: [300, 380], win: [240, 240], mirrorX: 150, Art: FaceFront },
  'head-side': { label: 'Head · right side', size: [300, 340], win: [240, 240], Art: HeadSide },
};
