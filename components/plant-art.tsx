import type { ReactNode } from "react";
import { getCatalogPlant, type ArtKind, type PlantArt as Art } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// One illustration style for every plant: same terracotta pot, flat shapes, two tones of the
// plant's leaf colour, optional accent (flowers/fruits). Pure SVG, no image files to optimise.

const POT = "#c96f3b";
const POT_RIM = "#b25f30";
const SOIL = "#6b4a33";
const TRUNK = "#7a5232";
const GAP = "var(--muted)"; // monstera slits show the background

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 + amount))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, "0")).join("")}`;
}

// Leaf shapes pointing up, origin at the base.
const TEAR = "M0 0 C9 -7 11 -26 0 -36 C-11 -26 -9 -7 0 0Z";
const HEART = "M0 0 C17 -5 23 -29 0 -40 C-23 -29 -17 -5 0 0Z";
const BLADE = "M0 0 C5 -15 4 -40 0 -54 C-4 -40 -5 -15 0 0Z";
const FLESHY = "M0 0 C5 -6 5 -15 0 -21 C-5 -15 -5 -6 0 0Z";
const SMALL = "M0 0 C3 -3 4 -9 0 -12 C-4 -9 -3 -3 0 0Z";

const at = (x: number, y: number, rotate = 0, scale = 1) => `translate(${x} ${y}) rotate(${rotate}) scale(${scale})`;

function Flower({ x, y, r = 4.5, color }: { x: number; y: number; r?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.75} cy={Math.sin((a * Math.PI) / 180) * r * 0.75} r={r * 0.6} fill={color} />
      ))}
      <circle r={r * 0.4} fill="#f2c12e" />
    </g>
  );
}

function Bush({ leaf, cx = 50, cy = 50, spread = 1 }: { leaf: string; cx?: number; cy?: number; spread?: number }) {
  const dark = shade(leaf, -0.25);
  const spots: [number, number, number][] = [
    [-14, 6, 11], [14, 6, 11], [0, -6, 13], [-9, -12, 9], [10, -13, 9], [0, 10, 10],
  ];
  return (
    <g>
      {spots.map(([dx, dy, r], i) => (
        <circle key={i} cx={cx + dx * spread} cy={cy + dy * spread} r={r * spread} fill={i % 2 ? dark : leaf} />
      ))}
    </g>
  );
}

const PLANTS: Record<ArtKind, (leaf: string, accent?: string) => ReactNode> = {
  broadleaf: (leaf) => {
    const dark = shade(leaf, -0.3);
    return [-38, -12, 14, 40].map((r, i) => (
      <g key={r} transform={at(50, 68, r, i === 1 || i === 2 ? 1.1 : 0.95)}>
        <path d={TEAR} fill={i % 2 ? dark : leaf} />
        <path d="M0 -2 L0 -32" stroke={shade(leaf, 0.35)} strokeWidth="1" />
      </g>
    ));
  },
  monstera: (leaf) => {
    const dark = shade(leaf, -0.25);
    return [-34, 4, 36].map((r, i) => (
      <g key={r} transform={at(50, 68, r, i === 1 ? 1.05 : 0.85)}>
        <path d={HEART} fill={i === 1 ? leaf : dark} />
        {[-30, -22, -14].flatMap((y) => [
          <path key={`l${y}`} d={`M-4 ${y} L-16 ${y + 4}`} stroke={GAP} strokeWidth="2.2" strokeLinecap="round" />,
          <path key={`r${y}`} d={`M4 ${y} L16 ${y + 4}`} stroke={GAP} strokeWidth="2.2" strokeLinecap="round" />,
        ])}
        <path d="M0 -2 L0 -36" stroke={shade(leaf, 0.3)} strokeWidth="1" />
      </g>
    ));
  },
  roundleaf: (leaf, accent) => {
    const pts: [number, number][] = [[34, 46], [50, 32], [66, 44], [42, 58], [58, 56], [50, 46]];
    return (
      <>
        {pts.map(([x, y]) => <path key={`s${x}${y}`} d={`M50 68 Q${(x + 50) / 2} ${y + 14} ${x} ${y}`} stroke={shade(leaf, -0.3)} strokeWidth="1.2" fill="none" />)}
        {pts.map(([x, y], i) => <circle key={`${x}${y}`} cx={x} cy={y} r={i === 5 ? 6 : 7.5} fill={i % 2 ? shade(leaf, -0.2) : leaf} />)}
        {accent && <><Flower x={38} y={36} r={3} color={accent} /><Flower x={62} y={32} r={3} color={accent} /></>}
      </>
    );
  },
  trailing: (leaf) => (
    <g transform={at(50, 66)}>
      {[-48, -24, 0, 24, 48].map((r, i) => <path key={r} d={TEAR} transform={`rotate(${r}) scale(${i === 2 ? 0.8 : 0.68})`} fill={i % 2 ? shade(leaf, -0.25) : leaf} />)}
    </g>
  ),
  upright: (leaf) => {
    const dark = shade(leaf, -0.3);
    const light = shade(leaf, 0.35);
    return [[-16, 0.8], [-7, 1], [0, 1.08], [8, 0.95], [17, 0.78]].map(([r, s], i) => (
      <g key={r} transform={at(50, 70, r, s)}>
        <path d={BLADE} fill={i % 2 ? dark : leaf} />
        {[-12, -22, -32, -42].map((y) => <path key={y} d={`M-2.5 ${y} L2.5 ${y - 2}`} stroke={light} strokeWidth="1" />)}
      </g>
    ));
  },
  rosette: (leaf, accent) => {
    const dark = shade(leaf, -0.25);
    return (
      <>
        {accent && <><path d="M50 60 Q54 40 58 28" stroke={dark} strokeWidth="1.5" fill="none" /><Flower x={58} y={27} r={3.5} color={accent} /></>}
        {[-75, -50, -25, 0, 25, 50, 75].map((r) => <path key={r} d={FLESHY} transform={at(50, 68, r, 1.05)} fill={dark} />)}
        {[-55, -20, 20, 55].map((r) => <path key={`i${r}`} d={FLESHY} transform={at(50, 68, r, 0.75)} fill={leaf} />)}
        <path d={FLESHY} transform={at(50, 68, 0, 0.6)} fill={shade(leaf, 0.2)} />
      </>
    );
  },
  cactus: (leaf, accent) => {
    const dark = shade(leaf, -0.3);
    return (
      <>
        <path d="M43 52 H34 Q30 52 30 48 V36 Q30 32 34 32 Q38 32 38 36 V44 H43Z" fill={dark} />
        <path d="M57 46 H64 Q68 46 68 42 V30 Q68 26 64 26 Q60 26 60 30 V38 H57Z" fill={dark} />
        <rect x="41" y="20" width="18" height="52" rx="9" fill={leaf} />
        {[46, 50, 54].map((x) => <path key={x} d={`M${x} 26 V68`} stroke={dark} strokeWidth="1" />)}
        {[30, 40, 50, 60].flatMap((y) => [44, 56].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="0.8" fill="#f4f1e8" />))}
        {accent && <Flower x={50} y={20} r={4} color={accent} />}
      </>
    );
  },
  orchid: (leaf, accent = "#e88aa8") => (
    <>
      <path d="M52 64 Q50 30 66 22 Q74 20 78 28" stroke={shade(leaf, -0.35)} strokeWidth="1.6" fill="none" />
      <Flower x={56} y={34} r={6} color={accent} />
      <Flower x={66} y={23} r={6} color={accent} />
      <Flower x={77} y={31} r={5} color={accent} />
      <ellipse cx="38" cy="64" rx="15" ry="5" transform="rotate(-12 38 64)" fill={leaf} />
      <ellipse cx="62" cy="65" rx="15" ry="5" transform="rotate(14 62 65)" fill={shade(leaf, -0.25)} />
    </>
  ),
  fern: (leaf) => {
    const fronds: [number, number, number, number][] = [
      [18, 58, 26, 40], [26, 44, 38, 30], [42, 30, 50, 22], [58, 30, 62, 24], [74, 44, 64, 30], [82, 58, 74, 40], [50, 36, 50, 28],
    ];
    return fronds.map(([ex, ey, cx, cy], i) => (
      <g key={i}>
        <path d={`M50 68 Q${cx} ${cy} ${ex} ${ey}`} stroke={shade(leaf, -0.3)} strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d={`M50 68 Q${cx} ${cy} ${ex} ${ey}`} stroke={leaf} strokeWidth="9" strokeDasharray="2.2 2" fill="none" />
      </g>
    ));
  },
  palm: (leaf, accent) => {
    const dark = shade(leaf, -0.3);
    const tops: [number, number][] = [[42, 34], [56, 28]];
    return (
      <>
        {tops.map(([x, y]) => <path key={x} d={`M50 68 Q${x} 50 ${x} ${y}`} stroke={accent ?? TRUNK} strokeWidth="2.5" fill="none" />)}
        {tops.flatMap(([x, y], t) =>
          [-70, -40, -12, 15, 42, 70].map((a, i) => {
            const rad = ((a - 90) * Math.PI) / 180;
            const ex = x + Math.cos(rad) * 22;
            const ey = y + Math.sin(rad) * 16 + 10;
            return <path key={`${t}${a}`} d={`M${x} ${y} Q${(x + ex) / 2} ${y - 8} ${ex} ${ey}`} stroke={i % 2 ? dark : leaf} strokeWidth="3.2" strokeLinecap="round" fill="none" />;
          }),
        )}
      </>
    );
  },
  tree: (leaf, accent) => (
    <>
      <path d="M48 68 V44 M48 52 L40 44 M48 50 L56 42" stroke={TRUNK} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="38" cy="38" r="13" fill={shade(leaf, -0.25)} />
      <circle cx="60" cy="37" r="13" fill={shade(leaf, -0.25)} />
      <circle cx="49" cy="27" r="15" fill={leaf} />
      <circle cx="44" cy="42" r="10" fill={leaf} />
      {accent && [[40, 30], [56, 24], [62, 40], [46, 44], [34, 40]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill={accent} />)}
    </>
  ),
  herb: (leaf, accent) => {
    const dark = shade(leaf, -0.25);
    const leaves: [number, number, number][] = [
      [36, 58, -50], [44, 50, -25], [50, 44, 0], [56, 50, 25], [64, 58, 50], [40, 40, -35], [60, 40, 35], [50, 34, 5], [46, 60, -10], [56, 60, 15],
    ];
    return (
      <>
        {[[40, 40], [50, 32], [60, 40]].map(([x, y]) => <path key={x} d={`M50 68 Q${x} 54 ${x} ${y}`} stroke={dark} strokeWidth="1.3" fill="none" />)}
        {leaves.map(([x, y, r], i) => <path key={i} d={SMALL} transform={at(x, y, r, 1.55)} fill={i % 2 ? dark : leaf} />)}
        {accent && [[40, 33], [50, 26], [60, 33]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.2" fill={accent} />)}
      </>
    );
  },
  flowering: (leaf, accent = "#e88aa8") => (
    <>
      <Bush leaf={leaf} cy={52} />
      {[[38, 44], [50, 34], [62, 44], [44, 56], [57, 56], [50, 47]].map(([x, y]) => <Flower key={`${x}${y}`} x={x} y={y} r={5} color={accent} />)}
    </>
  ),
  // Dense lavender-like tuft: many fanning stems, each topped by a stacked flower spike.
  spike: (leaf, accent = "#9b7fd1") => {
    const tips = Array.from({ length: 13 }, (_, i) => {
      const t = i / 12; // 0..1 across the fan
      const angle = (-70 + t * 140) * (Math.PI / 180);
      const len = 40 - Math.abs(t - 0.5) * 18;
      return [50 + Math.sin(angle) * len, 64 - Math.cos(angle) * len, angle] as const;
    });
    const deep = shade(accent, -0.2);
    return (
      <>
        {tips.map(([x, y], i) => (
          <path key={`s${i}`} d={`M50 64 Q${(x + 50) / 2} ${(y + 64) / 2 + 4} ${x} ${y + 6}`} stroke={shade(leaf, -0.15)} strokeWidth="1" fill="none" />
        ))}
        {tips.map(([x, y, angle], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI})`}>
            {[0, 2.6, 5.2, 7.8, 10.4].map((d, j) => (
              <ellipse key={d} cx={j % 2 ? 0.7 : -0.7} cy={d - 6} rx={2.3 - j * 0.15} ry="1.9" fill={j % 2 ? deep : accent} />
            ))}
          </g>
        ))}
        {[-70, -48, -26, -8, 8, 26, 48, 70].map((r, i) => (
          <path key={`l${r}`} d={SMALL} transform={at(50, 68, r, 1.9)} fill={i % 2 ? shade(leaf, -0.2) : leaf} />
        ))}
      </>
    );
  },
  fruiting: (leaf, accent = "#d94a4a") => (
    <>
      <Bush leaf={leaf} cy={48} spread={1.05} />
      {[[38, 52], [56, 40], [62, 56], [46, 40], [50, 58]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r="4.6" fill={accent} />
          <circle cx={x - 1.4} cy={y - 1.4} r="1.2" fill="#ffffff" opacity="0.5" />
        </g>
      ))}
    </>
  ),
  grass: (leaf, accent) => {
    const tips: [number, number][] = [[22, 40], [30, 26], [40, 18], [48, 14], [56, 16], [64, 22], [72, 30], [80, 44], [44, 26], [58, 28]];
    return (
      <>
        {tips.map(([x, y], i) => (
          <path key={i} d={`M50 68 Q${(x + 50) / 2 + (x < 50 ? 6 : -6)} ${y + 14} ${x} ${y}`} stroke={i % 2 ? shade(leaf, -0.25) : leaf} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        ))}
        {accent && [[44, 20], [58, 22]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4" fill={accent} />)}
      </>
    );
  },
  bulb: (leaf, accent = "#d94a4a") => (
    <>
      <path d="M50 68 V30" stroke={shade(leaf, -0.25)} strokeWidth="2" />
      <path d={BLADE} transform={at(48, 70, -18, 0.75)} fill={leaf} />
      <path d={BLADE} transform={at(52, 70, 20, 0.7)} fill={shade(leaf, -0.25)} />
      <path d="M40 22 Q40 34 50 36 Q60 34 60 22 L56 26 L50 18 L44 26Z" fill={accent} />
      <path d="M50 18 L44 26 Q46 32 50 34 Q54 32 56 26Z" fill={shade(accent, -0.15)} />
    </>
  ),
};

const VINES = (leaf: string) => {
  const dark = shade(leaf, -0.25);
  const vines: [string, [number, number, number][]][] = [
    ["M36 70 Q22 78 21 94", [[30, 74, 50], [24, 81, 70], [21, 88, 30], [21, 94, 60]]],
    ["M50 74 Q57 84 54 95", [[55, 81, -40], [56, 88, 20], [54, 94, -30]]],
    ["M64 70 Q80 77 81 93", [[71, 74, -50], [77, 80, -70], [80, 87, -30], [81, 93, -60]]],
  ];
  return vines.map(([d, leaves], i) => (
    <g key={i}>
      <path d={d} stroke={dark} strokeWidth="1.8" fill="none" />
      {leaves.map(([x, y, r], j) => <path key={j} d={TEAR} transform={at(x, y, r + 180, 0.4)} fill={j % 2 ? dark : leaf} />)}
    </g>
  ));
};

// Watercolour treatment: wobbly pigment edges (displacement), paper grain, translucent washes.
function Defs() {
  return (
    <defs>
      <filter id="wc" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="w" />
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.15" result="ga" />
        <feComposite in="w" in2="ga" operator="in" result="wg" />
        <feGaussianBlur in="wg" stdDeviation="0.4" />
      </filter>
      <filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="1.2" />
      </filter>
    </defs>
  );
}

function ProvencePot() {
  return (
    <g filter="url(#wc)">
      <ellipse cx="50" cy="69" rx="20" ry="2.5" fill={SOIL} opacity="0.85" />
      <path d="M31 76 H69 L65 94 Q65 96 63 96 H37 Q35 96 35 94Z" fill={POT} opacity="0.9" />
      <path d="M36 80 Q44 78 48 84 Q52 92 44 95 H38 Q36 95 36 93Z" fill="#efe3cc" opacity="0.5" />
      <path d="M58 79 Q64 80 66 82 L64 90 Q58 88 57 84Z" fill="#efe3cc" opacity="0.4" />
      <path d="M33 77 H67" stroke="#8c4a26" strokeWidth="1.2" opacity="0.5" />
      <rect x="28" y="68" width="44" height="8" rx="2" fill={POT_RIM} opacity="0.9" />
      <path d="M30 70 Q40 68 50 71 Q58 73 70 70" stroke="#efe3cc" strokeWidth="2" fill="none" opacity="0.6" />
    </g>
  );
}

export function PlantArt({ art, label, className }: { art: Art; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label} className={cn("shrink-0", className)}>
      <Defs />
      <circle cx="50" cy="54" r="40" className="fill-muted" opacity="0.8" filter="url(#wash)" />
      <g filter="url(#wc)" opacity="0.88" style={{ mixBlendMode: "multiply" }}>
        {PLANTS[art.kind](art.leaf, art.accent)}
      </g>
      <ProvencePot />
      {art.kind === "trailing" && <g filter="url(#wc)" opacity="0.88">{VINES(art.leaf)}</g>}
    </svg>
  );
}

/** Generic art for species that are not in the catalog, from their watering profile. */
export function genericArt(baseIntervalDays: number): Art {
  if (baseIntervalDays >= 18) return { kind: "cactus", leaf: "#3f9142" };
  if (baseIntervalDays >= 12) return { kind: "rosette", leaf: "#7d9d8c" };
  if (baseIntervalDays <= 3) return { kind: "herb", leaf: "#5aa469" };
  return { kind: "broadleaf", leaf: "#2f7d32" };
}

/** Illustration for a stored species: its catalog drawing, or a generic one from its profile. */
export function artFor(species: { slug: string | null; baseIntervalDays: number }): Art {
  return (species.slug && getCatalogPlant(species.slug)?.art) || genericArt(species.baseIntervalDays);
}
