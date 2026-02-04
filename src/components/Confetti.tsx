"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

const colors = [
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#f97316", // orange
  "#ec4899", // pink
  "#06b6d4", // cyan
];

// Global event system for triggering confetti
export const triggerConfetti = () => {
  window.dispatchEvent(new CustomEvent("trigger-confetti"));
};

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleTrigger = () => {
      setIsActive(true);
      
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 100; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.5,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        });
      }
      setPieces(newPieces);

      // Clean up after animation
      setTimeout(() => {
        setIsActive(false);
        setPieces([]);
      }, 4000);
    };

    window.addEventListener("trigger-confetti", handleTrigger);
    return () => window.removeEventListener("trigger-confetti", handleTrigger);
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: 0,
                scale: piece.scale,
              }}
              animate={{
                y: "110vh",
                rotate: piece.rotation + 720,
                x: `${piece.x + (Math.random() - 0.5) * 20}vw`,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: piece.delay,
                ease: "linear",
              }}
              style={{ backgroundColor: piece.color }}
              className="absolute w-3 h-3 rounded-sm"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Star burst effect for achievements
export function StarBurst({ children, onComplete }: { children: React.ReactNode; onComplete?: () => void }) {
  const [stars, setStars] = useState<{ id: number; angle: number; delay: number }[]>([]);
  const [show, setShow] = useState(false);

  const trigger = () => {
    setShow(true);
    const newStars = [];
    for (let i = 0; i < 12; i++) {
      newStars.push({
        id: i,
        angle: (i * 30) * (Math.PI / 180),
        delay: i * 0.05,
      });
    }
    setStars(newStars);

    setTimeout(() => {
      setShow(false);
      setStars([]);
      onComplete?.();
    }, 1000);
  };

  return (
    <div className="relative inline-block" onClick={trigger}>
      {children}
      <AnimatePresence>
        {show && stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos(star.angle) * 60,
              y: Math.sin(star.angle) * 60,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.6, delay: star.delay }}
            className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full pointer-events-none"
            style={{ marginLeft: -4, marginTop: -4 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
