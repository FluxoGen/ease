// Text that would otherwise repeat on many points lives here once. Points reference it by id.

export type TechniqueId = 'circle' | 'press' | 'knead' | 'nail' | 'gentle' | 'ball';
export type CautionId = 'pregnancy' | 'pulse' | 'eye' | 'throat';
export type SelfCare = 'ok' | 'gentle' | 'avoid';

export const TECHNIQUES: Record<TechniqueId, { label: string; how: string; time: string; seconds: number }> = {
  circle: { label: 'Small circles', how: 'Press with a thumb or fingertip and make small, slow circles.', time: '1 minute', seconds: 60 },
  press: { label: 'Steady press', how: 'Press steadily with a thumb or fingertip and hold.', time: '30–60 seconds', seconds: 45 },
  knead: { label: 'Knead', how: 'Squeeze and knead the muscle between your thumb and fingers.', time: '1 minute', seconds: 60 },
  nail: { label: 'Nail press', how: 'Press with the edge of a fingernail, on and off.', time: '10–20 presses', seconds: 30 },
  gentle: { label: 'Light touch', how: 'Light fingertip pressure in tiny circles. Never press hard here.', time: '30 seconds', seconds: 30 },
  ball: { label: 'Tennis ball', how: 'Lean against a tennis ball on a wall and roll gently, or ask someone to press.', time: '1 minute', seconds: 60 },
};

/** Applies to every point; shown once on the point page, not repeated per point. */
export const PRESSING_RULES = [
  'Pressure should feel good, not painful.',
  'Breathe slowly while you press.',
  'If the point has a left and right, do both sides.',
  'Repeat up to a few times a day.',
];

export const CAUTIONS: Record<CautionId, string> = {
  pregnancy: 'Traditionally avoided during pregnancy. Check with your medical provider first.',
  pulse: 'An artery runs here. Press beside the pulse, never on it.',
  eye: 'Stay on the bone around the eye. Never press the eyeball.',
  throat: 'Light touch only. Never press on the windpipe.',
};

/** Shown once on the Safety page and linked from every point. */
export const REVIEW_STATEMENT =
  'Point locations are checked against the WHO Standard Acupuncture Point Locations (2008) and independent references, and re-checked by a second reviewer. They have not been reviewed by a licensed acupuncturist. This is wellness information, not medical advice.';

/** One line, shown on routines whose symptoms can sometimes be serious. Full list on the Safety page. */
export const URGENT_LINE = 'Sudden severe pain, chest pain, trouble breathing, fainting or confusion? Get medical help first.';

export const URGENT_SIGNS = [
  'A sudden, severe or "worst ever" headache',
  'Headache with fever, a stiff neck, confusion, weakness or numbness, or after a head injury',
  'Chest pain, pressure or trouble breathing',
  'Severe belly pain, or vomiting that will not stop',
  'Fainting, or a sudden change in vision or speech',
];

export const CHANNELS: Record<string, string> = {
  LU: 'Lung', LI: 'Large Intestine', ST: 'Stomach', SP: 'Spleen', HT: 'Heart', SI: 'Small Intestine',
  BL: 'Bladder', KI: 'Kidney', PC: 'Pericardium', TE: 'Triple Energizer', GB: 'Gallbladder', LR: 'Liver',
  GV: 'Governing Vessel', CV: 'Conception Vessel', EX: 'Extra point',
};

/** Reference sites. Each point stores only the site id and the page path. */
export const SOURCE_SITES: Record<string, { name: string; base: string }> = {
  who2008: { name: 'WHO Standard Acupuncture Point Locations (2008)', base: '' },
  va: { name: 'U.S. Veterans Affairs acupressure handout (public domain)', base: '' },
  dalberto: { name: "Attilio D'Alberto, acupuncture point directory", base: 'https://www.attiliodalberto.com' },
  tcmwiki: { name: 'TCM Wiki', base: 'https://tcmwiki.com' },
  yyh: { name: 'Yin Yang House', base: 'https://www.yinyanghouse.com' },
  mq: { name: 'Me and Qi', base: 'https://www.meandqi.com' },
  msk: { name: 'Musculoskeletal Key: acupuncture points of the 14 channels', base: 'https://musculoskeletalkey.com' },
  satyori: { name: 'Satyori', base: 'https://satyori.com' },
  pulsetcm: { name: 'Pulse TCM', base: 'https://www.pulsetcm.sg' },
  lierre: { name: 'Lierre', base: 'https://lierre.ca' },
  pmc: { name: 'PubMed Central', base: 'https://pmc.ncbi.nlm.nih.gov' },
  umn: { name: 'University of Minnesota, Taking Charge', base: 'https://www.takingcharge.csh.umn.edu' },
  iaomai: { name: 'Iaomai', base: 'https://www.iaomai.app' },
  acucom: { name: 'Acupuncture.com', base: 'https://www.acupuncture.com' },
};

/** Domain → site id, for normalising research citations. */
export const SITE_BY_DOMAIN: Record<string, string> = Object.fromEntries(
  Object.entries(SOURCE_SITES).filter(([, s]) => s.base).map(([id, s]) => [new URL(s.base).hostname.replace('www.', ''), id]),
);

/** Public legal pages (FluxoGen/legal on GitHub Pages). Also used for the Play Store listing. */
export const PRIVACY_URL = 'https://fluxogen.github.io/legal/ease/privacy/';
export const TERMS_URL = 'https://fluxogen.github.io/legal/ease/terms/';

export const CONTACT_EMAIL = 'fluxogentechnologies@gmail.com';

/** Toast text after answering the pregnancy question. */
export const PREGNANCY_ANSWERS = {
  yes: "Got it. We'll set aside the points traditionally avoided in pregnancy.",
  no: 'Thanks. You can change this anytime in Settings.',
} as const;
