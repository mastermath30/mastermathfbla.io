"use client";
import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  duration = 1200,
  format,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let start = 0;
    let startTime: number | null = null;
    const end = value;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      setDisplay(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(step);
      } else {
        setDisplay(end);
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <span>{format ? format(display) : display}</span>;
}
