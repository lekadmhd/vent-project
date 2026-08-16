'use client';

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface BuildingArtProps {
  seed: string;
  className?: string;
}

interface Tower {
  x: number;
  w: number;
  floors: number;
  cols: number;
  offset: number;
}

export function BuildingArt({ seed, className }: BuildingArtProps) {
  const s = hashSeed(seed);
  const hueA = s % 360;
  const hueB = (hueA + 65) % 360;
  const c1 = `hsl(${hueA}, 90%, 60%)`;
  const c2 = `hsl(${hueB}, 90%, 55%)`;

  const towers: Tower[] = [
    { x: 34, w: 128, floors: 8, cols: 6, offset: 2 },
    { x: 202, w: 150, floors: 10, cols: 7, offset: 1 },
    { x: 32, w: 96, floors: 5, cols: 4, offset: 3 },
  ];

  const windows: React.ReactNode[] = [];
  let i = 0;
  towers.forEach((t, ti) => {
    const winW = t.w / (t.cols * 2 + 1);
    const winH = 9;
    const padX = winW;
    const topBase = 18;
    for (let f = 0; f < t.floors; f++) {
      for (let cIdx = 0; cIdx < t.cols; cIdx++) {
        const x = t.x + padX + cIdx * winW * 2;
        const y = topBase + f * 17;
        const lit = ((s + i * 7919 + ti * 104729) % 100) > 42;
        const color = lit ? (i % 3 === 0 ? c2 : c1) : 'rgba(255,255,255,0.08)';
        const glow = lit ? `0 0 6px ${color}` : 'none';
        windows.push(
          <rect key={i} x={x} y={y} width={winW} height={winH} rx={1.5} fill={color} style={{ filter: glow, opacity: lit ? 0.95 : 1 }} />,
        );
        i++;
      }
    }
  });

  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`sky-${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} stopOpacity="0.35" />
          <stop offset="55%" stopColor="rgba(10,14,23,0.85)" />
          <stop offset="100%" stopColor="rgba(10,14,23,1)" />
        </linearGradient>
        <radialGradient id={`moon-${s}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`tw-${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} stopOpacity="0.85" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      <rect width="400" height="220" fill={`url(#sky-${s})`} />
      <circle cx="308" cy="34" r="46" fill={`url(#moon-${s})`} />
      <circle cx="308" cy="34" r="16" fill={c1} opacity="0.5" style={{ filter: `blur(1px)` }} />

      {towers.map((t, ti) => (
        <g key={ti}>
          <rect x={t.x} y={14} width={t.w} height={206} fill={`url(#tw-${s})`} rx="3" />
          <rect x={t.x + 3} y={14} width={t.w - 6} height={206} fill="rgba(10,14,23,0.55)" rx="2" />
          {windows}
          <rect x={t.x + t.w * 0.3} y={6} width={t.w * 0.4} height={12} fill={c1} opacity="0.7" rx="2" />
        </g>
      ))}
    </svg>
  );
}
