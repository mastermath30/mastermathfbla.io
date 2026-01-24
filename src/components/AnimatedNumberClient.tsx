"use client";
import { useEffect, useRef, useState } from "react";

function formatStat(label: string, value: number) {
  if (label === "Students Helped") {
    return value >= 1000 ? `${Math.round(value/1000)}K+` : `${value}`;
  }
  if (label === "Peer Tutors") {
    return `${value}+`;
  }
  if (label === "Success Rate") {
    return `${value}%`;
  }
  if (label === "Support") {
    return `${value}/7`;
  }
  return value.toString();
}

export function AnimatedNumberClient({ value, duration = 1200, label }: { value: number; duration?: number; label: string }) {
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

  return <span>{formatStat(label, display)}</span>;
}
