import type { ReactNode } from 'react';

// New atlas drawings. Every shape is drawn around the landmark coordinates in ./geometry.ts,
// so a placed dot always sits on the structure it is measured from.

const SKIN = '#F3D9C4';
const SHADE = '#E6C0A5';
const LINE = '#B58467';
const FAINT = '#D2A88E';
const LABEL = '#8A6650';

const stroke = { stroke: LINE, strokeWidth: 2, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;
const faint = { stroke: FAINT, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' } as const;

function Label({ x, y, children, anchor = 'start' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fontSize={11} fill={LABEL} textAnchor={anchor} fontFamily="Manrope, sans-serif" fontWeight={600}>
      {children}
    </text>
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
      <Label x={214} y={146}>ear</Label>
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
