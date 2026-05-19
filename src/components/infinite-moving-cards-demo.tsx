"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function InfiniteMovingCardsDemo() {
  return (
    <div className="relative flex min-h-[30rem] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-0 py-12 antialiased shadow-sm md:py-16 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-20 bg-gradient-to-r from-white to-transparent md:w-32 dark:from-slate-900" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-20 bg-gradient-to-l from-white to-transparent md:w-32 dark:from-slate-900" />
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "The Learn path finally made algebra feel organized. I could see what to review, take a quick quiz, and ask for help without losing my place.",
    name: "Maya R.",
    title: "Algebra student",
  },
  {
    quote:
      "I used to jump between random videos before tests. MathMaster gave me a clear next step and the practice feedback told me exactly what I was missing.",
    name: "Jordan K.",
    title: "Pre-Calculus student",
  },
  {
    quote:
      "The AI tutor helped me understand the setup before I met with a peer tutor. That made the live session way more useful.",
    name: "Ari S.",
    title: "Geometry student",
  },
  {
    quote:
      "The quizzes do not just mark answers wrong. They point me back to the skill I need, which makes studying feel less frustrating.",
    name: "Priya M.",
    title: "Statistics student",
  },
  {
    quote:
      "Having notes, formulas, the whiteboard, and tutoring in one place helped me stay focused instead of opening five different tabs.",
    name: "Leo C.",
    title: "Calculus student",
  },
];
