import type { RegionViewId } from '../components/regions/art';

/** Where an unverified point sits on its region illustration (coordinates are in
 * the view's own drawing space — see components/regions/art.tsx). Positions are
 * hand-placed from the WHO landmark descriptions and stay approximate. */
export interface PointDiagramSpec {
  view: RegionViewId;
  x: number;
  y: number;
  /** Several marks for one point (e.g. the EX-B2 series). Overrides x/y for drawing. */
  marks?: Array<[number, number]>;
}

const spine = (ys: number[], dx: number): Array<[number, number]> =>
  ys.flatMap((y) => [[150 - dx, y] as [number, number], [150 + dx, y] as [number, number]]);

export const POINT_DIAGRAMS: Record<string, PointDiagramSpec> = {
  // foot — top
  sp1: { view: 'foot-top', x: 80, y: 80 },
  lr1: { view: 'foot-top', x: 118, y: 82 },
  lr2: { view: 'foot-top', x: 124, y: 150 },
  st44: { view: 'foot-top', x: 166, y: 152 },
  st43: { view: 'foot-top', x: 162, y: 182 },
  st45: { view: 'foot-top', x: 166, y: 68 },
  gb41: { view: 'foot-top', x: 204, y: 202 },
  gb44: { view: 'foot-top', x: 228, y: 114 },
  // foot — inner / outer
  sp3: { view: 'foot-inner', x: 275, y: 226 },
  sp4: { view: 'foot-inner', x: 215, y: 228 },
  kd6: { view: 'foot-inner', x: 100, y: 203 },
  kd3: { view: 'foot-inner', x: 60, y: 170 },
  kd7: { view: 'foot-inner', x: 60, y: 126 },
  bl62: { view: 'foot-outer', x: 96, y: 218 },
  bl65: { view: 'foot-outer', x: 262, y: 238 },
  bl67: { view: 'foot-outer', x: 338, y: 232 },
  // hand
  pc8: { view: 'hand-palm', x: 168, y: 328 },
  pc9: { view: 'hand-palm', x: 169, y: 82 },
  ht9: { view: 'hand-palm', x: 103, y: 160 },
  lu9: { view: 'hand-palm', x: 190, y: 402 },
  pc7: { view: 'hand-palm', x: 152, y: 404 },
  ht5: { view: 'hand-palm', x: 118, y: 424 },
  li3: { view: 'hand-back', x: 124, y: 305 },
  te3: { view: 'hand-back', x: 230, y: 315 },
  te5: { view: 'hand-back', x: 176, y: 428 },
  li1: { view: 'hand-back', x: 113, y: 118 },
  te1: { view: 'hand-back', x: 230, y: 118 },
  si1: { view: 'hand-back', x: 264, y: 172 },
  lu11: { view: 'hand-back', x: 53, y: 252 },
  // arm
  lu5: { view: 'elbow-front', x: 172, y: 180 },
  pc3: { view: 'elbow-front', x: 130, y: 182 },
  ht3: { view: 'elbow-front', x: 106, y: 178 },
  te10: { view: 'elbow-back', x: 150, y: 128 },
  si8: { view: 'elbow-back', x: 116, y: 174 },
  // leg
  sp10: { view: 'leg-front', x: 122, y: 108 },
  lr8: { view: 'leg-front', x: 100, y: 206 },
  sp9: { view: 'leg-front', x: 108, y: 262 },
  gb34: { view: 'leg-front', x: 202, y: 278 },
  st40: { view: 'leg-front', x: 172, y: 386 },
  kd10: { view: 'knee-back', x: 182, y: 206 },
  // torso
  lu1: { view: 'torso-front', x: 66, y: 102 },
  li15: { view: 'torso-front', x: 40, y: 84 },
  cv17: { view: 'torso-front', x: 150, y: 172 },
  lr14: { view: 'torso-front', x: 102, y: 218 },
  lr13: { view: 'torso-front', x: 62, y: 320 },
  cv12: { view: 'torso-front', x: 150, y: 284 },
  st25: { view: 'torso-front', x: 122, y: 340 },
  cv6: { view: 'torso-front', x: 150, y: 361 },
  cv4: { view: 'torso-front', x: 150, y: 382 },
  // back
  gv14: { view: 'back', x: 150, y: 80 },
  bl10: { view: 'back', x: 134, y: 36 },
  bl13: { view: 'back', x: 129, y: 121 },
  bl14: { view: 'back', x: 129, y: 138 },
  bl15: { view: 'back', x: 129, y: 155 },
  si11: { view: 'back', x: 88, y: 160 },
  bl18: { view: 'back', x: 129, y: 223 },
  bl19: { view: 'back', x: 129, y: 240 },
  bl20: { view: 'back', x: 129, y: 257 },
  bl21: { view: 'back', x: 129, y: 274 },
  bl22: { view: 'back', x: 129, y: 295 },
  bl23: { view: 'back', x: 129, y: 318 },
  gv4: { view: 'back', x: 150, y: 330 },
  bl25: { view: 'back', x: 129, y: 364 },
  bl27: { view: 'back', x: 129, y: 404 },
  bl28: { view: 'back', x: 129, y: 420 },
  gb30: { view: 'back', x: 82, y: 468 },
  ex_b2: {
    view: 'back',
    x: 150,
    y: 230,
    marks: spine([87, 104, 121, 138, 155, 172, 189, 206, 223, 240, 257, 274, 295, 318, 341, 364, 387], 7),
  },
  // head
  gv26: { view: 'face-front', x: 150, y: 252 },
  li20: { view: 'face-front', x: 112, y: 240 },
  gb14: { view: 'face-front', x: 110, y: 100 },
  bl2: { view: 'face-front', x: 132, y: 130 },
  gb1: { view: 'face-front', x: 78, y: 154 },
  st6: { view: 'head-side', x: 200, y: 230 },
  si19: { view: 'head-side', x: 188, y: 152 },
  te17: { view: 'head-side', x: 222, y: 186 },
  gv20: { view: 'head-side', x: 205, y: 30 },
};
