"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface TypingTextProps {
  text: string;
  className?: string;
  speedMs?: number;
  delayMs?: number;
  showCursor?: boolean;
  cursorChar?: string;
}

export function TypingText({
  text,
  className = "",
  speedMs = 72,
  delayMs = 0,
  showCursor = true,
  cursorChar = "|",
}: TypingTextProps) {
  const reducedMotion = useReducedMotion();
  const [visibleChars, setVisibleChars] = useState(reducedMotion ? text.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleChars(text.length);
      return;
    }

    setVisibleChars(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setVisibleChars((prev) => {
          if (prev >= text.length) {
            if (intervalId) clearInterval(intervalId);
            return text.length;
          }
          return prev + 1;
        });
      }, speedMs);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speedMs, delayMs, reducedMotion]);

  const isDone = visibleChars >= text.length;

  return (
    <span className={className}>
      {text.slice(0, visibleChars)}
      {showCursor && !isDone && <span className="ml-0.5 animate-pulse">{cursorChar}</span>}
    </span>
  );
}
