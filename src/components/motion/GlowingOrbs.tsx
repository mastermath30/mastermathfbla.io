"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface GlowingOrbsProps {
  variant?: "default" | "hero" | "section" | "subtle";
}

export function GlowingOrbs({ variant = "default" }: GlowingOrbsProps) {
  const reducedMotion = useReducedMotion();

  const configs = {
    default: [
      { className: "top-20 left-10 w-72 h-72", delay: 0 },
      { className: "bottom-20 right-10 w-96 h-96", delay: 2 },
      { className: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]", delay: 4 },
    ],
    hero: [
      { className: "top-20 left-10 w-72 h-72", delay: 0 },
      { className: "bottom-20 right-10 w-96 h-96", delay: 1 },
      { className: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]", delay: 2 },
    ],
    section: [
      { className: "top-20 left-10 w-64 h-64", delay: 0 },
      { className: "bottom-20 right-10 w-80 h-80", delay: 1.5 },
    ],
    subtle: [
      { className: "top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96", delay: 0 },
      { className: "top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96", delay: 1 },
    ],
  };

  const orbs = configs[variant];

  // When reduced motion is enabled, render static orbs with no animation
  if (reducedMotion) {
    return (
      <>
        {orbs.map((orb, index) => (
          <div
            key={index}
            className={`absolute ${orb.className} rounded-full blur-3xl pointer-events-none opacity-10`}
            style={{
              background: index % 2 === 0 ? 'var(--theme-primary)' : 'var(--theme-primary-light)',
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.className} rounded-full blur-3xl pointer-events-none`}
          style={{
            background: index % 2 === 0 ? 'var(--theme-primary)' : 'var(--theme-primary-light)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.08, 0.15, 0.08],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}
