"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface AuroraVolumeProps {
  className?: string;
}

const bands = [
  { size: "h-[35rem] w-[70rem]", top: "-14rem", left: "-24rem", delay: 0, duration: 28 },
  { size: "h-[28rem] w-[56rem]", top: "15%", left: "10%", delay: 1.2, duration: 34 },
  { size: "h-[32rem] w-[64rem]", top: "42%", left: "30%", delay: 2.5, duration: 40 },
  { size: "h-[24rem] w-[46rem]", top: "8%", left: "58%", delay: 1.8, duration: 30 },
];

export function AuroraVolume({ className = "" }: AuroraVolumeProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
        {bands.map((band, index) => (
          <div
            key={index}
            className={`absolute ${band.size} rounded-full blur-3xl opacity-[0.13] dark:opacity-[0.16]`}
            style={{
              top: band.top,
              left: band.left,
              background:
                index % 2 === 0
                  ? "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 52%, transparent), transparent 70%)"
                  : "linear-gradient(220deg, color-mix(in srgb, var(--theme-primary-light) 48%, transparent), transparent 68%)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {bands.map((band, index) => (
        <motion.div
          key={index}
          className={`absolute ${band.size} rounded-full blur-3xl`}
          style={{
            top: band.top,
            left: band.left,
            background:
              index % 2 === 0
                ? "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 58%, transparent), transparent 70%)"
                : "linear-gradient(220deg, color-mix(in srgb, var(--theme-primary-light) 54%, transparent), transparent 68%)",
          }}
          initial={{ opacity: 0.08, rotate: index % 2 === 0 ? -8 : 8, scale: 0.98 }}
          animate={{
            opacity: [0.08, 0.18, 0.11, 0.16, 0.08],
            x: [0, 18, -14, 10, 0],
            y: [0, -14, 12, -10, 0],
            rotate: index % 2 === 0 ? [-8, -2, -10, -4, -8] : [8, 2, 10, 4, 8],
            scale: [0.98, 1.03, 1, 1.04, 0.98],
          }}
          transition={{
            duration: band.duration,
            delay: band.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
