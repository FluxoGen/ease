// Geometry for every atlas view: landmark coordinates, channel lines and cun scales.
// The drawings in ./art.tsx are drawn around these same numbers, and ./place.ts turns a
// point's placement spec (docs/library-pipeline.md) into a position on the drawing.

export type ViewId =
  | 'foot-top' | 'foot-inner' | 'foot-outer' | 'foot-sole'
  | 'hand-palm' | 'hand-back' | 'arm-inner' | 'arm-outer'
  | 'leg-front' | 'leg-inner' | 'leg-outer' | 'leg-back'
  | 'torso-front' | 'torso-side' | 'back'
  | 'face-front' | 'head-side' | 'head-back' | 'head-top';

export type XY = [number, number];

export interface ViewGeometry {
  label: string;
  size: XY;
  /** Crop window for one point. */
  win: XY;
  landmarks: Record<string, XY>;
  /** Channel lines as polylines, ordered from the trunk/head end outward (so +cun walks toward index 0). */
  lines: Record<string, XY[]>;
  /** Vertical cun scale by band: [yTop, yBottom, cun]. Outside every band, `cunPx` is used. */
  bands: Array<[number, number, number]>;
  /** Pixels per cun for sideways offsets (and vertical fallback). */
  cunPx: number;
  /** Screen direction of "up" (toward the trunk/head): -1 = up the page, +1 = down the page. */
  upY: -1 | 1;
  /** Screen x direction of "out" (away from the midline / toward the named outer side). */
  outX: -1 | 1;
  /** Body-centred views: points off the midline are mirrored across this x. */
  mirrorX?: number;
}

const ics = (n: number) => 100 + 24 * (n - 1);
const spine: Record<string, number> = {
  C7: 70, T1: 87, T2: 104, T3: 121, T4: 138, T5: 155, T6: 172, T7: 189, T8: 206, T9: 223, T10: 240,
  T11: 257, T12: 274, L1: 295, L2: 318, L3: 341, L4: 364, L5: 387, S1: 404, S2: 420, S3: 436, S4: 452,
};

export const VIEWS: Record<ViewId, ViewGeometry> = {
  // ------------------------------------------------------------------ feet
  'foot-top': {
    label: 'Right foot · top', size: [300, 420], win: [240, 240], cunPx: 16, upY: 1, outX: 1,
    landmarks: {
      big_toe_nail_corner_inner: [78, 70], big_toe_nail_corner_outer: [114, 70],
      toe2_nail_corner_outer: [161, 80], toe4_nail_corner_outer: [224, 118],
      web_1_2: [126, 152], web_2_3: [166, 154], web_3_4: [200, 160], web_4_5: [228, 168],
      mtp_1: [98, 192], mtp_2: [148, 198], mtp_4: [212, 206], mtp_5: [240, 214],
      met_base_1_2: [124, 292], met_base_2_3: [152, 296], met_base_4_5: [204, 292],
      ankle_front_crease_mid: [152, 380], tibialis_tendon: [118, 372], ext_hallucis_tendon: [134, 366],
      ext_digitorum_tendon_little: [196, 326],
    },
    lines: {
      LR: [[118, 380], [124, 300], [124, 200], [118, 60]],
      ST: [[152, 380], [154, 300], [162, 200], [166, 60]],
      GB: [[190, 380], [204, 300], [222, 240], [228, 110]],
    },
    bands: [[150, 380, 6]],
  },
  'foot-inner': {
    label: 'Right foot · inner side', size: [400, 300], win: [220, 220], cunPx: 24, upY: -1, outX: -1,
    landmarks: {
      medial_malleolus: [100, 170], achilles_tendon: [50, 150], calcaneus_medial: [72, 232],
      navicular_tuberosity: [185, 196], met1_base: [218, 222], mtp_1_inner: [276, 228],
      big_toe_nail_corner_inner: [352, 224], sole_border: [210, 250],
    },
    lines: {
      SP: [[100, 40], [140, 220], [276, 228], [352, 224]],
      KI: [[70, 0], [72, 150], [80, 200], [100, 205]],
      LR: [[130, 40], [130, 170], [140, 200]],
    },
    bands: [],
  },
  'foot-outer': {
    label: 'Right foot · outer side', size: [400, 300], win: [220, 220], cunPx: 24, upY: -1, outX: 1,
    landmarks: {
      lateral_malleolus: [96, 190], achilles_tendon: [50, 150], calcaneus_lateral: [76, 236],
      cuboid: [172, 224], met5_tuberosity: [236, 214], met5_head: [282, 238],
      toe5_nail_corner_outer: [338, 232], sole_border: [210, 252],
    },
    lines: {
      BL: [[60, 0], [70, 190], [96, 220], [236, 228], [338, 232]],
      GB: [[120, 0], [118, 170], [130, 205]],
    },
    bands: [],
  },
  'foot-sole': {
    label: 'Right foot · sole', size: [300, 600], win: [240, 260], cunPx: 20, upY: 1, outX: 1,
    landmarks: { toe_web_2_3: [158, 150], heel_back: [150, 570], sole_mid: [152, 330] },
    lines: {},
    bands: [],
  },

  // ------------------------------------------------------------------ hand & arm
  'hand-palm': {
    label: 'Right hand · palm', size: [300, 540], win: [240, 240], cunPx: 28, upY: 1, outX: 1,
    landmarks: {
      wrist_crease_palm: [152, 404], pisiform: [112, 404], radial_artery: [192, 404],
      thenar: [208, 352], palm_center: [168, 330], mcp_2_3_palm: [182, 286],
      middle_fingertip: [169, 76], little_finger_nail_corner_radial: [103, 162],
      thumb_nail_corner_radial: [266, 214], index_nail_corner_radial: [229, 118],
    },
    lines: {
      LU: [[190, 540], [192, 404], [222, 330], [266, 200]],
      PC: [[152, 540], [152, 404], [168, 330], [169, 76]],
      HT: [[118, 540], [116, 404], [100, 300], [103, 160]],
    },
    bands: [[404, 540, 3.4]],
  },
  'hand-back': {
    label: 'Right hand · back', size: [300, 540], win: [240, 240], cunPx: 28, upY: 1, outX: -1,
    landmarks: {
      wrist_crease_back: [176, 394], snuffbox: [112, 392], met_1_2_junction: [120, 346],
      mcp_2_radial: [120, 300], mcp_4_5: [232, 300], mcp_5_ulnar: [262, 306],
      hamate_triquetrum_dip: [240, 382], index_nail_corner_radial: [114, 118],
      ring_nail_corner_ulnar: [228, 116], little_nail_corner_ulnar: [264, 172],
      thumb_nail_corner_radial: [53, 252],
    },
    lines: {
      LI: [[122, 540], [112, 392], [118, 346], [120, 300], [114, 118]],
      TE: [[176, 540], [176, 394], [204, 360], [232, 300], [228, 116]],
      SI: [[232, 540], [240, 394], [250, 370], [264, 306], [264, 172]],
    },
    bands: [[394, 540, 3.6]],
  },
  'arm-inner': {
    label: 'Right arm · palm side', size: [300, 780], win: [220, 220], cunPx: 30, upY: -1, outX: -1,
    landmarks: {
      axilla_apex: [184, 22], axillary_fold_front: [118, 40], biceps_tendon: [150, 296],
      elbow_crease: [150, 310], medial_epicondyle: [208, 312],
      palmaris_tendon: [150, 640], fcu_tendon: [182, 640], wrist_crease_palm: [150, 670],
    },
    lines: {
      LU: [[112, 30], [118, 200], [128, 310], [124, 500], [120, 670]],
      PC: [[150, 40], [150, 200], [162, 310], [152, 500], [150, 670]],
      HT: [[184, 22], [188, 200], [206, 312], [190, 500], [180, 670]],
    },
    bands: [[40, 310, 9], [310, 670, 12]],
  },
  'arm-outer': {
    label: 'Right arm · back', size: [300, 780], win: [220, 220], cunPx: 30, upY: -1, outX: -1,
    landmarks: {
      acromion: [116, 34], acromial_angle: [172, 44], axillary_fold_back: [196, 92],
      deltoid_insertion: [114, 136], lateral_epicondyle: [106, 312], elbow_crease_lateral_end: [102, 302],
      olecranon: [160, 318], wrist_crease_back: [150, 670],
    },
    lines: {
      LI: [[116, 34], [112, 200], [102, 302], [112, 420], [124, 670]],
      TE: [[166, 50], [162, 250], [160, 300], [154, 450], [150, 670]],
      SI: [[196, 92], [198, 250], [202, 318], [190, 450], [180, 670]],
    },
    bands: [[92, 310, 9], [310, 670, 12]],
  },

  // ------------------------------------------------------------------ leg
  'leg-front': {
    label: 'Right leg · front', size: [300, 1020], win: [240, 240], cunPx: 24, upY: -1, outX: -1,
    landmarks: {
      asis: [92, 40], pubic_symphysis_top: [236, 70], patella_base: [150, 502], patella_apex: [150, 562],
      patella_lateral_hollow: [124, 580], patella_medial_hollow: [176, 580], tibial_tuberosity: [150, 620],
      tibial_crest: [152, 760], ankle_front_crease_mid: [150, 988],
      lateral_malleolus: [112, 976], medial_malleolus: [190, 966],
    },
    lines: {
      ST: [[92, 40], [108, 300], [124, 502], [124, 580], [130, 640], [130, 960], [150, 988]],
      SP: [[226, 120], [212, 300], [190, 470], [196, 600], [192, 940]],
      LR: [[232, 100], [222, 300], [200, 480], [176, 600], [172, 940]],
    },
    bands: [[70, 502, 18], [580, 976, 16]],
  },
  'leg-inner': {
    label: 'Right leg · inner side', size: [300, 1020], win: [240, 240], cunPx: 24, upY: -1, outX: 1,
    landmarks: {
      pubic_symphysis_top: [70, 60], adductor_bulge: [112, 380], patella_medial_base: [72, 470],
      knee_crease_medial_end: [196, 546], tibia_medial_condyle: [118, 562],
      tibia_posterior_border: [132, 760], achilles_tendon: [214, 900], medial_malleolus: [150, 962],
    },
    lines: {
      SP: [[80, 60], [92, 380], [84, 470], [118, 562], [134, 760], [148, 930]],
      LR: [[70, 80], [140, 350], [176, 540], [114, 700], [112, 860], [124, 950]],
      KI: [[110, 60], [180, 330], [196, 546], [206, 760], [196, 900], [188, 962]],
    },
    bands: [[60, 546, 19], [562, 962, 13]],
  },
  'leg-outer': {
    label: 'Right leg · outer side', size: [300, 1020], win: [240, 240], cunPx: 24, upY: -1, outX: 1,
    landmarks: {
      asis: [62, 40], greater_trochanter: [168, 92], iliotibial_band: [150, 300],
      popliteal_crease_lateral_end: [214, 546], fibula_head: [192, 590], tibial_crest: [70, 760],
      achilles_tendon: [222, 890], lateral_malleolus: [150, 972],
    },
    lines: {
      GB: [[168, 92], [150, 200], [150, 540], [180, 606], [168, 800], [152, 940], [140, 980]],
      ST: [[70, 560], [84, 620], [86, 960]],
      BL: [[244, 120], [236, 546], [226, 700], [214, 960]],
    },
    bands: [[92, 546, 19], [546, 972, 16]],
  },
  'leg-back': {
    label: 'Right leg · back', size: [300, 1020], win: [240, 240], cunPx: 24, upY: -1, outX: 1,
    landmarks: {
      gluteal_fold_mid: [150, 60], biceps_femoris_tendon: [196, 480], semitendinosus_tendon: [108, 480],
      popliteal_crease_mid: [150, 520], popliteal_crease_lateral_end: [206, 520],
      popliteal_crease_medial_end: [94, 520], calf_bulge_bottom: [150, 762],
      achilles_tendon: [150, 900], heel: [150, 992],
    },
    lines: {
      BL: [[150, 60], [150, 520], [150, 762], [156, 960]],
      KI: [[96, 420], [94, 520], [104, 760], [118, 960]],
    },
    bands: [[60, 520, 14], [520, 960, 16]],
  },

  // ------------------------------------------------------------------ trunk
  'torso-front': {
    label: 'Front of the body', size: [300, 520], win: [240, 240], cunPx: 12, upY: -1, outX: -1, mirrorX: 150,
    landmarks: {
      suprasternal_notch: [150, 48], clavicle_mid: [100, 60], infraclavicular_fossa: [66, 96],
      coracoid: [60, 100], sternal_angle: [150, 90],
      ics_1: [150, ics(1)], ics_2: [150, ics(2)], ics_3: [150, ics(3)], ics_4: [150, ics(4)],
      ics_5: [150, ics(5)], ics_6: [150, ics(6)], ics_7: [150, ics(7)],
      nipple: [102, ics(4)], xiphisternal_junction: [150, 252], costal_margin: [84, 300],
      rib_11_tip: [62, 330], umbilicus: [150, 340], asis: [84, 372], pubic_symphysis_top: [150, 395],
    },
    lines: {
      CV: [[150, 40], [150, 400]],
      KI: [[126, 90], [126, 250], [144, 262], [144, 395]],
      ST: [[102, 70], [102, 250], [126, 262], [126, 400]],
      SP: [[78, 100], [78, 250], [102, 280], [102, 410]],
      LR: [[102, 200], [90, 260], [62, 330]],
      GB: [[90, 220], [70, 330]],
      LU: [[66, 90], [66, 110]],
      PC: [[90, 160], [90, 180]],
    },
    bands: [[252, 340, 8], [340, 395, 5]],
  },
  'torso-side': {
    label: 'Right side of the body', size: [300, 700], win: [240, 240], cunPx: 26, upY: -1, outX: -1,
    landmarks: {
      axilla_apex: [150, 60], midaxillary_line: [150, 200], ics_6: [150, 250],
      rib_11_tip: [112, 370], rib_12_tip: [178, 398], iliac_crest: [150, 470],
      asis: [80, 500], greater_trochanter: [150, 640],
    },
    lines: {
      GB: [[150, 60], [150, 270], [112, 380], [92, 460], [80, 520], [112, 600], [150, 640]],
      SP: [[150, 200], [150, 280]],
      LR: [[100, 330], [112, 370]],
    },
    bands: [[60, 370, 12]],
  },
  back: {
    label: 'Back', size: [300, 620], win: [220, 220], cunPx: 14, upY: -1, outX: -1, mirrorX: 150,
    landmarks: {
      ...Object.fromEntries(Object.entries(spine).map(([k, y]) => [k, [150, y] as XY])),
      sacral_hiatus: [150, 468], coccyx_tip: [150, 500],
      scapula_spine_root: [108, 121], scapula_inferior_angle: [112, 200], scapula_mid: [82, 156],
      acromial_angle: [40, 100], iliac_crest_top: [90, 360], psis: [128, 420],
      greater_trochanter: [46, 470], gluteal_fold_mid: [100, 572],
    },
    lines: {
      GV: [[150, 30], [150, 500]],
      huatuo: [[143, 70], [143, 400]],
      BL_inner: [[129, 40], [129, 470]],
      BL_outer: [[108, 70], [108, 420]],
      SI: [[52, 104], [82, 156], [108, 121], [126, 90]],
      TE: [[60, 96], [90, 100]],
      GB: [[86, 72], [46, 470]],
    },
    bands: [],
  },

  // ------------------------------------------------------------------ head
  'face-front': {
    label: 'Face', size: [300, 380], win: [240, 240], cunPx: 16, upY: -1, outX: -1, mirrorX: 150,
    landmarks: {
      anterior_hairline_mid: [150, 70], forehead_mid: [150, 96], glabella: [150, 134],
      eyebrow_inner: [134, 128], eyebrow_mid: [110, 118], eyebrow_outer: [88, 130],
      inner_eye_corner: [130, 152], outer_eye_corner: [90, 152], pupil: [110, 152],
      infraorbital_ridge: [110, 172], nose_wing: [128, 232], philtrum: [150, 252],
      mouth_corner: [116, 278], chin_groove: [150, 304],
    },
    lines: {
      GV: [[150, 40], [150, 252]], CV: [[150, 280], [150, 345]],
      ST: [[110, 152], [110, 260], [116, 280]], BL: [[130, 60], [132, 152]], GB: [[110, 70], [110, 118]],
    },
    bands: [[70, 118, 3]],
  },
  'head-side': {
    label: 'Head and neck · right side', size: [300, 470], win: [230, 230], cunPx: 18, upY: -1, outX: 1,
    landmarks: {
      ear_apex: [200, 156], tragus: [178, 192], earlobe: [200, 224], mastoid: [230, 236],
      jaw_angle: [198, 272], masseter_bulge: [160, 255], zygomatic_arch: [160, 205], temple: [140, 160],
      temporal_hairline: [150, 125], adams_apple: [100, 362], scm_front: [143, 352], scm_back: [186, 352],
      clavicle_mid: [160, 445],
    },
    lines: {
      GB: [[150, 125], [176, 128], [205, 140], [238, 175], [240, 210], [230, 236]],
      TE: [[200, 150], [215, 162], [224, 200], [230, 236]],
      SI: [[184, 192], [204, 286], [190, 340]],
      ST: [[150, 110], [160, 205], [160, 255], [130, 360], [126, 440]],
      LI: [[150, 330], [140, 420]],
    },
    bands: [],
  },
  'head-back': {
    label: 'Back of the head and neck', size: [300, 360], win: [240, 240], cunPx: 19, upY: -1, outX: -1, mirrorX: 150,
    landmarks: {
      external_occipital_protuberance: [150, 120], occiput_base: [150, 168], posterior_hairline_mid: [150, 210],
      C7: [150, 270], mastoid: [66, 176], trapezius_outer_edge: [126, 196], scm_back: [86, 236],
    },
    lines: {
      GV: [[150, 30], [150, 300]], BL: [[125, 30], [125, 300]], GB: [[116, 60], [100, 190], [66, 190]],
    },
    bands: [[210, 270, 3]],
  },
  'head-top': {
    label: 'Top of the head', size: [300, 480], win: [240, 240], cunPx: 30, upY: 1, outX: -1, mirrorX: 150,
    landmarks: {
      anterior_hairline_mid: [150, 76], vertex: [150, 226], ear_apex_line: [60, 226],
      posterior_hairline_mid: [150, 436],
    },
    lines: { GV: [[150, 40], [150, 440]], BL: [[105, 40], [105, 440]], GB: [[82, 40], [80, 300]] },
    bands: [[76, 436, 12]],
  },
};
