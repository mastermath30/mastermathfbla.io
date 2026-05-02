"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { personImages } from "@/data/people";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  image: string;
}

// Extended testimonials data for the scrolling columns
const leftColumnTestimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "AP Calculus Student",
    text: "MathMaster helped me go from a C to an A in AP Calc! The tutors explain concepts in ways that actually make sense.",
    image: personImages.sarahJohnson,
  },
  {
    name: "Marcus Johnson",
    role: "High School Junior",
    text: "I was struggling with algebra for years. After just 2 months with MathMaster, I'm now helping my classmates!",
    image: personImages.michaelChen,
  },
  {
    name: "Emily Rodriguez",
    role: "High School Senior",
    text: "The SAT math prep resources are incredible. I improved my score by 150 points and got into my dream school!",
    image: personImages.emmaRodriguez,
  },
  {
    name: "Alex Turner",
    role: "Calculus Student",
    text: "MathMaster helped me understand complex concepts I struggled with for years. Now I tutor other students!",
    image: personImages.alexThompson,
  },
  {
    name: "Priya Sharma",
    role: "Pre-Med Student",
    text: "The statistics course was exactly what I needed for my research methods class. Highly recommend!",
    image: personImages.priyaPatel,
  },
];

const middleColumnTestimonials: Testimonial[] = [
  {
    name: "James Wilson",
    role: "College Freshman",
    text: "The transition from high school to college math was seamless thanks to MathMaster's preparation courses.",
    image: personImages.jamesWilson,
  },
  {
    name: "David Park",
    role: "Engineering Student",
    text: "Linear algebra and differential equations finally clicked! The visual explanations are game-changing.",
    image: personImages.robertFoster,
  },
  {
    name: "Aisha Patel",
    role: "Math Competition Winner",
    text: "I won 2nd place in the state math competition after practicing with MathMaster's advanced problems.",
    image: personImages.jessicaWu,
  },
  {
    name: "Kevin O'Brien",
    role: "Math Tutor",
    text: "As a tutor, I recommend MathMaster to all my students. It reinforces what we cover in sessions perfectly.",
    image: personImages.davidKim,
  },
  {
    name: "Jennifer Liu",
    role: "Graduate Student",
    text: "The advanced calculus materials helped me prepare for my qualifying exams. Passed on my first try!",
    image: personImages.lisaZhang,
  },
  {
    name: "Tom Bradley",
    role: "Physics Major",
    text: "The integration between math concepts and real-world physics applications is brilliant.",
    image: personImages.jamesWilson,
  },
];

const rightColumnTestimonials: Testimonial[] = [
  {
    name: "Rachel Kim",
    role: "Geometry Student",
    text: "Proofs used to terrify me. Now I actually enjoy solving them! The step-by-step approach is perfect.",
    image: personImages.rachelGreen,
  },
  {
    name: "Lisa Thompson",
    role: "Parent",
    text: "My daughter's confidence in math has skyrocketed. Worth every penny for the peace of mind.",
    image: personImages.mariaSantos,
  },
  {
    name: "Michael Brown",
    role: "ACT Prep Student",
    text: "Raised my ACT math score from 24 to 33! The practice tests mirror the real thing perfectly.",
    image: personImages.davidKim,
  },
  {
    name: "Sophie Anderson",
    role: "Algebra Student",
    text: "I went from failing to getting A's in just one semester. The step-by-step explanations are incredible.",
    image: personImages.emmaRodriguez,
  },
  {
    name: "Daniel Martinez",
    role: "Computer Science Major",
    text: "Discrete math finally makes sense! The visualizations and practice problems are top-notch.",
    image: personImages.michaelChen,
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="testimonial-card rounded-2xl p-5 mb-4 transition-all duration-300 hover:-translate-y-1 border bg-white border-slate-200 shadow-lg dark:bg-slate-950/80 dark:border-slate-700/50 dark:shadow-[0_0_20px_rgba(var(--theme-primary-rgb),0.2)] dark:hover:shadow-[0_0_35px_rgba(var(--theme-primary-rgb),0.35)]">
      <p className="text-sm leading-relaxed mb-4 font-medium text-slate-700 dark:text-slate-200">
        &quot;{testimonial.text}&quot;
      </p>
      <div className="flex items-center gap-3">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover object-[center_20%] ring-2 ring-slate-200 dark:ring-slate-700"
        />
        <div>
          <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{testimonial.name}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

function ScrollingColumn({
  testimonials,
  speed = 1,
  direction = "up",
}: {
  testimonials: Testimonial[];
  speed?: number;
  direction?: "up" | "down";
}) {
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    // Duplicate content for seamless loop
    const scrollContent = column.querySelector(".scroll-content");
    if (!scrollContent) return;

    // Calculate animation duration based on speed
    const duration = 40 / speed;
    
    // Set CSS animation
    (scrollContent as HTMLElement).style.animation = `scroll-${direction} ${duration}s linear infinite`;

    // Pause on hover
    const handleMouseEnter = () => {
      (scrollContent as HTMLElement).style.animationPlayState = "paused";
    };
    const handleMouseLeave = () => {
      (scrollContent as HTMLElement).style.animationPlayState = "running";
    };

    column.addEventListener("mouseenter", handleMouseEnter);
    column.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      column.removeEventListener("mouseenter", handleMouseEnter);
      column.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [speed, direction]);

  // Double the testimonials for seamless looping
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <div ref={columnRef} className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
      <div className="scroll-content">
        {doubledTestimonials.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsScroll() {
  return (
    <div className="relative">
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Left column - faster */}
        <div className="hidden md:block">
          <ScrollingColumn testimonials={leftColumnTestimonials} speed={1.3} direction="up" />
        </div>
        
        {/* Middle column - slower */}
        <div>
          <ScrollingColumn testimonials={middleColumnTestimonials} speed={0.8} direction="up" />
        </div>
        
        {/* Right column - faster */}
        <div className="hidden md:block">
          <ScrollingColumn testimonials={rightColumnTestimonials} speed={1.2} direction="up" />
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scroll-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        /* Theme-colored left border accent */
        .testimonial-card {
          border-left: 3px solid var(--theme-primary, #7c3aed);
        }

        .dark .testimonial-card {
          background: linear-gradient(
            135deg,
            rgba(30, 41, 59, 0.95) 0%,
            rgba(15, 23, 42, 0.9) 100%
          );
          border-color: rgba(71, 85, 105, 0.3);
        }
      `}</style>
    </div>
  );
}
