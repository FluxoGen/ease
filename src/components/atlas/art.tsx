import type { ReactNode } from 'react';

// New atlas drawings. Every shape is drawn around the landmark coordinates in ./geometry.ts,
// so a placed dot always sits on the structure it is measured from.

const SKIN = '#F3D9C4';
const SHADE = '#E6C0A5';
const LINE = '#B58467';
const FAINT = '#D2A88E';
const LABEL = '#8A6650';
const NAIL = '#FAEDE3';
const HAIR = '#8f7563';

const stroke = { stroke: LINE, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const faint = { stroke: FAINT, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' } as const;

function Label({ x, y, children, anchor = 'start' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fontSize={11} fill={LABEL} textAnchor={anchor} fontFamily="Manrope, sans-serif" fontWeight={600}>
      {children}
    </text>
  );
}


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


/** Dashed level guide with a label at the left edge. */
function Guide({ y, w, children }: { y: number; w: number; children: ReactNode }) {
  return (
    <g>
      <line x1={4} x2={w - 4} y1={y} y2={y} stroke={LINE} strokeOpacity={0.45} strokeWidth={1} strokeDasharray="4 4" />
      <text x={48} y={y - 3} fontSize={10.5} fill={LABEL} fontFamily="Manrope, sans-serif" fontWeight={700}>{children}</text>
    </g>
  );
}


const Bump = ({ x, y, r = 9 }: { x: number; y: number; r?: number }) => (
  <circle cx={x} cy={y} r={r} fill={SHADE} stroke={FAINT} strokeWidth={1.5} />
);

/** Closed outline from a left edge (top→bottom) and a right edge (top→bottom), smoothed. */
function outline(left: Array<[number, number]>, right: Array<[number, number]>) {
  const pts = [...left, ...[...right].reverse()];
  return `M${pts.map((p) => p.join(' ')).join(' L')} Z`;
}

// ------------------------------------------------------------------ arm

export function ArmInner() {
  const L: Array<[number, number]> = [[100, 0], [96, 150], [90, 310], [96, 480], [110, 670], [104, 720], [108, 780]];
  const R: Array<[number, number]> = [[200, 0], [210, 150], [214, 312], [202, 480], [190, 670], [196, 720], [196, 780]];
  return (
    <>
      <path d={outline(L, R)} fill={SKIN} {...stroke} />
      <path d="M200 0 Q192 18 184 22" {...faint} />
      <path d="M94 310 Q150 330 212 312" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      <Bump x={208} y={312} r={10} />
      <path d="M146 200 L148 300 M154 200 L152 300" {...faint} />
      <path d="M150 560 L150 668 M182 560 L182 668" {...faint} />
      <path d="M110 670 Q150 680 190 670" fill="none" stroke={LINE} strokeWidth={1.8} />
      <path d="M108 700 Q120 740 150 750" {...faint} />
      <Label x={150} y={344} anchor="middle">elbow crease</Label>
      <Label x={150} y={700} anchor="middle">wrist crease</Label>
      <Label x={86} y={240} anchor="end">thumb</Label>
      <Label x={86} y={253} anchor="end">side</Label>
      <Label x={222} y={420}>little-finger</Label>
      <Label x={222} y={433}>side</Label>
      <Label x={196} y={14} anchor="end">armpit</Label>
    </>
  );
}

export function ArmOuter() {
  const L: Array<[number, number]> = [[110, 20], [98, 120], [92, 300], [98, 480], [112, 670], [108, 780]];
  const R: Array<[number, number]> = [[200, 40], [212, 160], [214, 318], [202, 480], [190, 670], [194, 780]];
  return (
    <>
      <path d={outline(L, R)} fill={SKIN} {...stroke} />
      <path d="M110 20 Q140 6 172 30 Q196 40 200 40" fill={SKIN} {...stroke} />
      <Bump x={116} y={34} r={10} />
      <Bump x={172} y={44} r={7} />
      <path d="M104 40 Q96 100 114 136" {...faint} />
      <path d="M196 60 Q210 110 180 140" {...faint} />
      <Bump x={106} y={312} r={9} />
      <ellipse cx={160} cy={318} rx={20} ry={26} fill={SHADE} stroke={LINE} strokeWidth={1.8} />
      <path d="M112 670 Q150 680 190 670" fill="none" stroke={LINE} strokeWidth={1.8} />
      <Label x={160} y={362} anchor="middle">point of the elbow</Label>
      <Label x={150} y={700} anchor="middle">wrist crease</Label>
      <Label x={124} y={20}>shoulder tip</Label>
      <Label x={86} y={460} anchor="end">thumb</Label>
      <Label x={86} y={473} anchor="end">side</Label>
    </>
  );
}

// ------------------------------------------------------------------ leg

export function LegFront() {
  const L: Array<[number, number]> = [[66, 20], [70, 200], [88, 502], [96, 620], [104, 800], [118, 960], [112, 1000]];
  const R: Array<[number, number]> = [[250, 50], [240, 200], [212, 502], [208, 620], [200, 800], [186, 960], [196, 1000]];
  return (
    <>
      <path d={outline(L, R)} fill={SKIN} {...stroke} />
      <Bump x={92} y={40} r={8} />
      <rect x={122} y={498} width={56} height={66} rx={26} fill={SHADE} stroke={FAINT} strokeWidth={1.6} />
      <path d="M152 620 C150 760 150 880 150 960" {...faint} strokeWidth={2.2} />
      <Bump x={150} y={620} r={7} />
      <Bump x={112} y={976} />
      <Bump x={190} y={966} />
      <path d="M118 988 Q150 996 186 988" fill="none" stroke={LINE} strokeWidth={1.6} />
      <Label x={150} y={536} anchor="middle">kneecap</Label>
      <Label x={158} y={780}>shin edge</Label>
      <Label x={60} y={260} anchor="end">outer</Label>
      <Label x={246} y={300}>inner</Label>
      <Label x={100} y={34}>hip bone</Label>
    </>
  );
}

export function LegInner() {
  const F: Array<[number, number]> = [[56, 30], [62, 300], [70, 470], [104, 560], [122, 760], [130, 950], [120, 1000]];
  const B: Array<[number, number]> = [[226, 60], [224, 300], [216, 546], [242, 700], [212, 880], [222, 980], [210, 1000]];
  return (
    <>
      <path d={outline(F, B)} fill={SKIN} {...stroke} />
      <path d="M60 440 Q74 470 70 500" {...faint} strokeWidth={2} />
      <path d="M118 562 C126 700 136 860 146 940" {...faint} strokeWidth={2} />
      <Bump x={118} y={562} r={8} />
      <path d="M180 546 L214 546" fill="none" stroke={LINE} strokeWidth={1.8} />
      <path d="M208 830 L212 960" {...faint} />
      <Bump x={150} y={962} r={13} />
      <Label x={46} y={300} anchor="end">front</Label>
      <Label x={236} y={300}>back</Label>
      <Label x={150} y={994} anchor="middle">inner ankle bone</Label>
      <Label x={176} y={538} anchor="end">knee crease</Label>
    </>
  );
}

export function LegOuter() {
  const F: Array<[number, number]> = [[50, 30], [60, 300], [72, 500], [70, 760], [110, 960], [100, 1000]];
  const B: Array<[number, number]> = [[236, 40], [234, 300], [228, 546], [246, 700], [222, 890], [228, 990], [214, 1000]];
  return (
    <>
      <path d={outline(F, B)} fill={SKIN} {...stroke} />
      <Bump x={62} y={40} r={7} />
      <Bump x={168} y={92} r={12} />
      <path d="M150 130 L150 540" {...faint} strokeDasharray="5 5" />
      <path d="M200 546 L228 546" fill="none" stroke={LINE} strokeWidth={1.8} />
      <Bump x={192} y={590} r={9} />
      <Bump x={150} y={972} r={13} />
      <Label x={176} y={84}>hip joint</Label>
      <Label x={206} y={606}>head of the</Label>
      <Label x={206} y={619}>small bone</Label>
      <Label x={46} y={300} anchor="end">front</Label>
      <Label x={244} y={300}>back</Label>
      <Label x={150} y={1004} anchor="middle">outer ankle bone</Label>
    </>
  );
}

export function LegBack() {
  const L: Array<[number, number]> = [[64, 20], [72, 300], [94, 520], [84, 650], [102, 800], [122, 950], [118, 1000]];
  const R: Array<[number, number]> = [[236, 20], [228, 300], [206, 520], [216, 650], [198, 800], [178, 950], [182, 1000]];
  return (
    <>
      <path d={outline(L, R)} fill={SKIN} {...stroke} />
      <path d="M70 60 Q150 76 232 60" fill="none" stroke={LINE} strokeWidth={1.8} />
      <path d="M108 380 L108 516 M196 380 L196 516" {...faint} />
      <path d="M94 520 Q150 532 206 520" fill="none" stroke={LINE} strokeWidth={2} />
      <path d="M96 640 Q120 760 150 762 Q180 760 204 640" {...faint} />
      <path d="M142 800 L146 960 M158 800 L154 960" {...faint} />
      <Label x={150} y={50} anchor="middle">buttock crease</Label>
      <Label x={150} y={552} anchor="middle">back-of-knee crease</Label>
      <Label x={150} y={782} anchor="middle">bottom of the calf</Label>
      <Label x={60} y={300} anchor="end">inner</Label>
      <Label x={240} y={300}>outer</Label>
    </>
  );
}

// ------------------------------------------------------------------ trunk side

export function TorsoSide() {
  const F: Array<[number, number]> = [[118, 40], [72, 120], [62, 240], [80, 380], [92, 430], [64, 520], [86, 700]];
  const B: Array<[number, number]> = [[194, 40], [226, 120], [236, 260], [214, 400], [204, 440], [242, 560], [222, 700]];
  return (
    <>
      <path d="M118 0 L194 0 L194 40 L118 40 Z" fill={SKIN} {...stroke} />
      <path d={outline(F, B)} fill={SKIN} {...stroke} />
      <path d="M130 56 Q150 70 172 56" {...faint} />
      {[150, 190, 230, 270, 310].map((y) => (
        <path key={y} d={`M76 ${y} Q150 ${y + 26} 228 ${y - 10}`} {...faint} />
      ))}
      <path d="M90 340 Q100 360 112 370" {...faint} strokeWidth={2} />
      <Bump x={112} y={370} r={5} />
      <Bump x={178} y={398} r={5} />
      <path d="M72 476 Q150 440 230 470" {...faint} strokeWidth={2} />
      <Bump x={80} y={500} r={7} />
      <Bump x={150} y={640} r={12} />
      <Label x={150} y={30} anchor="middle">arm raised</Label>
      <Label x={50} y={240} anchor="end">front</Label>
      <Label x={246} y={240}>back</Label>
      <Label x={120} y={360}>11th rib tip</Label>
      <Label x={186} y={414}>12th rib tip</Label>
      <Label x={150} y={666} anchor="middle">hip joint</Label>
    </>
  );
}

// ------------------------------------------------------------------ head

export function HeadSide() {
  return (
    <>
      <path d="M100 300 L104 440 L252 440 L236 286 Z" fill={SKIN} {...stroke} />
      <path
        d="M182 38 C110 36 84 96 92 150 C80 170 58 196 66 206 L84 212 C86 228 78 244 86 256 C88 280 96 300 100 302 C140 300 180 290 202 272 C236 262 270 222 276 168 C282 98 246 40 182 38 Z"
        fill={SKIN}
        {...stroke}
      />
      <path d="M182 38 C110 36 84 96 92 150 C104 132 124 122 150 125 C168 128 178 140 186 156 L214 156 C226 170 244 190 246 214 C262 200 276 186 276 168 C282 98 246 40 182 38 Z" fill={HAIR} stroke={LINE} strokeWidth={1.6} />
      <ellipse cx={200} cy={190} rx={14} ry={34} fill={SKIN} stroke={LINE} strokeWidth={1.8} />
      <path d="M198 168 Q210 190 198 212" {...faint} />
      <path d="M92 152 Q110 144 128 152" fill="none" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={112} cy={170} rx={12} ry={6} fill="#fff" stroke={LINE} strokeWidth={1.4} />
      <circle cx={110} cy={170} r={4} fill={LINE} />
      <path d="M76 262 Q92 270 104 264" fill="none" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      <path d="M100 302 Q150 300 198 272" {...faint} />
      <path d="M210 250 L104 436" {...faint} strokeWidth={2} />
      <path d="M244 254 L142 438" {...faint} strokeWidth={2} />
      <Bump x={100} y={362} r={7} />
      <Bump x={230} y={236} r={8} />
      <path d="M118 444 Q160 432 210 446" fill="none" stroke={LINE} strokeWidth={2} />
      <Label x={226} y={150}>ear</Label>
      <Label x={120} y={118} anchor="middle">hairline</Label>
      <Label x={244} y={250}>bone behind ear</Label>
      <Label x={210} y={292}>angle of jaw</Label>
      <Label x={88} y={366} anchor="end">Adam's apple</Label>
      <Label x={252} y={400}>neck muscle</Label>
      <Label x={160} y={460} anchor="middle">collarbone</Label>
    </>
  );
}

export function HeadBack() {
  return (
    <>
      <path d="M40 360 Q60 300 110 280 L100 230 L200 230 L190 280 Q240 300 260 360 Z" fill={SKIN} {...stroke} />
      <ellipse cx={44} cy={150} rx={12} ry={28} fill={SKIN} {...stroke} />
      <ellipse cx={256} cy={150} rx={12} ry={28} fill={SKIN} {...stroke} />
      <ellipse cx={150} cy={130} rx={106} ry={112} fill="#8f7563" stroke={LINE} strokeWidth={2} />
      <path d="M54 170 Q66 214 100 222 Q150 212 200 222 Q234 214 246 170 Q240 230 200 238 L100 238 Q60 230 54 170 Z" fill={SKIN} stroke="none" />
      <path d="M60 178 Q150 196 240 178" fill="none" stroke={LINE} strokeWidth={1.6} strokeDasharray="5 4" />
      <Bump x={150} y={120} r={7} />
      <Bump x={66} y={176} r={7} />
      <Bump x={234} y={176} r={7} />
      <path d="M126 190 L120 330 M174 190 L180 330" {...faint} />
      <Bump x={150} y={270} r={6} />
      <path d="M100 210 Q150 220 200 210" fill="none" stroke={LINE} strokeWidth={1.4} strokeDasharray="3 4" />
      <Label x={150} y={100} anchor="middle">bump at back of skull</Label>
      <Label x={150} y={292} anchor="middle">neck bump (C7)</Label>
      <Label x={246} y={212} anchor="middle">hairline</Label>
    </>
  );
}

export function HeadTop() {
  return (
    <>
      <ellipse cx={30} cy={210} rx={14} ry={30} fill={SKIN} {...stroke} />
      <ellipse cx={270} cy={210} rx={14} ry={30} fill={SKIN} {...stroke} />
      <ellipse cx={150} cy={240} rx={124} ry={204} fill="#8f7563" stroke={LINE} strokeWidth={2} />
      <path d="M40 120 Q150 30 260 120 Q240 70 150 40 Q60 70 40 120 Z" fill={SKIN} stroke={LINE} strokeWidth={1.6} />
      <path d="M150 40 L150 440" stroke="#f3e3d6" strokeOpacity={0.6} strokeWidth={1.4} strokeDasharray="6 6" />
      <path d="M30 226 L270 226" stroke="#f3e3d6" strokeOpacity={0.5} strokeWidth={1.2} strokeDasharray="4 6" />
      <path d="M150 20 L140 36 L160 36 Z" fill={LINE} />
      <Label x={150} y={14} anchor="middle">face this way</Label>
      <Label x={150} y={464} anchor="middle">back of the head</Label>
      <Label x={36} y={262} anchor="middle">ear</Label>
    </>
  );
}

// ------------------------------------------------------------------ sole

export function FootSole() {
  return (
    <>
      <path d="M90 140 C70 220 84 330 96 420 C104 500 112 570 150 584 C190 570 200 500 206 420 C216 330 234 220 214 140 Z" fill={SKIN} {...stroke} />
      {[[96, 80, 26], [140, 66, 18], [174, 74, 16], [200, 90, 14], [222, 112, 12]].map(([x, y, r]) => (
        <ellipse key={x} cx={x} cy={y + 40} rx={r} ry={r * 1.3} fill={SKIN} {...stroke} />
      ))}
      <path d="M100 200 Q150 230 210 200" {...faint} />
      <path d="M110 470 Q150 500 196 470" {...faint} />
      <Label x={150} y={598} anchor="middle">heel</Label>
      <Label x={96} y={36} anchor="middle">big toe</Label>
    </>
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
      {/* hair above the front hairline (the landmark many forehead and scalp points are measured from) */}
      <path d="M150 40 C85 40 55 100 55 160 L62 160 C66 120 80 98 96 86 C112 76 130 70 150 70 C170 70 188 76 204 86 C220 98 234 120 238 160 L245 160 C245 100 215 40 150 40 Z" fill={HAIR} stroke={LINE} strokeWidth={1.6} />
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
      <Label x={150} y={30} anchor="middle">hairline</Label>
      <Label x={46} y={236} anchor="end">ear</Label>
      <Label x={150} y={366} anchor="middle">chin</Label>
    </>
  );
}
