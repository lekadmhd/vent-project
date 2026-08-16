'use client';

import { useEffect, useState } from 'react';

interface RotatingWordsProps {
  words: string[];
  className?: string;
}

export function RotatingWords({ words, className }: RotatingWordsProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <span className={`word-rotate ${className ?? ''}`} key={idx}>
      {words[idx]}
    </span>
  );
}
