"use client";

import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    // Check user setting
    const checkSettings = () => {
      const hasReduceMotionClass = document.documentElement.classList.contains("reduce-motion");
      const prefersReduced = mediaQuery.matches;
      setReducedMotion(hasReduceMotionClass || prefersReduced);
    };

    checkSettings();

    // Listen for changes to the class
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkSettings();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // Listen for system preference changes
    const handleChange = () => checkSettings();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return reducedMotion;
}
