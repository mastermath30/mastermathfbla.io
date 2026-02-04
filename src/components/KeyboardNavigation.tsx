"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardNavigation() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger with Alt key combinations
      if (!e.altKey) return;

      // Prevent default for our shortcuts
      const shortcuts: Record<string, string> = {
        h: "/",           // Home
        d: "/dashboard",  // Dashboard
        s: "/schedule",   // Schedule
        r: "/resources",  // Resources
        c: "/community",  // Community
        p: "/support",    // suPport
        t: "/tutors",     // Tutors
        l: "/auth",       // Login/Auth
      };

      const key = e.key.toLowerCase();
      if (shortcuts[key]) {
        e.preventDefault();
        router.push(shortcuts[key]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
