"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Smooth section reveal with scale
export function SectionReveal({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 60, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.7, 
        delay,
        ease: [0.25, 0.4, 0.25, 1] 
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Parallax effect for backgrounds
export function ParallaxSection({ 
  children, 
  className = "",
  speed = 0.3 
}: { 
  children: ReactNode; 
  className?: string;
  speed?: number;
}) {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: 0 }}
      viewport={{ once: false }}
      style={{ willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered card reveal
export function CardReveal({ 
  children, 
  index = 0,
  className = "" 
}: { 
  children: ReactNode; 
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.25 } 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hero text animation
export function HeroText({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating animation for decorative elements
export function FloatingElement({ 
  children, 
  className = "",
  duration = 4,
  distance = 15 
}: { 
  children: ReactNode; 
  className?: string;
  duration?: number;
  distance?: number;
}) {
  return (
    <motion.div
      animate={{ 
        y: [-distance, distance, -distance],
      }}
      transition={{ 
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Smooth counter for stats
export function AnimatedCounter({ 
  value, 
  className = "",
  suffix = "" 
}: { 
  value: number; 
  className?: string;
  suffix?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value}{suffix}
      </motion.span>
    </motion.span>
  );
}

// Gradient border animation
export function GradientBorder({ 
  children, 
  className = "" 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      className={`relative p-[2px] rounded-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500"
        animate={{ 
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "linear" 
        }}
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl">
        {children}
      </div>
    </motion.div>
  );
}
