'use client';

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface BuildingArtProps {
  seed: string;
  className?: string;
  variant?: 'card' | 'skyline';
}

interface Tower {
  x: number;
  w: number;
  floors: number;
  cols: number;
  offset: number;
}

function renderTowers(
  s: number,
  c1: string,
  c2: string,
  towers: Tower[],
  height: number,
  gap: number,
): React.ReactNode[] {
  const windows: React.ReactNode[] = [];
  let i = 0;
  const elements: React.ReactNode[] = [];
  towers.forEach((t, ti) => {
    const winW = t.w / (t.cols * 2 + 1);
    const winH = height > 400 ? 8 : 9;
    const padX = winW;
    const topBase = height > 400 ? 16 : 18;
    const winStep = height > 400 ? 14 : 17;
    const colWin: React.ReactNode[] = [];
    for (let f = 0; f < t.floors; f++) {
      for (let cIdx = 0; cIdx < t.cols; cIdx++) {
        const x = t.x + padX + cIdx * winW * 2;
        const y = topBase + f * winStep;
        const lit = ((s + i * 7919 + ti * 104729) % 100) > 42;
        const color = lit ? (i % 3 === 0 ? c2 : c1) : 'rgba(255,255,255,0.08)';
        const glow = lit ? `0 0 6px ${color}` : 'none';
        colWin.push(
          <rect key={i} x={x} y={y} width={winW} height={winH} rx={1.5} fill={color} style={{ filter: glow, opacity: lit ? 0.95 : 1 }} />,
        );
        i++;
      }
    }
    elements.push(
      <g key={ti}>
        <rect x={t.x} y={14} width={t.w} height={height - 14} fill={`url(#tw-${s})`} rx="3" />
        <rect x={t.x + 3} y={14} width={t.w - 6} height={height - 14} fill="rgba(10,14,23,0.55)" rx="2" />
        {colWin}
        <rect x={t.x + t.w * 0.3} y={6} width={t.w * 0.4} height={12} fill={c1} opacity="0.7" rx="2" />
      </g>,
    );
  });
  return elements;
}

export function BuildingArt({ seed, className, variant = 'card' }: BuildingArtProps) {
  const s = hashSeed(seed);
  const hueA = s % 360;
  const hueB = (hueA + 65) % 360;
  const c1 = `hsl(${hueA}, 90%, 60%)`;
  const c2 = `hsl(${hueB}, 90%, 55%)`;

  if (variant === 'skyline') {
    const H = 320;
    const towers: Tower[] = [
      { x: 10, w: 110, floors: 9, cols: 6, offset: 2 },
      { x: 140, w: 150, floors: 11, cols: 8, offset: 1 },
      { x: 310, w: 100, floors: 6, cols: 5, offset: 3 },
      { x: 430, w: 180, floors: 13, cols: 9, offset: 0 },
      { x: 630, w: 120, floors: 8, cols: 6, offset: 2 },
      { x: 770, w: 180, floors: 10, cols: 7, offset: 1 },
    ];
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < 60; i++) {
      const sx = (s * 97 + i * 733) % 960;
      const sy = (s * 53 + i * 317) % 130;
      const r = (i % 3) === 0 ? 1.6 : 1;
      stars.push(
        <circle
          key={`st-${i}`}
          cx={sx}
          cy={sy}
          r={r}
          fill={i % 2 === 0 ? c1 : '#fff'}
          opacity={(i % 5 + 2) / 8}
        />,
      );
    }

    return (
      <svg viewBox="0 0 960 320" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
        <defs>
          <linearGradient id={`skys-${s}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(10,14,23,0)" />
            <stop offset="60%" stopColor={c1} stopOpacity="0.14" />
            <stop offset="100%" stopColor="rgba(10,14,23,1)" />
          </linearGradient>
          <linearGradient id={`tw-${s}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} stopOpacity="0.85" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect width="960" height="320" fill={`url(#skys-${s})`} />
        {stars}
        <circle cx="880" cy="40" r="30" fill={c1} opacity="0.25" style={{ filter: 'blur(2px)' }} />
        <circle cx="880" cy="40" r="12" fill={c1} opacity="0.6" />
        {renderTowers(s, c1, c2, towers, H, 18)}
      </svg>
    );
  }

  const towers: Tower[] = [
    { x: 34, w: 128, floors: 8, cols: 6, offset: 2 },
    { x: 202, w: 150, floors: 10, cols: 7, offset: 1 },
    { x: 32, w: 96, floors: 5, cols: 4, offset: 3 },
  ];

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
      <circle cx="308" cy="34" r="16" fill={c1} opacity="0.5" style={{ filter: 'blur(1px)' }} />

      {renderTowers(s, c1, c2, towers, 220, 18)}
    </svg>
  );
}
