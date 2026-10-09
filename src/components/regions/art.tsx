import type { ReactNode } from 'react';

// Original region illustrations (flat vector, drawn for this app) used for points
// that have no photo. Each view is a larger drawing; RegionDiagram crops a window
// of it around the point. Coordinates here are shared with src/data/pointDiagrams.ts.

export type RegionViewId =
  | 'foot-top'
  | 'foot-inner'
  | 'foot-outer'
  | 'hand-palm'
  | 'hand-back'
  | 'elbow-front'
  | 'elbow-back'
  | 'leg-front'
  | 'knee-back'
  | 'torso-front'
  | 'back'
  | 'face-front'
  | 'head-side';

export interface RegionView {
  label: string;
  /** Full drawing size. */
  size: [number, number];
  /** Crop window shown for one point. */
  win: [number, number];
  /** Bilateral points are mirrored across this x (body-centred views only). */
  mirrorX?: number;
  /** Pull the crop's x-centre toward the drawing's body: [targetX, weight 0-1]. */
  pullX?: [number, number];
  Art: () => ReactNode;
}

const SKIN = '#F3D9C4';
const SHADE = '#E6C0A5';
const LINE = '#B58467';
const FAINT = '#D2A88E';
const NAIL = '#FAEDE3';
const LABEL = '#8A6650';

const stroke = { stroke: LINE, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const faint = { stroke: FAINT, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' } as const;

/** Finger/toe: rounded top, open bottom so it merges into the body behind it. */
function Digit({
  x, y, w, h, nail = true, rot,
}: { x: number; y: number; w: number; h: number; nail?: boolean; rot?: string }) {
  const r = w / 2;
  const b = y + h;
  return (
    <g transform={rot}>
      <path
        d={`M${x} ${b} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${b}`}
        fill={SKIN}
        {...stroke}
      />
      {nail && (
        <rect x={x + w * 0.18} y={y + 4} width={w * 0.64} height={Math.min(h * 0.3, w * 0.8)}
          rx={w * 0.25} fill={NAIL} stroke={FAINT} strokeWidth={1.4} />
      )}
    </g>
  );
}

function Label({ x, y, children, anchor = 'start' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fontSize={10} fill={LABEL} textAnchor={anchor} fontFamily="Manrope, sans-serif" fontWeight={600}>
      {children}
    </text>
  );
}

/** Dashed level guide with a label at the left edge. */
function Guide({ y, w, children }: { y: number; w: number; children: ReactNode }) {
  return (
    <g>
      <line x1={4} x2={w - 4} y1={y} y2={y} stroke={LINE} strokeOpacity={0.45} strokeWidth={1} strokeDasharray="4 4" />
      <text x={48} y={y - 3} fontSize={9.5} fill={LABEL} fontFamily="Manrope, sans-serif" fontWeight={700}>{children}</text>
    </g>
  );
}

// ---------------------------------------------------------------- FEET

export function FootTop() {
  return (
    <>
      <path d="M108 420 C104 350 98 300 86 250 C74 210 68 180 70 150 L256 150 L256 190 C252 205 234 225 224 250 C214 292 202 345 198 420 Z" fill={SKIN} />
      <Digit x={68} y={48} w={56} h={125} />
      <Digit x={128} y={62} w={40} h={115} />
      <Digit x={166} y={80} w={36} h={100} />
      <Digit x={198} y={100} w={32} h={85} />
      <Digit x={226} y={124} w={30} h={66} />
      <path d="M70 150 C68 180 74 210 86 250 C98 300 104 350 108 420" fill="none" {...stroke} />
      <path d="M256 186 C252 205 234 225 224 250 C214 292 202 345 198 420" fill="none" {...stroke} />
      {/* tendons fanning to the ankle */}
      <path d="M96 176 C110 230 135 290 150 340" {...faint} />
      <path d="M148 180 C150 230 152 290 152 340" {...faint} />
      <path d="M184 182 C176 230 164 290 156 340" {...faint} />
      <path d="M214 188 C200 240 176 300 160 345" {...faint} />
      <path d="M106 372 Q152 392 202 372" {...faint} />
      <Label x={152} y={400} anchor="middle">ankle crease</Label>
      <Label x={96} y={42} anchor="middle">big toe</Label>
    </>
  );
}

export function FootSide({ outer }: { outer: boolean }) {
  const mx = outer ? 96 : 100;
  const my = outer ? 190 : 170;
  return (
    <>
      <path
        d={
          outer
            ? 'M45 0 L135 0 C135 60 150 105 175 135 C215 160 260 172 290 190 C320 200 345 215 348 240 C349 252 340 257 325 257 L70 257 C40 257 25 240 28 215 C30 170 38 80 45 0 Z'
            : 'M45 0 L135 0 C135 60 150 105 175 135 C215 165 260 180 300 195 C335 200 370 210 378 232 C380 248 365 257 345 257 L70 257 C40 257 25 240 28 215 C30 170 38 80 45 0 Z'
        }
        fill={SKIN}
        {...stroke}
      />
      {/* arch: sole line lifts between heel and ball */}
      <path d="M118 257 C150 238 215 236 250 257" fill={SKIN} stroke="none" />
      <path d="M118 257 C150 240 215 238 250 257" {...faint} />
      {/* ankle bone */}
      <circle cx={mx} cy={my} r={outer ? 20 : 22} fill={SHADE} stroke={FAINT} strokeWidth={1.6} />
      <Label x={mx + 28} y={my - 26}>ankle bone</Label>
      {/* Achilles tendon */}
      <path d="M52 0 C48 60 46 120 48 190" {...faint} />
      <Label x={14} y={60}>Achilles</Label>
      <Label x={14} y={72}>tendon</Label>
      {outer ? (
        <>
          <ellipse cx={330} cy={228} rx={12} ry={5} transform="rotate(25 330 228)" fill={NAIL} stroke={FAINT} strokeWidth={1.4} />
          <circle cx={236} cy={214} r={7} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
          <Label x={236} y={200} anchor="middle">bump</Label>
          <path d="M318 206 C322 222 322 238 318 252" {...faint} />
          <Label x={300} y={180}>little toe</Label>
        </>
      ) : (
        <>
          <ellipse cx={354} cy={218} rx={15} ry={6} transform="rotate(18 354 218)" fill={NAIL} stroke={FAINT} strokeWidth={1.4} />
          <circle cx={185} cy={196} r={7} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
          <Label x={185} y={184} anchor="middle">bump</Label>
          <Label x={316} y={180}>big toe</Label>
        </>
      )}
      <Label x={200} y={282} anchor="middle">sole</Label>
    </>
  );
}

// ---------------------------------------------------------------- HANDS

export function HandPalm() {
  return (
    <>
      <g transform="rotate(24 226 350)">
        <path d="M184 360 L184 200 A22 22 0 0 1 228 200 L228 360 Z" fill={SKIN} {...stroke} />
        <path d="M188 262 Q206 270 224 262" {...faint} />
      </g>
      <path d="M72 270 L232 270 C250 300 252 345 232 380 L214 540 L100 540 L92 385 C70 340 64 300 72 270 Z" fill={SKIN} />
      <Digit x={70} y={150} w={34} h={150} nail={false} />
      <Digit x={108} y={95} w={38} h={205} nail={false} />
      <Digit x={150} y={72} w={38} h={228} nail={false} />
      <Digit x={192} y={100} w={38} h={200} nail={false} />
      <path d="M72 270 C64 300 70 340 92 385 L100 540" fill="none" {...stroke} />
      <path d="M244 372 C238 392 222 412 214 540" fill="none" {...stroke} />
      {/* palm creases */}
      <path d="M80 302 Q150 284 226 312" {...faint} />
      <path d="M92 336 Q160 322 214 352" {...faint} />
      <path d="M206 322 C176 342 172 384 192 406" {...faint} />
      <path d="M102 401 Q152 412 205 401" {...faint} />
      <Label x={168} y={64} anchor="middle">middle finger</Label>
      <Label x={284} y={196} anchor="end">thumb</Label>
      <Label x={262} y={470} anchor="end">forearm</Label>
    </>
  );
}

export function HandBack() {
  return (
    <>
      <g transform="rotate(-24 114 350)">
        <path d="M92 360 L92 200 A22 22 0 0 1 136 200 L136 360 Z" fill={SKIN} {...stroke} />
        <rect x={98} y={206} width={32} height={34} rx={10} fill={NAIL} stroke={FAINT} strokeWidth={1.4} />
      </g>
      <path d="M108 270 L266 270 C270 310 256 350 232 392 L226 540 L128 540 L118 392 C100 360 92 320 96 280 Z" fill={SKIN} />
      <Digit x={112} y={100} w={36} h={190} />
      <Digit x={152} y={78} w={38} h={212} />
      <Digit x={194} y={98} w={36} h={192} />
      <Digit x={234} y={150} w={30} h={142} />
      <path d="M118 392 C104 372 98 352 102 332" fill="none" {...stroke} />
      <path d="M266 270 C270 310 256 350 232 392 L226 540" fill="none" {...stroke} />
      <path d="M118 392 L128 540" fill="none" {...stroke} />
      {/* knuckles and tendons */}
      {[[130, 288], [171, 284], [212, 288], [249, 300]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r={9} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      ))}
      <path d="M130 300 C140 340 150 380 160 440" {...faint} />
      <path d="M171 296 C172 340 172 380 174 440" {...faint} />
      <path d="M212 300 C204 340 194 380 186 440" {...faint} />
      <path d="M249 312 C230 350 208 390 196 440" {...faint} />
      <path d="M128 388 Q176 400 226 388" {...faint} />
      <Label x={270} y={470} anchor="end">forearm</Label>
      <Label x={171} y={66} anchor="middle">middle finger</Label>
      <Label x={14} y={176}>thumb</Label>
    </>
  );
}

// ---------------------------------------------------------------- ARM

export function ElbowFront() {
  return (
    <>
      <path d="M92 0 C88 60 88 120 90 170 C92 230 100 300 105 380 L195 380 C200 300 208 230 210 170 C212 120 212 60 208 0 Z" fill={SKIN} {...stroke} />
      <circle cx={86} cy={164} r={12} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <circle cx={214} cy={168} r={9} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <path d="M94 174 Q150 192 206 174" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      <path d="M146 96 L146 186 M154 96 L154 186" {...faint} />
      <Label x={150} y={84} anchor="middle">biceps tendon</Label>
      <Label x={150} y={214} anchor="middle">elbow crease</Label>
      <Label x={44} y={150}>inner</Label>
      <Label x={44} y={162}>bump</Label>
      <Label x={228} y={350}>thumb side →</Label>
      <Label x={14} y={350}>← pinky side</Label>
    </>
  );
}

export function ElbowBack() {
  return (
    <>
      <path d="M92 0 C88 60 88 120 90 170 C92 230 100 300 105 380 L195 380 C200 300 208 230 210 170 C212 120 212 60 208 0 Z" fill={SKIN} {...stroke} />
      <circle cx={92} cy={160} r={11} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <circle cx={208} cy={162} r={10} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <ellipse cx={150} cy={178} rx={21} ry={27} fill={SHADE} stroke={LINE} strokeWidth={1.8} />
      <path d="M150 90 L150 150" {...faint} />
      <Label x={150} y={226} anchor="middle">point of the elbow</Label>
      <Label x={44} y={150}>inner</Label>
      <Label x={44} y={162}>bump</Label>
    </>
  );
}

// ---------------------------------------------------------------- LEG

export function LegFront() {
  return (
    <>
      <path d="M72 0 C78 80 90 150 100 205 C96 250 108 330 114 420 C118 480 120 530 118 580 L184 580 C182 530 186 480 192 420 C200 340 204 250 200 205 C214 150 224 80 230 0 Z" fill={SKIN} {...stroke} />
      {/* kneecap */}
      <rect x={120} y={150} width={60} height={64} rx={26} fill={SHADE} stroke={FAINT} strokeWidth={1.6} />
      <Label x={150} y={186} anchor="middle">kneecap</Label>
      {/* shin ridge */}
      <path d="M148 250 C146 340 142 450 140 560" {...faint} strokeWidth={2.2} />
      <Label x={152} y={300}>shin ridge</Label>
      {/* head of the small bone */}
      <circle cx={196} cy={256} r={9} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <Label x={226} y={258}>head of the</Label>
      <Label x={226} y={270}>small bone</Label>
      {/* ankle bones */}
      <circle cx={116} cy={556} r={10} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <circle cx={186} cy={564} r={10} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <Label x={64} y={584} anchor="middle">inner ankle</Label>
      <Label x={236} y={590} anchor="middle">outer ankle</Label>
      <Label x={70} y={210} anchor="end">inner side</Label>
    </>
  );
}

export function KneeBack() {
  return (
    <>
      <path d="M85 0 C88 100 94 190 98 220 C96 300 106 380 112 420 L188 420 C194 380 204 300 202 220 C206 190 212 100 215 0 Z" fill={SKIN} {...stroke} />
      <path d="M96 204 Q150 218 204 204" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      <path d="M170 60 C172 120 178 170 184 202 M184 60 C186 120 190 170 192 202" {...faint} />
      <path d="M112 60 C112 120 112 170 112 202" {...faint} />
      <ellipse cx={124} cy={278} rx={26} ry={44} {...faint} />
      <ellipse cx={176} cy={278} rx={26} ry={44} {...faint} />
      <Label x={150} y={236} anchor="middle">back-of-knee crease</Label>
      <Label x={150} y={128} anchor="middle">hamstring tendons</Label>
      <Label x={214} y={300}>inner side →</Label>
    </>
  );
}

// ---------------------------------------------------------------- TORSO

export function TorsoFront() {
  const ribs = [0, 1, 2, 3, 4, 5].map((i) => 86 + i * 24);
  return (
    <>
      <path d="M118 0 L118 40 C90 55 40 62 24 100 C14 130 22 170 40 200 C56 230 70 280 80 330 C78 380 72 430 66 520 L234 520 C228 430 222 380 220 330 C230 280 244 230 260 200 C278 170 286 130 276 100 C260 62 210 55 182 40 L182 0 Z" fill={SKIN} {...stroke} />
      {/* collarbones */}
      <path d="M142 54 C110 56 82 66 56 88" {...faint} strokeWidth={2.2} />
      <path d="M158 54 C190 56 218 66 244 88" {...faint} strokeWidth={2.2} />
      {/* breastbone */}
      <rect x={141} y={58} width={18} height={192} rx={9} {...faint} />
      {/* ribs */}
      {ribs.map((y) => (
        <g key={y}>
          <path d={`M142 ${y} Q100 ${y + 4} 60 ${y + 42}`} {...faint} />
          <path d={`M158 ${y} Q200 ${y + 4} 240 ${y + 42}`} {...faint} />
        </g>
      ))}
      <path d="M150 252 Q92 262 70 322" {...faint} strokeWidth={2} />
      <path d="M150 252 Q208 262 230 322" {...faint} strokeWidth={2} />
      <circle cx={102} cy={172} r={7} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <circle cx={198} cy={172} r={7} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <ellipse cx={150} cy={340} rx={5} ry={7} fill={SHADE} stroke={LINE} strokeWidth={1.4} />
      <path d="M84 366 Q100 380 128 392" {...faint} />
      <path d="M216 366 Q200 380 172 392" {...faint} />
      <path d="M134 398 Q150 392 166 398" {...faint} strokeWidth={2} />
      <Label x={150} y={46} anchor="middle">notch</Label>
      <Label x={150} y={269} anchor="middle">breastbone tip</Label>
      <Label x={150} y={326} anchor="middle">navel</Label>
      <Label x={102} y={158} anchor="middle">nipple</Label>
      <Label x={150} y={418} anchor="middle">pubic bone</Label>
      <Label x={92} y={360}>hip bone</Label>
      <Label x={36} y={120}>collarbone ↗</Label>
    </>
  );
}

// ---------------------------------------------------------------- BACK

const SPINE_Y = [70, 87, 104, 121, 138, 155, 172, 189, 206, 223, 240, 257, 274, 295, 318, 341, 364, 387];

export function BackArt() {
  return (
    <>
      <path d="M110 0 L190 0 L190 24 Q150 34 110 24 Z" fill="#7a6252" opacity={0.85} />
      <path d="M126 24 L124 62 C90 74 40 82 26 118 C14 160 24 200 40 240 C60 290 84 330 90 360 C80 400 70 450 62 520 C66 560 90 600 150 604 C210 600 234 560 238 520 C230 450 220 400 210 360 C216 330 240 290 260 240 C276 200 286 160 274 118 C260 82 210 74 176 62 L174 24 Z" fill={SKIN} {...stroke} />
      {/* shoulder blades */}
      <path d="M108 122 L52 104 Q44 130 62 160 Q80 190 112 200 Q106 165 108 122 Z" {...faint} strokeWidth={2} />
      <path d="M192 122 L248 104 Q256 130 238 160 Q220 190 188 200 Q194 165 192 122 Z" {...faint} strokeWidth={2} />
      {/* lowest ribs */}
      <path d="M140 282 Q100 298 66 332" {...faint} />
      <path d="M160 282 Q200 298 234 332" {...faint} />
      {/* hip bones, dimples, cleft */}
      <path d="M94 366 Q122 352 146 378" {...faint} strokeWidth={2} />
      <path d="M206 366 Q178 352 154 378" {...faint} strokeWidth={2} />
      <circle cx={128} cy={420} r={4} fill={SHADE} stroke={FAINT} />
      <circle cx={172} cy={420} r={4} fill={SHADE} stroke={FAINT} />
      <circle cx={46} cy={470} r={9} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <circle cx={254} cy={470} r={9} fill={SHADE} stroke={FAINT} strokeWidth={1.4} />
      <path d="M150 440 L150 600" {...faint} />
      <path d="M62 520 Q110 500 150 520 Q190 500 238 520" {...faint} />
      {/* spine */}
      {SPINE_Y.map((y) => (
        <circle key={y} cx={150} cy={y} r={2.6} fill={SHADE} stroke={LINE} strokeWidth={1} />
      ))}
      <circle cx={150} cy={70} r={4.6} fill={SHADE} stroke={LINE} strokeWidth={1.4} />
      <Guide y={70} w={300}>C7 · neck bump</Guide>
      <Guide y={121} w={300}>T3 · blade top</Guide>
      <Guide y={196} w={300}>T7 · blade bottom</Guide>
      <Guide y={274} w={300}>T12 · last rib</Guide>
      <Guide y={364} w={300}>L4 · hip bone top</Guide>
      <Label x={150} y={438} anchor="middle">dimples</Label>
      <Label x={46} y={492} anchor="middle">hip joint</Label>
    </>
  );
}

// ---------------------------------------------------------------- HEAD

export function FaceFront() {
  return (
    <>
      <ellipse cx={52} cy={195} rx={12} ry={28} fill={SKIN} {...stroke} />
      <ellipse cx={248} cy={195} rx={12} ry={28} fill={SKIN} {...stroke} />
      <path d="M150 40 C85 40 55 100 55 170 C55 250 80 330 150 345 C220 330 245 250 245 170 C245 100 215 40 150 40 Z" fill={SKIN} {...stroke} />
      {/* brows, eyes */}
      <path d="M86 130 Q108 114 134 128" fill="none" stroke={LINE} strokeWidth={3.4} strokeLinecap="round" />
      <path d="M214 130 Q192 114 166 128" fill="none" stroke={LINE} strokeWidth={3.4} strokeLinecap="round" />
      <ellipse cx={110} cy={152} rx={20} ry={9} fill="#fff" stroke={LINE} strokeWidth={1.6} />
      <ellipse cx={190} cy={152} rx={20} ry={9} fill="#fff" stroke={LINE} strokeWidth={1.6} />
      <circle cx={110} cy={152} r={6} fill={LINE} />
      <circle cx={190} cy={152} r={6} fill={LINE} />
      {/* nose */}
      <path d="M142 156 C140 190 136 214 130 228 Q150 242 170 228 C164 214 160 190 158 156" {...faint} />
      <ellipse cx={128} cy={232} rx={9} ry={6} {...faint} />
      <ellipse cx={172} cy={232} rx={9} ry={6} {...faint} />
      {/* philtrum & mouth */}
      <path d="M144 244 L144 264 M156 244 L156 264" {...faint} />
      <path d="M116 274 Q150 290 184 274" fill="none" stroke={LINE} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M126 270 Q150 262 174 270" {...faint} />
      <Label x={150} y={30} anchor="middle">forehead</Label>
      <Label x={46} y={236} anchor="end">ear</Label>
      <Label x={150} y={366} anchor="middle">chin</Label>
    </>
  );
}

export function HeadSide() {
  return (
    <>
      <path d="M205 22 C125 18 88 78 92 130 C82 150 62 165 72 176 L90 182 C92 200 85 214 95 228 C100 252 120 278 160 282 C185 272 215 258 236 238 C270 192 292 118 252 62 C238 36 222 24 205 22 Z" fill={SKIN} {...stroke} />
      <ellipse cx={206} cy={160} rx={13} ry={28} fill={SKIN} stroke={LINE} strokeWidth={1.8} />
      <path d="M204 140 Q214 158 204 178" {...faint} />
      <path d="M92 118 Q108 108 124 116" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={110} cy={132} rx={12} ry={6} fill="#fff" stroke={LINE} strokeWidth={1.4} />
      <circle cx={108} cy={132} r={4} fill={LINE} />
      <path d="M92 214 Q108 222 124 214" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      <path d="M205 132 L205 30" stroke={LINE} strokeOpacity={0.55} strokeWidth={1.2} strokeDasharray="4 4" />
      <Label x={226} y={104}>line up from</Label>
      <Label x={226} y={116}>top of ear</Label>
      <Label x={188} y={208} anchor="end">earlobe</Label>
      <Label x={238} y={246}>angle of jaw</Label>
      <Label x={60} y={196} anchor="end">chin ↓</Label>
    </>
  );
}
