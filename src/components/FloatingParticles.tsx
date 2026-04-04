"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const mathSymbols = [
  "∫", "∑", "π", "∞", "√", "±", "÷", "×",
  "α", "β", "θ", "Δ", "∂", "∇", "∈", "∀",
  "≈", "≠", "≤", "≥", "⊂", "∪", "∩", "⊕",
  "+", "−", "=", "%", "∠", "⊥", "∥", "≡",
];

export function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    // Check for our custom reduce-motion class
    const checkReduceMotion = () => {
      setIsReducedMotion(
        mediaQuery.matches || document.documentElement.classList.contains("reduce-motion")
      );
    };

    checkReduceMotion();
    const observer = new MutationObserver(checkReduceMotion);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      setParticles([]);
      return;
    }

    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        symbol: mathSymbols[Math.floor(Math.random() * mathSymbols.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 12 + Math.random() * 16,
        duration: 40 + Math.random() * 40,
        delay: Math.random() * 10,
      });
    }
    setParticles(newParticles);
  }, [isReducedMotion]);

  if (isReducedMotion || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden opacity-[0.035] dark:opacity-[0.03]">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute font-mono select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: particle.size,
            color: "var(--theme-primary)",
          }}
          animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 14, 0, -14, 0],
            rotate: [0, 8, 0, -8, 0],
            opacity: [0.16, 0.3, 0.16],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {particle.symbol}
        </motion.div>
      ))}
    </div>
  );
}
